import React from "react";

const NavbarAdmin = () => {
  return (
    <>
      {/* ===== TOP NAVBAR (header fijo) ===== */}
      <header className="fixed top-0 w-full z-50 bg-surface/70 backdrop-blur-xl border-b border-white/10 shadow-[0_0_20px_rgba(233,179,255,0.1)] flex justify-between items-center px-margin-desktop h-20">
        <div className="flex items-center gap-md">
          <span className="font-display-lg text-display-lg text-primary tracking-tight">
            Afterdark Pulse
          </span>
          <div className="hidden md:flex items-center bg-surface-variant/50 rounded-full px-sm py-xs border border-white/5 ml-lg">
            <span className="material-symbols-outlined text-on-surface-variant mr-xs">
              search
            </span>
            <input
              className="bg-transparent border-none focus:ring-0 text-label-md text-on-surface placeholder:text-on-surface-variant w-64"
              placeholder="Buscar artista o canción..."
              type="text"
            />
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-lg">
          <a className="text-on-surface-variant hover:text-primary transition-colors font-label-md" href="#">
            Soporte
          </a>
          <div className="flex items-center gap-sm">
            <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">
              notifications
            </button>
            <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">
              settings
            </button>
            <div className="w-10 h-10 rounded-full overflow-hidden border border-primary/30">
              <img
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCA9fJYVHyhJ7RSNPnlwBKtrfpZZnA4Unoge_5ATGmAXuncTpzFwRmyqtnoEuIuAh8a03bb7AwoH08JyXaPF0y6gjtcQw-elYhtD2baFp5qMDUxKsSAXUwfycNCige0jahPT3dbEcETlivolg5WO5hGx4_IKpv7VRjiB-f_93yJ22SHjiubbxyRPj8AxiGkZ-wd2roSY70Sj8IPfbZj_JDMwWCJ4b16kBO6kQDGr-BEpA6d9i_3J_0JsKVSfhH--zDIthlljZO3biWm"
                alt="Admin Avatar"
              />
            </div>
          </div>
        </nav>
      </header>

      {/* ===== SIDE NAVBAR (solo desktop) ===== */}
      <aside className="fixed left-0 top-0 h-full w-64 z-40 bg-surface-container/80 backdrop-blur-2xl border-r border-white/10 shadow-xl hidden md:flex flex-col py-lg gap-base pt-24">
        <div className="px-md mb-base">
          <p className="font-label-md text-primary opacity-70 uppercase tracking-widest">
            Menú Principal
          </p>
        </div>
        <nav className="flex flex-col flex-1">
          <a
            className="flex items-center px-md py-sm text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-all active:translate-x-1 duration-150 gap-sm"
            href="#"
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-label-md">Dashboard</span>
          </a>
          <a
            className="flex items-center px-md py-sm text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-all active:translate-x-1 duration-150 gap-sm"
            href="#"
          >
            <span className="material-symbols-outlined">monitoring</span>
            <span className="font-label-md">Analytics</span>
          </a>
          <a
            className="flex items-center px-md py-sm text-primary border-r-2 border-primary bg-primary/5 transition-all active:translate-x-1 duration-150 gap-sm"
            href="#"
          >
            <span className="material-symbols-outlined">music_note</span>
            <span className="font-label-md">Music/Songs</span>
          </a>
          <a
            className="flex items-center px-md py-sm text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-all active:translate-x-1 duration-150 gap-sm"
            href="#"
          >
            <span className="material-symbols-outlined">calendar_today</span>
            <span className="font-label-md">Events/Schedules</span>
          </a>
          <a
            className="flex items-center px-md py-sm text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-all active:translate-x-1 duration-150 gap-sm"
            href="#"
          >
            <span className="material-symbols-outlined">layers</span>
            <span className="font-label-md">VIP Floor</span>
          </a>
          <a
            className="flex items-center px-md py-sm text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-all active:translate-x-1 duration-150 gap-sm"
            href="#"
          >
            <span className="material-symbols-outlined">group</span>
            <span className="font-label-md">Users</span>
          </a>
          <a
            className="flex items-center px-md py-sm text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-all active:translate-x-1 duration-150 gap-sm"
            href="#"
          >
            <span className="material-symbols-outlined">inventory_2</span>
            <span className="font-label-md">Inventory</span>
          </a>
        </nav>
        <div className="mt-auto px-md flex flex-col gap-xs">
          <a
            className="flex items-center py-xs text-on-surface-variant hover:text-on-surface transition-colors gap-sm"
            href="#"
          >
            <span className="material-symbols-outlined">help</span>
            <span className="font-label-md text-label-md">Support</span>
          </a>
          <a
            className="flex items-center py-xs text-on-surface-variant hover:text-on-surface transition-colors gap-sm"
            href="#"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="font-label-md text-label-md">Logout</span>
          </a>
        </div>
      </aside>

      {/* ===== ESTILOS DE RESPALDO (por si faltan en tu Tailwind config) ===== */}
      <style jsx>{`
        /* Colores personalizados */
        .bg-surface {
          background-color: #131313;
        }
        .bg-surface\\/70 {
          background-color: rgba(19, 19, 19, 0.7);
        }
        .bg-surface-container\\/80 {
          background-color: rgba(32, 31, 31, 0.8);
        }
        .bg-surface-variant\\/50 {
          background-color: rgba(53, 53, 52, 0.5);
        }
        .bg-primary\\/5 {
          background-color: rgba(233, 179, 255, 0.05);
        }
        .bg-white\\/5 {
          background-color: rgba(255, 255, 255, 0.05);
        }
        .border-white\\/10 {
          border-color: rgba(255, 255, 255, 0.1);
        }
        .border-white\\/5 {
          border-color: rgba(255, 255, 255, 0.05);
        }
        .border-primary\\/30 {
          border-color: rgba(233, 179, 255, 0.3);
        }
        .border-r-2.border-primary {
          border-right-color: #e9b3ff;
        }
        .text-primary {
          color: #e9b3ff;
        }
        .text-on-surface {
          color: #e5e2e1;
        }
        .text-on-surface-variant {
          color: #d2c1d4;
        }
        .hover\\:text-primary:hover {
          color: #e9b3ff;
        }
        .hover\\:bg-white\\/5:hover {
          background-color: rgba(255, 255, 255, 0.05);
        }
        .hover\\:bg-primary\\/20:hover {
          background-color: rgba(233, 179, 255, 0.2);
        }
        /* Espaciados */
        .px-margin-desktop {
          padding-left: 48px;
          padding-right: 48px;
        }
        .px-md {
          padding-left: 24px;
          padding-right: 24px;
        }
        .px-sm {
          padding-left: 12px;
          padding-right: 12px;
        }
        .py-sm {
          padding-top: 12px;
          padding-bottom: 12px;
        }
        .py-xs {
          padding-top: 4px;
          padding-bottom: 4px;
        }
        .pt-24 {
          padding-top: 6rem;
        }
        .gap-md {
          gap: 24px;
        }
        .gap-sm {
          gap: 12px;
        }
        .gap-lg {
          gap: 40px;
        }
        .gap-xs {
          gap: 4px;
        }
        .gap-base {
          gap: 8px;
        }
        .ml-lg {
          margin-left: 40px;
        }
        .mr-xs {
          margin-right: 4px;
        }
        .mb-base {
          margin-bottom: 8px;
        }
        .mt-auto {
          margin-top: auto;
        }
        /* Fuentes y tamaños */
        .font-display-lg {
          font-family: Montserrat, sans-serif;
          font-size: 48px;
          line-height: 56px;
          letter-spacing: -0.02em;
          font-weight: 800;
        }
        .text-display-lg {
          font-size: 48px;
          line-height: 56px;
          letter-spacing: -0.02em;
          font-weight: 800;
        }
        .font-label-md {
          font-family: Inter, sans-serif;
          font-size: 14px;
          line-height: 20px;
          letter-spacing: 0.05em;
          font-weight: 600;
        }
        .text-label-md {
          font-size: 14px;
          line-height: 20px;
          letter-spacing: 0.05em;
          font-weight: 600;
        }
        .tracking-tight {
          letter-spacing: -0.02em;
        }
        .tracking-widest {
          letter-spacing: 0.1em;
        }
        .uppercase {
          text-transform: uppercase;
        }
        .opacity-70 {
          opacity: 0.7;
        }
        /* Sombras y efectos */
        .shadow-\\[0_0_20px_rgba\\(233\\,179\\,255\\,0\\.1\\)\\] {
          box-shadow: 0 0 20px rgba(233, 179, 255, 0.1);
        }
        .shadow-xl {
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        .backdrop-blur-xl {
          backdrop-filter: blur(20px);
        }
        .backdrop-blur-2xl {
          backdrop-filter: blur(40px);
        }
        .rounded-full {
          border-radius: 9999px;
        }
        /* Responsive: ocultar en móvil */
        @media (max-width: 768px) {
          .md\\:flex {
            display: none !important;
          }
          .md\\:hidden {
            display: flex !important;
          }
        }
        /* Hover y transiciones */
        .transition-all {
          transition-property: all;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          transition-duration: 150ms;
        }
        .transition-colors {
          transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          transition-duration: 150ms;
        }
        .active\\:translate-x-1:active {
          transform: translateX(4px);
        }
        .hover\\:brightness-110:hover {
          filter: brightness(1.1);
        }
        .focus\\:ring-0:focus {
          box-shadow: none;
        }
        /* Para el input */
        .border-none {
          border: none;
        }
        .bg-transparent {
          background-color: transparent;
        }
        .w-64 {
          width: 16rem;
        }
        .w-10 {
          width: 2.5rem;
        }
        .h-10 {
          height: 2.5rem;
        }
        .h-20 {
          height: 5rem;
        }
        .w-full {
          width: 100%;
        }
        .h-full {
          height: 100%;
        }
        .object-cover {
          object-fit: cover;
        }
        .overflow-hidden {
          overflow: hidden;
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

export default NavbarAdmin;