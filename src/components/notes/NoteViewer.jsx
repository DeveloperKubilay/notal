import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Loader2, Sparkles, ShieldQuestion, Upload } from 'lucide-react'
import { useWorkspace } from '../../hooks/useWorkspace.js'

const MotionSection = motion.section

const containerVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
}

function NoteViewer() {
  const {
    activeNote,
    revealAll,
    updateNoteVisibility,
    rightPanel,
    closeRightPanel,
    createFolder,
    createNote,
    folderTree,
    activeFolderId,
  } = useWorkspace()
  const [folderName, setFolderName] = useState('')
  const [folderParentId, setFolderParentId] = useState(null)
  const [noteQuestion, setNoteQuestion] = useState('')
  const [noteAnswer, setNoteAnswer] = useState('')
  const [noteFile, setNoteFile] = useState(null)
  const [noteParentId, setNoteParentId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [optimisticHidden, setOptimisticHidden] = useState(null)

  const isFolderForm = rightPanel.type === 'folder-form'
  const isNoteForm = rightPanel.type === 'note-form'

  useEffect(() => {
    if (isFolderForm) {
      setFolderName('')
      setFolderParentId(rightPanel.payload?.parentId ?? activeFolderId ?? null)
      setSaving(false)
    } else if (isNoteForm) {
      setNoteQuestion('')
      setNoteAnswer('')
      setNoteFile(null)
      setNoteParentId(rightPanel.payload?.folderId ?? activeFolderId ?? null)
      setSaving(false)
    }
  }, [isFolderForm, isNoteForm, rightPanel, activeFolderId])

  const folderOptions = useMemo(() => {
    const options = [{ id: null, label: 'Kök klasör' }]
    const traverse = (nodes, depth = 0) => {
      nodes.forEach((node) => {
        const prefix = depth > 0 ? `${'-- '.repeat(depth)}` : ''
        options.push({ id: node.id, label: `${prefix}${node.name}` })
        if (node.children && node.children.length > 0) traverse(node.children, depth + 1)
      })
    }
    traverse(folderTree)
    return options
  }, [folderTree])

  const handleFolderSubmit = async (event) => {
    event.preventDefault()
    if (!folderName.trim()) return
    setSaving(true)
    try {
      await createFolder({ name: folderName.trim(), parentId: folderParentId })
    } finally {
      setSaving(false)
    }
  }

  const handleNoteSubmit = async (event) => {
    event.preventDefault()
    if (!noteQuestion.trim() || !noteAnswer.trim() || !noteParentId) return
    setSaving(true)
    try {
      await createNote({
        folderId: noteParentId,
        question: noteQuestion.trim(),
        answer: noteAnswer.trim(),
        attachment: noteFile,
      })
    } finally {
      setSaving(false)
    }
  }

  if (isFolderForm) {
    return (
      <MotionSection
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex h-full w-full flex-1 flex-col gap-6 rounded-3xl border border-slate-800 bg-slate-950/80 p-10 text-slate-100 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-lg font-semibold text-slate-50">Yeni Klasör</span>
            <span className="text-xs text-slate-500">Klasörünü içerik alanında oluştur</span>
          </div>
          <button
            type="button"
            onClick={closeRightPanel}
            className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:border-slate-500"
          >
            Vazgeç
          </button>
        </div>
        <form onSubmit={handleFolderSubmit} className="flex flex-1 flex-col gap-4">
          <input
            value={folderName}
            onChange={(event) => setFolderName(event.target.value)}
            placeholder="Klasör adı"
            className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-400 focus:outline-none"
          />
          <select
            value={folderParentId ?? ''}
            onChange={(event) => setFolderParentId(event.target.value || null)}
            className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-100 focus:border-indigo-400 focus:outline-none"
          >
            {folderOptions.map((option) => (
              <option key={option.id ?? 'root'} value={option.id ?? ''}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="mt-auto flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-xl bg-indigo-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:bg-slate-700"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Kaydet'}
            </button>
            <button
              type="button"
              onClick={closeRightPanel}
              className="flex-1 rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:border-slate-500"
            >
              İptal
            </button>
          </div>
        </form>
      </MotionSection>
    )
  }

  if (isNoteForm) {
    return (
      <MotionSection
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex h-full w-full flex-1 flex-col gap-6 rounded-3xl border border-slate-800 bg-slate-950/80 p-10 text-slate-100 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-lg font-semibold text-slate-50">Yeni Not</span>
            <span className="text-xs text-slate-500">Sorunu ve cevabını buradan ekle</span>
          </div>
          <button
            type="button"
            onClick={closeRightPanel}
            className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:border-slate-500"
          >
            Vazgeç
          </button>
        </div>
        <form onSubmit={handleNoteSubmit} className="flex flex-1 flex-col gap-4">
          <select
            value={noteParentId ?? ''}
            onChange={(event) => setNoteParentId(event.target.value || null)}
            className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-100 focus:border-indigo-400 focus:outline-none"
          >
            {folderOptions.map((option) => (
              <option key={option.id ?? 'root'} value={option.id ?? ''}>
                {option.label}
              </option>
            ))}
          </select>
          <textarea
            value={noteQuestion}
            onChange={(event) => setNoteQuestion(event.target.value)}
            placeholder="Soru"
            className="h-24 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-400 focus:outline-none"
          />
          <textarea
            value={noteAnswer}
            onChange={(event) => setNoteAnswer(event.target.value)}
            placeholder="Cevap"
            className="h-40 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-400 focus:outline-none"
          />
          <label className="flex cursor-pointer items-center justify-between gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-300 hover:border-indigo-400">
            <span>{noteFile ? noteFile.name : 'Dosya ekle'}</span>
            <Upload className="h-4 w-4" />
            <input
              type="file"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files && event.target.files[0] ? event.target.files[0] : null
                setNoteFile(file)
              }}
            />
          </label>
          <div className="mt-auto flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-700"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Kaydet'}
            </button>
            <button
              type="button"
              onClick={closeRightPanel}
              className="flex-1 rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:border-slate-500"
            >
              İptal
            </button>
          </div>
        </form>
      </MotionSection>
    )
  }

  if (!activeNote) {
    return (
  <div className="flex h-full min-h-full w-full flex-1 flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-slate-800 bg-slate-950/40 px-6 text-center text-slate-500">
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
  className="flex h-full w-full flex-1 flex-col gap-8 rounded-3xl border border-slate-800 bg-slate-950/80 p-10 text-slate-100 shadow-2xl"
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
