'use client'

import { useState, useEffect } from 'react'
import { useApi } from '@/services/api'

interface SyncManager {
  register(tag: string): Promise<void>;
}

declare global {
  interface ServiceWorkerRegistration {
    sync: SyncManager;
  }
}

interface QueuedAction {
  id: string
  type: 'createCarpool' | 'sendInvite'
  data: any
  timestamp: number
}

export function useBackgroundSync() {
  const api = useApi()
  const [pendingActions, setPendingActions] = useState<QueuedAction[]>([])

  async function processAction(action: QueuedAction) {
    switch (action.type) {
      case 'createCarpool':
        await api.createCarpool(action.data)
        break
      case 'sendInvite':
        await api.createInvite(action.data)
        break
    }
  }

  const queueAction = async (type: QueuedAction['type'], data: any) => {
    const action: QueuedAction = {
      id: crypto.randomUUID(),
      type,
      data,
      timestamp: Date.now()
    }

    // Store in IndexedDB
    const db = await openDB()
    await db.add(action)
    setPendingActions(prev => [...prev, action])

    // Register sync if supported
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready as ServiceWorkerRegistration
      if ('sync' in registration) {
        await registration.sync.register('sync-actions')
      }
    } else {
      // Fallback: try immediately
      await processAction(action)
    }
  }

  return { queueAction, pendingActions }
}

async function openDB() {
  const db = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open('carpooly-sync', 1)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    request.onupgradeneeded = (event) => {
      const db = request.result
      db.createObjectStore('actions', { keyPath: 'id' })
    }
  })

  const transaction = db.transaction(['actions'], 'readwrite')
  return transaction.objectStore('actions')
} 