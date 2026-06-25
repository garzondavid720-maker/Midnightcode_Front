import React, { useState, useEffect } from "react";
import { usuarioService } from "../../../services/usuarioService";
import NavbarAdmin from "../../../components/Layout/NavbarHeader";

const AdminUsuarios = () => {
  // ===== ESTADOS =====
  const [usuarios, setUsuarios] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  // Modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [usuarioActual, setUsuarioActual] = useState({
    id: null,
    nombre: "",
    email: "",
    rol: "",
    turno: "",
    estado: "Activo",
  });

  // Toast
  const [toast, setToast] = useState({ visible: false, mensaje: "", tipo: "" });

  // ===== CARGAR DATOS =====
  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    setLoading(true);
    try {
      const data = await usuarioService.getAll();
      setUsuarios(data);
      localStorage.setItem("afterdark_usuarios", JSON.stringify(data));
    } catch (err) {
      const stored = localStorage.getItem("afterdark_usuarios");
      if (stored) {
        setUsuarios(JSON.parse(stored));
        mostrarToast("Datos cargados desde caché local", "info");
      } else {
        setUsuarios([]);
        mostrarToast("Error al cargar usuarios", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  // ===== TOAST =====
  const mostrarToast = (mensaje, tipo = "success") => {
    setToast({ visible: true, mensaje, tipo });
    setTimeout(() => setToast({ visible: false, mensaje: "", tipo: "" }), 3000);
  };

  // ===== CRUD =====
  const handleCreate = async (nuevoUsuario) => {
    try {
      const created = await usuarioService.create(nuevoUsuario);
      const updated = [...usuarios, created];
      setUsuarios(updated);
      localStorage.setItem("afterdark_usuarios", JSON.stringify(updated));
      mostrarToast("Usuario agregado correctamente", "success");
      cerrarModal();
    } catch (err) {
      const tempId = Date.now();
      const nuevo = { ...nuevoUsuario, id: tempId };
      const updated = [...usuarios, nuevo];
      setUsuarios(updated);
      localStorage.setItem("afterdark_usuarios", JSON.stringify(updated));
      mostrarToast("Usuario guardado localmente (sin conexión)", "info");
      cerrarModal();
    }
  };

  const handleUpdate = async (id, data) => {
    try {
      const updated = await usuarioService.update(id, data);
      const updatedList = usuarios.map((u) => (u.id === id ? updated : u));
      setUsuarios(updatedList);
      localStorage.setItem("afterdark_usuarios", JSON.stringify(updatedList));
      mostrarToast("Usuario actualizado", "success");
      cerrarModal();
    } catch (err) {
      const updatedList = usuarios.map((u) =>
        u.id === id ? { ...u, ...data } : u
      );
      setUsuarios(updatedList);
      localStorage.setItem("afterdark_usuarios", JSON.stringify(updatedList));
      mostrarToast("Actualizado localmente (sin conexión)", "info");
      cerrarModal();
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este usuario?")) return;
    try {
      await usuarioService.remove(id);
      const filtered = usuarios.filter((u) => u.id !== id);
      setUsuarios(filtered);
      localStorage.setItem("afterdark_usuarios", JSON.stringify(filtered));
      mostrarToast("Usuario eliminado", "success");
    } catch (err) {
      const filtered = usuarios.filter((u) => u.id !== id);
      setUsuarios(filtered);
      localStorage.setItem("afterdark_usuarios", JSON.stringify(filtered));
      mostrarToast("Eliminado localmente (sin conexión)", "info");
    }
  };

  // ===== MODAL =====
  const abrirModalCrear = () => {
    setModoEdicion(false);
    setUsuarioActual({ id: null, nombre: "", email: "", rol: "", turno: "", estado: "Activo" });
    setModalAbierto(true);
  };

  const abrirModalEditar = (usuario) => {
    setModoEdicion(true);
    setUsuarioActual(usuario);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setUsuarioActual({ id: null, nombre: "", email: "", rol: "", turno: "", estado: "Activo" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (modoEdicion) {
      handleUpdate(usuarioActual.id, usuarioActual);
    } else {
      handleCreate(usuarioActual);
    }
  };

  const handleChange = (e) => {
    setUsuarioActual({ ...usuarioActual, [e.target.name]: e.target.value });
  };

  // ===== FILTRO Y ESTADÍSTICAS =====
  const usuariosFiltrados = usuarios.filter((u) =>
    u.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.rol?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalUsuarios = usuarios.length;
  const activos = usuarios.filter(u => u.estado === "Activo").length;
  const inactivos = usuarios.filter(u => u.estado === "Inactivo").length;
  const roles = usuarios.reduce((acc, u) => {
    acc[u.rol] = (acc[u.rol] || 0) + 1;
    return acc;
  }, {});

  // ===== RENDER =====
  return (
    <>
      {/* ===== NAVBAR ===== */}
      <NavbarAdmin />

      {/* ===== ESTILOS (solo los que necesita el contenido) ===== */}
      <style>{`
        body {
          background-color: #050505;
          color: #e5e2e1;
          scroll-behavior: smooth;
        }
        .glass-card {
          background: rgba(28, 28, 30, 0.7);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.8);
        }
        .neon-glow-primary {
          box-shadow: 0 0 12px 2px rgba(233, 179, 255, 0.3);
        }
        .neon-border-primary {
          border: 1px solid #e9b3ff;
          box-shadow: inset 0 0 4px rgba(233, 179, 255, 0.2), 0 0 8px rgba(233, 179, 255, 0.2);
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e9b3ff;
          border-radius: 10px;
        }
        .status-active {
          color: #e9b3ff;
          text-shadow: 0 0 10px rgba(233, 179, 255, 0.5);
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s infinite ease-in-out;
        }

        .bg-surface { background-color: #131313; }
        .bg-surface-container { background-color: #201f1f; }
        .bg-surface-container-high { background-color: #2a2a2a; }
        .bg-surface-container-highest { background-color: #353534; }
        .bg-surface-container-low { background-color: #1c1b1b; }
        .bg-surface-variant { background-color: #353534; }
        .text-on-surface { color: #e5e2e1; }
        .text-on-surface-variant { color: #d2c1d4; }
        .text-primary { color: #e9b3ff; }
        .bg-primary { background-color: #e9b3ff; }
        .text-on-primary { color: #510074; }
        .bg-primary-container { background-color: #c863fb; }
        .text-secondary { color: #ffb2b7; }
        .bg-secondary { background-color: #ffb2b7; }
        .bg-secondary-container { background-color: #d00242; }
        .text-on-secondary { color: #67001c; }
        .text-tertiary { color: #e7c448; }
        .bg-tertiary { background-color: #e7c448; }
        .bg-error { background-color: #ffb4ab; }
        .text-error { color: #ffb4ab; }
        .text-on-error { color: #690005; }
        .border-primary { border-color: #e9b3ff; }
        .border-secondary { border-color: #ffb2b7; }
        .border-white/10 { border-color: rgba(255,255,255,0.1); }
        .border-white/5 { border-color: rgba(255,255,255,0.05); }
        .bg-white/5 { background-color: rgba(255,255,255,0.05); }
        .bg-white/10 { background-color: rgba(255,255,255,0.1); }
        .bg-primary/5 { background-color: rgba(233,179,255,0.05); }
        .bg-primary/10 { background-color: rgba(233,179,255,0.1); }
        .bg-primary/20 { background-color: rgba(233,179,255,0.2); }
        .bg-secondary/10 { background-color: rgba(255,178,183,0.1); }
        .bg-secondary/20 { background-color: rgba(255,178,183,0.2); }
        .bg-tertiary/5 { background-color: rgba(231,196,72,0.05); }
        .bg-tertiary/20 { background-color: rgba(231,196,72,0.2); }
        .bg-surface-container-highest/30 { background-color: rgba(53,53,52,0.3); }
        .bg-error/5 { background-color: rgba(255,180,171,0.05); }
        .bg-error/10 { background-color: rgba(255,180,171,0.1); }
        .bg-error/20 { background-color: rgba(255,180,171,0.2); }
        .border-error/30 { border-color: rgba(255,180,171,0.3); }
        .border-error/20 { border-color: rgba(255,180,171,0.2); }
        .border-tertiary/30 { border-color: rgba(231,196,72,0.3); }
        .shadow-primary/20 { box-shadow: 0 4px 14px rgba(233,179,255,0.2); }
        .shadow-[0_0_8px_#ffb2b7] { box-shadow: 0 0 8px #ffb2b7; }
        .shadow-[0_0_5px_#e9b3ff] { box-shadow: 0 0 5px #e9b3ff; }
        .shadow-[0_0_20px_rgba(233,179,255,0.1)] { box-shadow: 0 0 20px rgba(233,179,255,0.1); }

        .font-headline-lg { font-family: 'Montserrat', sans-serif; }
        .font-headline-md { font-family: 'Montserrat', sans-serif; }
        .font-body-md { font-family: 'Inter', sans-serif; }
        .font-label-md { font-family: 'Inter', sans-serif; }
        .font-stats-number { font-family: 'Montserrat', sans-serif; }
        .font-display-lg { font-family: 'Montserrat', sans-serif; }

        .text-headline-lg { font-size: 32px; line-height: 40px; letter-spacing: -0.01em; font-weight: 700; }
        .text-headline-md { font-size: 24px; line-height: 32px; font-weight: 600; }
        .text-body-md { font-size: 16px; line-height: 24px; font-weight: 400; }
        .text-label-md { font-size: 14px; line-height: 20px; letter-spacing: 0.05em; font-weight: 600; }
        .text-stats-number { font-size: 36px; line-height: 44px; font-weight: 700; }
        .text-display-lg { font-size: 48px; line-height: 56px; letter-spacing: -0.02em; font-weight: 800; }

        .px-margin-mobile { padding-left: 16px; padding-right: 16px; }
        .px-margin-desktop { padding-left: 48px; padding-right: 48px; }
        .pt-20 { padding-top: 5rem; }
        .pb-xl { padding-bottom: 64px; }
        .gap-gutter { gap: 24px; }
        .gap-base { gap: 8px; }
        .gap-xs { gap: 4px; }
        .gap-sm { gap: 12px; }
        .gap-md { gap: 24px; }
        .gap-lg { gap: 40px; }
        .gap-xl { gap: 64px; }
        .px-md { padding-left: 24px; padding-right: 24px; }
        .px-sm { padding-left: 12px; padding-right: 12px; }
        .px-xs { padding-left: 4px; padding-right: 4px; }
        .py-sm { padding-top: 12px; padding-bottom: 12px; }
        .py-xs { padding-top: 4px; padding-bottom: 4px; }
        .py-lg { padding-top: 40px; padding-bottom: 40px; }
        .p-md { padding: 24px; }
        .p-sm { padding: 12px; }
        .mt-auto { margin-top: auto; }
        .mb-lg { margin-bottom: 40px; }
        .mb-xs { margin-bottom: 4px; }
        .mb-sm { margin-bottom: 12px; }
        .mt-xs { margin-top: 4px; }
        .mt-sm { margin-top: 12px; }
        .mt-md { margin-top: 24px; }
        .mr-xs { margin-right: 4px; }
        .ml-sm { margin-left: 12px; }
        .ml-md { margin-left: 24px; }

        .w-full { width: 100%; }
        .h-full { height: 100%; }
        .h-10 { height: 2.5rem; }
        .h-8 { height: 2rem; }
        .h-14 { height: 3.5rem; }
        .h-2 { height: 0.5rem; }
        .h-3 { height: 0.75rem; }
        .w-8 { width: 2rem; }
        .w-10 { width: 2.5rem; }
        .w-14 { width: 3.5rem; }
        .w-2 { width: 0.5rem; }
        .w-1\\.5 { width: 0.375rem; }
        .h-1\\.5 { height: 0.375rem; }
        .w-16 { width: 4rem; }
        .h-16 { height: 4rem; }
        .max-w-2xl { max-width: 42rem; }
        .max-w-md { max-width: 28rem; }
        .flex-1 { flex: 1; }
        .flex-col { flex-direction: column; }
        .items-center { align-items: center; }
        .items-start { align-items: flex-start; }
        .items-end { align-items: flex-end; }
        .justify-center { justify-content: center; }
        .justify-between { justify-content: space-between; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .text-left { text-align: left; }
        .overflow-hidden { overflow: hidden; }
        .overflow-x-auto { overflow-x: auto; }
        .overflow-y-auto { overflow-y: auto; }
        .border-collapse { border-collapse: collapse; }
        .divide-y > * + * { border-top-width: 1px; }
        .divide-white/5 > * + * { border-color: rgba(255,255,255,0.05); }
        .space-y-xs > * + * { margin-top: 4px; }
        .space-y-sm > * + * { margin-top: 12px; }
        .space-y-md > * + * { margin-top: 24px; }
        .grid { display: grid; }
        .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
        .grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
        .col-span-1 { grid-column: span 1 / span 1; }
        .col-span-2 { grid-column: span 2 / span 2; }
        .col-span-4 { grid-column: span 4 / span 4; }
        .row-span-2 { grid-row: span 2 / span 2; }
        .aspect-square { aspect-ratio: 1 / 1; }
        .bg-black/70 { background-color: rgba(0,0,0,0.7); }
        .backdrop-blur-sm { backdrop-filter: blur(4px); }
        .backdrop-blur-xl { backdrop-filter: blur(16px); }
        .backdrop-blur-2xl { backdrop-filter: blur(40px); }
        .focus\\:border-primary/50:focus { border-color: rgba(233,179,255,0.5); }
        .focus\\:ring-0:focus { outline: none; box-shadow: none; }
        .hover\\:bg-secondary/20:hover { background-color: rgba(255,178,183,0.2); }
        .hover\\:bg-primary/10:hover { background-color: rgba(233,179,255,0.1); }
        .hover\\:bg-white/5:hover { background-color: rgba(255,255,255,0.05); }
        .hover\\:bg-surface-variant:hover { background-color: #353534; }
        .hover\\:text-primary:hover { color: #e9b3ff; }
        .hover\\:text-on-surface:hover { color: #e5e2e1; }
        .hover\\:bg-error/10:hover { background-color: rgba(255,180,171,0.1); }
        .group-hover\\:text-primary/10 .group:hover { color: rgba(233,179,255,0.1); }
        .active\\:translate-x-1:active { transform: translateX(4px); }
        .active\\:scale-95:active { transform: scale(0.95); }
        .bg-gradient-to-r { background-image: linear-gradient(to right, var(--tw-gradient-stops)); }
        .from-primary { --tw-gradient-from: #e9b3ff; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(233,179,255,0)); }
        .to-primary-container { --tw-gradient-to: #c863fb; }
        .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
        .text-\\[140px\\] { font-size: 140px; }
        .text-\\[10px\\] { font-size: 10px; }
        .text-\\[12px\\] { font-size: 12px; }
        .text-\\[20px\\] { font-size: 20px; }
        .font-bold { font-weight: 700; }
        .font-semibold { font-weight: 600; }
        .leading-none { line-height: 1; }
        .cursor-pointer { cursor: pointer; }
        .transition-all { transition: all 0.3s ease; }
        .duration-200 { transition-duration: 200ms; }
        .duration-300 { transition-duration: 300ms; }
        .duration-1000 { transition-duration: 1000ms; }
        .hover\\:scale-105:hover { transform: scale(1.05); }
        .hover\\:scale-110:hover { transform: scale(1.1); }
        .hover\\:brightness-110:hover { filter: brightness(1.1); }
        .hidden { display: none; }
        .flex { display: flex; }
        .block { display: block; }
        .table { display: table; }
        .border-none { border-style: none; }
        .outline-none { outline: none; }
        .object-cover { object-fit: cover; }
        .object-contain { object-fit: contain; }
        .truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .min-h-screen { min-height: 100vh; }
        .relative { position: relative; }
        .absolute { position: absolute; }
        .fixed { position: fixed; }
        .inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
        .left-0 { left: 0; }
        .top-0 { top: 0; }
        .right-0 { right: 0; }
        .bottom-0 { bottom: 0; }
        .translate-y-0 { transform: translateY(0); }
        .translate-y-24 { transform: translateY(6rem); }
        .-right-8 { right: -2rem; }
        .-bottom-8 { bottom: -2rem; }
        .z-10 { z-index: 10; }
        .z-40 { z-index: 40; }
        .z-50 { z-index: 50; }
        .z-100 { z-index: 100; }
        .z-200 { z-index: 200; }
        .z-\\[60\\] { z-index: 60; }
        .z-\\[100\\] { z-index: 100; }
        .rounded-l-md { border-radius: 0.375rem 0 0 0.375rem; }
        .shadow-\\[0_0_20px_rgba\\(233\\,179\\,255\\,0\\.6\\)\\] { box-shadow: 0 0 20px rgba(233,179,255,0.6); }
        .shadow-\\[0_0_10px_rgba\\(233\\,179\\,255\\,0\\.4\\)\\] { box-shadow: 0 0 10px rgba(233,179,255,0.4); }
        .shadow-\\[0_0_10px_rgba\\(231\\,196\\,72\\,0\\.5\\)\\] { box-shadow: 0 0 10px rgba(231,196,72,0.5); }
        .shadow-\\[0_0_10px_rgba\\(255\\,180\\,171\\,0\\.5\\)\\] { box-shadow: 0 0 10px rgba(255,180,171,0.5); }
        .shadow-\\[0_0_20px_rgba\\(233\\,179\\,255\\,0\\.6\\)\\] { box-shadow: 0 0 20px rgba(233,179,255,0.6); }
        .bg-outline { background-color: #9b8c9e; }
        .text-outline { color: #9b8c9e; }
        .text-outline-variant { color: #4f4352; }
        .border-outline-variant { border-color: #4f4352; }
        .bg-surface-container-highest/30 { background-color: rgba(53,53,52,0.3); }
        .bg-primary/30 { background-color: rgba(233,179,255,0.3); }
        .blur-3xl { filter: blur(3rem); }
        .bg-surface-container-low { background-color: #1c1b1b; }
        .bg-error/5 { background-color: rgba(255,180,171,0.05); }
        .bg-tertiary/5 { background-color: rgba(231,196,72,0.05); }
        .border-error/30 { border-color: rgba(255,180,171,0.3); }
        .border-tertiary/30 { border-color: rgba(231,196,72,0.3); }
        .filter { filter: var(--tw-filter); }
        .group-hover\\:scale-110:hover .group { transform: scale(1.1); }
        .group-hover\\:scale-110 .group:hover { transform: scale(1.1); }
        .max-h-\\[600px\\] { max-height: 600px; }

        @media (min-width: 768px) {
          .md\\:flex { display: flex; }
          .md\\:hidden { display: none; }
          .md\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
          .md\\:col-span-2 { grid-column: span 2 / span 2; }
          .md\\:flex-row { flex-direction: row; }
          .md\\:items-end { align-items: flex-end; }
          .md\\:px-margin-desktop { padding-left: 48px; padding-right: 48px; }
          .md\\:bottom-xl { bottom: 40px; }
          .md\\:right-xl { right: 40px; }
          .md\\:block { display: block; }
        }
        @media (min-width: 1024px) {
          .lg\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
          .lg\\:col-span-2 { grid-column: span 2 / span 2; }
        }
        @media (min-width: 1280px) {
          .xl\\:grid-cols-12 { grid-template-columns: repeat(12, minmax(0, 1fr)); }
          .xl\\:col-span-7 { grid-column: span 7 / span 7; }
          .xl\\:col-span-5 { grid-column: span 5 / span 5; }
        }
      `}</style>

      {/* ===== MAIN CONTENT ===== */}
      <main className="pt-20 px-margin-mobile md:px-margin-desktop pb-xl min-h-screen">
        <div className="flex flex-col gap-xl">
          {/* Header Section */}
          <div className="flex justify-between items-end">
            <div>
              <h1 className="font-headline-lg text-headline-lg text-on-surface">Operaciones de Planta</h1>
              <p className="text-on-surface-variant font-body-md">Gestión en tiempo real de personal y recursos premium.</p>
            </div>
            <div className="hidden md:flex gap-sm">
              <div className="glass-card px-md py-sm rounded-xl border-primary/20">
                <div className="text-xs text-outline-variant uppercase font-bold tracking-widest">Total Usuarios</div>
                <div className="text-primary font-stats-number text-stats-number">{totalUsuarios}</div>
              </div>
              <div className="glass-card px-md py-sm rounded-xl border-error/20">
                <div className="text-xs text-outline-variant uppercase font-bold tracking-widest">Activos</div>
                <div className="text-error font-stats-number text-stats-number">{activos}</div>
              </div>
            </div>
          </div>

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-gutter">
            {/* Tabla de Usuarios */}
            <section className="xl:col-span-8 flex flex-col gap-md">
              <div className="glass-card rounded-xl overflow-hidden flex flex-col h-full border border-white/10 shadow-2xl">
                <div className="px-md py-md border-b border-white/5 flex justify-between items-center bg-white/5">
                  <h3 className="font-headline-md text-headline-md text-primary flex items-center gap-sm">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>group</span>
                    Gestión de Usuarios
                  </h3>
                  <button
                    onClick={abrirModalCrear}
                    className="bg-primary text-on-primary px-md py-sm rounded-lg font-label-md active:scale-95 transition-transform"
                  >
                    + Nuevo Empleado
                  </button>
                </div>
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left">
                    <thead className="bg-surface-container-highest/30 text-outline-variant font-label-md uppercase text-[12px] tracking-widest">
                      <tr>
                        <th className="px-md py-md">Empleado</th>
                        <th className="px-md py-md">Rol</th>
                        <th className="px-md py-md">Turno</th>
                        <th className="px-md py-md">Estado</th>
                        <th className="px-md py-md">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {loading ? (
                        <tr><td colSpan="5" className="text-center py-4 text-on-surface-variant">Cargando...</td></tr>
                      ) : usuariosFiltrados.length === 0 ? (
                        <tr><td colSpan="5" className="text-center py-4 text-on-surface-variant">No hay usuarios</td></tr>
                      ) : (
                        usuariosFiltrados.map((usuario) => (
                          <tr key={usuario.id} className="hover:bg-white/5 transition-colors">
                            <td className="px-md py-md flex items-center gap-sm">
                              <div className="w-8 h-8 rounded-full overflow-hidden border border-primary/20">
                                <img
                                  className="w-full h-full object-cover"
                                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJCq5oLBgkMnM4D0RdUCSsLFb0nKsfmuJrp27D2hS5E2rI21f9bQA-XJZP55M5k_QBkJ6rKmClxuC2tr4atR8eCJKH__LONX8Erq52K6YhuIjyip2kELB6RBO16lADh15tMKaRQumqapCA3Np21kScdnbs0iiR28aSg7gMV9qVpYzNi1NiLieY1cUrnuQ3oH-9hRiEk0EKcF6WhV2xqTz3xZ9vopxPQQBVf-ZWezbnKS7SU9IeGanD9GokEJAZWfWZhdB6APd803QV"
                                  alt="avatar"
                                />
                              </div>
                              <span className="font-body-md font-semibold">{usuario.nombre}</span>
                            </td>
                            <td className="px-md py-md">
                              <span className="bg-surface-variant px-sm py-xs rounded text-xs">{usuario.rol}</span>
                            </td>
                            <td className="px-md py-md text-on-surface-variant text-sm">{usuario.turno || "—"}</td>
                            <td className="px-md py-md">
                              <span className={`flex items-center gap-xs ${usuario.estado === "Activo" ? "text-primary font-bold" : "text-outline-variant"}`}>
                                <span className={`w-2 h-2 rounded-full ${usuario.estado === "Activo" ? "bg-primary animate-pulse shadow-[0_0_8px_#e9b3ff]" : "bg-outline-variant"}`}></span>
                                {usuario.estado || "Inactivo"}
                              </span>
                            </td>
                            <td className="px-md py-md">
                              <div className="flex gap-1">
                                <button
                                  onClick={() => abrirModalEditar(usuario)}
                                  className="text-primary hover:underline text-xs"
                                >
                                  Editar
                                </button>
                                <button
                                  onClick={() => handleDelete(usuario.id)}
                                  className="text-error hover:underline text-xs"
                                >
                                  Eliminar
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Panel de estadísticas y roles */}
            <section className="xl:col-span-4 flex flex-col gap-md">
              <div className="glass-card rounded-xl overflow-hidden flex flex-col h-full border border-white/10 shadow-2xl relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <div className="px-md py-md border-b border-white/5 flex justify-between items-center bg-white/5 z-10">
                  <h3 className="font-headline-md text-headline-md text-primary flex items-center gap-sm">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
                    Estadísticas de Personal
                  </h3>
                </div>
                <div className="p-md space-y-md z-10 custom-scrollbar overflow-y-auto max-h-[600px]">
                  <div className="glass-card p-sm rounded-lg border-white/5">
                    <div className="text-xs text-outline-variant uppercase font-bold tracking-widest mb-2">Distribución por Roles</div>
                    <div className="space-y-2">
                      {Object.keys(roles).length === 0 ? (
                        <p className="text-on-surface-variant text-sm">Sin datos</p>
                      ) : (
                        Object.entries(roles).map(([rol, count]) => (
                          <div key={rol} className="flex justify-between items-center">
                            <span className="text-sm text-on-surface">{rol}</span>
                            <span className="text-sm text-primary font-bold">{count}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="glass-card p-sm rounded-lg border-white/5">
                    <div className="text-xs text-outline-variant uppercase font-bold tracking-widest mb-2">Estado</div>
                    <div className="flex justify-between">
                      <div>
                        <span className="text-on-surface-variant text-sm">Activos</span>
                        <div className="text-primary font-stats-number text-2xl">{activos}</div>
                      </div>
                      <div>
                        <span className="text-on-surface-variant text-sm">Inactivos</span>
                        <div className="text-error font-stats-number text-2xl">{inactivos}</div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={cargarUsuarios}
                    className="w-full py-md border-2 border-primary/40 text-primary rounded-xl font-bold hover:bg-primary hover:text-on-primary transition-all flex items-center justify-center gap-sm active:scale-95"
                  >
                    <span className="material-symbols-outlined">sync</span>
                    Sincronizar Datos
                  </button>
                </div>
              </div>
            </section>
          </div>

          {/* Visual Performance Gauges */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            <div className="glass-card p-md rounded-xl flex items-center justify-between border-white/5">
              <div className="flex flex-col">
                <span className="text-xs text-outline-variant uppercase font-bold">Total Usuarios</span>
                <span className="text-2xl font-stats-number text-primary">{totalUsuarios}</span>
              </div>
              <div className="relative w-16 h-16">
                <svg className="w-full h-full transform -rotate-90">
                  <circle className="text-surface-variant" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeWidth="4"></circle>
                  <circle className="text-primary" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeDasharray="175.9" strokeDashoffset="49" strokeWidth="4"></circle>
                </svg>
              </div>
            </div>
            <div className="glass-card p-md rounded-xl flex items-center justify-between border-white/5">
              <div className="flex flex-col">
                <span className="text-xs text-outline-variant uppercase font-bold">Activos</span>
                <span className="text-2xl font-stats-number text-tertiary">{activos}</span>
              </div>
              <div className="relative w-16 h-16">
                <svg className="w-full h-full transform -rotate-90">
                  <circle className="text-surface-variant" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeWidth="4"></circle>
                  <circle className="text-tertiary" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeDasharray="175.9" strokeDashoffset="10" strokeWidth="4"></circle>
                </svg>
              </div>
            </div>
            <div className="glass-card p-md rounded-xl flex items-center justify-between border-white/5">
              <div className="flex flex-col">
                <span className="text-xs text-outline-variant uppercase font-bold">Roles Únicos</span>
                <span className="text-2xl font-stats-number text-secondary">{Object.keys(roles).length}</span>
              </div>
              <div className="w-16 h-16 flex items-center justify-center">
                <span className="material-symbols-outlined text-4xl text-secondary animate-pulse-glow" style={{ fontVariationSettings: "'FILL' 1" }}>groups</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ===== FAB ===== */}
      <button
        onClick={abrirModalCrear}
        className="fixed bottom-md right-md md:bottom-xl md:right-xl w-16 h-16 bg-primary text-on-primary rounded-full shadow-[0_0_20px_rgba(233,179,255,0.6)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50"
      >
        <span className="material-symbols-outlined text-3xl">add</span>
      </button>

      {/* ===== TOAST ===== */}
      {toast.visible && (
        <div className={`fixed bottom-24 right-8 glass-card rounded-xl px-md py-sm flex items-center gap-sm transition-all duration-300 z-[100] border ${toast.tipo === "error" ? "border-error/30" : "border-primary/30"}`}>
          <span className="material-symbols-outlined text-primary">info</span>
          <div>
            <p className="text-on-surface font-bold text-sm">{toast.mensaje}</p>
          </div>
        </div>
      )}

      {/* ===== MODAL ===== */}
      {modalAbierto && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass-card rounded-2xl p-6 w-full max-w-md relative border border-white/20 shadow-2xl">
            <button
              onClick={cerrarModal}
              className="absolute top-3 right-3 text-on-surface-variant hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <h3 className="font-headline-md text-headline-md text-on-surface mb-4">
              {modoEdicion ? "Editar Usuario" : "Nuevo Usuario"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-label-md text-on-surface-variant mb-1">Nombre</label>
                <input
                  type="text"
                  name="nombre"
                  value={usuarioActual.nombre || ""}
                  onChange={handleChange}
                  className="w-full bg-surface-container-high rounded-lg border border-white/10 px-3 py-2 text-on-surface focus:border-primary/50 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-label-md text-on-surface-variant mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={usuarioActual.email || ""}
                  onChange={handleChange}
                  className="w-full bg-surface-container-high rounded-lg border border-white/10 px-3 py-2 text-on-surface focus:border-primary/50 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-label-md text-on-surface-variant mb-1">Rol</label>
                <select
                  name="rol"
                  value={usuarioActual.rol || ""}
                  onChange={handleChange}
                  className="w-full bg-surface-container-high rounded-lg border border-white/10 px-3 py-2 text-on-surface focus:border-primary/50 focus:outline-none"
                  required
                >
                  <option value="">Seleccionar</option>
                  <option value="Bartender Senior">Bartender Senior</option>
                  <option value="Bartender">Bartender</option>
                  <option value="Jefe Seguridad">Jefe Seguridad</option>
                  <option value="Seguridad">Seguridad</option>
                  <option value="Mesero">Mesero</option>
                  <option value="Camarero">Camarero</option>
                  <option value="Gerente">Gerente</option>
                  <option value="Administrador">Administrador</option>
                  <option value="Nuevo Cliente">Nuevo Cliente</option>
                  <option value="DJ">DJ</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-label-md text-on-surface-variant mb-1">Turno</label>
                <select
                  name="turno"
                  value={usuarioActual.turno || ""}
                  onChange={handleChange}
                  className="w-full bg-surface-container-high rounded-lg border border-white/10 px-3 py-2 text-on-surface focus:border-primary/50 focus:outline-none"
                >
                  <option value="">Seleccionar</option>
                  <option value="Mañana (06:00 - 14:00)">Mañana (06:00 - 14:00)</option>
                  <option value="Tarde (14:00 - 22:00)">Tarde (14:00 - 22:00)</option>
                  <option value="Noche (20:00 - 04:00)">Noche (20:00 - 04:00)</option>
                  <option value="Cierre (22:00 - 06:00)">Cierre (22:00 - 06:00)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-label-md text-on-surface-variant mb-1">Estado</label>
                <select
                  name="estado"
                  value={usuarioActual.estado || "Activo"}
                  onChange={handleChange}
                  className="w-full bg-surface-container-high rounded-lg border border-white/10 px-3 py-2 text-on-surface focus:border-primary/50 focus:outline-none"
                >
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-primary text-on-primary py-2 rounded-xl font-label-md hover:brightness-110 transition-all active:scale-95"
                >
                  {modoEdicion ? "Actualizar" : "Guardar"}
                </button>
                <button
                  type="button"
                  onClick={cerrarModal}
                  className="flex-1 bg-surface-container-high border border-white/10 text-on-surface-variant py-2 rounded-xl font-label-md hover:bg-white/5 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminUsuarios;