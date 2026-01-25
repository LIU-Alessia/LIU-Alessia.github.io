---
layout:     post
title:      tensorflow dataloader
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
![]({{site.baseurl}}/img/logo.png)

<img width="704" height="458" alt="image" src="https://github.com/user-attachments/assets/148c3dfc-2a92-4144-b0c1-f6bcb091a5dd" />

#### 发布信息

2019年1月16日。V0.6版。

此版本为三叶语第一次公开。

发布媒体：

* 百度贴吧：[三叶草国际语](https://tieba.baidu.com/p/6009002082)
* 知乎专栏：[三叶草国际语概述（V0.6）](https://zhuanlan.zhihu.com/p/46039432)

#### 三叶语特点

融合中西语言的人造国际语。

* 单词中含有中文韵母成分（词韵），便于中国人学习和记忆。

* 语音倾向于英文和中文的结合，易于发声。

* 语法简洁，核心部分即谓词变化为固定次序，“将不已在被动”六个字即可概况。

#### 完成进度

* 语音基本完成，完成度99%。

* 语法主体完成，完成度80%。

* 词汇中语辅词基本完成，其它基本词部分完成，完成度<50%。
