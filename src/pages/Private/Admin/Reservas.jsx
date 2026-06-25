import React, { useState, useEffect } from "react";
import { reservaService } from "../../../services/reservaService";
import { mesaService } from "../../../services/mesaService";
import { parqueaderoService } from "../../../services/parqueaderoService";

// Servicio simulado para covers (tarima)
const coverService = {
  getAll: async () => {
    const stored = localStorage.getItem("afterdark_covers");
    return stored ? JSON.parse(stored) : [];
  },
  create: async (data) => {
    const covers = await coverService.getAll();
    const newCover = { ...data, id: Date.now() };
    const updated = [...covers, newCover];
    localStorage.setItem("afterdark_covers", JSON.stringify(updated));
    return newCover;
  },
  update: async (id, data) => {
    const covers = await coverService.getAll();
    const updated = covers.map(c => c.id === id ? { ...c, ...data } : c);
    localStorage.setItem("afterdark_covers", JSON.stringify(updated));
    return updated.find(c => c.id === id);
  },
  remove: async (id) => {
    const covers = await coverService.getAll();
    const filtered = covers.filter(c => c.id !== id);
    localStorage.setItem("afterdark_covers", JSON.stringify(filtered));
    return { success: true };
  }
};

const AdminReservas = () => {
  // ===== ESTADOS (igual que antes) =====
  const [reservas, setReservas] = useState([]);
  const [mesas, setMesas] = useState([]);
  const [parqueaderos, setParqueaderos] = useState([]);
  const [covers, setCovers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const [modalRecursosAbierto, setModalRecursosAbierto] = useState(false);
  const [tabRecursos, setTabRecursos] = useState("mesas");

  const [mesaEditando, setMesaEditando] = useState(null);
  const [mesaForm, setMesaForm] = useState({ id: null, nombre: "", capacidad: 4, descripcion: "", cover: "" });

  const [parqEditando, setParqEditando] = useState(null);
  const [parqForm, setParqForm] = useState({ id: null, nombre: "", descripcion: "", cover: "" });

  const [coverEditando, setCoverEditando] = useState(null);
  const [coverForm, setCoverForm] = useState({ id: null, nombre: "", capacidad: 20, descripcion: "", cover: "" });

  const [toast, setToast] = useState({ visible: false, mensaje: "", tipo: "" });
  const [toastConfirm, setToastConfirm] = useState({ visible: false, mensaje: "" });

  // ===== CARGAR DATOS =====
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [reservasData, mesasData, parqData, coversData] = await Promise.all([
        reservaService.getAll(),
        mesaService.getAll(),
        parqueaderoService.getAll(),
        coverService.getAll(),
      ]);
      setReservas(reservasData);
      setMesas(mesasData);
      setParqueaderos(parqData);
      setCovers(coversData);
      localStorage.setItem("afterdark_reservas", JSON.stringify(reservasData));
      localStorage.setItem("afterdark_mesas", JSON.stringify(mesasData));
      localStorage.setItem("afterdark_parqueaderos", JSON.stringify(parqData));
      localStorage.setItem("afterdark_covers", JSON.stringify(coversData));
    } catch (err) {
      const storedReservas = localStorage.getItem("afterdark_reservas");
      const storedMesas = localStorage.getItem("afterdark_mesas");
      const storedParq = localStorage.getItem("afterdark_parqueaderos");
      const storedCovers = localStorage.getItem("afterdark_covers");
      if (storedReservas) setReservas(JSON.parse(storedReservas));
      if (storedMesas) setMesas(JSON.parse(storedMesas));
      if (storedParq) setParqueaderos(JSON.parse(storedParq));
      if (storedCovers) setCovers(JSON.parse(storedCovers));
      mostrarToast("Datos cargados desde caché local", "info");
    } finally {
      setLoading(false);
    }
  };

  // ===== TOASTS =====
  const mostrarToast = (mensaje, tipo = "success") => {
    setToast({ visible: true, mensaje, tipo });
    setTimeout(() => setToast({ visible: false, mensaje: "", tipo: "" }), 3000);
  };

  const mostrarToastConfirmacion = (mensaje) => {
    setToastConfirm({ visible: true, mensaje });
    setTimeout(() => setToastConfirm({ visible: false, mensaje: "" }), 3000);
  };

  // ===== CRUD RESERVAS =====
  const confirmarLlegada = async (reserva) => {
    if (reserva.estado === "Confirmado") return;
    const updatedReserva = { ...reserva, estado: "Confirmado" };
    try {
      await reservaService.update(reserva.id, updatedReserva);
      const updatedList = reservas.map((r) =>
        r.id === reserva.id ? updatedReserva : r
      );
      setReservas(updatedList);
      localStorage.setItem("afterdark_reservas", JSON.stringify(updatedList));
      mostrarToastConfirmacion("El cupo de parqueadero ha sido descontado.");
      mostrarToast("Llegada confirmada", "success");
    } catch (err) {
      const updatedList = reservas.map((r) =>
        r.id === reserva.id ? updatedReserva : r
      );
      setReservas(updatedList);
      localStorage.setItem("afterdark_reservas", JSON.stringify(updatedList));
      mostrarToastConfirmacion("El cupo de parqueadero ha sido descontado.");
      mostrarToast("Confirmación guardada localmente", "info");
    }
  };

  const eliminarReserva = async (id) => {
    if (!window.confirm("¿Cancelar esta reserva?")) return;
    try {
      await reservaService.remove(id);
      const filtered = reservas.filter((r) => r.id !== id);
      setReservas(filtered);
      localStorage.setItem("afterdark_reservas", JSON.stringify(filtered));
      mostrarToast("Reserva cancelada", "success");
    } catch (err) {
      const filtered = reservas.filter((r) => r.id !== id);
      setReservas(filtered);
      localStorage.setItem("afterdark_reservas", JSON.stringify(filtered));
      mostrarToast("Cancelada localmente", "info");
    }
  };

  // ===== GESTIÓN DE MESAS =====
  const abrirModalRecursos = () => {
    setModalRecursosAbierto(true);
    setTabRecursos("mesas");
    resetMesaForm();
    resetParqForm();
    resetCoverForm();
  };

  const cerrarModalRecursos = () => {
    setModalRecursosAbierto(false);
    setMesaEditando(null);
    setParqEditando(null);
    setCoverEditando(null);
  };

  const resetMesaForm = () => {
    setMesaForm({ id: null, nombre: "", capacidad: 4, descripcion: "", cover: "" });
    setMesaEditando(null);
  };

  const resetParqForm = () => {
    setParqForm({ id: null, nombre: "", descripcion: "", cover: "" });
    setParqEditando(null);
  };

  const resetCoverForm = () => {
    setCoverForm({ id: null, nombre: "", capacidad: 20, descripcion: "", cover: "" });
    setCoverEditando(null);
  };

  const handleMesaSubmit = async (e) => {
    e.preventDefault();
    if (mesaEditando) {
      try {
        const updated = await mesaService.update(mesaEditando.id, mesaForm);
        const updatedList = mesas.map((m) => (m.id === mesaEditando.id ? updated : m));
        setMesas(updatedList);
        localStorage.setItem("afterdark_mesas", JSON.stringify(updatedList));
        mostrarToast("Mesa actualizada", "success");
        resetMesaForm();
        cargarDatos();
      } catch (err) {
        const updatedList = mesas.map((m) =>
          m.id === mesaEditando.id ? { ...m, ...mesaForm } : m
        );
        setMesas(updatedList);
        localStorage.setItem("afterdark_mesas", JSON.stringify(updatedList));
        mostrarToast("Mesa actualizada localmente", "info");
        resetMesaForm();
      }
    } else {
      try {
        const created = await mesaService.create(mesaForm);
        const updated = [...mesas, created];
        setMesas(updated);
        localStorage.setItem("afterdark_mesas", JSON.stringify(updated));
        mostrarToast("Mesa agregada", "success");
        resetMesaForm();
        cargarDatos();
      } catch (err) {
        const tempId = Date.now();
        const nueva = { ...mesaForm, id: tempId };
        const updated = [...mesas, nueva];
        setMesas(updated);
        localStorage.setItem("afterdark_mesas", JSON.stringify(updated));
        mostrarToast("Mesa guardada localmente", "info");
        resetMesaForm();
      }
    }
  };

  const editarMesa = (mesa) => {
    setMesaEditando(mesa);
    setMesaForm({ id: mesa.id, nombre: mesa.nombre, capacidad: mesa.capacidad, descripcion: mesa.descripcion || "", cover: mesa.cover || "" });
    setTabRecursos("mesas");
  };

  const eliminarMesa = async (id) => {
    if (!window.confirm("¿Eliminar esta mesa?")) return;
    try {
      await mesaService.remove(id);
      const filtered = mesas.filter((m) => m.id !== id);
      setMesas(filtered);
      localStorage.setItem("afterdark_mesas", JSON.stringify(filtered));
      mostrarToast("Mesa eliminada", "success");
      cargarDatos();
    } catch (err) {
      const filtered = mesas.filter((m) => m.id !== id);
      setMesas(filtered);
      localStorage.setItem("afterdark_mesas", JSON.stringify(filtered));
      mostrarToast("Eliminada localmente", "info");
    }
  };

  // ===== GESTIÓN DE PARQUEADEROS =====
  const handleParqSubmit = async (e) => {
    e.preventDefault();
    if (parqEditando) {
      try {
        const updated = await parqueaderoService.update(parqEditando.id, parqForm);
        const updatedList = parqueaderos.map((p) => (p.id === parqEditando.id ? updated : p));
        setParqueaderos(updatedList);
        localStorage.setItem("afterdark_parqueaderos", JSON.stringify(updatedList));
        mostrarToast("Parqueadero actualizado", "success");
        resetParqForm();
        cargarDatos();
      } catch (err) {
        const updatedList = parqueaderos.map((p) =>
          p.id === parqEditando.id ? { ...p, ...parqForm } : p
        );
        setParqueaderos(updatedList);
        localStorage.setItem("afterdark_parqueaderos", JSON.stringify(updatedList));
        mostrarToast("Actualizado localmente", "info");
        resetParqForm();
      }
    } else {
      try {
        const created = await parqueaderoService.create(parqForm);
        const updated = [...parqueaderos, created];
        setParqueaderos(updated);
        localStorage.setItem("afterdark_parqueaderos", JSON.stringify(updated));
        mostrarToast("Parqueadero agregado", "success");
        resetParqForm();
        cargarDatos();
      } catch (err) {
        const tempId = Date.now();
        const nuevo = { ...parqForm, id: tempId };
        const updated = [...parqueaderos, nuevo];
        setParqueaderos(updated);
        localStorage.setItem("afterdark_parqueaderos", JSON.stringify(updated));
        mostrarToast("Guardado localmente", "info");
        resetParqForm();
      }
    }
  };

  const editarParq = (parq) => {
    setParqEditando(parq);
    setParqForm({ id: parq.id, nombre: parq.nombre, descripcion: parq.descripcion || "", cover: parq.cover || "" });
    setTabRecursos("parqueaderos");
  };

  const eliminarParq = async (id) => {
    if (!window.confirm("¿Eliminar este parqueadero?")) return;
    try {
      await parqueaderoService.remove(id);
      const filtered = parqueaderos.filter((p) => p.id !== id);
      setParqueaderos(filtered);
      localStorage.setItem("afterdark_parqueaderos", JSON.stringify(filtered));
      mostrarToast("Parqueadero eliminado", "success");
      cargarDatos();
    } catch (err) {
      const filtered = parqueaderos.filter((p) => p.id !== id);
      setParqueaderos(filtered);
      localStorage.setItem("afterdark_parqueaderos", JSON.stringify(filtered));
      mostrarToast("Eliminado localmente", "info");
    }
  };

  // ===== GESTIÓN DE COVERS =====
  const handleCoverSubmit = async (e) => {
    e.preventDefault();
    if (coverEditando) {
      try {
        const updated = await coverService.update(coverEditando.id, coverForm);
        const updatedList = covers.map((c) => (c.id === coverEditando.id ? updated : c));
        setCovers(updatedList);
        localStorage.setItem("afterdark_covers", JSON.stringify(updatedList));
        mostrarToast("Cover actualizado", "success");
        resetCoverForm();
        cargarDatos();
      } catch (err) {
        const updatedList = covers.map((c) =>
          c.id === coverEditando.id ? { ...c, ...coverForm } : c
        );
        setCovers(updatedList);
        localStorage.setItem("afterdark_covers", JSON.stringify(updatedList));
        mostrarToast("Actualizado localmente", "info");
        resetCoverForm();
      }
    } else {
      try {
        const created = await coverService.create(coverForm);
        const updated = [...covers, created];
        setCovers(updated);
        localStorage.setItem("afterdark_covers", JSON.stringify(updated));
        mostrarToast("Cover agregado", "success");
        resetCoverForm();
        cargarDatos();
      } catch (err) {
        const tempId = Date.now();
        const nuevo = { ...coverForm, id: tempId };
        const updated = [...covers, nuevo];
        setCovers(updated);
        localStorage.setItem("afterdark_covers", JSON.stringify(updated));
        mostrarToast("Guardado localmente", "info");
        resetCoverForm();
      }
    }
  };

  const editarCover = (cover) => {
    setCoverEditando(cover);
    setCoverForm({ id: cover.id, nombre: cover.nombre, capacidad: cover.capacidad, descripcion: cover.descripcion || "", cover: cover.cover || "" });
    setTabRecursos("covers");
  };

  const eliminarCover = async (id) => {
    if (!window.confirm("¿Eliminar este cover?")) return;
    try {
      await coverService.remove(id);
      const filtered = covers.filter((c) => c.id !== id);
      setCovers(filtered);
      localStorage.setItem("afterdark_covers", JSON.stringify(filtered));
      mostrarToast("Cover eliminado", "success");
      cargarDatos();
    } catch (err) {
      const filtered = covers.filter((c) => c.id !== id);
      setCovers(filtered);
      localStorage.setItem("afterdark_covers", JSON.stringify(filtered));
      mostrarToast("Eliminado localmente", "info");
    }
  };

  // ===== ESTADÍSTICAS =====
  const totalReservas = reservas.length;
  const reservasActivas = reservas.filter(r => r.estado !== "Cancelado");
  const mesasOcupadas = reservasActivas.filter(r => r.mesaId).length;
  const coversOcupados = reservasActivas.filter(r => r.coverId).length;
  const totalEspacios = mesas.length + covers.length;
  const espaciosOcupados = mesasOcupadas + coversOcupados;
  const espaciosDisponibles = totalEspacios - espaciosOcupados;

  const parqueaderosOcupados = reservasActivas.filter(r => r.parqueaderoId).length;
  const totalParqueaderos = parqueaderos.length;
  const porcentajeParqueo = totalParqueaderos ? Math.round((parqueaderosOcupados / totalParqueaderos) * 100) : 0;

  const getMesaLabel = (mesaId) => {
    const mesa = mesas.find(m => m.id === mesaId);
    return mesa ? mesa.nombre : "—";
  };

  const getCoverLabel = (coverId) => {
    const cover = covers.find(c => c.id === coverId);
    return cover ? cover.nombre : "—";
  };

  const getEspacioLabel = (reserva) => {
    if (reserva.mesaId) return getMesaLabel(reserva.mesaId);
    if (reserva.coverId) return getCoverLabel(reserva.coverId);
    return "—";
  };

  const getEspacioTipo = (reserva) => {
    if (reserva.mesaId) return "Mesa";
    if (reserva.coverId) return "Cover";
    return "—";
  };

  const reservasFiltradas = reservas.filter(r =>
    r.cliente?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ===== RENDER =====
  return (
    <>
      {/* ===== ESTILOS PERSONALIZADOS (IDÉNTICOS AL HTML ORIGINAL) ===== */}
      <style>{`
        body {
          background-color: #050505;
          color: #e5e2e1;
          overflow-x: hidden;
        }
        .glass-card {
          background: rgba(28, 28, 30, 0.7);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-top: 1px solid rgba(255, 255, 255, 0.15);
        }
        .neon-glow-primary {
          box-shadow: 0 0 15px rgba(233, 179, 255, 0.2);
        }
        .neon-border-primary {
          border: 1px solid #e9b3ff;
        }
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #353534;
          border-radius: 10px;
        }
        .animate-pulse {
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { opacity: 0.1; }
          50% { opacity: 0.4; }
          100% { opacity: 0.1; }
        }

        /* Clases de color y utilidades (mapeo de variables) */
        .bg-surface { background-color: #131313; }
        .bg-surface-container { background-color: #201f1f; }
        .bg-surface-container-high { background-color: #2a2a2a; }
        .bg-surface-container-highest { background-color: #353534; }
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
        .bg-tertiary\\/20 { background-color: rgba(231,196,72,0.2); }
        .bg-surface-container-highest\\/50 { background-color: rgba(53,53,52,0.5); }
        .shadow-primary\\/20 { box-shadow: 0 4px 14px rgba(233,179,255,0.2); }
        .shadow-\\[0_0_8px_\\#ffb2b7\\] { box-shadow: 0 0 8px #ffb2b7; }
        .shadow-\\[0_0_5px_\\#e9b3ff\\] { box-shadow: 0 0 5px #e9b3ff; }
        .shadow-\\[0_0_20px_rgba\\(233\\,179\\,255\\,0\\.1\\)\\] { box-shadow: 0 0 20px rgba(233,179,255,0.1); }
        .bg-error\\/20 { background-color: rgba(255,180,171,0.2); }

        /* Fuentes y tamaños */
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
        .mt-auto { margin-top: auto; }
        .mb-lg { margin-bottom: 40px; }
        .mb-xs { margin-bottom: 4px; }
        .mb-sm { margin-bottom: 12px; }
        .mt-xs { margin-top: 4px; }
        .mt-sm { margin-top: 12px; }
        .mt-md { margin-top: 24px; }
        .mr-xs { margin-right: 4px; }
        .ml-sm { margin-left: 12px; }

        .w-64 { width: 16rem; }
        .w-full { width: 100%; }
        .h-full { height: 100%; }
        .h-20 { height: 5rem; }
        .h-10 { height: 2.5rem; }
        .h-8 { height: 2rem; }
        .h-14 { height: 3.5rem; }
        .h-2 { height: 0.5rem; }
        .w-8 { width: 2rem; }
        .w-10 { width: 2.5rem; }
        .w-14 { width: 3.5rem; }
        .w-2 { width: 0.5rem; }
        .w-1\\.5 { width: 0.375rem; }
        .h-1\\.5 { height: 0.375rem; }
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
        .hover\\:bg-secondary\\/20:hover { background-color: rgba(255,178,183,0.2); }
        .hover\\:bg-primary\\/10:hover { background-color: rgba(233,179,255,0.1); }
        .hover\\:bg-white\\/5:hover { background-color: rgba(255,255,255,0.05); }
        .hover\\:bg-surface-variant:hover { background-color: #353534; }
        .hover\\:text-primary:hover { color: #e9b3ff; }
        .hover\\:text-on-surface:hover { color: #e5e2e1; }
        .group-hover\\:text-primary\\/10 .group:hover { color: rgba(233,179,255,0.1); }
        .active\\:translate-x-1:active { transform: translateX(4px); }
        .active\\:scale-95:active { transform: scale(0.95); }
        .bg-gradient-to-r { background-image: linear-gradient(to right, var(--tw-gradient-stops)); }
        .from-primary { --tw-gradient-from: #e9b3ff; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(233,179,255,0)); }
        .to-primary-container { --tw-gradient-to: #c863fb; }
        .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
        .text-\\[140px\\] { font-size: 140px; }
        .text-\\[10px\\] { font-size: 10px; }
        .font-bold { font-weight: 700; }
        .font-semibold { font-weight: 600; }
        .leading-none { line-height: 1; }
        .cursor-pointer { cursor: pointer; }
        .transition-all { transition: all 0.3s ease; }
        .duration-200 { transition-duration: 200ms; }
        .duration-300 { transition-duration: 300ms; }
        .duration-1000 { transition-duration: 1000ms; }
        .hover\\:scale-105:hover { transform: scale(1.05); }
        .hover\\:brightness-110:hover { filter: brightness(1.1); }
        .hidden { display: none; }
        .flex { display: flex; }
        .block { display: block; }
        .table { display: table; }
        .border-none { border-style: none; }
        .outline-none { outline: none; }
        .object-cover { object-fit: cover; }
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

        @media (min-width: 768px) {
          .md\\:flex { display: flex; }
          .md\\:hidden { display: none; }
          .md\\:ml-64 { margin-left: 16rem; }
          .md\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
          .md\\:col-span-2 { grid-column: span 2 / span 2; }
          .md\\:flex-row { flex-direction: row; }
          .md\\:items-end { align-items: flex-end; }
          .md\\:px-margin-desktop { padding-left: 48px; padding-right: 48px; }
        }
        @media (min-width: 1024px) {
          .lg\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
          .lg\\:col-span-2 { grid-column: span 2 / span 2; }
        }
      `}</style>

      {/* ===== SIDEBAR ===== */}
      <aside className="fixed left-0 top-0 h-full w-64 z-40 bg-surface-container/80 backdrop-blur-2xl border-r border-white/10 shadow-xl flex flex-col py-lg gap-base hidden md:flex">
        <div className="px-md mb-lg">
          <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">Afterdark Pulse</h1>
          <p className="font-label-md text-label-md text-on-surface-variant opacity-70">Management Hub</p>
        </div>
        <nav className="flex-1 px-sm space-y-xs">
          <a className="flex items-center gap-sm px-md py-sm font-label-md text-label-md text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-all duration-150 active:translate-x-1" href="#">
            <span className="material-symbols-outlined">dashboard</span> Dashboard
          </a>
          <a className="flex items-center gap-sm px-md py-sm font-label-md text-label-md text-primary border-r-2 border-primary bg-primary/5 transition-all duration-150 active:translate-x-1" href="#">
            <span className="material-symbols-outlined">event_seat</span> Reservations
          </a>
          <a className="flex items-center gap-sm px-md py-sm font-label-md text-label-md text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-all duration-150 active:translate-x-1" href="#">
            <span className="material-symbols-outlined">layers</span> VIP Floor
          </a>
          <a className="flex items-center gap-sm px-md py-sm font-label-md text-label-md text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-all duration-150 active:translate-x-1" href="#">
            <span className="material-symbols-outlined">monitoring</span> Analytics
          </a>
          <a className="flex items-center gap-sm px-md py-sm font-label-md text-label-md text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-all duration-150 active:translate-x-1" href="#">
            <span className="material-symbols-outlined">group</span> Users
          </a>
          <a className="flex items-center gap-sm px-md py-sm font-label-md text-label-md text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-all duration-150 active:translate-x-1" href="#">
            <span className="material-symbols-outlined">calendar_today</span> Events/Schedules
          </a>
        </nav>
        <div className="px-sm mt-auto pt-lg border-t border-white/5">
          <a className="flex items-center gap-sm px-md py-sm font-label-md text-label-md text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-all" href="#">
            <span className="material-symbols-outlined">help</span> Support
          </a>
          <a className="flex items-center gap-sm px-md py-sm font-label-md text-label-md text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-all" href="/home">
            <span className="material-symbols-outlined">logout</span> Logout
          </a>
        </div>
      </aside>

      {/* ===== HEADER ===== */}
      <header className="fixed top-0 w-full z-50 bg-surface/70 backdrop-blur-xl border-b border-white/10 shadow-[0_0_20px_rgba(233,179,255,0.1)] flex justify-between items-center px-margin-desktop h-20">
        <div className="flex items-center gap-lg">
          <div className="md:hidden">
            <span className="material-symbols-outlined text-primary">menu</span>
          </div>
          <div className="relative flex items-center bg-surface-container-high rounded-full px-md py-xs border border-white/5 focus-within:border-primary/50 transition-colors w-64">
            <span className="material-symbols-outlined text-on-surface-variant text-sm mr-xs">search</span>
            <input
              className="bg-transparent border-none focus:ring-0 text-sm text-on-surface w-full"
              placeholder="Buscar reservas..."
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center gap-md">
          <button className="relative p-sm text-on-surface-variant hover:text-primary transition-colors active:scale-95 duration-200">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full"></span>
          </button>
          <button className="p-sm text-on-surface-variant hover:text-primary transition-colors active:scale-95 duration-200">
            <span className="material-symbols-outlined">settings</span>
          </button>
          <div className="h-10 w-10 rounded-full border border-primary/30 overflow-hidden ml-sm">
            <img
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBeQG-jRCqU8a_daT3FfH5vFpEVcJEFmDQ-WHSDfiKriKFm5DJ_q1oYtvRB6UV7xDYJlD3BkCfdeMT62Qmx9lX8tup1HZGOFCxVYLTZve7CxhOfxO3cpvc9P6J1nEklITlKvWub7XbIb7b9hQtMxMRaYedJezpZ8W93l74zGBR47G7L8y93LdZleRorAp7XWduCrENhjEtksjTb94h4jCYbS36G7YjY_BidDyCXpPrkndDTvLwYRFqxjlJz5Q-MpLmlrhJr6WTn9cke"
              alt="avatar"
            />
          </div>
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main className="pt-24 pb-xl px-margin-mobile md:px-margin-desktop md:ml-64 relative z-10">
        {/* Header Section */}
        <section className="mb-lg">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-md">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface">Gestión de Reservas</h2>
              <p className="font-body-md text-on-surface-variant">Monitoreo en tiempo real de mesas VIP y logística de parqueadero.</p>
            </div>
            <div className="flex gap-sm">
              <button className="px-md py-sm bg-surface-container-high rounded-xl border border-white/10 font-label-md text-label-md text-on-surface hover:bg-surface-variant transition-all active:scale-95 flex items-center gap-xs">
                <span className="material-symbols-outlined text-sm">filter_list</span> Filtrar
              </button>
              <button
                onClick={abrirModalRecursos}
                className="px-md py-sm bg-primary rounded-xl font-label-md text-label-md text-on-primary hover:brightness-110 transition-all active:scale-95 neon-glow-primary flex items-center gap-xs"
              >
                <span className="material-symbols-outlined text-sm">settings</span> Gestionar Recursos
              </button>
            </div>
          </div>
        </section>

        {/* Bento Grid: Stats & Real-time Info */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-gutter mb-lg">
          {/* Parking Status */}
          <div className="glass-card col-span-1 md:col-span-2 rounded-xl p-md flex flex-col justify-between overflow-hidden relative group">
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <span className="font-label-md text-label-md text-primary tracking-widest">PARQUEADERO</span>
                <div className="mt-xs">
                  <span className="font-stats-number text-stats-number">{parqueaderosOcupados}</span>
                  <span className="text-on-surface-variant">/ {totalParqueaderos} cupos</span>
                </div>
              </div>
              <span className="material-symbols-outlined text-primary text-3xl">local_parking</span>
            </div>
            <div className="mt-md relative z-10">
              <div className="flex justify-between font-label-md text-[10px] text-on-surface-variant mb-xs">
                <span>{porcentajeParqueo}% OCUPADO</span>
                <span>{totalParqueaderos - parqueaderosOcupados} DISPONIBLES</span>
              </div>
              <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-primary to-primary-container h-full rounded-full transition-all duration-1000"
                  style={{ width: `${porcentajeParqueo}%` }}
                ></div>
              </div>
            </div>
            <div className="absolute -right-8 -bottom-8 text-primary/5 group-hover:text-primary/10 transition-all">
              <span className="material-symbols-outlined text-[140px]" style={{ fontVariationSettings: "'FILL' 1" }}>local_parking</span>
            </div>
          </div>

          {/* VIP Tables Status (mesas + covers) */}
          <div className="glass-card col-span-1 rounded-xl p-md flex flex-col items-center justify-center text-center">
            <span className="font-label-md text-label-md text-secondary tracking-widest mb-xs uppercase">Espacios VIP</span>
            <span className="font-stats-number text-stats-number text-on-surface">{espaciosDisponibles}</span>
            <p className="font-label-md text-label-md text-on-surface-variant">Disponibles ahora</p>
            <div className="mt-sm flex gap-xs">
              <div className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_#ffb2b7]"></div>
              <div className="w-2 h-2 rounded-full bg-white/10"></div>
              <div className="w-2 h-2 rounded-full bg-white/10"></div>
            </div>
          </div>

          {/* Total Reservations */}
          <div className="glass-card col-span-1 rounded-xl p-md flex flex-col items-center justify-center text-center">
            <span className="font-label-md text-label-md text-tertiary tracking-widest mb-xs uppercase">Reservas Hoy</span>
            <span className="font-stats-number text-stats-number text-on-surface">{totalReservas}</span>
            <p className="font-label-md text-label-md text-on-surface-variant">Confirmadas</p>
            <div className="mt-sm text-tertiary flex items-center gap-xs font-label-md">
              <span className="material-symbols-outlined text-sm">trending_up</span> +15% vs ayer
            </div>
          </div>
        </section>

        {/* Split Layout: Floor Plan & Reservation List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
          {/* Reservation List Section */}
          <section className="lg:col-span-2 space-y-md">
            <div className="flex items-center justify-between">
              <h3 className="font-headline-md text-headline-md text-on-surface">Próximas Llegadas</h3>
              <div className="flex gap-base">
                <button onClick={cargarDatos} className="text-on-surface-variant hover:text-primary transition-colors">
                  <span className="material-symbols-outlined">refresh</span>
                </button>
                <button className="text-on-surface-variant hover:text-primary transition-colors">
                  <span className="material-symbols-outlined">more_vert</span>
                </button>
              </div>
            </div>

            {/* Reservation Table */}
            <div className="glass-card rounded-xl overflow-hidden">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/10">
                      <th className="px-md py-sm font-label-md text-label-md text-on-surface-variant">Cliente</th>
                      <th className="px-md py-sm font-label-md text-label-md text-on-surface-variant">Mesa / Cover</th>
                      <th className="px-md py-sm font-label-md text-label-md text-on-surface-variant text-center">Parqueadero</th>
                      <th className="px-md py-sm font-label-md text-label-md text-on-surface-variant">Estado</th>
                      <th className="px-md py-sm font-label-md text-label-md text-on-surface-variant text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {loading ? (
                      <tr><td colSpan="5" className="text-center py-4 text-on-surface-variant">Cargando...</td></tr>
                    ) : reservasFiltradas.length === 0 ? (
                      <tr><td colSpan="5" className="text-center py-4 text-on-surface-variant">No hay reservas</td></tr>
                    ) : (
                      reservasFiltradas.map((reserva) => {
                        const estadoColor =
                          reserva.estado === "Confirmado"
                            ? "text-tertiary"
                            : reserva.estado === "Pendiente"
                            ? "text-on-surface-variant"
                            : "text-error";
                        const estadoPunto =
                          reserva.estado === "Confirmado"
                            ? "bg-tertiary"
                            : reserva.estado === "Pendiente"
                            ? "bg-on-surface-variant"
                            : "bg-error";
                        const esConfirmado = reserva.estado === "Confirmado";
                        const iniciales = reserva.cliente
                          ? reserva.cliente.split(" ").map(p => p[0]).join("").toUpperCase().slice(0, 2)
                          : "??";
                        const colorInicial =
                          reserva.estado === "Confirmado"
                            ? "bg-tertiary/20 text-tertiary"
                            : reserva.estado === "Pendiente"
                            ? "bg-primary/20 text-primary"
                            : "bg-white/10 text-on-surface";

                        return (
                          <tr key={reserva.id} className="hover:bg-white/5 transition-colors group">
                            <td className="px-md py-md">
                              <div className="flex items-center gap-sm">
                                <div className={`w-8 h-8 rounded-full ${colorInicial} flex items-center justify-center font-bold`}>
                                  {iniciales}
                                </div>
                                <div>
                                  <div className="text-on-surface font-semibold">{reserva.cliente}</div>
                                  <div className="text-xs text-on-surface-variant">
                                    {reserva.hora || "—"} • {reserva.personas || 1} Pers.
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-md py-md">
                              <span
                                className={`px-sm py-1 ${
                                  reserva.mesaId || reserva.coverId
                                    ? "bg-secondary-container/20 text-secondary border border-secondary/30"
                                    : "bg-surface-container-high border border-white/10 text-on-surface"
                                } rounded-lg text-xs font-bold`}
                              >
                                {getEspacioLabel(reserva)}
                                <span className="block text-[8px] opacity-60">{getEspacioTipo(reserva)}</span>
                              </span>
                            </td>
                            <td className="px-md py-md text-center">
                              {reserva.parqueaderoId ? (
                                <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                                  check_circle
                                </span>
                              ) : (
                                <span className="material-symbols-outlined text-on-surface-variant text-xl">cancel</span>
                              )}
                            </td>
                            <td className="px-md py-md">
                              <span className={`flex items-center gap-xs text-xs ${estadoColor}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${estadoPunto} ${reserva.estado === "Pendiente" ? "animate-pulse" : ""}`}></span>
                                {reserva.estado === "Confirmado" ? "En camino" : reserva.estado}
                              </span>
                            </td>
                            <td className="px-md py-md text-right">
                              <div className="flex justify-end gap-1">
                                {!esConfirmado && (
                                  <button
                                    onClick={() => confirmarLlegada(reserva)}
                                    className="bg-primary text-on-primary px-sm py-1.5 rounded-lg text-xs font-bold hover:scale-105 transition-transform active:scale-95 shadow-lg shadow-primary/20"
                                  >
                                    Confirmar Llegada
                                  </button>
                                )}
                                <button
                                  onClick={() => eliminarReserva(reserva.id)}
                                  className="bg-error/20 text-error px-2 py-1 rounded text-[10px] font-bold hover:bg-error/40 transition"
                                >
                                  Cancelar
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Layout: Interactive Floor Plan (Visual Concept) */}
          <aside className="space-y-md">
            <h3 className="font-headline-md text-headline-md text-on-surface">Plano VIP</h3>
            <div className="glass-card rounded-xl aspect-square relative overflow-hidden flex flex-col p-md">
              <div className="flex-1 grid grid-cols-4 grid-rows-4 gap-sm relative">
                {/* Mesas - hasta 8 como en el diseño original */}
                {mesas.slice(0, 8).map((mesa, idx) => {
                  const estaOcupada = reservas.some(
                    (r) => r.mesaId === mesa.id && r.estado !== "Cancelado"
                  );
                  const esVIP = idx < 3;
                  const label = mesa.nombre || `M${idx+1}`;
                  return (
                    <div
                      key={mesa.id}
                      className={`border ${
                        estaOcupada
                          ? "border-secondary bg-secondary/10 text-secondary neon-glow-primary"
                          : esVIP
                          ? "border-primary/40 bg-primary/5 text-primary"
                          : "border-white/10 bg-white/5 text-on-surface-variant"
                      } rounded-lg flex items-center justify-center text-[10px] font-bold cursor-pointer hover:bg-secondary/20 transition-all`}
                    >
                      {label}
                    </div>
                  );
                })}
                {/* Pista Central / Cover */}
                <div className="col-span-2 row-span-2 border border-primary/40 bg-primary/5 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden group">
                  <span className="text-primary font-bold">PISTA CENTRAL</span>
                  <span className="text-[10px] text-on-surface-variant">
                    {covers.length > 0 ? covers[0].nombre : "Tarima"}
                  </span>
                  <div className="absolute inset-0 bg-primary/10 animate-pulse"></div>
                </div>
                {/* Barra Principal */}
                <div className="col-span-4 h-8 bg-surface-container-highest/50 border border-white/5 rounded-lg flex items-center px-md justify-between">
                  <span className="text-[10px] text-on-surface-variant tracking-widest">BARRA PRINCIPAL</span>
                  <div className="flex gap-xs">
                    <span className="w-1 h-1 rounded-full bg-primary shadow-[0_0_5px_#e9b3ff]"></span>
                    <span className="w-1 h-1 rounded-full bg-primary shadow-[0_0_5px_#e9b3ff]"></span>
                    <span className="w-1 h-1 rounded-full bg-primary shadow-[0_0_5px_#e9b3ff]"></span>
                  </div>
                </div>
              </div>
              <div className="mt-md space-y-xs">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-on-surface-variant">Capacidad Total VIP</span>
                  <span className="text-on-surface font-bold">
                    {mesas.reduce((acc, m) => acc + m.capacidad, 0) + covers.reduce((acc, c) => acc + c.capacidad, 0)} personas
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-on-surface-variant">Ocupación Actual</span>
                  <span className="text-secondary font-bold">
                    {totalEspacios ? Math.round((espaciosOcupados / totalEspacios) * 100) : 0}%
                  </span>
                </div>
              </div>
              <button className="mt-md w-full py-sm border border-primary text-primary rounded-xl font-label-md text-label-md hover:bg-primary/10 transition-all">
                Ver Detalle del Mapa
              </button>
            </div>

            {/* Secondary Info Card */}
            <div className="glass-card rounded-xl p-md">
              <div className="flex items-center gap-sm mb-sm">
                <div className="p-sm bg-tertiary/20 text-tertiary rounded-lg">
                  <span className="material-symbols-outlined">local_activity</span>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant leading-none mb-1">Evento Especial</p>
                  <h4 className="font-bold text-on-surface">Neon Genesis Night</h4>
                </div>
              </div>
              <p className="text-sm text-on-surface-variant">
                Nivel de demanda esperado: <span className="text-primary font-bold">CRÍTICO</span>. Recomendado activar protocolo de parqueadero auxiliar en 15 min.
              </p>
            </div>
          </aside>
        </div>
      </main>

      {/* ===== TOAST DE CONFIRMACIÓN DE LLEGADA ===== */}
      <div
        className={`fixed bottom-margin-desktop right-margin-desktop glass-card rounded-xl px-md py-sm flex items-center gap-sm transition-all duration-300 z-[100] neon-border-primary ${
          toastConfirm.visible ? "translate-y-0 opacity-100" : "translate-y-24 opacity-0"
        }`}
      >
        <span className="material-symbols-outlined text-primary">check_circle</span>
        <div>
          <p className="text-on-surface font-bold text-sm">Llegada Confirmada</p>
          <p className="text-on-surface-variant text-xs">{toastConfirm.mensaje}</p>
        </div>
      </div>

      {/* ===== TOAST GENÉRICO ===== */}
      {toast.visible && (
        <div className="fixed bottom-24 right-8 glass-card rounded-xl px-md py-sm flex items-center gap-sm transition-all duration-300 z-[100] border border-primary/30">
          <span className="material-symbols-outlined text-primary">info</span>
          <div>
            <p className="text-on-surface font-bold text-sm">{toast.mensaje}</p>
          </div>
        </div>
      )}

      {/* ===== FAB MÓVIL ===== */}
      <div className="fixed bottom-8 right-8 z-50 md:hidden">
        <button
          onClick={abrirModalRecursos}
          className="h-14 w-14 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-2xl neon-glow-primary active:scale-90 transition-transform"
        >
          <span className="material-symbols-outlined text-3xl">settings</span>
        </button>
      </div>

      {/* ===== MODAL DE GESTIÓN DE RECURSOS ===== */}
      {modalRecursosAbierto && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass-card rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto relative border border-white/20 shadow-2xl custom-scrollbar">
            <button
              onClick={cerrarModalRecursos}
              className="absolute top-3 right-3 text-on-surface-variant hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <h3 className="font-headline-md text-headline-md text-on-surface mb-4">Gestionar Recursos</h3>

            {/* Pestañas */}
            <div className="flex border-b border-white/10 mb-4">
              <button
                className={`px-4 py-2 font-label-md text-label-md transition-colors ${
                  tabRecursos === "mesas"
                    ? "text-primary border-b-2 border-primary"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
                onClick={() => { setTabRecursos("mesas"); resetMesaForm(); resetParqForm(); resetCoverForm(); }}
              >
                Mesas
              </button>
              <button
                className={`px-4 py-2 font-label-md text-label-md transition-colors ${
                  tabRecursos === "parqueaderos"
                    ? "text-primary border-b-2 border-primary"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
                onClick={() => { setTabRecursos("parqueaderos"); resetMesaForm(); resetParqForm(); resetCoverForm(); }}
              >
                Parqueaderos
              </button>
              <button
                className={`px-4 py-2 font-label-md text-label-md transition-colors ${
                  tabRecursos === "covers"
                    ? "text-primary border-b-2 border-primary"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
                onClick={() => { setTabRecursos("covers"); resetMesaForm(); resetParqForm(); resetCoverForm(); }}
              >
                Cover / Tarima
              </button>
            </div>

            {/* Contenido de pestañas */}
            {tabRecursos === "mesas" && (
              <div>
                <form onSubmit={handleMesaSubmit} className="flex flex-wrap gap-2 items-end mb-4">
                  <div className="flex-1 min-w-[120px]">
                    <label className="block text-xs font-label-md text-on-surface-variant mb-1">Nombre</label>
                    <input
                      type="text"
                      className="w-full bg-surface-container-high rounded-lg border border-white/10 px-3 py-2 text-on-surface focus:border-primary/50 focus:outline-none"
                      value={mesaForm.nombre}
                      onChange={(e) => setMesaForm({ ...mesaForm, nombre: e.target.value })}
                      required
                      placeholder="ej. V-12"
                    />
                  </div>
                  <div className="w-24">
                    <label className="block text-xs font-label-md text-on-surface-variant mb-1">Capacidad</label>
                    <input
                      type="number"
                      className="w-full bg-surface-container-high rounded-lg border border-white/10 px-3 py-2 text-on-surface focus:border-primary/50 focus:outline-none"
                      value={mesaForm.capacidad}
                      onChange={(e) => setMesaForm({ ...mesaForm, capacidad: parseInt(e.target.value) || 1 })}
                      min="1"
                      required
                    />
                  </div>
                  <div className="flex-1 min-w-[120px]">
                    <label className="block text-xs font-label-md text-on-surface-variant mb-1">Descripción</label>
                    <input
                      type="text"
                      className="w-full bg-surface-container-high rounded-lg border border-white/10 px-3 py-2 text-on-surface focus:border-primary/50 focus:outline-none"
                      value={mesaForm.descripcion || ""}
                      onChange={(e) => setMesaForm({ ...mesaForm, descripcion: e.target.value })}
                      placeholder="ej. VIP con vista"
                    />
                  </div>
                  <div className="flex-1 min-w-[120px]">
                    <label className="block text-xs font-label-md text-on-surface-variant mb-1">Cover (URL imagen)</label>
                    <input
                      type="text"
                      className="w-full bg-surface-container-high rounded-lg border border-white/10 px-3 py-2 text-on-surface focus:border-primary/50 focus:outline-none"
                      value={mesaForm.cover || ""}
                      onChange={(e) => setMesaForm({ ...mesaForm, cover: e.target.value })}
                      placeholder="https://ejemplo.com/imagen.jpg"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-on-primary rounded-xl font-label-md hover:brightness-110 transition-all active:scale-95"
                  >
                    {mesaEditando ? "Actualizar" : "Agregar"}
                  </button>
                  {mesaEditando && (
                    <button
                      type="button"
                      onClick={() => { resetMesaForm(); setMesaEditando(null); }}
                      className="px-4 py-2 bg-surface-container-high border border-white/10 text-on-surface-variant rounded-xl font-label-md hover:bg-white/5 transition-all"
                    >
                      Cancelar
                    </button>
                  )}
                </form>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="py-2 text-xs font-label-md text-on-surface-variant">Nombre</th>
                        <th className="py-2 text-xs font-label-md text-on-surface-variant">Capacidad</th>
                        <th className="py-2 text-xs font-label-md text-on-surface-variant">Descripción</th>
                        <th className="py-2 text-xs font-label-md text-on-surface-variant text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mesas.length === 0 ? (
                        <tr><td colSpan="4" className="text-center py-4 text-on-surface-variant">No hay mesas</td></tr>
                      ) : (
                        mesas.map((mesa) => (
                          <tr key={mesa.id} className="border-b border-white/5 hover:bg-white/5">
                            <td className="py-2 text-sm text-on-surface">{mesa.nombre}</td>
                            <td className="py-2 text-sm text-on-surface">{mesa.capacidad}</td>
                            <td className="py-2 text-sm text-on-surface-variant">{mesa.descripcion || "—"}</td>
                            <td className="py-2 text-right">
                              <button
                                onClick={() => editarMesa(mesa)}
                                className="text-primary hover:underline text-xs mr-2"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => eliminarMesa(mesa.id)}
                                className="text-error hover:underline text-xs"
                              >
                                Eliminar
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {tabRecursos === "parqueaderos" && (
              <div>
                <form onSubmit={handleParqSubmit} className="flex flex-wrap gap-2 items-end mb-4">
                  <div className="flex-1 min-w-[120px]">
                    <label className="block text-xs font-label-md text-on-surface-variant mb-1">Nombre</label>
                    <input
                      type="text"
                      className="w-full bg-surface-container-high rounded-lg border border-white/10 px-3 py-2 text-on-surface focus:border-primary/50 focus:outline-none"
                      value={parqForm.nombre}
                      onChange={(e) => setParqForm({ ...parqForm, nombre: e.target.value })}
                      required
                      placeholder="ej. P-01"
                    />
                  </div>
                  <div className="flex-1 min-w-[120px]">
                    <label className="block text-xs font-label-md text-on-surface-variant mb-1">Descripción</label>
                    <input
                      type="text"
                      className="w-full bg-surface-container-high rounded-lg border border-white/10 px-3 py-2 text-on-surface focus:border-primary/50 focus:outline-none"
                      value={parqForm.descripcion || ""}
                      onChange={(e) => setParqForm({ ...parqForm, descripcion: e.target.value })}
                      placeholder="ej. Cubierto"
                    />
                  </div>
                  <div className="flex-1 min-w-[120px]">
                    <label className="block text-xs font-label-md text-on-surface-variant mb-1">Cover (URL imagen)</label>
                    <input
                      type="text"
                      className="w-full bg-surface-container-high rounded-lg border border-white/10 px-3 py-2 text-on-surface focus:border-primary/50 focus:outline-none"
                      value={parqForm.cover || ""}
                      onChange={(e) => setParqForm({ ...parqForm, cover: e.target.value })}
                      placeholder="https://ejemplo.com/imagen.jpg"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-on-primary rounded-xl font-label-md hover:brightness-110 transition-all active:scale-95"
                  >
                    {parqEditando ? "Actualizar" : "Agregar"}
                  </button>
                  {parqEditando && (
                    <button
                      type="button"
                      onClick={() => { resetParqForm(); setParqEditando(null); }}
                      className="px-4 py-2 bg-surface-container-high border border-white/10 text-on-surface-variant rounded-xl font-label-md hover:bg-white/5 transition-all"
                    >
                      Cancelar
                    </button>
                  )}
                </form>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="py-2 text-xs font-label-md text-on-surface-variant">Nombre</th>
                        <th className="py-2 text-xs font-label-md text-on-surface-variant">Descripción</th>
                        <th className="py-2 text-xs font-label-md text-on-surface-variant text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parqueaderos.length === 0 ? (
                        <tr><td colSpan="3" className="text-center py-4 text-on-surface-variant">No hay parqueaderos</td></tr>
                      ) : (
                        parqueaderos.map((parq) => (
                          <tr key={parq.id} className="border-b border-white/5 hover:bg-white/5">
                            <td className="py-2 text-sm text-on-surface">{parq.nombre}</td>
                            <td className="py-2 text-sm text-on-surface-variant">{parq.descripcion || "—"}</td>
                            <td className="py-2 text-right">
                              <button
                                onClick={() => editarParq(parq)}
                                className="text-primary hover:underline text-xs mr-2"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => eliminarParq(parq.id)}
                                className="text-error hover:underline text-xs"
                              >
                                Eliminar
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {tabRecursos === "covers" && (
              <div>
                <form onSubmit={handleCoverSubmit} className="flex flex-wrap gap-2 items-end mb-4">
                  <div className="flex-1 min-w-[120px]">
                    <label className="block text-xs font-label-md text-on-surface-variant mb-1">Nombre</label>
                    <input
                      type="text"
                      className="w-full bg-surface-container-high rounded-lg border border-white/10 px-3 py-2 text-on-surface focus:border-primary/50 focus:outline-none"
                      value={coverForm.nombre}
                      onChange={(e) => setCoverForm({ ...coverForm, nombre: e.target.value })}
                      required
                      placeholder="ej. Pista Central"
                    />
                  </div>
                  <div className="w-24">
                    <label className="block text-xs font-label-md text-on-surface-variant mb-1">Capacidad</label>
                    <input
                      type="number"
                      className="w-full bg-surface-container-high rounded-lg border border-white/10 px-3 py-2 text-on-surface focus:border-primary/50 focus:outline-none"
                      value={coverForm.capacidad}
                      onChange={(e) => setCoverForm({ ...coverForm, capacidad: parseInt(e.target.value) || 1 })}
                      min="1"
                      required
                    />
                  </div>
                  <div className="flex-1 min-w-[120px]">
                    <label className="block text-xs font-label-md text-on-surface-variant mb-1">Descripción</label>
                    <input
                      type="text"
                      className="w-full bg-surface-container-high rounded-lg border border-white/10 px-3 py-2 text-on-surface focus:border-primary/50 focus:outline-none"
                      value={coverForm.descripcion || ""}
                      onChange={(e) => setCoverForm({ ...coverForm, descripcion: e.target.value })}
                      placeholder="ej. Zona de baile"
                    />
                  </div>
                  <div className="flex-1 min-w-[120px]">
                    <label className="block text-xs font-label-md text-on-surface-variant mb-1">Cover (URL imagen)</label>
                    <input
                      type="text"
                      className="w-full bg-surface-container-high rounded-lg border border-white/10 px-3 py-2 text-on-surface focus:border-primary/50 focus:outline-none"
                      value={coverForm.cover || ""}
                      onChange={(e) => setCoverForm({ ...coverForm, cover: e.target.value })}
                      placeholder="https://ejemplo.com/imagen.jpg"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-on-primary rounded-xl font-label-md hover:brightness-110 transition-all active:scale-95"
                  >
                    {coverEditando ? "Actualizar" : "Agregar"}
                  </button>
                  {coverEditando && (
                    <button
                      type="button"
                      onClick={() => { resetCoverForm(); setCoverEditando(null); }}
                      className="px-4 py-2 bg-surface-container-high border border-white/10 text-on-surface-variant rounded-xl font-label-md hover:bg-white/5 transition-all"
                    >
                      Cancelar
                    </button>
                  )}
                </form>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="py-2 text-xs font-label-md text-on-surface-variant">Nombre</th>
                        <th className="py-2 text-xs font-label-md text-on-surface-variant">Capacidad</th>
                        <th className="py-2 text-xs font-label-md text-on-surface-variant">Descripción</th>
                        <th className="py-2 text-xs font-label-md text-on-surface-variant text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {covers.length === 0 ? (
                        <tr><td colSpan="4" className="text-center py-4 text-on-surface-variant">No hay covers</td></tr>
                      ) : (
                        covers.map((cover) => (
                          <tr key={cover.id} className="border-b border-white/5 hover:bg-white/5">
                            <td className="py-2 text-sm text-on-surface">{cover.nombre}</td>
                            <td className="py-2 text-sm text-on-surface">{cover.capacidad}</td>
                            <td className="py-2 text-sm text-on-surface-variant">{cover.descripcion || "—"}</td>
                            <td className="py-2 text-right">
                              <button
                                onClick={() => editarCover(cover)}
                                className="text-primary hover:underline text-xs mr-2"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => eliminarCover(cover.id)}
                                className="text-error hover:underline text-xs"
                              >
                                Eliminar
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default AdminReservas;