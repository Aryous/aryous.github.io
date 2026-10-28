---
title: canvapie
summary: 给 AI Agent 用的 Canva.cn 命令行：认出设计，导出 PPTX、PDF 或图片，再检查隐藏页。
date: 2026-05-27
status: done
links:
  repo: https://github.com/Aryous/canvapie
cover: ./cover.png
featured: true
order: 4
---

## 是什么

面向 Agent 和自动化流程的 Canva.cn Connect API 命令行工具。Agent 拿到用户给的 Canva 设计链接、设计 ID、临时编辑链接，或者只是标题里的几个关键词，就能找到对应的设计，读取元数据，导出 PPTX、PDF 或图片。

## 怎么做的

- `resolve`：链接、ID、标题关键词都能解析到具体的设计。
- `export`：按格式和页码导出，也能用 JSONL 批量处理。
- `inspect`：检查导出的 PPTX 里哪些页被隐藏了。
- 输出默认是 JSON，方便 Agent 直接读取；授权信息保存在本地。

## 有意思的地方

- 把"打开 Canva、找到设计、点导出"这一串手工操作，变成 Agent 一条命令就能完成的事。
- 导出之后顺手检查隐藏页，交付前就知道文件里实际有哪些页。
