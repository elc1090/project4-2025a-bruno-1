import { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await api.post('/register', { email, senha });
      navigate('/login');
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao registrar');
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-900 via-indigo-800 to-blue-700">
      <div className="flex flex-col items-center px-4 py-8 sm:px-6 lg:px-8 w-full max-w-md">
        <img src="logo2.png" alt="Logo" className="w-36 h-46 mb-10" />
        <h1 className="text-3xl font-extrabold text-white tracking-wide mb-6 text-center">
          CompartilhaInfo
        </h1>
        <div className="bg-white/90 backdrop-blur p-6 rounded-xl shadow-lg w-full">
          <h2 className="text-2xl font-semibold mb-4 text-center text-gray-800">
            Registrar
          </h2>
          {erro && <div className="text-red-600 mb-3 text-sm font-medium">{erro}</div>}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full p-2 rounded-lg border border-gray-300 mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={e => setSenha(e.target.value)}
            className="w-full p-2 rounded-lg border border-gray-300 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            required
          />
          <button
            onClick={handleSubmit}
            className="w-full p-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition duration-200"
          >
            Registrar
          </button>
        </div>
      </div>
    </main>
  );
}