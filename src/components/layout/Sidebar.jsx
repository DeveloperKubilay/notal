import { useState } from 'react'
import { Folder, FolderPlus, FilePlus2 } from 'lucide-react'
import { useWorkspace } from '../../hooks/useWorkspace.js'

function Sidebar() {
  const {
    folders,
    folderNotes,
    createFolder,
    createNote,
    activeFolderId,
    setActiveFolderId,
    setActiveNoteId,
  } = useWorkspace()
  const [folderFormOpen, setFolderFormOpen] = useState(false)
  const [folderName, setFolderName] = useState('')
  const [noteFormOpen, setNoteFormOpen] = useState(false)
  const [noteQuestion, setNoteQuestion] = useState('')
  const [noteAnswer, setNoteAnswer] = useState('')

  const handleCreateFolder = async (event) => {
    event.preventDefault()
    if (!folderName.trim()) return
    await createFolder({ name: folderName.trim() })
    setFolderName('')
    setFolderFormOpen(false)
  }

  const handleCreateNote = async (event) => {
    event.preventDefault()
    if (!noteQuestion.trim() || !noteAnswer.trim()) return
    await createNote({
      folderId: activeFolderId,
      question: noteQuestion.trim(),
      answer: noteAnswer.trim(),
    })
    setNoteQuestion('')
    setNoteAnswer('')
    setNoteFormOpen(false)
  }

  return (
    <aside className="flex h-full w-72 flex-col border-r border-slate-800 bg-slate-950/60">
      <div className="flex items-center justify-between px-4 py-4">
        <span className="text-sm font-semibold uppercase tracking-wide text-slate-400">Klasörler</span>
        <button
          type="button"
          onClick={() => setFolderFormOpen((prev) => !prev)}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-800 px-3 py-1 text-xs font-semibold text-slate-200 transition hover:border-indigo-400"
        >
          <FolderPlus className="h-4 w-4" />
          Yeni
        </button>
      </div>
      {folderFormOpen && (
        <form onSubmit={handleCreateFolder} className="space-y-2 px-4 pb-4">
          <input
            value={folderName}
            onChange={(event) => setFolderName(event.target.value)}
            placeholder="Klasör adı"
            className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-400 focus:outline-none"
          />
          <div className="flex gap-2">
            <button className="flex-1 rounded-xl bg-indigo-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-400" type="submit">
              Kaydet
            </button>
            <button
              type="button"
              onClick={() => setFolderFormOpen(false)}
              className="flex-1 rounded-xl border border-slate-800 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-slate-600"
            >
              Vazgeç
            </button>
          </div>
        </form>
      )}
      <nav className="flex-1 space-y-1 overflow-y-auto px-2">
        {folders.map((folder) => (
          <button
            key={folder.id}
            type="button"
            onClick={() => setActiveFolderId(folder.id)}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
              folder.id === activeFolderId
                ? 'bg-indigo-500/20 text-indigo-200'
                : 'text-slate-300 hover:bg-slate-900/80'
            }`}
          >
            <Folder className="h-4 w-4" />
            <span className="truncate">{folder.name}</span>
          </button>
        ))}
      </nav>
      <div className="border-t border-slate-800 px-4 py-4">
        <button
          type="button"
          disabled={!activeFolderId}
          onClick={() => setNoteFormOpen((prev) => !prev)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-500/50 bg-indigo-500/10 px-3 py-2 text-sm font-semibold text-indigo-200 transition hover:bg-indigo-500/20 disabled:cursor-not-allowed disabled:border-slate-800 disabled:text-slate-500"
        >
          <FilePlus2 className="h-4 w-4" />
          Yeni Not
        </button>
        {noteFormOpen && (
          <form onSubmit={handleCreateNote} className="mt-3 space-y-2">
            <textarea
              value={noteQuestion}
              onChange={(event) => setNoteQuestion(event.target.value)}
              placeholder="Soru"
              className="h-16 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-400 focus:outline-none"
            />
            <textarea
              value={noteAnswer}
              onChange={(event) => setNoteAnswer(event.target.value)}
              placeholder="Cevap"
              className="h-20 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-400 focus:outline-none"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 rounded-xl bg-emerald-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-400"
              >
                Kaydet
              </button>
              <button
                type="button"
                onClick={() => setNoteFormOpen(false)}
                className="flex-1 rounded-xl border border-slate-800 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-slate-600"
              >
                Vazgeç
              </button>
            </div>
          </form>
        )}
      </div>
      <div className="border-t border-slate-800 px-2 py-2">
        <div className="max-h-48 space-y-1 overflow-y-auto">
          {folderNotes.map((note) => (
            <button
              key={note.id}
              type="button"
              onClick={() => setActiveNoteId(note.id)}
              className="w-full rounded-xl px-3 py-2 text-left text-xs text-slate-300 transition hover:bg-slate-900/80"
            >
              {note.question}
            </button>
          ))}
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
