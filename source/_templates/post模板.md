<%*
const filename = tp.file.title;
const match = filename.match(/^(\d{4}-\d{2}-\d{2})-(.+)$/);

const date = match ? match[1] : tp.date.now("YYYY-MM-DD");
const title = match ? match[2] : filename;
const folders = tp.file.folder(true).split("/");
const category = folders[folders.length - 1];
-%>
---
title: "<% title %>"
subtitle: "<% category %>"
date: <%- date %>T00:00:00.000Z
author: Alessia
tags:
  - 随笔杂谈
categories:
  - <%- category %>
cover: img/post-bg-recitewords.jpg
---

# <% title %>