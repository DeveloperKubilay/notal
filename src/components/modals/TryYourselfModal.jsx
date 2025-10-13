import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Loader, Shuffle, Sparkles, ClipboardPaste } from 'lucide-react'
import { useWorkspace } from '../../hooks/useWorkspace.js'
import { sendMessageToModel } from '../../lib/firebase.js'

const MotionOverlay = motion.div
const MotionPanel = motion.div

function TryYourselfModal() {
  const { tryYourselfOpen, setTryYourselfOpen, folders, notes } = useWorkspace()
  const [selectedFolderId, setSelectedFolderId] = useState('')
  const [currentNoteId, setCurrentNoteId] = useState('')
  const [askedNoteIds, setAskedNoteIds] = useState([])
  const [questionHistory, setQuestionHistory] = useState([])
  const [userAnswer, setUserAnswer] = useState('')
  const [checking, setChecking] = useState(false)
  const [feedback, setFeedback] = useState(null)

  useEffect(() => {
    if (!tryYourselfOpen) return
    setSelectedFolderId(folders[0]?.id || '')
    setCurrentNoteId('')
    setAskedNoteIds([])
    setQuestionHistory([])
    setUserAnswer('')
    setFeedback(null)
  }, [tryYourselfOpen, folders])

  const folderOptions = useMemo(() => folders.map((folder) => ({ value: folder.id, label: folder.name })), [folders])
  const availableNotes = useMemo(() => notes.filter((note) => note.folderId === selectedFolderId), [notes, selectedFolderId])
  const currentNote = useMemo(() => availableNotes.find((note) => note.id === currentNoteId) || null, [availableNotes, currentNoteId])

  const pickRandomNote = () => {
    if (availableNotes.length === 0) {
      setCurrentNoteId('')
      return
    }
    
    const unaskedNotes = availableNotes.filter((note) => !askedNoteIds.includes(note.id))
    
    let nextNote
    if (unaskedNotes.length === 0) {
      setAskedNoteIds([])
      nextNote = availableNotes[Math.floor(Math.random() * availableNotes.length)]
      setAskedNoteIds([nextNote.id])
    } else {
      nextNote = unaskedNotes[Math.floor(Math.random() * unaskedNotes.length)]
      setAskedNoteIds((prev) => [...prev, nextNote.id])
    }
    
    if (currentNoteId) {
      setQuestionHistory((prev) => [...prev, currentNoteId])
    }
    
    setCurrentNoteId(nextNote.id)
    setUserAnswer('')
    setFeedback(null)
  }

  const pasteAnswer = () => {
    if (currentNote) {
      setUserAnswer(currentNote.answer)
      setFeedback(null)
    }
  }

  const goBackToPreviousQuestion = () => {
    if (questionHistory.length === 0) {
      setCurrentNoteId('')
      setUserAnswer('')
      setFeedback(null)
      return
    }
    
    const previousNoteId = questionHistory[questionHistory.length - 1]
    setQuestionHistory((prev) => prev.slice(0, -1))
    setCurrentNoteId(previousNoteId)
    setUserAnswer('')
    setFeedback(null)
  }

  const checkAnswer = async () => {
    if (!currentNote) return
    setChecking(true)
    
    try {
      const prompt = `Soru: "${currentNote.question}"
Doğru Cevap: "${currentNote.answer}"
Kullanıcının Cevabı: "${userAnswer}"

Kullanıcının verdiği cevap doğru mu? Sadece "TRUE" veya "FALSE" yaz, başka bir şey yazma.`
      
      const response = await sendMessageToModel(prompt)
      const isCorrect = response.trim().toUpperCase().includes('TRUE')
      
      setFeedback(isCorrect ? 'Doğru' : 'Yanlış')
      
      if (isCorrect) {
        setTimeout(() => {
          const unaskedNotes = availableNotes.filter((note) => !askedNoteIds.includes(note.id) && note.id !== currentNoteId)
          
          if (unaskedNotes.length === 0 && askedNoteIds.length >= availableNotes.length - 1) {
            handleClose()
          } else {
            pickRandomNote()
          }
        }, 1000)
      }
    } catch (error) {
      console.error('AI cevap kontrolü başarısız', error)
      setFeedback('Kontrol edilemedi')
    } finally {
      setChecking(false)
    }
  }

  const handleClose = () => {
    setTryYourselfOpen(false)
    setCurrentNoteId('')
    setAskedNoteIds([])
    setFeedback(null)
    setUserAnswer('')
  }

  if (!tryYourselfOpen) return null

  return (
    <MotionOverlay
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur"
      onClick={handleClose}
    >
      <MotionPanel
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-950 p-8 text-slate-100 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-semibold text-white">Kendini Dene</h3>
            <p className="text-sm text-slate-400">Klasör seç, sorulara hızlıca yanıt ver.</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full border border-slate-800 px-3 py-1 text-xs uppercase tracking-wide text-slate-400 transition hover:border-slate-600"
          >
            Kapat
          </button>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-xs uppercase tracking-wide text-slate-400">
            Klasör
            <select
              value={selectedFolderId}
              onChange={(event) => {
                setSelectedFolderId(event.target.value)
                setCurrentNoteId('')
                setAskedNoteIds([])
                setQuestionHistory([])
                setFeedback(null)
              }}
              className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-indigo-400 focus:outline-none"
            >
              {folderOptions.map((option) => (
                <option key={option.value} value={option.value} className="bg-slate-900 text-white">
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={pickRandomNote}
            disabled={availableNotes.length === 0}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-500/50 bg-indigo-500/10 px-4 py-2 text-sm font-semibold text-indigo-200 transition hover:bg-indigo-500/20 disabled:cursor-not-allowed disabled:border-slate-700 disabled:text-slate-500"
          >
            <Shuffle className="h-4 w-4" />
            Rastgele Soru
          </button>
        </div>
        <div className="mt-6 space-y-4">
          {currentNote ? (
            <>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                <span className="text-xs uppercase tracking-wide text-slate-500">Soru</span>
                <p className="mt-2 text-base text-white">{currentNote.question}</p>
              </div>
              <textarea
                value={userAnswer}
                onChange={(event) => setUserAnswer(event.target.value)}
                placeholder="Cevabını yaz"
                className="h-24 w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-400 focus:outline-none"
              />
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={checkAnswer}
                  disabled={checking || !userAnswer.trim()}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/50 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:border-slate-700 disabled:text-slate-500"
                >
                  {checking ? <Loader className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  Cevabı Kontrol Et
                </button>
                <button
                  type="button"
                  onClick={pasteAnswer}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-amber-500/50 bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-200 transition hover:bg-amber-500/20"
                >
                  <ClipboardPaste className="h-4 w-4" />
                  Cevabı Yapıştır
                </button>
                <button
                  type="button"
                  onClick={pickRandomNote}
                  disabled={availableNotes.length === 0}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-500/50 bg-indigo-500/10 px-4 py-2 text-sm font-semibold text-indigo-200 transition hover:bg-indigo-500/20 disabled:cursor-not-allowed disabled:border-slate-700 disabled:text-slate-500"
                >
                  <Shuffle className="h-4 w-4" />
                  Yeni Soru Getir
                </button>
              </div>
              <div className="flex items-center justify-between">
                {feedback && (
                  <span className={`text-sm font-semibold ${
                    feedback === 'Doğru' ? 'text-emerald-400' : 
                    feedback === 'Yanlış' ? 'text-rose-400' : 
                    'text-amber-400'
                  }`}>
                    {feedback}
                  </span>
                )}
                <button
                  type="button"
                  onClick={goBackToPreviousQuestion}
                  className="ml-auto text-xs text-slate-500 underline-offset-2 hover:underline"
                >
                  Önceki soruya dön
                </button>
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-6 text-center text-sm text-slate-400">
              Klasörden rastgele soru seçmek için butona bas.
            </div>
          )}
        </div>
      </MotionPanel>
    </MotionOverlay>
  )
}

export default TryYourselfModal
