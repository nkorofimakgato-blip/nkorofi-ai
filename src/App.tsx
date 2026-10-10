import ChatWidget from './components/ChatWidget'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Demo page — this is what will be replaced by your portfolio embed */}
      <div className="max-w-3xl mx-auto px-6 py-20">
        <p className="text-cyan-400 text-sm font-bold uppercase tracking-widest mb-3">
          Demo
        </p>
        <h1 className="text-5xl font-black mb-6">
          Nkorofi AI
        </h1>
        <p className="text-gray-400 text-lg leading-relaxed mb-8">
          This is a demo page for the chat widget. Click the 🤖 button in the
          bottom-right corner to start talking to the AI assistant.
        </p>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="font-bold mb-3">How it works</h2>
          <ul className="text-sm text-gray-400 space-y-2">
            <li>• Built with React, TypeScript, and Tailwind CSS</li>
            <li>• Powered by Llama 3.3 70B via Groq (fast + free)</li>
            <li>• Streams tokens in real time as the AI responds</li>
            <li>• Answers grounded in a knowledge file — cannot invent facts</li>
            <li>• API key stays server-side via a Vercel Function</li>
          </ul>
        </div>
      </div>

      <ChatWidget />
    </div>
  )
}