import React, { useState, useEffect } from "react";
import NavbarUsuario from "../../../components/Layout/NavbarUsuario";

const STORAGE_KEY = 'afterdark_canciones';

const UserCanciones = () => {
  const [usuario, setUsuario] = useState("");
  const [canciones, setCanciones] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [titulo, setTitulo] = useState("");
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });
  const [loading, setLoading] = useState(true);

  // Cargar usuario y canciones al montar
  useEffect(() => {
    let user = sessionStorage.getItem("usuarioCanciones");
    if (!user) {
      user = prompt("Ingresa tu nombre de usuario para gestionar tus canciones:");
      if (user) {
        sessionStorage.setItem("usuarioCanciones", user);
      } else {
        user = "Anónimo";
        sessionStorage.setItem("usuarioCanciones", user);
      }
    }
    setUsuario(user);
    cargarCanciones(user);
  }, []);

  const cargarCanciones = (user) => {
    setLoading(true);
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const todas = JSON.parse(stored);
      const delUsuario = todas.filter(c => c.usuario === (user || usuario));
      setCanciones(delUsuario);
    } else {
      setCanciones([]);
    }
    setLoading(false);
  };

  // Guardar en localStorage manteniendo las de otros usuarios
  const guardarEnStorage = (nuevaLista) => {
    const stored = localStorage.getItem(STORAGE_KEY);
    let todas = stored ? JSON.parse(stored) : [];
    const otras = todas.filter(c => c.usuario !== usuario);
    const final = [...otras, ...nuevaLista];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(final));
  };

  // Agregar canción (solo título)
  const handleAgregar = (e) => {
    e.preventDefault();
    if (!titulo.trim()) {
      setMensaje({ texto: "El título es obligatorio", tipo: "error" });
      setTimeout(() => setMensaje({ texto: "", tipo: "" }), 3000);
      return;
    }
    const newId = Date.now().toString();
    const cancion = {
      id: newId,
      titulo: titulo.trim(),
      usuario: usuario,
    };
    const nuevasCanciones = [...canciones, cancion];
    setCanciones(nuevasCanciones);
    guardarEnStorage(nuevasCanciones);
    setTitulo("");
    setMensaje({ texto: "¡Canción agregada!", tipo: "success" });
    setTimeout(() => setMensaje({ texto: "", tipo: "" }), 3000);
  };

  // Eliminar canción (solo propias)
  const handleEliminar = (id) => {
    // Reemplazar confirm por un diálogo más amigable (usamos confirm nativo por simplicidad)
    if (!window.confirm("¿Eliminar esta canción?")) return;
    const nuevas = canciones.filter(c => c.id !== id);
    setCanciones(nuevas);
    guardarEnStorage(nuevas);
    setMensaje({ texto: "Canción eliminada", tipo: "success" });
    setTimeout(() => setMensaje({ texto: "", tipo: "" }), 3000);
  };

  // Abrir búsqueda en YouTube
  const handleVerEnYouTube = (titulo) => {
    const query = encodeURIComponent(titulo);
    window.open(`https://www.youtube.com/results?search_query=${query}`, "_blank");
  };

  // Limpiar búsqueda
  const limpiarBusqueda = () => {
    setSearchTerm("");
  };

  // Filtro local por título
  const cancionesFiltradas = canciones.filter(c =>
    c.titulo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Estadísticas
  const totalCanciones = canciones.length;
  const totalFiltradas = cancionesFiltradas.length;

  // Historial simulado (estático)
  const historial = [
    { titulo: "Synthetic Dreams", tiempo: "Hace 5 mins" },
    { titulo: "Bassline Junkie", tiempo: "Hace 12 mins" },
    { titulo: "Afterdark Anthem", tiempo: "Hace 20 mins" },
    { titulo: "Glow Protocol", tiempo: "Hace 31 mins" },
  ];

  return (
    <>
      <NavbarUsuario />
      <main className="min-h-screen pt-20 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
        {/* Hero / Search Section */}
        <header className="mb-10 max-w-4xl mx-auto text-center space-y-4">
          <h1 className="font-display-lg text-display-lg text-primary">Controla el Vibe</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Agrega tus canciones favoritas y pídele al DJ que las ponga en vivo.
          </p>
          <p className="text-sm text-on-surface-variant">
            Usuario: <span className="text-primary font-bold">{usuario}</span>
            <span className="mx-2">•</span>
            <span className="text-primary">{totalCanciones} canciones guardadas</span>
          </p>
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 rounded-full"></div>
            <div className="relative flex items-center glass-card rounded-full px-6 py-4 border-primary/20 focus-within:border-primary transition-colors">
              <span className="material-symbols-outlined text-primary mr-4">search</span>
              <input
                className="bg-transparent border-none focus:ring-0 text-on-surface w-full font-body-lg placeholder:text-on-surface-variant/50"
                placeholder="Buscar por título..."
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={limpiarBusqueda}
                  className="text-on-surface-variant hover:text-primary transition-colors ml-2"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              )}
              <div className="flex items-center gap-2 text-xs font-label-md text-primary/50 uppercase tracking-widest hidden md:flex">
                Presiona <span className="px-2 py-1 bg-white/10 rounded">Enter</span>
              </div>
            </div>
          </div>
          {mensaje.texto && (
            <div className={`text-sm font-label-md ${mensaje.tipo === "success" ? "text-secondary" : mensaje.tipo === "error" ? "text-error" : "text-on-surface-variant"} animate-fadeIn`}>
              {mensaje.texto}
            </div>
          )}
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto">
          {/* Sección de canciones (8 columnas) */}
          <section className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-headline-lg text-headline-lg text-on-surface flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary">trending_up</span>
                Mis Canciones
                {searchTerm && <span className="text-sm text-on-surface-variant font-normal">({totalFiltradas} resultados)</span>}
              </h2>
              <span className="text-secondary font-label-md px-3 py-1 bg-secondary/10 rounded-full animate-pulse">
                {totalFiltradas} canciones
              </span>
            </div>
            {loading ? (
              <div className="text-center text-on-surface-variant py-8">Cargando...</div>
            ) : cancionesFiltradas.length === 0 ? (
              <div className="col-span-2 text-center text-on-surface-variant py-12 glass-card rounded-xl p-8">
                <span className="material-symbols-outlined text-6xl text-on-surface-variant/40 mb-4">music_off</span>
                <p className="font-body-lg">No tienes canciones guardadas</p>
                <p className="text-sm">Agrega tu primera canción usando el formulario de abajo.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cancionesFiltradas.map((cancion, index) => (
                  <div
                    key={cancion.id}
                    className="glass-card rounded-xl p-4 flex items-center gap-4 hover:border-primary/50 transition-all group relative overflow-hidden animate-fadeIn"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-surface-container-high flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary text-3xl">music_note</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-label-md text-label-md text-on-surface truncate">{cancion.titulo}</h3>
                      <button
                        onClick={() => handleVerEnYouTube(cancion.titulo)}
                        className="text-[10px] text-primary hover:underline mt-0.5 flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-sm">play_arrow</span>
                        Ver en YouTube
                      </button>
                    </div>
                    <button
                      onClick={() => handleEliminar(cancion.id)}
                      className="text-error/60 hover:text-error transition text-sm p-2 rounded-full hover:bg-error/10"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Formulario para agregar canción */}
            <div className="glass-card rounded-xl p-4 mt-4">
              <form onSubmit={handleAgregar} className="flex flex-col md:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Título de la canción..."
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  className="flex-1 bg-surface-container-high rounded-lg border border-white/10 px-4 py-2 text-on-surface focus:border-primary/50 focus:outline-none"
                  required
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleVerEnYouTube(titulo)}
                    className="bg-secondary/20 text-secondary font-label-md px-4 py-2 rounded-lg hover:bg-secondary/40 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    disabled={!titulo.trim()}
                  >
                    <span className="material-symbols-outlined text-sm">search</span>
                    Ver en YouTube
                  </button>
                  <button
                    type="submit"
                    className="bg-primary text-on-primary font-label-md px-6 py-2 rounded-lg hover:brightness-110 active:scale-95 transition-all flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">add</span>
                    Agregar
                  </button>
                </div>
              </form>
            </div>
          </section>

          {/* Aside: Historial y DJ Card */}
          <aside className="lg:col-span-4 space-y-6">
            <h2 className="font-headline-md text-headline-md text-on-surface flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">history</span>
              Recientemente Reproducidas
            </h2>
            <div className="glass-card rounded-2xl p-6 space-y-6">
              {historial.map((item, idx) => (
                <div key={idx} className={`flex items-start gap-4 ${idx === 0 ? 'border-l-2 border-primary/20 pl-4 relative' : 'border-l-2 border-white/5 pl-4 relative'}`}>
                  {idx === 0 && (
                    <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_#e9b3ff]"></div>
                  )}
                  <div className="flex-1">
                    <p className={`font-label-md text-on-surface text-sm ${idx !== 0 ? 'opacity-60' : ''}`}>{item.titulo}</p>
                    <p className={`text-xs text-on-surface-variant ${idx !== 0 ? 'opacity-60' : ''}`}>{item.tiempo}</p>
                  </div>
                  {idx === 0 && (
                    <span className="material-symbols-outlined text-on-surface-variant text-sm">equalizer</span>
                  )}
                </div>
              ))}
            </div>

            {/* DJ Status Card */}
            <div className="glass-card rounded-2xl p-6 bg-gradient-to-br from-primary/10 to-transparent border-primary/30">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full border-2 border-primary p-0.5">
                  <img
                    className="w-full h-full object-cover rounded-full"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDvORoQzSw8Um8-_VEquZBPeXV2p3Bs4xa6WengKT4P3HWUiq_pP7qSdSSe9H_tgkgMcf7P4hb8IG3TRxkt7hNh5q0IP-L6kbWR2io9dFne3BZ0VJ-WWmg0H4rbNhx9OMzWdE0qJEFlULGw-TjoV5LaMwWPtkGup8eBpjZZrzFXLqSvqPEe2xvf3qZbRiHT54rbT1n7H2IFSC-ZKCnvAIx433bhA4MuXfVBZ4Sisr9fYcaw9tLsaW_EhCPhZVsNDDwAAlKobLkSf4l7"
                    alt="DJ Kinetic"
                  />
                </div>
                <div>
                  <p className="font-label-md text-on-surface">DJ KINETIC</p>
                  <p className="text-xs text-primary">Aceptando peticiones</p>
                </div>
              </div>
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-primary w-2/3 shadow-[0_0_10px_#e9b3ff]"></div>
              </div>
              <p className="text-[10px] text-on-surface-variant mt-2 text-center uppercase tracking-widest">
                Cola: {totalFiltradas} canciones pendientes
              </p>
            </div>
          </aside>
        </div>
      </main>

      {/* ===== ESTILOS DE RESPALDO ===== */}
      <style jsx>{`
        body, html { background-color: #050505 !important; margin: 0; padding: 0; }

        .pt-20 { padding-top: 5rem; }
        .pb-12 { padding-bottom: 3rem; }
        .px-4 { padding-left: 1rem; padding-right: 1rem; }
        .md\\:px-8 { padding-left: 2rem; padding-right: 2rem; }
        .max-w-7xl { max-width: 80rem; }
        .mx-auto { margin-left: auto; margin-right: auto; }
        .min-h-screen { min-height: 100vh; }
        .mb-10 { margin-bottom: 2.5rem; }
        .space-y-4 > * + * { margin-top: 1rem; }
        .space-y-6 > * + * { margin-top: 1.5rem; }
        .gap-6 { gap: 1.5rem; }
        .gap-4 { gap: 1rem; }
        .gap-3 { gap: 0.75rem; }
        .gap-2 { gap: 0.5rem; }
        .gap-1 { gap: 0.25rem; }

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
        .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
        .text-xs { font-size: 0.75rem; line-height: 1rem; }
        .text-\\[10px\\] { font-size: 10px; }
        .text-\\[18px\\] { font-size: 18px; }
        .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
        .text-6xl { font-size: 3.75rem; line-height: 1; }

        .text-primary { color: #e9b3ff; }
        .text-on-surface { color: #e5e2e1; }
        .text-on-surface-variant { color: #d2c1d4; }
        .text-secondary { color: #ffb2b7; }
        .text-error { color: #ffb4ab; }
        .bg-primary { background-color: #e9b3ff; }
        .bg-primary\\/20 { background-color: rgba(233,179,255,0.2); }
        .bg-secondary\\/10 { background-color: rgba(255,178,183,0.1); }
        .bg-secondary\\/20 { background-color: rgba(255,178,183,0.2); }
        .bg-surface-container-high { background-color: #2a2a2a; }
        .border-white\\/10 { border-color: rgba(255,255,255,0.1); }
        .border-primary\\/20 { border-color: rgba(233,179,255,0.2); }
        .border-primary\\/30 { border-color: rgba(233,179,255,0.3); }
        .border-primary\\/50 { border-color: rgba(233,179,255,0.5); }
        .border-white\\/5 { border-color: rgba(255,255,255,0.05); }

        .glass-card {
          background: rgba(28, 28, 30, 0.7);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
        }
        .glass-card:hover {
          border-color: rgba(233, 179, 255, 0.5);
          box-shadow: 0 0 20px rgba(233, 179, 255, 0.15);
        }

        .shadow-\\[0_0_10px_\\#e9b3ff\\] { box-shadow: 0 0 10px #e9b3ff; }
        .shadow-\\[0_0_8px_\\#e9b3ff\\] { box-shadow: 0 0 8px #e9b3ff; }

        .rounded-full { border-radius: 9999px; }
        .rounded-xl { border-radius: 0.75rem; }
        .rounded-2xl { border-radius: 1rem; }
        .rounded-lg { border-radius: 0.5rem; }

        .transition-all { transition: all 0.3s ease; }
        .duration-500 { transition-duration: 500ms; }
        .active\\:scale-95:active { transform: scale(0.95); }
        .hover\\:brightness-110:hover { filter: brightness(1.1); }
        .hover\\:border-primary\\/50:hover { border-color: rgba(233,179,255,0.5); }
        .hover\\:bg-secondary\\/40:hover { background-color: rgba(255,178,183,0.4); }
        .hover\\:underline:hover { text-decoration: underline; }
        .hover\\:text-primary:hover { color: #e9b3ff; }
        .hover\\:bg-error\\/10:hover { background-color: rgba(255,180,171,0.1); }
        .focus\\:border-primary\\/50:focus { border-color: rgba(233,179,255,0.5); }
        .focus\\:outline-none:focus { outline: none; }
        .focus\\:ring-0:focus { outline: none; box-shadow: none; }
        .border-none { border: none; }
        .bg-transparent { background-color: transparent; }
        .disabled\\:opacity-50:disabled { opacity: 0.5; }
        .disabled\\:cursor-not-allowed:disabled { cursor: not-allowed; }

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

        .truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .flex { display: flex; }
        .flex-col { flex-direction: column; }
        .items-center { align-items: center; }
        .justify-between { justify-content: space-between; }
        .grid { display: grid; }
        .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
        .md\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .lg\\:grid-cols-12 { grid-template-columns: repeat(12, minmax(0, 1fr)); }
        .lg\\:col-span-8 { grid-column: span 8 / span 8; }
        .lg\\:col-span-4 { grid-column: span 4 / span 4; }
        .w-full { width: 100%; }
        .w-16 { width: 4rem; }
        .h-16 { height: 4rem; }
        .w-12 { width: 3rem; }
        .h-12 { height: 3rem; }
        .h-1 { height: 0.25rem; }
        .w-2\\/3 { width: 66.666667%; }
        .w-2 { width: 0.5rem; }
        .h-2 { height: 0.5rem; }
        .flex-1 { flex: 1; }
        .min-w-0 { min-width: 0; }
        .shrink-0 { flex-shrink: 0; }
        .py-8 { padding-top: 2rem; padding-bottom: 2rem; }
        .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
        .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
        .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
        .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
        .px-4 { padding-left: 1rem; padding-right: 1rem; }
        .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
        .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
        .p-6 { padding: 1.5rem; }
        .p-4 { padding: 1rem; }
        .p-0\\.5 { padding: 0.125rem; }
        .p-2 { padding: 0.5rem; }
        .p-8 { padding: 2rem; }
        .mb-4 { margin-bottom: 1rem; }
        .mt-4 { margin-top: 1rem; }
        .mt-2 { margin-top: 0.5rem; }
        .mt-0\\.5 { margin-top: 0.125rem; }
        .mr-4 { margin-right: 1rem; }
        .ml-2 { margin-left: 0.5rem; }
        .mx-2 { margin-left: 0.5rem; margin-right: 0.5rem; }

        .relative { position: relative; }
        .absolute { position: absolute; }
        .inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
        .-left-\\[5px\\] { left: -5px; }
        .top-0 { top: 0; }

        .blur-xl { filter: blur(24px); }
        .opacity-0 { opacity: 0; }
        .opacity-100 { opacity: 1; }
        .opacity-60 { opacity: 0.6; }
        .group-focus-within\\:opacity-100:focus-within { opacity: 1; }
        .duration-500 { transition-duration: 500ms; }

        .bg-gradient-to-br { background-image: linear-gradient(to bottom right, var(--tw-gradient-stops)); }
        .from-primary\\/10 { --tw-gradient-from: rgba(233, 179, 255, 0.1); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(233, 179, 255, 0)); }
        .to-transparent { --tw-gradient-to: transparent; }
        .object-cover { object-fit: cover; }
        .overflow-hidden { overflow: hidden; }
        .border-l-2 { border-left-width: 2px; }
        .pl-4 { padding-left: 1rem; }
        .pl-3 { padding-left: 0.75rem; }
        .border-l-2.border-primary\\/20 { border-color: rgba(233, 179, 255, 0.2); }
        .border-l-2.border-white\\/5 { border-color: rgba(255, 255, 255, 0.05); }

        .uppercase { text-transform: uppercase; }
        .tracking-widest { letter-spacing: 0.1em; }
        .font-normal { font-weight: 400; }

        .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease forwards;
        }
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        @media (min-width: 768px) {
          .md\\:flex-row { flex-direction: row; }
          .md\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .md\\:px-8 { padding-left: 2rem; padding-right: 2rem; }
          .md\\:flex { display: flex; }
          .md\\:hidden { display: none; }
        }
        @media (min-width: 1024px) {
          .lg\\:grid-cols-12 { grid-template-columns: repeat(12, minmax(0, 1fr)); }
          .lg\\:col-span-8 { grid-column: span 8 / span 8; }
          .lg\\:col-span-4 { grid-column: span 4 / span 4; }
        }
      `}</style>
    </>
  );
};

export default UserCanciones;