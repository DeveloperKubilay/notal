import { useEffect, useMemo, useRef, useState } from 'react'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { firebaseStorage, firestore } from '../lib/firebase.js'
import { useAuth } from '../hooks/useAuth.js'
import { WorkspaceContext } from './workspace-context.js'

const initialLoadState = { folders: false, notes: false, plans: false }
const defaultRightPanel = { type: 'note', payload: null }

function ensureFirestore() {
  if (!firestore) throw new Error('Firestore is not configured. Check environment variables.')
  return firestore
}

function normalizeParentId(value) {
  return value ?? null
}

function getTimestampValue(value) {
  if (!value) return 0
  if (typeof value === 'number') return value
  if (value instanceof Date) return value.getTime() / 1000
  if (typeof value === 'object' && typeof value.seconds === 'number') return value.seconds
  return 0
}

function sortByCreatedAt(a, b) {
  const aTime = getTimestampValue(a.createdAt)
  const bTime = getTimestampValue(b.createdAt)
  if (aTime === bTime) return (a.name || '').localeCompare(b.name || '')
  return aTime - bTime
}

function groupFoldersByParent(folders) {
  return folders.reduce((acc, folder) => {
    const parentKey = normalizeParentId(folder.parentId)
    if (!acc.has(parentKey)) acc.set(parentKey, [])
    acc.get(parentKey).push(folder)
    return acc
  }, new Map())
}

function buildFolderTree(folders) {
  const byParent = groupFoldersByParent(folders)
  const traverse = (parentId = null) => {
    const children = byParent.get(parentId) || []
    return children
      .slice()
      .sort(sortByCreatedAt)
      .map((child) => ({
        ...child,
        children: traverse(child.id),
      }))
  }
  return traverse()
}

function collectDescendantIds(folders, rootId) {
  if (!rootId) return new Set()
  const byParent = groupFoldersByParent(folders)
  const stack = [rootId]
  const ids = new Set()
  while (stack.length > 0) {
    const current = stack.pop()
    if (!current || ids.has(current)) continue
    ids.add(current)
    const children = byParent.get(current) || []
    children.forEach((child) => stack.push(child.id))
  }
  return ids
}

export function WorkspaceProvider({ children }) {
  const { user } = useAuth()
  const [folders, setFolders] = useState([])
  const [notes, setNotes] = useState([])
  const [plans, setPlans] = useState([])
  const [revealAll, setRevealAll] = useState(false)
  const [activeFolderId, setActiveFolderIdState] = useState(null)
  const [activeNoteId, setActiveNoteIdState] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tryYourselfOpen, setTryYourselfOpen] = useState(false)
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false)
  const [rightPanel, setRightPanel] = useState(defaultRightPanel)
  const folderRef = useRef(null)
  const initialLoadRef = useRef({ ...initialLoadState })

  useEffect(() => {
    folderRef.current = activeFolderId
  }, [activeFolderId])

  useEffect(() => {
    setRightPanel((panel) => {
      if (panel.type === 'folder-form' || panel.type === 'note-form') return panel
      return panel.type === 'note' ? panel : { ...defaultRightPanel }
    })
  }, [activeNoteId])

  useEffect(() => {
    if (!user) {
      setFolders([])
      setNotes([])
      setPlans([])
      setActiveFolderIdState(null)
      setActiveNoteIdState(null)
      setLoading(false)
      setRightPanel({ ...defaultRightPanel })
      initialLoadRef.current = { ...initialLoadState }
      return undefined
    }

    const db = ensureFirestore()
    const foldersRef = collection(db, 'users', user.uid, 'folders')
    const notesRef = collection(db, 'users', user.uid, 'notes')
    const plansRef = collection(db, 'users', user.uid, 'plans')

    initialLoadRef.current = { ...initialLoadState }
    setLoading(true)

    const markLoaded = (key) => {
      initialLoadRef.current[key] = true
      const state = initialLoadRef.current
      if (state.folders && state.notes && state.plans) setLoading(false)
    }

    const unsubscribeFolders = onSnapshot(query(foldersRef, orderBy('createdAt', 'asc')), (snapshot) => {
      const nextFolders = snapshot.docs.map((docSnapshot) => {
        const data = docSnapshot.data()
        return {
          id: docSnapshot.id,
          name: data.name,
          parentId: normalizeParentId(data.parentId),
          createdAt: data.createdAt ?? null,
        }
      })
      setFolders(nextFolders)
      setActiveFolderIdState((current) => {
        if (current && nextFolders.some((folder) => folder.id === current)) return current
        return nextFolders[0]?.id || null
      })
      markLoaded('folders')
    })

    const unsubscribeNotes = onSnapshot(query(notesRef, orderBy('createdAt', 'asc')), (snapshot) => {
      const nextNotes = snapshot.docs.map((docSnapshot) => ({
        id: docSnapshot.id,
        ...docSnapshot.data(),
      }))
      setNotes(nextNotes)
      setActiveNoteIdState((current) => {
        if (current && nextNotes.some((note) => note.id === current)) return current
        const fallback = nextNotes.find((note) => note.folderId === folderRef.current) || nextNotes[0] || null
        return fallback ? fallback.id : null
      })
      markLoaded('notes')
    })

    const unsubscribePlans = onSnapshot(query(plansRef, orderBy('createdAt', 'asc')), (snapshot) => {
      const nextPlans = snapshot.docs.map((docSnapshot) => ({
        id: docSnapshot.id,
        ...docSnapshot.data(),
      }))
      setPlans(nextPlans)
      markLoaded('plans')
    })

    return () => {
      unsubscribeFolders()
      unsubscribeNotes()
      unsubscribePlans()
    }
  }, [user])

  const folderTree = useMemo(() => buildFolderTree(folders), [folders])
  const activeFolderDescendants = useMemo(
    () => collectDescendantIds(folders, activeFolderId),
    [folders, activeFolderId],
  )
  const folderNotes = useMemo(() => {
    if (!activeFolderId) return []
    if (activeFolderDescendants.size === 0) return []
    return notes.filter((note) => activeFolderDescendants.has(note.folderId))
  }, [notes, activeFolderDescendants, activeFolderId])
  const activeNote = useMemo(() => notes.find((note) => note.id === activeNoteId) || null, [notes, activeNoteId])
  const selectedFolder = useMemo(
    () => folders.find((folder) => folder.id === activeFolderId) || null,
    [folders, activeFolderId],
  )

  const actions = useMemo(() => {
    if (!user) {
      return {
        createFolder: async () => {},
        createNote: async () => {},
        createPlan: async () => {},
        updatePlan: async () => {},
        deletePlan: async () => {},
        updateNoteVisibility: async () => {},
        setActiveFolderId: setActiveFolderIdState,
        setActiveNoteId: setActiveNoteIdState,
        setRevealAll,
        setTryYourselfOpen,
        setAiDrawerOpen,
        openFolderForm: () => {},
        openNoteForm: () => {},
        closeRightPanel: () => {},
      }
    }

    const db = ensureFirestore()

    const selectFolder = (folderId) => {
      setActiveFolderIdState(folderId)
    }

    const selectNote = (noteId) => {
      setActiveNoteIdState(noteId)
      setRightPanel({ ...defaultRightPanel })
    }

    const openFolderForm = ({ parentId = null } = {}) => {
      setRightPanel({ type: 'folder-form', payload: { parentId: normalizeParentId(parentId) } })
    }

    const openNoteForm = ({ folderId = null } = {}) => {
      const targetFolder = folderId ?? activeFolderId ?? null
      if (targetFolder) setActiveFolderIdState(targetFolder)
      setRightPanel({ type: 'note-form', payload: { folderId: normalizeParentId(targetFolder) } })
    }

    const closeRightPanel = () => {
      setRightPanel({ ...defaultRightPanel })
    }

    const createFolder = async ({ name, parentId = null }) => {
      if (!name) throw new Error('Folder name is required')
      const foldersCollection = collection(db, 'users', user.uid, 'folders')
      const docRef = await addDoc(foldersCollection, {
        name,
        parentId: normalizeParentId(parentId),
        createdAt: serverTimestamp(),
      })
      setActiveFolderIdState(docRef.id)
      setRightPanel({ ...defaultRightPanel })
      return docRef
    }

    const createNote = async ({ folderId, question, answer, attachment }) => {
      if (!folderId) throw new Error('Folder is required')
      if (!question) throw new Error('Question is required')
      if (!answer) throw new Error('Answer is required')
      const notesCollection = collection(db, 'users', user.uid, 'notes')
      const docRef = await addDoc(notesCollection, {
        folderId,
        question,
        answer,
        hidden: true,
        attachments: [],
        createdAt: serverTimestamp(),
      })
      setActiveNoteIdState(docRef.id)
      setRightPanel({ ...defaultRightPanel })

      if (attachment && firebaseStorage) {
        try {
          const storageRef = ref(firebaseStorage, `users/${user.uid}/notes/${docRef.id}/${attachment.name}`)
          const snapshot = await uploadBytes(storageRef, attachment)
          const url = await getDownloadURL(snapshot.ref)
          const attachmentPayload = [
            {
              name: attachment.name,
              url,
              contentType: attachment.type || null,
              size: attachment.size || null,
              uploadedAt: new Date().toISOString(),
            },
          ]
          const noteRef = doc(db, 'users', user.uid, 'notes', docRef.id)
          await updateDoc(noteRef, {
            attachments: attachmentPayload,
            updatedAt: serverTimestamp(),
          })
        } catch (error) {
          console.error('Dosya yüklenemedi', error)
        }
      }

      return docRef
    }

    const createPlan = async ({ title, targetDate }) => {
      if (!title) throw new Error('Plan başlığı gerekli')
      const plansCollection = collection(db, 'users', user.uid, 'plans')
      return addDoc(plansCollection, {
        title,
        targetDate: targetDate || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    }

    const updatePlan = async ({ planId, title, targetDate }) => {
      if (!planId) throw new Error('Plan kimliği gerekli')
      const planRef = doc(db, 'users', user.uid, 'plans', planId)
      await setDoc(
        planRef,
        {
          title,
          targetDate: targetDate || null,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      )
    }

    const deletePlan = async ({ planId }) => {
      if (!planId) throw new Error('Plan kimliği gerekli')
      const planRef = doc(db, 'users', user.uid, 'plans', planId)
      await deleteDoc(planRef)
    }

    const updateNoteVisibility = async ({ noteId, hidden }) => {
      if (!noteId) throw new Error('Note id is required')
      const noteRef = doc(db, 'users', user.uid, 'notes', noteId)
      await updateDoc(noteRef, { hidden })
    }

    return {
      createFolder,
      createNote,
      createPlan,
      updatePlan,
      deletePlan,
      updateNoteVisibility,
      setActiveFolderId: selectFolder,
      setActiveNoteId: selectNote,
      setRevealAll,
      setTryYourselfOpen,
      setAiDrawerOpen,
      openFolderForm,
      openNoteForm,
      closeRightPanel,
    }
  }, [user, activeFolderId])

  const value = useMemo(
    () => ({
      folders,
      folderTree,
      notes,
      plans,
      folderNotes,
      loading,
      revealAll,
      activeFolderId,
      activeNoteId,
      activeNote,
      selectedFolder,
      tryYourselfOpen,
      aiDrawerOpen,
      rightPanel,
      ...actions,
    }),
    [
      folders,
      folderTree,
      notes,
      plans,
      folderNotes,
      loading,
      revealAll,
      activeFolderId,
      activeNoteId,
      activeNote,
      selectedFolder,
      tryYourselfOpen,
      aiDrawerOpen,
      rightPanel,
      actions,
    ],
  )

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
}
