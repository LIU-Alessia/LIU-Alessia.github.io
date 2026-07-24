---
title: zotero+obsidian文献工作流
subtitle: 搭建过程
date: 2026-07-21
author: Alessia
tags:
  - 技术随笔
categories:
  - 技术实践
cover: img/post-bg-coffee.jpg
---
参考[使用 ZotLit 插件和模板连接 Zotero 和 Obsidian](https://effortlessacademic.com/connecting-zotero-and-obsidian-with-the-zotlit-plugin-templates/)

## 系统架构
![[系统架构.png]]
已完成：
* AI读取PDF全文，一句指令生成结构化文献笔记并自动归类
* 文献量增长后仍能快速检索——自动索引按标签多维度筛选
* 写论文草稿时引用自己读过的文献，引用格式可直接编译为word/pdf
* 文献之间自动建立关联网络，在obsidian图谱中可视化研究脉络
* 设计实验时结合已有文献给出具体参数建议

待完成：
* 文献收录在zotero，复制想要AI阅读的文献PDF到obsidian pdf目录下
* AI根据关键字调研并获取文献
* 
## obsidian、zotero协同
1. 在Zotero导入文献
2. PDF进入知识库
3. 用obsidian生成笔记骨架
4. codex填充笔记内容
5. 在obsidian里验证

按类别访问

文献阅读标注在zotero，笔记/AI解析在obsidian。那么PDF不能移动到zotero

zotero字段名用的`{{citekey}}-{{shortTitle}}`
