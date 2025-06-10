import { useState } from 'react';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem');
      return;
    }
    
    try {
      await api.post('/register', { email, senha });
      navigate('/login');
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao registrar');
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-900 via-indigo-800 to-blue-700">
      <div className="flex flex-col items-center px-6 py-10 sm:px-8 lg:px-10 w-full max-w-md bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl">
        {/* Logo */}
        <img
          src="logo2.png"
          alt="Logo"
          className="w-36 h-auto mb-6"
        />

        {/* Nome do site */}
        <h1 className="text-3xl font-extrabold text-white tracking-wide mb-6 text-center drop-shadow-md">
          CompartilhaInfo
        </h1>

        {/* Container do formulário */}
        <div className="w-full">
          <h2 className="text-2xl font-semibold mb-6 text-center text-white drop-shadow-md">
            Registrar
          </h2>

          {/* Mensagem de erro */}
          {erro && (
            <div className="text-red-300 mb-4 text-sm font-medium text-center bg-red-900/20 backdrop-blur-sm border border-red-400/30 rounded-lg p-3">
              {erro}
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-300"
              required
            />
            <input
              type="password"
              placeholder="Senha"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-300"
              required
            />
            <input
              type="password"
              placeholder="Confirmar Senha"
              value={confirmarSenha}
              onChange={e => setConfirmarSenha(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-300"
              required
            />
            <button
              type="submit"
              className="w-full px-4 py-3 rounded-xl bg-indigo-600 text-white font-semibold shadow-md hover:bg-indigo-700 hover:shadow-lg transition-all duration-300 border border-indigo-500"
            >
              Registrar
            </button>
          </form>
        </div>

        {/* Link para login */}
        <p className="mt-4 text-white text-sm">
          Já tem uma conta?{' '}
          <Link
            to="/login"
            className="text-indigo-300 hover:underline font-medium"
          >
            Entrar
          </Link>
        </p>
      </div>
    </main>
  );
}