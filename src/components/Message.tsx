interface MessageProps {
  role: 'user' | 'assistant'
  content: string
  streaming?: boolean
}

export default function Message({ role, content, streaming }: MessageProps) {
  const isUser = role === 'user'

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
          isUser ? 'bg-gray-700 text-white' : 'bg-cyan-500 text-black'
        }`}
      >
        {isUser ? 'You' : '🤖'}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words ${
          isUser
            ? 'bg-cyan-500 text-black rounded-tr-sm'
            : 'bg-gray-800 text-white rounded-tl-sm'
        }`}
      >
        {content}
        {streaming && (
          <span className="inline-block w-1 h-4 ml-1 bg-current animate-pulse align-middle" />
        )}
      </div>
    </div>
  )
}