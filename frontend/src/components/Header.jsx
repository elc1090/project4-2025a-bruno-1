// src/components/Header.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Header({ activeView, userEmail, onLogout }) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const links = [
    { id: 'all', label: 'Todos os Links', path: '/links' },
    { id: 'mine', label: 'Meus Links', path: '/my-links' },
    { id: 'favorites', label: 'Favoritos', path: '/favorites' }
  ]

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-indigo-700 via-blue-600 to-purple-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
        {/* Logo + Title */}
        <div
          className="flex items-center cursor-pointer space-x-4"
          onClick={() => navigate('/links')}
        >
          <img src="logo2.png" alt="Logo" className="w-10 h-10 rounded-full shadow-md" />
          <span className="text-2xl md:text-3xl font-bold tracking-tight">
            CompartilhaInfo
          </span>
        </div>

        {/* Desktop Nav: aparece somente em telas >=1080px */}
        <nav className="hidden [@media(min-width:1080px)]:flex items-center space-x-6">
          {links.map(({ id, label, path }) => (
            <button
              key={id}
              onClick={() => navigate(path)}
              className={`relative px-4 py-1 text-sm font-semibold uppercase rounded-lg transition-colors duration-200
                ${activeView === id
                  ? 'bg-indigo-800 text-white'
                  : 'text-indigo-100 hover:bg-indigo-600 hover:text-white'
                }`}
            >
              {label}
            </button>
          ))}
          <div className="ml-6 flex items-center space-x-4">
            <span className="text-indigo-200 text-sm">{userEmail}</span>
            <button
              onClick={onLogout}
              className="px-3 py-1 text-sm font-medium uppercase rounded hover:bg-indigo-600 transition duration-200"
            >
              Sair
            </button>
          </div>
        </nav>

        {/* Mobile Toggle: só aparece em telas <1080px */}
        <button
          className="[@media(min-width:1080px)]:hidden p-2 focus:outline-none"
          onClick={() => setOpen(prev => !prev)}
        >
          {open ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setOpen(false)}
          />

          {/* Sidebar */}
          <div
            className="fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-50 p-6 transform transition-transform duration-300 ease-out"
            style={{ transform: open ? 'translateX(0)' : 'translateX(-100%)' }}
          >
            <div className="flex items-center justify-between mb-8">
              <span className="text-xl font-semibold text-gray-800">Menu</span>
              <button onClick={() => setOpen(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <nav className="flex flex-col space-y-6">
              {links.map(({ id, label, path }) => (
                <button
                  key={id}
                  onClick={() => { navigate(path); setOpen(false) }}
                  className={`text-lg font-medium transition-colors duration-200
                    ${activeView === id
                      ? 'text-indigo-700'
                      : 'text-gray-300 hover:text-indigo-600'
                    }`}
                >
                  {label}
                </button>
              ))}

              <div className="pt-6 border-t border-gray-200 mt-6">
                <span className="block text-gray-600 mb-4">{userEmail}</span>
                <button
                  onClick={() => { onLogout(); setOpen(false) }}
                  className="w-full text-left text-sm font-medium text-red-500 hover:text-red-600 transition"
                >
                  Sair
                </button>
              </div>
            </nav>
          </div>
        </>
      )}
    </header>
  )
}