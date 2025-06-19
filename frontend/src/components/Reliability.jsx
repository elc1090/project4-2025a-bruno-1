// src/components/Reliability.jsx
import { useEffect, useState } from 'react';
import api from '../services/api';

// opcional: expõe cache se precisar
export const reliabilityCache = {};

export default function Reliability({
  linkId,
  url,
  title,
  initialScore = null,
  onUpdate
}) {
  const [score, setScore] = useState(initialScore);
  const [error, setError] = useState(false);

  useEffect(() => {
    // dispara sempre que montar e o score for null ou -1
    if (score !== null && score !== -1) return;

    setError(false);
    api.post('/compare-reliability', { id: linkId, url, title })
      .then(res => {
        const val = res.data.confiabilidade;
        setScore(val);
        onUpdate(linkId, val);
        // persiste no back
        return api.put(`/links/${linkId}`, { confiabilidade: val });
      })
      .catch(err => {
        console.error(`erro ao calcular confiabilidade de ${url}:`, err);
        setError(true);
      });
  // reexecuta se linkId/url/title mudarem
  }, [linkId, url, title]);

  if (score === -1) {
    return <span className="text-sm text-gray-500 italic">sem suporte</span>;
  }
  if (error) {
    return <span className="text-sm text-red-500 italic">erro ao calcular</span>;
  }
  if (score == null) {
    return <span className="text-sm text-gray-400">calculando…</span>;
  }

  const pct = score * 100;
  let colorClass = '';
  let label = '';
  if (pct > 50) {
    colorClass = 'text-green-600';
    label = 'Confiável';
  } else if (pct >= 30) {
    colorClass = 'text-yellow-600';
    label = 'Moderado';
  } else {
    colorClass = 'text-red-600';
    label = 'Não confiável';
  }

  return (
    <span
      className={`text-sm font-medium ${colorClass}`}
      title={`Confiabilidade: ${pct.toFixed(1)}%`}
    >
      {label}
    </span>
  );
}
