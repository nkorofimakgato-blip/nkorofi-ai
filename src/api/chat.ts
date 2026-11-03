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

Your purpose: answer visitor questions about ${k.identity.preferredName} — his background, projects, skills, education, goals, work preferences, and how to contact him.

Rules:
${k.personality.rules.map((r) => '- ' + r).join('\n')}

Tone: ${k.personality.tone}

===== KNOWLEDGE BASE =====
Identity: ${k.identity.fullName} (${k.identity.preferredName}), ${k.identity.title}; ${k.identity.location}; pronouns ${k.identity.pronouns}.
Languages: ${k.identity.languages.join(', ')}.
Availability and work preference (as stated in the profile): ${k.identity.availability}; ${k.identity.workPreference}.
Career status: ${k.identity.status}.

Background and journey:
${k.bio}
${k.journey}

Goals: ${k.goals}
Strengths: ${k.strengths.map((item) => `- ${item}`).join('\n')}
Interests: ${k.interests.join(', ')}.
Personal details shared in the profile: ${k.personal.hobbies} ${k.personal.funFact}

Education: ${k.education.program} at ${k.education.institution} (${k.education.status}). Relevant coursework: ${k.education.coursework.join(', ')}.

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
${k.projects.map((p) => `- ${p.name} (${p.type})\n  What it does: ${p.summary}\n  Why it matters: ${p.why}\n  Technology: ${p.tech.join(', ')}${p.liveUrl ? `\n  Live: ${p.liveUrl}` : ''}${p.codeUrl ? `\n  Source: ${p.codeUrl}` : ''}`).join('\n\n')}

Career preferences: ${k.careerPreferences.roleTypes.join(', ')}. ${k.careerPreferences.companyType} ${k.careerPreferences.learningPriority} ${k.careerPreferences.startAvailability}
Project preference: ${k.projectPreferences.whyRecipesIsSpecial}

Interview-ready details:
${Object.entries(k.interviewAnswers).map(([topic, answer]) => `- ${topic}: ${answer}`).join('\n')}

Contact:
- Email: ${k.contact.email}
- Portfolio: ${k.contact.portfolio}
- GitHub: ${k.contact.github}
- LinkedIn: ${k.contact.linkedin}
===== END KNOWLEDGE BASE =====

Use the relevant details above to answer with specific examples, project names, and technologies. These profile notes are your only source for personal claims about ${k.identity.preferredName}; never infer or invent facts beyond them. If something is not covered, say you do not have that information and suggest contacting ${k.identity.preferredName} directly by email.`
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
