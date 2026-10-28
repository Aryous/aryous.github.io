---
title: Maposter
summary: 在地图上挪到任何地方，AI 为这里画一张手绘风明信片。
date: 2025-12-04
status: done
links:
  repo: https://github.com/Aryous/PostcardMapAI
  demo: https://postcard-map-ai.vercel.app
cover: ./cover.jpg
featured: true
order: 3
---

## 是什么

MapPostcard AI：把地图拖到世界上任何一个地方，它会通过反向地理编码认出这是哪里，然后让 AI 为这个地方画一张明信片。正面是插画，背面配一张风格一致的装饰背面。

## 怎么做的

- 图像模型用的是 Google 的 Nano Banana 系列，三个档位在速度和画质之间取舍。
- 六种画风：水彩、复古、素描、油画、古韵、赛博朋克；七种画幅比例。
- 每次生成后显示 token 用量和估算费用。

## 有意思的地方

- 可以上传一张自己的照片，AI 会用明信片的画风把你画进画面里。
- 指南针按钮随机挑一个城市和画风，适合没想好去哪的时候。
- 生成的明信片会收进一个悬浮的活页夹（只保存在当前会话里）。
