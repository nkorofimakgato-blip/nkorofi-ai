import { useEffect, useRef, useState } from 'react'
import { streamChat, type ChatMessage } from '../api/chat'
import Message from './Message'

const STARTER_PROMPTS = [
  { icon: '🎯', text: 'What projects has Nkorofi built?' },
  { icon: '⚡', text: 'What tech does he know?' },
  { icon: '🏆', text: 'Tell me about his CCNA' },
  { icon: '📩', text: 'Is he available for hire?' },
]

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const bottomRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

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
      {/* Backdrop */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-fadeIn"
        />
      )}

      {/* The morphing widget */}
      <div
        className={`
          fixed bottom-6 right-6 z-50
          bg-gray-950 border border-gray-800/80
          overflow-hidden
          transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
          ${open
            ? 'w-[400px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-4rem)] rounded-3xl shadow-2xl shadow-cyan-500/30'
            : 'w-16 h-16 rounded-2xl cursor-pointer hover:scale-105 shadow-xl shadow-cyan-500/40 hover:shadow-cyan-500/60'
          }
        `}
        onClick={!open ? () => setOpen(true) : undefined}
      >
        {/* Closed state */}
        <div
          className={`
            absolute inset-0 flex items-center justify-center
            transition-all duration-300
            ${open ? 'opacity-0 scale-50 pointer-events-none' : 'opacity-100 scale-100'}
          `}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-cyan-600 opacity-90" />
          <div className="relative text-3xl">🤖</div>
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-400 border-2 border-gray-950 animate-pulse" />
        </div>

        {/* Open state */}
        <div
          className={`
            absolute inset-0 flex flex-col
            transition-opacity duration-300 delay-150
            ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}
          `}
        >
          {/* Header */}
          <div className="relative flex items-center gap-3 px-5 py-4 border-b border-gray-800/80 bg-gradient-to-r from-gray-900 to-gray-900/50 flex-shrink-0">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-lg shadow-lg shadow-cyan-500/30">
                🤖
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-400 border-2 border-gray-900" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-white">Nkorofi AI</p>
              <p className="text-xs text-green-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                Online · replies instantly
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setOpen(false)
              }}
              className="w-8 h-8 rounded-lg hover:bg-gray-800 flex items-center justify-center text-gray-500 hover:text-white transition-colors"
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-gray-950 chat-scroll">
            {messages.length === 0 && (
              <div className="space-y-6">
                {/* Greeting */}
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-xs font-bold shadow-lg">
                    🤖
                  </div>
                  <div className="max-w-[85%] rounded-2xl rounded-tl-md px-4 py-3 text-sm leading-relaxed bg-gray-800/80 border border-gray-700/50 text-gray-100">
                    <p className="mb-1">👋 Hi! I&apos;m <span className="text-cyan-400 font-semibold">Nkorofi AI</span>.</p>
                    <p className="text-gray-400">Ask me anything about Nkorofi&apos;s work, skills, or experience.</p>
                  </div>
                </div>

                {/* Starter prompts */}
                <div className="space-y-2 pt-2">
                  <p className="text-xs uppercase tracking-widest text-gray-600 font-semibold pl-1">
                    Try asking
                  </p>
                  <div className="grid gap-2">
                    {STARTER_PROMPTS.map((p) => (
                      <button
                        key={p.text}
                        onClick={() => send(p.text)}
                        className="group flex items-center gap-3 text-left text-sm bg-gray-900/80 hover:bg-gray-800 border border-gray-800 hover:border-cyan-500/50 rounded-xl px-3.5 py-3 transition-all hover:translate-x-1"
                      >
                        <span className="text-lg">{p.icon}</span>
                        <span className="text-gray-300 group-hover:text-white transition-colors">
                          {p.text}
                        </span>
                        <span className="ml-auto text-gray-600 group-hover:text-cyan-400 transition-colors">→</span>
                      </button>
                    ))}
                  </div>
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
              <div className="text-red-400 text-xs bg-red-950/40 border border-red-800/50 rounded-xl p-3 animate-fadeIn">
                {error}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="border-t border-gray-800/80 p-3 bg-gray-900/50 backdrop-blur flex gap-2 items-end flex-shrink-0"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask anything…"
              rows={1}
              disabled={streaming}
              className="flex-1 bg-gray-950/80 border border-gray-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 resize-none disabled:opacity-60 transition-all"
            />
            <button
              type="submit"
              disabled={streaming || !input.trim()}
              className="bg-gradient-to-br from-cyan-400 to-cyan-600 hover:from-cyan-300 hover:to-cyan-500 disabled:from-gray-800 disabled:to-gray-800 disabled:text-gray-600 text-black font-bold rounded-xl px-4 py-2.5 text-sm transition-all hover:scale-105 disabled:hover:scale-100 shadow-lg shadow-cyan-500/20 disabled:shadow-none"
            >
              {streaming ? '···' : '→'}
            </button>
          </form>
        </div>
      </div>
    </>
  )
}