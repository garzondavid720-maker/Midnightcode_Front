// components/NavbarUsuario.jsx
import React, { useState } from "react";

const NavbarUsuario = () => {
  const [notifOpen, setNotifOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Notificaciones de ejemplo
  const notifications = [
    { id: 1, text: "Nueva canción añadida a la playlist", time: "hace 5 min" },
    { id: 2, text: "Tu reserva para el VIP está confirmada", time: "hace 2 h" },
    { id: 3, text: "Evento 'Noche de electrónica' comienza en 1 día", time: "hace 6 h" },
    { id: 4, text: "Actualización de seguridad disponible", time: "hace 1 día" },
  ];

  return (
    <>
      {/* ===== HEADER FIJO ===== */}
      <header className="fixed top-0 w-full z-50 bg-surface/70 backdrop-blur-xl border-b border-white/10 shadow-[0_0_20px_rgba(233,179,255,0.1)] flex justify-between items-center px-margin-mobile md:px-margin-desktop h-20">
        <div className="flex items-center gap-md">
          <span className="font-display-lg text-display-lg text-primary tracking-tight">
            MIDNIGHTCODE
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-lg">
          {/* Opcional: enlace de soporte en el header */}
          <a className="text-on-surface-variant hover:text-primary transition-colors font-label-md" href="#">
            Soporte
          </a>

          <div className="flex items-center gap-sm relative">
            {/* Botón Notificaciones con dropdown */}
            <div className="relative">
              <button
                className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors"
                onClick={() => setNotifOpen(!notifOpen)}
              >
                notifications
              </button>
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-surface-container/95 backdrop-blur-2xl border border-white/10 rounded-xl shadow-2xl py-2 z-50">
                  <div className="px-4 py-2 border-b border-white/10">
                    <span className="font-label-md text-primary">Notificaciones</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto custom-scrollbar">
                    {notifications.map((n) => (
                      <div key={n.id} className="px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
                        <p className="text-sm text-on-surface">{n.text}</p>
                        <span className="text-xs text-on-surface-variant opacity-70">{n.time}</span>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2 border-t border-white/10 text-center">
                    <a href="#" className="text-primary text-xs font-label-md hover:underline">Ver todas</a>
                  </div>
                </div>
              )}
            </div>

            {/* Botón Configuración con menú hamburguesa */}
            <div className="relative">
              <button
                className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors"
                onClick={() => setSettingsOpen(!settingsOpen)}
              >
                settings
              </button>
              {settingsOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-surface-container/95 backdrop-blur-2xl border border-white/10 rounded-xl shadow-2xl py-2 z-50">
                  <a href="#" className="flex items-center gap-3 px-4 py-2 hover:bg-white/5 transition-colors">
                    <span className="material-symbols-outlined text-primary">person</span>
                    <span className="font-label-md text-on-surface">Mi Perfil</span>
                  </a>
                  <a href="#" className="flex items-center gap-3 px-4 py-2 hover:bg-white/5 transition-colors">
                    <span className="material-symbols-outlined text-primary">palette</span>
                    <span className="font-label-md text-on-surface">Tema</span>
                  </a>
                  <a href="#" className="flex items-center gap-3 px-4 py-2 hover:bg-white/5 transition-colors">
                    <span className="material-symbols-outlined text-primary">security</span>
                    <span className="font-label-md text-on-surface">Seguridad</span>
                  </a>
                  <hr className="border-white/10 my-1" />
                  <a href="#" className="flex items-center gap-3 px-4 py-2 hover:bg-white/5 transition-colors">
                    <span className="material-symbols-outlined text-primary">help</span>
                    <span className="font-label-md text-on-surface">Ayuda</span>
                  </a>
                </div>
              )}
            </div>

            {/* Avatar */}
            <div className="w-10 h-10 rounded-full overflow-hidden border border-primary/30">
              <img
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCA9fJYVHyhJ7RSNPnlwBKtrfpZZnA4Unoge_5ATGmAXuncTpzFwRmyqtnoEuIuAh8a03bb7AwoH08JyXaPF0y6gjtcQw-elYhtD2baFp5qMDUxKsSAXUwfycNCige0jahPT3dbEcETlivolg5WO5hGx4_IKpv7VRjiB-f_93yJ22SHjiubbxyRPj8AxiGkZ-wd2roSY70Sj8IPfbZj_JDMwWCJ4b16kBO6kQDGr-BEpA6d9i_3J_0JsKVSfhH--zDIthlljZO3biWm"
                alt="Avatar"
              />
            </div>
          </div>
        </nav>
      </header>

      {/* ===== SIDEBAR FIJO ===== */}
      <aside className="fixed left-0 top-0 h-full w-64 z-40 bg-surface-container/80 backdrop-blur-2xl border-r border-white/10 shadow-xl hidden md:flex flex-col py-lg gap-base pt-24">
        <div className="px-md mb-base">
          <p className="font-label-md text-primary opacity-70 uppercase tracking-widest">Menú</p>
        </div>
        <nav className="flex flex-col flex-1">
          {/* HOME - Activo por defecto */}
          <a className="flex items-center px-md py-sm text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-all active:translate-x-1 duration-150 gap-sm" href="/usuario">
            <span className="material-symbols-outlined">home</span>
            <span className="font-label-md">Home</span>
          </a>
          <a className="flex items-center px-md py-sm text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-all active:translate-x-1 duration-150 gap-sm" href="/usuario/cancion">
            <span className="material-symbols-outlined">music_note</span>
            <span className="font-label-md">Canciones</span>
          </a>
          <a className="flex items-center px-md py-sm text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-all active:translate-x-1 duration-150 gap-sm" href="/usuario/reserva">
            <span className="material-symbols-outlined">event_available</span>
            <span className="font-label-md">Reserva</span>
          </a>
          <a className="flex items-center px-md py-sm text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-all active:translate-x-1 duration-150 gap-sm" href="/usuario/menu">
            <span className="material-symbols-outlined">restaurant_menu</span>
            <span className="font-label-md">Menú</span>
          </a>
          <a className="flex items-center px-md py-sm text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-all active:translate-x-1 duration-150 gap-sm" href="/usuario/evento">
            <span className="material-symbols-outlined">calendar_today</span>
            <span className="font-label-md">Eventos</span>
          </a>
        </nav>
        <div className="mt-auto px-md flex flex-col gap-xs">
          <a className="flex items-center py-xs text-on-surface-variant hover:text-on-surface transition-colors gap-sm" href="/">
            <span className="material-symbols-outlined">logout</span>
            <span className="font-label-md text-label-md">Cerrar sesión</span>
          </a>
        </div>
      </aside>

      {/* ===== ESTILOS DE RESPALDO ===== */}
      <style jsx>{`
        /* Colores y fondos oscuros */
        .bg-surface\\/70 { background-color: rgba(19, 19, 19, 0.7); }
        .bg-surface-container\\/80 { background-color: rgba(32, 31, 31, 0.8); }
        .bg-surface-container\\/95 { background-color: rgba(32, 31, 31, 0.95); }
        .bg-primary\\/5 { background-color: rgba(233, 179, 255, 0.05); }
        .bg-white\\/5 { background-color: rgba(255, 255, 255, 0.05); }
        .border-white\\/10 { border-color: rgba(255, 255, 255, 0.1); }
        .border-white\\/5 { border-color: rgba(255, 255, 255, 0.05); }
        .border-primary\\/30 { border-color: rgba(233, 179, 255, 0.3); }
        .text-primary { color: #e9b3ff; }
        .text-on-surface { color: #e5e2e1; }
        .text-on-surface-variant { color: #d2c1d4; }
        .hover\\:text-primary:hover { color: #e9b3ff; }
        .hover\\:bg-white\\/5:hover { background-color: rgba(255, 255, 255, 0.05); }
        /* Espaciados */
        .px-margin-mobile { padding-left: 16px; padding-right: 16px; }
        .md\\:px-margin-desktop { padding-left: 48px; padding-right: 48px; }
        .px-md { padding-left: 24px; padding-right: 24px; }
        .py-sm { padding-top: 12px; padding-bottom: 12px; }
        .py-xs { padding-top: 4px; padding-bottom: 4px; }
        .pt-24 { padding-top: 6rem; }
        .gap-md { gap: 24px; }
        .gap-sm { gap: 12px; }
        .gap-lg { gap: 40px; }
        .gap-xs { gap: 4px; }
        .gap-base { gap: 8px; }
        .mb-base { margin-bottom: 8px; }
        .mt-auto { margin-top: auto; }
        /* Fuentes */
        .font-display-lg { font-family: Montserrat, sans-serif; font-size: 48px; line-height: 56px; letter-spacing: -0.02em; font-weight: 800; }
        .text-display-lg { font-size: 48px; line-height: 56px; letter-spacing: -0.02em; font-weight: 800; }
        .font-label-md { font-family: Inter, sans-serif; font-size: 14px; line-height: 20px; letter-spacing: 0.05em; font-weight: 600; }
        .text-label-md { font-size: 14px; line-height: 20px; letter-spacing: 0.05em; font-weight: 600; }
        .tracking-tight { letter-spacing: -0.02em; }
        .tracking-widest { letter-spacing: 0.1em; }
        .uppercase { text-transform: uppercase; }
        .opacity-70 { opacity: 0.7; }
        /* Sombras y efectos */
        .shadow-\\[0_0_20px_rgba\\(233\\,179\\,255\\,0\\.1\\)\\] { box-shadow: 0 0 20px rgba(233,179,255,0.1); }
        .shadow-xl { box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04); }
        .shadow-2xl { box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); }
        .backdrop-blur-xl { backdrop-filter: blur(20px); }
        .backdrop-blur-2xl { backdrop-filter: blur(40px); }
        .rounded-xl { border-radius: 0.75rem; }
        .rounded-full { border-radius: 9999px; }
        .transition-all { transition: all 0.15s ease; }
        .transition-colors { transition: color, background-color, border-color 0.15s ease; }
        .active\\:translate-x-1:active { transform: translateX(4px); }
        /* Scroll personalizado para notificaciones */
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e9b3ff; border-radius: 10px; }
        /* Responsive */
        @media (max-width: 768px) {
          .md\\:flex { display: none !important; }
          .md\\:hidden { display: flex !important; }
        }
        /* Íconos */
        .material-symbols-outlined {
          font-family: "Material Symbols Outlined";
          font-weight: normal;
          font-style: normal;
          font-size: 24px;
          line-height: 1;
          letter-spacing: normal;
          text-transform: none;
          display: inline-block;
          white-space: nowrap;
          word-wrap: normal;
          direction: ltr;
          -webkit-font-feature-settings: "liga";
          -webkit-font-smoothing: antialiased;
        }
      `}</style>
    </>
  );
};

export default NavbarUsuario;