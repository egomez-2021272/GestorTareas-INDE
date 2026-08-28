import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, User, Activity, RefreshCw } from 'lucide-react';

export const BitacoraTab = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBitacora = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5214/api/auditlogs');
      setLogs(response.data);
    } catch (error) {
      console.error("Error cargando bitácora:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBitacora();
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-[#20242d] rounded-2xl border border-[#333a47] overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-[#333a47] flex justify-between items-center bg-[#2a2f3a]/50">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <Activity className="text-[#0aa5b5]" size={20} />
              <span>Historial de Acciones (Bitácora)</span>
            </h3>
            <p className="text-xs text-[#94a3b8] mt-1">
              Registro en tiempo real de las actividades realizadas por técnicos y administradores.
            </p>
          </div>
          <button
            onClick={fetchBitacora}
            disabled={loading}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#2a2f3a] text-white hover:bg-[#383f4f] transition-all border border-[#475569] disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span>Actualizar</span>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#94a3b8]">
            <thead className="bg-[#1a1d24] text-xs uppercase text-[#94a3b8] font-bold border-b border-[#333a47]">
              <tr>
                <th className="px-6 py-4 flex items-center space-x-1">
                  <Calendar size={14} />
                  <span>Fecha y Hora</span>
                </th>
                <th className="px-6 py-4">
                  <span className="flex items-center space-x-1">
                    <User size={14} />
                    <span>Usuario</span>
                  </span>
                </th>
                <th className="px-6 py-4">Acción Realizada</th>
                <th className="px-6 py-4">Descripción</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-[#94a3b8]">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <RefreshCw className="animate-spin text-[#0aa5b5]" size={28} />
                      <span className="text-sm">Cargando bitácora desde la base de datos...</span>
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-[#94a3b8]">
                    No hay registros de auditoría disponibles en la base de datos.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const isAdmin = log.userRole?.toUpperCase() === 'ADMINISTRADOR' || log.userRole?.toUpperCase() === 'ADMIN_ROLE';
                  return (
                    <tr key={log.id} className="border-b border-[#333a47] hover:bg-[#2a2f3a]/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-[#94a3b8]">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-semibold text-white">{log.userName}</span>
                          <span className="mt-1">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${
                              isAdmin 
                                ? 'bg-red-500/10 text-[#c95d5d] border-red-500/20' 
                                : 'bg-[#0aa5b5]/10 text-[#0aa5b5] border-[#0aa5b5]/20'
                            }`}>
                              {log.userRole || 'Técnico'}
                            </span>
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#2a2f3a] text-white border border-[#475569]">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-white max-w-xs truncate md:max-w-md">
                        {log.description}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
