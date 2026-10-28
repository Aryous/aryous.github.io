# 个人网站设计 · aryous.github.io

- 日期：2026-10-29
- 状态：已与 Lucas 逐段确认（brainstorming 会话）；2026-10-29 上线后按验收结果修订（见文末「修订记录」）
- 定稿草图：`docs/mockups/visual-style-v3.html`（选定第 2 版「封面故事」）、`docs/mockups/article-page.html`（A=浅色主题、B=深色主题）

## 1. 目标与定位

- **用途**：主要是 Lucas 给自己写东西的地方。放感兴趣、做过的有意思的小项目，也放想法和表达。
- **形态**：展示页 + 博客的混合体。首页同时展示精选项目和最近的文章。
- **核心约束**：写作和发布要足够省事。写给自己的博客，最大的风险是"不想写"。
- **不做（第一版）**：关于页、评论、站内搜索、访问统计、标签页、往期封面归档。

## 2. 页面与网址

中文是默认语言，网址不带前缀；英文网址加 `/en` 前缀。

| 页面 | 中文 | 英文 |
| --- | --- | --- |
| 首页（封面 + 目录） | `/` | `/en/` |
| 文章时间线 | `/writing/` | `/en/writing/` |
| 单篇文章 | `/writing/<slug>/` | `/en/writing/<slug>/` |
| 全部项目 | `/projects/` | `/en/projects/` |
| 项目短记 | `/projects/<slug>/` | `/en/projects/<slug>/` |
| 订阅源 | `/rss.xml` | `/en/rss.xml` |
| 404 | `/404.html` | 同一页，双语文案 |

规则：

- 同一篇内容中英文用同一个 slug。切换语言 = 加/去 `/en` 前缀，每页右上角都有切换按钮。
- **缺译文时**：打开另一语言的网址，显示原文，顶部提示"This post is only available in Chinese / 本文暂无中文版"。
- 文章时间线两种语言都列出全部文章，没有当前语言版本的标一个语言小标签（"中文"/"EN"）。
- 文章和想法放在同一个时间线里，不拆栏目。
- 不得占用 `/Aryous/` 路径（那是现有的 agent-badges 陈列柜页面，由 `Aryous/Aryous` 仓库的 Pages 提供）。

## 3. 内容怎么写

一篇文章或一个项目 = 一个文件夹，文件夹名就是 slug（英文小写加连字符），里面按语言各放一个文件，素材放在一起：

```
src/content/
├─ writing/<slug>/{zh.md, en.md?, *.jpg}
└─ projects/<slug>/{zh.md, en.md?, cover.jpg, object.png?}
```

**文章字段**（只有 `title` 和 `date` 必填）：

```yaml
title: 标题
date: 2026-10-29
description: 一句话摘要            # 可选，用于列表和 RSS
tags: [AI, 工具]                  # 可选，第一版只展示
draft: true                       # 可选，草稿只在本地预览可见
cover: ./photo.jpg                # 可选，有就显示电影感题图
```

**项目字段**：

```yaml
title: agent-badges
summary: 一句话说清它是什么        # 必填
date: 2026-10                     # 必填（原文）
status: active | done | archived  # 可选，默认 done
links: { repo: https://..., demo: https://... }   # 可选
cover: ./cover.jpg                # 可选，项目截图；用于目录悬停、项目页题图、封面背景层
object: ./object.png              # 可选，透明底物件图；上封面的项目必填
featured: true                    # 可选，进首页目录
onCover: true                     # 可选，做封面主角
order: 1                          # 可选，精选排序（小的在前）
```

**原文与译文**：原文把字段写全；译文只写 `title` 和 `description`/`summary`，其余字段自动沿用原文。同一信息只写在一个地方。

**构建时校验（不通过则构建失败、不发布）**：

1. 每个 slug 必须有且只有一个版本写了 `date`（它就是原文）。
2. 文件名只能是 `zh.md` 或 `en.md`。
3. `onCover: true` 的项目必须有 `object`；至少有一个 `onCover` 项目。
4. 站内链接、图片引用不能失效（构建后扫描 `dist/`）。

界面文字（导航、按钮、首页自我介绍等）集中在一个中英对照文件 `src/i18n/ui.ts`。

## 4. 视觉风格

### 4.1 首页：封面故事

参考 `docs/mockups/visual-style-v3.html` 第 2 版。

- **封面区永远是深色**（暖调石墨 `#13110f`），不随主题变。
- 三层景深：最后面是横跨画面的衬线刊头 "Aryous"，中间是两张倾斜的项目截图（取另外两个精选项目的 `cover`），最前面是封面主角的透明底物件图。
- 左下"本期 · In this issue"导读三条；右下一句自我介绍；朱红色圆标（"做东西 · 写下来 · MAKE · WRITE"环形文字 + 期号）缓慢旋转。
- 顶部细栏：期号与季节（如 "Issue 01 · 2026 秋"）+ 导航 + 主题切换 + 语言切换。
- **封面内容自动更新（版式固定）**：
  - 主角 = `onCover: true` 的项目中日期最新的一个；
  - 导读 = 精选项目和文章混排，按日期取最新 3 条；
  - 期号按季度自动计算：2026 年第 4 季度为 Issue 01，之后每季度 +1；季节按月份（3–5 春、6–8 夏、9–11 秋、12–2 冬）。
- 封面以下是**目录**：左栏 Works（精选项目，序号 01、02…）、右栏 Essays（最新 5 篇）。悬停作品名时，作品截图跟随鼠标浮出。没有文章时显示占位提示。

### 4.2 主题

- **浅色主题 = 纸本内页**：暖白纸 `#f3eee6`、墨色文字 `#1d1a17`，顶部保留一条深色页眉。
- **深色主题 = 暗场**：石墨 `#13110f`、浅色文字 `#e9e3d9`。
- 强调色两种主题都是朱红 `#ff5b3a`，用于大字、圆点和深色底上的文字。浅色主题下的小字链接、页头标签和焦点框用更深的 `#b33519`（对纸色 5.3:1），辅助灰字用 `#6b6255`（5.2:1）；深色主题辅助文字透明度 0.58（5.5:1）。全部按 WCAG AA 计算。
- 默认跟随系统 `prefers-color-scheme`；页眉有切换按钮，选择存在 `localStorage`；`<head>` 内联脚本在首帧前设置主题，避免闪烁。
- 两个主题**只换颜色**，版式和字体一致；正文在深色主题下字重加一档（400 → 500）。

### 4.3 字体

| 用途 | 字体 |
| --- | --- |
| 刊头、大号英文标题（Works / Essays）、序号 | Instrument Serif |
| 中文标题与正文 | Noto Serif SC（400 / 500 / 700） |
| 英文正文与英文文章标题 | Source Serif 4（Noto Serif SC 的同族字体；中文字体会把英文弯引号画成全角） |
| 界面文字 | Inter + 系统中文无衬线 |
| 元信息（日期、编号） | JetBrains Mono |

全部通过 `@fontsource` npm 包自托管，不依赖 Google Fonts（国内常打不开）。Noto Serif SC 按 `unicode-range` 切片，浏览器只下载页面用到的切片。

### 4.4 文章页与项目页

参考 `docs/mockups/article-page.html`。

- 三栏网格：左栏元信息（日期、阅读时长、语言版本）、中栏正文（最大约 640px）、右栏旁注：Markdown 脚注在宽屏上移到右栏、与引用处对齐，文末列表仅留给读屏软件；右栏不够宽或窄屏时，脚注留在文末。
- 页头：有 `cover` 时用电影感题图（暗化、缓慢推近、标题压在图上），两种主题都这样；没有就用纯文字页头。
- 正文：宋体，首段首字下沉（朱红），二级标题前带朱红斜体序号，引用块配朱红竖线。
- 顶部朱红阅读进度条；图片淡入。除此之外文章页没有动效。
- 文末：上一篇 / 下一篇，返回目录。
- 项目页沿用同一模板：左栏换成项目信息（年份、状态、仓库/演示链接），题图默认用项目 `cover`。

### 4.5 动效

- 封面：三层视差（鼠标）、物件缓慢摆动 + 周期性高光扫过、圆标旋转、胶片颗粒、标题逐行升起。
- 目录：悬停浮出作品图；行内文字轻微右移。
- 文章页：阅读进度条、图片淡入，以及有题图时题图的缓慢推近（§4.4）；题图上的颗粒是静态的。
- `prefers-reduced-motion: reduce` 时全部动效关闭。

### 4.6 手机版式

- 封面：刊头接近满宽，物件缩小居中，背景截图只留一张，导读移到物件下方；关闭视差，保留摆动和圆标旋转。页眉的期号缩成短格式（如 "No.01 · 秋"）。
- 目录：悬停浮图改为每行左侧小缩略图。
- 文章页：单栏，旁注变成段后注。

## 5. 技术方案

- **Astro 7**（当前 7.4.x），纯静态输出。注意 v7 的变化：Rust 编译器对未闭合标签和非法嵌套直接报错；默认 Markdown 引擎为 Sätteri；`compressHTML` 默认 `'jsx'`，本项目显式设为 `true` 以保留行内元素间空格。
- 内容集合：`src/content.config.ts`，`glob()` loader，`astro/zod`，`image()` 校验同目录图片。
- 多语言：不用 Astro 内置 i18n 路由的回退机制，而是由页面 `getStaticPaths` 同时为两种语言生成所有 slug，并在缺译文时渲染原文 + 提示。这样回退逻辑完全可控。
- 图片：`astro:assets` 的 `<Image>` / `getImage()` 输出 WebP，按尺寸生成多版本。
- RSS：`@astrojs/rss`，中英各一个。
- 部署：GitHub 仓库 `Aryous/aryous.github.io`（公开），GitHub Actions：`actions/checkout@v7` + `withastro/action@v6` + `actions/deploy-pages@v5`；Pages 来源设为 GitHub Actions。`site: https://aryous.github.io`，无 `base`。
- 本地：`~/Documents/Code/p-aryous.github.io`，登记进 `~/Documents/Code/projects.toml`（personal / active）。

## 6. 写作与发布流程

1. `npm run dev` 本地预览（草稿可见）。
2. 新建 `src/content/writing/<slug>/zh.md`，写 `title`、`date` 和正文。
3. commit、push 到 `main`。
4. Actions 自动校验、构建、发布，约 1–2 分钟上线；校验失败则不发布，线上保持上一版。

## 7. 验证

- **自动**（CI 与本地都跑）：`astro check`、`astro build`（含内容校验）、构建后链接/图片检查脚本。
- **截图矩阵**（本地脚本，Puppeteer + 本机 Chrome）：首页 / 文章时间线 / 文章页 / 项目页 / 全部项目 / 404 × 浅色 / 深色 × 中文 / 英文 × 桌面 1440 / 手机 390，外加"减少动态效果"模式抽查。
- 检查项：缺译文提示正确；主题切换无闪烁；手机无横向滚动；减少动态效果时无动画；首屏图片均为 WebP。
- 上线判定：`https://aryous.github.io/` 与 `/en/` 返回 200 且内容正确，`https://aryous.github.io/Aryous/` 仍可访问。
- 最终由一个独立子代理按本文档做验收。

## 8. 第一版内容

- 4 个精选项目：agent-badges（封面主角，物件图用徽章 logo 抠图）、vox、Maposter、canvapie。项目短记由 Claude 根据各仓库 README 起草中英文，Lucas 之后改定。
- 文章由 Lucas 自己写，Claude 不代写。没有文章时，目录与时间线显示占位提示："第一篇还在写。/ The first essay is on its way."
- 素材来源：agent-badges 仓库 `assets/`、vox 仓库 `docs/images/`、PostcardMapAI 仓库 `img/`；canvapie 没有现成图片，用排版生成的终端风格封面图。

## 修订记录

**2026-10-29 · 上线后验收修订**（独立子代理按本文档验收，无阻断项）

- 草稿判断以原文为准：原文 `draft: true` 时整篇不发布，译文不需要也写 `draft`；构建后检查与页面逻辑一致。
- 所有 `onCover` 项目都必须有 `object`（不只是当前主角）。
- 构建后链接检查覆盖相对链接和带本站域名的绝对链接；跳过脚本内容、页内片段和其他仓库的保留路径。
- 缺译文的回退页：canonical 指向原文，hreflang 只列出实际存在的语言版本；404 页不输出 canonical；英文 RSS 的频道链接是 `/en/`。
- 颜色按 WCAG AA 调整（见 §4.2）；字体表增加 Source Serif 4（§4.3）；实现右栏旁注（§4.4）；封面刊头逐行升起、导读和自我介绍渐入（§4.5）；手机封面刊头放大、页眉显示短期号（§4.6）。
- 脚注区标题统一为「注释 · Notes」（中英文内容共用一个站点级配置）。
