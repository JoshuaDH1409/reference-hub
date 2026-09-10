import { Routes, Route, NavLink, useLocation, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import Candidatos from './pages/Candidatos.jsx';
import Expediente from './pages/Expediente.jsx';
import Correos from './pages/Correos.jsx';

// Nuevas Vistas
import Consentimiento from './pages/Consentimiento.jsx';
import CuestionarioPublico from './pages/CuestionarioPublico.jsx';
import Reportes from './pages/Reportes.jsx';
import AuthLogin from './pages/AuthLogin.jsx';
import ConfigTenant from './pages/ConfigTenant.jsx';
import SuperAdminDashboard from './pages/SuperAdminDashboard.jsx';
import Agente from './pages/Agente.jsx';

function LayoutAdmin({ children }) {
  const location = useLocation();
  const isSuperAdmin = location.pathname.startsWith('/superadmin');

  return (
    <div className="theme-app">
      <aside className="theme-sidebar" id="sidebar">
        <div className="theme-brand">
          <div className="theme-brand-mark">IA</div>
          <div className="theme-brand-text">
            <strong>EstrategIA</strong>
            <span>Tecnológica · Analytics</span>
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '18px', flex: 1, marginTop: '18px' }}>
          {isSuperAdmin ? (
            <div>
              <div className="theme-nav-section-title">Global</div>
              <ul className="theme-nav-list">
                <li className={`theme-nav-item ${location.pathname === '/superadmin' ? 'active' : ''}`}>
                  <Link to="/superadmin" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <span className="left">
                      <span className="material-symbols-outlined theme-icon">admin_panel_settings</span>
                      Tenants
                    </span>
                    <span>›</span>
                  </Link>
                </li>
              </ul>
            </div>
          ) : (
            <>
              <div>
                <div className="theme-nav-section-title">General</div>
                <ul className="theme-nav-list">
                  <li className={`theme-nav-item ${location.pathname === '/' ? 'active' : ''}`}>
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <span className="left">
                        <svg className="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 11.5 12 4l9 7.5"/><path d="M5 10.5V20h14v-9.5"/></svg>
                        Dashboard
                      </span>
                      <span>›</span>
                    </Link>
                  </li>
                  <li className={`theme-nav-item ${location.pathname.startsWith('/candidatos') ? 'active' : ''}`}>
                    <Link to="/candidatos" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <span className="left">
                        <svg className="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>
                        Candidatos
                      </span>
                      <span>›</span>
                    </Link>
                  </li>
                  <li className={`theme-nav-item ${location.pathname.startsWith('/correos') ? 'active' : ''}`}>
                    <Link to="/correos" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <span className="left">
                        <svg className="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z"/></svg>
                        Mensajes
                      </span>
                      <span>›</span>
                    </Link>
                  </li>
                  <li className={`theme-nav-item ${location.pathname.startsWith('/reportes') ? 'active' : ''}`}>
                    <Link to="/reportes" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <span className="left">
                        <svg className="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 19V5l16 7-16 7Z"/></svg>
                        Reportes
                      </span>
                      <span>›</span>
                    </Link>
                  </li>
                  <li className={`theme-nav-item ${location.pathname.startsWith('/agente') ? 'active' : ''}`}>
                    <Link to="/agente" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <span className="left">
                        <svg className="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/></svg>
                        Agente IA
                      </span>
                      <span>›</span>
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <div className="theme-nav-section-title">Configuración</div>
                <ul className="theme-nav-list">
                  <li className={`theme-nav-item ${location.pathname.startsWith('/configuracion') ? 'active' : ''}`}>
                    <Link to="/configuracion" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <span className="left">
                        <svg className="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7Z"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-.4-1.1 1.7 1.7 0 0 0-1-.6 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H2.8a2 2 0 1 1 0-4H2.9a1.7 1.7 0 0 0 1.1-.4 1.7 1.7 0 0 0 .6-1 1.7 1.7 0 0 0-.34-1.87L4.2 6.27a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6c.38 0 .74-.13 1-.36.26-.25.4-.6.4-.99V3a2 2 0 1 1 4 0v.1c0 .39.14.74.4.99.26.23.62.36 1 .36.4 0 .76-.14 1.03-.4l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06c-.5.5-.65 1.23-.34 1.87.11.37.34.7.66.95.28.24.65.37 1.05.37h.1a2 2 0 1 1 0 4h-.1c-.4 0-.77.13-1.05.37-.32.25-.55.58-.66.95Z"/></svg>
                        Ajustes
                      </span>
                      <span>›</span>
                    </Link>
                  </li>
                </ul>
              </div>
            </>
          )}
        </nav>
        
        <div className="theme-sidebar-footer">
          <div><strong>Empresa:</strong> EstrategIA Tecnológica</div>
          <div style={{ marginTop: '6px' }}>
            <Link to="/login" style={{ color: 'rgba(234, 242, 245, 0.8)' }}>Cerrar sesión</Link>
          </div>
        </div>
      </aside>
      
      <main className="theme-main">
        <header className="theme-topbar">
          <div className="theme-topbar-left">
            <button className="theme-menu-btn" id="menuBtn" aria-label="Abrir menú" onClick={() => document.getElementById('sidebar').classList.toggle('open')}>
              <svg className="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
            </button>
            <div className="theme-search">
              <svg className="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path></svg>
              <input type="text" placeholder="Buscar candidatos, vacantes, reportes..." />
            </div>
          </div>

          <div className="theme-topbar-right">
            <button className="theme-tool-btn" aria-label="Notificaciones">
              <span className="theme-badge">5</span>
              <svg className="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/></svg>
            </button>

            <div className="theme-profile">
              <div className="theme-avatar">MF</div>
              <div className="theme-profile-copy">
                <strong>María Fernanda</strong>
                <span>Gerente de Operaciones</span>
              </div>
            </div>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Vistas Públicas / Autenticación */}
      <Route path="/login" element={<AuthLogin />} />
      <Route path="/consentimiento" element={<Consentimiento />} />
      <Route path="/responder/:token" element={<CuestionarioPublico />} />

      {/* Vistas de Administración (Tenant) */}
      <Route path="/" element={<LayoutAdmin><Dashboard /></LayoutAdmin>} />
      <Route path="/candidatos" element={<LayoutAdmin><Candidatos /></LayoutAdmin>} />
      <Route path="/candidatos/:id" element={<LayoutAdmin><Expediente /></LayoutAdmin>} />
      <Route path="/correos" element={<LayoutAdmin><Correos /></LayoutAdmin>} />
      <Route path="/reportes" element={<LayoutAdmin><Reportes /></LayoutAdmin>} />
      <Route path="/agente" element={<LayoutAdmin><Agente /></LayoutAdmin>} />
      <Route path="/configuracion" element={<LayoutAdmin><ConfigTenant /></LayoutAdmin>} />
      
      {/* Vista Súper Admin */}
      <Route path="/superadmin" element={<LayoutAdmin><SuperAdminDashboard /></LayoutAdmin>} />
    </Routes>
  );
}
