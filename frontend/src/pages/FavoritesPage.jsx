// src/pages/FavoritesPage.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import SearchFiltered from '../components/SearchFiltered'
import LoadMore from '../components/LoadMore'
import Header from '../components/Header'
import KeywordTags from '../components/KeywordTags'
import LanguageDetection from '../components/LanguageDetection'
import Reliability from '../components/Reliability'
import { mapLanguageCode } from '../utils/languageUtils'

export default function FavoritesPage({ onLogout }) {
  const [favorites, setFavorites] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterBy, setFilterBy] = useState('title')
  const [selectedLanguage, setSelectedLanguage] = useState('all')
  const [visibleCount, setVisibleCount] = useState(6);
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportTarget, setReportTarget] = useState(null)

  // Pega o email do usuário logado
  const userEmail = localStorage.getItem('userEmail') || 'Usuário'
  const navigate = useNavigate()

  // Carrega apenas os links que o usuário favoritou
  const loadFavorites = () => {
    api.get('/favorites')
      .then(res => setFavorites(res.data))
      .catch(err => console.error(err))
  }

  useEffect(loadFavorites, [])

  // Apagar favorito (não apaga o link em si, apenas o vínculo de favorito)
  const handleRemoveFavorite = async (linkId) => {
    await api.delete(`/favorites/${linkId}`)
    loadFavorites()
  }

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('loggedIn')
    onLogout()
    navigate('/login')
  }

  /**** MODAL DE DENÚNCIA ****/
  const openReportModal = (link) => {
    setReportTarget(link)
    setShowReportModal(true)
  }
  const closeReportModal = () => {
    setShowReportModal(false)
    setReportTarget(null)
  }
  const handleReportSubmit = (reason) => {
    alert(`Obrigado por reportar o link "${reportTarget.titulo}" como "${reason}".`)
    closeReportModal()
  }

  /**** FILTRO DE BUSCA ****/
  const filteredFavs = favorites.filter((l) => {
    const term = searchTerm.toLowerCase().trim()
    if (!term) return true

    const author = l.user_email?.split('@')[0] ?? ''
    const date = new Date(l.data_adicao).toLocaleDateString('pt-BR')
    const tags = Array.isArray(l.tags) ? l.tags.join(' ') : l.tags ?? ''

    return [l.titulo, l.url, author, date, tags]
      .filter(Boolean).map(s => s.toLowerCase()).join(' ').includes(term)
  }).filter(l => selectedLanguage === 'all' || l.language === selectedLanguage)

  // Define o número de links a serem exibidos por vez
  const visibleLinks = filteredFavs.slice(0, visibleCount);

  // Função para carregar mais links
  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 6);
  };

  const availableLangs = ['all', ...new Set(favorites.map(l => l.language).filter(Boolean))]

  return (
    <div className="w-full min-h-screen flex flex-col bg-gray-100">
      {/* -------- HEADER -------- */}
      <Header
              activeView="favorites"        
              userEmail={userEmail}
              onLogout={handleLogout}
            />

      {/* -------- ESPAÇO ENTRE HEADER E CONTEÚDO -------- */}
      <div className="h-4 bg-gray-100"></div>

      {/* -------- FORMULÁRIO DE ADIÇÃO -------- */}
      <main className="flex-1 w-full px-6 md:px-8 lg:px-10 py-4 max-w-[1280px] mx-auto">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Seus Favoritos</h2>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
          <SearchFiltered
            filterBy={filterBy}
            onFilterChange={setFilterBy}
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            onClear={() => setSearchTerm('')}
          />
          <div>
            <label className="mr-2 text-sm font-medium text-gray-900">Filtrar idioma:</label>
            <select value={selectedLanguage} onChange={e => setSelectedLanguage(e.target.value)} className="border rounded p-1 text-sm">
              {availableLangs.map(code => (
                <option key={code} value={code}>
                  {code === 'all' ? 'Todos' : mapLanguageCode(code)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Grid de cards (favoritos) */}
        {filteredFavs.length === 0 ? (
          <p className="text-center text-gray-500 mt-10">
            Você ainda não favoritou nenhum link.
          </p>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
            {visibleLinks.map((l) => {
              const authorName = l.user_email.split('@')[0]
              const addedAt = new Date(l.data_adicao).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })

              return (
                <div
                  key={l.id}
                  className="bg-white p-6 rounded-lg shadow-md border border-gray-200"
                >
                  {/* Título + Ícone de Desfavoritar (ou desfavoritar) */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-800">
                      {l.titulo}
                    </h3>
                    <div className="flex items-center space-x-2">
                      {/* Clicando aqui, remove de favorito */}
                      <button
                        onClick={() => handleRemoveFavorite(l.id)}
                        title="Remover dos Favoritos"
                        className="text-lg text-yellow-600 hover:text-yellow-800 p-1 bg-transparent border-none outline-none"
                      >
                        ★
                      </button>
                      {/* Botão de denúncia */}
                        <button
                          onClick={() => openReportModal(l)}
                          title="Reportar"
                          className="text-lg text-red-500 hover:text-red-700 p-1 bg-transparent border-none outline-none"
                        >
                          📢
                        </button>
                      </div>
                  </div>

                  {/* Link clicável */}
                  <a
                    href={l.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-indigo-700 mt-3 truncate hover:underline"
                  >
                    {l.url}
                  </a>

                  {l.titulo && l.url && (<KeywordTags url={l.url} linkData={l} />)}

                  <div className="flex justify-between text-sm text-gray-500 mt-4">
                    <span title={'Data/hora de adição'}>{addedAt}</span>
                    <span title={'Autor'}>{authorName}</span>
                    {l.titulo && l.url && (
                      <>
                        <LanguageDetection
                          key={`lang-${l.id}-${l.url}`}
                          url={l.url}
                          linkId={l.id}
                          onLanguage={() => {}}
                        />
                        <Reliability
                          key={`rel-${l.id}-${l.url}-${l.titulo}`}
                          url={l.url}
                          title={l.titulo}
                          linkId={l.id}
                          initialScore={l.confiabilidade}
                          onUpdate={() => {}}
                        />
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
        <LoadMore
        hasMore={visibleCount < filteredFavs.length}
        onClick={handleLoadMore}
        />
      </main>     

      {/* -------- FOOTER -------- */}
      <footer className="bg-gray-900 text-gray-300 text-center p-6 w-full">
        &copy; {new Date().getFullYear()} CompartilhaInfo. Todos os direitos reservados.
      </footer>

      {/* -------- MODAL DE DENÚNCIA -------- */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h3 className="text-xl font-semibold mb-4">Reportar link</h3>
            <p className="mb-4 text-gray-700">Por que você quer reportar este link?</p>
            <div className="space-y-2">
              {['Fake News', 'Conteúdo Inapropriado', 'Link Quebrado', 'Outro'].map((reason) => (
                <button
                  key={reason}
                  onClick={() => handleReportSubmit(reason)}
                  className="w-full text-left px-4 py-2 bg-gray-800 hover:bg-gray-200 rounded"
                >
                  {reason}
                </button>
              ))}
            </div>
            <button
              onClick={closeReportModal}
              className="mt-4 text-sm text-red-500 hover:underline"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
