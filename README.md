# Alessia's Blog

使用 Hexo + Fluid 主题搭建的个人博客。

## 本地开发

```bash
# 进入项目目录
cd D:\Data\blog

# 启动本地服务器
hexo server

# 访问 http://localhost:4000
```

## 常用命令

```bash
# 创建新文章
hexo new "文章标题"

# 清除缓存
hexo clean

# 生成静态文件
hexo generate

# 部署到 GitHub Pages
hexo deploy

# 组合命令：清理并部署
hexo clean && hexo g -d
```

## 项目结构

```
D:\Data\blog\
├── _config.yml              # Hexo 主配置
├── _config.fluid.yml        # Fluid 主题配置
├── package.json             # npm 依赖
├── source/
│   ├── _posts/              # 27 篇博客文章
│   ├── about/               # 关于页面
│   ├── images/              # 图片资源
│   │   ├── avatar.jpg       # 头像
│   │   ├── background.jpg   # 背景图
│   │   └── posts/           # 文章图片
│   └── files/               # PDF 文件
└── public/                  # 生成的静态文件（不提交）
```

## 待完成配置

### 1. Gitalk 评论系统

需要在 GitHub 上创建 OAuth 应用：

1. 访问 https://github.com/settings/developers
2. 点击 "New OAuth App"
3. 填写信息：
   - Application name: Alessia's Blog Gitalk
   - Homepage URL: https://liu-alessia.github.io
   - Application description: Comment system for Alessia's Blog
   - Authorization callback URL: https://liu-alessia.github.io
4. 获取 Client ID 和 Client Secret
5. 编辑 `_config.fluid.yml`，找到 `post.comments` 和 `gitalk` 部分：

```yaml
post:
  comments:
    enable: true
    type: gitalk

gitalk:
  clientID: [你的 Client ID]
  clientSecret: [你的 Client Secret]
  repo: LIU-Alessia.github.io
  owner: LIU-Alessia
  admin: ['LIU-Alessia']
  language: zh-CN
  labels: ['Gitalk']
  perPage: 10
  pagerDirection: last
  distractionFreeMode: false
  createIssueManually: true
```

### 2. 部署配置

#### 方案 A：GitHub Actions 自动部署

1. 在 GitHub 仓库中创建 `source` 分支
2. 将本地代码推送到 `source` 分支
3. GitHub Actions 会自动将 `public/` 部署到 `main` 分支

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M source
git remote add origin https://github.com/LIU-Alessia/LIU-Alessia.github.io.git
git push -u origin source
```

#### 方案 B：使用 hexo-deployer-git

确保 `_config.yml` 中已配置：

```yaml
deploy:
  type: git
  repo: https://github.com/LIU-Alessia/LIU-Alessia.github.io.git
  branch: main
```

然后运行：

```bash
hexo clean && hexo g -d
```

## 主题特性

- ✅ 深蓝灰色主题 (#2f4154)
- ✅ 打字效果
- ✅ 阅读进度条
- ✅ 代码高亮 + 复制按钮
- ✅ 图片懒加载 + 放大
- ✅ 右侧目录导航
- ✅ 本地搜索
- ✅ 暗色/亮色模式切换
- ✅ 响应式设计

## 参考资源

- [Hexo 官方文档](https://hexo.io/docs/)
- [Fluid 主题文档](https://hexo.fluid-dev.com/docs/)
- [参考博客风格](https://lynx-li.github.io/)