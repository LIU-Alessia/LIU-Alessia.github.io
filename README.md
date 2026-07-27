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

## 文章组织

`source/_posts` 现在按文章 front matter 中的一级分类分目录存放，例如：

```text
source/_posts/
├── LLM知识体系搭建/
├── 力扣刷题日记/
├── 技术实践/
├── 数据分析/
├── 计算机基础/
├── 计算神经科学/
├── 金融AI/
├── 随笔杂谈/
└── 面试手撕准备/
```

Hexo 会递归读取 `source/_posts` 下的文章，分类页、标签页和文章永久链接仍然由 front matter 与站点配置决定，不依赖 Markdown 文件所在目录。

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

### 2. 访客次数与地点统计

站点已启用两类访客统计：

- 不蒜子：在页脚显示站点 PV/UV，并在文章页显示单篇浏览量，无需账号。
- Google Analytics 4：在后台记录访问量以及访客的大致国家、地区和城市；不采集 GPS 精确位置。未配置测量 ID 时不会加载 Google Analytics。

启用地点统计：

1. 在 [Google Analytics](https://analytics.google.com/) 创建 GA4 媒体资源和 Web 数据流，网站地址填写 `https://liu-alessia.github.io`。
2. 复制以 `G-` 开头的 Measurement ID。
3. 打开 GitHub 仓库的 `Settings → Secrets and variables → Actions → Variables`。
4. 新建仓库变量：

```text
Name:  GA_MEASUREMENT_ID
Value: G-XXXXXXXXXX
```

5. 推送到 `source` 分支，GitHub Actions 会在构建时自动启用 GA4。部署后可在 GA4 的“实时”报告中验证访问记录。

本地验证时，可在 PowerShell 中临时设置测量 ID：

```powershell
$env:GA_MEASUREMENT_ID = 'G-XXXXXXXXXX'
npm run build
```

访客统计遵循浏览器的 “Do Not Track” 设置。站点的 `/privacy/` 页面说明了收集范围。

- Google Analytics 的 Measurement ID 不是密钥，但使用仓库变量便于更换和区分环境。
- GA4 的地点是根据网络地址推断的近似位置，城市级结果可能存在误差。

### 3. 部署配置

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