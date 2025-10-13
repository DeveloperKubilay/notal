import { useEffect, useState } from 'react'
import { ChevronDown, ChevronRight, FileText, Folder, FolderPlus, Upload, Trash2, X } from 'lucide-react'
import { useWorkspace } from '../../hooks/useWorkspace.js'

function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const {
    folderTree,
    folderNotes,
    activeFolderId,
    activeNoteId,
    setActiveFolderId,
    setActiveNoteId,
    openFolderForm,
    openNoteForm,
    deleteFolder,
  } = useWorkspace()
  const [expandedFolders, setExpandedFolders] = useState(new Set())
  const [contextMenu, setContextMenu] = useState({ open: false, x: 0, y: 0, folderId: null })

  useEffect(() => {
    if (!folderTree || folderTree.length === 0) return
    setExpandedFolders((prev) => {
      if (prev.size > 0) return prev
      const next = new Set()
      const collect = (nodes) => {
        nodes.forEach((node) => {
          next.add(node.id)
          if (node.children && node.children.length > 0) collect(node.children)
        })
      }
      collect(folderTree)
      return next
    })
  }, [folderTree])

  useEffect(() => {
    if (!contextMenu.open) return undefined
    const handleClick = () => closeContextMenu()
    const handleKey = (event) => {
      if (event.key === 'Escape') closeContextMenu()
    }
    window.addEventListener('click', handleClick)
    window.addEventListener('keydown', handleKey)
    return () => {
      window.removeEventListener('click', handleClick)
      window.removeEventListener('keydown', handleKey)
    }
  }, [contextMenu.open])

  const closeContextMenu = () => {
    setContextMenu({ open: false, x: 0, y: 0, folderId: null })
  }

  const handleContextMenu = (event, folderId) => {
    event.preventDefault()
    const menuWidth = 220
    const menuHeight = 120
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const nextX = Math.min(event.clientX, viewportWidth - menuWidth - 12)
    const nextY = Math.min(event.clientY, viewportHeight - menuHeight - 12)
    setContextMenu({ open: true, x: nextX, y: nextY, folderId })
  }

  const toggleFolder = (folderId) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev)
      if (next.has(folderId)) next.delete(folderId)
      else next.add(folderId)
      return next
    })
  }

  const renderFolderTree = (nodes, depth = 0) =>
    nodes.map((node) => {
      const isActive = node.id === activeFolderId
      const hasChildren = node.children && node.children.length > 0
      const isExpanded = expandedFolders.has(node.id)
      return (
        <div key={node.id} className="flex flex-col">
          <button
            type="button"
            onClick={() => setActiveFolderId(node.id)}
            onContextMenu={(event) => handleContextMenu(event, node.id)}
            className={`group flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition ${
              isActive ? 'bg-indigo-500/20 text-indigo-200' : 'text-slate-300 hover:bg-slate-900/80'
            }`}
            style={{ paddingLeft: 12 + depth * 16 }}
          >
            <span
              role="button"
              tabIndex={0}
              onClick={(event) => {
                event.stopPropagation()
                if (hasChildren) toggleFolder(node.id)
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  event.stopPropagation()
                  if (hasChildren) toggleFolder(node.id)
                }
              }}
              className={`flex h-7 w-7 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/70 text-slate-400 transition ${
                hasChildren ? 'group-hover:border-indigo-400 group-hover:text-indigo-200' : ''
              }`}
            >
              {hasChildren ? (
                isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
              ) : (
                <Folder className="h-4 w-4" />
              )}
            </span>
            <span className="flex-1 truncate text-left">{node.name}</span>
          </button>
          {hasChildren && isExpanded && (
            <div className="flex flex-col">{renderFolderTree(node.children, depth + 1)}</div>
          )}
        </div>
      )
    })

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-800 bg-slate-950/95 backdrop-blur transition-transform duration-300 lg:static lg:z-0 lg:bg-slate-950/60 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3 lg:border-0 lg:py-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold uppercase tracking-wide text-slate-400">Klasörler</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => openFolderForm({ parentId: activeFolderId })}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-800 px-3 py-1 text-xs font-semibold text-slate-200 transition hover:border-indigo-400"
            >
              <FolderPlus className="h-4 w-4" />
              Yeni
            </button>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center justify-center rounded-lg p-1 text-slate-400 transition hover:bg-slate-800 hover:text-slate-200 lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <nav className="max-h-[40vh] space-y-1 overflow-y-auto px-2 py-2">{renderFolderTree(folderTree)}</nav>
        <div className="border-t border-slate-800 px-2 py-3">
        <button
          type="button"
          disabled={!activeFolderId}
          onClick={() => {
            openNoteForm({ folderId: activeFolderId })
            if (window.innerWidth < 1024) setSidebarOpen(false)
          }}
          className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-500/40 bg-indigo-500/10 px-3 py-2.5 text-xs font-semibold text-indigo-100 transition hover:bg-indigo-500/20 disabled:cursor-not-allowed disabled:border-slate-800 disabled:text-slate-500"
        >
          <FileText className="h-4 w-4" />
          Yeni not
        </button>
        <div className="max-h-[50vh] space-y-1 overflow-y-auto">
          {folderNotes.map((note) => (
            <button
              key={note.id}
              type="button"
              onClick={() => {
                setActiveNoteId(note.id)
                if (window.innerWidth < 1024) setSidebarOpen(false)
              }}
              className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                note.id === activeNoteId ? 'bg-indigo-500/20 text-indigo-100' : 'text-slate-300 hover:bg-slate-900/80'
              }`}
            >
              <FileText className="h-4 w-4 flex-shrink-0 text-slate-500" />
              <span className="flex-1 truncate">{note.question}</span>
              {note.attachments && note.attachments.length > 0 && (
                <Upload className="h-4 w-4 flex-shrink-0 text-emerald-400" />
              )}
            </button>
          ))}
          {folderNotes.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-800 px-3 py-4 text-center text-xs text-slate-500">
              Not eklemek için klasöre sağ tıkla
            </div>
          )}
        </div>
      </div>
      {contextMenu.open && (
        <div
          className="fixed z-50 w-56 rounded-xl border border-slate-700 bg-slate-900/95 p-2 shadow-lg"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button
            type="button"
            onClick={() => {
              openFolderForm({ parentId: contextMenu.folderId })
              closeContextMenu()
              if (window.innerWidth < 1024) setSidebarOpen(false)
            }}
            className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-slate-200 transition hover:bg-slate-800"
          >
            <span>Yeni klasör</span>
            <FolderPlus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              openNoteForm({ folderId: contextMenu.folderId })
              closeContextMenu()
              if (window.innerWidth < 1024) setSidebarOpen(false)
            }}
            className="mt-1 flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-slate-200 transition hover:bg-slate-800"
          >
            <span>Yeni not</span>
            <FileText className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={async () => {
              if (!window.confirm('Bu klasörü ve içindeki tüm notları silmek istediğinden emin misin? Bu işlem geri alınamaz.')) {
                closeContextMenu()
                return
              }
              try {
                await deleteFolder({ folderId: contextMenu.folderId })
                closeContextMenu()
              } catch (error) {
                console.error('Klasör silinemedi', error)
                alert('Klasör silinirken bir hata oluştu.')
              }
            }}
            className="mt-1 flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-rose-300 transition hover:bg-rose-500/10"
          >
            <span>Klasörü sil</span>
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )}
      </aside>
    </>
  )
}

export default Sidebar
