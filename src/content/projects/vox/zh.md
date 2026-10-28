---
title: vox
summary: 一个界面管理和调用所有语音模型：文字转语音、语音转文字，本地和云端都行。
date: 2026-09-26
status: active
links:
  repo: https://github.com/Aryous/vox
cover: ./cover.png
featured: true
order: 2
---

## 是什么

像 LM Studio 管理大语言模型那样管理语音模型，再像 OpenRouter 那样，用一套接口调用其中任何一个。命令行、HTTP API 和网页界面用的是同一套模型 ID、音色和参数名。

## 怎么做的

- 本地模型跑在 Apple Silicon 的 MLX 上：Qwen3-TTS 和 Kokoro-82M（中文）。下载时逐个文件校验。
- 云端接了 OpenRouter 和十家服务商。各家在情绪提示放在哪、语速范围、音频编码格式上的差异，都由适配层处理掉。
- 提供 OpenAI 兼容的 `POST /v1/audio/speech`，任何 OpenAI 客户端指向本地地址，就能用上你装的所有模型。
- 语音转文字用同一套模型体系：`vox transcribe meeting.m4a` 输出文本或字幕。

## 有意思的地方

- 声音克隆：录 10–20 秒，就能用这个声音说任何话。
- 选之前先听：音色库里每个声音都读同一句样例；试听台里一段文字可以一次用几个声音并排生成。
- 还在预览阶段（0.1），网页界面和命令行提示目前只有中文。
