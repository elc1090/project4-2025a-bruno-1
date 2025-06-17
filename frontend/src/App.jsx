// src/App.jsx
import { useState, useEffect } from 'react'
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate
} from 'react-router-dom'
import api from './services/api'

import RegisterPage from './pages/RegisterPage'
import LoginPage from './pages/LoginPage'
import LinksPage from './pages/LinksPage'
import FavoritesPage from './pages/FavoritesPage'
import Logout from './components/Logout'

import PrivacyPolicy from './PrivacyPolicy'
import TermsOfService from './TermsOfService'

import { LoadingProvider, useLoading } from './utils/LoadingContext'
import LoadingModal from './components/LoadingModal'

import './App.css'

// Componente de inicialização: faz um ping inicial para acordar o servidor
function AppInitializer() {
  const { setIsLoading } = useLoading()
  useEffect(() => {
    setIsLoading(true)
    api.get('/')
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [setIsLoading])
  return null
}

function AppRoutesWrapper() {
  const [isLogged, setIsLogged] = useState(
    Boolean(localStorage.getItem('loggedIn'))
  )
  const [userEmail, setUserEmail] = useState(
    localStorage.getItem('userEmail') || ''
  )

  const location = useLocation()
  const navigate = useNavigate()

  // Sincroniza login entre abas
  useEffect(() => {
    const handleStorage = () => {
      setIsLogged(Boolean(localStorage.getItem('loggedIn')))
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  // Fluxo pós Google OAuth
  const { setIsLoading } = useLoading()
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.get('google') === 'ok') {
      localStorage.setItem('loggedIn', 'true')
      setIsLogged(true)

      setIsLoading(true)
      api.get('/me')
        .then(res => {
          if (res.data.logged_in) {
            setUserEmail(res.data.email)
            localStorage.setItem('userEmail', res.data.email)
          }
        })
        .catch(() => {
          setIsLogged(false)
          localStorage.removeItem('loggedIn')
          localStorage.removeItem('userEmail')
        })
        .finally(() => {
          setIsLoading(false)
          navigate('/links', { replace: true })
        })
    }
  }, [location.search, navigate])

  // Determina tab ativa
  const path = location.pathname
  let activeView = ''
  if (path === '/links') activeView = 'all'
  else if (path === '/my-links') activeView = 'mine'
  else if (path === '/favorites') activeView = 'favorites'

  // Logout
  const handleLogout = () => {
    setIsLogged(false)
    localStorage.removeItem('loggedIn')
    localStorage.removeItem('userEmail')
    navigate('/login', { replace: true })
  }

  return (
    <>
      <LoadingModal visible={useLoading().isLoading} />
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/login"
          element={<LoginPage onLogin={() => setIsLogged(true)} />}
        />
        <Route
          path="/links"
          element={
            isLogged ? (
              <LinksPage view="all" />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/my-links"
          element={
            isLogged ? (
              <LinksPage view="mine" />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/favorites"
          element={
            isLogged ? (
              <FavoritesPage onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/logout"
          element={<Logout onLogout={handleLogout} />}
        />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <LoadingProvider>
      <BrowserRouter>
        <AppInitializer />
        <AppRoutesWrapper />
      </BrowserRouter>
    </LoadingProvider>
  )
}
