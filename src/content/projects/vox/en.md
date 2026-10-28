---
title: vox
summary: One interface for speech models — text-to-speech and speech-to-text, local and cloud.
---

## What it is

Manage voice models the way LM Studio manages LLMs, and call any of them through one API the way OpenRouter does. The CLI, the HTTP API and the web UI share the same model IDs, voice references and parameter names.

## How it's made

- Local models run on MLX on Apple Silicon: Qwen3-TTS and Kokoro-82M (Chinese), with downloads verified file by file.
- In the cloud: OpenRouter plus ten providers. Each provider's quirks — where the emotion prompt goes, speed ranges, how audio comes back — are handled by adapters.
- An OpenAI-compatible `POST /v1/audio/speech`: point any OpenAI client at the local address and it can use every model you have.
- Speech-to-text uses the same model system: `vox transcribe meeting.m4a` gives you text or subtitles.

## What's fun about it

- Voice cloning: record 10–20 seconds and vox can say anything in that voice.
- Hear before you choose: every voice in the library reads the same sample line, and the playground generates one text in several voices side by side.
- It's a preview (0.1); the web UI and CLI messages are Chinese-only for now.
