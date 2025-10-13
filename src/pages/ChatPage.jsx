import { useState, useRef, useEffect } from 'react'
import { Send, X, Loader2, Sparkles } from 'lucide-react'
import { sendMessageToModel } from '../lib/firebase.js'

function ChatPage() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const response = await sendMessageToModel(userMessage)
      setMessages((prev) => [...prev, { role: 'assistant', content: response }])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Bir hata oluştu. Tekrar dene.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen flex-col bg-slate-950">
      <header className="flex items-center justify-between border-b border-slate-800 bg-slate-900/80 px-6 py-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20">
            <Sparkles className="h-6 w-6 text-indigo-300" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-100">AI Chat</h1>
            <p className="text-xs text-slate-400">Gemini Flash ile sohbet et</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => window.close()}
          className="flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-rose-500 hover:text-rose-300"
        >
          <X className="h-5 w-5" />
          Kapat
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-500/10">
              <Sparkles className="h-10 w-10 text-indigo-300" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-100">AI ile sohbet başlat</h2>
              <p className="text-sm text-slate-400">Gemini Flash modeli hazır, sor bakalım</p>
            </div>
          </div>
        )}

        <div className="mx-auto max-w-3xl space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                  message.role === 'user'
                    ? 'bg-indigo-500/20 text-slate-100'
                    : 'border border-slate-800 bg-slate-900/80 text-slate-200'
                }`}
              >
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl border border-slate-800 bg-slate-900/80 px-5 py-3">
                <Loader2 className="h-5 w-5 animate-spin text-indigo-400" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-slate-800 bg-slate-900/80 px-6 py-4 backdrop-blur">
        <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Mesajını yaz..."
              disabled={loading}
              className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex items-center gap-2 rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:bg-slate-700"
            >
              <Send className="h-5 w-5" />
              Gönder
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ChatPage
