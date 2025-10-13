import TopBar from '../components/layout/TopBar.jsx'
import Sidebar from '../components/layout/Sidebar.jsx'
import NoteViewer from '../components/notes/NoteViewer.jsx'
import TryYourselfModal from '../components/modals/TryYourselfModal.jsx'

function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <TopBar />
      <div className="flex flex-1 gap-6 px-6 py-6">
        <Sidebar />
        <main className="flex-1">
          <NoteViewer />
        </main>
      </div>
      <TryYourselfModal />
    </div>
  )
}

export default DashboardPage
