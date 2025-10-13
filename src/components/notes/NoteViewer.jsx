import { useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Sparkles, ShieldQuestion } from 'lucide-react'
import { useWorkspace } from '../../hooks/useWorkspace.js'

const MotionSection = motion.section

const containerVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
}

function NoteViewer() {
  const { activeNote, revealAll, updateNoteVisibility } = useWorkspace()
  const [optimisticHidden, setOptimisticHidden] = useState(null)

  if (!activeNote) {
    return (
      <div className="flex h-full flex-1 flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-slate-800 bg-slate-950/40 text-center text-slate-500">
        <ShieldQuestion className="h-10 w-10 text-slate-600" />
        <p className="text-sm">Soldan bir soru seç veya yeni bir not oluştur.</p>
      </div>
    )
  }

  const currentHidden = optimisticHidden ?? activeNote.hidden ?? true
  const showAnswer = revealAll || currentHidden === false

  const toggleHidden = async () => {
    const nextHidden = !currentHidden
    setOptimisticHidden(nextHidden)
    try {
      await updateNoteVisibility({ noteId: activeNote.id, hidden: nextHidden })
    } catch (error) {
      console.error('Not güncellenemedi', error)
    } finally {
      setOptimisticHidden(null)
    }
  }

  return (
    <MotionSection
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex h-full flex-1 flex-col gap-8 rounded-3xl border border-slate-800 bg-slate-950/80 p-10 text-slate-100 shadow-2xl"
    >
      <div className="space-y-3">
        <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/40 bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-200">
          <Sparkles className="h-4 w-4" />
          Soru
        </span>
        <h2 className="text-3xl font-semibold leading-tight text-white">{activeNote.question}</h2>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold uppercase tracking-wide text-slate-400">Cevap</span>
          <button
            type="button"
            onClick={toggleHidden}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:border-indigo-400"
          >
            {showAnswer ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showAnswer ? 'Sansürle' : 'Göster'}
          </button>
        </div>
        <div
          className={`min-h-[180px] rounded-2xl border border-slate-800 bg-slate-900/80 p-6 text-lg leading-relaxed tracking-wide ${
            showAnswer ? 'text-slate-100' : 'blur-sm text-slate-600'
          }`}
        >
          {activeNote.answer}
        </div>
      </div>
    </MotionSection>
  )
}

export default NoteViewer
