// src/App.jsx
import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import RegisterPage from './pages/RegisterPage'
import LoginPage from './pages/LoginPage'
import LinksPage from './pages/LinksPage'
import FavoritesPage from './pages/FavoritesPage'
import Logout from './components/Logout'
import './App.css'

export default function App() {
  const [isLogged, setIsLogged] = useState(
    Boolean(localStorage.getItem('loggedIn'))
  )

  // Mantém isLogged sincronizado se mudar em outra aba
  useEffect(() => {
    const handleStorage = () => {
      setIsLogged(Boolean(localStorage.getItem('loggedIn')))
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        {/* Registro */}
        <Route path="/register" element={<RegisterPage />} />
        {/* Login */}
        <Route
          path="/login"
          element={<LoginPage onLogin={() => setIsLogged(true)} />}
        />

        {/* Todos os links */}
        <Route
          path="/links"
          element={
            isLogged 
              ? <LinksPage view="all" /> 
              : <Navigate to="/login" />
          }
        />

        {/* Meus links */}
        <Route
          path="/my-links"
          element={
            isLogged 
              ? <LinksPage view="mine" /> 
              : <Navigate to="/login" />
          }          
        />
        {/* Favoritos */}
        <Route
          path="/favorites"
          element={
            isLogged 
              ? <FavoritesPage onLogout={() => setIsLogged(false)} />
              : <Navigate to="/login" />
          }
        />
        {/* Logout */}
        <Route
          path="/logout"
          element={<Logout onLogout={() => setIsLogged(false)} />}
        />

        {/* Qualquer outro caminho redireciona ao login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  )
}
