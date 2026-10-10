import { useEffect, useRef, useState } from 'react'
import { streamChat, type ChatMessage } from '../api/chat'
import Message from './Message'

const STARTER_PROMPTS = [
  'What projects has Nkorofi built?',
  'What tech does he know?',
  'Tell me about his CCNA',
  'Is he available for hire?',
]

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const bottomRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  // Auto-scroll to the bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streaming])

  async function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed || streaming) return

    setError(null)
    setInput('')

    const userMsg: ChatMessage = { role: 'user', content: trimmed }
    const history = [...messages, userMsg]
    setMessages([...history, { role: 'assistant', content: '' }])
    setStreaming(true)

    const controller = new AbortController()
    abortRef.current = controller

    let assistant = ''

    try {
      await streamChat(
        history,
        (token) => {
          assistant += token
          setMessages([...history, { role: 'assistant', content: assistant }])
        },
        controller.signal
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      // Remove the empty assistant message on error
      setMessages(history)
    } finally {
      setStreaming(false)
      abortRef.current = null
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    send(input)
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send(input)
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-2xl shadow-2xl shadow-cyan-500/40 flex items-center justify-center transition-all hover:scale-105"
        aria-label={open ? 'Close chat' : 'Open chat'}
      >
        {open ? '×' : '🤖'}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] h-[560px] max-h-[calc(100vh-8rem)] bg-gray-950 border border-gray-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800 bg-gray-900">
            <div className="w-9 h-9 rounded-full bg-cyan-500 flex items-center justify-center text-black font-bold">
              🤖
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm">Nkorofi AI</p>
              <p className="text-xs text-gray-500">
                Ask about Nkorofi&apos;s work & skills
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-950">
            {messages.length === 0 && (
              <div className="text-gray-500 text-sm space-y-3">
                <p>👋 Hi! I&apos;m Nkorofi&apos;s AI assistant.</p>
                <p>Ask me anything about his projects, skills, or experience. Try:</p>
                <div className="flex flex-wrap gap-2 pt-2">
                  {STARTER_PROMPTS.map((p) => (
                    <button
                      key={p}
                      onClick={() => send(p)}
                      className="text-xs bg-gray-900 border border-gray-800 hover:border-cyan-500/50 hover:bg-gray-800 rounded-full px-3 py-1.5 text-left transition-colors"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <Message
                key={i}
                role={m.role}
                content={m.content}
                streaming={
                  streaming &&
                  i === messages.length - 1 &&
                  m.role === 'assistant'
                }
              />
            ))}

            {error && (
              <div className="text-red-400 text-xs bg-red-950/40 border border-red-800/50 rounded-lg p-3">
                {error}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="border-t border-gray-800 p-3 bg-gray-900 flex gap-2 items-end"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask anything…"
              rows={1}
              disabled={streaming}
              className="flex-1 bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/60 resize-none disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={streaming || !input.trim()}
              className="bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-800 disabled:text-gray-600 text-black font-bold rounded-xl px-4 py-2 text-sm transition-colors"
            >
              {streaming ? '…' : 'Send'}
            </button>
          </form>
        </div>
      )}
    </>
  )
}