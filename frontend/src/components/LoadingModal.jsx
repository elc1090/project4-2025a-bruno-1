// src/components/LoadingModal.jsx
import React from 'react'

export default function LoadingModal({ visible }) {
  if (!visible) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="animate-spin rounded-full h-24 w-24 border-t-4 border-b-4 border-indigo-600"></div>
    </div>
  )
}
