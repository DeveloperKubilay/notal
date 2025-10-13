import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, m } from 'framer-motion'
import { Loader2, Send, X } from 'lucide-react'
import { useWorkspace } from '../../hooks/useWorkspace.js'
import { sendMessageToModel } from '../../lib/firebase.js'

const drawerVariants = {
  hidden: { x: 48, opacity: 0 },
  visible: { x: 0, opacity: 1 },
  exit: { x: 48, opacity: 0 },
}

const MotionAside = m.aside
const MotionDiv = m.div

function AiDrawer() {
  const { aiDrawerOpen, setAiDrawerOpen, activeNote } = useWorkspace()
  const [messages, setMessages] = useState(() => [
    {
      id: 'assistant-intro',
      role: 'assistant',
      text: 'Merhaba, ben sana notlarının üstünden geçmende yardım edebilirim. Bana soru sorun veya özet isteyin.',
    },
  ])
  const [prompt, setPrompt] = useState('')
  const [sending, setSending] = useState(false)
  const listRef = useRef(null)
  const inputRef = useRef(null)

  const handleClose = useCallback(() => {
    setAiDrawerOpen(false)
  }, [setAiDrawerOpen])

  useEffect(() => {
    if (aiDrawerOpen && inputRef.current) inputRef.current.focus()
    if (!aiDrawerOpen) {
      setPrompt('')
      setSending(false)
    }
  }, [aiDrawerOpen])

  useEffect(() => {
    if (!aiDrawerOpen) return undefined
    const handleKey = (event) => {
      if (event.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [aiDrawerOpen, handleClose])

  useEffect(() => {
    if (!listRef.current) return
    listRef.current.scrollTop = listRef.current.scrollHeight
  }, [messages, aiDrawerOpen])

  const noteSummary = useMemo(() => {
    if (!activeNote) return ''
    const base = `Soru: ${activeNote.question}\nCevap: ${activeNote.answer}`
    if (activeNote.attachments && activeNote.attachments.length > 0) {
      const names = activeNote.attachments.map((item) => item.name).join(', ')
      return `${base}\nEkler: ${names}`
    }
    return base
  }, [activeNote])

  const handleSend = async () => {
    if (!prompt.trim()) return
    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: prompt.trim(),
    }
    setMessages((prev) => [...prev, userMessage])
    setPrompt('')
    setSending(true)
    try {
      const history = messages
        .concat(userMessage)
        .map((item) => `${item.role === 'user' ? 'Kullanıcı' : 'Asistan'}: ${item.text}`)
        .join('\n')
      const contextInstruction = noteSummary
        ? `Not bağlamı:\n${noteSummary}\n\n`
        : ''
      const payload = `${contextInstruction}Sohbet geçmişi:\n${history}\n\nYeni kullanıcı girdisi: ${userMessage.text}\nYanıtı Türkçe, yardımcı ve kısa ver.`
      const response = await sendMessageToModel(payload)
      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        text: response,
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-error-${Date.now()}`,
          role: 'assistant',
          text: 'Şu an cevap veremiyorum. Birazdan tekrar dene.',
        },
      ])
    } finally {
      setSending(false)
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!sending) handleSend()
  }

  return (
    <AnimatePresence>
      {aiDrawerOpen && (
        <>
          <MotionDiv
            className="absolute inset-0 z-20 bg-slate-950/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
          />
          <MotionAside
            className="absolute inset-y-0 right-0 z-30 flex h-full w-[24rem] max-w-[24rem] flex-col rounded-3xl border border-slate-800 bg-slate-950/90 p-5 shadow-2xl"
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: 'spring', stiffness: 200, damping: 24 }}
          >
            <header className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-100">AI Asistan</span>
                <span className="text-xs text-slate-500">Notlarına göre hızlı cevaplar al</span>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-xl border border-slate-700 p-2 text-slate-400 transition hover:border-slate-500 hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </header>
            <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto py-4 pr-2">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm leading-5 ${
                      message.role === 'user'
                        ? 'bg-indigo-500 text-white'
                        : 'bg-slate-900 text-slate-200'
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
              {sending && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm text-slate-300">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Yazıyor...
                  </div>
                </div>
              )}
            </div>
            <form onSubmit={handleSubmit} className="border-t border-slate-800 pt-4">
              <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900 px-3 py-2">
                <textarea
                  ref={inputRef}
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  placeholder="Bir soru yaz"
                  rows={1}
                  className="h-12 flex-1 resize-none bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault()
                      if (!sending) handleSend()
                    }
                  }}
                />
                <button
                  type="submit"
                  disabled={sending}
                  className="rounded-xl bg-indigo-500 p-3 text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:bg-slate-700"
                >
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
              </div>
            </form>
          </MotionAside>
        </>
      )}
    </AnimatePresence>
  )
}

export default AiDrawer
