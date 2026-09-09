import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AuthLogin() {
  const [vista, setVista] = useState('login'); // 'login' | 'recuperar'
  const navegar = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (vista === 'login') {
      navegar('/');
    } else {
      alert("Enlace de recuperación enviado (Demo)");
      setVista('login');
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-off-white font-sans selection:bg-accent-orange selection:text-white">

      {/* Sección Izquierda - Branding */}
      <div className="hidden lg:flex lg:w-[45%] bg-navy flex-col justify-between p-12 lg:p-20 text-off-white relative overflow-hidden">

        {/* Efectos de fondo sutiles para evitar empalmes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-accent-orange opacity-[0.03] rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[-10%] left-[-20%] w-[600px] h-[600px] bg-blue-gray opacity-[0.05] rounded-full blur-[120px]"></div>
        </div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-4 mt-8">
          <div className="w-12 h-12 bg-accent-orange rounded-xl shadow-lg shadow-accent-orange/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-2xl">hub</span>
          </div>
          <span className="font-extrabold text-3xl tracking-tight text-white">
            Reference<span className="text-accent-orange">Hub</span>
          </span>
        </div>

        {/* Mensaje Principal */}
        <div className="relative z-10 mb-20">
          <h1 className="text-5xl font-extrabold leading-[1.15] tracking-tight mb-8 text-white max-w-lg">
            Valida el talento con inteligencia.
          </h1>
          <p className="text-blue-gray text-xl leading-relaxed max-w-md font-light">
            Automatiza y analiza las referencias profesionales de tus candidatos en segundos.
          </p>
        </div>

        {/* Footer Branding */}
        <div className="relative z-10 text-sm text-blue-gray/60 font-medium">
          &copy; {new Date().getFullYear()} Reference Hub. Portfolio prototype.
        </div>
      </div>

      {/* Sección Derecha - Formulario */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-6 sm:p-12 lg:p-20 relative">

        {/* Logo versión móvil */}
        <div className="absolute top-8 left-8 lg:hidden flex items-center gap-3">
          <div className="w-10 h-10 bg-accent-orange rounded-xl shadow-md flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-xl">hub</span>
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-navy">
            Reference<span className="text-accent-orange">Hub</span>
          </span>
        </div>

        <div className="w-full max-w-[440px] mt-16 lg:mt-0">

          <div className="mb-12">
            <h2 className="text-4xl font-extrabold text-navy tracking-tight mb-3">
              {vista === 'login' ? 'Bienvenido de nuevo' : 'Recuperar acceso'}
            </h2>
            <p className="text-blue-gray text-lg font-light">
              {vista === 'login'
                ? 'Ingresa tus credenciales para continuar.'
                : 'Ingresa tu correo y te enviaremos los pasos.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Input Correo */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-navy ml-1">Correo Electrónico</label>
              <div className="flex items-center bg-white border border-gray-200 rounded-2xl group focus-within:border-accent-orange focus-within:ring-4 focus-within:ring-accent-orange/10 transition-all duration-300 shadow-sm overflow-hidden">
                <div className="pl-4 pr-3 flex items-center justify-center text-blue-gray group-focus-within:text-accent-orange transition-colors duration-300 pointer-events-none">
                  <span className="material-symbols-outlined">mail</span>
                </div>
                <input 
                  type="email" 
                  required
                  placeholder="ejemplo@empresa.com"
                  className="flex-1 py-3.5 pr-4 bg-transparent border-none shadow-none focus:ring-0 text-charcoal text-base focus:outline-none w-full"
                  style={{ border: 'none', outline: 'none', boxShadow: 'none' }}
                />
              </div>
            </div>

            {/* Input Contraseña (Solo Login) */}
            {vista === 'login' && (
              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="block text-sm font-semibold text-navy">Contraseña</label>
                  <button
                    type="button"
                    onClick={() => setVista('recuperar')}
                    className="text-sm font-medium text-blue-gray hover:text-accent-orange transition-colors duration-200"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <div className="flex items-center bg-white border border-gray-200 rounded-2xl group focus-within:border-accent-orange focus-within:ring-4 focus-within:ring-accent-orange/10 transition-all duration-300 shadow-sm overflow-hidden">
                  <div className="pl-4 pr-3 flex items-center justify-center text-blue-gray group-focus-within:text-accent-orange transition-colors duration-300 pointer-events-none">
                    <span className="material-symbols-outlined">lock</span>
                  </div>
                  <input 
                    type="password" 
                    required
                    placeholder="••••••••"
                    className="flex-1 py-3.5 pr-4 bg-transparent border-none shadow-none focus:ring-0 text-charcoal text-base focus:outline-none w-full"
                    style={{ border: 'none', outline: 'none', boxShadow: 'none' }}
                  />
                </div>
              </div>
            )}

            {/* Botón Submit */}
            <button
              type="submit"
              className="w-full bg-navy text-white font-semibold py-4 rounded-2xl text-lg flex items-center justify-center gap-2 hover:bg-accent-orange transition-all duration-300 shadow-lg shadow-navy/20 hover:shadow-accent-orange/30 mt-8 group"
            >
              {vista === 'login' ? 'Iniciar Sesión' : 'Enviar Enlace'}
              <span className="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform duration-300">
                {vista === 'login' ? 'arrow_forward' : 'send'}
              </span>
            </button>

          </form>

          {/* Botón Volver (Solo Recuperar) */}
          {vista === 'recuperar' && (
            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={() => setVista('login')}
                className="text-sm font-semibold text-blue-gray flex items-center justify-center gap-2 mx-auto hover:text-navy transition-colors duration-200"
              >
                <span className="material-symbols-outlined text-lg">arrow_back</span>
                Volver al Login
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
