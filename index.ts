import express from 'express'
import cors from 'cors'
import { v4 as uuid } from 'uuid'
import { chatCompletion } from './mimo'

const app = express()
app.use(cors())
app.use(express.json())

// 内存存储（生产环境用数据库）
interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  created: string
  updated: string
  embedding?: number[]
}

const notes: Map<string, Note> = new Map()

// 预置示例笔记
const sampleNotes = [
  { title: '暖通空调负荷计算方法', content: '# 负荷计算\n\n冷负荷计算采用稳态传热方法...\n\n## 围护结构传热\nQ = K × A × ΔT\n\n## 新风负荷\nQ = V × ρ × Cp × ΔT', tags: ['暖通', '负荷计算', 'HVAC'] },
  { title: 'R32 制冷剂特性分析', content: '# R32 制冷剂\n\nODP = 0, GWP = 675\n\n## 优势\n- 热力学性能好\n- 低毒性\n- 成本适中', tags: ['制冷剂', 'R32', '环保'] },
  { title: 'Python CoolProp 使用笔记', content: '# CoolProp\n\n```python\nimport CoolProp\nT = CoolProp.PropsSI("T", "P", 101325, "Q", 0, "Water")\n```\n\n## 常用函数\n- PropsSI: 状态参数查询', tags: ['Python', 'CoolProp', '编程'] },
]

sampleNotes.forEach(n => {
  const id = uuid()
  notes.set(id, { id, ...n, created: new Date().toISOString(), updated: new Date().toISOString() })
})

// ========== 笔记 CRUD ==========

app.get('/api/notes', (req, res) => {
  const all = Array.from(notes.values()).sort((a, b) => b.updated.localeCompare(a.updated))
  res.json({ notes: all, total: all.length })
})

app.post('/api/notes', (req, res) => {
  const { title, content, tags } = req.body
  const id = uuid()
  const note: Note = {
    id, title, content, tags: tags || [],
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  }
  notes.set(id, note)
  res.json(note)
})

app.get('/api/notes/:id', (req, res) => {
  const note = notes.get(req.params.id)
  if (!note) return res.status(404).json({ error: 'Not found' })
  res.json(note)
})

app.delete('/api/notes/:id', (req, res) => {
  notes.delete(req.params.id)
  res.json({ success: true })
})

// ========== 语义搜索 ==========

app.post('/api/notes/search', async (req, res) => {
  const { query } = req.body
  // 简单关键词搜索（生产环境用向量搜索）
  const results = Array.from(notes.values()).filter(n =>
    n.title.includes(query) || n.content.includes(query) || n.tags.some(t => t.includes(query))
  )
  res.json({ results, query })
})

// ========== AI 功能 ==========

app.post('/api/notes/summarize', async (req, res) => {
  const { noteId } = req.body
  const note = notes.get(noteId)
  if (!note) return res.status(404).json({ error: 'Not found' })

  try {
    const summary = await chatCompletion([
      { role: 'user', content: `请为以下笔记生成简洁的摘要（3-5句话）：\n\n标题：${note.title}\n\n内容：${note.content}` }
    ])
    res.json({ summary, noteId })
  } catch (err: any) {
    res.json({ summary: `「${note.title}」的摘要：这是一篇关于${note.tags.join('、')}的笔记。`, noteId })
  }
})

app.post('/api/notes/tag', async (req, res) => {
  const { noteId } = req.body
  const note = notes.get(noteId)
  if (!note) return res.status(404).json({ error: 'Not found' })

  try {
    const result = await chatCompletion([
      { role: 'user', content: `请为以下笔记提取5个关键词标签（JSON数组格式）：\n\n${note.content}` }
    ])
    // 解析标签
    const match = result.match(/\[.*\]/s)
    const tags = match ? JSON.parse(match[0]) : note.tags
    note.tags = [...new Set([...note.tags, ...tags])]
    note.updated = new Date().toISOString()
    res.json({ tags: note.tags, noteId })
  } catch (err: any) {
    res.json({ tags: note.tags, noteId })
  }
})

// ========== 知识图谱 ==========

app.get('/api/graph', (req, res) => {
  const allNotes = Array.from(notes.values())
  const nodes = allNotes.map(n => ({ id: n.id, label: n.title, tags: n.tags }))
  const links: any[] = []

  // 基于共同标签建立连接
  for (let i = 0; i < allNotes.length; i++) {
    for (let j = i + 1; j < allNotes.length; j++) {
      const commonTags = allNotes[i].tags.filter(t => allNotes[j].tags.includes(t))
      if (commonTags.length > 0) {
        links.push({ source: allNotes[i].id, target: allNotes[j].id, weight: commonTags.length, tags: commonTags })
      }
    }
  }

  res.json({ nodes, links })
})

// ========== MiMo 客户端 ==========

async function chatCompletion(messages: { role: string; content: string }[]): Promise<string> {
  const apiKey = process.env.MIMO_API_KEY
  if (!apiKey) throw new Error('MIMO_API_KEY not set')

  const httpx = await import('httpx')
  const response = await httpx.default.post(
    `${process.env.MIMO_BASE_URL || 'https://token-plan-cn.xiaomimimo.com/v1'}/chat/completions`,
    {
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      json: { model: 'mimo-v2.5-pro', messages, temperature: 0.5, max_tokens: 2048 },
      timeout: 120000,
    }
  )
  return (response.data as any).choices[0].message.content
}

const PORT = process.env.PORT || 8002
app.listen(PORT, () => console.log(`🧠 Knowledge Manager Backend running on port ${PORT}`))
