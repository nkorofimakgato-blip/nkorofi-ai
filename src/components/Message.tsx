interface MessageProps {
  role: 'user' | 'assistant'
  content: string
  streaming?: boolean
}

export default function Message({ role, content, streaming }: MessageProps) {
  const isUser = role === 'user'
  const isEmpty = !content && !isUser

  return (
    <div
      className={`flex gap-3 animate-fadeIn ${
        isUser ? 'flex-row-reverse' : ''
      }`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-lg ${
          isUser
            ? 'bg-gradient-to-br from-gray-600 to-gray-800 text-white'
            : 'bg-gradient-to-br from-cyan-400 to-cyan-600 text-black'
        }`}
      >
        {isUser ? 'You' : '🤖'}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words shadow-sm ${
          isUser
            ? 'bg-gradient-to-br from-cyan-500 to-cyan-600 text-black rounded-tr-md'
            : 'bg-gray-800/80 border border-gray-700/50 text-gray-100 rounded-tl-md'
        }`}
      >
        {isEmpty ? (
          <span className="inline-flex gap-1 items-center h-5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
          </span>
        ) : (
          <>
            {content}
            {streaming && (
              <span className="inline-block w-1.5 h-4 ml-1 bg-cyan-400 animate-pulse align-middle rounded-sm" />
            )}
          </>
        )}
      </div>
    </div>
  )
}