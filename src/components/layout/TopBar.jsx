import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { CalendarClock, LogOut, Sparkles, Wand2, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth.js'
import { useWorkspace } from '../../hooks/useWorkspace.js'
import { getCountdownLabel } from '../../utils/time.js'

const revealVariants = {
  active: { backgroundColor: 'rgba(129, 140, 248, 0.25)' },
  inactive: { backgroundColor: 'rgba(30, 41, 59, 0.6)' },
}

const MotionButton = motion.button

function TopBar() {
  const { user, logout } = useAuth()
  const {
    plan,
    updatePlan,
    revealAll,
    setRevealAll,
    setTryYourselfOpen,
  } = useWorkspace()
  const [editingPlan, setEditingPlan] = useState(false)
  const [planTargetDate, setPlanTargetDate] = useState('')
  const [planDescription, setPlanDescription] = useState('')
  const [planLoading, setPlanLoading] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')

  const countdownLabel = useMemo(() => getCountdownLabel(plan?.targetDate), [plan])

  useEffect(() => {
    if (!plan) {
      setPlanTargetDate('')
      setPlanDescription('')
      return
    }
    setPlanTargetDate(plan?.targetDate ? plan.targetDate.slice(0, 10) : '')
    setPlanDescription(plan.description || '')
  }, [plan, editingPlan])

  const handlePlanSubmit = async (event) => {
    event.preventDefault()
    setPlanLoading(true)
    try {
      await updatePlan({
        targetDate: planTargetDate ? new Date(planTargetDate).toISOString() : null,
        description: planDescription,
      })
      setEditingPlan(false)
    } finally {
      setPlanLoading(false)
    }
  }

  const handleAskAi = () => {
    if (!aiPrompt.trim()) return
    console.info('AI prompt submitted:', aiPrompt)
    setAiPrompt('')
  }

  return (
    <header className="flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-6 py-4 backdrop-blur">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3">
          <CalendarClock className="h-5 w-5 text-indigo-400" />
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-wide text-slate-400">Planın</span>
            <span className="text-sm font-semibold text-slate-100">{countdownLabel}</span>
            {plan?.description && <span className="text-xs text-slate-500">{plan.description}</span>}
          </div>
          <button
            type="button"
            onClick={() => setEditingPlan((prev) => !prev)}
            className="rounded-xl border border-indigo-500/40 px-3 py-1 text-xs font-medium text-indigo-300 transition hover:border-indigo-400 hover:text-indigo-200"
          >
            {plan ? 'Güncelle' : 'Planla'}
          </button>
        </div>
        {editingPlan && (
          <form onSubmit={handlePlanSubmit} className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3">
            <input
              type="date"
              value={planTargetDate}
              onChange={(event) => setPlanTargetDate(event.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-indigo-400 focus:outline-none"
            />
            <input
              type="text"
              value={planDescription}
              onChange={(event) => setPlanDescription(event.target.value)}
              placeholder="Plan başlığı"
              className="w-48 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-400 focus:outline-none"
            />
            <button
              disabled={planLoading}
              type="submit"
              className="rounded-xl bg-indigo-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:bg-slate-700"
            >
              Kaydet
            </button>
          </form>
        )}
        <div className="hidden items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 lg:flex">
          <Sparkles className="h-5 w-5 text-emerald-300" />
          <input
            value={aiPrompt}
            onChange={(event) => setAiPrompt(event.target.value)}
            placeholder="AI'a hızlıca sor"
            className="w-60 bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleAskAi}
            className="rounded-xl bg-emerald-500/80 px-3 py-1 text-xs font-semibold text-white transition hover:bg-emerald-400"
          >
            Sor
          </button>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <MotionButton
          type="button"
          onClick={() => setRevealAll((prev) => !prev)}
          className="flex items-center gap-2 rounded-2xl border border-slate-800 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-indigo-400"
          variants={revealVariants}
          animate={revealAll ? 'active' : 'inactive'}
        >
          {revealAll ? <Eye className="h-4 w-4 text-indigo-300" /> : <EyeOff className="h-4 w-4 text-slate-400" />}
          {revealAll ? 'Sansürsüz' : 'Sansürle'}
        </MotionButton>
        <button
          type="button"
          onClick={() => setTryYourselfOpen(true)}
          className="flex items-center gap-2 rounded-2xl border border-indigo-500/50 bg-indigo-500/20 px-4 py-2 text-sm font-semibold text-indigo-200 transition hover:bg-indigo-500/30"
        >
          <Wand2 className="h-4 w-4" />
          Kendini Dene
        </button>
        <div className="hidden items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-2 text-xs text-slate-400 sm:flex">
          <span>{user?.email}</span>
        </div>
        <button
          type="button"
          onClick={logout}
          className="flex items-center gap-2 rounded-2xl border border-slate-800 px-4 py-2 text-sm font-semibold text-rose-300 transition hover:border-rose-400 hover:text-rose-200"
        >
          <LogOut className="h-4 w-4" />
          Çıkış
        </button>
      </div>
    </header>
  )
}

export default TopBar
