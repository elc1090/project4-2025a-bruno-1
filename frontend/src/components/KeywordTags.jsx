// src/components/KeywordTags.jsx
import { useEffect, useState } from 'react'
import api from '../services/api'

export default function KeywordTags({ url, linkData }) {
  const [tags, setTags] = useState(null)   // null = ainda carregando
  const [error, setError] = useState(false)

   useEffect(() => {
    // NOVO: Verificar se já temos tags no linkData
    if (linkData?.tags) {
      try {
        const cachedTags = JSON.parse(linkData.tags);
        setTags(cachedTags);
        return; // Não faz requisição se já tem tags
      } catch (err) {
        console.error('Erro ao parsear tags cached:', err);
      }
    }

    let cancel = false
    async function fetchTags() {
      try {
        const res = await api.post('/extract-keywords', { url })
        const keywords = (res.data.keywords || []).slice(0, 5)  // top-5
        if (!cancel) setTags(keywords)
      } catch (err) {
        console.error('Keyword error:', err)
        if (!cancel) setError(true)
      }
    }
    fetchTags()
    return () => (cancel = true)
  }, [url, linkData])

  if (error) return <p className="text-sm text-gray-500"></p>
  if (tags === null) return <p className="text-sm text-gray-400">carregando…</p>
  if (tags.length === 0) return <p className="text-sm text-gray-500">sem tags</p>

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {tags.map((kw, i) => (
        <span
          key={i}
          className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full text-xs font-medium"
        >
          {kw.word}
        </span>
      ))}
    </div>
  )
}
