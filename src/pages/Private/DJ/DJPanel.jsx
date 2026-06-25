import React, { useState, useEffect } from "react";
import NavbarDJ from "../../../components/Layout/NavbarDJ";

const STORAGE_KEY = "afterdark_canciones";

const DjCanciones = () => {
  // ===== ESTADOS =====
  const [canciones, setCanciones] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ visible: false, mensaje: "", tipo: "" });

  const [filterType, setFilterType] = useState("pendientes");
  const [aceptadas, setAceptadas] = useState([]);
  const [historial, setHistorial] = useState([]);

  // ===== SERVICIO LOCAL =====
  const cancionService = {
    getAll: async () => {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    },
    remove: async (id) => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return { success: false };
      const todas = JSON.parse(stored);
      const filtradas = todas.filter(c => c.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtradas));
      return { success: true };
    }
  };

  // ===== CARGAR CANCIONES =====
  useEffect(() => {
    cargarCanciones();
  }, []);

  const cargarCanciones = async () => {
    setLoading(true);
    try {
      const data = await cancionService.getAll();
      setCanciones(data);
      setAceptadas([]);
      setHistorial([]);
    } catch (err) {
      setCanciones([]);
      mostrarToast("Error al cargar canciones", "error");
    } finally {
      setLoading(false);
    }
  };

  // ===== TOAST =====
  const mostrarToast = (mensaje, tipo = "success") => {
    setToast({ visible: true, mensaje, tipo });
    setTimeout(() => setToast({ visible: false, mensaje: "", tipo: "" }), 3000);
  };

  // ===== ACCIONES =====
  const handleAceptar = (cancion) => {
    setCanciones(prev => prev.filter(c => c.id !== cancion.id));
    const aceptada = { ...cancion, estado: "aceptada", timestamp: Date.now() };
    setAceptadas(prev => [...prev, aceptada]);
    setHistorial(prev => [...prev, { ...aceptada, estadoHistorial: "Aceptada" }]);
    mostrarToast(`"${cancion.titulo}" aceptada para sonar`, "success");
  };

  const handleEliminar = async (cancion) => {
    try {
      await cancionService.remove(cancion.id);
      setCanciones(prev => prev.filter(c => c.id !== cancion.id));
      const eliminada = { ...cancion, estado: "eliminada", timestamp: Date.now() };
      setHistorial(prev => [...prev, { ...eliminada, estadoHistorial: "Eliminada" }]);
      mostrarToast(`"${cancion.titulo}" eliminada`, "info");
    } catch (err) {
      mostrarToast("Error al eliminar", "error");
    }
  };

  const handleEliminarAceptada = (cancion) => {
    setAceptadas(prev => prev.filter(c => c.id !== cancion.id));
    const eliminada = { ...cancion, estado: "eliminada", timestamp: Date.now() };
    setHistorial(prev => [...prev, { ...eliminada, estadoHistorial: "Eliminada" }]);
    mostrarToast(`"${cancion.titulo}" pasó al historial`, "info");
  };

  // ===== LISTA SEGÚN FILTRO =====
  const getListaActual = () => {
    switch (filterType) {
      case "pendientes": return canciones;
      case "aceptadas": return aceptadas;
      case "historial": return historial;
      default: return canciones;
    }
  };

  const listaFiltrada = getListaActual().filter(c =>
    c.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.artista?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPendientes = canciones.length;
  const totalAceptadas = aceptadas.length;
  const totalHistorial = historial.length;

  // Contador de resultados filtrados
  const resultadosCount = listaFiltrada.length;

  return (
    <>
      <NavbarDJ searchValue={searchTerm} onSearchChange={setSearchTerm} />
      
      <main className="min-h-screen pt-24 px-4 md:px-8 lg:px-12 pb-20 max-w-7xl mx-auto">
        {/* Header con estadísticas */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="font-headline-lg text-headline-lg text-on-surface">Solicitudes en Cabina</h2>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 border border-primary/30 rounded-full">
                <span className="w-2 h-2 rounded-full bg-primary live-indicator"></span>
                <span className="font-label-md text-[10px] text-primary tracking-widest uppercase">Live Feed</span>
              </div>
            </div>
            <p className="text-on-surface-variant font-body-md text-body-md mt-1">
              Gestiona las canciones que los usuarios han solicitado. Acepta o elimina según la energía de la pista.
            </p>
          </div>
          {/* Stats Widgets */}
          <div className="flex gap-3 flex-wrap">
            <div className="glass-card px-4 py-2 rounded-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                <span className="material-symbols-outlined text-primary text-xl">queue_music</span>
              </div>
              <div>
                <p className="text-on-surface-variant font-label-md text-[11px] uppercase tracking-wider">Pendientes</p>
                <p className="font-stats-number text-stats-number text-on-surface text-2xl leading-tight">{totalPendientes}</p>
              </div>
            </div>
            <div className="glass-card px-4 py-2 rounded-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary-container/20 flex items-center justify-center border border-secondary/20">
                <span className="material-symbols-outlined text-secondary text-xl">check_circle</span>
              </div>
              <div>
                <p className="text-on-surface-variant font-label-md text-[11px] uppercase tracking-wider">Aceptadas</p>
                <p className="font-stats-number text-stats-number text-secondary text-2xl leading-tight">{totalAceptadas}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 glass-card p-2 rounded-xl mb-6">
          <div className="flex gap-1.5 flex-wrap">
            <button
              onClick={() => setFilterType("pendientes")}
              className={`px-4 py-1.5 rounded-lg font-label-md text-label-md active:scale-95 transition-all ${
                filterType === "pendientes"
                  ? "bg-primary text-on-primary neon-glow-primary"
                  : "text-on-surface-variant hover:bg-white/5"
              }`}
            >
              Pendientes {totalPendientes > 0 && `(${totalPendientes})`}
            </button>
            <button
              onClick={() => setFilterType("aceptadas")}
              className={`px-4 py-1.5 rounded-lg font-label-md text-label-md active:scale-95 transition-all ${
                filterType === "aceptadas"
                  ? "bg-primary text-on-primary neon-glow-primary"
                  : "text-on-surface-variant hover:bg-white/5"
              }`}
            >
              Aceptadas {totalAceptadas > 0 && `(${totalAceptadas})`}
            </button>
            <button
              onClick={() => setFilterType("historial")}
              className={`px-4 py-1.5 rounded-lg font-label-md text-label-md active:scale-95 transition-all ${
                filterType === "historial"
                  ? "bg-primary text-on-primary neon-glow-primary"
                  : "text-on-surface-variant hover:bg-white/5"
              }`}
            >
              Historial {totalHistorial > 0 && `(${totalHistorial})`}
            </button>
          </div>
          <div className="flex items-center gap-2">
            {resultadosCount > 0 && (
              <span className="text-xs text-on-surface-variant font-label-md mr-2">
                {resultadosCount} {resultadosCount === 1 ? "resultado" : "resultados"}
              </span>
            )}
            <button
              onClick={cargarCanciones}
              className="text-on-surface-variant hover:text-primary transition-colors p-1.5 rounded-full hover:bg-white/5"
              title="Recargar lista"
            >
              <span className="material-symbols-outlined text-xl">refresh</span>
            </button>
          </div>
        </div>

        {/* Lista de canciones */}
        {loading ? (
          <div className="text-center text-on-surface-variant py-16">
            <span className="material-symbols-outlined text-5xl opacity-30 animate-pulse">sync</span>
            <p className="mt-2">Cargando canciones...</p>
          </div>
        ) : listaFiltrada.length === 0 ? (
          <div className="text-center text-on-surface-variant py-16 glass-card rounded-xl p-12">
            <span className="material-symbols-outlined text-6xl opacity-30">music_off</span>
            <p className="mt-2 text-lg font-body-md">
              {filterType === "pendientes" && "No hay canciones pendientes"}
              {filterType === "aceptadas" && "No has aceptado ninguna canción aún"}
              {filterType === "historial" && "El historial está vacío"}
            </p>
            <p className="text-sm opacity-60 mt-1">
              {filterType === "pendientes" && "Espera a que los usuarios envíen sus peticiones."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {listaFiltrada.map((cancion, index) => (
              <div
                key={cancion.id}
                className="glass-card p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:border-primary/40 transition-all hover:bg-surface-container/50 hover:shadow-lg hover:shadow-primary/5 animate-fadeIn"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div
                    className="w-16 h-16 rounded-lg bg-cover bg-center overflow-hidden flex-shrink-0 border border-white/5"
                    style={{
                      backgroundImage: cancion.url && cancion.url.includes("youtube")
                        ? `url(https://img.youtube.com/vi/${cancion.url.split("v=")[1]?.split("&")[0]}/mqdefault.jpg)`
                        : `url(https://lh3.googleusercontent.com/aida-public/AB6AXuBk0sQjQVfaPkEFoKxPhgkfjtnUQ4HHp4gA3H4FTaQPCPbBE94BhTFoLThglMV-vOFj8BHlNMkN7NWonvEdOgHHgG9VgpSf4bnK4_NKxiILMUHN_irF6dJwCBzyiIJqn5k5XT-OlIV3hGwaZeAEjtuyMYv4k0ODE7VbP6lwnmVWmso5TqXjIRqfm0woxyFEn_KosYdA309mvagzDhor33fmLvhw-GKE1SDD4jvnNsrIF40JFvaE-uSfv2vkaRIGh4zut6Iev4YXFxio)`
                    }}
                  />
                  <div className="space-y-1 min-w-0">
                    <h3 className="text-on-surface font-headline-md text-[18px] leading-tight truncate">{cancion.titulo}</h3>
                    <p className="text-primary font-body-md text-body-md font-semibold">{cancion.artista}</p>
                    <div className="flex items-center gap-3 text-on-surface-variant font-label-md text-[12px] flex-wrap">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">album</span>
                        {cancion.album || "—"}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">schedule</span>
                        {cancion.duracion || "00:00"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {filterType === "pendientes" && (
                    <>
                      <button
                        onClick={() => handleAceptar(cancion)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-white text-background rounded-full font-label-md text-label-md hover:bg-primary transition-all active:scale-95 shadow-lg shadow-white/10"
                      >
                        <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                        Aceptar
                      </button>
                      <button
                        onClick={() => handleEliminar(cancion)}
                        className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-on-error hover:bg-error-container/20 hover:border-error transition-all active:scale-90"
                        title="Eliminar canción"
                      >
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </>
                  )}
                  {filterType === "aceptadas" && (
                    <>
                      <span className="text-secondary font-label-md text-sm flex items-center gap-1">
                        <span className="material-symbols-outlined text-secondary">check_circle</span>
                        Aceptada
                      </span>
                      <button
                        onClick={() => handleEliminarAceptada(cancion)}
                        className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-on-error hover:bg-error-container/20 hover:border-error transition-all active:scale-90"
                        title="Mover al historial"
                      >
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </>
                  )}
                  {filterType === "historial" && (
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        cancion.estadoHistorial === "Aceptada"
                          ? "bg-secondary/20 text-secondary border border-secondary/30"
                          : "bg-error/20 text-error border border-error/30"
                      }`}>
                        {cancion.estadoHistorial || "Eliminada"}
                      </span>
                      <span className="text-on-surface-variant font-label-md text-sm flex items-center gap-1">
                        <span className="material-symbols-outlined text-base">history</span>
                        {new Date(cancion.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Fondo atmosférico */}
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/10 blur-[120px] -z-10 rounded-full"></div>
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-secondary-container/5 blur-[100px] -z-10 rounded-full"></div>
      </main>

      {/* ===== TOAST ===== */}
      {toast.visible && (
        <div className={`fixed bottom-24 right-6 glass-card rounded-xl px-4 py-2.5 flex items-center gap-3 transition-all duration-300 z-[100] border ${
          toast.tipo === "error" ? "border-error/30" : "border-primary/30"
        } shadow-lg`}>
          <span className="material-symbols-outlined text-primary">check_circle</span>
          <div>
            <p className="text-on-surface font-bold text-sm">{toast.mensaje}</p>
          </div>
        </div>
      )}

      {/* ===== ESTILOS ADICIONALES ===== */}
      <style jsx>{`
        body, html {
          background-color: #0e0e0e !important;
          margin: 0;
          padding: 0;
        }

        .min-h-screen { min-height: 100vh; }
        .pt-24 { padding-top: 6rem; }
        .max-w-7xl { max-width: 80rem; }
        .mx-auto { margin-left: auto; margin-right: auto; }
        .px-4 { padding-left: 1rem; padding-right: 1rem; }
        .md\\:px-8 { padding-left: 2rem; padding-right: 2rem; }
        .lg\\:px-12 { padding-left: 3rem; padding-right: 3rem; }
        .pb-20 { padding-bottom: 5rem; }

        .font-headline-lg {
          font-family: 'Montserrat', sans-serif;
          font-size: 32px;
          line-height: 40px;
          letter-spacing: -0.01em;
          font-weight: 700;
        }
        .text-headline-lg {
          font-size: 32px;
          line-height: 40px;
          letter-spacing: -0.01em;
          font-weight: 700;
        }
        .font-body-md {
          font-family: 'Inter', sans-serif;
          font-size: 16px;
          line-height: 24px;
          font-weight: 400;
        }
        .text-body-md {
          font-size: 16px;
          line-height: 24px;
          font-weight: 400;
        }
        .font-label-md {
          font-family: 'Inter', sans-serif;
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
        .font-stats-number {
          font-family: 'Montserrat', sans-serif;
          font-size: 36px;
          line-height: 44px;
          font-weight: 700;
        }
        .text-stats-number {
          font-size: 36px;
          line-height: 44px;
          font-weight: 700;
        }
        .text-2xl {
          font-size: 1.5rem;
          line-height: 2rem;
        }
        .text-xl {
          font-size: 1.25rem;
          line-height: 1.75rem;
        }
        .text-lg {
          font-size: 1.125rem;
          line-height: 1.75rem;
        }
        .text-sm {
          font-size: 0.875rem;
          line-height: 1.25rem;
        }
        .text-xs {
          font-size: 0.75rem;
          line-height: 1rem;
        }
        .text-\\[11px\\] {
          font-size: 11px;
        }
        .text-\\[10px\\] {
          font-size: 10px;
        }
        .text-\\[18px\\] {
          font-size: 18px;
        }
        .text-\\[14px\\] {
          font-size: 14px;
        }
        .text-\\[12px\\] {
          font-size: 12px;
        }
        .leading-tight {
          line-height: 1.25;
        }

        .text-primary { color: #e9b3ff; }
        .text-on-surface { color: #e5e2e1; }
        .text-on-surface-variant { color: #d2c1d4; }
        .text-secondary { color: #ffb2b7; }
        .text-on-error { color: #690005; }
        .text-error { color: #ffb4ab; }
        .text-on-primary { color: #510074; }

        .bg-primary { background-color: #e9b3ff; }
        .bg-primary\\/10 { background-color: rgba(233,179,255,0.1); }
        .bg-primary\\/20 { background-color: rgba(233,179,255,0.2); }
        .bg-secondary-container\\/20 { background-color: rgba(208,2,66,0.2); }
        .bg-surface-container { background-color: #201f1f; }
        .bg-surface-container-high { background-color: #2a2a2a; }
        .bg-white { background-color: #ffffff; }
        .bg-white\\/5 { background-color: rgba(255,255,255,0.05); }
        .bg-error-container\\/20 { background-color: rgba(147,0,10,0.2); }
        .bg-error\\/20 { background-color: rgba(255,180,171,0.2); }
        .bg-secondary\\/20 { background-color: rgba(255,178,183,0.2); }
        .bg-surface-container\\/50 { background-color: rgba(32,31,31,0.5); }
        .bg-background { background-color: #131313; }

        .border-white\\/10 { border-color: rgba(255,255,255,0.1); }
        .border-white\\/5 { border-color: rgba(255,255,255,0.05); }
        .border-primary\\/20 { border-color: rgba(233,179,255,0.2); }
        .border-primary\\/30 { border-color: rgba(233,179,255,0.3); }
        .border-primary\\/40 { border-color: rgba(233,179,255,0.4); }
        .border-secondary\\/20 { border-color: rgba(255,178,183,0.2); }
        .border-secondary\\/30 { border-color: rgba(255,178,183,0.3); }
        .border-error { border-color: #ffb4ab; }
        .border-error\\/30 { border-color: rgba(255,180,171,0.3); }
        .border-error\\/20 { border-color: rgba(255,180,171,0.2); }

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
          box-shadow: 0 0 15px rgba(233,179,255,0.3);
        }

        .rounded-full { border-radius: 9999px; }
        .rounded-xl { border-radius: 0.75rem; }
        .rounded-lg { border-radius: 0.5rem; }

        .transition-all { transition: all 0.3s ease; }
        .duration-200 { transition-duration: 200ms; }
        .duration-300 { transition-duration: 300ms; }
        .active\\:scale-95:active { transform: scale(0.95); }
        .active\\:scale-90:active { transform: scale(0.9); }
        .hover\\:bg-surface-container\\/50:hover { background-color: rgba(32,31,31,0.5); }
        .hover\\:border-primary\\/40:hover { border-color: rgba(233,179,255,0.4); }
        .hover\\:border-error:hover { border-color: #ffb4ab; }
        .hover\\:bg-white\\/5:hover { background-color: rgba(255,255,255,0.05); }
        .hover\\:bg-error-container\\/20:hover { background-color: rgba(147,0,10,0.2); }
        .hover\\:bg-primary:hover { background-color: #e9b3ff; }
        .hover\\:shadow-lg:hover { box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05); }
        .hover\\:shadow-primary\\/5:hover { box-shadow: 0 0 15px rgba(233,179,255,0.05); }

        .live-indicator {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: .5; transform: scale(0.9); }
        }

        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .animate-fadeIn {
          animation: fadeIn 0.4s ease forwards;
        }
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
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

        .gap-base { gap: 8px; }
        .gap-sm { gap: 12px; }
        .gap-md { gap: 24px; }
        .gap-1 { gap: 4px; }
        .gap-1\\.5 { gap: 6px; }
        .gap-2 { gap: 8px; }
        .gap-3 { gap: 12px; }
        .gap-4 { gap: 16px; }
        .space-y-1 > * + * { margin-top: 4px; }
        .space-y-md > * + * { margin-top: 24px; }
        .space-y-xs > * + * { margin-top: 4px; }
        .mt-1 { margin-top: 4px; }
        .mt-2 { margin-top: 8px; }
        .mb-6 { margin-bottom: 24px; }
        .mr-2 { margin-right: 8px; }
        .px-4 { padding-left: 1rem; padding-right: 1rem; }
        .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
        .py-1 { padding-top: 4px; padding-bottom: 4px; }
        .py-1\\.5 { padding-top: 6px; padding-bottom: 6px; }
        .py-2 { padding-top: 8px; padding-bottom: 8px; }
        .py-2\\.5 { padding-top: 10px; padding-bottom: 10px; }
        .p-2 { padding: 8px; }
        .p-4 { padding: 16px; }
        .p-12 { padding: 48px; }
        .pt-24 { padding-top: 6rem; }
        .pb-20 { padding-bottom: 5rem; }
        .flex { display: flex; }
        .flex-col { flex-direction: column; }
        .flex-wrap { flex-wrap: wrap; }
        .items-center { align-items: center; }
        .justify-between { justify-content: space-between; }
        .justify-center { justify-content: center; }
        .relative { position: relative; }
        .absolute { position: absolute; }
        .fixed { position: fixed; }
        .inset-0 { top:0; right:0; bottom:0; left:0; }
        .bottom-0 { bottom: 0; }
        .bottom-24 { bottom: 6rem; }
        .right-0 { right: 0; }
        .right-6 { right: 1.5rem; }
        .right-8 { right: 2rem; }
        .left-0 { left: 0; }
        .top-1\\/2 { top: 50%; }
        .-z-10 { z-index: -10; }
        .z-10 { z-index: 10; }
        .z-\\[100\\] { z-index: 100; }
        .overflow-hidden { overflow: hidden; }
        .bg-cover { background-size: cover; }
        .bg-center { background-position: center; }
        .shrink-0 { flex-shrink: 0; }
        .flex-1 { flex: 1; }
        .min-w-0 { min-width: 0; }
        .blur-\\[120px\\] { filter: blur(120px); }
        .blur-\\[100px\\] { filter: blur(100px); }
        .pointer-events-none { pointer-events: none; }
        .tracking-widest { letter-spacing: 0.1em; }
        .tracking-tighter { letter-spacing: -0.05em; }
        .tracking-wider { letter-spacing: 0.05em; }
        .uppercase { text-transform: uppercase; }
        .font-bold { font-weight: 700; }
        .font-semibold { font-weight: 600; }
        .border-none { border: none; }
        .focus\\:ring-0:focus { outline: none; box-shadow: none; }
        .focus\\:ring-1:focus { outline: none; box-shadow: 0 0 0 1px #e9b3ff; }
        .focus\\:ring-primary:focus { --tw-ring-color: #e9b3ff; }
        .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05); }
        .shadow-primary\\/5 { box-shadow: 0 0 15px rgba(233,179,255,0.05); }
        .shadow-white\\/10 { box-shadow: 0 0 15px rgba(255,255,255,0.1); }

        @media (min-width: 768px) {
          .md\\:flex-row { flex-direction: row; }
          .md\\:items-center { align-items: center; }
          .md\\:p-margin-desktop { padding: 48px; }
          .md\\:px-8 { padding-left: 2rem; padding-right: 2rem; }
        }
        @media (min-width: 1024px) {
          .lg\\:flex-row { flex-direction: row; }
          .lg\\:items-center { align-items: center; }
          .lg\\:px-12 { padding-left: 3rem; padding-right: 3rem; }
        }
      `}</style>
    </>
  );
};

export default DjCanciones;