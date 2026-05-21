# 🧠 AI 驱动的个人知识管理工具

> 集成 MiMo 的智能笔记与知识图谱系统

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933.svg)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6.svg)](https://typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![MiMo](https://img.shields.io/badge/MiMo-V2.5_Pro-FF6900.svg)](https://platform.xiaomimimo.com)

## ✨ 功能特性

- 📝 **Markdown 编辑** — 实时预览的富文本编辑器
- 🔍 **语义搜索** — 基于向量嵌入的智能检索
- 🏷️ **自动标签** — MiMo 自动提取关键词和标签
- 📊 **知识图谱** — 力导向图可视化知识关联
- 📋 **智能摘要** — MiMo 一键生成笔记摘要

## 🏛️ 架构

```
┌─────────────────────────────────┐
│        React Frontend           │
│  ┌──────┐ ┌──────┐ ┌────────┐  │
│  │编辑器│ │搜索  │ │知识图谱│  │
│  └──┬───┘ └──┬───┘ └───┬────┘  │
└─────┼────────┼─────────┼────────┘
      ▼        ▼         ▼
┌─────────────────────────────────┐
│     Express Backend (Node.js)   │
│  ┌──────┐ ┌──────┐ ┌────────┐  │
│  │MiMo  │ │Embed │ │Graph   │  │
│  │Client│ │ding  │ │Builder │  │
│  └──────┘ └──────┘ └────────┘  │
└─────────────────────────────────┘
```

## 🚀 快速开始

```bash
# 后端
cd backend && npm install
export MIMO_API_KEY="your-key"
npm run dev

# 前端
cd frontend && npm install
npm run dev
```

## 📡 API

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/notes` | GET/POST | 笔记 CRUD |
| `/api/notes/search` | POST | 语义搜索 |
| `/api/notes/summarize` | POST | AI 摘要 |
| `/api/notes/tag` | POST | 自动标签 |
| `/api/graph` | GET | 知识图谱数据 |

## 📄 License

MIT
