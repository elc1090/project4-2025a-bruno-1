import { useEffect, useState, useRef } from 'react';
import api from '../services/api';

export const reliabilityCache = {};

export default function Reliability({ url, title, linkId, onUpdate }) {
  const [score, setScore] = useState(null);
  const [error, setError] = useState(false);

  // ref pra garantir que só tentamos UMA vez
  const hasTriedRef = useRef(false);

  useEffect(() => {
    // se já tentou (sucesso ou erro), não faz nada
    if (hasTriedRef.current) return;

    hasTriedRef.current = true;

    // 1) se tiver em cache local, usa direto
    if (reliabilityCache[url] != null) {
      setScore(reliabilityCache[url]);
      onUpdate?.(linkId, reliabilityCache[url]);
      return;
    }

    // 2) dispara a comparação
    api.post('/compare-reliability', { id: linkId, url, title })
      .then(res => {
        const raw = res.data.confiabilidade;
        const val = parseFloat(raw);
        if (Number.isNaN(val)) {
          throw new Error(`Inválido: ${raw}`);
        }
        reliabilityCache[url] = val;
        setScore(val);
        onUpdate?.(linkId, val);
        // 3) persiste no backend
        return api.put(`/links/${linkId}`, { confiabilidade: val });
      })
      .catch(err => {
        // anota erro e para por aqui
        console.error(`erro ao calcular confiabilidade de ${url}:`,
          err.response?.data || err.message || err);
        setError(true);
      });
    // ⬇️ array vazio: só corre uma vez, ao montar
  }, []);

  if (error) {
    return <span className="text-sm text-red-500"></span>;
  }
  if (score == null) {
    return <span className="text-sm text-gray-400">calculando…</span>;
  }
  
  // Definição de estilo e label
  const pct = score * 100;
  let colorClass, label;
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
    <span className={`text-sm font-medium ${colorClass}`} title={`Confiabilidade: ${pct.toFixed(1)}%`}>
      {label} ({pct.toFixed(1)}%)
    </span>
    );
}
