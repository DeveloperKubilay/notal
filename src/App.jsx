import { createElement, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Rocket, Sparkles, Shield } from 'lucide-react'
import { firebaseApp } from './lib/firebase.js'

const features = [
  {
    icon: Sparkles,
    title: 'Tailwind-first UI',
    description: 'Composable utility classes and preconfigured dark styling keep you shipping fast.'
  },
  {
    icon: Rocket,
    title: 'Motion ready',
    description: 'Drop in micro-interactions with the full power of Framer Motion already hooked up.'
  },
  {
    icon: Shield,
    title: 'Firebase bootstrapped',
    description: 'Initialize analytics, auth, or Firestore by setting your Vite environment secrets.'
  }
]

function App() {
  const firebaseStatus = useMemo(() => {
    if (!firebaseApp) return 'Add your Firebase environment variables to finish setup.'
    return `Firebase connected: ${firebaseApp.options.projectId || 'projectId missing'}`
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-16 px-6 py-20">
        <motion.section
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', duration: 0.8 }}
          className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-black p-10 shadow-2xl"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/60 px-4 py-2 text-sm font-medium text-slate-300">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            Built with Vite, Tailwind, Motion, Lucide, Firebase
          </div>
          <h1 className="mt-8 text-4xl font-semibold tracking-tight sm:text-5xl">
            Ship polished React experiences without leaving your stack
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-slate-300">
            Start iterating instantly with hot-reload, expressive animations, reusable icons, and ready-to-go Firebase integration. Drop in your environment keys and you are ready to deploy.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <motion.a
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              href="https://tailwindcss.com/docs"
              target="_blank"
              className="inline-flex items-center gap-2 rounded-full bg-indigo-500 px-6 py-3 text-sm font-semibold text-white transition"
            >
              <Rocket className="h-4 w-4" />
              Explore Tailwind Docs
            </motion.a>
            <span className="text-sm text-slate-400">{firebaseStatus}</span>
          </div>
        </motion.section>
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="grid gap-6 md:grid-cols-3"
        >
          {features.map(({ icon, title, description }) => (
            <div key={title} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              {createElement(icon, { className: 'h-10 w-10 text-indigo-400' })}
              <h2 className="mt-4 text-xl font-semibold text-white">{title}</h2>
              <p className="mt-2 text-sm text-slate-300">{description}</p>
            </div>
          ))}
        </motion.section>
      </div>
    </div>
  )
}

export default App
