// src/components/SearchFiltered.jsx
import InfoModal from './InfoModal'
export default function SearchFiltered({ searchTerm, onSearchTermChange, onClear }) {
  return (
    <div className="w-full max-w-[1280px] mx-auto px-6 py-4 flex items-center space-x-4">
      {/* Botão de info */}
      <InfoModal />
      <input
        type="text"
        placeholder="Buscar por título, autor, data ou tags…"
        value={searchTerm}
        onChange={(e) => onSearchTermChange(e.target.value)}
        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
      />
    </div>
  );
}
