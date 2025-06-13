import { useEffect, useState } from 'react';
import api from '../services/api'; 

export const languageCache = {};

export default function LanguageDetection({ url, linkId, onLanguage }) {
  const [language, setLanguage] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    // 1) checa cache local
    if (languageCache[url]) {
      setLanguage(languageCache[url]);
      onLanguage && onLanguage(languageCache[url]);
      return;
    }

    // 2) checa se já temos valor no back
    // supondo que linkData.language venha no objeto link
    // se não tiver, omitimos essa etapa e vamos direto para fetch

    // 3) faz requisição à Cortical API
    api.post('/detect-language', { id: linkId, url })
      .then(res => {
        const lang = res.data.language_code || 'und';
        languageCache[url] = lang;
        setLanguage(lang);
        onLanguage && onLanguage(lang);

        // persiste no backend local
        api.put(`/links/${linkId}`, { language: lang })
          .catch(e => console.error(`falha ao gravar linguagem para ${url}:`, e));
      })
      .catch(err => {
        console.error(`erro ao detectar linguagem de ${url}:`, err);
        setError(true);
        languageCache[url] = 'und';
        setLanguage('und');
        onLanguage && onLanguage('und');

        // persiste sentinel de indefinido
        api.put(`/links/${linkId}`, { language: 'und' })
          .catch(e => console.error(`falha ao gravar linguagem indefinida para ${url}:`, e));
      });
  }, [url, linkId, onLanguage]);

  if (error) return <span className="text-sm text-red-500">erro ao detectar idioma</span>;
  if (!language) return <span className="text-sm text-gray-400">detectando idioma…</span>;
  if (language === 'und') return <span className="text-sm text-gray-500">idioma não detectado</span>;

  return (
    <span
      className="text-sm"
      title="Idioma"
    >
      {language.toUpperCase()}
    </span>
  );
}
