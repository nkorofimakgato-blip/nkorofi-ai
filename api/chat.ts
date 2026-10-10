// Vercel serverless function — runs on the server, holds the API key.
// Uses plain JS types (no @vercel/node import) to avoid dependency conflicts.

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'openai/gpt-oss-120b'

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'Server misconfigured: missing API key' })
  }

  const { system, messages } = req.body as {
    system?: string
    messages?: Array<{ role: 'user' | 'assistant'; content: string }>
  }

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Missing messages' })
  }

  const trimmed = messages.slice(-12)

  try {
    const groqRes = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        stream: true,
        temperature: 0.7,
        max_tokens: 400,
        messages: [
          { role: 'system', content: system ?? 'You are a helpful assistant.' },
          ...trimmed,
        ],
      }),
    })

    if (!groqRes.ok || !groqRes.body) {
      const text = await groqRes.text().catch(() => 'unknown error')
      return res.status(groqRes.status).json({ error: text })
    }

    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache, no-transform')
    res.setHeader('Connection', 'keep-alive')

    const reader = groqRes.body.getReader()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      res.write(value)
    }

    res.end()
  } catch (err) {
    console.error('Groq call failed:', err)
    return res.status(500).json({ error: 'Upstream error' })
  }
}