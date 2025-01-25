'use client'

import { useState, useEffect } from 'react'

export function UpdatePrompt() {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false)

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        setShowUpdatePrompt(true)
      })
    }
  }, [])

  const handleUpdate = () => {
    window.location.reload()
  }

  if (!showUpdatePrompt) return null

  return (
    <div className="fixed top-4 right-4 bg-blue-100 text-blue-800 px-6 py-3 rounded-lg shadow-lg flex items-center gap-4">
      <span>A new version is available!</span>
      <button
        onClick={handleUpdate}
        className="bg-blue-200 px-4 py-1 rounded hover:bg-blue-300"
      >
        Update now
      </button>
    </div>
  )
} 