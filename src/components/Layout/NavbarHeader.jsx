import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const NavbarAdmin = () => {
  const [currentPath, setCurrentPath] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownView, setDropdownView] = useState("menu");
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Obtener nombre del usuario desde el contexto
  const adminNombre = user?.name || user?.nombre_usu || "Administrador";

  useEffect(() => {
    setCurrentPath(window.location.pathname);
    const handlePopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
        setDropdownView("menu");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = (path) => {
    if (path === "/admin") {
      return currentPath === "/admin" || currentPath === "/admin/";
    }
    return currentPath.startsWith(path);
  };

  const notificaciones = [
    { id: 1, mensaje: "Nuevo usuario registrado", tiempo: "hace 5 min" },
    { id: 2, mensaje: "Venta de $450 confirmada", tiempo: "hace 2 h" },
    { id: 3, mensaje: "Stock bajo en producto 'Whisky X'", tiempo: "hace 6 h" },
    { id: 4, mensaje: "Actualización de sistema disponible", tiempo: "hace 1 día" },
  ];

  const closeDropdown = () => {
    setDropdownOpen(false);
    setDropdownView("menu");
  };

  const handleLogout = async () => {
    await logout(); // limpia contexto y localStorage
    closeDropdown();
    navigate("/");
  };

  const renderDropdownContent = () => {
    switch (dropdownView) {
      case "perfil":
        return (
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-3 pb-3 border-b border-white/10">
              <div className="w-12 h-12 rounded-full overflow-hidden border border-primary/30">
                <img
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBmsgEi_FuNq82-FFrNIijxbFD9pK7ptUSqTiyV9qTWJCh6z96GfTIYmt1JNdrXXxs2--B3zbA3x4PCLF1IsOf2gwjMDHU9QjOGWYSNRR7YcS0PAM11iHqGu6QcVrmFwPD5uOZjGueL3paouQor_dx8A4l0-yN5RVSmUlgtQgTfNBtKCqXs1TxwYK_hFAaBgm0JzH3Tj4aXnQ5TabZmn4VflM1r3sRxYivgSZyj9mdQ5rjANNXLL2Feclv9-NyPpBLXh9pB873PrxPS"
                  alt="Avatar"
                />
              </div>
              <div>
                <p className="font-label-md text-on-surface font-bold">{adminNombre}</p>
                <p className="text-xs text-on-surface-variant">Administrador</p>
              </div>
            </div>
            <div className="text-sm text-on-surface-variant">
              <p><span className="text-primary">Email:</span> {user?.email || user?.correo_usu || "admin@midnightcode.com"}</p>
              <p><span className="text-primary">Rol:</span> {user?.role || "Admin"}</p>
            </div>
            <button
              onClick={() => setDropdownView("menu")}
              className="w-full mt-2 py-1 rounded-lg bg-white/5 text-on-surface-variant hover:bg-white/10 transition-colors text-sm"
            >
              ← Volver
            </button>
          </div>
        );
      case "notificaciones":
        return (
          <div className="p-2 space-y-2">
            <div className="px-2 py-1 border-b border-white/10">
              <span className="font-label-md text-primary">Notificaciones</span>
            </div>
            {notificaciones.length === 0 ? (
              <p className="text-sm text-on-surface-variant p-2">No hay notificaciones</p>
            ) : (
              notificaciones.map((n) => (
                <div key={n.id} className="p-2 rounded-lg hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
                  <p className="text-sm text-on-surface">{n.mensaje}</p>
                  <span className="text-xs text-on-surface-variant opacity-70">{n.tiempo}</span>
                </div>
              ))
            )}
            <button
              onClick={() => setDropdownView("menu")}
              className="w-full mt-2 py-1 rounded-lg bg-white/5 text-on-surface-variant hover:bg-white/10 transition-colors text-sm"
            >
              ← Volver
            </button>
          </div>
        );
      default:
        return (
          <div className="py-2">
            <button
              onClick={() => setDropdownView("perfil")}
              className="w-full flex items-center gap-3 px-4 py-2 hover:bg-white/5 transition-colors text-left"
            >
              <span className="material-symbols-outlined text-primary">person</span>
              <span className="font-label-md text-on-surface">Ver perfil</span>
            </button>
            <button
              onClick={() => setDropdownView("notificaciones")}
              className="w-full flex items-center gap-3 px-4 py-2 hover:bg-white/5 transition-colors text-left"
            >
              <span className="material-symbols-outlined text-primary">notifications</span>
              <span className="font-label-md text-on-surface">Notificaciones</span>
            </button>
            <hr className="border-white/10 my-1" />
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 hover:bg-white/5 transition-colors text-left"
            >
              <span className="material-symbols-outlined text-error">logout</span>
              <span className="font-label-md text-on-surface">Cerrar sesión</span>
            </button>
          </div>
        );
    }
  };

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-surface/70 backdrop-blur-xl border-b border-white/10 shadow-[0_0_15px_rgba(233,179,255,0.1)] flex justify-between items-center px-margin-mobile md:px-margin-desktop py-4 max-w-full">
        {/* Logo */}
        <div className="font-headline-md text-headline-md font-bold text-primary tracking-tight">
          MIDNIGHTCODE
        </div>

        {/* Enlaces de navegación (solo desktop) */}
        <div className="hidden md:flex items-center gap-6">
          <a
            className={`font-label-md text-label-md transition-all duration-300 hover:bg-white/5 px-2 py-1 rounded ${
              isActive("/admin")
                ? "text-primary border-b-2 border-primary pb-1"
                : "text-on-surface-variant hover:text-primary"
            }`}
            href="/admin"
          >
            Overview
          </a>
          <a
            className={`font-label-md text-label-md transition-all duration-300 hover:bg-white/5 px-2 py-1 rounded ${
              isActive("/admin/canciones")
                ? "text-primary border-b-2 border-primary pb-1"
                : "text-on-surface-variant hover:text-primary"
            }`}
            href="/admin/canciones"
          >
            Canciones
          </a>
          <a
            className={`font-label-md text-label-md transition-all duration-300 hover:bg-white/5 px-2 py-1 rounded ${
              isActive("/admin/reservas")
                ? "text-primary border-b-2 border-primary pb-1"
                : "text-on-surface-variant hover:text-primary"
            }`}
            href="/admin/reservas"
          >
            Reservas
          </a>
          <a
            className={`font-label-md text-label-md transition-all duration-300 hover:bg-white/5 px-2 py-1 rounded ${
              isActive("/admin/horarios")
                ? "text-primary border-b-2 border-primary pb-1"
                : "text-on-surface-variant hover:text-primary"
            }`}
            href="/admin/horarios"
          >
            Horarios
          </a>
          <a
            className={`font-label-md text-label-md transition-all duration-300 hover:bg-white/5 px-2 py-1 rounded ${
              isActive("/admin/usuarios")
                ? "text-primary border-b-2 border-primary pb-1"
                : "text-on-surface-variant hover:text-primary"
            }`}
            href="/admin/usuarios"
          >
            Usuarios
          </a>
          <a
            className={`font-label-md text-label-md transition-all duration-300 hover:bg-white/5 px-2 py-1 rounded ${
              isActive("/admin/ventas")
                ? "text-primary border-b-2 border-primary pb-1"
                : "text-on-surface-variant hover:text-primary"
            }`}
            href="/admin/ventas"
          >
            Ventas
          </a>
          <a
            className={`font-label-md text-label-md transition-all duration-300 hover:bg-white/5 px-2 py-1 rounded ${
              isActive("/admin/productos")
                ? "text-primary border-b-2 border-primary pb-1"
                : "text-on-surface-variant hover:text-primary"
            }`}
            href="/admin/productos"
          >
            Productos
          </a>
          <a
            className={`font-label-md text-label-md transition-all duration-300 hover:bg-white/5 px-2 py-1 rounded ${
              isActive("/admin/eventos")
                ? "text-primary border-b-2 border-primary pb-1"
                : "text-on-surface-variant hover:text-primary"
            }`}
            href="/admin/eventos"
          >
            Eventos
          </a>
        </div>

        {/* Acciones: Avatar con dropdown */}
        <div className="flex items-center gap-4">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => {
                setDropdownOpen(!dropdownOpen);
                if (!dropdownOpen) setDropdownView("menu");
              }}
              className="w-8 h-8 rounded-full overflow-hidden border border-primary/30 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all duration-300 focus:outline-none"
            >
              <img
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBmsgEi_FuNq82-FFrNIijxbFD9pK7ptUSqTiyV9qTWJCh6z96GfTIYmt1JNdrXXxs2--B3zbA3x4PCLF1IsOf2gwjMDHU9QjOGWYSNRR7YcS0PAM11iHqGu6QcVrmFwPD5uOZjGueL3paouQor_dx8A4l0-yN5RVSmUlgtQgTfNBtKCqXs1TxwYK_hFAaBgm0JzH3Tj4aXnQ5TabZmn4VflM1r3sRxYivgSZyj9mdQ5rjANNXLL2Feclv9-NyPpBLXh9pB873PrxPS"
                alt="Avatar"
              />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-3 w-72 bg-surface-container/95 backdrop-blur-2xl border border-white/10 rounded-xl shadow-2xl z-50 max-h-[500px] overflow-y-auto custom-scrollbar">
                {renderDropdownContent()}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ===== ESTILOS DE RESPALDO ===== */}
      <style jsx>{`
        .bg-surface\\/70 {
          background-color: rgba(19, 19, 19, 0.7);
        }
        .bg-surface-container\\/95 {
          background-color: rgba(32, 31, 31, 0.95);
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
        .text-primary {
          color: #e9b3ff;
        }
        .text-on-surface {
          color: #e5e2e1;
        }
        .text-on-surface-variant {
          color: #d2c1d4;
        }
        .text-error {
          color: #ffb4ab;
        }
        .shadow-\\[0_0_15px_rgba\\(233\\,179\\,255\\,0\\.1\\)\\] {
          box-shadow: 0 0 15px rgba(233, 179, 255, 0.1);
        }
        .shadow-2xl {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
        .px-margin-mobile {
          padding-left: 16px;
          padding-right: 16px;
        }
        .md\\:px-margin-desktop {
          padding-left: 48px;
          padding-right: 48px;
        }
        .py-4 {
          padding-top: 1rem;
          padding-bottom: 1rem;
        }
        .px-2 {
          padding-left: 0.5rem;
          padding-right: 0.5rem;
        }
        .py-1 {
          padding-top: 0.25rem;
          padding-bottom: 0.25rem;
        }
        .pb-1 {
          padding-bottom: 0.25rem;
        }
        .gap-6 {
          gap: 1.5rem;
        }
        .gap-4 {
          gap: 1rem;
        }
        .gap-3 {
          gap: 0.75rem;
        }
        .w-8 {
          width: 2rem;
        }
        .h-8 {
          height: 2rem;
        }
        .w-72 {
          width: 18rem;
        }
        .w-12 {
          width: 3rem;
        }
        .h-12 {
          height: 3rem;
        }
        .max-h-\\[500px\\] {
          max-height: 500px;
        }
        .overflow-y-auto {
          overflow-y: auto;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e9b3ff;
          border-radius: 10px;
        }
        .font-headline-md {
          font-family: Montserrat, sans-serif;
          font-size: 24px;
          line-height: 32px;
          font-weight: 600;
        }
        .text-headline-md {
          font-size: 24px;
          line-height: 32px;
          font-weight: 600;
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
        .font-bold {
          font-weight: 700;
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
        .rounded-xl {
          border-radius: 0.75rem;
        }
        .rounded-lg {
          border-radius: 0.5rem;
        }
        .border-b-2 {
          border-bottom-width: 2px;
        }
        .border-b {
          border-bottom-width: 1px;
        }
        .border-primary {
          border-color: #e9b3ff;
        }
        .transition-all {
          transition: all 0.3s ease;
        }
        .duration-300 {
          transition-duration: 300ms;
        }
        .active\\:scale-95:active {
          transform: scale(0.95);
        }
        .hover\\:bg-white\\/5:hover {
          background-color: rgba(255, 255, 255, 0.05);
        }
        .hover\\:bg-white\\/10:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }
        .hover\\:ring-2:hover {
          --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);
          --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);
          box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);
        }
        .hover\\:ring-primary\\/50:hover {
          --tw-ring-color: rgba(233, 179, 255, 0.5);
        }
        .hover\\:text-primary:hover {
          color: #e9b3ff;
        }
        .object-cover {
          object-fit: cover;
        }
        .overflow-hidden {
          overflow: hidden;
        }
        .cursor-pointer {
          cursor: pointer;
        }
        .focus\\:outline-none:focus {
          outline: 2px solid transparent;
          outline-offset: 2px;
        }
        .relative {
          position: relative;
        }
        .absolute {
          position: absolute;
        }
        .right-0 {
          right: 0;
        }
        .mt-3 {
          margin-top: 0.75rem;
        }
        .mt-2 {
          margin-top: 0.5rem;
        }
        .my-1 {
          margin-top: 0.25rem;
          margin-bottom: 0.25rem;
        }
        .px-4 {
          padding-left: 1rem;
          padding-right: 1rem;
        }
        .py-2 {
          padding-top: 0.5rem;
          padding-bottom: 0.5rem;
        }
        .py-1 {
          padding-top: 0.25rem;
          padding-bottom: 0.25rem;
        }
        .p-4 {
          padding: 1rem;
        }
        .p-2 {
          padding: 0.5rem;
        }
        .pt-2 {
          padding-top: 0.5rem;
        }
        .pb-3 {
          padding-bottom: 0.75rem;
        }
        .z-50 {
          z-index: 50;
        }
        .flex {
          display: flex;
        }
        .items-center {
          align-items: center;
        }
        .justify-between {
          justify-content: space-between;
        }
        .hidden {
          display: none;
        }
        .block {
          display: block;
        }
        .text-xs {
          font-size: 0.75rem;
          line-height: 1rem;
        }
        .text-sm {
          font-size: 0.875rem;
          line-height: 1.25rem;
        }
        .text-\\[10px\\] {
          font-size: 10px;
        }
        .w-full {
          width: 100%;
        }
        .space-y-2 > * + * {
          margin-top: 0.5rem;
        }
        .space-y-3 > * + * {
          margin-top: 0.75rem;
        }
        .opacity-70 {
          opacity: 0.7;
        }
        .border-t {
          border-top-width: 1px;
        }
        .text-left {
          text-align: left;
        }

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

        @media (min-width: 768px) {
          .md\\:flex {
            display: flex;
          }
          .md\\:hidden {
            display: none;
          }
          .md\\:px-margin-desktop {
            padding-left: 48px;
            padding-right: 48px;
          }
        }
        @media (max-width: 768px) {
          .md\\:flex {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
};

export default NavbarAdmin;