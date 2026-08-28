import React, { useState, useEffect } from 'react';

export const BitacoraTab = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock de llamada a la base de datos
    // Esto se conectaría con la base de datos en el backend real.
    const fetchBitacora = async () => {
      setLoading(true);
      try {
        // const response = await fetch('/api/bitacora');
        // const data = await response.json();
        // setLogs(data);
        
        // Datos simulados (mock)
        const mockData = [
          { id: 1, action: 'Creó un usuario', user: 'Admin Principal', date: new Date().toISOString() },
          { id: 2, action: 'Inició sesión', user: 'Carlos Técnico', date: new Date(Date.now() - 3600000).toISOString() },
          { id: 3, action: 'Actualizó estado de tarea a Completed', user: 'Carlos Técnico', date: new Date(Date.now() - 7200000).toISOString() },
        ];
        setTimeout(() => {
          setLogs(mockData);
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error("Error cargando bitácora:", error);
        setLoading(false);
      }
    };

    fetchBitacora();
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-[#20242d] rounded-2xl border border-[#333a47] overflow-hidden">
        <div className="p-6 border-b border-[#333a47] flex justify-between items-center bg-[#2a2f3a]/50">
          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
            Historial de Acciones
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#94a3b8]">
            <thead className="bg-[#1a1d24] text-xs uppercase text-[#94a3b8] font-bold">
              <tr>
                <th className="px-6 py-4">Fecha y Hora</th>
                <th className="px-6 py-4">Usuario</th>
                <th className="px-6 py-4">Acción Realizada</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="3" className="px-6 py-8 text-center">
                    Cargando bitácora...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-8 text-center">
                    No hay registros disponibles
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="border-b border-[#333a47] hover:bg-[#2a2f3a]/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(log.date).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-medium text-white">
                      {log.user}
                    </td>
                    <td className="px-6 py-4">
                      {log.action}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
