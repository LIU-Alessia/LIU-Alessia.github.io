---
title: self-attention
subtitle: ''
date: 2026-07-13T00:00:00.000Z
author: Alessia
tags:
  - 学习资料
categories:
  - 2026-07-13-LLM知识体系搭建
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
# 多头注意力     
class MHA(nn.Module):
    def __init__(self, num_head, dimension_k, dimension_v, d_k, d_v, d_o):
        # d_k表示head dimension，d_k * num_head 就是embedding的长度
        super().__init__()
        self.num_head = num_head
        self.d_k = d_k
        self.d_v = d_v
        self.d_o = d_o
        self.fc_q = nn.Linear(dimension_k, num_head * d_k)
        self.fc_k = nn.Linear(dimension_k, num_head * d_k)
        self.fc_v = nn.Linear(dimension_v, num_head * d_v)
        self.fc_o = nn.Linear(num_head * d_v, d_o)
        self.softmax = nn.Softmax(dim=2)
        
        
    def forward(self, q, k, v, mask):
        
        batch, n_q, dimension_q = q.size()
        batch, n_k, dimension_k = k.size()
        batch, n_v, dimension_v = v.size()
          
        q = self.fc_q(q)
        k = self.fc_k(k)
        v = self.fc_v(v)
        q = q.view(batch, n_q, self.num_head, self.d_k).permute(2, 0, 1, 3).contiguous().view(-1, n_q, self.d_k)
        k = k.view(batch, n_k, self.num_head, self.d_k).permute(2, 0, 1, 3).contiguous().view(-1, n_k, self.d_k)
        v = v.view(batch, n_v, self.num_head, self.d_v).permute(2, 0, 1, 3).contiguous().view(-1, n_v, self.d_v)
        
        attention = torch.matmul(q, k.transpose(-1, -2)) / math.sqrt(self.d_k)
        mask = mask.repeat(self.num_head, 1, 1)
        attention = attention + mask
        attention = self.softmax(attention)
        
        output = torch.matmul(attention, v)
        output = output.view(self.num_head, batch, n_q, self.d_v).permute(1, 2, 0, 3).contiguous().view(batch, n_q, -1)
        output = self.fc_o(output)
        return attention, output
        
# Multi query attention
class MQA(nn.Module):
    def __init__(self, num_head, dimension_k, dimension_v, d_k, d_v, d_o):
        super().__init__()
        self.num_head = num_head
        self.d_k = d_k
        self.d_v = d_v
        self.d_o = d_o
        self.fc_q = nn.Linear(dimension_k, num_head * d_k)
        self.fc_k = nn.Linear(dimension_k, d_k)
        self.fc_v = nn.Linear(dimension_v, d_v)
        self.fc_o = nn.Linear(num_head * d_v, d_o)
        self.softmax = nn.Softmax(dim=2)
        
        
    def forward(self, q, k, v, mask):
        
        batch, n_q, dimension_q = q.size()
        batch, n_k, dimension_k = k.size()
        batch, n_v, dimension_v = v.size()
          
        q = self.fc_q(q)
        k = self.fc_k(k)
        v = self.fc_v(v) 
        q = q.view(batch, n_q, self.num_head, self.d_k).permute(2, 0, 1, 3).contiguous().view(-1, n_q, self.d_k)       
        k = k.repeat(self.num_head, 1, 1)
        v = v.repeat(self.num_head, 1, 1)
        
        attention = torch.matmul(q, k.transpose(-1, -2)) / math.sqrt(self.d_k)
        mask = mask.repeat(self.num_head, 1, 1)
        attention = attention + mask
        attention = self.softmax(attention)
        
        output = torch.matmul(attention, v)
        output = output.view(self.num_head, batch, n_q, self.d_v).permute(1, 2, 0, 3).contiguous().view(batch, n_q, -1)
        output = self.fc_o(output)
        return attention, output

batch = 10
num_head = 8
n_q, n_k, n_v = 2, 4, 4 # sequence 长度
dimension_q, dimension_k, dimension_v = 128, 128, 64 # embedding的长度
d_k, d_v, d_o = 16, 16, 8
q = torch.randn(batch, n_q, dimension_q)
k = torch.randn(batch, n_k, dimension_k)
v = torch.randn(batch, n_v, dimension_v)
mask  = torch.full((batch, n_q, n_k), -np.inf)    
mask = torch.triu(mask,diagonal=1)
mha = MHA(num_head, dimension_k, dimension_v, d_k, d_v, d_o)
attention, output = mha(q, k, v, mask)
print(attention.size(), output.size())

mqa = MQA(num_head, dimension_k, dimension_v, d_k, d_v, d_o)
attention, output = mqa(q, k, v, mask)
print(attention.size(), output.size())

```
可参考博客

https://hwcoder.top/Manual-Coding-1

[手写self-attention的四重境界](https://www.bilibili.com/video/BV19YbFeHETz/?spm_id_from=333.337.search-card.all.click&vd_source=1e761ed3a09f77601129e52e0099cad9)













