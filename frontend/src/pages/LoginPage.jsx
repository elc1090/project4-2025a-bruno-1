// src/pages/LoginPage.jsx
import LoginForm from '../components/LoginForm';
import { Link } from 'react-router-dom';

const BACKEND_URL = import.meta.env.VITE_API_URL;

export default function LoginPage({ onLogin }) {
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

        {/* ---------- Botão “Entrar com Google” --------- */}
        <a
          href={`${BACKEND_URL}/login/google`}
          className="w-full mb-5 flex items-center justify-center gap-3 px-5 py-3 rounded-xl bg-white text-gray-700 font-semibold shadow-md hover:shadow-lg transition-all duration-300 border border-gray-300 hover:bg-gray-100"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google logo"
            className="w-5 h-5"
          />
          Entrar com Google
        </a>

        {/* Formulário */}
        <LoginForm onLogin={onLogin} />

        {/* Link para registro */}
        <p className="mt-4 text-white text-sm">
          Não tem uma conta?{' '}
          <Link
            to="/register"
            className="text-indigo-300 hover:underline font-medium"
          >
            Registrar
          </Link>
        </p>
      </div>
    </main>
  );
}
