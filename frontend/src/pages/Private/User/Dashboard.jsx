// User Dashboard — datos reales desde API + Socket.io en tiempo real
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth }  from "../../../context/AuthContext";
import { useSongs } from "../../../context/SongContext";
import { io }       from "socket.io-client";
import api          from "../../../services/api";
import ReservationPage from "./Reservation";
import SongRequestPage from "./Songrequest";
import ProfilePage     from "./Profile";

const SOCKET_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace("/api", "")
  : "http://localhost:3000";

const TAG_COLORS = {
  "SOLD OUT": "bg-red-500/80 text-white",
  "HOT":      "bg-orange-500/80 text-white",
  "NEW":      "bg-green-400/80 text-black",
  "FEW LEFT": "bg-yellow-400/80 text-black",
};

const NAV_ITEMS = [
  { id: "dashboard",    label: "Dashboard",    icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" },
  { id: "songs",        label: "Canciones",    icon: "M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" },
  { id: "reservations", label: "Mis Reservas", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
  { id: "profile",      label: "Mi Perfil",    icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
];

function NavIcon({ d }) {
  return (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d={d} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

export default function UserDashboard({ initialPage }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { queued, playing } = useSongs();

  const [activePage,     setActivePage]     = useState(initialPage || "dashboard");
  const [activeNav,      setActiveNav]      = useState(initialPage || "dashboard");
  const [selectedEvent,  setSelectedEvent]  = useState(null);

  // ── Datos desde API ──────────────────────────────────────────────────────
  const [eventos,    setEventos]    = useState([]);
  const [reservas,   setReservas]   = useState([]);
  const [loadEvents, setLoadEvents] = useState(true);
  const [loadRes,    setLoadRes]    = useState(true);
  const socketRef = useRef(null);

  const fetchEventos = useCallback(async () => {
    try {
      setLoadEvents(true);
      const { data } = await api.get("/eventos");
      if (data.success) setEventos(data.data);
    } catch { /* sin eventos aún */ } finally { setLoadEvents(false); }
  }, []);

  const fetchReservas = useCallback(async () => {
    try {
      setLoadRes(true);
      const { data } = await api.get("/reservas/mis-reservas");
      if (data.success) setReservas(data.data);
    } catch { setReservas([]); } finally { setLoadRes(false); }
  }, []);

  useEffect(() => {
    fetchEventos();
    fetchReservas();
  }, [fetchEventos, fetchReservas]);

  // Socket: actualizar eventos en tiempo real cuando el admin crea/edita/elimina
  useEffect(() => {
    const token = localStorage.getItem("neon_token");
    if (!token) return;
    const socket = io(SOCKET_URL, { auth: { token }, transports: ["websocket", "polling"] });
    socketRef.current = socket;
    socket.on("actualizarEventos", () => fetchEventos());
    return () => { socket.disconnect(); socketRef.current = null; };
  }, [fetchEventos]);

  const handleLogout = () => { logout(); navigate("/login", { replace: true }); };

  const goTo = (page) => { setActivePage(page); setActiveNav(page); };

  const handleReserve = (evento) => {
    setSelectedEvent(evento);
    setActivePage("reserve");
    setActiveNav("");
  };

  const backToDash = () => { setActivePage("dashboard"); setActiveNav("dashboard"); fetchReservas(); };

  // Sub-pages
  if (activePage === "reserve")       return <ReservationPage event={selectedEvent} onBack={backToDash} />;
  if (activePage === "songs")         return <SongRequestPage onBack={backToDash} />;
  if (activePage === "profile")       return <ProfilePage user={user} onBack={backToDash} />;
  if (activePage === "reservations")  return (
    <div className="flex h-screen bg-black w-full overflow-hidden">
      <Sidebar user={user} activeNav={activeNav} goTo={goTo} handleLogout={handleLogout} />
      <main className="flex-1 overflow-y-auto p-8">
        <h2 className="font-orbitron font-black text-2xl text-white mb-6 uppercase tracking-widest">Mis Reservas</h2>
        {loadRes ? (
          <div className="space-y-3">{[...Array(3)].map((_,i) => <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />)}</div>
        ) : reservas.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 font-mono text-sm">No tienes reservas aún.</p>
            <button onClick={() => goTo("dashboard")} className="mt-4 px-5 py-2 bg-neon-purple text-black font-bold rounded-xl text-sm hover:bg-neon-magenta transition-all">
              Ver eventos disponibles
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {reservas.map(res => (
              <div key={res.id_reserva} className="glass-panel rounded-xl p-4 border border-white/10 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-neon-purple/15 border border-neon-purple/30 flex items-center justify-center flex-shrink-0">
                  <NavIcon d={NAV_ITEMS[2].icon} />
                </div>
                <div className="flex-1">
                  <p className="text-white font-bold">Mesa #{res.cod_mesa} · {res.cantidad_personas} personas</p>
                  <p className="text-gray-400 text-xs font-mono">
                    {new Date(res.fecha_reserva).toLocaleDateString("es-CO")} · {res.hora_reserva ? String(res.hora_reserva).slice(0,5) : ""}
                  </p>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                  res.estado === "Confirmada" ? "text-green-400 border-green-400/30 bg-green-500/5" :
                  res.estado === "Cancelada"  ? "text-red-400 border-red-400/30 bg-red-500/5"      :
                                               "text-yellow-400 border-yellow-400/30 bg-yellow-500/5"
                }`}>
                  {res.estado}
                </span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );

  // ── Dashboard principal ──────────────────────────────────────────────────
  const nextEvent = eventos[0] || null;

  return (
    <div className="flex h-screen bg-black w-full overflow-hidden">
      <Sidebar user={user} activeNav={activeNav} goTo={goTo} handleLogout={handleLogout} />

      <main className="flex-1 overflow-y-auto">
        {/* HEADER */}
        <header className="sticky top-0 z-10 bg-black/80 backdrop-blur border-b border-white/5 px-8 py-4 flex justify-between items-center">
          <div>
            <p className="text-gray-500 text-xs uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              Neon Overload Club
            </p>
            <h2 className="font-orbitron font-black text-xl text-white">
              Bienvenido, <span className="text-neon-purple">{user?.name?.split(" ")[0] || "Guest"}</span>
            </h2>
          </div>
          <div className="flex gap-3 items-center">
            <button onClick={() => goTo("songs")}
              className="flex items-center gap-2 px-4 py-2 bg-neon-purple/10 border border-neon-purple/30 text-neon-purple rounded-xl text-sm font-bold hover:bg-neon-purple/20 transition-all">
              ♫ Pedir canción
            </button>
            <button onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-bold hover:bg-red-500/20 transition-all lg:hidden">
              Salir
            </button>
          </div>
        </header>

        <div className="p-8">

          {/* HERO — solo si hay eventos */}
          {nextEvent ? (
            <section className="relative rounded-3xl overflow-hidden mb-8 h-60">
              {nextEvent.imagen_url ? (
                <img src={nextEvent.imagen_url} alt={nextEvent.nombre} className="w-full h-full object-cover brightness-[0.3]" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-neon-purple/30 via-black to-neon-magenta/20" />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/60 to-transparent" />
              <div className="absolute inset-0 flex items-center px-12">
                <div className="flex-1">
                  <p className="text-neon-purple text-xs tracking-widest uppercase mb-3 font-mono">Próximo Evento</p>
                  <h3 className="font-orbitron font-black text-4xl text-white mb-2 leading-tight uppercase">
                    {nextEvent.nombre}
                  </h3>
                  {nextEvent.dj && <p className="text-gray-400 text-sm mb-1 font-mono">{nextEvent.dj}</p>}
                  <p className="text-gray-500 text-xs font-mono mb-5">
                    {new Date(nextEvent.fecha).toLocaleDateString("es-CO", { day:"numeric", month:"long", year:"numeric" })}
                    {nextEvent.hora ? ` · ${nextEvent.hora}` : ""}
                  </p>
                  <button onClick={() => handleReserve(nextEvent)}
                    className="px-7 py-3 bg-neon-purple text-black font-black rounded-xl hover:bg-neon-magenta transition-all shadow-neon-glow text-sm uppercase tracking-widest">
                    Reservar ahora →
                  </button>
                </div>
                {playing && (
                  <div className="glass-panel rounded-2xl p-4 border border-neon-purple/30 max-w-48 hidden lg:block">
                    <p className="text-neon-purple text-xs uppercase tracking-widest mb-1 font-mono">▶ Sonando ahora</p>
                    <p className="text-white font-bold text-sm truncate">{playing.title}</p>
                    <p className="text-gray-400 text-xs font-mono">{playing.artist}</p>
                  </div>
                )}
              </div>
            </section>
          ) : !loadEvents && (
            <section className="relative rounded-3xl overflow-hidden mb-8 h-48 bg-gradient-to-br from-neon-purple/10 to-black border border-white/5 flex items-center justify-center">
              <div className="text-center">
                <p className="font-orbitron font-black text-2xl text-white/20 uppercase mb-2">Próximamente</p>
                <p className="text-gray-600 text-sm font-mono">El admin publicará los próximos eventos aquí</p>
              </div>
            </section>
          )}

          {/* STATS */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: "Eventos disponibles", value: loadEvents ? "…" : eventos.length, sub: "esta temporada" },
              { label: "Mis reservas",        value: loadRes   ? "…" : reservas.length, sub: "registradas" },
              { label: "Canciones en cola",   value: queued.length,                     sub: "esta noche" },
            ].map((s, i) => (
              <div key={i} className="glass-panel rounded-2xl p-5 border border-white/10">
                <p className="text-gray-500 text-xs uppercase tracking-widest mb-2 font-mono">{s.label}</p>
                <p className="font-orbitron font-black text-3xl text-white mb-1">{s.value}</p>
                <p className="text-neon-purple text-xs">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* EVENTOS */}
          <section className="mb-8">
            <div className="flex justify-between items-baseline mb-5">
              <h3 className="font-orbitron font-bold text-lg text-white uppercase tracking-wider">Próximos Eventos</h3>
              <span className="text-gray-500 text-xs font-mono">{eventos.length} evento{eventos.length !== 1 ? "s" : ""}</span>
            </div>

            {loadEvents ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {[...Array(3)].map((_,i) => <div key={i} className="h-56 bg-white/5 rounded-2xl animate-pulse" />)}
              </div>
            ) : eventos.length === 0 ? (
              <div className="glass-panel rounded-2xl p-12 border border-white/5 text-center">
                <p className="text-gray-500 text-sm font-mono">No hay eventos publicados por el momento.</p>
                <p className="text-gray-600 text-xs font-mono mt-1">Vuelve pronto — los verás aparecer aquí en tiempo real.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {eventos.map(ev => (
                  <div key={ev.id_evento}
                    className="glass-panel rounded-2xl overflow-hidden border border-white/10 hover:border-neon-purple/50 transition-all hover:-translate-y-1 cursor-pointer">
                    <div className="relative h-40">
                      {ev.imagen_url ? (
                        <img src={ev.imagen_url} alt={ev.nombre} className="w-full h-full object-cover brightness-75" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-neon-purple/20 to-neon-magenta/10 flex items-center justify-center">
                          <span className="font-orbitron font-black text-xl text-white/20 uppercase text-center px-4">{ev.nombre}</span>
                        </div>
                      )}
                      {ev.tag && (
                        <span className={`absolute top-3 right-3 text-[9px] font-black px-2 py-1 rounded-md ${TAG_COLORS[ev.tag] || "bg-neon-purple/80 text-black"}`}>
                          {ev.tag}
                        </span>
                      )}
                      <div className="absolute bottom-3 left-3 bg-black/70 rounded-lg px-3 py-1">
                        <p className="text-neon-purple text-[10px] font-mono">
                          {new Date(ev.fecha).toLocaleDateString("es-CO", { day:"numeric", month:"short" })}
                          {ev.hora ? ` · ${ev.hora}` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="text-white font-bold text-base mb-0.5">{ev.nombre}</h4>
                      {ev.dj && <p className="text-gray-400 text-xs font-mono mb-3">{ev.dj}</p>}
                      {ev.descripcion && <p className="text-gray-500 text-xs mb-3 line-clamp-2">{ev.descripcion}</p>}
                      <div className="flex justify-between items-center">
                        <span className="text-neon-purple font-orbitron font-bold">${Number(ev.precio).toLocaleString("es-CO")}</span>
                        <button onClick={() => handleReserve(ev)}
                          className="px-4 py-2 bg-neon-purple text-black font-black rounded-xl hover:bg-neon-magenta transition-all text-xs uppercase tracking-widest">
                          Reservar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* MIS RESERVAS — solo si tiene alguna */}
          {reservas.length > 0 && (
            <section className="mb-8">
              <div className="flex justify-between items-baseline mb-5">
                <h3 className="font-orbitron font-bold text-lg text-white uppercase tracking-wider">Mis Reservas Recientes</h3>
                <button onClick={() => goTo("reservations")} className="text-neon-purple text-xs font-mono hover:underline">Ver todas →</button>
              </div>
              <div className="space-y-3">
                {reservas.slice(0, 3).map(res => (
                  <div key={res.id_reserva}
                    className="glass-panel rounded-xl p-4 border border-white/10 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-neon-purple/15 border border-neon-purple/30 flex items-center justify-center flex-shrink-0">
                      <NavIcon d={NAV_ITEMS[2].icon} />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-bold">Mesa #{res.cod_mesa} · {res.cantidad_personas} personas</p>
                      <p className="text-gray-400 text-xs font-mono">
                        {new Date(res.fecha_reserva).toLocaleDateString("es-CO")}
                      </p>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                      res.estado === "Confirmada" ? "text-green-400 border-green-400/30 bg-green-500/5" :
                      res.estado === "Cancelada"  ? "text-red-400 border-red-400/30 bg-red-500/5"      :
                                                   "text-yellow-400 border-yellow-400/30 bg-yellow-500/5"
                    }`}>
                      {res.estado}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>
      </main>
    </div>
  );
}

// ── Sidebar reutilizable ──────────────────────────────────────────────────────
function Sidebar({ user, activeNav, goTo, handleLogout }) {
  return (
    <aside className="w-20 lg:w-64 bg-deep-charcoal border-r border-gray-800 flex flex-col items-center lg:items-start py-8 transition-all duration-300 flex-shrink-0">
      <div className="px-4 lg:px-6 mb-10 flex items-center gap-3 w-full justify-center lg:justify-start">
        <div className="w-10 h-10 bg-neon-purple rounded-lg flex items-center justify-center shadow-neon-glow animate-pulse-neon flex-shrink-0">
          <span className="font-orbitron font-black text-black text-xl">N</span>
        </div>
        <h1 className="hidden lg:block font-orbitron font-black text-lg tracking-tighter text-white whitespace-nowrap">
          <span className="text-neon-purple">MIDNIGHT</span>CODE
        </h1>
      </div>

      <nav className="flex-1 w-full px-2 lg:px-4 space-y-1">
        {NAV_ITEMS.map(item => (
          <button key={item.id} onClick={() => goTo(item.id)}
            className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all ${
              activeNav === item.id
                ? "bg-gradient-to-r from-neon-purple/20 to-transparent border-l-4 border-neon-purple text-neon-purple"
                : "text-gray-500 hover:text-white hover:bg-white/5 border-l-4 border-transparent"
            }`}>
            <NavIcon d={item.icon} />
            <span className="hidden lg:block font-bold text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-3 lg:p-4 border-t border-gray-800 w-full">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-neon-purple/20 border border-neon-purple/40 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {user?.avatar
              ? <img src={user.avatar} alt="" className="w-full h-full object-cover" />
              : <span className="text-neon-purple font-bold text-sm">{(user?.name || "U")[0].toUpperCase()}</span>
            }
          </div>
          <div className="hidden lg:flex flex-col flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{user?.name || "Usuario"}</p>
            <p className="text-xs text-neon-magenta uppercase tracking-widest">Cliente</p>
          </div>
          <button onClick={handleLogout} title="Cerrar sesión"
            className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-all flex-shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
