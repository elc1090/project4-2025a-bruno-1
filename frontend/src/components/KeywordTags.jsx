// src/components/KeywordTags.jsx
import { useEffect, useState } from 'react'
import api from '../services/api'

// Cache global: mapeia URL → [tag1, tag2, …]
const tagCache = {}

export default function KeywordTags({ url, linkData }) {
  const [tags, setTags] = useState(null)   // null = ainda não carregou nada
  const [error, setError] = useState(false)

  useEffect(() => {
    const raw = linkData?.tags

    // 0) se já foi marcado como sem tags (sentinela ['null']), cache vazio e sai
    if (Array.isArray(raw) && raw.length === 1 && raw[0] === 'null') {
      tagCache[url] = []
      setTags([])
      return
    }

    // 1) se já temos no cache global, usa de cara e sai
    if (tagCache[url]) {
      setTags(tagCache[url])
      return
    }

    // 2) se o back já trouxe tags (array não-vazio), popula cache e sai
    if (Array.isArray(raw) && raw.length > 0) {
      tagCache[url] = raw
      setTags(raw)
      return
    }

    // 3) se chegou até aqui, busca UMA ÚNICA vez na API
    api
      .post('/extract-keywords', { url })
      .then(res => {
        const kws = (Array.isArray(res.data.keywords) ? res.data.keywords : [])
          .slice(0, 5)
          .map(item => (typeof item === 'string' ? item : item.word))
          .filter(Boolean)

        const tagsToSave = kws.length > 0 ? kws : ['null']

        // cache e state
        tagCache[url] = tagsToSave
        setTags(tagsToSave)

        // persiste no back (links/:id)
        api.put(`/links/${linkData.id}`, { tags: tagsToSave })
          .catch(err => console.error(`falha ao gravar sentinel para ${url}:`, err))
      })
      .catch(err => {
        console.error(`erro ao extrair tags de ${url}:`, err)

        // marca no cache para não tentar de novo
        tagCache[url] = []
        setTags([])

        // e persiste sentinela no back para futuros loads
        api.put(`/links/${linkData.id}`, { tags: ['null'] })
          .catch(e => console.error(`falha ao gravar sentinel após erro para ${url}:`, e))
      })
  }, [url, linkData?.tags])

  
  if (error)         return <p className="text-sm text-gray-500"></p>
  if (tags === null) return <p className="text-sm text-gray-400">carregando…</p>
  if (tags.length === 0) return <p className="text-sm text-gray-500">sem tags</p>

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {tags.map((kw, i) => (
        <span
          key={i}
          className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full text-xs font-medium"
        >
          {kw}
        </span>
      ))}
    </div>
  )
}
