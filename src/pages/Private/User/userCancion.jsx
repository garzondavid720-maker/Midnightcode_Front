import React, { useState, useEffect } from "react";
import NavbarUsuario from "../../../components/Layout/NavbarUsuario";

const STORAGE_KEY = 'afterdark_canciones';

const UserCanciones = () => {
  const [usuario, setUsuario] = useState("");
  const [canciones, setCanciones] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [titulo, setTitulo] = useState("");
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });

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
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const todas = JSON.parse(stored);
      const delUsuario = todas.filter(c => c.usuario === (user || usuario));
      setCanciones(delUsuario);
    } else {
      setCanciones([]);
    }
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
    setMensaje({ texto: "Canción agregada", tipo: "success" });
    setTimeout(() => setMensaje({ texto: "", tipo: "" }), 3000);
  };

  // Eliminar canción (solo propias)
  const handleEliminar = (id) => {
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

  // Filtro local por título
  const cancionesFiltradas = canciones.filter(c =>
    c.titulo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Historial simulado (estático, igual que en el HTML)
  const historial = [
    { titulo: "Synthetic Dreams", tiempo: "Hace 5 mins" },
    { titulo: "Bassline Junkie", tiempo: "Hace 12 mins" },
    { titulo: "Afterdark Anthem", tiempo: "Hace 20 mins" },
    { titulo: "Glow Protocol", tiempo: "Hace 31 mins" },
  ];

  return (
    <>
      <NavbarUsuario />
      <main className="md:ml-64 pt-24 pb-20 md:pb-8 px-margin-mobile md:px-margin-desktop min-h-screen">
        {/* Hero / Search Section (exactamente igual al HTML) */}
        <header className="mb-lg max-w-4xl mx-auto text-center space-y-md">
          <h1 className="font-display-lg text-display-lg text-primary">Controla el Vibe</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Agrega tus canciones favoritas y pídele al DJ que las ponga en vivo.
          </p>
          <p className="text-sm text-on-surface-variant">
            Usuario: <span className="text-primary font-bold">{usuario}</span>
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
              <div className="flex items-center gap-2 text-xs font-label-md text-primary/50 uppercase tracking-widest hidden md:flex">
                Presiona <span className="px-2 py-1 bg-white/10 rounded">Enter</span>
              </div>
            </div>
          </div>
          {mensaje.texto && (
            <div className={`text-sm font-label-md ${mensaje.tipo === "success" ? "text-secondary" : mensaje.tipo === "error" ? "text-error" : "text-on-surface-variant"}`}>
              {mensaje.texto}
            </div>
          )}
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter max-w-7xl mx-auto">
          {/* Sección de canciones (8 columnas) */}
          <section className="lg:col-span-8 space-y-md">
            <div className="flex items-center justify-between">
              <h2 className="font-headline-lg text-headline-lg text-on-surface flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary">trending_up</span>
                Mis Canciones
              </h2>
              <span className="text-secondary font-label-md px-3 py-1 bg-secondary/10 rounded-full animate-pulse">
                {cancionesFiltradas.length} canciones
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cancionesFiltradas.length === 0 ? (
                <div className="col-span-2 text-center text-on-surface-variant py-8">No tienes canciones guardadas</div>
              ) : (
                cancionesFiltradas.map(cancion => (
                  <div key={cancion.id} className="glass-card rounded-xl p-4 flex items-center gap-4 hover:border-primary/50 transition-all group relative overflow-hidden">
                    {/* Imagen por defecto (sin imagen, usamos un icono) */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-surface-container-high flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary text-3xl">music_note</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-label-md text-label-md text-on-surface truncate">{cancion.titulo}</h3>
                      <button
                        onClick={() => handleVerEnYouTube(cancion.titulo)}
                        className="text-[10px] text-primary hover:underline mt-0.5"
                      >
                        Ver en YouTube
                      </button>
                    </div>
                    <button
                      onClick={() => handleEliminar(cancion.id)}
                      className="text-error/60 hover:text-error transition text-sm"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Formulario para agregar canción (dentro de la misma sección, como en el HTML no estaba, pero lo ponemos aquí abajo) */}
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
                    className="bg-secondary/20 text-secondary font-label-md px-4 py-2 rounded-lg hover:bg-secondary/40 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!titulo.trim()}
                  >
                    Ver en YouTube
                  </button>
                  <button
                    type="submit"
                    className="bg-primary text-on-primary font-label-md px-6 py-2 rounded-lg hover:brightness-110 active:scale-95 transition-all"
                  >
                    Agregar
                  </button>
                </div>
              </form>
            </div>
          </section>

          {/* Aside: Historial y DJ Card (exactamente igual al HTML) */}
          <aside className="lg:col-span-4 space-y-md">
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
                Cola: {cancionesFiltradas.length} canciones pendientes
              </p>
            </div>
          </aside>
        </div>
      </main>

      {/* ===== ESTILOS DE RESPALDO (EXACTOS AL HTML DE SONG REQUESTS) ===== */}
      <style jsx>{`
        /* Fondo negro global para ocultar el navbar transparente */
        body, html { background-color: #050505 !important; margin: 0; padding: 0; }

        .pt-24 { padding-top: 6rem; }
        .md\\:ml-64 { margin-left: 16rem; }
        .pb-20 { padding-bottom: 5rem; }
        .md\\:pb-8 { padding-bottom: 2rem; }
        .min-h-screen { min-height: 100vh; }
        .px-margin-mobile { padding-left: 16px; padding-right: 16px; }
        .md\\:px-margin-desktop { padding-left: 48px; padding-right: 48px; }

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
        .text-error { color: #ffb4ab; }
        .bg-primary { background-color: #e9b3ff; }
        .bg-secondary\\/10 { background-color: rgba(255, 178, 183, 0.1); }
        .bg-secondary\\/20 { background-color: rgba(255, 178, 183, 0.2); }
        .bg-surface-container-high { background-color: #2a2a2a; }
        .border-white\\/10 { border-color: rgba(255, 255, 255, 0.1); }
        .border-primary\\/20 { border-color: rgba(233, 179, 255, 0.2); }
        .border-primary\\/30 { border-color: rgba(233, 179, 255, 0.3); }
        .border-primary\\/50 { border-color: rgba(233, 179, 255, 0.5); }
        .glass-card { background: rgba(28, 28, 30, 0.7); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05); }
        .shadow-\\[0_0_10px_\\#e9b3ff\\] { box-shadow: 0 0 10px #e9b3ff; }
        .shadow-\\[0_0_8px_\\#e9b3ff\\] { box-shadow: 0 0 8px #e9b3ff; }

        .rounded-full { border-radius: 9999px; }
        .rounded-xl { border-radius: 0.75rem; }
        .rounded-2xl { border-radius: 1rem; }
        .rounded-lg { border-radius: 0.5rem; }
        .transition-all { transition: all 0.3s ease; }
        .active\\:scale-95:active { transform: scale(0.95); }
        .hover\\:brightness-110:hover { filter: brightness(1.1); }
        .hover\\:border-primary\\/50:hover { border-color: rgba(233, 179, 255, 0.5); }
        .hover\\:bg-secondary\\/40:hover { background-color: rgba(255, 178, 183, 0.4); }
        .hover\\:underline:hover { text-decoration: underline; }
        .focus\\:border-primary\\/50:focus { border-color: rgba(233, 179, 255, 0.5); }
        .focus\\:outline-none:focus { outline: none; }
        .focus\\:ring-0:focus { outline: none; box-shadow: none; }
        .border-none { border: none; }
        .bg-transparent { background-color: transparent; }

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
        .gap-gutter { gap: 24px; }
        .space-y-md > * + * { margin-top: 24px; }
        .space-y-6 > * + * { margin-top: 1.5rem; }
        .space-y-4 > * + * { margin-top: 1rem; }
        .max-w-7xl { max-width: 80rem; }
        .max-w-4xl { max-width: 56rem; }
        .mx-auto { margin-left: auto; margin-right: auto; }
        .text-center { text-align: center; }
        .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
        .text-xs { font-size: 0.75rem; line-height: 1rem; }
        .text-\\[10px\\] { font-size: 10px; }
        .text-\\[18px\\] { font-size: 18px; }
        .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
        .uppercase { text-transform: uppercase; }
        .tracking-widest { letter-spacing: 0.1em; }
        .flex { display: flex; }
        .items-center { align-items: center; }
        .justify-between { justify-content: space-between; }
        .grid { display: grid; }
        .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
        .md\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .lg\\:grid-cols-12 { grid-template-columns: repeat(12, minmax(0, 1fr)); }
        .lg\\:col-span-8 { grid-column: span 8 / span 8; }
        .lg\\:col-span-4 { grid-column: span 4 / span 4; }
        .gap-4 { gap: 1rem; }
        .gap-3 { gap: 0.75rem; }
        .gap-2 { gap: 0.5rem; }
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
        .mb-lg { margin-bottom: 40px; }
        .mb-4 { margin-bottom: 1rem; }
        .mt-4 { margin-top: 1rem; }
        .mt-2 { margin-top: 0.5rem; }
        .mt-0\\.5 { margin-top: 0.125rem; }
        .mr-4 { margin-right: 1rem; }
        .-left-\\[5px\\] { left: -5px; }
        .top-0 { top: 0; }
        .absolute { position: absolute; }
        .relative { position: relative; }
        .inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
        .bg-gradient-to-br { background-image: linear-gradient(to bottom right, var(--tw-gradient-stops)); }
        .from-primary\\/10 { --tw-gradient-from: rgba(233, 179, 255, 0.1); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(233, 179, 255, 0)); }
        .to-transparent { --tw-gradient-to: transparent; }
        .blur-xl { filter: blur(24px); }
        .opacity-0 { opacity: 0; }
        .opacity-100 { opacity: 1; }
        .group-focus-within\\:opacity-100:focus-within { opacity: 1; }
        .duration-500 { transition-duration: 500ms; }
        .disabled\\:opacity-50:disabled { opacity: 0.5; }
        .disabled\\:cursor-not-allowed:disabled { cursor: not-allowed; }
        .object-cover { object-fit: cover; }
        .overflow-hidden { overflow: hidden; }
        .border-l-2 { border-left-width: 2px; }
        .pl-4 { padding-left: 1rem; }
        .pl-3 { padding-left: 0.75rem; }
        .border-l-2.border-primary\\/20 { border-color: rgba(233, 179, 255, 0.2); }
        .border-l-2.border-white\\/5 { border-color: rgba(255, 255, 255, 0.05); }
        .opacity-60 { opacity: 0.6; }

        @media (min-width: 768px) {
          .md\\:flex-row { flex-direction: row; }
          .md\\:ml-64 { margin-left: 16rem; }
          .md\\:px-margin-desktop { padding-left: 48px; padding-right: 48px; }
          .md\\:pb-8 { padding-bottom: 2rem; }
          .md\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
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