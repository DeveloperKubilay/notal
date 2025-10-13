import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { CalendarClock, LogOut, Sparkles, Wand2, Eye, EyeOff, Plus, X } from 'lucide-react'
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
    plans,
    createPlan,
    updatePlan,
    deletePlan,
    revealAll,
    setRevealAll,
    setTryYourselfOpen,
    setAiDrawerOpen,
  } = useWorkspace()
  const [planFormOpen, setPlanFormOpen] = useState(false)
  const [editingPlanId, setEditingPlanId] = useState(null)
  const [planTitle, setPlanTitle] = useState('')
  const [planTargetDate, setPlanTargetDate] = useState('')
  const [planSaving, setPlanSaving] = useState(false)

  const planSummaries = useMemo(
    () =>
      plans.map((item) => ({
        ...item,
        countdown: getCountdownLabel(item.targetDate),
      })),
    [plans],
  )

  const closePlanForm = () => {
    setPlanFormOpen(false)
    setEditingPlanId(null)
    setPlanTitle('')
    setPlanTargetDate('')
  }

  const startPlanCreate = () => {
    setEditingPlanId(null)
    setPlanTitle('')
    setPlanTargetDate('')
    setPlanFormOpen(true)
  }

  const startPlanEdit = (plan) => {
    setEditingPlanId(plan.id)
    setPlanTitle(plan.title || '')
    setPlanTargetDate(plan.targetDate ? plan.targetDate.slice(0, 10) : '')
    setPlanFormOpen(true)
  }

  const handlePlanSubmit = async (event) => {
    event.preventDefault()
    if (!planTitle.trim()) return
    setPlanSaving(true)
    const payload = {
      title: planTitle.trim(),
      targetDate: planTargetDate ? new Date(planTargetDate).toISOString() : null,
    }
    try {
      if (editingPlanId) {
        await updatePlan({ planId: editingPlanId, ...payload })
      } else {
        await createPlan(payload)
      }
      closePlanForm()
    } finally {
      setPlanSaving(false)
    }
  }

  const handlePlanRemove = async (event, planId) => {
    event.stopPropagation()
    await deletePlan({ planId })
    if (editingPlanId === planId) closePlanForm()
  }

  return (
    <header className="flex flex-col gap-4 border-b border-slate-800 bg-slate-950/80 px-6 py-4 backdrop-blur md:flex-row md:items-center md:justify-between">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 px-3 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-300">
              <CalendarClock className="h-4 w-4" />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {planSummaries.map((plan) => (
                <div
                  key={plan.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => startPlanEdit(plan)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      startPlanEdit(plan)
                    }
                  }}
                  className="group relative flex min-w-[8.5rem] flex-col gap-1 rounded-lg border border-indigo-500/40 bg-indigo-500/10 px-3 py-1.5 transition hover:border-indigo-300 hover:bg-indigo-500/20 focus:outline-none"
                  title={plan.targetDate ? new Date(plan.targetDate).toLocaleDateString('tr-TR') : 'Tarih yok'}
                >
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-indigo-200">{plan.countdown}</span>
                  <span className="text-base font-semibold leading-none text-slate-100">{plan.title || 'İsimsiz plan'}</span>
                  <button
                    type="button"
                    onClick={(event) => handlePlanRemove(event, plan.id)}
                    className="absolute -top-2 -right-2 hidden rounded-full border border-rose-500/60 bg-rose-500/30 p-1 text-rose-100 transition hover:bg-rose-500/60 group-hover:flex"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {planSummaries.length === 0 && (
                <span className="text-xs text-slate-500">Plan eklemek için artıya bas</span>
              )}
              <button
                type="button"
                onClick={startPlanCreate}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-dashed border-indigo-500/50 text-indigo-200 transition hover:border-indigo-300 hover:text-indigo-100"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAiDrawerOpen(true)}
            className="flex items-center gap-2 rounded-2xl border border-emerald-500/50 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/20"
          >
            <Sparkles className="h-4 w-4" />
            AI Asistan
          </button>
        </div>
        {planFormOpen && (
          <form
            onSubmit={handlePlanSubmit}
            className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3"
          >
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-wide text-slate-400" htmlFor="plan-title">
                Plan adı
              </label>
              <input
                id="plan-title"
                value={planTitle}
                onChange={(event) => setPlanTitle(event.target.value)}
                placeholder="Yeni plan"
                className="w-56 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-400 focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-wide text-slate-400" htmlFor="plan-date">
                Hedef tarih
              </label>
              <input
                id="plan-date"
                type="date"
                value={planTargetDate}
                onChange={(event) => setPlanTargetDate(event.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-indigo-400 focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={planSaving}
                className="rounded-xl bg-indigo-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:bg-slate-700"
              >
                Kaydet
              </button>
              <button
                type="button"
                onClick={closePlanForm}
                className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:border-slate-500"
              >
                Vazgeç
              </button>
            </div>
          </form>
        )}
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
          {revealAll ? 'Sansürsüz' : 'Sansürlü'}
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
