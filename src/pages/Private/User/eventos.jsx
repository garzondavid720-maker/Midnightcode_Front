import React, { useState, useEffect } from "react";
import NavbarUsuario from "../../../components/Layout/NavbarUsuario";

const STORAGE_KEY = "afterdark_eventos";

// Servicio local para leer eventos (solo lectura)
const eventoService = {
  getAll: async () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  },
};

const UserEventos = () => {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });

  useEffect(() => {
    cargarEventos();
  }, []);

  const cargarEventos = async () => {
    setLoading(true);
    try {
      const data = await eventoService.getAll();
      const sorted = data.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
      setEventos(sorted);
    } catch (err) {
      setEventos([]);
    } finally {
      setLoading(false);
    }
  };

  const mostrarMensaje = (texto, tipo = "success") => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: "", tipo: "" }), 3000);
  };

  const compartirEvento = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      mostrarMensaje("¡URL copiada al portapapeles!", "success");
    } catch (err) {
      const textarea = document.createElement("textarea");
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      mostrarMensaje("¡URL copiada al portapapeles!", "success");
    }
  };

  const irAReservas = () => {
    window.location.href = "/usuario/reserva";
  };

  const eventosFiltrados = filter === "all"
    ? eventos
    : eventos.filter(e => e.tipo === "VIP Only" || e.tipo === "Fiesta Temática");

  const getEstadoColor = (estado) => {
    switch (estado) {
      case "Sold Out": return "bg-secondary text-on-secondary";
      case "Confirmed": return "bg-primary/20 text-primary border border-primary/30";
      case "Available": return "bg-tertiary/20 text-tertiary border border-tertiary/30";
      default: return "bg-white/10 text-on-surface-variant";
    }
  };

  const getHeadlinerIcon = (tipo) => {
    if (tipo === "DJ Set") return "graphic_eq";
    if (tipo === "Concierto") return "mic_external_on";
    if (tipo === "Fiesta Temática") return "masks";
    return "event";
  };

  const getEstadoTexto = (estado) => {
    switch (estado) {
      case "Sold Out": return "Agotado";
      case "Confirmed": return "Confirmado";
      case "Available": return "Disponible";
      case "Negotiating": return "Negociando";
      default: return estado || "Disponible";
    }
  };

  const totalEventos = eventos.length;
  const totalFiltrados = eventosFiltrados.length;

  return (
    <>
      <NavbarUsuario />
      <main className="min-h-screen pt-20 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
        {/* ===== HERO SECTION (centrado) ===== */}
        <header className="relative pt-8 pb-12 overflow-hidden">
          <div className="absolute inset-0 -z-10 opacity-40"></div>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary mb-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span className="font-label-md text-label-md uppercase tracking-widest">Experiencia en Vivo</span>
            </div>
            <h1 className="font-display-lg text-display-lg text-white mb-4 max-w-3xl leading-tight">
              Eleva tus <span className="text-gradient-primary">Noches</span>.
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
              Vive el pulso de los ritmos más exclusivos de la ciudad. Desde techno underground hasta espectáculos visuales de alta energía.
            </p>
            <div className="flex gap-6 mt-4 text-sm text-on-surface-variant">
              <span>🎵 {totalEventos} eventos disponibles</span>
              <span>🎤 {new Set(eventos.map(e => e.artista || e.nombre)).size} artistas</span>
            </div>
          </div>
        </header>

        {/* ===== FILTROS Y GRID ===== */}
        <div>
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <h2 className="font-headline-lg text-headline-lg text-white">Próximas Noches</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-6 py-2 rounded-full border font-label-md text-label-md transition-all ${
                  filter === "all"
                    ? "bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(233,179,255,0.2)]"
                    : "bg-surface-container-high border-outline-variant text-on-surface-variant hover:border-primary"
                }`}
              >
                Todos los Géneros
              </button>
              <button
                onClick={() => setFilter("vip")}
                className={`px-6 py-2 rounded-full border font-label-md text-label-md transition-all ${
                  filter === "vip"
                    ? "bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(233,179,255,0.2)]"
                    : "bg-surface-container-high border-outline-variant text-on-surface-variant hover:border-primary"
                }`}
              >
                Solo VIP
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center text-on-surface-variant py-16">
              <span className="material-symbols-outlined text-5xl opacity-30 animate-pulse">sync</span>
              <p className="mt-2">Cargando eventos...</p>
            </div>
          ) : eventosFiltrados.length === 0 ? (
            <div className="text-center text-on-surface-variant py-16 glass-card rounded-xl p-12">
              <span className="material-symbols-outlined text-6xl opacity-30">event_busy</span>
              <p className="mt-2 text-lg font-body-md">No hay eventos disponibles</p>
              <p className="text-sm opacity-60 mt-1">Vuelve más tarde para descubrir nuevas noches.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {eventosFiltrados.map((evento, index) => {
                const fechaFormateada = evento.fecha
                  ? new Date(evento.fecha).toLocaleDateString("es-ES", { day: "numeric", month: "short" }).toUpperCase()
                  : "FECHA POR CONFIRMAR";
                const estadoColor = getEstadoColor(evento.estado);
                const icono = getHeadlinerIcon(evento.tipo);
                const estadoTexto = getEstadoTexto(evento.estado);

                return (
                  <article
                    key={evento.id}
                    className="glass-card rounded-xl overflow-hidden flex flex-col h-full group hover:border-primary/50 transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 animate-fadeIn"
                    style={{ animationDelay: `${index * 60}ms` }}
                  >
                    <div className="relative h-64 overflow-hidden">
                      <img
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        src={
                          evento.imagen ||
                          "https://lh3.googleusercontent.com/aida-public/AB6AXuC3BGbOdPQWBh0Gx52GQykomK0jze-tIljh8xbP3G1J8NGCXhtvgHXLXdkf9PgkXvmAcNB7cYM8m1VVfSdQ-UeIBBExRD6b4RMTZ_9tY4Pf5OtERhgoBLyqcq6Fx5NJuFbx1Uex9-R5kOoFykk_lDurULTMurHGgO0ToROd7RlYa0vz_FLnvwWUPmlzeTr3GjlDYrcMEtGAHeRr00Do8djgLHcCAEk6jlG3Amrvgh5EUKYrcsjFDZzR3G_0EciZnOemTt62Yg1vvCZT"
                        }
                        alt={evento.nombre}
                      />
                      <div className="absolute top-4 left-4 font-label-md text-label-md px-3 py-1 rounded-md shadow-[0_0_12px_rgba(233,179,255,0.3)] neon-glow-primary bg-black/40 backdrop-blur-sm">
                        {fechaFormateada}
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                      <div className="absolute bottom-4 left-4">
                        <p className="font-label-md text-label-md text-primary-fixed-dim uppercase tracking-tighter">{evento.tipo || "Evento"}</p>
                        <h3 className="font-headline-md text-headline-md text-white">{evento.nombre}</h3>
                      </div>
                    </div>
                    <div className="p-6 flex flex-col flex-grow">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full border border-outline-variant bg-surface-variant flex items-center justify-center">
                          <span className="material-symbols-outlined text-primary text-xl">{icono}</span>
                        </div>
                        <div>
                          <p className="font-label-md text-label-md text-on-surface-variant leading-none">Artista Principal</p>
                          <p className="font-body-md text-body-md text-white font-semibold">{evento.artista || evento.nombre}</p>
                        </div>
                      </div>
                      <p className="font-body-md text-body-md text-on-surface-variant mb-4 flex-grow line-clamp-3">
                        {evento.descripcion || "Descripción no disponible"}
                      </p>
                      <div className="flex items-center gap-2 mb-4 flex-wrap">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${estadoColor}`}>
                          {estadoTexto}
                        </span>
                        {evento.estado === "Sold Out" && (
                          <span className="text-[10px] text-secondary font-bold">• Agotado</span>
                        )}
                        {evento.estado === "Confirmed" && (
                          <span className="text-[10px] text-primary font-bold">• Confirmado</span>
                        )}
                      </div>
                      <div className="flex gap-3 mt-auto">
                        <button
                          onClick={irAReservas}
                          className="flex-1 py-3 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-bold active:scale-95 transition-all hover:brightness-110 shadow-lg shadow-primary/20"
                        >
                          Reservar ahora
                        </button>
                        <button
                          onClick={compartirEvento}
                          className="p-3 rounded-lg border border-primary/30 text-primary hover:bg-primary/10 transition-all active:scale-95"
                          title="Compartir evento"
                        >
                          <span className="material-symbols-outlined">share</span>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* ===== TOAST PARA MENSAJES ===== */}
      {mensaje.texto && (
        <div className={`fixed bottom-24 right-8 glass-card rounded-xl px-4 py-2.5 flex items-center gap-3 transition-all duration-300 z-[100] border ${
          mensaje.tipo === "error" ? "border-error/30" : "border-primary/30"
        } shadow-lg`}>
          <span className="material-symbols-outlined text-primary">check_circle</span>
          <div>
            <p className="text-on-surface font-bold text-sm">{mensaje.texto}</p>
          </div>
        </div>
      )}

      {/* ===== ESTILOS DE RESPALDO ===== */}
      <style jsx>{`
        body, html {
          background-color: #050505 !important;
          margin: 0;
          padding: 0;
        }

        .pt-20 { padding-top: 5rem; }
        .pb-12 { padding-bottom: 3rem; }
        .px-4 { padding-left: 1rem; padding-right: 1rem; }
        .md\\:px-8 { padding-left: 2rem; padding-right: 2rem; }
        .max-w-7xl { max-width: 80rem; }
        .mx-auto { margin-left: auto; margin-right: auto; }
        .min-h-screen { min-height: 100vh; }

        .font-display-lg { font-family: Montserrat, sans-serif; font-size: 48px; line-height: 56px; letter-spacing: -0.02em; font-weight: 800; }
        .text-display-lg { font-size: 48px; line-height: 56px; letter-spacing: -0.02em; font-weight: 800; }
        .font-body-lg { font-family: Inter, sans-serif; font-size: 18px; line-height: 28px; font-weight: 400; }
        .text-body-lg { font-size: 18px; line-height: 28px; font-weight: 400; }
        .font-label-md { font-family: Inter, sans-serif; font-size: 14px; line-height: 20px; letter-spacing: 0.05em; font-weight: 600; }
        .text-label-md { font-size: 14px; line-height: 20px; letter-spacing: 0.05em; font-weight: 600; }
        .font-headline-lg { font-family: Montserrat, sans-serif; font-size: 32px; line-height: 40px; letter-spacing: -0.01em; font-weight: 700; }
        .text-headline-lg { font-size: 32px; line-height: 40px; letter-spacing: -0.01em; font-weight: 700; }
        .font-headline-md { font-family: Montserrat, sans-serif; font-size: 24px; line-height: 32px; font-weight: 600; }
        .text-headline-md { font-size: 24px; line-height: 32px; font-weight: 600; }

        .text-primary { color: #e9b3ff; }
        .text-on-surface { color: #e5e2e1; }
        .text-on-surface-variant { color: #d2c1d4; }
        .text-secondary { color: #ffb2b7; }
        .text-tertiary { color: #e7c448; }
        .text-white { color: #ffffff; }
        .text-on-primary { color: #510074; }
        .text-on-secondary { color: #67001c; }

        .text-gradient-primary {
          background: linear-gradient(135deg, #e9b3ff 0%, #c863fb 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .bg-primary { background-color: #e9b3ff; }
        .bg-primary\\/10 { background-color: rgba(233,179,255,0.1); }
        .bg-primary\\/20 { background-color: rgba(233,179,255,0.2); }
        .bg-secondary { background-color: #ffb2b7; }
        .bg-secondary\\/20 { background-color: rgba(255,178,183,0.2); }
        .bg-tertiary\\/20 { background-color: rgba(231,196,72,0.2); }
        .bg-surface-container-high { background-color: #2a2a2a; }
        .bg-surface-variant { background-color: #353534; }
        .bg-white\\/10 { background-color: rgba(255,255,255,0.1); }
        .bg-black\\/40 { background-color: rgba(0,0,0,0.4); }
        .bg-black\\/80 { background-color: rgba(0,0,0,0.8); }
        .bg-black\\/20 { background-color: rgba(0,0,0,0.2); }

        .border-primary { border-color: #e9b3ff; }
        .border-primary\\/30 { border-color: rgba(233,179,255,0.3); }
        .border-primary\\/20 { border-color: rgba(233,179,255,0.2); }
        .border-outline-variant { border-color: #4f4352; }
        .border-white\\/10 { border-color: rgba(255,255,255,0.1); }
        .border-tertiary\\/30 { border-color: rgba(231,196,72,0.3); }
        .border-error\\/30 { border-color: rgba(255,180,171,0.3); }
        .border-secondary\\/30 { border-color: rgba(255,178,183,0.3); }

        .glass-card {
          background: rgba(28, 28, 30, 0.7);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .glass-card:hover {
          border-color: rgba(233, 179, 255, 0.5);
          box-shadow: 0 0 20px rgba(233, 179, 255, 0.15);
          transform: translateY(-4px);
        }

        .neon-glow-primary {
          box-shadow: 0 0 12px rgba(233, 179, 255, 0.3);
        }

        .shadow-\\[0_0_12px_rgba\\(233\\,179\\,255\\,0\\.3\\)\\] { box-shadow: 0 0 12px rgba(233,179,255,0.3); }
        .shadow-\\[0_0_20px_rgba\\(233\\,179\\,255\\,0\\.15\\)\\] { box-shadow: 0 0 20px rgba(233,179,255,0.15); }
        .shadow-\\[0_0_15px_rgba\\(233\\,179\\,255\\,0\\.2\\)\\] { box-shadow: 0 0 15px rgba(233,179,255,0.2); }
        .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05); }
        .shadow-primary\\/20 { box-shadow: 0 0 20px rgba(233,179,255,0.2); }
        .shadow-primary\\/5 { box-shadow: 0 0 15px rgba(233,179,255,0.05); }

        .rounded-full { border-radius: 9999px; }
        .rounded-xl { border-radius: 0.75rem; }
        .rounded-lg { border-radius: 0.5rem; }
        .rounded-md { border-radius: 0.375rem; }

        .transition-all { transition: all 0.3s ease; }
        .duration-500 { transition-duration: 500ms; }
        .duration-700 { transition-duration: 700ms; }
        .active\\:scale-95:active { transform: scale(0.95); }
        .hover\\:scale-110:hover { transform: scale(1.1); }
        .group-hover\\:scale-110:hover .group { transform: scale(1.1); }
        .group-hover\\:scale-110 .group:hover { transform: scale(1.1); }
        .hover\\:bg-primary\\/10:hover { background-color: rgba(233,179,255,0.1); }
        .hover\\:bg-primary\\/5:hover { background-color: rgba(233,179,255,0.05); }
        .hover\\:border-primary:hover { border-color: #e9b3ff; }
        .hover\\:border-primary\\/50:hover { border-color: rgba(233,179,255,0.5); }
        .hover\\:brightness-110:hover { filter: brightness(1.1); }
        .hover\\:underline:hover { text-decoration: underline; }

        .animate-pulse { animation: pulse 2s cubic-bezier(0.4,0,0.6,1) infinite; }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease forwards;
        }
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
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

        .gap-6 { gap: 1.5rem; }
        .gap-4 { gap: 1rem; }
        .gap-3 { gap: 0.75rem; }
        .gap-2 { gap: 0.5rem; }
        .gap-1 { gap: 0.25rem; }

        .grid { display: grid; }
        .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
        .md\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .lg\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }

        .flex { display: flex; }
        .flex-col { flex-direction: column; }
        .flex-wrap { flex-wrap: wrap; }
        .items-center { align-items: center; }
        .justify-between { justify-content: space-between; }
        .text-center { text-align: center; }
        .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
        .text-xs { font-size: 0.75rem; line-height: 1rem; }
        .text-\\[10px\\] { font-size: 10px; }
        .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
        .text-5xl { font-size: 3rem; line-height: 1; }
        .text-6xl { font-size: 3.75rem; line-height: 1; }

        .uppercase { text-transform: uppercase; }
        .tracking-widest { letter-spacing: 0.1em; }
        .tracking-tighter { letter-spacing: -0.05em; }
        .font-bold { font-weight: 700; }
        .font-semibold { font-weight: 600; }
        .leading-tight { line-height: 1.25; }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .relative { position: relative; }
        .absolute { position: absolute; }
        .fixed { position: fixed; }
        .inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
        .-z-10 { z-index: -10; }
        .z-10 { z-index: 10; }
        .z-\\[100\\] { z-index: 100; }
        .bottom-4 { bottom: 1rem; }
        .bottom-24 { bottom: 6rem; }
        .left-4 { left: 1rem; }
        .right-8 { right: 2rem; }
        .top-4 { top: 1rem; }

        .overflow-hidden { overflow: hidden; }
        .object-cover { object-fit: cover; }
        .p-6 { padding: 1.5rem; }
        .p-3 { padding: 0.75rem; }
        .p-1 { padding: 0.25rem; }
        .p-12 { padding: 3rem; }
        .px-4 { padding-left: 1rem; padding-right: 1rem; }
        .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
        .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
        .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
        .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
        .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
        .py-2\\.5 { padding-top: 0.625rem; padding-bottom: 0.625rem; }
        .pt-8 { padding-top: 2rem; }
        .pb-12 { padding-bottom: 3rem; }
        .mb-4 { margin-bottom: 1rem; }
        .mb-6 { margin-bottom: 1.5rem; }
        .mb-8 { margin-bottom: 2rem; }
        .mt-2 { margin-top: 0.5rem; }
        .mt-4 { margin-top: 1rem; }
        .mt-auto { margin-top: auto; }

        .bg-gradient-to-t {
          background-image: linear-gradient(to top, var(--tw-gradient-stops));
        }
        .from-black\\/80 {
          --tw-gradient-from: rgba(0, 0, 0, 0.8);
          --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(0, 0, 0, 0));
        }
        .via-black\\/20 {
          --tw-gradient-to: rgba(0, 0, 0, 0.2);
        }
        .to-transparent {
          --tw-gradient-to: transparent;
        }

        .bg-primary-fixed-dim { background-color: #e9b3ff; }
        .text-primary-fixed-dim { color: #e9b3ff; }
        .bg-secondary\\/20 { background-color: rgba(255,178,183,0.2); }
        .text-on-secondary { color: #67001c; }
        .bg-error\\/20 { background-color: rgba(255,180,171,0.2); }
        .text-error { color: #ffb4ab; }
        .border-secondary\\/30 { border-color: rgba(255,178,183,0.3); }

        .max-w-xl { max-width: 36rem; }
        .max-w-3xl { max-width: 48rem; }

        @media (min-width: 768px) {
          .md\\:flex-row { flex-direction: row; }
          .md\\:items-center { align-items: center; }
          .md\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .md\\:px-8 { padding-left: 2rem; padding-right: 2rem; }
        }
        @media (min-width: 1024px) {
          .lg\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        }
      `}</style>
    </>
  );
};

export default UserEventos;