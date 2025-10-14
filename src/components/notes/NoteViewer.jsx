import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Loader2, Sparkles, ShieldQuestion, Upload, FileText, Image as ImageIcon, Pencil, Trash2 } from 'lucide-react'
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
    updateNote,
    deleteNote,
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
  const [noteFiles, setNoteFiles] = useState([])
  const [noteParentId, setNoteParentId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [localHidden, setLocalHidden] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [editQuestion, setEditQuestion] = useState('')
  const [editAnswer, setEditAnswer] = useState('')
  const [editFiles, setEditFiles] = useState([])
  const [existingAttachments, setExistingAttachments] = useState([])

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
      setNoteFiles([])
      setNoteParentId(rightPanel.payload?.folderId ?? activeFolderId ?? null)
      setSaving(false)
    }
  }, [isFolderForm, isNoteForm, rightPanel, activeFolderId])

  useEffect(() => {
    if (activeNote && !editMode) {
      setEditQuestion(activeNote.question || '')
      setEditAnswer(activeNote.answer || '')
      setExistingAttachments(activeNote.attachments || [])
      setEditFiles([])
    }
  }, [activeNote, editMode])

  useEffect(() => {
    setLocalHidden(true)
  }, [activeNote?.id])

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
        attachments: noteFiles,
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
        className="flex h-full w-full flex-1 flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-slate-100 shadow-2xl md:gap-6 md:rounded-3xl md:p-10"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col">
            <span className="text-base font-semibold text-slate-50 md:text-lg">Yeni Klasör</span>
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
        className="flex h-full w-full flex-1 flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-slate-100 shadow-2xl md:gap-6 md:rounded-3xl md:p-10"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col">
            <span className="text-base font-semibold text-slate-50 md:text-lg">Yeni Not</span>
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
            <span>{noteFiles.length > 0 ? `${noteFiles.length} dosya seçildi` : 'Dosya ekle'}</span>
            <Upload className="h-4 w-4" />
            <input
              type="file"
              multiple
              className="hidden"
              onChange={(event) => {
                const files = event.target.files ? Array.from(event.target.files) : []
                setNoteFiles(files)
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
  <div className="flex h-full min-h-full w-full flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 px-4 text-center text-slate-500 md:rounded-3xl md:px-6">
        <ShieldQuestion className="h-8 w-8 text-slate-600 md:h-10 md:w-10" />
        <p className="text-xs md:text-sm">Soldan bir soru seç veya yeni bir not oluştur.</p>
      </div>
    )
  }

  const showAnswer = revealAll || !localHidden

  const toggleHidden = () => {
    setLocalHidden(!localHidden)
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (!editQuestion.trim() || !editAnswer.trim()) return
    setSaving(true)
    try {
      const originalAttachments = activeNote.attachments || []
      const removedAttachments = originalAttachments.filter(
        orig => !existingAttachments.some(existing => existing.url === orig.url)
      )
      
      await updateNote({
        noteId: activeNote.id,
        question: editQuestion.trim(),
        answer: editAnswer.trim(),
        newAttachments: editFiles,
        existingAttachments,
        removedAttachments,
      })
      setEditMode(false)
    } catch (error) {
      console.error('Not güncellenemedi', error)
    } finally {
      setSaving(false)
    }
  }

  const removeExistingAttachment = (index) => {
    setExistingAttachments(existingAttachments.filter((_, i) => i !== index))
  }

  const handleDelete = async () => {
    if (!window.confirm('Bu notu silmek istediğinden emin misin? Bu işlem geri alınamaz.')) {
      return
    }
    
    setSaving(true)
    try {
      await deleteNote({ noteId: activeNote.id })
      closeRightPanel()
    } catch (error) {
      console.error('Not silinemedi', error)
      alert('Not silinirken bir hata oluştu.')
    } finally {
      setSaving(false)
    }
  }

  if (editMode) {
    return (
      <MotionSection
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex h-full w-full flex-1 flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-slate-100 shadow-2xl md:gap-6 md:rounded-3xl md:p-10"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col">
            <span className="text-base font-semibold text-slate-50 md:text-lg">Not Düzenle</span>
            <span className="text-xs text-slate-500">Soru, cevap ve ekleri güncelle</span>
          </div>
          <button
            type="button"
            onClick={() => setEditMode(false)}
            className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:border-slate-500"
          >
            İptal
          </button>
        </div>
        <form onSubmit={handleEditSubmit} className="flex flex-1 flex-col gap-4 overflow-y-auto">
          <textarea
            value={editQuestion}
            onChange={(e) => setEditQuestion(e.target.value)}
            placeholder="Soru"
            className="h-24 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-400 focus:outline-none"
          />
          <textarea
            value={editAnswer}
            onChange={(e) => setEditAnswer(e.target.value)}
            placeholder="Cevap"
            className="h-40 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-400 focus:outline-none"
          />
          
          {existingAttachments.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Mevcut Ekler</span>
              <div className="space-y-2">
                {existingAttachments.map((attachment, index) => {
                  const isImage = attachment.contentType?.startsWith('image/')
                  return (
                    <div key={index} className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 p-3">
                      {isImage ? (
                        <img src={attachment.url} alt={attachment.name} className="h-12 w-12 rounded-lg object-cover" />
                      ) : (
                        <FileText className="h-8 w-8 text-slate-400" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-300 truncate">{attachment.name}</p>
                        {attachment.size && (
                          <p className="text-xs text-slate-500">{(attachment.size / 1024).toFixed(1)} KB</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeExistingAttachment(index)}
                        className="rounded-lg border border-red-500/40 bg-red-500/10 p-2 text-red-400 transition hover:bg-red-500/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          
          <label className="flex cursor-pointer items-center justify-between gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-300 hover:border-indigo-400">
            <span>{editFiles.length > 0 ? `${editFiles.length} yeni dosya seçildi` : 'Yeni dosya ekle'}</span>
            <Upload className="h-4 w-4" />
            <input
              type="file"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = e.target.files ? Array.from(e.target.files) : []
                setEditFiles(files)
              }}
            />
          </label>
          
          <div className="mt-auto flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-xl bg-indigo-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:bg-slate-700"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Güncelle'}
            </button>
            <button
              type="button"
              onClick={() => setEditMode(false)}
              className="flex-1 rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:border-slate-500"
            >
              İptal
            </button>
          </div>
        </form>
      </MotionSection>
    )
  }

  return (
    <MotionSection
      variants={containerVariants}
      initial="hidden"
      animate="visible"
  className="flex h-full w-full flex-1 flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-slate-100 shadow-2xl overflow-y-auto md:gap-8 md:rounded-3xl md:p-10"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1 space-y-2 md:space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/40 bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-200">
            <Sparkles className="h-3 w-3 md:h-4 md:w-4" />
            Soru
          </span>
          <h2 className="text-xl font-semibold leading-tight text-white md:text-3xl">{activeNote.question}</h2>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setEditMode(true)}
            disabled={!activeNote.answer}
            className="rounded-xl border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-indigo-400 hover:text-indigo-300 flex items-center gap-2 md:px-4 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Pencil className="h-4 w-4" />
            <span className="hidden sm:inline">Düzenle</span>
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={saving}
            className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-50 flex items-center gap-2 md:px-4"
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">Sil</span>
          </button>
        </div>
      </div>
      
      {!activeNote.answer ? (
        <div className="flex-1 flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
            <p className="text-sm text-slate-400">İçerik yükleniyor...</p>
          </div>
        </div>
      ) : (
        <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold uppercase tracking-wide text-slate-400">Cevap</span>
          <button
            type="button"
            onClick={toggleHidden}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:border-indigo-400"
          >
            {showAnswer ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showAnswer ? 'Gizle' : 'Göster'}
          </button>
        </div>
        <div
          className={`min-h-[120px] rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-base leading-relaxed tracking-wide md:min-h-[180px] md:p-6 md:text-lg ${
            showAnswer ? 'text-slate-100' : 'blur-sm text-slate-600'
          }`}
        >
          {activeNote.answer}
        </div>
        
        {activeNote.attachments && activeNote.attachments.length > 0 && (
          <div className="space-y-3">
            <span className="text-sm font-semibold uppercase tracking-wide text-slate-400">Ekler</span>
            <div className="space-y-4">
              {activeNote.attachments.map((attachment, index) => {
                const isImage = attachment.contentType?.startsWith('image/')
                return (
                  <a
                    key={index}
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative block overflow-hidden rounded-xl border border-slate-800 bg-slate-900/80 transition hover:border-indigo-400"
                  >
                    {isImage ? (
                      <div className={`relative ${showAnswer ? '' : 'blur-sm'}`}>
                        <img
                          src={attachment.url}
                          alt={attachment.name}
                          className="w-full object-contain max-h-64 md:max-h-96"
                        />
                      </div>
                    ) : (
                      <div className={`flex flex-col items-center justify-center gap-3 p-6 md:p-8 ${showAnswer ? '' : 'blur-sm'}`}>
                        <FileText className="h-12 w-12 text-slate-400 md:h-16 md:w-16" />
                        <span className="text-center text-xs text-slate-300 md:text-sm">{attachment.name}</span>
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 to-transparent p-3">
                      <p className="text-sm text-slate-300 truncate">{attachment.name}</p>
                      {attachment.size && (
                        <p className="text-xs text-slate-500">
                          {(attachment.size / 1024).toFixed(1)} KB
                        </p>
                      )}
                    </div>
                  </a>
                )
              })}
            </div>
          </div>
        )}
      </div>
        </>
      )}
    </MotionSection>
  )
}

export default NoteViewer
