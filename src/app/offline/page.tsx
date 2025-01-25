'use client'

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">You&apos;re Offline</h1>
        <p className="text-gray-600 mb-6">
          Please check your internet connection and try again.
        </p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-green-100 text-green-800 px-6 py-2 rounded-lg hover:bg-green-200"
        >
          Retry
        </button>
      </div>
    </div>
  )
} 