import { useState, useRef, useEffect } from 'react'
import { Send, X, Loader2, Sparkles, Image as ImageIcon, Trash2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { sendMessageToModel } from '../lib/firebase.js'

const SYSTEM_PROMPT = `Use emojis all the time
Speaks casually in hood style.
Talk like a member of Gen Z.
Talk less explain more.
Tell it like it is; don't sugar-coat responses.
Always use turkish language
Don't be a bad boy, be sincere.
When you can use bad words
`

function ChatPage() {
  const textareaRef = useRef(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onload = (event) => {
        setImagePreview(event.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if ((!input.trim() && !selectedImage) || loading) return

    const userMessage = input.trim()
    const userImagePreview = imagePreview
    setInput('')
    setSelectedImage(null)
    setImagePreview(null)
    if (textareaRef.current) {
      textareaRef.current.style.height = '44px'
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }

    setMessages((prev) => [
      ...prev,
      { role: 'user', content: userMessage, image: userImagePreview },
    ])
    setLoading(true)

    try {
      const fullMessage = SYSTEM_PROMPT + (userMessage || 'Bu görseli açıkla')
      const response = await sendMessageToModel(fullMessage, userImagePreview)
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
      <header className="flex items-center justify-between border-b border-slate-800 bg-slate-900/80 px-3 py-3 backdrop-blur md:px-6 md:py-4">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/20 md:h-10 md:w-10">
            <Sparkles className="h-5 w-5 text-indigo-300 md:h-6 md:w-6" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-slate-100 md:text-lg">AI Chat</h1>
            <p className="text-xs text-slate-400">Gemini Flash ile sohbet et</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => window.close()}
          className="flex items-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-rose-500 hover:text-rose-300 md:px-4 md:text-sm"
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

        <div className="mx-auto max-w-3xl space-y-4 px-3 md:px-0">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 md:max-w-[80%] md:px-5 ${
                  message.role === 'user'
                    ? 'bg-indigo-500/20 text-slate-100'
                    : 'border border-slate-800 bg-slate-900/80 text-slate-200'
                }`}
              >
                {message.image && (
                  <img
                    src={message.image}
                    alt="Uploaded"
                    className="mb-2 max-h-48 rounded-lg object-contain md:max-h-64"
                  />
                )}
                {message.content && (
                  message.role === 'user' ? (
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                  ) : (
                    <div className="prose prose-sm prose-invert max-w-none">
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <p className="mb-2 text-sm leading-relaxed">{children}</p>,
                          code: ({ children }) => <code className="rounded bg-slate-950/50 px-1.5 py-0.5 text-xs">{children}</code>,
                          pre: ({ children }) => <pre className="overflow-x-auto rounded-lg bg-slate-950/50 p-3 text-xs">{children}</pre>,
                          ul: ({ children }) => <ul className="mb-2 ml-4 list-disc text-sm">{children}</ul>,
                          ol: ({ children }) => <ol className="mb-2 ml-4 list-decimal text-sm">{children}</ol>,
                          li: ({ children }) => <li className="mb-1">{children}</li>,
                          h1: ({ children }) => <h1 className="mb-2 text-lg font-bold">{children}</h1>,
                          h2: ({ children }) => <h2 className="mb-2 text-base font-bold">{children}</h2>,
                          h3: ({ children }) => <h3 className="mb-2 text-sm font-bold">{children}</h3>,
                          a: ({ children, href }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-indigo-300 hover:underline">{children}</a>,
                          blockquote: ({ children }) => <blockquote className="border-l-4 border-slate-600 pl-3 italic text-slate-400">{children}</blockquote>,
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  )
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start px-3 md:px-0">
              <div className="max-w-[85%] rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 md:max-w-[80%] md:px-5">
                <Loader2 className="h-5 w-5 animate-spin text-indigo-400" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-slate-800 bg-slate-900/80 px-3 py-3 backdrop-blur md:px-6 md:py-4">
        <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
          {imagePreview && (
            <div className="mb-3 flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-950 p-2 md:p-3">
              <img src={imagePreview} alt="Preview" className="h-12 w-12 rounded-lg object-cover md:h-16 md:w-16" />
              <button
                type="button"
                onClick={removeImage}
                className="ml-auto rounded-lg border border-rose-500/40 bg-rose-500/10 p-2 text-rose-400 transition hover:bg-rose-500/20"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
          <div className="flex gap-2 md:gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="flex items-center justify-center rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-slate-300 transition hover:border-indigo-400 disabled:cursor-not-allowed disabled:opacity-50 md:px-4"
            >
              <ImageIcon className="h-5 w-5" />
            </button>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => {
                setInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 400) + 'px';
                e.target.style.overflow = 'hidden';
              }}
              onInput={e => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 400) + 'px';
                e.target.style.overflow = 'hidden';
              }}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (!loading && (input.trim() || selectedImage)) {
                    handleSubmit(e);
                  }
                }
              }}
              placeholder="Mesajını yaz..."
              disabled={loading}
              rows={1}
              className="flex-1 resize-none rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:px-4"
              style={{ minHeight: 44, maxHeight: 400, overflow: 'hidden' }}
            />
            <button
              type="submit"
              disabled={loading || (!input.trim() && !selectedImage)}
              className="flex items-center justify-center gap-2 rounded-xl bg-indigo-500 p-3 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:bg-slate-700 md:px-5"
            >
              <Send className="h-5 w-5" />
              <span className="hidden md:inline">Gönder</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ChatPage
