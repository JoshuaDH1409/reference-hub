export default function SuperAdminDashboard() {
  const tenants = [
    { id: 1, nombre: "Acme Corp", plan: "Enterprise", creditos: 850, total: 1000, estatus: "Activo" },
    { id: 2, nombre: "TechNova", plan: "Pro", creditos: 150, total: 200, estatus: "Activo" },
    { id: 3, plane: "StartupXYZ", plan: "Basic", creditos: 48, total: 50, estatus: "Alerta" },
    { id: 4, nombre: "Global Industries", plan: "Enterprise", creditos: 4200, total: 5000, estatus: "Activo" },
    { id: 5, nombre: "DesignStudio", plan: "Basic", creditos: 50, total: 50, estatus: "Suspendido" },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-navy mb-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-accent-orange">admin_panel_settings</span>
            Super Admin
          </h1>
          <p className="text-blue-gray text-sm">Vista global de tenants, planes y consumos.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white border border-blue-gray-40 rounded-xl px-4 py-2 text-center">
            <div className="text-2xl font-bold text-navy">1,245</div>
            <div className="text-xs text-blue-gray uppercase tracking-wider font-bold">Total Tenants</div>
          </div>
          <div className="bg-white border border-blue-gray-40 rounded-xl px-4 py-2 text-center">
            <div className="text-2xl font-bold text-accent-orange">85%</div>
            <div className="text-xs text-blue-gray uppercase tracking-wider font-bold">Consumo Global</div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-blue-gray-20 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-blue-gray-20 bg-off-white flex justify-between items-center">
          <h2 className="font-bold text-navy">Listado de Tenants</h2>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-blue-gray text-sm">search</span>
            <input 
              type="text" 
              placeholder="Buscar tenant..." 
              className="pl-9 pr-4 py-2 text-sm border border-blue-gray-40 rounded-lg focus:outline-none focus:border-accent-orange"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {/* Dense data table -> text-xs for high legibility in dense formats */}
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-white text-charcoal border-b border-blue-gray-40 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-bold">ID</th>
                <th className="px-6 py-4 font-bold">Nombre del Tenant</th>
                <th className="px-6 py-4 font-bold">Plan</th>
                <th className="px-6 py-4 font-bold w-1/3">Consumo de Créditos</th>
                <th className="px-6 py-4 font-bold">Estatus</th>
                <th className="px-6 py-4 font-bold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-charcoal divide-y divide-blue-gray-20">
              {tenants.map((t) => (
                <tr key={t.id} className="hover:bg-off-white transition-colors">
                  <td className="px-6 py-3 font-mono text-blue-gray">#{t.id.toString().padStart(4, '0')}</td>
                  <td className="px-6 py-3 font-bold text-navy">{t.nombre || t.plane}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-1 rounded border font-bold ${
                      t.plan === 'Enterprise' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' :
                      t.plan === 'Pro' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                      'bg-gray-50 border-gray-200 text-gray-700'
                    }`}>
                      {t.plan}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-full h-2 bg-blue-gray-20 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${t.creditos / t.total > 0.9 ? 'bg-red-500' : t.creditos / t.total > 0.7 ? 'bg-accent-orange' : 'bg-navy'}`} 
                          style={{ width: `${(t.creditos / t.total) * 100}%` }}
                        ></div>
                      </div>
                      <span className="font-bold w-20 text-right">{t.creditos} / {t.total}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <span className={`flex items-center gap-1 font-bold ${
                      t.estatus === 'Activo' ? 'text-green-600' :
                      t.estatus === 'Alerta' ? 'text-accent-orange' :
                      'text-red-600'
                    }`}>
                      <span className="material-symbols-outlined text-[14px]">
                        {t.estatus === 'Activo' ? 'check_circle' : t.estatus === 'Alerta' ? 'warning' : 'cancel'}
                      </span>
                      {t.estatus}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button className="text-navy hover:text-accent-orange p-1 transition-colors" title="Editar">
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button className="text-navy hover:text-accent-orange p-1 transition-colors" title="Detalles">
                      <span className="material-symbols-outlined text-[18px]">visibility</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-blue-gray-20 bg-off-white flex justify-between items-center text-xs font-bold text-blue-gray">
          <span>Mostrando 1-5 de 1,245 tenants</span>
          <div className="flex gap-2">
            <button className="px-2 py-1 bg-white border border-blue-gray-40 rounded hover:bg-gray-50 text-charcoal">Anterior</button>
            <button className="px-2 py-1 bg-white border border-blue-gray-40 rounded hover:bg-gray-50 text-charcoal">Siguiente</button>
          </div>
        </div>
      </div>
    </div>
  );
}
