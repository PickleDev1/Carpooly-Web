'use client'

import { useState, useEffect } from 'react'

export function PWAPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      setShowPrompt(false)
    }
  }

  if (!showPrompt) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-white p-4 rounded-lg shadow-lg flex items-center justify-between">
      <p className="text-sm">Install CarPooly for a better experience</p>
      <div className="flex gap-2">
        <button
          onClick={() => setShowPrompt(false)}
          className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded"
        >
          Not now
        </button>
        <button
          onClick={handleInstall}
          className="px-4 py-2 text-sm bg-green-100 text-green-800 hover:bg-green-200 rounded"
        >
          Install
        </button>
      </div>
    </div>
  )
} 