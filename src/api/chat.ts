import { KNOWLEDGE } from '../data/knowledge'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

/**
 * Builds the system prompt that tells the AI who it is
 * and gives it the knowledge base about Nkorofi.
 */
export function buildSystemPrompt(): string {
  const k = KNOWLEDGE

  return `You are ${k.identity.preferredName}'s AI assistant, embedded on his personal portfolio site.

Your purpose: answer visitor questions about ${k.identity.preferredName} — his projects, skills, education, certifications, and how to contact him.

Rules:
${k.personality.rules.map((r) => '- ' + r).join('\n')}

Tone: ${k.personality.tone}

===== KNOWLEDGE BASE =====
Name: ${k.identity.fullName}
Title: ${k.identity.title}
Location: ${k.identity.location}
Status: ${k.identity.status}

Bio: ${k.bio}

Education: ${k.education.program} at ${k.education.institution} (${k.education.status})

Certifications:
${k.certifications.map((c) => `- ${c.name} (${c.issuer}): ${c.details}`).join('\n')}

Skills:
- Languages: ${k.skills.languages.join(', ')}
- Frameworks: ${k.skills.frameworks.join(', ')}
- Backend: ${k.skills.backend.join(', ')}
- Mobile: ${k.skills.mobile.join(', ')}
- Tools: ${k.skills.tools.join(', ')}
- Concepts: ${k.skills.concepts.join(', ')}

Projects:
${k.projects.map((p) => `- ${p.name} (${p.type}): ${p.summary} [Tech: ${p.tech.join(', ')}]${p.liveUrl ? ` [Live: ${p.liveUrl}]` : ''}${p.codeUrl ? ` [Code: ${p.codeUrl}]` : ''}`).join('\n\n')}

Contact:
- Email: ${k.contact.email}
- Portfolio: ${k.contact.portfolio}
- GitHub: ${k.contact.github}
- LinkedIn: ${k.contact.linkedin}
===== END KNOWLEDGE BASE =====

If asked something not covered above, say you don't have that information and suggest contacting ${k.identity.preferredName} directly by email.`
}

/**
 * Sends a chat history to our serverless function and streams tokens back.
 * `onToken` fires for each chunk of text as it arrives.
 */
export async function streamChat(
  messages: ChatMessage[],
  onToken: (token: string) => void,
  signal?: AbortSignal
): Promise<void> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system: buildSystemPrompt(),
      messages,
    }),
    signal,
  })

  if (!res.ok || !res.body) {
    const errText = await res.text().catch(() => '')
    throw new Error(`Chat failed: ${res.status} ${errText}`)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })

    // Groq sends SSE lines like: "data: {json}\n\n"
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed.startsWith('data:')) continue

      const data = trimmed.slice(5).trim()
      if (data === '[DONE]') return
      if (!data) continue

      try {
        const parsed = JSON.parse(data)
        const token = parsed.choices?.[0]?.delta?.content
        if (typeof token === 'string' && token.length > 0) {
          onToken(token)
        }
      } catch {
        // Ignore malformed lines
      }
    }
  }
}
