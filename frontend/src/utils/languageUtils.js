// src/utils/languageUtils.js

// Map de alguns dos idiomas mais falados no mundo
export const languageMap = {
  zh: 'Chinês',
  es: 'Espanhol',
  en: 'Inglês',
  hi: 'Hindi',
  ar: 'Árabe',
  bn: 'Bengali',
  pt: 'Português',
  ru: 'Russo',
  ja: 'Japonês',
  pa: 'Panjabi',
  de: 'Alemão',
  jv: 'Javanês',
  mr: 'Marata',
  te: 'Telugu',
  tr: 'Turco',
  ko: 'Coreano',
  ta: 'Tâmil',
  vi: 'Vietnamita',
  ur: 'Urdu',
  fa: 'Persa',
  fr: 'Francês',
  it: 'Italiano',
  und: 'Indefinido'
}

export function mapLanguageCode(code) {
  return languageMap[code] || code
}
