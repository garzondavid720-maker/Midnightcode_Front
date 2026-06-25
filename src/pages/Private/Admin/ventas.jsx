import React, { useState, useEffect } from "react";
import { ventaService } from "../../../services/ventaService";
import NavbarAdmin from "../../../components/Layout/NavbarHeader";

const AdminVentas = () => {
  // ===== ESTADOS =====
  const [ventas, setVentas] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  // Modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [ventaActual, setVentaActual] = useState({
    id: null,
    concepto: "",
    metodo: "",
    monto: "",
    estado: "Completado",
    descripcion: "",
  });

  // Toast
  const [toast, setToast] = useState({ visible: false, mensaje: "", tipo: "" });

  // ===== CARGAR DATOS =====
  useEffect(() => {
    cargarVentas();
  }, []);

  const cargarVentas = async () => {
    setLoading(true);
    try {
      const data = await ventaService.getAll();
      setVentas(data);
      localStorage.setItem("afterdark_ventas", JSON.stringify(data));
    } catch (err) {
      const stored = localStorage.getItem("afterdark_ventas");
      if (stored) {
        setVentas(JSON.parse(stored));
        mostrarToast("Datos cargados desde caché local", "info");
      } else {
        setVentas([]);
        mostrarToast("Error al cargar ventas", "error");
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
  const handleCreate = async (nuevaVenta) => {
    try {
      const created = await ventaService.create(nuevaVenta);
      const updated = [...ventas, created];
      setVentas(updated);
      localStorage.setItem("afterdark_ventas", JSON.stringify(updated));
      mostrarToast("Venta agregada correctamente", "success");
      cerrarModal();
    } catch (err) {
      const tempId = Date.now();
      const nueva = { ...nuevaVenta, id: tempId };
      const updated = [...ventas, nueva];
      setVentas(updated);
      localStorage.setItem("afterdark_ventas", JSON.stringify(updated));
      mostrarToast("Venta guardada localmente (sin conexión)", "info");
      cerrarModal();
    }
  };

  const handleUpdate = async (id, data) => {
    try {
      const updated = await ventaService.update(id, data);
      const updatedList = ventas.map((v) => (v.id === id ? updated : v));
      setVentas(updatedList);
      localStorage.setItem("afterdark_ventas", JSON.stringify(updatedList));
      mostrarToast("Venta actualizada", "success");
      cerrarModal();
    } catch (err) {
      const updatedList = ventas.map((v) =>
        v.id === id ? { ...v, ...data } : v
      );
      setVentas(updatedList);
      localStorage.setItem("afterdark_ventas", JSON.stringify(updatedList));
      mostrarToast("Actualizada localmente (sin conexión)", "info");
      cerrarModal();
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar esta venta?")) return;
    try {
      await ventaService.remove(id);
      const filtered = ventas.filter((v) => v.id !== id);
      setVentas(filtered);
      localStorage.setItem("afterdark_ventas", JSON.stringify(filtered));
      mostrarToast("Venta eliminada", "success");
    } catch (err) {
      const filtered = ventas.filter((v) => v.id !== id);
      setVentas(filtered);
      localStorage.setItem("afterdark_ventas", JSON.stringify(filtered));
      mostrarToast("Eliminada localmente (sin conexión)", "info");
    }
  };

  // ===== MODAL =====
  const abrirModalCrear = () => {
    setModoEdicion(false);
    setVentaActual({ id: null, concepto: "", metodo: "", monto: "", estado: "Completado", descripcion: "" });
    setModalAbierto(true);
  };

  const abrirModalEditar = (venta) => {
    setModoEdicion(true);
    setVentaActual(venta);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setVentaActual({ id: null, concepto: "", metodo: "", monto: "", estado: "Completado", descripcion: "" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (modoEdicion) {
      handleUpdate(ventaActual.id, ventaActual);
    } else {
      handleCreate(ventaActual);
    }
  };

  const handleChange = (e) => {
    setVentaActual({ ...ventaActual, [e.target.name]: e.target.value });
  };

  // ===== FILTRO Y ESTADÍSTICAS =====
  const ventasFiltradas = ventas.filter((v) =>
    v.concepto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalVentas = ventas.reduce((acc, v) => acc + parseFloat(v.monto || 0), 0);
  const ventasCover = ventas
    .filter(v => v.concepto?.toLowerCase().includes("cover"))
    .reduce((acc, v) => acc + parseFloat(v.monto || 0), 0);
  const ventasBarra = ventas
    .filter(v => v.concepto?.toLowerCase().includes("barra") || v.concepto?.toLowerCase().includes("cóctel") || v.concepto?.toLowerCase().includes("botella"))
    .reduce((acc, v) => acc + parseFloat(v.monto || 0), 0);
  const ventasVIP = ventas
    .filter(v => v.concepto?.toLowerCase().includes("vip") || v.concepto?.toLowerCase().includes("mesa"))
    .reduce((acc, v) => acc + parseFloat(v.monto || 0), 0);

  const totalCoverTickets = ventas
    .filter(v => v.concepto?.toLowerCase().includes("cover"))
    .reduce((acc, v) => acc + (v.cantidad || 1), 0);

  const metodosPago = ventas.reduce((acc, v) => {
    const metodo = v.metodo || "Otro";
    acc[metodo] = (acc[metodo] || 0) + parseFloat(v.monto || 0);
    return acc;
  }, {});

  // ===== RENDER =====
  return (
    <>
      {/* ===== NAVBAR ===== */}
      <NavbarAdmin />

      {/* ===== ESTILOS PERSONALIZADOS (solo los necesarios para el contenido) ===== */}
      <style>{`
        body {
          background-color: #050505;
          color: #e5e2e1;
          font-family: 'Inter', sans-serif;
        }
        .glass-card {
          background: rgba(28, 28, 30, 0.7);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-top: 1px solid rgba(255, 255, 255, 0.2);
        }
        .neon-glow-primary {
          box-shadow: 0 0 12px 2px rgba(233, 179, 255, 0.3);
        }
        .neon-glow-secondary {
          box-shadow: 0 0 12px 2px rgba(208, 2, 66, 0.3);
        }
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .material-symbols-outlined.fill {
          font-variation-settings: 'FILL' 1;
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

        /* Clases de color y utilidades (mapeo) */
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
        .bg-green-500\\/10 { background-color: rgba(34,197,94,0.1); }
        .bg-green-500\\/20 { background-color: rgba(34,197,94,0.2); }
        .bg-yellow-500\\/20 { background-color: rgba(234,179,8,0.2); }
        .bg-surface-container-highest\\/30 { background-color: rgba(53,53,52,0.3); }
        .border-green-500\\/20 { border-color: rgba(34,197,94,0.2); }
        .border-green-500\\/30 { border-color: rgba(34,197,94,0.3); }
        .border-yellow-500\\/30 { border-color: rgba(234,179,8,0.3); }
        .border-tertiary\\/20 { border-color: rgba(231,196,72,0.2); }
        .border-primary\\/20 { border-color: rgba(233,179,255,0.2); }
        .border-primary\\/40 { border-color: rgba(233,179,255,0.4); }
        .border-error\\/30 { border-color: rgba(255,180,171,0.3); }
        .shadow-primary\\/20 { box-shadow: 0 4px 14px rgba(233,179,255,0.2); }
        .shadow-\\[0_0_8px_\\#ffb2b7\\] { box-shadow: 0 0 8px #ffb2b7; }
        .shadow-\\[0_0_5px_\\#e9b3ff\\] { box-shadow: 0 0 5px #e9b3ff; }
        .shadow-\\[0_0_20px_rgba\\(233\\,179\\,255\\,0\\.1\\)\\] { box-shadow: 0 0 20px rgba(233,179,255,0.1); }
        .shadow-\\[0_0_8px_rgba\\(233\\,179\\,255\\,0\\.5\\)\\] { box-shadow: 0 0 8px rgba(233,179,255,0.5); }
        .shadow-\\[0_0_8px_rgba\\(34\\,197\\,94\\,0\\.5\\)\\] { box-shadow: 0 0 8px rgba(34,197,94,0.5); }
        .shadow-\\[0_0_8px_rgba\\(231\\,196\\,72\\,0\\.5\\)\\] { box-shadow: 0 0 8px rgba(231,196,72,0.5); }
        .shadow-\\[0_0_20px_rgba\\(233\\,179\\,255\\,0\\.6\\)\\] { box-shadow: 0 0 20px rgba(233,179,255,0.6); }

        /* Fuentes */
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
        .pt-20 { padding-top: 5rem; } /* espacio para el navbar */
        .pb-20 { padding-bottom: 5rem; }
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
        .px-6 { padding-left: 24px; padding-right: 24px; }
        .py-sm { padding-top: 12px; padding-bottom: 12px; }
        .py-xs { padding-top: 4px; padding-bottom: 4px; }
        .py-lg { padding-top: 40px; padding-bottom: 40px; }
        .p-6 { padding: 24px; }
        .p-md { padding: 24px; }
        .p-sm { padding: 12px; }
        .mt-auto { margin-top: auto; }
        .mb-lg { margin-bottom: 40px; }
        .mb-xs { margin-bottom: 4px; }
        .mb-sm { margin-bottom: 12px; }
        .mt-xs { margin-top: 4px; }
        .mt-sm { margin-top: 12px; }
        .mt-md { margin-top: 24px; }
        .mt-8 { margin-top: 32px; }
        .mr-xs { margin-right: 4px; }
        .ml-sm { margin-left: 12px; }
        .ml-md { margin-left: 24px; }
        .mb-1 { margin-bottom: 4px; }
        .mb-2 { margin-bottom: 8px; }
        .mb-4 { margin-bottom: 16px; }
        .mb-6 { margin-bottom: 24px; }
        .mb-8 { margin-bottom: 32px; }
        .mb-10 { margin-bottom: 40px; }

        .w-full { width: 100%; }
        .h-full { height: 100%; }
        .h-10 { height: 2.5rem; }
        .h-8 { height: 2rem; }
        .h-14 { height: 3.5rem; }
        .h-2 { height: 0.5rem; }
        .h-64 { height: 16rem; }
        .w-8 { width: 2rem; }
        .w-10 { width: 2.5rem; }
        .w-14 { width: 3.5rem; }
        .w-2 { width: 0.5rem; }
        .w-3 { width: 0.75rem; }
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
        .bg-gradient-to-r { background-image: linear-gradient(to right, var(--tw-gradient-stops)); }
        .from-primary { --tw-gradient-from: #e9b3ff; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(233,179,255,0)); }
        .to-primary-container { --tw-gradient-to: #c863fb; }
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
        .pointer-events-none { pointer-events: none; }
        .whitespace-nowrap { white-space: nowrap; }
        .opacity-30 { opacity: 0.3; }
        .opacity-10 { opacity: 0.1; }
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
          .lg\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
          .lg\\:col-span-1 { grid-column: span 1 / span 1; }
          .lg\\:col-span-2 { grid-column: span 2 / span 2; }
        }
      `}</style>

      {/* ===== MAIN CONTENT ===== */}
      <main className="pt-20 px-margin-mobile md:px-margin-desktop pb-20 min-h-screen">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-md">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-white mb-2">Módulo de Ventas &amp; Cover</h1>
            <p className="font-body-md text-on-surface-variant">Monitoreo en tiempo real de ingresos por barra y accesos.</p>
          </div>
          <div className="flex items-center gap-sm">
            <div className="px-4 py-2 bg-surface-container rounded-lg border border-white/10 flex items-center gap-xs">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-label-md font-label-md text-white">Live Operations</span>
            </div>
            <button
              onClick={abrirModalCrear}
              className="bg-primary text-on-primary font-label-md px-6 py-2 rounded-lg neon-glow-primary active:scale-95 transition-transform"
            >
              Nueva Venta
            </button>
          </div>
        </header>

        {/* KPI Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter mb-gutter">
          {/* Total Revenue */}
          <div className="glass-card p-6 rounded-xl relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 text-primary opacity-10 scale-150">
              <span className="material-symbols-outlined text-8xl" style={{ fontVariationSettings: "'opsz' 48" }}>account_balance_wallet</span>
            </div>
            <p className="text-on-surface-variant font-label-md text-label-md uppercase tracking-widest mb-2">Ventas Totales</p>
            <h3 className="font-stats-number text-stats-number text-white mb-1">${totalVentas.toFixed(2)}</h3>
            <div className="flex items-center gap-xs text-green-400 font-label-md">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              <span>+12.5% vs ayer</span>
            </div>
          </div>
          {/* Cover Revenue */}
          <div className="glass-card p-6 rounded-xl border-l-4 border-l-primary relative overflow-hidden">
            <p className="text-on-surface-variant font-label-md text-label-md uppercase tracking-widest mb-2">Ingresos Cover</p>
            <h3 className="font-stats-number text-stats-number text-primary mb-1">${ventasCover.toFixed(2)}</h3>
            <div className="flex items-center gap-xs text-on-surface-variant font-label-md">
              <span className="material-symbols-outlined text-sm">confirmation_number</span>
              <span>{totalCoverTickets} Entradas vendidas</span>
            </div>
          </div>
          {/* Bar Sales */}
          <div className="glass-card p-6 rounded-xl border-l-4 border-l-secondary relative overflow-hidden">
            <p className="text-on-surface-variant font-label-md text-label-md uppercase tracking-widest mb-2">Ventas Barra</p>
            <h3 className="font-stats-number text-stats-number text-secondary mb-1">${ventasBarra.toFixed(2)}</h3>
            <div className="flex items-center gap-xs text-on-surface-variant font-label-md">
              <span className="material-symbols-outlined text-sm">liquor</span>
              <span>Ticket prom: ${ventasBarra > 0 ? (ventasBarra / ventas.filter(v => v.concepto?.toLowerCase().includes("barra")).length).toFixed(2) : "0.00"}</span>
            </div>
          </div>
          {/* VIP Sales */}
          <div className="glass-card p-6 rounded-xl relative overflow-hidden">
            <p className="text-on-surface-variant font-label-md text-label-md uppercase tracking-widest mb-2">Facturación VIP</p>
            <h3 className="font-stats-number text-stats-number text-tertiary mb-1">${ventasVIP.toFixed(2)}</h3>
            <div className="flex items-center gap-xs text-tertiary font-label-md">
              <span className="material-symbols-outlined text-sm">star</span>
              <span>{ventas.filter(v => v.concepto?.toLowerCase().includes("vip") || v.concepto?.toLowerCase().includes("mesa")).length} Mesas activas</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
          {/* Payment Methods Breakdown */}
          <div className="glass-card p-6 rounded-xl lg:col-span-1">
            <h4 className="font-headline-md text-headline-md text-white mb-6">Métodos de Pago</h4>
            <div className="space-y-6">
              {Object.keys(metodosPago).length === 0 ? (
                <p className="text-on-surface-variant">Sin datos de pago</p>
              ) : (
                Object.entries(metodosPago).map(([metodo, monto]) => {
                  const porcentaje = totalVentas > 0 ? (monto / totalVentas) * 100 : 0;
                  const color =
                    metodo.toLowerCase().includes("efectivo") ? "green-500" :
                    metodo.toLowerCase().includes("tarjeta") ? "primary" :
                    metodo.toLowerCase().includes("vip") ? "tertiary" : "primary";
                  const icon =
                    metodo.toLowerCase().includes("efectivo") ? "payments" :
                    metodo.toLowerCase().includes("tarjeta") ? "credit_card" :
                    metodo.toLowerCase().includes("vip") ? "diamond" : "payments";
                  return (
                    <div key={metodo}>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-sm">
                          <div className={`w-8 h-8 rounded-lg bg-${color}/10 border border-${color}/20 flex items-center justify-center`}>
                            <span className={`material-symbols-outlined text-${color} text-sm`}>{icon}</span>
                          </div>
                          <span className="font-label-md text-label-md text-on-surface">{metodo}</span>
                        </div>
                        <span className="font-label-md text-label-md text-white">${monto.toFixed(2)}</span>
                      </div>
                      <div className="w-full bg-surface-container rounded-full h-2">
                        <div className={`bg-${color} h-2 rounded-full shadow-[0_0_8px_rgba(${color === 'green-500' ? '34,197,94' : color === 'primary' ? '233,179,255' : '231,196,72'},0.5)]`} style={{ width: `${Math.min(porcentaje, 100)}%` }}></div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <div className="mt-8 pt-6 border-t border-white/5">
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <p className="font-body-md text-primary text-sm italic">
                  "La mayoría de las ventas de barra se están realizando con tarjeta de crédito/débito esta noche."
                </p>
              </div>
            </div>
          </div>

          {/* Revenue Trend Chart Placeholder */}
          <div className="glass-card p-6 rounded-xl lg:col-span-2 relative overflow-hidden">
            <div className="flex justify-between items-center mb-8">
              <h4 className="font-headline-md text-headline-md text-white">Tendencia de Ingresos</h4>
              <div className="flex gap-xs">
                <span className="px-3 py-1 rounded bg-surface-container-high text-[10px] text-on-surface-variant font-bold uppercase tracking-tighter">Por Hora</span>
                <span className="px-3 py-1 rounded bg-primary text-[10px] text-on-primary font-bold uppercase tracking-tighter">Live</span>
              </div>
            </div>
            <div className="h-64 flex items-end justify-between gap-base px-2">
              {/* Small Bar Chart - Simulado */}
              <div className="flex-1 bg-primary/20 rounded-t-lg relative group transition-all hover:bg-primary/40 h-[30%]"></div>
              <div className="flex-1 bg-primary/20 rounded-t-lg relative group transition-all hover:bg-primary/40 h-[45%]"></div>
              <div className="flex-1 bg-primary/20 rounded-t-lg relative group transition-all hover:bg-primary/40 h-[60%]"></div>
              <div className="flex-1 bg-primary/20 rounded-t-lg relative group transition-all hover:bg-primary/40 h-[85%]"></div>
              <div className="flex-1 bg-primary/40 rounded-t-lg relative group transition-all hover:bg-primary/60 h-[100%] border-t-2 border-primary neon-glow-primary">
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-container-high px-2 py-1 rounded text-[10px] text-primary whitespace-nowrap font-bold">AHORA</div>
              </div>
              <div className="flex-1 bg-surface-container rounded-t-lg h-[80%] opacity-30"></div>
              <div className="flex-1 bg-surface-container rounded-t-lg h-[65%] opacity-30"></div>
              <div className="flex-1 bg-surface-container rounded-t-lg h-[50%] opacity-30"></div>
              <div className="flex-1 bg-surface-container rounded-t-lg h-[40%] opacity-30"></div>
              <div className="flex-1 bg-surface-container rounded-t-lg h-[30%] opacity-30"></div>
              <div className="flex-1 bg-surface-container rounded-t-lg h-[20%] opacity-30"></div>
            </div>
            <div className="flex justify-between mt-4 text-[10px] font-label-md text-on-surface-variant uppercase tracking-widest px-2">
              <span>22:00</span>
              <span>00:00</span>
              <span>02:00</span>
              <span>04:00</span>
              <span>06:00</span>
            </div>
            <div className="mt-8 flex gap-xl items-center">
              <div className="flex items-center gap-xs">
                <span className="w-3 h-3 rounded-full bg-primary"></span>
                <span className="text-label-md text-on-surface-variant">Cover</span>
              </div>
              <div className="flex items-center gap-xs">
                <span className="w-3 h-3 rounded-full bg-secondary"></span>
                <span className="text-label-md text-on-surface-variant">Barra</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Feed / Recent Transactions */}
        <div className="mt-gutter">
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-white/5">
              <h4 className="font-headline-md text-headline-md text-white">Transacciones Recientes</h4>
              <button className="text-primary font-label-md text-sm hover:underline">Ver todas</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-on-surface-variant text-[12px] uppercase tracking-widest border-b border-white/5">
                    <th className="px-6 py-4 font-semibold">ID</th>
                    <th className="px-6 py-4 font-semibold">Hora</th>
                    <th className="px-6 py-4 font-semibold">Concepto</th>
                    <th className="px-6 py-4 font-semibold">Método</th>
                    <th className="px-6 py-4 font-semibold text-right">Monto</th>
                    <th className="px-6 py-4 font-semibold text-center">Estado</th>
                    <th className="px-6 py-4 font-semibold text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    <tr><td colSpan="7" className="text-center py-4 text-on-surface-variant">Cargando...</td></tr>
                  ) : ventasFiltradas.length === 0 ? (
                    <tr><td colSpan="7" className="text-center py-4 text-on-surface-variant">No hay ventas</td></tr>
                  ) : (
                    ventasFiltradas.map((venta, index) => (
                      <tr key={venta.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 text-on-surface-variant font-label-md">#TX-{String(venta.id).slice(-4).padStart(4, '0')}</td>
                        <td className="px-6 py-4 text-on-surface-variant font-label-md">{venta.hora || "23:45"}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-white font-body-md">{venta.concepto}</span>
                            <span className="text-on-surface-variant text-xs">{venta.descripcion || "—"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-xs">
                            <span className={`material-symbols-outlined text-sm ${
                              venta.metodo?.toLowerCase().includes("efectivo") ? "text-green-500" :
                              venta.metodo?.toLowerCase().includes("vip") ? "text-tertiary" :
                              "text-primary"
                            }`}>
                              {venta.metodo?.toLowerCase().includes("efectivo") ? "payments" :
                               venta.metodo?.toLowerCase().includes("vip") ? "diamond" :
                               "credit_card"}
                            </span>
                            <span className="text-on-surface-variant font-label-md">{venta.metodo || "—"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-white">${parseFloat(venta.monto || 0).toFixed(2)}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-tight border ${
                            venta.estado === "Completado"
                              ? "bg-green-500/20 text-green-400 border-green-500/30"
                              : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                          }`}>
                            {venta.estado || "Completado"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center gap-1">
                            <button
                              onClick={() => abrirModalEditar(venta)}
                              className="text-primary hover:underline text-xs"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDelete(venta.id)}
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
        </div>
      </main>

      {/* ===== FAB ===== */}
      <button
        onClick={abrirModalCrear}
        className="fixed bottom-24 right-6 md:bottom-10 md:right-10 w-16 h-16 bg-primary rounded-full neon-glow-primary text-on-primary shadow-2xl flex items-center justify-center active:scale-90 transition-transform z-40 group"
      >
        <span className="material-symbols-outlined text-3xl group-hover:rotate-90 transition-transform">add</span>
        <span className="absolute right-20 bg-surface-container border border-white/10 px-4 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">Nueva Venta</span>
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
              {modoEdicion ? "Editar Venta" : "Nueva Venta"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-label-md text-on-surface-variant mb-1">Concepto</label>
                <input
                  type="text"
                  name="concepto"
                  value={ventaActual.concepto || ""}
                  onChange={handleChange}
                  className="w-full bg-surface-container-high rounded-lg border border-white/10 px-3 py-2 text-on-surface focus:border-primary/50 focus:outline-none"
                  required
                  placeholder="ej. 2x Cover General"
                />
              </div>
              <div>
                <label className="block text-xs font-label-md text-on-surface-variant mb-1">Descripción</label>
                <input
                  type="text"
                  name="descripcion"
                  value={ventaActual.descripcion || ""}
                  onChange={handleChange}
                  className="w-full bg-surface-container-high rounded-lg border border-white/10 px-3 py-2 text-on-surface focus:border-primary/50 focus:outline-none"
                  placeholder="ej. Acceso Principal"
                />
              </div>
              <div>
                <label className="block text-xs font-label-md text-on-surface-variant mb-1">Método de Pago</label>
                <select
                  name="metodo"
                  value={ventaActual.metodo || ""}
                  onChange={handleChange}
                  className="w-full bg-surface-container-high rounded-lg border border-white/10 px-3 py-2 text-on-surface focus:border-primary/50 focus:outline-none"
                  required
                >
                  <option value="">Seleccionar</option>
                  <option value="Efectivo">Efectivo</option>
                  <option value="Tarjeta">Tarjeta</option>
                  <option value="VIP Pass">VIP Pass</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-label-md text-on-surface-variant mb-1">Monto ($)</label>
                <input
                  type="number"
                  name="monto"
                  value={ventaActual.monto || ""}
                  onChange={handleChange}
                  className="w-full bg-surface-container-high rounded-lg border border-white/10 px-3 py-2 text-on-surface focus:border-primary/50 focus:outline-none"
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-xs font-label-md text-on-surface-variant mb-1">Estado</label>
                <select
                  name="estado"
                  value={ventaActual.estado || "Completado"}
                  onChange={handleChange}
                  className="w-full bg-surface-container-high rounded-lg border border-white/10 px-3 py-2 text-on-surface focus:border-primary/50 focus:outline-none"
                >
                  <option value="Completado">Completado</option>
                  <option value="Pendiente">Pendiente</option>
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

export default AdminVentas;