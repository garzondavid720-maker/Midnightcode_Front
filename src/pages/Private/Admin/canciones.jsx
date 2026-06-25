import React, { useState, useEffect } from "react";
import { cancionService } from "../../../services/cancionService"; // Ajusta la ruta según tu proyecto

const AdminCanciones = () => {
  // Estados
  const [canciones, setCanciones] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [cancionActual, setCancionActual] = useState({
    id: null,
    titulo: "",
    artista: "",
    album: "",
    duracion: "",
    url: "",
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, mensaje: "", tipo: "" });
  const [notificacionFX, setNotificacionFX] = useState({ visible: false, mensaje: "" });

  // Cargar canciones al montar
  useEffect(() => {
    cargarCanciones();
  }, []);

  const cargarCanciones = async () => {
    setLoading(true);
    try {
      const data = await cancionService.getAll();
      setCanciones(data);
      localStorage.setItem("afterdark_canciones", JSON.stringify(data));
    } catch (err) {
      const stored = localStorage.getItem("afterdark_canciones");
      if (stored) {
        setCanciones(JSON.parse(stored));
        mostrarToast("Datos cargados desde caché local", "info");
      } else {
        setCanciones([]);
        mostrarToast("Error al cargar canciones", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  // Toast
  const mostrarToast = (mensaje, tipo = "success") => {
    setToast({ visible: true, mensaje, tipo });
    setTimeout(() => setToast({ visible: false, mensaje: "", tipo: "" }), 3000);
  };

  // Notificación FX (estilo "Efecto activado")
  const triggerFX = (type) => {
    setNotificacionFX({ visible: true, mensaje: `Efecto ${type} disparado con éxito` });
    setTimeout(() => setNotificacionFX({ visible: false, mensaje: "" }), 3000);
  };

  // CRUD
  const handleCreate = async (nuevaCancion) => {
    try {
      const created = await cancionService.create(nuevaCancion);
      const updated = [...canciones, created];
      setCanciones(updated);
      localStorage.setItem("afterdark_canciones", JSON.stringify(updated));
      mostrarToast("Canción agregada correctamente", "success");
      cerrarModal();
    } catch (err) {
      const tempId = Date.now();
      const nueva = { ...nuevaCancion, id: tempId };
      const updated = [...canciones, nueva];
      setCanciones(updated);
      localStorage.setItem("afterdark_canciones", JSON.stringify(updated));
      mostrarToast("Canción guardada localmente (sin conexión)", "info");
      cerrarModal();
    }
  };

  const handleUpdate = async (id, data) => {
    try {
      const updated = await cancionService.update(id, data);
      const updatedList = canciones.map((c) => (c.id === id ? updated : c));
      setCanciones(updatedList);
      localStorage.setItem("afterdark_canciones", JSON.stringify(updatedList));
      mostrarToast("Canción actualizada", "success");
      cerrarModal();
    } catch (err) {
      const updatedList = canciones.map((c) =>
        c.id === id ? { ...c, ...data } : c
      );
      setCanciones(updatedList);
      localStorage.setItem("afterdark_canciones", JSON.stringify(updatedList));
      mostrarToast("Actualizada localmente (sin conexión)", "info");
      cerrarModal();
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar esta canción?")) return;
    try {
      await cancionService.remove(id);
      const filtered = canciones.filter((c) => c.id !== id);
      setCanciones(filtered);
      localStorage.setItem("afterdark_canciones", JSON.stringify(filtered));
      mostrarToast("Canción eliminada", "success");
    } catch (err) {
      const filtered = canciones.filter((c) => c.id !== id);
      setCanciones(filtered);
      localStorage.setItem("afterdark_canciones", JSON.stringify(filtered));
      mostrarToast("Eliminada localmente (sin conexión)", "info");
    }
  };

  const abrirModalCrear = () => {
    setModoEdicion(false);
    setCancionActual({ id: null, titulo: "", artista: "", album: "", duracion: "", url: "" });
    setModalAbierto(true);
  };

  const abrirModalEditar = (cancion) => {
    setModoEdicion(true);
    setCancionActual(cancion);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setCancionActual({ id: null, titulo: "", artista: "", album: "", duracion: "", url: "" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (modoEdicion) {
      handleUpdate(cancionActual.id, cancionActual);
    } else {
      handleCreate(cancionActual);
    }
  };

  const handleChange = (e) => {
    setCancionActual({ ...cancionActual, [e.target.name]: e.target.value });
  };

  // Filtro
  const cancionesFiltradas = canciones.filter((c) =>
    c.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.artista?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Estadísticas (para mostrar en el header)
  const totalCanciones = canciones.length;
  const artistasUnicos = new Set(canciones.map(c => c.artista)).size;

  // Canciones para "más pedidas" (primeras 4, o todas si hay menos)
  const cancionesTop = canciones.slice(0, 4);

  return (
    <>
      {/* ===== ESTILOS PERSONALIZADOS (idénticos al HTML original) ===== */}
      <style>{`
        /* Variables de color (extraídas del tema) */
        :root {
          --surface: #131313;
          --surface-container: #201f1f;
          --surface-container-high: #2a2a2a;
          --surface-container-highest: #353534;
          --surface-variant: #353534;
          --on-surface: #e5e2e1;
          --on-surface-variant: #d2c1d4;
          --primary: #e9b3ff;
          --on-primary: #510074;
          --primary-container: #c863fb;
          --secondary: #ffb2b7;
          --on-secondary: #67001c;
          --secondary-container: #d00242;
          --tertiary: #e7c448;
          --on-tertiary: #3c2f00;
          --error: #ffb4ab;
          --on-error: #690005;
          --error-container: #93000a;
          --on-error-container: #ffdad6;
          --outline: #9b8c9e;
          --outline-variant: #4f4352;
          --background: #131313;
        }

        /* Fondo general */
        body {
          background-color: #050505;
          color: var(--on-surface);
          overflow-x: hidden;
        }

        /* Clases personalizadas (iguales a las del HTML) */
        .glass-card {
          background: rgba(28, 28, 30, 0.7);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-top: 1px solid rgba(255, 255, 255, 0.2);
        }
        .neon-glow-primary {
          box-shadow: 0 0 15px rgba(233, 179, 255, 0.3);
        }
        .neon-border-primary {
          border: 1px solid #e9b3ff;
          box-shadow: 0 0 8px rgba(233, 179, 255, 0.4);
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
        @keyframes pulse-neon {
          0% { opacity: 1; }
          50% { opacity: 0.6; }
          100% { opacity: 1; }
        }
        .animate-pulse-neon {
          animation: pulse-neon 2s infinite ease-in-out;
        }

        /* Clases de color (para usar con las variables) */
        .bg-surface { background-color: var(--surface); }
        .bg-surface-container { background-color: var(--surface-container); }
        .bg-surface-container-high { background-color: var(--surface-container-high); }
        .bg-surface-container-highest { background-color: var(--surface-container-highest); }
        .bg-surface-variant { background-color: var(--surface-variant); }
        .text-on-surface { color: var(--on-surface); }
        .text-on-surface-variant { color: var(--on-surface-variant); }
        .text-primary { color: var(--primary); }
        .bg-primary { background-color: var(--primary); }
        .text-on-primary { color: var(--on-primary); }
        .bg-primary-container { background-color: var(--primary-container); }
        .text-secondary { color: var(--secondary); }
        .bg-secondary { background-color: var(--secondary); }
        .bg-secondary-container { background-color: var(--secondary-container); }
        .text-on-secondary { color: var(--on-secondary); }
        .text-tertiary { color: var(--tertiary); }
        .bg-tertiary { background-color: var(--tertiary); }
        .bg-error { background-color: var(--error); }
        .text-error { color: var(--error); }
        .text-on-error { color: var(--on-error); }
        .border-primary { border-color: var(--primary); }
        .border-secondary { border-color: var(--secondary); }
        .border-white\\/10 { border-color: rgba(255,255,255,0.1); }
        .border-white\\/5 { border-color: rgba(255,255,255,0.05); }
        .bg-white\\/5 { background-color: rgba(255,255,255,0.05); }
        .bg-white\\/10 { background-color: rgba(255,255,255,0.1); }
        .bg-primary\\/5 { background-color: rgba(233,179,255,0.05); }
        .bg-primary\\/10 { background-color: rgba(233,179,255,0.1); }
        .bg-primary\\/20 { background-color: rgba(233,179,255,0.2); }
        .bg-secondary\\/10 { background-color: rgba(255,178,183,0.1); }
        .bg-secondary\\/20 { background-color: rgba(255,178,183,0.2); }
        .bg-tertiary\\/20 { background-color: rgba(231,196,72,0.2); }
        .bg-surface-container-highest\\/50 { background-color: rgba(53,53,52,0.5); }
        .bg-error-container\\/20 { background-color: rgba(147,0,10,0.2); }
        .border-error\\/30 { border-color: rgba(255,180,171,0.3); }
        .border-error { border-color: var(--error); }
        .shadow-primary\\/20 { box-shadow: 0 4px 14px rgba(233,179,255,0.2); }

        /* Transiciones y efectos */
        .transition-all { transition: all 0.3s ease; }
        .duration-200 { transition-duration: 200ms; }
        .duration-300 { transition-duration: 300ms; }
        .duration-500 { transition-duration: 500ms; }
        .duration-1000 { transition-duration: 1000ms; }
        .hover\\:scale-105:hover { transform: scale(1.05); }
        .hover\\:scale-110:hover { transform: scale(1.1); }
        .active\\:scale-95:active { transform: scale(0.95); }
        .hover\\:brightness-110:hover { filter: brightness(1.1); }
        .group-hover\\:scale-110:hover .group { transform: scale(1.1); }
        .group-hover\\:opacity-100:hover .group { opacity: 1; }

        /* Fuentes */
        .font-headline-lg { font-family: 'Montserrat', sans-serif; }
        .font-headline-md { font-family: 'Montserrat', sans-serif; }
        .font-body-md { font-family: 'Inter', sans-serif; }
        .font-label-md { font-family: 'Inter', sans-serif; }
        .font-stats-number { font-family: 'Montserrat', sans-serif; }
        .font-display-lg { font-family: 'Montserrat', sans-serif; }

        /* Tamaños de fuente (iguales al original) */
        .text-headline-lg { font-size: 32px; line-height: 40px; letter-spacing: -0.01em; font-weight: 700; }
        .text-headline-md { font-size: 24px; line-height: 32px; font-weight: 600; }
        .text-body-md { font-size: 16px; line-height: 24px; font-weight: 400; }
        .text-label-md { font-size: 14px; line-height: 20px; letter-spacing: 0.05em; font-weight: 600; }
        .text-stats-number { font-size: 36px; line-height: 44px; font-weight: 700; }
        .text-display-lg { font-size: 48px; line-height: 56px; letter-spacing: -0.02em; font-weight: 800; }
        .text-xs { font-size: 12px; line-height: 16px; }
        .text-sm { font-size: 14px; line-height: 20px; }
        .text-lg { font-size: 18px; line-height: 28px; }
        .text-2xl { font-size: 24px; line-height: 32px; }
        .text-3xl { font-size: 28px; line-height: 36px; }
        .text-\\[18px\\] { font-size: 18px; }

        /* Clases de utilidad adicionales */
        .tracking-widest { letter-spacing: 0.1em; }
        .tracking-tight { letter-spacing: -0.02em; }
        .tracking-tighter { letter-spacing: -0.05em; }
        .uppercase { text-transform: uppercase; }
        .rounded-full { border-radius: 9999px; }
        .rounded-xl { border-radius: 0.75rem; }
        .rounded-lg { border-radius: 0.5rem; }
        .rounded { border-radius: 0.25rem; }
        .border { border-width: 1px; }
        .border-r-2 { border-right-width: 2px; }
        .border-b { border-bottom-width: 1px; }
        .border-t { border-top-width: 1px; }
        .opacity-0 { opacity: 0; }
        .opacity-100 { opacity: 1; }
        .opacity-60 { opacity: 0.6; }
        .opacity-70 { opacity: 0.7; }
        .opacity-80 { opacity: 0.8; }
        .grayscale-\\[0\\.5\\] { filter: grayscale(0.5); }
        .shadow-xl { box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04); }
        .shadow-2xl { box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); }
        .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05); }
        .shadow-\\[0_0_20px_rgba\\(233\\,179\\,255\\,0\\.1\\)\\] { box-shadow: 0 0 20px rgba(233,179,255,0.1); }
        .shadow-\\[0_0_8px_\\#ffb2b7\\] { box-shadow: 0 0 8px #ffb2b7; }
        .shadow-\\[0_0_5px_\\#e9b3ff\\] { box-shadow: 0 0 5px #e9b3ff; }
        .z-10 { z-index: 10; }
        .z-40 { z-index: 40; }
        .z-50 { z-index: 50; }
        .z-100 { z-index: 100; }
        .z-200 { z-index: 200; }
        .z-60 { z-index: 60; }
        .relative { position: relative; }
        .absolute { position: absolute; }
        .fixed { position: fixed; }
        .inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
        .inset-y-0 { top: 0; bottom: 0; }
        .left-0 { left: 0; }
        .top-0 { top: 0; }
        .right-0 { right: 0; }
        .bottom-0 { bottom: 0; }
        .translate-y-0 { transform: translateY(0); }
        .translate-y-20 { transform: translateY(5rem); }
        .-translate-y-20 { transform: translateY(-5rem); }
        .-translate-x-1\\/2 { transform: translateX(-50%); }
        .translate-x-0 { transform: translateX(0); }

        /* Clases para espaciado (iguales al original) */
        .px-margin-mobile { padding-left: 16px; padding-right: 16px; }
        .px-margin-desktop { padding-left: 48px; padding-right: 48px; }
        .pt-24 { padding-top: 6rem; }
        .pb-xl { padding-bottom: 64px; }
        .gap-gutter { gap: 24px; }
        .gap-base { gap: 8px; }
        .gap-xs { gap: 4px; }
        .gap-sm { gap: 12px; }
        .gap-md { gap: 24px; }
        .gap-lg { gap: 40px; }
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
        .ml-lg { margin-left: 40px; }
        .ml-xs { margin-left: 4px; }
        .w-64 { width: 16rem; }
        .w-full { width: 100%; }
        .h-full { height: 100%; }
        .h-20 { height: 5rem; }
        .h-10 { height: 2.5rem; }
        .h-8 { height: 2rem; }
        .h-14 { height: 3.5rem; }
        .h-2 { height: 0.5rem; }
        .h-24 { height: 6rem; }
        .h-16 { height: 4rem; }
        .w-8 { width: 2rem; }
        .w-10 { width: 2.5rem; }
        .w-14 { width: 3.5rem; }
        .w-2 { width: 0.5rem; }
        .w-1\.5 { width: 0.375rem; }
        .h-1\.5 { height: 0.375rem; }
        .w-16 { width: 4rem; }
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
        .border-collapse { border-collapse: collapse; }
        .divide-y > * + * { border-top-width: 1px; }
        .divide-white\\/5 > * + * { border-color: rgba(255,255,255,0.05); }
        .space-y-xs > * + * { margin-top: 4px; }
        .space-y-sm > * + * { margin-top: 12px; }
        .space-y-md > * + * { margin-top: 24px; }
        .space-x-xs > * + * { margin-left: 4px; }
        .grid { display: grid; }
        .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
        .grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
        .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .grid-rows-4 { grid-template-rows: repeat(4, minmax(0, 1fr)); }
        .col-span-1 { grid-column: span 1 / span 1; }
        .col-span-2 { grid-column: span 2 / span 2; }
        .col-span-4 { grid-column: span 4 / span 4; }
        .row-span-2 { grid-row: span 2 / span 2; }
        .aspect-square { aspect-ratio: 1 / 1; }
        .bg-black\\/40 { background-color: rgba(0,0,0,0.4); }
        .bg-black\\/70 { background-color: rgba(0,0,0,0.7); }
        .backdrop-blur-sm { backdrop-filter: blur(4px); }
        .backdrop-blur-xl { backdrop-filter: blur(16px); }
        .backdrop-blur-2xl { backdrop-filter: blur(40px); }
        .focus\\:border-primary\\/50:focus { border-color: rgba(233,179,255,0.5); }
        .focus\\:ring-0:focus { outline: none; box-shadow: none; }
        .hover\\:bg-secondary\\/20:hover { background-color: rgba(255,178,183,0.2); }
        .hover\\:bg-primary\\/20:hover { background-color: rgba(233,179,255,0.2); }
        .hover\\:bg-primary\\/10:hover { background-color: rgba(233,179,255,0.1); }
        .hover\\:bg-white\\/5:hover { background-color: rgba(255,255,255,0.05); }
        .hover\\:bg-surface-variant:hover { background-color: var(--surface-variant); }
        .hover\\:text-primary:hover { color: var(--primary); }
        .hover\\:text-on-surface:hover { color: var(--on-surface); }
        .group-hover\\:text-primary\\/10 .group:hover { color: rgba(233,179,255,0.1); }
        .group-hover\\:scale-125 .group:hover { transform: scale(1.25); }
        .group-hover\\:opacity-100 .group:hover { opacity: 1; }
        .active\\:translate-x-1:active { transform: translateX(4px); }
        .active\\:scale-90:active { transform: scale(0.9); }
        .active\\:scale-95:active { transform: scale(0.95); }
        .bg-gradient-to-r { background-image: linear-gradient(to right, var(--tw-gradient-stops)); }
        .from-primary\\/5 { --tw-gradient-from: rgba(233,179,255,0.05); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(233,179,255,0)); }
        .to-transparent { --tw-gradient-to: transparent; }
        .from-primary { --tw-gradient-from: var(--primary); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(233,179,255,0)); }
        .to-primary-container { --tw-gradient-to: var(--primary-container); }
        .text-\\[18px\\] { font-size: 18px; }
        .text-\\[10px\\] { font-size: 10px; }
        .font-bold { font-weight: 700; }
        .font-semibold { font-weight: 600; }
        .italic { font-style: italic; }
        .leading-none { line-height: 1; }
        .cursor-pointer { cursor: pointer; }
        .select-none { user-select: none; }
        .pointer-events-none { pointer-events: none; }
        .transition-transform { transition-property: transform; }
        .transition-colors { transition-property: color, background-color, border-color; }
        .duration-150 { transition-duration: 150ms; }
        .duration-200 { transition-duration: 200ms; }
        .duration-300 { transition-duration: 300ms; }
        .duration-500 { transition-duration: 500ms; }
        .duration-1000 { transition-duration: 1000ms; }
        .ease-out { transition-timing-function: cubic-bezier(0, 0, 0.2, 1); }
        .hidden { display: none; }
        .flex { display: flex; }
        .inline-flex { display: inline-flex; }
        .block { display: block; }
        .table { display: table; }
        .table-cell { display: table-cell; }
        .table-row { display: table-row; }
        .table-header-group { display: table-header-group; }
        .table-row-group { display: table-row-group; }
        .border-none { border-style: none; }
        .outline-none { outline: none; }
        .object-cover { object-fit: cover; }
        .shrink-0 { flex-shrink: 0; }
        .truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .min-h-screen { min-height: 100vh; }

        /* Responsive */
        @media (min-width: 768px) {
          .md\\:flex { display: flex; }
          .md\\:hidden { display: none; }
          .md\\:ml-64 { margin-left: 16rem; }
          .md\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
          .md\\:col-span-2 { grid-column: span 2 / span 2; }
          .md\\:flex-row { flex-direction: row; }
          .md\\:items-end { align-items: flex-end; }
          .md\\:px-margin-desktop { padding-left: 48px; padding-right: 48px; }
          .md\\:bottom-margin-desktop { bottom: 48px; }
          .md\\:right-margin-desktop { right: 48px; }
        }
        @media (min-width: 1024px) {
          .lg\\:grid-cols-12 { grid-template-columns: repeat(12, minmax(0, 1fr)); }
          .lg\\:col-span-8 { grid-column: span 8 / span 8; }
          .lg\\:col-span-4 { grid-column: span 4 / span 4; }
        }
      `}</style>

      {/* ===== HEADER ===== */}
      <header className="fixed top-0 w-full z-50 bg-surface/70 backdrop-blur-xl border-b border-white/10 shadow-[0_0_20px_rgba(233,179,255,0.1)] flex justify-between items-center px-margin-desktop h-20">
        <div className="flex items-center gap-md">
          <span className="font-display-lg text-display-lg text-primary tracking-tight">Afterdark Pulse</span>
          <div className="hidden md:flex items-center bg-surface-variant/50 rounded-full px-sm py-xs border border-white/5 ml-lg">
            <span className="material-symbols-outlined text-on-surface-variant mr-xs">search</span>
            <input
              className="bg-transparent border-none focus:ring-0 text-label-md text-on-surface placeholder:text-on-surface-variant w-64"
              placeholder="Buscar artista o canción..."
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-lg">
          <a className="text-on-surface-variant hover:text-primary transition-colors font-label-md" href="#">Soporte</a>
          <div className="flex items-center gap-sm">
            <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">notifications</button>
            <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">settings</button>
            <div className="w-10 h-10 rounded-full overflow-hidden border border-primary/30">
              <img
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCA9fJYVHyhJ7RSNPnlwBKtrfpZZnA4Unoge_5ATGmAXuncTpzFwRmyqtnoEuIuAh8a03bb7AwoH08JyXaPF0y6gjtcQw-elYhtD2baFp5qMDUxKsSAXUwfycNCige0jahPT3dbEcETlivolg5WO5hGx4_IKpv7VRjiB-f_93yJ22SHjiubbxyRPj8AxiGkZ-wd2roSY70Sj8IPfbZj_JDMwWCJ4b16kBO6kQDGr-BEpA6d9i_3J_0JsKVSfhH--zDIthlljZO3biWm"
                alt="avatar"
              />
            </div>
          </div>
        </nav>
      </header>

      {/* ===== SIDEBAR ===== */}
      <aside className="fixed left-0 top-0 h-full w-64 z-40 bg-surface-container/80 backdrop-blur-2xl border-r border-white/10 shadow-xl hidden md:flex flex-col py-lg gap-base pt-24">
        <div className="px-md mb-base">
          <p className="font-label-md text-primary opacity-70 uppercase tracking-widest">Menú Principal</p>
        </div>
        <nav className="flex flex-col flex-1">
          <a className="flex items-center px-md py-sm text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-all active:translate-x-1 duration-150 gap-sm" href="#">
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-label-md">Dashboard</span>
          </a>
          <a className="flex items-center px-md py-sm text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-all active:translate-x-1 duration-150 gap-sm" href="#">
            <span className="material-symbols-outlined">monitoring</span>
            <span className="font-label-md">Analytics</span>
          </a>
          <a className="flex items-center px-md py-sm text-primary border-r-2 border-primary bg-primary/5 transition-all active:translate-x-1 duration-150 gap-sm" href="#">
            <span className="material-symbols-outlined">music_note</span>
            <span className="font-label-md">Music/Songs</span>
          </a>
          <a className="flex items-center px-md py-sm text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-all active:translate-x-1 duration-150 gap-sm" href="#">
            <span className="material-symbols-outlined">calendar_today</span>
            <span className="font-label-md">Events/Schedules</span>
          </a>
          <a className="flex items-center px-md py-sm text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-all active:translate-x-1 duration-150 gap-sm" href="#">
            <span className="material-symbols-outlined">layers</span>
            <span className="font-label-md">VIP Floor</span>
          </a>
          <a className="flex items-center px-md py-sm text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-all active:translate-x-1 duration-150 gap-sm" href="#">
            <span className="material-symbols-outlined">group</span>
            <span className="font-label-md">Users</span>
          </a>
          <a className="flex items-center px-md py-sm text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-all active:translate-x-1 duration-150 gap-sm" href="#">
            <span className="material-symbols-outlined">inventory_2</span>
            <span className="font-label-md">Inventory</span>
          </a>
        </nav>
        <div className="mt-auto px-md flex flex-col gap-xs">
          <a className="flex items-center py-xs text-on-surface-variant hover:text-on-surface transition-colors gap-sm" href="#">
            <span className="material-symbols-outlined">help</span>
            <span className="font-label-md text-label-md">Support</span>
          </a>
          {/* === CAMBIO: Logout redirige a /home === */}
          <a className="flex items-center py-xs text-on-surface-variant hover:text-on-surface transition-colors gap-sm" href="/home">
            <span className="material-symbols-outlined">logout</span>
            <span className="font-label-md text-label-md">Logout</span>
          </a>
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <main className="md:ml-64 pt-24 pb-xl px-margin-mobile md:px-margin-desktop min-h-screen">
        {/* Header Section */}
        <header className="mb-lg flex flex-col md:flex-row md:items-end justify-between gap-md">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface mb-xs">Programación Musical</h1>
            <p className="font-body-md text-on-surface-variant max-w-2xl">
              Gestión en tiempo real del Lineup, efectos especiales y playlists para la noche de hoy.
            </p>
            <div className="mt-sm flex gap-4 text-sm text-on-surface-variant">
              <span>🎵 {totalCanciones} canciones</span>
              <span>🎤 {artistasUnicos} artistas</span>
            </div>
          </div>
          <div className="flex items-center gap-sm">
            <div className="flex items-center gap-xs px-sm py-xs bg-error-container/20 border border-error/30 rounded-lg animate-pulse-neon">
              <span className="material-symbols-outlined text-error text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>fiber_manual_record</span>
              <span className="text-error font-label-md uppercase tracking-tighter">En Vivo</span>
            </div>
            {/* Botón "Descargar Horario" eliminado */}
          </div>
        </header>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          {/* Left Column: Lineup & Playlist */}
          <section className="lg:col-span-8 flex flex-col gap-gutter">
            {/* Lineup & Set Times (Lista de canciones) */}
            <div className="glass-card rounded-xl p-md">
              <div className="flex items-center justify-between mb-md">
                <div className="flex items-center gap-sm">
                  <span className="material-symbols-outlined text-primary">schedule</span>
                  <h2 className="font-headline-md text-headline-md">Lineup &amp; Set Times</h2>
                </div>
                <span className="text-on-surface-variant text-label-md">Sábado, 24 Mayo</span>
              </div>
              <div className="flex flex-col gap-sm">
                {loading ? (
                  <div className="text-center py-4 text-on-surface-variant">Cargando...</div>
                ) : cancionesFiltradas.length === 0 ? (
                  <div className="text-center py-4 text-on-surface-variant">No hay canciones</div>
                ) : (
                  cancionesFiltradas.map((cancion, index) => {
                    const esActiva = index === 0; // Simulamos la primera como activa
                    const esPasada = index > 2; // Simulamos pasadas
                    return (
                      <div
                        key={cancion.id}
                        className={`flex items-center gap-md p-sm rounded-xl ${
                          esActiva
                            ? "bg-primary/10 border border-primary/40 relative overflow-hidden group"
                            : esPasada
                            ? "opacity-40 grayscale-[0.5] glass-card"
                            : "glass-card hover:bg-white/5 transition-colors"
                        }`}
                      >
                        {esActiva && (
                          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent"></div>
                        )}
                        <div className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${esActiva ? "border-primary" : "border-white/10"} shrink-0 z-10 ${esPasada ? "opacity-80" : ""}`}>
                          <img
                            className="w-full h-full object-cover"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDp23qgmVfggJCLDEFLKDqhCtIrhQcL6Z0UGueobnRtzvd_qbV79Oa5WfLVhd1RH6QbO-3fo3TvDo0z3Lugg-kRg0f3Xrp9GlYVrIS-pQg62N9eoZF1qkKnNNu9YGUvUlK5UJDzaTkACIKCoiDkIwVdJLQCuFgu2lac2VpEQplZ7_w4EL47YLQEv8R95yqHp4K4Ohh18uCBxmAH_-ZibKTIZCzpLlb3Au8tBh_R6oQJhVIm-XsmXan-J8Xhb5T8j8PXbMrTB46TIUsp"
                            alt="DJ"
                          />
                        </div>
                        <div className="flex-1 z-10">
                          <div className="flex items-center gap-xs">
                            <h3 className="font-headline-md text-on-surface text-lg">{cancion.titulo}</h3>
                            {esActiva && (
                              <span className="bg-primary text-on-primary text-[10px] px-xs rounded font-bold uppercase">Main Set</span>
                            )}
                          </div>
                          <p className="text-on-surface-variant text-label-md">{cancion.artista}</p>
                          <p className="text-xs text-on-surface-variant opacity-60">{cancion.album || "—"} • {cancion.duracion || "—"}</p>
                        </div>
                        <div className="text-right z-10 flex flex-col items-end gap-1">
                          <p className="font-stats-number text-primary text-2xl">{cancion.duracion || "00:00"}</p>
                          {esActiva ? (
                            <p className="text-on-surface-variant text-label-md font-bold italic">AHORA MISMO</p>
                          ) : esPasada ? (
                            <p className="text-on-surface-variant text-label-md">Finalizado</p>
                          ) : (
                            <p className="text-on-surface-variant text-label-md">Siguiente Set</p>
                          )}
                          <div className="flex gap-1 mt-1">
                            <button
                              onClick={() => abrirModalEditar(cancion)}
                              className="bg-primary/20 text-primary px-2 py-0.5 rounded text-[10px] font-bold hover:bg-primary/40 transition"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDelete(cancion.id)}
                              className="bg-error/20 text-error px-2 py-0.5 rounded text-[10px] font-bold hover:bg-error/40 transition"
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <button
                  onClick={abrirModalCrear}
                  className="mt-2 w-full py-2 border border-dashed border-primary/40 rounded-lg text-primary font-label-md hover:bg-primary/10 transition"
                >
                  + Agregar Canción
                </button>
              </div>
            </div>

            {/* Active Playlist Section (Canciones más pedidas) - Dinámico con las canciones agregadas */}
            <div className="glass-card rounded-xl p-md">
              <div className="flex items-center gap-sm mb-md">
                <span className="material-symbols-outlined text-primary">playlist_play</span>
                <h2 className="font-headline-md text-headline-md">Canciones más Pedidas</h2>
                {/* === ELIMINADO: botón "Ver Todo" === */}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-sm">
                {cancionesTop.length === 0 ? (
                  <div className="col-span-4 text-center text-on-surface-variant py-4">
                    No hay canciones aún. Agrega algunas para verlas aquí.
                  </div>
                ) : (
                  cancionesTop.map((cancion, idx) => (
                    <div key={cancion.id} className="group cursor-pointer">
                      <div className="relative aspect-square rounded-xl overflow-hidden mb-sm border border-white/10">
                        <img
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          src={
                            cancion.url && cancion.url.includes("youtube")
                              ? `https://img.youtube.com/vi/${cancion.url.split("v=")[1]?.split("&")[0]}/mqdefault.jpg`
                              : "https://lh3.googleusercontent.com/aida-public/AB6AXuBDTQPgTtx1UQMxwXyBCvFef-_V8rcSWwqGJQvXRXdtaxiG8V7C7UeyQE6R7Um_4nAryV2OKVaj6dfXfmlAjA1_zp3N4SAcO6Ns3_m_HmzNufJXoXiO8-6-qcKa3JOMy18Im2F21bD1jMhwBrxk5EqFWvSqHSmbdSgIBpiSMsPftevNCxn2bdOTiLX_sq6UfouD77zOYO3gPMgqveoeZQsVYABdf4IGpc97l37NPST1CtjPZI91uM5vqj6wDvIzaCKFlkTG_TNZ2RFh" // imagen por defecto
                          }
                          alt={cancion.titulo}
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="material-symbols-outlined text-primary text-display-lg" style={{ fontVariationSettings: "'FILL' 1" }}>play_circle</span>
                        </div>
                        {idx === 0 && (
                          <div className="absolute bottom-2 right-2 bg-primary text-on-primary rounded-full px-xs py-0.5 text-[10px] font-bold">TOP 1</div>
                        )}
                      </div>
                      <h4 className="font-label-md text-on-surface truncate">{cancion.titulo}</h4>
                      <p className="text-on-surface-variant text-xs">{cancion.artista}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          {/* Right Column: FX Control & Intensity */}
          <section className="lg:col-span-4 flex flex-col gap-gutter">
            <div className="glass-card rounded-xl p-md flex-1">
              <div className="flex items-center gap-sm mb-md">
                <span className="material-symbols-outlined text-primary">dynamic_form</span>
                <h2 className="font-headline-md text-headline-md">Control de FX</h2>
              </div>
              <p className="text-on-surface-variant font-label-md mb-md uppercase tracking-widest text-xs">Disparadores Manuales</p>
              <div className="grid grid-cols-2 gap-sm mb-lg">
                <button
                  onClick={() => triggerFX("Luces")}
                  className="flex flex-col items-center justify-center gap-xs p-md rounded-xl bg-surface-container hover:bg-primary/20 border border-white/10 hover:border-primary/50 transition-all active:scale-95 group"
                >
                  <span className="material-symbols-outlined text-primary text-3xl group-hover:scale-125 transition-transform">lightbulb</span>
                  <span className="font-label-md">Luces</span>
                </button>
                <button
                  onClick={() => triggerFX("CO2")}
                  className="flex flex-col items-center justify-center gap-xs p-md rounded-xl bg-surface-container hover:bg-primary/20 border border-white/10 hover:border-primary/50 transition-all active:scale-95 group"
                >
                  <span className="material-symbols-outlined text-primary text-3xl group-hover:scale-125 transition-transform">air</span>
                  <span className="font-label-md">CO2 Blast</span>
                </button>
                <button
                  onClick={() => triggerFX("Confeti")}
                  className="flex flex-col items-center justify-center gap-xs p-md rounded-xl bg-surface-container hover:bg-primary/20 border border-white/10 hover:border-primary/50 transition-all active:scale-95 group"
                >
                  <span className="material-symbols-outlined text-primary text-3xl group-hover:scale-125 transition-transform">celebration</span>
                  <span className="font-label-md">Confeti</span>
                </button>
                <button
                  onClick={() => triggerFX("Strobes")}
                  className="flex flex-col items-center justify-center gap-xs p-md rounded-xl bg-surface-container hover:bg-primary/20 border border-white/10 hover:border-primary/50 transition-all active:scale-95 group"
                >
                  <span className="material-symbols-outlined text-primary text-3xl group-hover:scale-125 transition-transform">bolt</span>
                  <span className="font-label-md">Strobes</span>
                </button>
              </div>
              <p className="text-on-surface-variant font-label-md mb-md uppercase tracking-widest text-xs">Cronograma de Efectos</p>
              <div className="space-y-sm">
                <div className="flex items-center gap-sm p-sm rounded-lg bg-white/5 border border-white/10">
                  <div className="w-10 h-10 rounded bg-primary/20 flex items-center justify-center text-primary font-bold">02:00</div>
                  <div className="flex-1">
                    <p className="font-label-md text-on-surface">Explosión de CO2</p>
                    <p className="text-xs text-on-surface-variant">Momento Clímax - Drop</p>
                  </div>
                  <div className="material-symbols-outlined text-on-surface-variant">drag_indicator</div>
                </div>
                <div className="flex items-center gap-sm p-sm rounded-lg bg-white/5 border border-white/10">
                  <div className="w-10 h-10 rounded bg-primary/20 flex items-center justify-center text-primary font-bold">02:30</div>
                  <div className="flex-1">
                    <p className="font-label-md text-on-surface">Lluvia de Confeti</p>
                    <p className="text-xs text-on-surface-variant">Intermedio Set Vortex</p>
                  </div>
                  <div className="material-symbols-outlined text-on-surface-variant">drag_indicator</div>
                </div>
                <div className="flex items-center gap-sm p-sm rounded-lg bg-white/5 border border-white/10 opacity-60">
                  <div className="w-10 h-10 rounded bg-white/10 flex items-center justify-center text-on-surface-variant font-bold">00:00</div>
                  <div className="flex-1">
                    <p className="font-label-md text-on-surface">Blackout Total</p>
                    <p className="text-xs text-on-surface-variant">Intro DJ Nexus (Completado)</p>
                  </div>
                  <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                </div>
              </div>
            </div>
            {/* Peak Intensity Visualization */}
            <div className="glass-card rounded-xl p-md">
              <h3 className="font-label-md text-on-surface-variant uppercase tracking-widest text-xs mb-md">Intensidad de la Pista</h3>
              <div className="flex items-end gap-1 h-24">
                <div className="w-full bg-primary/20 rounded-t h-[40%]"></div>
                <div className="w-full bg-primary/30 rounded-t h-[60%]"></div>
                <div className="w-full bg-primary/40 rounded-t h-[55%]"></div>
                <div className="w-full bg-primary/50 rounded-t h-[80%] animate-pulse"></div>
                <div className="w-full bg-primary rounded-t h-[95%] animate-pulse"></div>
                <div className="w-full bg-primary/60 rounded-t h-[70%]"></div>
                <div className="w-full bg-primary/40 rounded-t h-[50%]"></div>
                <div className="w-full bg-primary/20 rounded-t h-[30%]"></div>
              </div>
              <div className="flex justify-between mt-sm text-xs text-on-surface-variant">
                <span>23:00</span>
                <span className="text-primary font-bold">AHORA (SET VORTEX)</span>
                <span>05:00</span>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* ===== NOTIFICACIÓN FX (estilo "Efecto activado") ===== */}
      <div
        className={`fixed top-24 left-1/2 -translate-x-1/2 glass-card border-primary text-primary px-lg py-sm rounded-full transform transition-all duration-300 z-60 flex items-center gap-sm ${
          notificacionFX.visible ? "translate-y-0 opacity-100" : "-translate-y-20 opacity-0"
        }`}
      >
        <span className="material-symbols-outlined">bolt</span>
        <span className="font-label-md">{notificacionFX.mensaje}</span>
      </div>

      {/* ===== TOAST (para acciones CRUD) ===== */}
      <div
        className={`fixed bottom-margin-desktop right-margin-desktop glass-card rounded-xl px-md py-sm flex items-center gap-sm transition-all duration-300 z-[100] neon-border-primary ${
          toast.visible ? "translate-y-0 opacity-100" : "translate-y-24 opacity-0"
        }`}
      >
        <span className="material-symbols-outlined text-primary">check_circle</span>
        <div>
          <p className="text-on-surface font-bold text-sm">{toast.mensaje}</p>
          <p className="text-on-surface-variant text-xs">Operación completada</p>
        </div>
      </div>

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
              {modoEdicion ? "Editar Canción" : "Nueva Canción"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-label-md text-on-surface-variant mb-1">Título</label>
                <input
                  type="text"
                  name="titulo"
                  value={cancionActual.titulo || ""}
                  onChange={handleChange}
                  className="w-full bg-surface-container-high rounded-lg border border-white/10 px-3 py-2 text-on-surface focus:border-primary/50 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-label-md text-on-surface-variant mb-1">Artista</label>
                <input
                  type="text"
                  name="artista"
                  value={cancionActual.artista || ""}
                  onChange={handleChange}
                  className="w-full bg-surface-container-high rounded-lg border border-white/10 px-3 py-2 text-on-surface focus:border-primary/50 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-label-md text-on-surface-variant mb-1">Álbum</label>
                <input
                  type="text"
                  name="album"
                  value={cancionActual.album || ""}
                  onChange={handleChange}
                  className="w-full bg-surface-container-high rounded-lg border border-white/10 px-3 py-2 text-on-surface focus:border-primary/50 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-label-md text-on-surface-variant mb-1">Duración</label>
                <input
                  type="text"
                  name="duracion"
                  value={cancionActual.duracion || ""}
                  onChange={handleChange}
                  placeholder="ej. 3:45"
                  className="w-full bg-surface-container-high rounded-lg border border-white/10 px-3 py-2 text-on-surface focus:border-primary/50 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-label-md text-on-surface-variant mb-1">URL (YouTube)</label>
                <input
                  type="url"
                  name="url"
                  value={cancionActual.url || ""}
                  onChange={handleChange}
                  className="w-full bg-surface-container-high rounded-lg border border-white/10 px-3 py-2 text-on-surface focus:border-primary/50 focus:outline-none"
                />
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

export default AdminCanciones;