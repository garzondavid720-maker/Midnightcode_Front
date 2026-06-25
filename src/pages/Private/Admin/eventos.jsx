import React, { useState, useEffect } from "react";
import NavbarAdmin from "../../../components/Layout/NavbarHeader";

// Servicio local con localStorage
const eventoService = {
  getAll: async () => {
    const stored = localStorage.getItem("afterdark_eventos");
    return stored ? JSON.parse(stored) : [];
  },
  create: async (data) => {
    const eventos = await eventoService.getAll();
    const newEvento = { ...data, id: Date.now() };
    const updated = [...eventos, newEvento];
    localStorage.setItem("afterdark_eventos", JSON.stringify(updated));
    return newEvento;
  },
  update: async (id, data) => {
    const eventos = await eventoService.getAll();
    const updated = eventos.map(e => e.id === id ? { ...e, ...data } : e);
    localStorage.setItem("afterdark_eventos", JSON.stringify(updated));
    return updated.find(e => e.id === id);
  },
  remove: async (id) => {
    const eventos = await eventoService.getAll();
    const filtered = eventos.filter(e => e.id !== id);
    localStorage.setItem("afterdark_eventos", JSON.stringify(filtered));
    return { success: true };
  }
};

const AdminEventos = () => {
  // ===== ESTADOS =====
  const [eventos, setEventos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  // Modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [eventoActual, setEventoActual] = useState({
    id: null,
    nombre: "",
    fecha: "",
    descripcion: "",
    estado: "Available",
    tipo: "Concierto",
    imagen: "",
  });

  // Toast
  const [toast, setToast] = useState({ visible: false, mensaje: "", tipo: "" });

  // ===== CARGAR DATOS =====
  useEffect(() => {
    cargarEventos();
  }, []);

  const cargarEventos = async () => {
    setLoading(true);
    try {
      const data = await eventoService.getAll();
      setEventos(data);
    } catch (err) {
      setEventos([]);
      mostrarToast("Error al cargar eventos", "error");
    } finally {
      setLoading(false);
    }
  };

  // ===== TOAST =====
  const mostrarToast = (mensaje, tipo = "success") => {
    setToast({ visible: true, mensaje, tipo });
    setTimeout(() => setToast({ visible: false, mensaje: "", tipo: "" }), 3000);
  };

  // ===== VALIDACIONES =====
  const validarEvento = (evento) => {
    if (!evento.nombre.trim()) {
      mostrarToast("El nombre del evento es obligatorio", "error");
      return false;
    }
    if (!evento.fecha) {
      mostrarToast("La fecha del evento es obligatoria", "error");
      return false;
    }
    // Validar que la fecha no sea pasada (solo si es nuevo o si se cambió)
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaEvento = new Date(evento.fecha);
    if (fechaEvento < hoy) {
      mostrarToast("La fecha del evento no puede ser anterior a hoy", "error");
      return false;
    }
    if (!evento.tipo) {
      mostrarToast("El tipo de evento es obligatorio", "error");
      return false;
    }
    return true;
  };

  // ===== CRUD =====
  const handleCreate = async (nuevoEvento) => {
    if (!validarEvento(nuevoEvento)) return;
    try {
      const created = await eventoService.create(nuevoEvento);
      const updated = [...eventos, created];
      setEventos(updated);
      mostrarToast("Evento agregado correctamente", "success");
      cerrarModal();
    } catch (err) {
      mostrarToast("Error al guardar", "error");
    }
  };

  const handleUpdate = async (id, data) => {
    if (!validarEvento(data)) return;
    try {
      const updated = await eventoService.update(id, data);
      const updatedList = eventos.map((e) => (e.id === id ? updated : e));
      setEventos(updatedList);
      mostrarToast("Evento actualizado", "success");
      cerrarModal();
    } catch (err) {
      mostrarToast("Error al actualizar", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este evento?")) return;
    try {
      await eventoService.remove(id);
      const filtered = eventos.filter((e) => e.id !== id);
      setEventos(filtered);
      mostrarToast("Evento eliminado", "success");
    } catch (err) {
      mostrarToast("Error al eliminar", "error");
    }
  };

  // ===== MODAL =====
  const abrirModalCrear = () => {
    setModoEdicion(false);
    setEventoActual({
      id: null,
      nombre: "",
      fecha: "",
      descripcion: "",
      estado: "Available",
      tipo: "Concierto",
      imagen: "",
    });
    setModalAbierto(true);
  };

  const abrirModalEditar = (evento) => {
    setModoEdicion(true);
    setEventoActual(evento);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setEventoActual({
      id: null,
      nombre: "",
      fecha: "",
      descripcion: "",
      estado: "Available",
      tipo: "Concierto",
      imagen: "",
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (modoEdicion) {
      handleUpdate(eventoActual.id, eventoActual);
    } else {
      handleCreate(eventoActual);
    }
  };

  const handleChange = (e) => {
    setEventoActual({ ...eventoActual, [e.target.name]: e.target.value });
  };

  // ===== FILTRO Y ESTADÍSTICAS =====
  const eventosFiltrados = eventos.filter((e) =>
    e.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.tipo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalEventos = eventos.length;
  const eventosConfirmados = eventos.filter(e => e.estado === "Confirmed" || e.estado === "Sold Out").length;
  const eventosDisponibles = eventos.filter(e => e.estado === "Available" || e.estado === "Negotiating").length;

  // Próximos eventos (ordenados por fecha)
  const eventosProximos = [...eventos]
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
    .slice(0, 4);

  // ===== RENDER =====
  return (
    <>
      {/* ===== NAVBAR ADMIN ===== */}
      <NavbarAdmin />

      {/* ===== ESTILOS PERSONALIZADOS ===== */}
      <style>{`
        .glass-panel {
          background: rgba(28, 28, 30, 0.7);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-top: 1px solid rgba(255, 255, 255, 0.2);
        }
        .neon-glow-primary {
          box-shadow: 0 0 15px rgba(233, 179, 255, 0.3);
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
        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
        }
        @media (max-width: 768px) {
          .calendar-grid {
            grid-template-columns: repeat(1, 1fr);
          }
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
        .border-white\\/10 { border-color: rgba(255,255,255,0.1); }
        .border-white\\/5 { border-color: rgba(255,255,255,0.05); }
        .bg-white\\/5 { background-color: rgba(255,255,255,0.05); }
        .bg-white\\/10 { background-color: rgba(255,255,255,0.1); }
        .bg-primary\\/5 { background-color: rgba(233,179,255,0.05); }
        .bg-primary\\/10 { background-color: rgba(233,179,255,0.1); }
        .bg-primary\\/20 { background-color: rgba(233,179,255,0.2); }
        .bg-secondary\\/10 { background-color: rgba(255,178,183,0.1); }
        .bg-secondary\\/20 { background-color: rgba(255,178,183,0.2); }
        .bg-tertiary\\/10 { background-color: rgba(231,196,72,0.1); }
        .bg-tertiary\\/20 { background-color: rgba(231,196,72,0.2); }
        .border-error\\/30 { border-color: rgba(255,180,171,0.3); }
        .shadow-primary\\/20 { box-shadow: 0 4px 14px rgba(233,179,255,0.2); }
        .shadow-\\[0_0_8px_\\#ffb2b7\\] { box-shadow: 0 0 8px #ffb2b7; }
        .shadow-\\[0_0_5px_\\#e9b3ff\\] { box-shadow: 0 0 5px #e9b3ff; }
        .shadow-\\[0_0_20px_rgba\\(233\\,179\\,255\\,0\\.1\\)\\] { box-shadow: 0 0 20px rgba(233,179,255,0.1); }
        .shadow-\\[0_0_15px_rgba\\(233\\,179\\,255\\,0\\.1\\)\\] { box-shadow: 0 0 15px rgba(233,179,255,0.1); }
        .shadow-\\[0_0_8px_rgba\\(233\\,179\\,255\\,0\\.5\\)\\] { box-shadow: 0 0 8px rgba(233,179,255,0.5); }
        .shadow-\\[0_0_20px_rgba\\(233\\,179\\,255\\,0\\.6\\)\\] { box-shadow: 0 0 20px rgba(233,179,255,0.6); }
        .shadow-\\[0_0_30px_rgba\\(233\\,179\\,255\\,0\\.6\\)\\] { box-shadow: 0 0 30px rgba(233,179,255,0.6); }
        .shadow-\\[0_0_8px_rgba\\(231\\,196\\,72\\,0\\.6\\)\\] { box-shadow: 0 0 8px rgba(231,196,72,0.6); }

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
        .p-xs { padding: 4px; }
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
        .mb-1 { margin-bottom: 4px; }
        .mb-2 { margin-bottom: 8px; }
        .mb-4 { margin-bottom: 16px; }
        .mb-6 { margin-bottom: 24px; }
        .mb-8 { margin-bottom: 32px; }
        .mb-10 { margin-bottom: 40px; }

        .w-64 { width: 16rem; }
        .w-full { width: 100%; }
        .h-full { height: 100%; }
        .h-20 { height: 5rem; }
        .h-10 { height: 2.5rem; }
        .h-8 { height: 2rem; }
        .h-14 { height: 3.5rem; }
        .h-2 { height: 0.5rem; }
        .h-1\\.5 { height: 0.375rem; }
        .h-32 { height: 8rem; }
        .h-40 { height: 10rem; }
        .w-8 { width: 2rem; }
        .w-10 { width: 2.5rem; }
        .w-14 { width: 3.5rem; }
        .w-2 { width: 0.5rem; }
        .w-3 { width: 0.75rem; }
        .w-1\\.5 { width: 0.375rem; }
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
        .divide-white\\/5 > * + * { border-color: rgba(255,255,255,0.05); }
        .space-y-xs > * + * { margin-top: 4px; }
        .space-y-sm > * + * { margin-top: 12px; }
        .space-y-md > * + * { margin-top: 24px; }
        .space-y-6 > * + * { margin-top: 24px; }
        .grid { display: grid; }
        .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
        .grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
        .col-span-1 { grid-column: span 1 / span 1; }
        .col-span-2 { grid-column: span 2 / span 2; }
        .col-span-4 { grid-column: span 4 / span 4; }
        .row-span-2 { grid-row: span 2 / span 2; }
        .aspect-square { aspect-ratio: 1 / 1; }
        .bg-black\\/70 { background-color: rgba(0,0,0,0.7); }
        .backdrop-blur-sm { backdrop-filter: blur(4px); }
        .backdrop-blur-xl { backdrop-filter: blur(16px); }
        .backdrop-blur-2xl { backdrop-filter: blur(40px); }
        .focus\\:border-primary\\/50:focus { border-color: rgba(233,179,255,0.5); }
        .focus\\:ring-0:focus { outline: none; box-shadow: none; }
        .focus\\:ring-2:focus { outline: none; box-shadow: 0 0 0 2px rgba(233,179,255,0.5); }
        .focus\\:ring-primary:focus { --tw-ring-color: #e9b3ff; }
        .hover\\:bg-secondary\\/20:hover { background-color: rgba(255,178,183,0.2); }
        .hover\\:bg-primary\\/10:hover { background-color: rgba(233,179,255,0.1); }
        .hover\\:bg-white\\/5:hover { background-color: rgba(255,255,255,0.05); }
        .hover\\:bg-surface-variant:hover { background-color: #353534; }
        .hover\\:text-primary:hover { color: #e9b3ff; }
        .hover\\:text-on-surface:hover { color: #e5e2e1; }
        .hover\\:bg-error\\/10:hover { background-color: rgba(255,180,171,0.1); }
        .group-hover\\:text-primary:hover .group { color: #e9b3ff; }
        .group-hover\\:scale-110 .group:hover { transform: scale(1.1); }
        .group-hover\\:scale-110:hover .group { transform: scale(1.1); }
        .group-hover\\:opacity-100 .group:hover { opacity: 1; }
        .active\\:translate-x-1:active { transform: translateX(4px); }
        .active\\:scale-95:active { transform: scale(0.95); }
        .active\\:scale-90:active { transform: scale(0.9); }
        .bg-gradient-to-t { background-image: linear-gradient(to top, var(--tw-gradient-stops)); }
        .from-background { --tw-gradient-from: #131313; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(19,19,19,0)); }
        .via-background\\/40 { --tw-gradient-via: rgba(19,19,19,0.4); }
        .to-transparent { --tw-gradient-to: transparent; }
        .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
        .text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
        .text-8xl { font-size: 6rem; line-height: 1; }
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
        .sticky { position: sticky; }
        .inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
        .left-0 { left: 0; }
        .top-0 { top: 0; }
        .right-0 { right: 0; }
        .bottom-0 { bottom: 0; }
        .translate-y-0 { transform: translateY(0); }
        .translate-y-24 { transform: translateY(6rem); }
        .-translate-y-1\\/2 { transform: translateY(-50%); }
        .-translate-x-1\\/2 { transform: translateX(-50%); }
        .-right-4 { right: -1rem; }
        .-top-4 { top: -1rem; }
        .-top-8 { top: -2rem; }
        .-right-8 { right: -2rem; }
        .-bottom-8 { bottom: -2rem; }
        .z-10 { z-index: 10; }
        .z-40 { z-index: 40; }
        .z-50 { z-index: 50; }
        .z-\\[60\\] { z-index: 60; }
        .z-\\[100\\] { z-index: 100; }
        .z-\\[200\\] { z-index: 200; }
        .z-\\[-1\\] { z-index: -1; }
        .rounded-l-md { border-radius: 0.375rem 0 0 0.375rem; }
        .rounded-t-lg { border-radius: 0.5rem 0.5rem 0 0; }
        .shadow-\\[0_0_20px_rgba\\(233\\,179\\,255\\,0\\.6\\)\\] { box-shadow: 0 0 20px rgba(233,179,255,0.6); }
        .shadow-\\[0_0_10px_rgba\\(233\\,179\\,255\\,0\\.4\\)\\] { box-shadow: 0 0 10px rgba(233,179,255,0.4); }
        .shadow-\\[0_0_10px_rgba\\(231\\,196\\,72\\,0\\.5\\)\\] { box-shadow: 0 0 10px rgba(231,196,72,0.5); }
        .shadow-\\[0_0_10px_rgba\\(255\\,180\\,171\\,0\\.5\\)\\] { box-shadow: 0 0 10px rgba(255,180,171,0.5); }
        .shadow-\\[0_0_20px_rgba\\(233\\,179\\,255\\,0\\.6\\)\\] { box-shadow: 0 0 20px rgba(233,179,255,0.6); }
        .shadow-\\[0_0_30px_rgba\\(233\\,179\\,255\\,0\\.6\\)\\] { box-shadow: 0 0 30px rgba(233,179,255,0.6); }
        .shadow-\\[0_0_8px_rgba\\(231\\,196\\,72\\,0\\.6\\)\\] { box-shadow: 0 0 8px rgba(231,196,72,0.6); }
        .text-outline { color: #9b8c9e; }
        .text-outline-variant { color: #4f4352; }
        .border-outline-variant { border-color: #4f4352; }
        .bg-surface-container-highest\\/30 { background-color: rgba(53,53,52,0.3); }
        .bg-primary\\/30 { background-color: rgba(233,179,255,0.3); }
        .blur-3xl { filter: blur(3rem); }
        .bg-surface-container-low { background-color: #1c1b1b; }
        .bg-error\\/5 { background-color: rgba(255,180,171,0.05); }
        .bg-tertiary\\/5 { background-color: rgba(231,196,72,0.05); }
        .border-error\\/30 { border-color: rgba(255,180,171,0.3); }
        .border-tertiary\\/30 { border-color: rgba(231,196,72,0.3); }
        .filter { filter: var(--tw-filter); }
        .max-h-\\[600px\\] { max-height: 600px; }
        .max-h-\\[500px\\] { max-height: 500px; }
        .pointer-events-none { pointer-events: none; }
        .whitespace-nowrap { white-space: nowrap; }
        .opacity-30 { opacity: 0.3; }
        .opacity-10 { opacity: 0.1; }
        .opacity-40 { opacity: 0.4; }
        .opacity-60 { opacity: 0.6; }
        .opacity-80 { opacity: 0.8; }
        .scale-150 { transform: scale(1.5); }
        .rotate-90 { transform: rotate(90deg); }
        .bg-green-500 { background-color: #22c55e; }
        .text-green-500 { color: #22c55e; }
        .text-green-400 { color: #4ade80; }
        .text-yellow-400 { color: #facc15; }
        .bg-yellow-500 { background-color: #eab308; }
        .text-yellow-500 { color: #eab308; }
        .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .border-l-4 { border-left-width: 4px; }
        .border-l-primary { border-left-color: #e9b3ff; }
        .border-l-secondary { border-left-color: #ffb2b7; }
        .border-t-2 { border-top-width: 2px; }
        .border-t-primary { border-top-color: #e9b3ff; }
        .border-r-2 { border-right-width: 2px; }
        .border-r-primary { border-right-color: #e9b3ff; }
        .ring-1 { ring-width: 1px; }
        .ring-white\\/10 { ring-color: rgba(255,255,255,0.1); }
        .group-hover\\:ring-primary\\/50 .group:hover { ring-color: rgba(233,179,255,0.5); }
        .bg-cover { background-size: cover; }
        .bg-center { background-position: center; }
        .bg-gradient-to-t { background-image: linear-gradient(to top, var(--tw-gradient-stops)); }
        .from-background { --tw-gradient-from: #131313; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(19,19,19,0)); }
        .via-background\\/40 { --tw-gradient-via: rgba(19,19,19,0.4); }
        .to-transparent { --tw-gradient-to: transparent; }
        .drop-shadow-\\[0_0_8px_rgba\\(233\\,179\\,255\\,0\\.5\\)\\] { filter: drop-shadow(0 0 8px rgba(233,179,255,0.5)); }
        .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05); }
        .shadow-\\[0_0_30px_rgba\\(233\\,179\\,255\\,0\\.6\\)\\] { box-shadow: 0 0 30px rgba(233,179,255,0.6); }
        .shadow-\\[0_0_20px_rgba\\(233\\,179\\,255\\,0\\.6\\)\\] { box-shadow: 0 0 20px rgba(233,179,255,0.6); }
        .shadow-\\[0_0_15px_rgba\\(233\\,179\\,255\\,0\\.1\\)\\] { box-shadow: 0 0 15px rgba(233,179,255,0.1); }
        .shadow-\\[0_0_8px_rgba\\(231\\,196\\,72\\,0\\.6\\)\\] { box-shadow: 0 0 8px rgba(231,196,72,0.6); }
        .shadow-\\[0_0_8px_rgba\\(233\\,179\\,255\\,0\\.5\\)\\] { box-shadow: 0 0 8px rgba(233,179,255,0.5); }
        .shadow-\\[0_0_10px_rgba\\(233\\,179\\,255\\,0\\.4\\)\\] { box-shadow: 0 0 10px rgba(233,179,255,0.4); }
        .shadow-\\[0_0_10px_rgba\\(231\\,196\\,72\\,0\\.5\\)\\] { box-shadow: 0 0 10px rgba(231,196,72,0.5); }
        .shadow-\\[0_0_10px_rgba\\(255\\,180\\,171\\,0\\.5\\)\\] { box-shadow: 0 0 10px rgba(255,180,171,0.5); }
        .shadow-\\[0_0_20px_rgba\\(233\\,179\\,255\\,0\\.6\\)\\] { box-shadow: 0 0 20px rgba(233,179,255,0.6); }
        .shadow-\\[0_0_30px_rgba\\(233\\,179\\,255\\,0\\.6\\)\\] { box-shadow: 0 0 30px rgba(233,179,255,0.6); }

        @media (min-width: 768px) {
          .md\\:flex { display: flex; }
          .md\\:hidden { display: none; }
          .md\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
          .md\\:col-span-2 { grid-column: span 2 / span 2; }
          .md\\:flex-row { flex-direction: row; }
          .md\\:items-end { align-items: flex-end; }
          .md\\:px-margin-desktop { padding-left: 48px; padding-right: 48px; }
          .md\\:bottom-10 { bottom: 40px; }
          .md\\:right-10 { right: 40px; }
          .md\\:block { display: block; }
        }
        @media (min-width: 1024px) {
          .lg\\:grid-cols-12 { grid-template-columns: repeat(12, minmax(0, 1fr)); }
          .lg\\:col-span-8 { grid-column: span 8 / span 8; }
          .lg\\:col-span-4 { grid-column: span 4 / span 4; }
          .lg\\:flex { display: flex; }
          .lg\\:hidden { display: none; }
        }
      `}</style>

      {/* ===== MAIN CONTENT ===== */}
      <main className="pt-20 pb-xl px-margin-mobile md:px-margin-desktop background: rgba(28, 28, 30, 0.7) min-h-screen">
        {/* Header & View Switcher */}
        <section className="flex flex-col md:flex-row md:items-end background: rgba(28, 28, 30, 0.7) justify-between gap-md mt-md">
          <div className="space-y-xs">
            <h2 className="font-headline-lg text-headline-lg text-on-surface">Artistas y Talentos</h2>
            <p className="font-body-md text-on-surface-variant max-w-xl">
              Optimiza tus ingresos semanales sincronizando DJs invitados de alto impacto con las proyecciones de afluencia máxima.
            </p>
          </div>
          <div className="flex items-center gap-base">
            <div className="glass-panel flex p-[4px] rounded-lg">
              <button className="px-md py-xs rounded-md bg-primary text-on-primary-container text-label-md font-label-md">Mensual</button>
              <button className="px-md py-xs rounded-md text-on-surface-variant text-label-md font-label-md hover:text-primary transition-colors">Semanal</button>
            </div>
            <button
              onClick={abrirModalCrear}
              className="bg-primary hover:bg-primary-container text-on-primary font-bold py-xs px-md rounded-lg flex items-center gap-xs transition-all active:scale-95 shadow-lg shadow-primary/20"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              <span className="text-label-md">Nuevo Evento</span>
            </button>
          </div>
        </section>

        {/* Búsqueda (solo en móvil) */}
        <div className="md:hidden mt-4">
          <div className="relative glass-panel px-md py-xs rounded-full border-white/5 focus-within:ring-2 focus-within:ring-primary/50">
            <span className="material-symbols-outlined text-on-surface-variant text-sm absolute left-3 top-1/2 -translate-y-1/2">search</span>
            <input
              className="bg-transparent border-none focus:ring-0 text-sm text-on-surface placeholder:text-on-surface-variant/50 w-full pl-10"
              placeholder="Buscar eventos, artistas..."
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Main Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter mt-6">
          {/* Calendar View (8 Cols) */}
          <div className="lg:col-span-8 glass-panel rounded-xl overflow-hidden flex flex-col">
            <div className="p-md border-b border-white/10 flex justify-between items-center">
              <div className="flex items-center gap-md">
                <h3 className="font-headline-md text-headline-md text-primary">Octubre 2024</h3>
                <div className="flex gap-xs">
                  <button className="p-xs hover:bg-white/5 rounded-full text-on-surface-variant"><span className="material-symbols-outlined">chevron_left</span></button>
                  <button className="p-xs hover:bg-white/5 rounded-full text-on-surface-variant"><span className="material-symbols-outlined">chevron_right</span></button>
                </div>
              </div>
              <div className="flex gap-base">
                <span className="flex items-center gap-xs text-[10px] uppercase font-bold text-primary"><span className="w-2 h-2 bg-primary rounded-full"></span> Noche VIP</span>
                <span className="flex items-center gap-xs text-[10px] uppercase font-bold text-secondary"><span className="w-2 h-2 bg-secondary rounded-full"></span> AGOTADO</span>
              </div>
            </div>
            <div className="flex-1 overflow-x-auto">
              <div className="min-w-[700px]">
                <div className="calendar-grid bg-white/5">
                  <div className="p-sm text-center text-label-md text-on-surface-variant/60 font-bold border-r border-white/5">LUN</div>
                  <div className="p-sm text-center text-label-md text-on-surface-variant/60 font-bold border-r border-white/5">MAR</div>
                  <div className="p-sm text-center text-label-md text-on-surface-variant/60 font-bold border-r border-white/5">MIÉ</div>
                  <div className="p-sm text-center text-label-md text-on-surface-variant/60 font-bold border-r border-white/5">JUE</div>
                  <div className="p-sm text-center text-label-md text-on-surface-variant/60 font-bold border-r border-white/5">VIE</div>
                  <div className="p-sm text-center text-label-md text-on-surface-variant/60 font-bold border-r border-white/5">SÁB</div>
                  <div className="p-sm text-center text-label-md text-on-surface-variant/60 font-bold">DOM</div>
                </div>
                <div className="calendar-grid border-t border-white/5">
                  {/* Generar celdas del calendario (estático) */}
                  {[
                    { day: 28, empty: true }, { day: 29, empty: true }, { day: 30, empty: true },
                    { day: 1, event: null },
                    { day: 2, event: "Techno Thursday", color: "primary" },
                    { day: 3, event: "Neon Pulse", color: "secondary" },
                    { day: 4, event: null },
                    { day: 5, empty: false }, { day: 6, empty: false }, { day: 7, empty: false },
                    { day: 8, empty: false },
                    { day: 9, event: "DJ KINETIC", color: "primary" },
                    { day: 10, empty: false }, { day: 11, empty: false },
                    { day: 12, empty: false }, { day: 13, empty: false }, { day: 14, empty: false },
                    { day: 15, empty: false }, { day: 16, empty: false }, { day: 17, empty: false },
                    { day: 18, empty: false }
                  ].map((cell, idx) => (
                    <div
                      key={idx}
                      className={`h-32 p-xs border-r border-b border-white/5 text-xs font-label-md ${cell.empty ? 'opacity-30' : ''} ${cell.event ? 'bg-primary/5' : ''}`}
                    >
                      <span>{cell.day}</span>
                      {cell.event && (
                        <div className={`mt-xs p-xs ${cell.color === 'primary' ? 'bg-primary/20 border-l-2 border-primary text-primary' : 'bg-secondary border-l-2 border-on-secondary text-on-secondary'} rounded text-[10px] font-bold`}>
                          {cell.event}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar Status Tracking (4 Cols) */}
          <div className="lg:col-span-4 space-y-gutter">
            {/* Performance Gauge */}
            <div className="glass-panel rounded-xl p-md flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-sm">
                <span className="material-symbols-outlined text-primary/40">trending_up</span>
              </div>
              <h4 className="text-label-md font-label-md text-on-surface-variant uppercase tracking-widest mb-md">Eficiencia de Reservas Mensual</h4>
              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="80" cy="80" fill="none" r="70" stroke="rgba(255,255,255,0.05)" strokeWidth="12"></circle>
                  <circle className="drop-shadow-[0_0_8px_rgba(233,179,255,0.5)]" cx="80" cy="80" fill="none" r="70" stroke="#e9b3ff" strokeDasharray="440" strokeDashoffset="110" strokeWidth="12"></circle>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-stats-number text-stats-number text-on-surface">{totalEventos > 0 ? Math.round((eventosConfirmados / totalEventos) * 100) : 0}%</span>
                  <span className="text-[10px] text-on-surface-variant">Capacidad Alcanzada</span>
                </div>
              </div>
              <p className="mt-md text-body-md text-sm text-on-surface-variant">{eventosConfirmados} de {totalEventos} eventos contratados exitosamente.</p>
            </div>

            {/* Upcoming Talent List */}
            <div className="glass-panel rounded-xl flex flex-col max-h-[500px]">
              <div className="p-md border-b border-white/10">
                <h4 className="font-headline-md text-lg text-on-surface">Próximos Eventos</h4>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-sm space-y-sm">
                {loading ? (
                  <p className="text-on-surface-variant text-sm">Cargando...</p>
                ) : eventosProximos.length === 0 ? (
                  <p className="text-on-surface-variant text-sm">No hay eventos próximos</p>
                ) : (
                  eventosProximos.map((evento) => (
                    <div key={evento.id} className="flex gap-sm p-sm rounded-lg hover:bg-white/5 transition-colors group">
                      <img
                        className="w-16 h-16 rounded-lg object-cover ring-1 ring-white/10 group-hover:ring-primary/50 transition-all"
                        src={evento.imagen || "https://lh3.googleusercontent.com/aida-public/AB6AXuBvGHfTa1Rqw5FSBs4AwsdnPXS9q7X3CrFdu6N-lefRi8BUvTM23MMMm8c-kGJx8p-ws0NWAizx_r6dtgmp6rm_F-6B3PYGPmU0GnNPHO-ME4PR1Kroct76CEMTctD93RpbFWqcqAKUHU8k4A8ufBoiP62QjgpekNMALnbGZZte2PX4JUDCkRNHIiGc8zbbKP61IGVa0MwH-ixQKfawLPDUzPB7NJGmcAtiIUPih7UMZlEkIvsZEO2MGCb0RR9FCSRfapxaDFaVQiF6"}
                        alt={evento.nombre}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h5 className="text-on-surface font-bold text-sm truncate">{evento.nombre}</h5>
                          <span className={`${
                            evento.estado === "Sold Out" ? "bg-secondary text-on-secondary" :
                            evento.estado === "Confirmed" ? "bg-primary/20 text-primary border border-primary/30" :
                            "bg-white/10 text-on-surface-variant"
                          } text-[10px] font-bold px-xs py-[2px] rounded uppercase`}>
                            {evento.estado === "Sold Out" ? "Agotado" :
                             evento.estado === "Confirmed" ? "Confirmado" :
                             evento.estado === "Negotiating" ? "Negociando" : "Disponible"}
                          </span>
                        </div>
                        <p className="text-on-surface-variant text-xs mb-xs">{evento.tipo} • {evento.fecha ? new Date(evento.fecha).toLocaleDateString('es-ES') : "Fecha no definida"}</p>
                        <div className="flex items-center gap-xs">
                          <span className={`material-symbols-outlined text-[14px] ${
                            evento.estado === "Confirmed" || evento.estado === "Sold Out" ? "text-primary" :
                            evento.estado === "Negotiating" ? "text-tertiary" : "text-on-surface-variant/40"
                          }`}>
                            {evento.estado === "Confirmed" || evento.estado === "Sold Out" ? "check_circle" :
                             evento.estado === "Negotiating" ? "hourglass_bottom" : "contact_mail"}
                          </span>
                          <span className={`text-[10px] font-bold uppercase tracking-tighter ${
                            evento.estado === "Confirmed" || evento.estado === "Sold Out" ? "text-primary" :
                            evento.estado === "Negotiating" ? "text-tertiary" : "text-on-surface-variant"
                          }`}>
                            {evento.estado === "Confirmed" ? "Contrato Firmado" :
                             evento.estado === "Sold Out" ? "Agotado" :
                             evento.estado === "Negotiating" ? "Rider Pendiente" : "Negociando"}
                          </span>
                        </div>
                        <div className="mt-1 flex gap-1">
                          <button
                            onClick={() => abrirModalEditar(evento)}
                            className="text-primary hover:underline text-[10px]"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(evento.id)}
                            className="text-error hover:underline text-[10px]"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Booking Status Tracker (Bottom Row) */}
        <section className="glass-panel rounded-xl p-md mt-6">
          <div className="flex items-center justify-between mb-md">
            <h4 className="font-headline-md text-lg text-on-surface">Pipeline de Noches Temáticas</h4>
            <button className="text-primary text-label-md font-label-md flex items-center gap-xs">
              Ver Hoja de Ruta <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-md">
            {eventos.slice(0, 4).map((evento, idx) => {
              const progress = idx === 0 ? 75 : idx === 1 ? 25 : idx === 2 ? 100 : 50;
              const color = idx === 0 ? "primary" : idx === 1 ? "secondary" : idx === 2 ? "tertiary" : "primary";
              const status = idx === 0 ? `Fase 3/4` : idx === 1 ? `Borrador Inicial` : idx === 2 ? `Completado` : `Fase 2/4`;
              return (
                <div key={evento.id} className="space-y-xs">
                  <div className="flex justify-between text-[10px] font-bold uppercase text-on-surface-variant tracking-widest mb-xs">
                    <span>{evento.nombre}</span>
                    <span className={`text-${color}`}>{status}</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full bg-${color} rounded-full`} style={{ width: `${progress}%` }}></div>
                  </div>
                  <p className="text-[10px] text-on-surface-variant/60">{evento.descripcion || "En progreso..."}</p>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* ===== FAB ===== */}
      <button
        onClick={abrirModalCrear}
        className="fixed bottom-24 right-6 md:bottom-10 md:right-10 w-16 h-16 bg-primary text-on-primary rounded-full shadow-[0_0_30px_rgba(233,179,255,0.6)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 group"
      >
        <span className="material-symbols-outlined text-3xl group-hover:rotate-90 transition-transform">add</span>
        <span className="absolute right-20 bg-surface-container border border-white/10 px-4 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">Nuevo Evento</span>
      </button>

      {/* ===== TOAST ===== */}
      {toast.visible && (
        <div className={`fixed bottom-24 right-8 glass-panel rounded-xl px-md py-sm flex items-center gap-sm transition-all duration-300 z-[100] border ${toast.tipo === "error" ? "border-error/30" : "border-primary/30"}`}>
          <span className="material-symbols-outlined text-primary">info</span>
          <div>
            <p className="text-on-surface font-bold text-sm">{toast.mensaje}</p>
          </div>
        </div>
      )}

      {/* ===== MODAL ===== */}
      {modalAbierto && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass-panel rounded-2xl p-6 w-full max-w-md relative border border-white/20 shadow-2xl">
            <button
              onClick={cerrarModal}
              className="absolute top-3 right-3 text-on-surface-variant hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <h3 className="font-headline-md text-headline-md text-on-surface mb-4">
              {modoEdicion ? "Editar Evento" : "Nuevo Evento"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-label-md text-on-surface-variant mb-1">Nombre del Evento/Artista</label>
                <input
                  type="text"
                  name="nombre"
                  value={eventoActual.nombre || ""}
                  onChange={handleChange}
                  className="w-full bg-surface-container-high rounded-lg border border-white/10 px-3 py-2 text-on-surface focus:border-primary/50 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-label-md text-on-surface-variant mb-1">Fecha</label>
                <input
                  type="date"
                  name="fecha"
                  value={eventoActual.fecha || ""}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full bg-surface-container-high rounded-lg border border-white/10 px-3 py-2 text-on-surface focus:border-primary/50 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-label-md text-on-surface-variant mb-1">Tipo</label>
                <select
                  name="tipo"
                  value={eventoActual.tipo || "Concierto"}
                  onChange={handleChange}
                  className="w-full bg-surface-container-high rounded-lg border border-white/10 px-3 py-2 text-on-surface focus:border-primary/50 focus:outline-none"
                >
                  <option value="Concierto">Concierto</option>
                  <option value="DJ Set">DJ Set</option>
                  <option value="Promoter Takeover">Promoter Takeover</option>
                  <option value="Fiesta Temática">Fiesta Temática</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-label-md text-on-surface-variant mb-1">Estado</label>
                <select
                  name="estado"
                  value={eventoActual.estado || "Available"}
                  onChange={handleChange}
                  className="w-full bg-surface-container-high rounded-lg border border-white/10 px-3 py-2 text-on-surface focus:border-primary/50 focus:outline-none"
                >
                  <option value="Available">Disponible</option>
                  <option value="Confirmed">Confirmado</option>
                  <option value="Sold Out">Agotado</option>
                  <option value="Negotiating">Negociando</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-label-md text-on-surface-variant mb-1">Descripción</label>
                <textarea
                  name="descripcion"
                  value={eventoActual.descripcion || ""}
                  onChange={handleChange}
                  rows="2"
                  className="w-full bg-surface-container-high rounded-lg border border-white/10 px-3 py-2 text-on-surface focus:border-primary/50 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-label-md text-on-surface-variant mb-1">URL de Imagen</label>
                <input
                  type="url"
                  name="imagen"
                  value={eventoActual.imagen || ""}
                  onChange={handleChange}
                  className="w-full bg-surface-container-high rounded-lg border border-white/10 px-3 py-2 text-on-surface focus:border-primary/50 focus:outline-none"
                  placeholder="https://ejemplo.com/imagen.jpg"
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

export default AdminEventos;