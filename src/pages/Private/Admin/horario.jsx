import React, { useState, useEffect } from "react";
import { horarioService } from "../../../services/horarioService"; // Ajusta la ruta

const AdminHorarios = () => {
  // Estados
  const [horarios, setHorarios] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [horarioActual, setHorarioActual] = useState({
    id: null,
    documento: "",
    nombre: "",
    rol: "Seguridad", // "Seguridad", "Bartender", "Server"
    dia: "Lun",
    horaInicio: "22:00",
    horaFin: "06:00",
    observaciones: "",
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, mensaje: "", tipo: "" });
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);
  const [semanaActual, setSemanaActual] = useState(0); // 0 = actual, 1 = siguiente, -1 = anterior
  const [coberturaRequests] = useState([
    { id: 1, nombre: "Javier S.", turno: "Hoy, 23:00 - Seguridad", estado: "urgente" },
    { id: 2, nombre: "Lucia M.", turno: "Mañana, 20:00 - Bartender", estado: "pendiente" },
  ]);

  // Días de la semana (fijos para el calendario)
  const diasSemana = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"];

  // Cargar horarios al montar
  useEffect(() => {
    cargarHorarios();
  }, []);

  const cargarHorarios = async () => {
    setLoading(true);
    try {
      const data = await horarioService.getAll();
      setHorarios(data);
      localStorage.setItem("afterdark_horarios", JSON.stringify(data));
    } catch (err) {
      const stored = localStorage.getItem("afterdark_horarios");
      if (stored) {
        setHorarios(JSON.parse(stored));
        mostrarToast("Datos cargados desde caché local", "info");
      } else {
        setHorarios([]);
        mostrarToast("Error al cargar horarios", "error");
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

  // CRUD
  const handleCreate = async (nuevoHorario) => {
    try {
      const created = await horarioService.create(nuevoHorario);
      const updated = [...horarios, created];
      setHorarios(updated);
      localStorage.setItem("afterdark_horarios", JSON.stringify(updated));
      mostrarToast("Horario agregado correctamente", "success");
      cerrarModal();
    } catch (err) {
      const tempId = Date.now();
      const nuevo = { ...nuevoHorario, id: tempId };
      const updated = [...horarios, nuevo];
      setHorarios(updated);
      localStorage.setItem("afterdark_horarios", JSON.stringify(updated));
      mostrarToast("Horario guardado localmente (sin conexión)", "info");
      cerrarModal();
    }
  };

  const handleUpdate = async (id, data) => {
    try {
      const updated = await horarioService.update(id, data);
      const updatedList = horarios.map((h) => (h.id === id ? updated : h));
      setHorarios(updatedList);
      localStorage.setItem("afterdark_horarios", JSON.stringify(updatedList));
      mostrarToast("Horario actualizado", "success");
      cerrarModal();
    } catch (err) {
      const updatedList = horarios.map((h) =>
        h.id === id ? { ...h, ...data } : h
      );
      setHorarios(updatedList);
      localStorage.setItem("afterdark_horarios", JSON.stringify(updatedList));
      mostrarToast("Actualizado localmente (sin conexión)", "info");
      cerrarModal();
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este horario?")) return;
    try {
      await horarioService.remove(id);
      const filtered = horarios.filter((h) => h.id !== id);
      setHorarios(filtered);
      localStorage.setItem("afterdark_horarios", JSON.stringify(filtered));
      mostrarToast("Horario eliminado", "success");
    } catch (err) {
      const filtered = horarios.filter((h) => h.id !== id);
      setHorarios(filtered);
      localStorage.setItem("afterdark_horarios", JSON.stringify(filtered));
      mostrarToast("Eliminado localmente (sin conexión)", "info");
    }
  };

  const abrirModalCrear = () => {
    setModoEdicion(false);
    setHorarioActual({
      id: null,
      documento: "",
      nombre: "",
      rol: "Seguridad",
      dia: "Lun",
      horaInicio: "22:00",
      horaFin: "06:00",
      observaciones: "",
    });
    setModalAbierto(true);
  };

  const abrirModalEditar = (horario) => {
    setModoEdicion(true);
    setHorarioActual(horario);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setHorarioActual({
      id: null,
      documento: "",
      nombre: "",
      rol: "Seguridad",
      dia: "Lun",
      horaInicio: "22:00",
      horaFin: "06:00",
      observaciones: "",
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (modoEdicion) {
      handleUpdate(horarioActual.id, horarioActual);
    } else {
      handleCreate(horarioActual);
    }
  };

  const handleChange = (e) => {
    setHorarioActual({ ...horarioActual, [e.target.name]: e.target.value });
  };

  // Filtro de búsqueda (por nombre o documento)
  const horariosFiltrados = horarios.filter((h) =>
    h.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.documento?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Obtener lista de personas únicas para el calendario (agrupado por nombre)
  const personas = horarios.reduce((acc, h) => {
    if (!acc.find(p => p.documento === h.documento)) {
      acc.push({ documento: h.documento, nombre: h.nombre, rol: h.rol });
    }
    return acc;
  }, []);

  // Función para obtener el horario de una persona en un día específico
  const getHorarioPorDia = (documento, dia) => {
    const horario = horarios.find(h => h.documento === documento && h.dia === dia);
    return horario;
  };

  // Función para obtener color según rol
  const getColorRol = (rol) => {
    if (rol === "Seguridad") return "primary";
    if (rol === "Bartender") return "secondary";
    if (rol === "Server") return "tertiary";
    return "on-surface";
  };

  // Función para obtener las clases de estilo según el turno
  const getTurnoClases = (horario, rol) => {
    if (!horario) return "bg-white/5 border border-white/5 flex items-center justify-center text-[10px] text-on-surface-variant";
    const color = getColorRol(rol);
    const bg = `bg-${color}/20`;
    const border = `border-${color}/40`;
    const text = `text-${color}`;
    return `w-full h-8 ${bg} border ${border} rounded flex items-center justify-center ${text}`;
  };

  // Navegación de semana (simulada)
  const cambiarSemana = (dir) => {
    setSemanaActual(semanaActual + dir);
  };

  // Logout
  const handleLogout = () => {
    window.location.href = "/home";
  };

  // Toggle notificaciones
  const toggleNotificaciones = () => {
    setNotificacionesAbiertas(!notificacionesAbiertas);
  };

  // Estadísticas
  const totalHorarios = horarios.length;
  const personasUnicas = personas.length;

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
          --background: #131313;
          --surface-container-low: #1c1b1b;
          --surface-container-lowest: #0e0e0e;
        }

        /* Fondo general */
        body {
          background-color: #050505;
          color: var(--on-surface);
          overflow-x: hidden;
        }

        /* Clases personalizadas */
        .glass-card {
          background: rgba(28, 28, 30, 0.7);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
        }
        .glass-card:hover {
          border: 1px solid rgba(233, 179, 255, 0.3);
          box-shadow: 0 0 20px rgba(233, 179, 255, 0.1);
        }
        .neon-glow-primary {
          box-shadow: 0 0 12px rgba(233, 179, 255, 0.3);
        }
        .neon-border-active {
          border: 1px solid #e9b3ff;
          box-shadow: 0 0 12px rgba(233, 179, 255, 0.3);
        }

        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: #131313;
        }
        ::-webkit-scrollbar-thumb {
          background: #353534;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #e9b3ff;
        }

        /* Clases de color */
        .bg-surface { background-color: var(--surface); }
        .bg-surface-container { background-color: var(--surface-container); }
        .bg-surface-container-high { background-color: var(--surface-container-high); }
        .bg-surface-container-highest { background-color: var(--surface-container-highest); }
        .bg-surface-variant { background-color: var(--surface-variant); }
        .bg-surface-container-low { background-color: var(--surface-container-low); }
        .bg-surface-container-lowest { background-color: var(--surface-container-lowest); }
        .text-on-surface { color: var(--on-surface); }
        .text-on-surface-variant { color: var(--on-surface-variant); }
        .text-primary { color: var(--primary); }
        .bg-primary { background-color: var(--primary); }
        .text-on-primary { color: var(--on-primary); }
        .bg-primary-container { background-color: var(--primary-container); }
        .text-secondary { color: var(--secondary); }
        .bg-secondary { background-color: var(--secondary); }
        .text-on-secondary { color: var(--on-secondary); }
        .text-tertiary { color: var(--tertiary); }
        .bg-tertiary { background-color: var(--tertiary); }
        .text-on-tertiary { color: var(--on-tertiary); }
        .bg-error { background-color: var(--error); }
        .text-error { color: var(--error); }
        .text-on-error { color: var(--on-error); }
        .bg-error-container { background-color: var(--error-container); }
        .border-primary { border-color: var(--primary); }
        .border-secondary { border-color: var(--secondary); }
        .border-tertiary { border-color: var(--tertiary); }
        .border-error { border-color: var(--error); }
        .border-white\\/10 { border-color: rgba(255,255,255,0.1); }
        .border-white\\/5 { border-color: rgba(255,255,255,0.05); }
        .bg-white\\/5 { background-color: rgba(255,255,255,0.05); }
        .bg-white\\/10 { background-color: rgba(255,255,255,0.1); }
        .bg-primary\\/5 { background-color: rgba(233,179,255,0.05); }
        .bg-primary\\/10 { background-color: rgba(233,179,255,0.1); }
        .bg-primary\\/20 { background-color: rgba(233,179,255,0.2); }
        .bg-secondary\\/20 { background-color: rgba(255,178,183,0.2); }
        .bg-tertiary\\/20 { background-color: rgba(231,196,72,0.2); }
        .bg-error-container\\/10 { background-color: rgba(147,0,10,0.1); }
        .bg-error-container\\/20 { background-color: rgba(147,0,10,0.2); }
        .border-error\\/20 { border-color: rgba(255,180,171,0.2); }
        .border-error\\/30 { border-color: rgba(255,180,171,0.3); }
        .border-primary\\/30 { border-color: rgba(233,179,255,0.3); }
        .border-primary\\/40 { border-color: rgba(233,179,255,0.4); }
        .border-secondary\\/40 { border-color: rgba(255,178,183,0.4); }
        .border-tertiary\\/40 { border-color: rgba(231,196,72,0.4); }
        .shadow-primary\\/20 { box-shadow: 0 4px 14px rgba(233,179,255,0.2); }
        .shadow-primary\\/30 { box-shadow: 0 0 20px rgba(233,179,255,0.3); }

        /* Fuentes */
        .font-headline-lg { font-family: 'Montserrat', sans-serif; }
        .font-headline-md { font-family: 'Montserrat', sans-serif; }
        .font-body-md { font-family: 'Inter', sans-serif; }
        .font-label-md { font-family: 'Inter', sans-serif; }
        .font-stats-number { font-family: 'Montserrat', sans-serif; }
        .font-display-lg { font-family: 'Montserrat', sans-serif; }

        /* Tamaños de fuente */
        .text-headline-lg { font-size: 32px; line-height: 40px; letter-spacing: -0.01em; font-weight: 700; }
        .text-headline-md { font-size: 24px; line-height: 32px; font-weight: 600; }
        .text-body-md { font-size: 16px; line-height: 24px; font-weight: 400; }
        .text-label-md { font-size: 14px; line-height: 20px; letter-spacing: 0.05em; font-weight: 600; }
        .text-stats-number { font-size: 36px; line-height: 44px; font-weight: 700; }
        .text-display-lg { font-size: 48px; line-height: 56px; letter-spacing: -0.02em; font-weight: 800; }
        .text-xs { font-size: 12px; line-height: 16px; }
        .text-sm { font-size: 14px; line-height: 20px; }
        .text-[10px] { font-size: 10px; }
        .text-[11px] { font-size: 11px; }
        .text-[12px] { font-size: 12px; }
        .text-[20px] { font-size: 20px; }
        .text-[32px] { font-size: 32px; }

        /* Utilidades */
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
        .border-l-4 { border-left-width: 4px; }
        .opacity-0 { opacity: 0; }
        .opacity-100 { opacity: 1; }
        .opacity-60 { opacity: 0.6; }
        .opacity-70 { opacity: 0.7; }
        .opacity-80 { opacity: 0.8; }
        .shadow-xl { box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04); }
        .shadow-2xl { box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); }
        .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05); }
        .shadow-\\[0_4px_20px_rgba\\(0\\,0\\,0\\,0\\.4\\)\\] { box-shadow: 0 4px 20px rgba(0,0,0,0.4); }
        .shadow-\\[0_0_20px_rgba\\(233\\,179\\,255\\,0\\.4\\)\\] { box-shadow: 0 0 20px rgba(233,179,255,0.4); }
        .shadow-\\[0_0_15px_rgba\\(233\\,179\\,255\\,0\\.3\\)\\] { box-shadow: 0 0 15px rgba(233,179,255,0.3); }
        .shadow-\\[0_0_20px_rgba\\(233\\,179\\,255\\,0\\.6\\)\\] { box-shadow: 0 0 20px rgba(233,179,255,0.6); }
        .z-10 { z-index: 10; }
        .z-40 { z-index: 40; }
        .z-50 { z-index: 50; }
        .z-100 { z-index: 100; }
        .z-200 { z-index: 200; }
        .z-60 { z-index: 60; }
        .relative { position: relative; }
        .absolute { position: absolute; }
        .fixed { position: fixed; }
        .sticky { position: sticky; }
        .inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
        .top-0 { top: 0; }
        .left-0 { left: 0; }
        .right-0 { right: 0; }
        .bottom-0 { bottom: 0; }
        .translate-y-0 { transform: translateY(0); }
        .-translate-y-1\\/2 { transform: translateY(-50%); }
        .-translate-y-20 { transform: translateY(-5rem); }
        .-translate-x-1\\/2 { transform: translateX(-50%); }
        .translate-x-0 { transform: translateX(0); }

        /* Espaciado */
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
        .p-1 { padding: 4px; }
        .p-2 { padding: 8px; }
        .p-3 { padding: 12px; }
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
        .w-2 { width: 0.5rem; }
        .w-8 { width: 2rem; }
        .w-10 { width: 2.5rem; }
        .w-12 { width: 3rem; }
        .w-14 { width: 3.5rem; }
        .h-full { height: 100%; }
        .h-20 { height: 5rem; }
        .h-10 { height: 2.5rem; }
        .h-8 { height: 2rem; }
        .h-2 { height: 0.5rem; }
        .h-12 { height: 3rem; }
        .h-14 { height: 3.5rem; }
        .h-24 { height: 6rem; }
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
        .overflow-y-auto { overflow-y: auto; }
        .overflow-x-auto { overflow-x: auto; }
        .border-collapse { border-collapse: collapse; }
        .divide-y > * + * { border-top-width: 1px; }
        .divide-white\\/5 > * + * { border-color: rgba(255,255,255,0.05); }
        .space-y-xs > * + * { margin-top: 4px; }
        .space-y-sm > * + * { margin-top: 12px; }
        .space-y-md > * + * { margin-top: 24px; }
        .space-x-3 > * + * { margin-left: 12px; }
        .grid { display: grid; }
        .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
        .grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
        .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .grid-cols-8 { grid-template-columns: repeat(8, minmax(0, 1fr)); }
        .grid-rows-4 { grid-template-rows: repeat(4, minmax(0, 1fr)); }
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
        .focus\\:ring-2:focus { outline: 2px solid var(--primary); outline-offset: 2px; }
        .focus\\:ring-primary:focus { --tw-ring-color: var(--primary); }
        .focus\\:ring-offset-0:focus { --tw-ring-offset-width: 0px; }
        .hover\\:bg-primary\\/10:hover { background-color: rgba(233,179,255,0.1); }
        .hover\\:bg-error\\/20:hover { background-color: rgba(255,180,171,0.2); }
        .hover\\:bg-white\\/5:hover { background-color: rgba(255,255,255,0.05); }
        .hover\\:bg-surface-bright:hover { background-color: var(--surface-bright); }
        .hover\\:border-primary\\/50:hover { border-color: rgba(233,179,255,0.5); }
        .hover\\:border-secondary\\/50:hover { border-color: rgba(255,178,183,0.5); }
        .hover\\:border-tertiary\\/50:hover { border-color: rgba(231,196,72,0.5); }
        .hover\\:border-white\\/40:hover { border-color: rgba(255,255,255,0.4); }
        .hover\\:text-primary:hover { color: var(--primary); }
        .hover\\:text-on-surface:hover { color: var(--on-surface); }
        .hover\\:brightness-110:hover { filter: brightness(1.1); }
        .active\\:scale-95:active { transform: scale(0.95); }
        .group-hover\\:translate-x-1:hover .group { transform: translateX(4px); }
        .group-hover\\:scale-110:hover .group { transform: scale(1.1); }
        .duration-300 { transition-duration: 300ms; }
        .duration-200 { transition-duration: 200ms; }
        .transition-all { transition: all 0.3s ease; }
        .transition-colors { transition-property: color, background-color, border-color; }
        .transform { transform: scale(1); }
        .hidden { display: none; }
        .flex { display: flex; }
        .inline-flex { display: inline-flex; }
        .block { display: block; }
        .table { display: table; }
        .border-none { border-style: none; }
        .outline-none { outline: none; }
        .object-cover { object-fit: cover; }
        .shrink-0 { flex-shrink: 0; }
        .truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .min-h-screen { min-height: 100vh; }
        .cursor-pointer { cursor: pointer; }
        .select-none { user-select: none; }
        .pointer-events-none { pointer-events: none; }
        .overflow-x-hidden { overflow-x: hidden; }
        .gap-1 { gap: 4px; }
        .gap-2 { gap: 8px; }
        .gap-3 { gap: 12px; }
        .space-y-1 > * + * { margin-top: 4px; }
        .space-y-2 > * + * { margin-top: 8px; }
        .space-y-3 > * + * { margin-top: 12px; }

        /* Animaciones */
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .animate-ping {
          animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        @keyframes ping {
          0% { transform: scale(1); opacity: 1; }
          75%, 100% { transform: scale(2); opacity: 0; }
        }
        .border-l-4 { border-left-width: 4px; }

        /* Responsive */
        @media (min-width: 768px) {
          .md\\:flex { display: flex; }
          .md\\:hidden { display: none; }
          .md\\:ml-xl { margin-left: 64px; }
          .md\\:block { display: block; }
          .md\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
          .md\\:p-margin-desktop { padding-left: 48px; padding-right: 48px; padding-top: 48px; padding-bottom: 48px; }
        }
        @media (min-width: 1024px) {
          .lg\\:grid-cols-12 { grid-template-columns: repeat(12, minmax(0, 1fr)); }
          .lg\\:col-span-8 { grid-column: span 8 / span 8; }
          .lg\\:col-span-4 { grid-column: span 4 / span 4; }
          .lg\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
      `}</style>

      {/* ===== HEADER ===== */}
      <header className="bg-surface/70 dark:bg-surface-container-low/70 backdrop-blur-xl border-b border-white/10 w-full sticky top-0 z-40 shadow-[0_4px_20px_rgba(0,0,0,0.4)] flex justify-between items-center px-margin-desktop py-base">
        <div className="flex items-center gap-base">
          <h1 className="font-display-lg text-headline-md font-extrabold text-primary tracking-tighter">Afterdark Pulse</h1>
        </div>
        <div className="flex items-center gap-md">
          <div className="relative hidden md:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input
              className="bg-surface-container text-on-surface pl-10 pr-4 py-2 rounded-full border-none focus:ring-2 focus:ring-primary w-64 transition-all"
              placeholder="Buscar personal..."
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-sm relative">
            <button
              className="p-2 rounded-full hover:bg-white/5 transition-colors cursor-pointer active:scale-95 duration-200"
              onClick={toggleNotificaciones}
            >
              <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
            </button>
            {notificacionesAbiertas && (
              <div className="absolute top-full right-0 mt-2 w-72 glass-card rounded-xl p-md z-50 border border-white/10 shadow-2xl">
                <h4 className="font-label-md text-on-surface mb-sm">Notificaciones</h4>
                <div className="space-y-sm max-h-60 overflow-y-auto custom-scrollbar">
                  <div className="p-sm bg-white/5 rounded-lg border border-white/5">
                    <p className="text-xs text-on-surface">🔔 Nuevo turno asignado a Marco R.</p>
                    <p className="text-[10px] text-on-surface-variant">Hace 5 min</p>
                  </div>
                  <div className="p-sm bg-white/5 rounded-lg border border-white/5">
                    <p className="text-xs text-on-surface">⏰ Cambio de horario para Elena V.</p>
                    <p className="text-[10px] text-on-surface-variant">Hace 15 min</p>
                  </div>
                  <div className="p-sm bg-white/5 rounded-lg border border-white/5">
                    <p className="text-xs text-on-surface">📋 Solicitud de cobertura de Javier S.</p>
                    <p className="text-[10px] text-on-surface-variant">Hace 45 min</p>
                  </div>
                </div>
                <button
                  onClick={() => setNotificacionesAbiertas(false)}
                  className="mt-sm w-full text-center text-xs text-primary hover:underline"
                >
                  Cerrar
                </button>
              </div>
            )}
            <button className="p-2 rounded-full hover:bg-white/5 transition-colors cursor-pointer active:scale-95 duration-200">
              <span className="material-symbols-outlined text-on-surface-variant">settings</span>
            </button>
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center cursor-pointer overflow-hidden border border-primary/30">
              <img
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBr4dYi8A0RsgnYNZLSIm0jtmNQLWr7eigYSUG2CXeg2BYe7pJdu3fKK1tWK7ZvUJw0vpsnYZKuObRPWCcSkaJ2COF8Df_uLjamjQsJg3SbyNv231KpQVjCJDH6HloiTP5GWoI35RFKN0m54u8_dmvbT1QXGISWe-ErFxC-5q3CYjwo4uUZJ91b85g1rrsqcaDIidbPZIPUaSQcBM852KX82KG6b_lEcYWsytt4ZnvLUxlQKO3MHS_LWeThVvuX310X4chSvJookzK7"
                alt="avatar"
              />
            </div>
          </div>
        </div>
      </header>

      {/* ===== SIDEBAR ===== */}
      <aside className="hidden md:flex h-screen w-xl fixed left-0 top-0 z-50 bg-surface-container-lowest/80 dark:bg-surface-container-lowest/80 backdrop-blur-2xl border-r border-white/5 flex-col py-lg shadow-xl mt-[72px]">
        <nav className="flex-1 px-sm space-y-2">
          <a className="flex items-center gap-sm px-md py-sm rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-all group" href="#">
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-label-md text-label-md group-hover:translate-x-1 duration-300">Dashboard</span>
          </a>
          <a className="flex items-center gap-sm px-md py-sm rounded-lg bg-primary/20 text-primary border-r-2 border-primary shadow-[0_0_15px_rgba(233,179,255,0.3)] group" href="#">
            <span className="material-symbols-outlined">group</span>
            <span className="font-label-md text-label-md group-hover:translate-x-1 duration-300">Users</span>
          </a>
          <a className="flex items-center gap-sm px-md py-sm rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-all group" href="#">
            <span className="material-symbols-outlined">inventory_2</span>
            <span className="font-label-md text-label-md group-hover:translate-x-1 duration-300">Inventory</span>
          </a>
          <a className="flex items-center gap-sm px-md py-sm rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-all group" href="#">
            <span className="material-symbols-outlined">payments</span>
            <span className="font-label-md text-label-md group-hover:translate-x-1 duration-300">Sales</span>
          </a>
          <a className="flex items-center gap-sm px-md py-sm rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-all group" href="#">
            <span className="material-symbols-outlined">event_seat</span>
            <span className="font-label-md text-label-md group-hover:translate-x-1 duration-300">Reservations</span>
          </a>
          <a className="flex items-center gap-sm px-md py-sm rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-all group" href="#">
            <span className="material-symbols-outlined">music_note</span>
            <span className="font-label-md text-label-md group-hover:translate-x-1 duration-300">Music</span>
          </a>
          <a className="flex items-center gap-sm px-md py-sm rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-all group" href="#">
            <span className="material-symbols-outlined">calendar_today</span>
            <span className="font-label-md text-label-md group-hover:translate-x-1 duration-300">Events</span>
          </a>
        </nav>
        <div className="px-sm pt-base border-t border-white/5 mt-auto">
          <a className="flex items-center gap-sm px-md py-sm rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-all group" href="#">
            <span className="material-symbols-outlined">help</span>
            <span className="font-label-md text-label-md">Support</span>
          </a>
          <button
            onClick={handleLogout}
            className="flex items-center gap-sm px-md py-sm rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-all group w-full text-left"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="font-label-md text-label-md">Logout</span>
          </button>
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 md:ml-xl p-margin-mobile md:p-margin-desktop space-y-lg bg-background min-h-screen">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-md">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-primary tracking-tight">Staff Scheduling &amp; Shift Rotation</h2>
            <p className="text-on-surface-variant font-body-md mt-1">Gestión de personal y rotación de turnos en tiempo real.</p>
          </div>
          <div className="flex gap-sm">
            <button className="bg-surface-container-high text-on-surface px-md py-sm rounded-lg font-label-md border border-white/10 hover:bg-surface-bright transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">download</span>
              Exportar
            </button>
            <button
              onClick={abrirModalCrear}
              className="bg-primary text-on-primary px-md py-sm rounded-lg font-label-md shadow-[0_0_20px_rgba(233,179,255,0.4)] hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              Nuevo Turno
            </button>
          </div>
        </div>

        {/* Dashboard Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          {/* Calendario Semanal */}
          <div className="lg:col-span-8 glass-card rounded-xl p-md overflow-hidden relative">
            <div className="flex justify-between items-center mb-lg">
              <div className="flex items-center gap-md">
                <h3 className="font-headline-md text-headline-md">Calendario Semanal</h3>
                <div className="flex items-center gap-xs bg-surface-container rounded-lg p-1 border border-white/5">
                  <button onClick={() => cambiarSemana(-1)} className="p-1 rounded hover:bg-white/5"><span className="material-symbols-outlined">chevron_left</span></button>
                  <span className="px-2 font-label-md">15 - 21 Mayo</span>
                  <button onClick={() => cambiarSemana(1)} className="p-1 rounded hover:bg-white/5"><span className="material-symbols-outlined">chevron_right</span></button>
                </div>
              </div>
              <div className="flex gap-xs">
                <span className="flex items-center gap-1 text-[12px] font-label-md text-on-surface-variant"><span className="w-2 h-2 rounded-full bg-primary"></span> Seguridad</span>
                <span className="flex items-center gap-1 text-[12px] font-label-md text-on-surface-variant"><span className="w-2 h-2 rounded-full bg-secondary"></span> Bartenders</span>
                <span className="flex items-center gap-1 text-[12px] font-label-md text-on-surface-variant"><span className="w-2 h-2 rounded-full bg-tertiary"></span> Servers</span>
              </div>
            </div>
            <div className="grid grid-cols-8 gap-1 border border-white/5 rounded-lg overflow-hidden bg-white/5">
              {/* Header Row */}
              <div className="p-2 bg-surface-container-high text-on-surface-variant font-label-md text-center border-b border-r border-white/5">Personal</div>
              {diasSemana.map((dia) => (
                <div key={dia} className={`p-2 bg-surface-container-high font-label-md text-center border-b border-r border-white/5 ${dia === "Mie" ? "text-primary" : "text-on-surface-variant"}`}>
                  {dia}
                </div>
              ))}

              {/* Filas de personal */}
              {personas.length === 0 ? (
                <div className="col-span-8 text-center p-4 text-on-surface-variant">No hay horarios registrados</div>
              ) : (
                personas.map((persona) => (
                  <React.Fragment key={persona.documento}>
                    <div className="p-3 bg-surface-container border-b border-r border-white/5 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-surface-variant overflow-hidden">
                        <img
                          className="w-full h-full object-cover"
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuACoXGc4a1d7HOUx7q5fXp6KhHag81a3nDc_VH8_OCOJ8T9yuUlKDmy1l0H_7uMxCZaQI2Qr9U2NKTJs6cWOwvBm7OnCNKxa0iQaiu5qkf6UuCErZ7gTkN6v8xROE4C5WQ0Ye9qsYbp-6mX08OIpEgWrrBoGK9Dr-UWGJrzMWh5hDjy7z9UJiNMo3qLVCZLrKa9eZ7x57z3scakB4-GcVoiNlqPiFh7gYuw4wMjiUUiSj1zT84WyPLExlcbn-aGFAnN14e2d1W6jf8U"
                          alt={persona.nombre}
                        />
                      </div>
                      <span className="text-xs font-label-md truncate">{persona.nombre}</span>
                    </div>
                    {diasSemana.map((dia) => {
                      const horario = getHorarioPorDia(persona.documento, dia);
                      const color = getColorRol(persona.rol);
                      return (
                        <div key={`${persona.documento}-${dia}`} className="p-2 bg-surface-container/50 border-b border-r border-white/5 flex items-center justify-center">
                          {horario ? (
                            <div
                              className={`w-full h-8 rounded flex items-center justify-center text-[10px] text-${color} bg-${color}/20 border border-${color}/40 cursor-pointer hover:brightness-110 transition-all`}
                              onClick={() => abrirModalEditar(horario)}
                            >
                              {horario.horaInicio} - {horario.horaFin}
                            </div>
                          ) : (
                            <div className="w-full h-8 bg-white/5 border border-white/5 rounded flex items-center justify-center text-[10px] text-on-surface-variant">—</div>
                          )}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))
              )}
            </div>
          </div>

          {/* Right Column: Stats & Status */}
          <div className="lg:col-span-4 flex flex-col gap-gutter">
            <div className="glass-card rounded-xl p-md">
              <div className="flex items-center justify-between mb-md">
                <h4 className="font-headline-md text-label-md uppercase tracking-wider text-primary">Estado Actual</h4>
                <span className="bg-green-500/20 text-green-400 text-[10px] px-2 py-1 rounded-full animate-pulse border border-green-500/30">EN VIVO</span>
              </div>
              <div className="space-y-sm">
                {personas.slice(0, 2).map((persona) => (
                  <div key={persona.documento} className="flex items-center justify-between p-sm rounded-lg bg-white/5 border border-white/5">
                    <div className="flex items-center gap-sm">
                      <div className="w-10 h-10 rounded-lg bg-surface-variant overflow-hidden border border-primary/20">
                        <img
                          className="w-full h-full object-cover"
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDOzDlE7u-zmlA-SZjZfDFjzu7OqZ-IYj231oIctA266456IABVVIi_Tuqb_Bz4AENxN2hDLH8kjaGlNpF8ExR623Yjij9EFyT2mQUxdKp251Qty4sE8MPZ85iOD9la9DE1qptc3VRQEZMhM0ydjsHm4ZFNhImwOevuCgdeP9Gsg5foXbdPitSDySXrlegO1dj7GrCFcpyGQF5aAiCEKVa8ZPkFnNA1wdf3xw4rT2DMMWx75BFBe7xx1e2MK-Cm9xnfNYbVGa8czZjl"
                          alt={persona.nombre}
                        />
                      </div>
                      <div>
                        <p className="font-label-md text-sm">{persona.nombre}</p>
                        <p className="text-[11px] text-on-surface-variant">{persona.rol}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[12px] font-stats-number text-primary">04:12</p>
                      <p className="text-[10px] text-on-surface-variant">Hrs Activo</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-md py-sm rounded-lg border border-primary/30 text-primary font-label-md text-xs hover:bg-primary/10 transition-all">
                Ver todos ({personas.length})
              </button>
            </div>

            {/* Upcoming Shift */}
            <div className="glass-card rounded-xl p-md">
              <h4 className="font-headline-md text-label-md uppercase tracking-wider text-secondary mb-md">Próximo Turno</h4>
              <p className="text-[11px] text-on-surface-variant mb-sm">Cambio en: <span className="text-on-surface font-bold">1h 15m</span></p>
              <div className="flex -space-x-3 mb-md">
                {personas.slice(0, 3).map((persona) => (
                  <div key={persona.documento} className="w-10 h-10 rounded-full border-2 border-background overflow-hidden">
                    <img
                      className="w-full h-full object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDG-LQN8A6fsNI3LkccAxWpYPyS-rneuR-uNIJDQ9b8AY4OQATH0cxYG9GTqnIQ-upjrVT-HXdUKrenlTuQ127fBX3zFcKQp6ys3Ec4JNegsTyGZbovA6NHtAT2kw2OM2n-lwMtDzFd0fG24RfGOZIFrrFP7NYRvGSlO_a_5ZFX82B_Xc_WNHW5TE_eYsmfSLQQERvgPeJU6sIeJAiUb-4OtZ8Ka6Gyam9FwhVijI-AFtcSx03q2v-XCQ-cR7jAcHd59bhdBycsP00S"
                      alt={persona.nombre}
                    />
                  </div>
                ))}
                {personas.length > 3 && (
                  <div className="w-10 h-10 rounded-full border-2 border-background bg-surface-container flex items-center justify-center text-[10px] text-on-surface-variant">+{personas.length - 3}</div>
                )}
              </div>
              <div className="p-sm rounded-lg bg-surface-container-low border border-white/5 space-y-1">
                <p className="text-xs font-label-md text-on-surface">Zona Bar Principal (4 personas)</p>
                <p className="text-xs font-label-md text-on-surface">Seguridad Exterior (3 personas)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Coverage Requests & Inventory */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
          <div className="glass-card rounded-xl p-md border-l-4 border-l-error/50">
            <div className="flex items-center gap-md mb-md">
              <div className="w-12 h-12 rounded-xl bg-error/10 flex items-center justify-center text-error">
                <span className="material-symbols-outlined text-[32px]">emergency_home</span>
              </div>
              <div>
                <h4 className="font-headline-md text-headline-md text-on-surface">Solicitudes de Cobertura</h4>
                <p className="text-on-surface-variant text-xs">Urgencias y sustituciones pendientes.</p>
              </div>
            </div>
            <div className="space-y-sm">
              {coberturaRequests.map((req) => (
                <div key={req.id} className={`flex items-center justify-between p-sm rounded-lg ${req.estado === "urgente" ? "bg-error-container/10 border border-error/20" : "bg-white/5 border border-white/5 opacity-80"}`}>
                  <div className="flex items-center gap-sm">
                    {req.estado === "urgente" && <div className="w-2 h-2 rounded-full bg-error animate-ping"></div>}
                    <div>
                      <p className="text-sm font-label-md">{req.nombre} <span className="text-on-surface-variant font-normal">solicita cambio</span></p>
                      <p className="text-[11px] text-on-surface-variant">Turno: {req.turno}</p>
                    </div>
                  </div>
                  <div className="flex gap-xs">
                    {req.estado === "urgente" ? (
                      <>
                        <button className="p-2 rounded-lg bg-surface-container hover:bg-error/20 text-error transition-all"><span className="material-symbols-outlined text-sm">close</span></button>
                        <button className="p-2 rounded-lg bg-primary text-on-primary transition-all"><span className="material-symbols-outlined text-sm">check</span></button>
                      </>
                    ) : (
                      <button className="text-[11px] text-primary font-label-md underline">Enviar recordatorio</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-xl p-md">
            <h4 className="font-headline-md text-headline-md mb-md">Acciones Rápidas</h4>
            <div className="grid grid-cols-2 gap-sm">
              <button className="p-md rounded-xl bg-surface-container-high border border-white/5 hover:border-primary/50 flex flex-col items-center gap-2 group transition-all">
                <span className="material-symbols-outlined text-primary group-hover:scale-110 duration-300">edit_calendar</span>
                <span className="text-xs font-label-md">Editar Rotación</span>
              </button>
              <button className="p-md rounded-xl bg-surface-container-high border border-white/5 hover:border-secondary/50 flex flex-col items-center gap-2 group transition-all">
                <span className="material-symbols-outlined text-secondary group-hover:scale-110 duration-300">mail</span>
                <span className="text-xs font-label-md">Notificar Todo</span>
              </button>
              <button className="p-md rounded-xl bg-surface-container-high border border-white/5 hover:border-tertiary/50 flex flex-col items-center gap-2 group transition-all">
                <span className="material-symbols-outlined text-tertiary group-hover:scale-110 duration-300">analytics</span>
                <span className="text-xs font-label-md">Analítica Horas</span>
              </button>
              <button className="p-md rounded-xl bg-surface-container-high border border-white/5 hover:border-white/40 flex flex-col items-center gap-2 group transition-all">
                <span className="material-symbols-outlined text-on-surface-variant group-hover:scale-110 duration-300">person_add</span>
                <span className="text-xs font-label-md">Contratación</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* ===== MOBILE NAV ===== */}
      <footer className="md:hidden fixed bottom-0 left-0 right-0 bg-surface-container-lowest/90 backdrop-blur-xl border-t border-white/5 z-50 flex justify-around py-sm px-margin-mobile">
        <a className="flex flex-col items-center gap-1 text-on-surface-variant" href="#">
          <span className="material-symbols-outlined">dashboard</span>
          <span className="text-[10px] font-label-md">Inicio</span>
        </a>
        <a className="flex flex-col items-center gap-1 text-primary" href="#">
          <span className="material-symbols-outlined">group</span>
          <span className="text-[10px] font-label-md">Staff</span>
        </a>
        <div className="relative -top-6">
          <button
            onClick={abrirModalCrear}
            className="w-14 h-14 bg-primary rounded-full shadow-[0_0_20px_rgba(233,179,255,0.6)] flex items-center justify-center text-on-primary"
          >
            <span className="material-symbols-outlined text-[32px]">add</span>
          </button>
        </div>
        <a className="flex flex-col items-center gap-1 text-on-surface-variant" href="#">
          <span className="material-symbols-outlined">calendar_today</span>
          <span className="text-[10px] font-label-md">Turnos</span>
        </a>
        <a className="flex flex-col items-center gap-1 text-on-surface-variant" href="#">
          <span className="material-symbols-outlined">account_circle</span>
          <span className="text-[10px] font-label-md">Perfil</span>
        </a>
      </footer>

      {/* ===== TOAST ===== */}
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
              {modoEdicion ? "Editar Horario" : "Nuevo Horario"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-label-md text-on-surface-variant mb-1">Documento del Trabajador</label>
                <input
                  type="text"
                  name="documento"
                  value={horarioActual.documento || ""}
                  onChange={handleChange}
                  className="w-full bg-surface-container-high rounded-lg border border-white/10 px-3 py-2 text-on-surface focus:border-primary/50 focus:outline-none"
                  required
                  placeholder="ej. 12345678"
                />
              </div>
              <div>
                <label className="block text-xs font-label-md text-on-surface-variant mb-1">Nombre Completo</label>
                <input
                  type="text"
                  name="nombre"
                  value={horarioActual.nombre || ""}
                  onChange={handleChange}
                  className="w-full bg-surface-container-high rounded-lg border border-white/10 px-3 py-2 text-on-surface focus:border-primary/50 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-label-md text-on-surface-variant mb-1">Rol</label>
                <select
                  name="rol"
                  value={horarioActual.rol || "Seguridad"}
                  onChange={handleChange}
                  className="w-full bg-surface-container-high rounded-lg border border-white/10 px-3 py-2 text-on-surface focus:border-primary/50 focus:outline-none"
                >
                  <option value="Seguridad">Seguridad</option>
                  <option value="Bartender">Bartender</option>
                  <option value="Server">Server</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-label-md text-on-surface-variant mb-1">Día</label>
                <select
                  name="dia"
                  value={horarioActual.dia || "Lun"}
                  onChange={handleChange}
                  className="w-full bg-surface-container-high rounded-lg border border-white/10 px-3 py-2 text-on-surface focus:border-primary/50 focus:outline-none"
                >
                  <option value="Lun">Lunes</option>
                  <option value="Mar">Martes</option>
                  <option value="Mie">Miércoles</option>
                  <option value="Jue">Jueves</option>
                  <option value="Vie">Viernes</option>
                  <option value="Sab">Sábado</option>
                  <option value="Dom">Domingo</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-label-md text-on-surface-variant mb-1">Hora Inicio</label>
                  <input
                    type="time"
                    name="horaInicio"
                    value={horarioActual.horaInicio || "22:00"}
                    onChange={handleChange}
                    className="w-full bg-surface-container-high rounded-lg border border-white/10 px-3 py-2 text-on-surface focus:border-primary/50 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-label-md text-on-surface-variant mb-1">Hora Fin</label>
                  <input
                    type="time"
                    name="horaFin"
                    value={horarioActual.horaFin || "06:00"}
                    onChange={handleChange}
                    className="w-full bg-surface-container-high rounded-lg border border-white/10 px-3 py-2 text-on-surface focus:border-primary/50 focus:outline-none"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-label-md text-on-surface-variant mb-1">Observaciones (opcional)</label>
                <input
                  type="text"
                  name="observaciones"
                  value={horarioActual.observaciones || ""}
                  onChange={handleChange}
                  className="w-full bg-surface-container-high rounded-lg border border-white/10 px-3 py-2 text-on-surface focus:border-primary/50 focus:outline-none"
                  placeholder="Ej. Turno especial"
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

export default AdminHorarios;