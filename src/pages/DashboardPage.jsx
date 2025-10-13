import TopBar from '../components/layout/TopBar.jsx'
import Sidebar from '../components/layout/Sidebar.jsx'
import NoteViewer from '../components/notes/NoteViewer.jsx'
import TryYourselfModal from '../components/modals/TryYourselfModal.jsx'
import AiDrawer from '../components/ai/AiDrawer.jsx'
import { useWorkspace } from '../hooks/useWorkspace.js'

function DashboardPage() {
  const { aiDrawerOpen } = useWorkspace()

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <TopBar />
      <div className="flex flex-1 gap-6 px-6 py-6">
        <Sidebar />
        <div className="flex flex-1">
          <main
            className={`relative flex flex-1 transition-[padding-right] duration-200 ease-out ${
              aiDrawerOpen ? 'pr-[24rem]' : 'pr-0'
            }`}
          >
            <NoteViewer />
            <AiDrawer />
          </main>
        </div>
      </div>
      <TryYourselfModal />
    </div>
  )
}

export default DashboardPage
