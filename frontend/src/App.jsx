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

import './App.css'

function AppRoutes({ isLogged, setIsLogged, userEmail, setUserEmail }) {
  const location = useLocation()
  const navigate = useNavigate()

  // 1) Sincroniza isLogged se mudar em outra aba
  useEffect(() => {
    const handleStorage = () => {
      setIsLogged(Boolean(localStorage.getItem('loggedIn')))
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [setIsLogged])

  // 2) Se veio de login Google (?google=ok), marca login, busca /me e redireciona
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.get('google') === 'ok') {
      localStorage.setItem('loggedIn', 'true')
      setIsLogged(true)

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
          navigate('/links', { replace: true })
        })
    }
  }, [location.search, setIsLogged, setUserEmail, navigate])

  // 3) determina activeView pelo pathname
  const path = location.pathname
  let activeView = ''
  if (path === '/links') activeView = 'all'
  else if (path === '/my-links') activeView = 'mine'
  else if (path === '/favorites') activeView = 'favorites'

  // 4) Função de logout (remove localStorage e redireciona)
  const handleLogout = () => {
    setIsLogged(false)
    localStorage.removeItem('loggedIn')
    localStorage.removeItem('userEmail')
    navigate('/login', { replace: true })
  }

  return (
    <>
      <Routes>
        {/* Registro, Login */}
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/login"
          element={<LoginPage onLogin={() => setIsLogged(true)} />}
        />

        {/* Páginas protegidas */}
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
              <FavoritesPage onLogout={() => setIsLogged(false)} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/logout"
          element={<Logout onLogout={handleLogout} />}
        />

        {/* Qualquer outro caminho → login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  )
}

export default function App() {
  const [isLogged, setIsLogged] = useState(
    Boolean(localStorage.getItem('loggedIn'))
  )
  const [userEmail, setUserEmail] = useState(
    localStorage.getItem('userEmail') || ''
  )

  return (
    <BrowserRouter>
      <AppRoutes
        isLogged={isLogged}
        setIsLogged={setIsLogged}
        userEmail={userEmail}
        setUserEmail={setUserEmail}
      />
    </BrowserRouter>
  )
}
