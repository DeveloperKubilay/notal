import { useEffect, useMemo, useRef, useState } from 'react'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
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
  const [rightPanel, setRightPanel] = useState(defaultRightPanel)
  const [fullNoteCache, setFullNoteCache] = useState(new Map())
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
      const nextNotes = snapshot.docs.map((docSnapshot) => {
        const data = docSnapshot.data()
        return {
          id: docSnapshot.id,
          folderId: data.folderId,
          question: data.question,
          createdAt: data.createdAt ?? null,
        }
      })
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
  const activeNote = useMemo(() => {
    if (!activeNoteId) return null
    const cachedFull = fullNoteCache.get(activeNoteId)
    if (cachedFull) return cachedFull
    return notes.find((note) => note.id === activeNoteId) || null
  }, [notes, activeNoteId, fullNoteCache])
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
        updateNote: async () => {},
        deleteNote: async () => {},
        deleteFolder: async () => {},
        setActiveFolderId: setActiveFolderIdState,
        setActiveNoteId: setActiveNoteIdState,
        setRevealAll,
        setTryYourselfOpen,
        openFolderForm: () => {},
        openNoteForm: () => {},
        closeRightPanel: () => {},
      }
    }

    const db = ensureFirestore()

    const selectFolder = (folderId) => {
      setActiveFolderIdState(folderId)
    }

    const selectNote = async (noteId) => {
      setActiveNoteIdState(noteId)
      setRightPanel({ ...defaultRightPanel })
      
      if (!noteId) return
      
      setFullNoteCache((cache) => {
        if (cache.has(noteId)) return cache
        
        const noteRef = doc(db, 'users', user.uid, 'notes', noteId)
        getDoc(noteRef).then((noteSnap) => {
          if (noteSnap.exists()) {
            const fullData = {
              id: noteSnap.id,
              ...noteSnap.data(),
            }
            setFullNoteCache((prev) => new Map(prev).set(noteId, fullData))
          }
        }).catch((error) => {
          console.error('Not yüklenemedi', error)
        })
        
        return cache
      })
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

    const createNote = async ({ folderId, question, answer, attachments = [] }) => {
      if (!folderId) throw new Error('Folder is required')
      if (!question) throw new Error('Question is required')
      if (!answer) throw new Error('Answer is required')
      const notesCollection = collection(db, 'users', user.uid, 'notes')
      const docRef = await addDoc(notesCollection, {
        folderId,
        question,
        answer,
        attachments: [],
        createdAt: serverTimestamp(),
      })
      setActiveNoteIdState(docRef.id)
      setRightPanel({ ...defaultRightPanel })

      if (attachments.length > 0 && firebaseStorage) {
        const uploadedAttachments = []
        for (const file of attachments) {
          try {
            const storageRef = ref(firebaseStorage, `users/${user.uid}/notes/${docRef.id}/${file.name}`)
            const snapshot = await uploadBytes(storageRef, file)
            const url = await getDownloadURL(snapshot.ref)
            uploadedAttachments.push({
              name: file.name,
              url,
              contentType: file.type || null,
              size: file.size || null,
              uploadedAt: new Date().toISOString(),
            })
          } catch (error) {
            console.error(`${file.name} yüklenemedi`, error)
          }
        }
        
        if (uploadedAttachments.length > 0) {
          const noteRef = doc(db, 'users', user.uid, 'notes', docRef.id)
          await updateDoc(noteRef, {
            attachments: uploadedAttachments,
            updatedAt: serverTimestamp(),
          })
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

    const updateNote = async ({ noteId, question, answer, newAttachments = [], existingAttachments = [], removedAttachments = [] }) => {
      if (!noteId) throw new Error('Note id is required')
      const noteRef = doc(db, 'users', user.uid, 'notes', noteId)
      
      if (removedAttachments.length > 0 && firebaseStorage) {
        for (const attachment of removedAttachments) {
          try {
            const storageRef = ref(firebaseStorage, `users/${user.uid}/notes/${noteId}/${attachment.name}`)
            await deleteObject(storageRef)
          } catch (error) {
            console.error(`${attachment.name} silinemedi`, error)
          }
        }
      }
      
      let finalAttachments = [...existingAttachments]
      
      if (newAttachments.length > 0 && firebaseStorage) {
        for (const file of newAttachments) {
          try {
            const storageRef = ref(firebaseStorage, `users/${user.uid}/notes/${noteId}/${file.name}`)
            const snapshot = await uploadBytes(storageRef, file)
            const url = await getDownloadURL(snapshot.ref)
            finalAttachments.push({
              name: file.name,
              url,
              contentType: file.type || null,
              size: file.size || null,
              uploadedAt: new Date().toISOString(),
            })
          } catch (error) {
            console.error(`${file.name} yüklenemedi`, error)
          }
        }
      }
      
      await updateDoc(noteRef, {
        question,
        answer,
        attachments: finalAttachments,
        updatedAt: serverTimestamp(),
      })
    }

    const deleteNote = async ({ noteId }) => {
      if (!noteId) throw new Error('Note id is required')
      const noteRef = doc(db, 'users', user.uid, 'notes', noteId)
      const note = notes.find(n => n.id === noteId)
      
      if (note?.attachments && note.attachments.length > 0 && firebaseStorage) {
        for (const attachment of note.attachments) {
          try {
            const storageRef = ref(firebaseStorage, `users/${user.uid}/notes/${noteId}/${attachment.name}`)
            await deleteObject(storageRef)
          } catch (error) {
            console.error(`${attachment.name} silinemedi`, error)
          }
        }
      }
      
      await deleteDoc(noteRef)
      
      if (activeNoteId === noteId) {
        setActiveNoteIdState(null)
      }
    }

    const deleteFolder = async ({ folderId }) => {
      if (!folderId) throw new Error('Folder id is required')
      
      const descendantIds = collectDescendantIds(folders, folderId)
      descendantIds.add(folderId)
      
      const notesToDelete = notes.filter(note => descendantIds.has(note.folderId))
      
      for (const note of notesToDelete) {
        await deleteNote({ noteId: note.id })
      }
      
      for (const id of descendantIds) {
        const folderRef = doc(db, 'users', user.uid, 'folders', id)
        await deleteDoc(folderRef)
      }
      
      if (descendantIds.has(activeFolderId)) {
        setActiveFolderIdState(null)
      }
    }

    return {
      createFolder,
      createNote,
      createPlan,
      updatePlan,
      deletePlan,
      updateNote,
      deleteNote,
      deleteFolder,
      setActiveFolderId: selectFolder,
      setActiveNoteId: selectNote,
      setRevealAll,
      setTryYourselfOpen,
      openFolderForm,
      openNoteForm,
      closeRightPanel,
    }
  }, [user, activeFolderId, activeNoteId, folders, notes])

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
      rightPanel,
      actions,
    ],
  )

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
}
