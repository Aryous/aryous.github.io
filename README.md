# aryous.github.io

Lucas（王立奇）的个人网站：做过的小东西，和想明白的事。中英双语，杂志「封面故事」风格。

线上地址：<https://aryous.github.io>

## 写一篇文章

1. 新建文件夹 `src/content/writing/<名字>/`，名字用英文小写加连字符，比如 `hello-world`。它就是网址：`/writing/hello-world/`。
2. 在里面新建 `zh.md`：

   ```markdown
   ---
   title: 标题
   date: 2026-10-29
   description: 一句话摘要（可选）
   ---

   正文……
   ```

3. `git commit` 然后 `git push`。GitHub Actions 会自动检查、构建、发布，一两分钟后上线。

想先看效果：`npm run dev`，打开 <http://localhost:4321>。写 `draft: true` 的草稿只在本地能看到。

### 文章字段

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `title` | 是 | 标题 |
| `date` | 原文必填 | 发布日期；译文**不要**写 |
| `description` | 否 | 一句话摘要，用于列表和 RSS |
| `tags` | 否 | 标签，目前只展示 |
| `draft` | 否 | `true` 时只在本地预览 |
| `cover` | 否 | 题图，比如 `./photo.jpg`（和 md 放在同一个文件夹）；有题图时页头是电影感大图 |
| `coverAlt` | 否 | 题图的文字描述 |

### 英文版

在同一个文件夹里加 `en.md`，只写 `title` 和 `description`，其余字段自动沿用中文原文。没有英文版时，英文网址会显示中文原文，并提示 "This page is only available in Chinese."。反过来，原文也可以是英文：只放 `en.md` 并在里面写 `date`。

## 加一个项目

`src/content/projects/<名字>/zh.md`（以及可选的 `en.md`）：

```yaml
title: 项目名
summary: 一句话说清它是什么        # 必填
date: 2026-10-01
status: active                    # active | done | archived
links: { repo: https://github.com/..., demo: https://... }
cover: ./cover.png                # 截图：目录悬停、项目页题图、封面背景
object: ./object.png              # 透明底物件图：上封面必须有
featured: true                    # 进首页目录
onCover: true                     # 做封面主角（取日期最新的那个）
order: 1                          # 精选排序
```

## 封面怎么更新

- 主角：`onCover: true` 的项目里日期最新的一个。
- 导读三条：精选项目和文章混排，按日期取最新三条。
- 期号：2026 年第 4 季度是 Issue 01，之后每季度加一；每月 1 日自动重建一次，不推送也会更新。
- 注意：GitHub 会在公开仓库 60 天没有提交后自动停用定时任务。如果很久没更新，期号会停住；到 Actions 页面重新启用 "Deploy to GitHub Pages"，或者随便推送一次即可。

## 命令

| 命令 | 作用 |
| --- | --- |
| `npm run dev` | 本地预览 |
| `npm test` | 单元测试（内容规则、封面、期号） |
| `npm run build` | 测试 + 类型检查 + 构建 + 产物检查（CI 跑的就是它） |
| `npm run preview` | 预览构建产物 |
| `npm run shots` | 截图矩阵：所有页面 × 浅/深色 × 桌面/手机（先在另一个终端运行 `npm run preview`，默认 <http://localhost:4321>） |

构建会在这些情况下失败、不发布：同一篇的两个语言版本都写了 `date` 或都没写；文件名不是 `zh.md`/`en.md`；封面项目缺 `object`；站内链接或图片失效；引用了 Google Fonts。

## 技术

Astro 7 · 内容集合 · `@fontsource` 自托管字体（Noto Serif SC 按字符切片，Instrument Serif、Source Serif 4、Inter、JetBrains Mono）· GitHub Pages。设计文档与草图在 `docs/`。
