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
  const [filter, setFilter] = useState("all"); // "all" | "vip"
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });

  useEffect(() => {
    cargarEventos();
  }, []);

  const cargarEventos = async () => {
    setLoading(true);
    try {
      const data = await eventoService.getAll();
      // Ordenar por fecha (más recientes primero)
      const sorted = data.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
      setEventos(sorted);
    } catch (err) {
      setEventos([]);
    } finally {
      setLoading(false);
    }
  };

  // Mostrar mensaje tipo toast
  const mostrarMensaje = (texto, tipo = "success") => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: "", tipo: "" }), 3000);
  };

  // Copiar URL al portapapeles
  const compartirEvento = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      mostrarMensaje("¡URL copiada al portapapeles!", "success");
    } catch (err) {
      // Fallback: si no funciona el clipboard API
      const textarea = document.createElement("textarea");
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      mostrarMensaje("¡URL copiada al portapapeles!", "success");
    }
  };

  // Redirigir a reservas
  const irAReservas = () => {
    window.location.href = "/usuario/reserva";
  };

  // Filtro de eventos (solo visual)
  const eventosFiltrados = filter === "all"
    ? eventos
    : eventos.filter(e => e.tipo === "VIP Only" || e.tipo === "Fiesta Temática");

  // Helper para obtener color de estado
  const getEstadoColor = (estado) => {
    switch (estado) {
      case "Sold Out": return "bg-secondary text-on-secondary";
      case "Confirmed": return "bg-primary/20 text-primary border border-primary/30";
      case "Available": return "bg-tertiary/20 text-tertiary border border-tertiary/30";
      default: return "bg-white/10 text-on-surface-variant";
    }
  };

  // Helper para icono de headliner
  const getHeadlinerIcon = (tipo) => {
    if (tipo === "DJ Set") return "graphic_eq";
    if (tipo === "Concierto") return "mic_external_on";
    if (tipo === "Fiesta Temática") return "masks";
    return "event";
  };

  // Texto de estado en español
  const getEstadoTexto = (estado) => {
    switch (estado) {
      case "Sold Out": return "Agotado";
      case "Confirmed": return "Confirmado";
      case "Available": return "Disponible";
      case "Negotiating": return "Negociando";
      default: return estado || "Disponible";
    }
  };

  return (
    <>
      <NavbarUsuario />
      <main className="md:ml-64 pt-24 pb-20 px-margin-mobile md:px-margin-desktop min-h-screen">
        {/* ===== HERO SECTION ===== */}
        <header className="relative pt-8 pb-12 overflow-hidden">
          <div className="absolute inset-0 -z-10 opacity-40"></div>
          <div className="relative z-10 max-w-7xl mx-auto">
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
          </div>
        </header>

        {/* ===== FILTROS Y GRID ===== */}
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-4">
            <h2 className="font-headline-lg text-headline-lg text-white">Próximas Noches</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-6 py-2 rounded-full border font-label-md text-label-md transition-all ${
                  filter === "all"
                    ? "bg-primary/20 border-primary text-primary"
                    : "bg-surface-container-high border-outline-variant text-on-surface-variant hover:border-primary"
                }`}
              >
                Todos los Géneros
              </button>
              <button
                onClick={() => setFilter("vip")}
                className={`px-6 py-2 rounded-full border font-label-md text-label-md transition-all ${
                  filter === "vip"
                    ? "bg-primary/20 border-primary text-primary"
                    : "bg-surface-container-high border-outline-variant text-on-surface-variant hover:border-primary"
                }`}
              >
                Solo VIP
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center text-on-surface-variant py-12">Cargando eventos...</div>
          ) : eventosFiltrados.length === 0 ? (
            <div className="text-center text-on-surface-variant py-12">No hay eventos disponibles</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
              {eventosFiltrados.map((evento) => {
                const fechaFormateada = evento.fecha
                  ? new Date(evento.fecha).toLocaleDateString("es-ES", { day: "numeric", month: "short" }).toUpperCase()
                  : "FECHA POR CONFIRMAR";
                const estadoColor = getEstadoColor(evento.estado);
                const icono = getHeadlinerIcon(evento.tipo);
                const estadoTexto = getEstadoTexto(evento.estado);

                return (
                  <article key={evento.id} className="glass-card rounded-xl overflow-hidden flex flex-col h-full group">
                    <div className="relative h-64 overflow-hidden">
                      <img
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        src={
                          evento.imagen ||
                          "https://lh3.googleusercontent.com/aida-public/AB6AXuC3BGbOdPQWBh0Gx52GQykomK0jze-tIljh8xbP3G1J8NGCXhtvgHXLXdkf9PgkXvmAcNB7cYM8m1VVfSdQ-UeIBBExRD6b4RMTZ_9tY4Pf5OtERhgoBLyqcq6Fx5NJuFbx1Uex9-R5kOoFykk_lDurULTMurHGgO0ToROd7RlYa0vz_FLnvwWUPmlzeTr3GjlDYrcMEtGAHeRr00Do8djgLHcCAEk6jlG3Amrvgh5EUKYrcsjFDZzR3G_0EciZnOemTt62Yg1vvCZT"
                        }
                        alt={evento.nombre}
                      />
                      <div className="absolute top-4 left-4 font-label-md text-label-md px-3 py-1 rounded-md shadow-[0_0_12px_rgba(233,179,255,0.3)] neon-glow-primary">
                        {fechaFormateada}
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
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
                      <p className="font-body-md text-body-md text-on-surface-variant mb-4 flex-grow">
                        {evento.descripcion || "Descripción no disponible"}
                      </p>
                      <div className="flex items-center gap-2 mb-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${estadoColor}`}>
                          {estadoTexto}
                        </span>
                        {evento.estado === "Sold Out" && (
                          <span className="text-[10px] text-secondary font-bold">• Agotado</span>
                        )}
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={irAReservas}
                          className="flex-1 py-3 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-bold active:scale-95 transition-transform"
                        >
                          Reservar ahora
                        </button>
                        <button
                          onClick={compartirEvento}
                          className="p-3 rounded-lg border border-primary/30 text-primary hover:bg-primary/5 active:scale-95 transition-transform"
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
        <div className={`fixed bottom-24 right-8 glass-card rounded-xl px-md py-sm flex items-center gap-sm transition-all duration-300 z-[100] border ${
          mensaje.tipo === "error" ? "border-error/30" : "border-primary/30"
        }`}>
          <span className="material-symbols-outlined text-primary">check_circle</span>
          <div>
            <p className="text-on-surface font-bold text-sm">{mensaje.texto}</p>
          </div>
        </div>
      )}

      {/* ===== ESTILOS DE RESPALDO (exactos al HTML de eventos) ===== */}
      <style jsx>{`
        /* Fondo negro global */
        body,
        html {
          background-color: #050505 !important;
          margin: 0;
          padding: 0;
        }

        .pt-24 {
          padding-top: 6rem;
        }
        .md\\:ml-64 {
          margin-left: 16rem;
        }
        .pb-20 {
          padding-bottom: 5rem;
        }
        .min-h-screen {
          min-height: 100vh;
        }
        .px-margin-mobile {
          padding-left: 16px;
          padding-right: 16px;
        }
        .md\\:px-margin-desktop {
          padding-left: 48px;
          padding-right: 48px;
        }

        .font-display-lg {
          font-family: Montserrat, sans-serif;
          font-size: 48px;
          line-height: 56px;
          letter-spacing: -0.02em;
          font-weight: 800;
        }
        .text-display-lg {
          font-size: 48px;
          line-height: 56px;
          letter-spacing: -0.02em;
          font-weight: 800;
        }
        .font-body-lg {
          font-family: Inter, sans-serif;
          font-size: 18px;
          line-height: 28px;
          font-weight: 400;
        }
        .text-body-lg {
          font-size: 18px;
          line-height: 28px;
          font-weight: 400;
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
        .font-headline-lg {
          font-family: Montserrat, sans-serif;
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

        .text-primary {
          color: #e9b3ff;
        }
        .text-on-surface {
          color: #e5e2e1;
        }
        .text-on-surface-variant {
          color: #d2c1d4;
        }
        .text-secondary {
          color: #ffb2b7;
        }
        .text-tertiary {
          color: #e7c448;
        }
        .text-white {
          color: #ffffff;
        }
        .text-gradient-primary {
          background: linear-gradient(135deg, #e9b3ff 0%, #c863fb 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .bg-primary {
          background-color: #e9b3ff;
        }
        .bg-primary\\/10 {
          background-color: rgba(233, 179, 255, 0.1);
        }
        .bg-primary\\/20 {
          background-color: rgba(233, 179, 255, 0.2);
        }
        .bg-secondary {
          background-color: #ffb2b7;
        }
        .bg-tertiary\\/20 {
          background-color: rgba(231, 196, 72, 0.2);
        }
        .bg-surface-container-high {
          background-color: #2a2a2a;
        }
        .bg-surface-variant {
          background-color: #353534;
        }
        .bg-white\\/10 {
          background-color: rgba(255, 255, 255, 0.1);
        }
        .border-primary {
          border-color: #e9b3ff;
        }
        .border-primary\\/30 {
          border-color: rgba(233, 179, 255, 0.3);
        }
        .border-primary\\/20 {
          border-color: rgba(233, 179, 255, 0.2);
        }
        .border-outline-variant {
          border-color: #4f4352;
        }
        .border-white\\/10 {
          border-color: rgba(255, 255, 255, 0.1);
        }
        .border-tertiary\\/30 {
          border-color: rgba(231, 196, 72, 0.3);
        }
        .border-error\\/30 {
          border-color: rgba(255, 180, 171, 0.3);
        }
        .glass-card {
          background: rgba(28, 28, 30, 0.7);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .glass-card:hover {
          border-color: #e9b3ff;
          box-shadow: 0 0 20px rgba(233, 179, 255, 0.15);
          transform: translateY(-4px);
        }
        .neon-glow-primary {
          box-shadow: 0 0 12px rgba(233, 179, 255, 0.3);
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

        .gap-gutter {
          gap: 24px;
        }
        .max-w-7xl {
          max-width: 80rem;
        }
        .mx-auto {
          margin-left: auto;
          margin-right: auto;
        }
        .grid {
          display: grid;
        }
        .grid-cols-1 {
          grid-template-columns: repeat(1, minmax(0, 1fr));
        }
        .md\\:grid-cols-2 {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .lg\\:grid-cols-3 {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
        .gap-3 {
          gap: 0.75rem;
        }
        .gap-2 {
          gap: 0.5rem;
        }
        .w-full {
          width: 100%;
        }
        .h-full {
          height: 100%;
        }
        .h-64 {
          height: 16rem;
        }
        .w-10 {
          width: 2.5rem;
        }
        .h-10 {
          height: 2.5rem;
        }
        .w-2 {
          width: 0.5rem;
        }
        .h-2 {
          height: 0.5rem;
        }
        .flex {
          display: flex;
        }
        .flex-col {
          flex-direction: column;
        }
        .items-center {
          align-items: center;
        }
        .justify-between {
          justify-content: space-between;
        }
        .text-center {
          text-align: center;
        }
        .text-sm {
          font-size: 0.875rem;
          line-height: 1.25rem;
        }
        .text-xs {
          font-size: 0.75rem;
          line-height: 1rem;
        }
        .text-\\[10px\\] {
          font-size: 10px;
        }
        .text-xl {
          font-size: 1.25rem;
          line-height: 1.75rem;
        }
        .uppercase {
          text-transform: uppercase;
        }
        .tracking-widest {
          letter-spacing: 0.1em;
        }
        .tracking-tighter {
          letter-spacing: -0.05em;
        }
        .font-bold {
          font-weight: 700;
        }
        .font-semibold {
          font-weight: 600;
        }
        .relative {
          position: relative;
        }
        .absolute {
          position: absolute;
        }
        .inset-0 {
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
        }
        .-z-10 {
          z-index: -10;
        }
        .z-10 {
          z-index: 10;
        }
        .z-\\[100\\] {
          z-index: 100;
        }
        .overflow-hidden {
          overflow: hidden;
        }
        .object-cover {
          object-fit: cover;
        }
        .p-6 {
          padding: 1.5rem;
        }
        .p-3 {
          padding: 0.75rem;
        }
        .p-1 {
          padding: 0.25rem;
        }
        .px-4 {
          padding-left: 1rem;
          padding-right: 1rem;
        }
        .px-6 {
          padding-left: 1.5rem;
          padding-right: 1.5rem;
        }
        .px-3 {
          padding-left: 0.75rem;
          padding-right: 0.75rem;
        }
        .py-1 {
          padding-top: 0.25rem;
          padding-bottom: 0.25rem;
        }
        .py-2 {
          padding-top: 0.5rem;
          padding-bottom: 0.5rem;
        }
        .py-3 {
          padding-top: 0.75rem;
          padding-bottom: 0.75rem;
        }
        .pt-8 {
          padding-top: 2rem;
        }
        .pb-12 {
          padding-bottom: 3rem;
        }
        .mb-4 {
          margin-bottom: 1rem;
        }
        .mb-6 {
          margin-bottom: 1.5rem;
        }
        .mb-12 {
          margin-bottom: 3rem;
        }
        .mt-2 {
          margin-top: 0.5rem;
        }
        .gap-4 {
          gap: 1rem;
        }
        .gap-6 {
          gap: 1.5rem;
        }
        .gap-gutter {
          gap: 24px;
        }
        .max-w-xl {
          max-width: 36rem;
        }
        .max-w-3xl {
          max-width: 48rem;
        }
        .leading-tight {
          line-height: 1.25;
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
        .rounded-md {
          border-radius: 0.375rem;
        }
        .bg-gradient-to-t {
          background-image: linear-gradient(to top, var(--tw-gradient-stops));
        }
        .from-black\\/80 {
          --tw-gradient-from: rgba(0, 0, 0, 0.8);
          --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(0, 0, 0, 0));
        }
        .to-transparent {
          --tw-gradient-to: transparent;
        }
        .shadow-\\[0_0_12px_rgba\\(233\\,179\\,255\\,0\\.3\\)\\] {
          box-shadow: 0 0 12px rgba(233, 179, 255, 0.3);
        }
        .shadow-\\[0_0_20px_rgba\\(233\\,179\\,255\\,0\\.15\\)\\] {
          box-shadow: 0 0 20px rgba(233, 179, 255, 0.15);
        }
        .transition-all {
          transition: all 0.3s ease;
        }
        .transition-transform {
          transition-property: transform;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          transition-duration: 150ms;
        }
        .duration-700 {
          transition-duration: 700ms;
        }
        .hover\\:scale-110:hover {
          transform: scale(1.1);
        }
        .group-hover\\:scale-110:hover .group {
          transform: scale(1.1);
        }
        .group-hover\\:scale-110 .group:hover {
          transform: scale(1.1);
        }
        .hover\\:bg-primary\\/5:hover {
          background-color: rgba(233, 179, 255, 0.05);
        }
        .hover\\:border-primary:hover {
          border-color: #e9b3ff;
        }
        .active\\:scale-95:active {
          transform: scale(0.95);
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.4;
          }
        }
        .bg-primary-fixed-dim {
          background-color: #e9b3ff;
        }
        .text-primary-fixed-dim {
          color: #e9b3ff;
        }
        .text-on-primary {
          color: #510074;
        }
        .bg-secondary\\/20 {
          background-color: rgba(255, 178, 183, 0.2);
        }
        .border-secondary\\/30 {
          border-color: rgba(255, 178, 183, 0.3);
        }
        .text-on-secondary {
          color: #67001c;
        }
        .bg-tertiary\\/20 {
          background-color: rgba(231, 196, 72, 0.2);
        }
        .border-tertiary\\/30 {
          border-color: rgba(231, 196, 72, 0.3);
        }
        .text-tertiary {
          color: #e7c448;
        }
        .text-error {
          color: #ffb4ab;
        }
        .bg-error\\/20 {
          background-color: rgba(255, 180, 171, 0.2);
        }
        .border-error\\/30 {
          border-color: rgba(255, 180, 171, 0.3);
        }
        .fixed {
          position: fixed;
        }
        .bottom-24 {
          bottom: 6rem;
        }
        .right-8 {
          right: 2rem;
        }

        @media (min-width: 768px) {
          .md\\:ml-64 {
            margin-left: 16rem;
          }
          .md\\:px-margin-desktop {
            padding-left: 48px;
            padding-right: 48px;
          }
          .md\\:grid-cols-2 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .md\\:flex-row {
            flex-direction: row;
          }
          .md\\:items-center {
            align-items: center;
          }
        }
        @media (min-width: 1024px) {
          .lg\\:grid-cols-3 {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }
      `}</style>
    </>
  );
};

export default UserEventos;