// src/pages/LoginPage.jsx
import LoginForm from '../components/LoginForm';
import { Link } from 'react-router-dom';

export default function LoginPage({onLogin}) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-900 via-indigo-800 to-blue-700">
      <div className="flex flex-col items-center px-4 py-8 sm:px-6 lg:px-8 w-full max-w-md">
        {/* Logo */}
        <img
          src="logo2.png"
          alt="Logo"
          className="w-36 h-46 mb-10"
        />
        {/* Nome do site */}
        <h1 className="text-3xl font-extrabold text-white tracking-wide mb-6 text-center">
          CompartilhaInfo
        </h1>
        {/* ---------- Botão “Entrar com Google” --------- */}
        <a
          href="http://localhost:5000/login/google"
          className="w-full mb-4 p-2 text-center rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors"
        >
          Entrar com Google
        </a>
        {/* Formulário */}
        <LoginForm onLogin={onLogin} />
        <p className="mt-4 text-white">
          Não tem uma conta? <Link to="/register" className="text-indigo-300 hover:underline">Registrar</Link>
        </p>
      </div>
    </main>
  );
}
