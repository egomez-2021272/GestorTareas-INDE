import React from 'react';
import { X } from 'lucide-react';
import LogoInde from '../../../assets/img/indelogo.png';

export const TermsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-[#20242d] rounded-2xl border border-[#333a47] w-full max-w-[600px] max-h-[80vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#333a47] bg-[#2a2f3a]">
          <div className="flex items-center space-x-2">
            <img src={LogoInde} alt="Logo" className="h-6" />
            <h3 className="font-bold text-white text-sm">Términos y Condiciones</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 text-sm text-[#94a3b8] space-y-4">
          <h4 className="text-white font-semibold mb-2">1. Aceptación de los Términos</h4>
          <p>
            Al registrarse y utilizar el Gestor de Tareas INDE, usted acepta estar sujeto a estos términos y condiciones. Si no está de acuerdo con alguna parte de los términos, no podrá acceder al sistema.
          </p>

          <h4 className="text-white font-semibold mt-4 mb-2">2. Uso del Sistema</h4>
          <p>
            El sistema de gestión de tareas es de uso exclusivo para las actividades relacionadas con los proyectos y operaciones del INDE. Queda estrictamente prohibido su uso para fines personales o ajenos a la institución.
          </p>

          <h4 className="text-white font-semibold mt-4 mb-2">3. Privacidad y Datos</h4>
          <p>
            Toda la información ingresada, incluyendo datos personales y detalles operativos de las tareas, es confidencial y será tratada según las políticas de privacidad y seguridad de la información del INDE.
          </p>

          <h4 className="text-white font-semibold mt-4 mb-2">4. Responsabilidad de la Cuenta</h4>
          <p>
            Usted es responsable de mantener la confidencialidad de sus credenciales de acceso y de todas las actividades que ocurran bajo su cuenta. Notifique inmediatamente a administración si sospecha de un uso no autorizado.
          </p>
          
          <h4 className="text-white font-semibold mt-4 mb-2">5. Modificaciones</h4>
          <p>
            El INDE se reserva el derecho de modificar o reemplazar estos términos en cualquier momento. El uso continuado del sistema después de cualquier cambio constituye su aceptación de los nuevos términos.
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#333a47] bg-[#2a2f3a] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="bg-[#0aa5b5] hover:bg-[#22c1d3] text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
