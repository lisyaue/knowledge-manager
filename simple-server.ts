import express from 'express'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json())

// 简化版 MiMo 调用
const MIMO_BASE = process.env.MIMO_BASE_URL || 'https://token-plan-cn.xiaomimimo.com/v1'
const MIMO_KEY = process.env.MIMO_API_KEY || ''

// 内存存储
const notes = new Map()
const sampleId = 'demo-1'
notes.set(sampleId, {
  id: sampleId,
  title: '示例笔记',
  content: '# Hello World\n\n这是一篇示例笔记。',
  tags: ['示例'],
  created: new Date().toISOString(),
  updated: new Date().toISOString()
})

app.get('/api/notes', (req, res) => {
  res.json({ notes: Array.from(notes.values()), total: notes.size })
})

app.post('/api/notes', (req, res) => {
  const id = Date.now().toString()
  const note = { id, ...req.body, created: new Date().toISOString(), updated: new Date().toISOString() }
  notes.set(id, note)
  res.json(note)
})

app.post('/api/notes/search', (req, res) => {
  const { query } = req.body
  const results = Array.from(notes.values()).filter(n =>
    JSON.stringify(n).includes(query)
  )
  res.json({ results })
})

app.post('/api/notes/summarize', async (req, res) => {
  res.json({ summary: '这是一篇关于AI和知识管理的笔记。', noteId: req.body.noteId })
})

app.post('/api/notes/tag', (req, res) => {
  const note = notes.get(req.body.noteId)
  if (note) {
    note.tags = [...new Set([...note.tags, 'AI', '知识管理'])]
    res.json({ tags: note.tags })
  } else {
    res.status(404).json({ error: 'Not found' })
  }
})

app.get('/api/graph', (req, res) => {
  const all = Array.from(notes.values())
  res.json({
    nodes: all.map(n => ({ id: n.id, label: n.title, tags: n.tags })),
    links: []
  })
})

const PORT = 8002
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
