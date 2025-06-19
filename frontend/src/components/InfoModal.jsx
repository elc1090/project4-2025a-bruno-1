// src/components/InfoModal.jsx
import { Fragment, useState } from 'react'

export default function InfoModal() {
  const [open, setOpen] = useState(false)

  return (
    <Fragment>
      {/* Botão “(i)” */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Informações"
        className="ml-4 p-1 rounded-full hover:bg-white/20 transition"
      >
        {/* Ícone circular com “i” */}
        <svg
          className="w-6 h-6 text-white"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <circle cx="10" cy="10" r="9" fill="currentColor" opacity="0.3" />
          <text
            x="10"
            y="14"
            textAnchor="middle"
            fontSize="12"
            fontWeight="bold"
            fill="white"
          >
            i
          </text>
        </svg>
      </button>

      {/* O modal */}
      {open && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white max-w-md mx-4 p-6 rounded-lg shadow-lg"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Sobre o CompartilhaInfo</h2>
            <p className="mb-2 text-gray-700">
              O CompartilhaInfo usa a API <strong>Cortical.io</strong> para:
            </p>
            <ul className="list-disc list-inside space-y-1 mb-4 text-gray-700">
              <li>Extração de tags/keywords via análise semântica.</li>
              <li>Detecção de linguagem do conteúdo.</li>
              <li>Comparação de confiabilidade entre título escolhido e conteúdo da URL anexada.</li>              
            </ul>
            <p className="text-gray-700 mb-4">
              Para mais informações sobre a API acesse:{' '}
              <a
                href="https://api.cortical.io/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 underline"
              >
                https://api.cortical.io/
              </a>
            </p>
            <button
              onClick={() => setOpen(false)}
              className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </Fragment>
  )
}
