---
layout:     post
title:      dataloader
subtitle:   
date:       2026-01-24
author:     Henri Jambo
header-img: img/post-bg-cook.jpg
catalog: true
tags:
    - tensorflow
---

读取数量：reader.read_up_to(..., num_records=64) 表示一次最多读取 $N$ 条数据（$N \le 64$）。
序列长度：seq_len = 100。

以下是 tf.parse_example 解析后，各变量的具体 Tensor 形状：
