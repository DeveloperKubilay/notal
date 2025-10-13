import { useEffect, useMemo, useRef, useState } from 'react'
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { firestore } from '../lib/firebase.js'
import { useAuth } from '../hooks/useAuth.js'
import { WorkspaceContext } from './workspace-context.js'

function ensureFirestore() {
  if (!firestore) throw new Error('Firestore is not configured. Check environment variables.')
  return firestore
}

export function WorkspaceProvider({ children }) {
  const { user } = useAuth()
  const [folders, setFolders] = useState([])
  const [notes, setNotes] = useState([])
  const [plan, setPlan] = useState(null)
  const [revealAll, setRevealAll] = useState(false)
  const [activeFolderId, setActiveFolderId] = useState(null)
  const [activeNoteId, setActiveNoteId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tryYourselfOpen, setTryYourselfOpen] = useState(false)
  const folderRef = useRef(null)

  useEffect(() => {
    folderRef.current = activeFolderId
  }, [activeFolderId])

  useEffect(() => {
    if (!user) {
      setFolders([])
      setNotes([])
      setPlan(null)
      setActiveFolderId(null)
      setActiveNoteId(null)
      setLoading(false)
      return undefined
    }

    const db = ensureFirestore()
    const foldersRef = collection(db, 'users', user.uid, 'folders')
    const notesRef = collection(db, 'users', user.uid, 'notes')
    const planRef = doc(db, 'users', user.uid, 'metadata', 'plan')

    setLoading(true)

    const unsubscribeFolders = onSnapshot(query(foldersRef, orderBy('createdAt', 'asc')), (snapshot) => {
      const nextFolders = snapshot.docs.map((docSnapshot) => ({
        id: docSnapshot.id,
        ...docSnapshot.data(),
      }))
      setFolders(nextFolders)
      setActiveFolderId((current) => {
        if (current && nextFolders.find((folder) => folder.id === current)) return current
        return nextFolders[0]?.id || null
      })
    })

    const unsubscribeNotes = onSnapshot(query(notesRef, orderBy('createdAt', 'asc')), (snapshot) => {
      const nextNotes = snapshot.docs.map((docSnapshot) => ({
        id: docSnapshot.id,
        ...docSnapshot.data(),
      }))
      setNotes(nextNotes)
      setActiveNoteId((current) => {
        if (current && nextNotes.find((note) => note.id === current)) return current
        const fallback = nextNotes.find((note) => note.folderId === folderRef.current)
        return fallback?.id || null
      })
    })

    const unsubscribePlan = onSnapshot(planRef, (snapshot) => {
      setPlan(snapshot.exists() ? snapshot.data() : null)
      setLoading(false)
    })

    return () => {
      unsubscribeFolders()
      unsubscribeNotes()
      unsubscribePlan()
    }
  }, [user])

  const activeNote = useMemo(() => notes.find((note) => note.id === activeNoteId) || null, [notes, activeNoteId])
  const folderNotes = useMemo(() => notes.filter((note) => note.folderId === activeFolderId), [notes, activeFolderId])
  const selectedFolder = useMemo(() => folders.find((folder) => folder.id === activeFolderId) || null, [folders, activeFolderId])

  const actions = useMemo(() => {
    if (!user) {
      return {
        createFolder: async () => {},
        createNote: async () => {},
        updatePlan: async () => {},
        updateNoteVisibility: async () => {},
        setActiveFolderId,
        setActiveNoteId,
        setRevealAll,
        setTryYourselfOpen,
      }
    }

    const db = ensureFirestore()

    const createFolder = async ({ name }) => {
      if (!name) throw new Error('Folder name is required')
      const foldersRef = collection(db, 'users', user.uid, 'folders')
      const docRef = await addDoc(foldersRef, {
        name,
        createdAt: serverTimestamp(),
      })
      setActiveFolderId(docRef.id)
      return docRef
    }

    const createNote = async ({ folderId, question, answer }) => {
      if (!folderId) throw new Error('Folder is required')
      if (!question) throw new Error('Question is required')
      if (!answer) throw new Error('Answer is required')
      const notesRef = collection(db, 'users', user.uid, 'notes')
      const docRef = await addDoc(notesRef, {
        folderId,
        question,
        answer,
        hidden: true,
        createdAt: serverTimestamp(),
      })
      setActiveNoteId(docRef.id)
      return docRef
    }

    const updatePlan = async ({ targetDate, description }) => {
      const planRef = doc(db, 'users', user.uid, 'metadata', 'plan')
      await setDoc(
        planRef,
        {
          targetDate: targetDate || null,
          description: description || '',
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      )
    }

    const updateNoteVisibility = async ({ noteId, hidden }) => {
      if (!noteId) throw new Error('Note id is required')
      const noteRef = doc(db, 'users', user.uid, 'notes', noteId)
      await updateDoc(noteRef, { hidden })
    }

    return {
      createFolder,
      createNote,
      updatePlan,
      updateNoteVisibility,
      setActiveFolderId,
      setActiveNoteId,
      setRevealAll,
      setTryYourselfOpen,
    }
  }, [user])

  const value = useMemo(
    () => ({
      folders,
      notes,
      folderNotes,
      plan,
      loading,
      revealAll,
      activeFolderId,
      activeNoteId,
      activeNote,
      selectedFolder,
      tryYourselfOpen,
      ...actions,
    }),
    [folders, notes, folderNotes, plan, loading, revealAll, activeFolderId, activeNoteId, activeNote, selectedFolder, tryYourselfOpen, actions],
  )

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
}
