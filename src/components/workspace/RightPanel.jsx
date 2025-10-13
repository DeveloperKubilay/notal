import { useEffect, useMemo, useState } from 'react'
import { Loader2, Upload } from 'lucide-react'
import { m, AnimatePresence } from 'framer-motion'
import { useWorkspace } from '../../hooks/useWorkspace.js'

const panelVariants = {
  hidden: { x: 40, opacity: 0 },
  visible: { x: 0, opacity: 1 },
  exit: { x: 40, opacity: 0 },
}

const MotionAside = m.aside

function RightPanel() {
  const {
    rightPanel,
    closeRightPanel,
    createFolder,
    createNote,
    activeFolderId,
    folderTree,
  } = useWorkspace()
  const [folderName, setFolderName] = useState('')
  const [parentId, setParentId] = useState(null)
  const [noteQuestion, setNoteQuestion] = useState('')
  const [noteAnswer, setNoteAnswer] = useState('')
  const [noteFile, setNoteFile] = useState(null)
  const [saving, setSaving] = useState(false)

  const isFolderForm = rightPanel.type === 'folder-form'
  const isNoteForm = rightPanel.type === 'note-form'

  useEffect(() => {
    if (isFolderForm) {
      setFolderName('')
      setParentId(rightPanel.payload?.parentId ?? activeFolderId ?? null)
      setSaving(false)
    } else if (isNoteForm) {
      setNoteQuestion('')
      setNoteAnswer('')
      setNoteFile(null)
      setParentId(rightPanel.payload?.folderId ?? activeFolderId ?? null)
      setSaving(false)
    }
  }, [rightPanel, isFolderForm, isNoteForm, activeFolderId])

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
      await createFolder({ name: folderName.trim(), parentId })
    } finally {
      setSaving(false)
    }
  }

  const handleNoteSubmit = async (event) => {
    event.preventDefault()
    if (!noteQuestion.trim() || !noteAnswer.trim() || !parentId) return
    setSaving(true)
    try {
      await createNote({
        folderId: parentId,
        question: noteQuestion.trim(),
        answer: noteAnswer.trim(),
        attachment: noteFile,
      })
    } finally {
      setSaving(false)
    }
  }

  if (!isFolderForm && !isNoteForm) return null

  return (
    <AnimatePresence>
      {(isFolderForm || isNoteForm) && (
        <MotionAside
          className="flex h-full min-w-[20rem] max-w-[20rem] flex-col gap-5 rounded-3xl border border-slate-800 bg-slate-950/80 p-5 shadow-2xl"
          variants={panelVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ type: 'spring', stiffness: 220, damping: 26 }}
        >
          <header className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-100">
                {isFolderForm ? 'Yeni Klasör' : 'Yeni Not'}
              </span>
              <span className="text-xs text-slate-500">Sağ panel genel amaçlı form alanı</span>
            </div>
            <button
              type="button"
              onClick={closeRightPanel}
              className="rounded-xl border border-slate-700 px-3 py-1 text-xs text-slate-400 transition hover:border-slate-500 hover:text-slate-200"
            >
              Kapat
            </button>
          </header>

          {isFolderForm && (
            <form onSubmit={handleFolderSubmit} className="flex flex-1 flex-col gap-3">
              <input
                value={folderName}
                onChange={(event) => setFolderName(event.target.value)}
                placeholder="Klasör adı"
                className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-400 focus:outline-none"
              />
              <select
                value={parentId ?? ''}
                onChange={(event) => setParentId(event.target.value || null)}
                className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-indigo-400 focus:outline-none"
              >
                {folderOptions.map((option) => (
                  <option key={option.id ?? 'root'} value={option.id ?? ''}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="mt-auto flex gap-2">
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
                  Vazgeç
                </button>
              </div>
            </form>
          )}

          {isNoteForm && (
            <form onSubmit={handleNoteSubmit} className="flex flex-1 flex-col gap-3">
              <select
                value={parentId ?? ''}
                onChange={(event) => setParentId(event.target.value || null)}
                className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-indigo-400 focus:outline-none"
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
                className="h-20 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-400 focus:outline-none"
              />
              <textarea
                value={noteAnswer}
                onChange={(event) => setNoteAnswer(event.target.value)}
                placeholder="Cevap"
                className="h-28 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-400 focus:outline-none"
              />
              <label className="flex cursor-pointer items-center justify-between gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-300 hover:border-indigo-400">
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
              <div className="mt-auto flex gap-2">
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
                  Vazgeç
                </button>
              </div>
            </form>
          )}
        </MotionAside>
      )}
    </AnimatePresence>
  )
}

export default RightPanel
