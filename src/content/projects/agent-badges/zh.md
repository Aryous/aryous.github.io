---
title: agent-badges
summary: 把 Claude Code 和 Codex 的使用记录，变成可以收藏的 3D 成就徽章。
date: 2026-10-19
status: active
links:
  repo: https://github.com/Aryous/agent-badges
  demo: https://aryous.github.io/agent-badges/
cover: ./cover.jpg
object: ./object.png
featured: true
onCover: true
order: 1
---

## 是什么

一条命令 `npx agent-badges`，把你和 Claude Code、Codex 一起工作的记录，变成一面 Apple Watch 风格的 3D 成就徽章墙。所有事情都在本机完成：它只读取日志里的时间戳和用量统计，不读对话内容，也不上传任何东西。

## 怎么做的

每一枚徽章都由一份小配置经 three.js 生成，材质有珐琅、抛光和拉丝金属、陶瓷、全息箔、水晶。可以拖动旋转，也可以翻到背面看刻字。

目前一共 62 枚：Claude Code 32 枚，Codex 30 枚，涵盖里程碑、连续使用、功能探索、节日，还有几枚隐藏成就。分级徽章会从铜升到银，再升到金。

## 有意思的地方

- 一整年的使用画成一块午夜蓝珐琅板，每天一个凹点，用得越多越亮。
- 热力图下面能拉出一个抽屉，里面是十二枚月度纪念章，边缘的金属成色取决于当月和全年最忙那个月的比例。
- 任何一枚徽章都能导出 2048px 的 PNG，也能生成整面墙的分享海报，或者在 GitHub 主页放一张成就卡片。
