import { useState } from 'react'
import TopBar from '../components/layout/TopBar.jsx'
import Sidebar from '../components/layout/Sidebar.jsx'
import NoteViewer from '../components/notes/NoteViewer.jsx'
import TryYourselfModal from '../components/modals/TryYourselfModal.jsx'

function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <TopBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex flex-1 gap-3 px-3 py-3 md:gap-6 md:px-6 md:py-6">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="flex flex-1">
          <main className="relative flex flex-1">
            <NoteViewer />
          </main>
        </div>
      </div>
      <TryYourselfModal />
    </div>
  )
}

export default DashboardPage
