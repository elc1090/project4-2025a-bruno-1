// src/components/LoginForm.jsx
import { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useLoading } from '../utils/LoadingContext';

export default function LoginForm({onLogin}) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const navigate = useNavigate();
  const { setIsLoading } = useLoading()

  // Reseta campos toda vez que o componente monta
  useEffect(() => {
    setEmail('')
    setSenha('')
    setErro('')
  }, [])

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    setIsLoading(true);
    try {
      await api.post('/login', { email, senha });
      localStorage.setItem('loggedIn', 'true');
      localStorage.setItem('userEmail', email);
      onLogin();
      navigate('/links', { replace: true });
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro no login');
    } finally {
      setIsLoading(false);            
    }
  }

  return (
  <form
    onSubmit={handleSubmit}
    className="bg-white/90 backdrop-blur p-6 rounded-xl shadow-lg w-full"
  >
    <h2 className="text-2xl font-semibold mb-4 text-center text-gray-800">
      Login
    </h2>

    {erro && <div className="text-red-600 mb-3 text-sm font-medium">{erro}</div>}

    <input
      type="email"
      placeholder="Email"
      value={email}
      onChange={e => setEmail(e.target.value)}
      className="w-full p-2 rounded-lg border border-gray-300 mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
      autoComplete="email"
      required
    />

    <input
      type="password"
      placeholder="Senha"
      value={senha}
      onChange={e => setSenha(e.target.value)}
      className="w-full p-2 rounded-lg border border-gray-300 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-400"
      autoComplete="current-password"
      required
    />

    <button
      type="submit"
      className="w-full p-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition duration-200"
    >
      Entrar
    </button>
  </form>
)
}
