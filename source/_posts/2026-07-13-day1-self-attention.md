---
title: self-attention
subtitle: ""
date: 2026-07-13
author: Alessia
tags:
  - 学习资料
categories:
  - LLM知识体系搭建
cover: img/post-bg-attention.png
---


此系列博客记录[居丽叶的大模型自学计划表-算法岗速成版](https://my.feishu.cn/docx/FAL3d7zlTo6fcCxQzXbcbY2Xnff)的学习过程，主要参考资料[居里叶LLM知识体系搭建](https://my.feishu.cn/docx/AN61dRfiWoRUiRxhc6ucbmJwnGr)。

## 原理
## 改进
## 代码
MHA/MQA代码手撕

```python
import torch.nn as nn
import numpy as np
import torch
import math

# ====== 超参数（贯穿全文的形状参考）======
# batch=10, num_head=8, n_q=2, n_k=n_v=4
# dimension_q=dimension_k=128, dimension_v=64
# d_k=16, d_v=16, d_o=8

# ==================== 多头注意力 MHA ====================
# MHA：每个 head 有独立的 K、V 投影矩阵
class MHA(nn.Module):
    def __init__(self, num_head, dimension_k, dimension_v, d_k, d_v, d_o):
        # d_k：每个 head 的 key/query 维度；d_k * num_head = 原始 embedding 长度
        super().__init__()
        self.num_head = num_head
        self.d_k = d_k
        self.d_v = d_v
        self.d_o = d_o
        # fc_q/fc_k：把输入 embedding 投影到 num_head 个 head 的拼接空间
        #   输入 dimension_k=128 → 输出 num_head*d_k = 8*16 = 128
        self.fc_q = nn.Linear(dimension_k, num_head * d_k)
        self.fc_k = nn.Linear(dimension_k, num_head * d_k)
        # fc_v：dimension_v=64 → num_head*d_v = 8*16 = 128
        self.fc_v = nn.Linear(dimension_v, num_head * d_v)
        # fc_o：拼接后的多头输出 → 最终输出维度 d_o=8
        self.fc_o = nn.Linear(num_head * d_v, d_o)
        self.softmax = nn.Softmax(dim=2)

    def forward(self, q, k, v, mask):
        # 输入形状：
        #   q: (batch, n_q, dimension_q) = (10, 2, 128)
        #   k: (batch, n_k, dimension_k) = (10, 4, 128)
        #   v: (batch, n_v, dimension_v) = (10, 4, 64)
        batch, n_q, dimension_q = q.size()
        batch, n_k, dimension_k = k.size()
        batch, n_v, dimension_v = v.size()

        # ---- 线性投影 ----
        q = self.fc_q(q)  # (10, 2, 128) → (10, 2, 128)  即 (batch, n_q, num_head*d_k)
        k = self.fc_k(k)  # (10, 4, 128) → (10, 4, 128)
        v = self.fc_v(v)  # (10, 4,  64) → (10, 4, 128)  即 (batch, n_v, num_head*d_v)

        # ---- 拆分多头并重排维度 ----
        # 目标：把 num_head 维提到最前，batch 维合并进去，方便批量做矩阵乘法
        # permute：交换矩阵维度位置
        # q: (10,2,128) → view(10,2,8,16) → permute(2,0,1,3)=(8,10,2,16) → view(-1,2,16) = (80,2,16)
        q = q.view(batch, n_q, self.num_head, self.d_k).permute(2, 0, 1, 3).contiguous().view(-1, n_q, self.d_k)
        # k: (10,4,128) → (8,10,4,16) → (80,4,16)
        k = k.view(batch, n_k, self.num_head, self.d_k).permute(2, 0, 1, 3).contiguous().view(-1, n_k, self.d_k)
        # v: (10,4,128) → (8,10,4,16) → (80,4,16)
        v = v.view(batch, n_v, self.num_head, self.d_v).permute(2, 0, 1, 3).contiguous().view(-1, n_v, self.d_v)

        # ---- 计算注意力分数 ----
        # q: (80,2,16)  k.T: (80,16,4)  → attention: (80,2,4)
        attention = torch.matmul(q, k.transpose(-1, -2)) / math.sqrt(self.d_k)

        # mask: (10,2,4) → repeat → (80,2,4)  上三角填 -inf，防止未来位置泄露
        mask = mask.repeat(self.num_head, 1, 1)
        attention = attention + mask        # (80,2,4)
        attention = self.softmax(attention) # (80,2,4)，每行和为 1

        # ---- 加权求和 ----
        # attention: (80,2,4)  v: (80,4,16)  → output: (80,2,16)
        output = torch.matmul(attention, v)

        # ---- 合并多头，还原 batch 维度 ----
        # (80,2,16) → view(8,10,2,16) → permute(1,2,0,3)=(10,2,8,16) → view(10,2,-1)=(10,2,128)
        output = output.view(self.num_head, batch, n_q, self.d_v).permute(1, 2, 0, 3).contiguous().view(batch, n_q, -1)

        # ---- 输出投影 ----
        # (10,2,128) → fc_o → (10,2,8)  即 (batch, n_q, d_o)
        output = self.fc_o(output)
        return attention, output  # attention:(80,2,4)  output:(10,2,8)


# ==================== 多查询注意力 MQA ====================
# MQA：所有 head 共享同一组 K、V 投影矩阵，只有 Q 是多头的
# 好处：KV Cache 大幅减小，推理更快
class MQA(nn.Module):
    def __init__(self, num_head, dimension_k, dimension_v, d_k, d_v, d_o):
        super().__init__()
        self.num_head = num_head
        self.d_k = d_k
        self.d_v = d_v
        self.d_o = d_o
        # Q 仍然多头：dimension_k=128 → num_head*d_k=128
        self.fc_q = nn.Linear(dimension_k, num_head * d_k)
        # K/V 只投影到单头维度：dimension_k=128 → d_k=16；dimension_v=64 → d_v=16
        self.fc_k = nn.Linear(dimension_k, d_k)
        self.fc_v = nn.Linear(dimension_v, d_v)
        self.fc_o = nn.Linear(num_head * d_v, d_o)
        self.softmax = nn.Softmax(dim=2)

    def forward(self, q, k, v, mask):
        # 输入形状：同 MHA
        #   q: (10, 2, 128)  k: (10, 4, 128)  v: (10, 4, 64)
        batch, n_q, dimension_q = q.size()
        batch, n_k, dimension_k = k.size()
        batch, n_v, dimension_v = v.size()

        # ---- 线性投影 ----
        q = self.fc_q(q)  # (10, 2, 128) → (10, 2, 128)  多头
        k = self.fc_k(k)  # (10, 4, 128) → (10, 4,  16)  单头
        v = self.fc_v(v)  # (10, 4,  64) → (10, 4,  16)  单头

        # ---- Q 拆分多头 ----
        # (10,2,128) → view(10,2,8,16) → permute(2,0,1,3)=(8,10,2,16) → view(-1,2,16)=(80,2,16)
        q = q.view(batch, n_q, self.num_head, self.d_k).permute(2, 0, 1, 3).contiguous().view(-1, n_q, self.d_k)

        # ---- K/V 复制 num_head 份，对齐 Q 的第0维 ----
        # k: (10,4,16) → repeat(8,1,1) → (80,4,16)
        k = k.repeat(self.num_head, 1, 1)
        # v: (10,4,16) → repeat(8,1,1) → (80,4,16)
        v = v.repeat(self.num_head, 1, 1)

        # ---- 计算注意力（与 MHA 完全相同）----
        # q:(80,2,16)  k.T:(80,16,4)  → attention:(80,2,4)
        attention = torch.matmul(q, k.transpose(-1, -2)) / math.sqrt(self.d_k)
        mask = mask.repeat(self.num_head, 1, 1)  # (10,2,4) → (80,2,4)
        attention = attention + mask
        attention = self.softmax(attention)       # (80,2,4)

        # ---- 加权求和 ----
        # (80,2,4) @ (80,4,16) → output:(80,2,16)
        output = torch.matmul(attention, v)

        # ---- 合并多头 ----
        # (80,2,16) → view(8,10,2,16) → permute(1,2,0,3)=(10,2,8,16) → view(10,2,128)
        output = output.view(self.num_head, batch, n_q, self.d_v).permute(1, 2, 0, 3).contiguous().view(batch, n_q, -1)

        # (10,2,128) → fc_o → (10,2,8)
        output = self.fc_o(output)
        return attention, output  # attention:(80,2,4)  output:(10,2,8)


# ==================== 测试 ====================
batch = 10
num_head = 8
n_q, n_k, n_v = 2, 4, 4   # sequence 长度
dimension_q, dimension_k, dimension_v = 128, 128, 64  # 输入 embedding 长度
d_k, d_v, d_o = 16, 16, 8  # 单头维度 / 输出维度

# q:(10,2,128)  k:(10,4,128)  v:(10,4,64)
q = torch.randn(batch, n_q, dimension_q)
k = torch.randn(batch, n_k, dimension_k)
v = torch.randn(batch, n_v, dimension_v)

# mask:(10,2,4)，上三角为 -inf（因果掩码）
mask = torch.full((batch, n_q, n_k), -np.inf)
mask = torch.triu(mask, diagonal=1)

mha = MHA(num_head, dimension_k, dimension_v, d_k, d_v, d_o)
attention, output = mha(q, k, v, mask)
print(attention.size(), output.size())  # torch.Size([80, 2, 4]) torch.Size([10, 2, 8])

mqa = MQA(num_head, dimension_k, dimension_v, d_k, d_v, d_o)
attention, output = mqa(q, k, v, mask)
print(attention.size(), output.size())  # torch.Size([80, 2, 4]) torch.Size([10, 2, 8])
```
可参考博客

https://hwcoder.top/Manual-Coding-1

[手写self-attention的四重境界](https://www.bilibili.com/video/BV19YbFeHETz/?spm_id_from=333.337.search-card.all.click&vd_source=1e761ed3a09f77601129e52e0099cad9)













