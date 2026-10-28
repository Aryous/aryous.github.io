---
title: canvapie
summary: A Canva.cn CLI built for AI agents — find a design, export PPTX, PDF or images, and check for hidden pages.
---

## What it is

A Canva.cn Connect API command-line tool for agents and automation. Given a Canva link, a design ID, a temporary edit link or just a few words from the title, an agent can find the design, read its metadata and export it as PPTX, PDF or images.

## How it's made

- `resolve`: links, IDs and title keywords all resolve to a specific design.
- `export`: export by format and page, or in batches with JSONL.
- `inspect`: find which slides in an exported PPTX are hidden.
- JSON output by default so agents can read it directly; credentials stay on your machine.

## What's fun about it

- "Open Canva, find the design, click export" becomes a single command an agent can run.
- Checking hidden slides right after export tells you exactly which pages the file contains before you hand it over.
