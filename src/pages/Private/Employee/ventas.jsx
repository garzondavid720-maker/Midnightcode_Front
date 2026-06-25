import React, { useState, useEffect } from "react";
import NavbarEmpleado from "../../../components/Layout/NavbarEmpleado";

const STORAGE_KEY = "afterdark_ventas";

// Servicio local (solo lectura + creación para empleado)
const ventaService = {
  getAll: async () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  },
  create: async (data) => {
    const ventas = await ventaService.getAll();
    const newVenta = { ...data, id: Date.now(), hora: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) };
    const updated = [...ventas, newVenta];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newVenta;
  }
};

const EmpleadoVentas = () => {
  const [ventas, setVentas] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [nuevaVenta, setNuevaVenta] = useState({
    concepto: "",
    descripcion: "",
    metodo: "",
    monto: "",
    estado: "Completado",
  });
  const [toast, setToast] = useState({ visible: false, mensaje: "", tipo: "" });

  useEffect(() => {
    cargarVentas();
  }, []);

  const cargarVentas = async () => {
    setLoading(true);
    try {
      const data = await ventaService.getAll();
      setVentas(data);
    } catch (err) {
      setVentas([]);
      mostrarToast("Error al cargar ventas", "error");
    } finally {
      setLoading(false);
    }
  };

  const mostrarToast = (mensaje, tipo = "success") => {
    setToast({ visible: true, mensaje, tipo });
    setTimeout(() => setToast({ visible: false, mensaje: "", tipo: "" }), 3000);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!nuevaVenta.concepto || !nuevaVenta.metodo || !nuevaVenta.monto) {
      mostrarToast("Completa todos los campos obligatorios", "error");
      return;
    }
    try {
      const created = await ventaService.create(nuevaVenta);
      setVentas(prev => [...prev, created]);
      mostrarToast("Venta registrada correctamente", "success");
      setModalAbierto(false);
      setNuevaVenta({ concepto: "", descripcion: "", metodo: "", monto: "", estado: "Completado" });
    } catch (err) {
      mostrarToast("Error al guardar", "error");
    }
  };

  const handleChange = (e) => {
    setNuevaVenta({ ...nuevaVenta, [e.target.name]: e.target.value });
  };

  const ventasFiltradas = ventas.filter((v) =>
    v.concepto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.metodo?.toLowerCase().includes(searchTerm.toLowerCase())
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

  return (
    <>
      <NavbarEmpleado active="ventas" />
      <main className="md:ml-0 pt-32 px-margin-mobile md:px-margin-desktop pb-20 relative">
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
              onClick={() => setModalAbierto(true)}
              className="bg-primary text-on-primary font-label-md px-6 py-2 rounded-lg neon-glow-primary active:scale-95 transition-transform"
            >
              Nueva Venta
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter mb-gutter">
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
          <div className="glass-card p-6 rounded-xl border-l-4 border-l-primary relative overflow-hidden">
            <p className="text-on-surface-variant font-label-md text-label-md uppercase tracking-widest mb-2">Ingresos Cover</p>
            <h3 className="font-stats-number text-stats-number text-primary mb-1">${ventasCover.toFixed(2)}</h3>
            <div className="flex items-center gap-xs text-on-surface-variant font-label-md">
              <span className="material-symbols-outlined text-sm">confirmation_number</span>
              <span>{totalCoverTickets} Entradas vendidas</span>
            </div>
          </div>
          <div className="glass-card p-6 rounded-xl border-l-4 border-l-secondary relative overflow-hidden">
            <p className="text-on-surface-variant font-label-md text-label-md uppercase tracking-widest mb-2">Ventas Barra</p>
            <h3 className="font-stats-number text-stats-number text-secondary mb-1">${ventasBarra.toFixed(2)}</h3>
            <div className="flex items-center gap-xs text-on-surface-variant font-label-md">
              <span className="material-symbols-outlined text-sm">liquor</span>
              <span>Ticket prom: ${ventasBarra > 0 ? (ventasBarra / ventas.filter(v => v.concepto?.toLowerCase().includes("barra")).length).toFixed(2) : "0.00"}</span>
            </div>
          </div>
          <div className="glass-card p-6 rounded-xl relative overflow-hidden">
            <p className="text-on-surface-variant font-label-md text-label-md uppercase tracking-widest mb-2">Facturación VIP</p>
            <h3 className="font-stats-number text-stats-number text-tertiary mb-1">${ventasVIP.toFixed(2)}</h3>
            <div className="flex items-center gap-xs text-tertiary font-label-md">
              <span className="material-symbols-outlined text-sm">star</span>
              <span>{ventas.filter(v => v.concepto?.toLowerCase().includes("vip") || v.concepto?.toLowerCase().includes("mesa")).length} Mesas activas</span>
            </div>
          </div>
        </div>

        {/* Tabla con margen superior para separarla del header */}
        <div className="glass-card top-h-10 rounded-xl overflow-hidden mt-4">
          <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-white/5">
            <h4 className="font-headline-md text-headline-md text-white">Transacciones Recientes</h4>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
              <input
                className="bg-surface-container border-none rounded-full py-2 pl-10 pr-4 text-label-md w-48 focus:ring-2 focus:ring-primary transition-all"
                placeholder="Buscar transacción..."
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
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
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr><td colSpan="6" className="text-center py-4 text-on-surface-variant">Cargando...</td></tr>
                ) : ventasFiltradas.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-4 text-on-surface-variant">No hay ventas</td></tr>
                ) : (
                  ventasFiltradas.map((venta) => (
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
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* ===== FAB ===== */}
      <button
        onClick={() => setModalAbierto(true)}
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
              onClick={() => setModalAbierto(false)}
              className="absolute top-3 right-3 text-on-surface-variant hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <h3 className="font-headline-md text-headline-md text-on-surface mb-4">Registrar Nueva Venta</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-label-md text-on-surface-variant mb-1">Concepto *</label>
                <input
                  type="text"
                  name="concepto"
                  value={nuevaVenta.concepto}
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
                  value={nuevaVenta.descripcion}
                  onChange={handleChange}
                  className="w-full bg-surface-container-high rounded-lg border border-white/10 px-3 py-2 text-on-surface focus:border-primary/50 focus:outline-none"
                  placeholder="ej. Acceso Principal"
                />
              </div>
              <div>
                <label className="block text-xs font-label-md text-on-surface-variant mb-1">Método de Pago *</label>
                <select
                  name="metodo"
                  value={nuevaVenta.metodo}
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
                <label className="block text-xs font-label-md text-on-surface-variant mb-1">Monto ($) *</label>
                <input
                  type="number"
                  name="monto"
                  value={nuevaVenta.monto}
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
                  value={nuevaVenta.estado}
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
                  Registrar
                </button>
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="flex-1 bg-surface-container-high border border-white/10 text-on-surface-variant py-2 rounded-xl font-label-md hover:bg-white/5 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== ESTILOS ===== */}
      <style jsx>{`
        body, html {
          background-color: #050505 !important;
          margin: 0;
          padding: 0;
        }

        .pt-32 { padding-top: 8rem; }
        .md\\:ml-0 { margin-left: 0; }
        .pb-20 { padding-bottom: 5rem; }
        .px-margin-mobile { padding-left: 16px; padding-right: 16px; }
        .md\\:px-margin-desktop { padding-left: 48px; padding-right: 48px; }
        .min-h-screen { min-height: 100vh; }
        .mt-4 { margin-top: 1rem; }

        .font-headline-lg { font-family: 'Montserrat', sans-serif; font-size: 32px; line-height: 40px; letter-spacing: -0.01em; font-weight: 700; }
        .text-headline-lg { font-size: 32px; line-height: 40px; letter-spacing: -0.01em; font-weight: 700; }
        .font-body-md { font-family: 'Inter', sans-serif; font-size: 16px; line-height: 24px; font-weight: 400; }
        .text-body-md { font-size: 16px; line-height: 24px; font-weight: 400; }
        .font-label-md { font-family: 'Inter', sans-serif; font-size: 14px; line-height: 20px; letter-spacing: 0.05em; font-weight: 600; }
        .text-label-md { font-size: 14px; line-height: 20px; letter-spacing: 0.05em; font-weight: 600; }
        .font-headline-md { font-family: 'Montserrat', sans-serif; font-size: 24px; line-height: 32px; font-weight: 600; }
        .text-headline-md { font-size: 24px; line-height: 32px; font-weight: 600; }
        .font-stats-number { font-family: 'Montserrat', sans-serif; font-size: 36px; line-height: 44px; font-weight: 700; }
        .text-stats-number { font-size: 36px; line-height: 44px; font-weight: 700; }
        .text-8xl { font-size: 6rem; line-height: 1; }
        .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
        .text-xs { font-size: 0.75rem; line-height: 1rem; }
        .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
        .text-\\[10px\\] { font-size: 10px; }
        .text-\\[12px\\] { font-size: 12px; }

        .text-primary { color: #e9b3ff; }
        .text-on-surface { color: #e5e2e1; }
        .text-on-surface-variant { color: #d2c1d4; }
        .text-secondary { color: #ffb2b7; }
        .text-tertiary { color: #e7c448; }
        .text-error { color: #ffb4ab; }
        .text-green-400 { color: #4ade80; }
        .text-yellow-400 { color: #facc15; }
        .text-white { color: #ffffff; }
        .text-on-primary { color: #510074; }

        .bg-primary { background-color: #e9b3ff; }
        .bg-primary\\/20 { background-color: rgba(233,179,255,0.2); }
        .bg-primary\\/10 { background-color: rgba(233,179,255,0.1); }
        .bg-primary\\/5 { background-color: rgba(233,179,255,0.05); }
        .bg-secondary { background-color: #ffb2b7; }
        .bg-secondary\\/20 { background-color: rgba(255,178,183,0.2); }
        .bg-tertiary { background-color: #e7c448; }
        .bg-tertiary\\/20 { background-color: rgba(231,196,72,0.2); }
        .bg-surface-container { background-color: #201f1f; }
        .bg-surface-container-high { background-color: #2a2a2a; }
        .bg-surface-container-lowest { background-color: #0e0e0e; }
        .bg-surface-container-highest { background-color: #353534; }
        .bg-white\\/5 { background-color: rgba(255,255,255,0.05); }
        .bg-white\\/10 { background-color: rgba(255,255,255,0.1); }
        .bg-green-500\\/20 { background-color: rgba(34,197,94,0.2); }
        .bg-yellow-500\\/20 { background-color: rgba(234,179,8,0.2); }
        .bg-black\\/70 { background-color: rgba(0,0,0,0.7); }

        .border-white\\/10 { border-color: rgba(255,255,255,0.1); }
        .border-white\\/5 { border-color: rgba(255,255,255,0.05); }
        .border-primary { border-color: #e9b3ff; }
        .border-primary\\/20 { border-color: rgba(233,179,255,0.2); }
        .border-primary\\/30 { border-color: rgba(233,179,255,0.3); }
        .border-primary\\/50 { border-color: rgba(233,179,255,0.5); }
        .border-secondary { border-color: #ffb2b7; }
        .border-tertiary { border-color: #e7c448; }
        .border-green-500\\/30 { border-color: rgba(34,197,94,0.3); }
        .border-yellow-500\\/30 { border-color: rgba(234,179,8,0.3); }
        .border-error\\/30 { border-color: rgba(255,180,171,0.3); }
        .border-l-4 { border-left-width: 4px; }
        .border-l-primary { border-left-color: #e9b3ff; }
        .border-l-secondary { border-left-color: #ffb2b7; }
        .border-l-tertiary { border-left-color: #e7c448; }

        .glass-card {
          background: rgba(28, 28, 30, 0.7);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-top: 1px solid rgba(255, 255, 255, 0.15);
          transition: all 0.3s ease;
        }
        .glass-card:hover {
          border-color: rgba(233, 179, 255, 0.3);
        }

        .neon-glow-primary {
          box-shadow: 0 0 12px 2px rgba(233, 179, 255, 0.3);
        }

        .shadow-2xl { box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); }
        .shadow-\\[0_0_8px_rgba\\(34\\,197\\,94\\,0\\.5\\)\\] { box-shadow: 0 0 8px rgba(34,197,94,0.5); }
        .shadow-\\[0_0_8px_rgba\\(233\\,179\\,255\\,0\\.5\\)\\] { box-shadow: 0 0 8px rgba(233,179,255,0.5); }
        .shadow-\\[0_0_20px_rgba\\(233\\,179\\,255\\,0\\.6\\)\\] { box-shadow: 0 0 20px rgba(233,179,255,0.6); }
        .shadow-\\[0_0_15px_rgba\\(233\\,179\\,255\\,0\\.1\\)\\] { box-shadow: 0 0 15px rgba(233,179,255,0.1); }
        .shadow-\\[0_0_10px_rgba\\(233\\,179\\,255\\,0\\.4\\)\\] { box-shadow: 0 0 10px rgba(233,179,255,0.4); }

        .rounded-full { border-radius: 9999px; }
        .rounded-xl { border-radius: 0.75rem; }
        .rounded-lg { border-radius: 0.5rem; }
        .rounded-2xl { border-radius: 1rem; }

        .transition-all { transition: all 0.3s ease; }
        .duration-300 { transition-duration: 300ms; }
        .active\\:scale-95:active { transform: scale(0.95); }
        .active\\:scale-90:active { transform: scale(0.9); }
        .hover\\:brightness-110:hover { filter: brightness(1.1); }
        .hover\\:bg-white\\/5:hover { background-color: rgba(255,255,255,0.05); }

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

        .gap-gutter { gap: 24px; }
        .gap-xs { gap: 4px; }
        .gap-sm { gap: 12px; }
        .gap-md { gap: 24px; }
        .gap-xl { gap: 40px; }
        .space-y-4 > * + * { margin-top: 1rem; }
        .space-y-6 > * + * { margin-top: 1.5rem; }
        .mb-2 { margin-bottom: 0.5rem; }
        .mb-1 { margin-bottom: 0.25rem; }
        .mb-4 { margin-bottom: 1rem; }
        .mb-6 { margin-bottom: 1.5rem; }
        .mb-10 { margin-bottom: 2.5rem; }
        .mt-8 { margin-top: 2rem; }
        .mt-4 { margin-top: 1rem; }
        .mr-xs { margin-right: 4px; }
        .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
        .px-4 { padding-left: 1rem; padding-right: 1rem; }
        .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
        .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
        .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
        .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
        .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
        .p-6 { padding: 1.5rem; }
        .p-4 { padding: 1rem; }
        .p-2 { padding: 0.5rem; }
        .w-full { width: 100%; }
        .w-2 { width: 0.5rem; }
        .w-3 { width: 0.75rem; }
        .w-8 { width: 2rem; }
        .w-16 { width: 4rem; }
        .w-48 { width: 12rem; }
        .h-2 { height: 0.5rem; }
        .h-8 { height: 2rem; }
        .h-16 { height: 4rem; }
        .flex { display: flex; }
        .flex-col { flex-direction: column; }
        .items-center { align-items: center; }
        .justify-between { justify-content: space-between; }
        .justify-center { justify-content: center; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .text-left { text-align: left; }
        .overflow-hidden { overflow: hidden; }
        .overflow-x-auto { overflow-x: auto; }
        .border-collapse { border-collapse: collapse; }
        .divide-y > * + * { border-top-width: 1px; }
        .divide-white\\/5 > * + * { border-color: rgba(255,255,255,0.05); }
        .relative { position: relative; }
        .absolute { position: absolute; }
        .fixed { position: fixed; }
        .inset-0 { top:0; right:0; bottom:0; left:0; }
        .top-1\\/2 { top: 50%; }
        .left-3 { left: 0.75rem; }
        .right-6 { right: 1.5rem; }
        .bottom-24 { bottom: 6rem; }
        .right-8 { right: 2rem; }
        .-right-4 { right: -1rem; }
        .-top-4 { top: -1rem; }
        .-translate-y-1\\/2 { transform: translateY(-50%); }
        .-translate-x-1\\/2 { transform: translateX(-50%); }
        .scale-150 { transform: scale(1.5); }
        .opacity-10 { opacity: 0.1; }
        .opacity-0 { opacity: 0; }
        .opacity-100 { opacity: 1; }
        .pointer-events-none { pointer-events: none; }
        .z-10 { z-index: 10; }
        .z-40 { z-index: 40; }
        .z-\\[100\\] { z-index: 100; }
        .z-\\[200\\] { z-index: 200; }
        .backdrop-blur-sm { backdrop-filter: blur(4px); }
        .backdrop-blur-xl { backdrop-filter: blur(16px); }
        .border-none { border: none; }
        .focus\\:ring-2:focus { outline: none; box-shadow: 0 0 0 2px #e9b3ff; }
        .focus\\:ring-primary:focus { --tw-ring-color: #e9b3ff; }
        .focus\\:border-primary\\/50:focus { border-color: rgba(233,179,255,0.5); }
        .focus\\:outline-none:focus { outline: none; }
        .resize-none { resize: none; }
        .whitespace-nowrap { white-space: nowrap; }
        .truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .uppercase { text-transform: uppercase; }
        .tracking-widest { letter-spacing: 0.1em; }
        .tracking-tight { letter-spacing: -0.02em; }
        .tracking-tighter { letter-spacing: -0.05em; }
        .font-bold { font-weight: 700; }
        .font-semibold { font-weight: 600; }
        .italic { font-style: italic; }

        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        @media (min-width: 768px) {
          .md\\:flex-row { flex-direction: row; }
          .md\\:items-end { align-items: flex-end; }
          .md\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
          .md\\:px-margin-desktop { padding-left: 48px; padding-right: 48px; }
          .md\\:bottom-10 { bottom: 40px; }
          .md\\:right-10 { right: 40px; }
        }
      `}</style>
    </>
  );
};

export default EmpleadoVentas;