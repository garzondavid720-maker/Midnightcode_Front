// DJ Panel — mismo sistema visual que Admin (Tailwind + neon dark)
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth }  from "../../../context/AuthContext";
import { useSongs } from "../../../context/SongContext";

function NavIcon({ d }) {
  return (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d={d} strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
    </svg>
  );
}

function Equalizer() {
  return (
    <div className="flex items-end gap-0.5 h-5">
      {[0,1,2].map(i => (
        <div key={i} className="w-1 bg-neon-purple rounded-sm" style={{ animation:`djBar${i} 0.8s ease ${i*0.2}s infinite` }} />
      ))}
      <style>{`
        @keyframes djBar0{0%,100%{height:6px}50%{height:20px}}
        @keyframes djBar1{0%,100%{height:10px}50%{height:18px}}
        @keyframes djBar2{0%,100%{height:4px}50%{height:16px}}
      `}</style>
    </div>
  );
}

const TABS = [
  { id:"live",     label:"▶ En Vivo",   icon:"M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" },
  { id:"queue",    label:"Cola",        icon:"M4 6h16M4 12h16M4 18h16" },
  { id:"history",  label:"Historial",   icon:"M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
  { id:"rejected", label:"Rechazadas",  icon:"M6 18L18 6M6 6l12 12" },
];

export default function DJPanel() {
  const { user, logout }  = useAuth();
  const navigate          = useNavigate();
  const { queue, queued, playing, played, rejected, playSong, markPlayed, rejectSong, restoreSong } = useSongs();

  const [activeTab, setActiveTab] = useState("live");
  const [timer,     setTimer]     = useState(0);
  const [timerOn,   setTimerOn]   = useState(false);
  const [filter,    setFilter]    = useState("all");

  useEffect(() => {
    if (!timerOn) return;
    const id = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(id);
  }, [timerOn]);

  useEffect(() => {
    if (playing) setTimerOn(true);
    else { setTimerOn(false); setTimer(0); }
  }, [playing?.id]);

  const handleLogout = () => { logout(); navigate("/login", { replace: true }); };

  const fmt       = (s) => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
  const allGenres = ["all", ...new Set(queued.map(s => s.genre).filter(Boolean))];
  const filtered  = filter === "all" ? queued : queued.filter(s => s.genre === filter);
  const totalVotes = queue.reduce((acc, s) => acc + (s.votes || 0), 0);

  const currentTab = TABS.find(t => t.id === activeTab);

  return (
    <div className="flex h-screen bg-black w-full overflow-hidden">

      {/* ── SIDEBAR ── */}
      <aside className="w-20 lg:w-64 bg-deep-charcoal border-r border-gray-800 flex flex-col items-center lg:items-start py-8 transition-all duration-300 flex-shrink-0">
        {/* Logo */}
        <div className="px-4 lg:px-6 mb-10 flex items-center gap-3 w-full justify-center lg:justify-start">
          <div className="w-10 h-10 bg-neon-purple rounded-lg flex items-center justify-center shadow-neon-glow animate-pulse-neon flex-shrink-0">
            <span className="font-orbitron font-black text-black text-sm">DJ</span>
          </div>
          <div className="hidden lg:block">
            <p className="font-orbitron font-black text-sm text-white leading-tight">
              <span className="text-neon-purple">MIDNIGHT</span>CODE
            </p>
            <p className="text-neon-magenta text-[9px] uppercase tracking-widest font-mono">Panel DJ</p>
          </div>
        </div>

        {/* Avatar */}
        <div className="hidden lg:flex items-center gap-3 mx-4 p-3 mb-6 bg-neon-purple/5 rounded-xl border border-neon-purple/15 w-[calc(100%-2rem)]">
          <div className="w-9 h-9 rounded-full bg-neon-purple/20 border border-neon-purple/40 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {user?.avatar
              ? <img src={user.avatar} alt="" className="w-full h-full object-cover" />
              : <span className="text-neon-purple font-bold text-sm">{(user?.name || "D")[0].toUpperCase()}</span>}
          </div>
          <div className="min-w-0">
            <p className="text-white font-bold text-sm truncate">{user?.name}</p>
            <p className="text-neon-magenta text-[10px] font-mono">DJ · Live</p>
          </div>
        </div>

        {/* Nav tabs */}
        <nav className="flex-1 w-full px-2 lg:px-4 space-y-1">
          <p className="hidden lg:block text-gray-700 text-[9px] uppercase tracking-widest font-mono px-3 mb-3">Gestión</p>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-neon-purple/20 to-transparent border-l-4 border-neon-purple text-neon-purple"
                  : "text-gray-500 hover:text-white hover:bg-white/5 border-l-4 border-transparent"
              }`}>
              <NavIcon d={tab.icon} />
              <div className="hidden lg:block text-left">
                <p className={`font-bold text-sm ${activeTab === tab.id ? "text-white" : "text-gray-400"}`}>{tab.label}</p>
                <p className={`text-[10px] font-mono ${activeTab === tab.id ? "text-neon-purple" : "text-gray-600"}`}>
                  {tab.id === "live" ? `${queued.length} en cola` :
                   tab.id === "queue" ? `${queued.length} canciones` :
                   tab.id === "history" ? `${played.length} tocadas` :
                   `${rejected.length} rechazadas`}
                </p>
              </div>
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 lg:p-4 border-t border-gray-800 w-full">
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20">
            <NavIcon d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            <span className="hidden lg:block font-bold text-sm">Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="flex-1 overflow-y-auto flex flex-col">

        {/* Topbar */}
        <header className="sticky top-0 z-10 bg-black/80 backdrop-blur border-b border-white/5 px-8 py-4 flex justify-between items-center flex-shrink-0">
          <div>
            <p className="text-gray-500 text-xs uppercase tracking-widest flex items-center gap-2 font-mono mb-1">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              LIVE · Neon Overload
            </p>
            <h1 className="font-orbitron font-black text-2xl text-white uppercase tracking-wide">
              {currentTab?.label}
            </h1>
          </div>
          {/* Stats rápidas */}
          <div className="hidden lg:flex gap-4">
            {[
              { l:"En cola",     v: queued.length,   c:"text-neon-purple" },
              { l:"Votos",       v: totalVotes,       c:"text-neon-magenta" },
              { l:"Ya tocadas",  v: played.length,    c:"text-green-400" },
              { l:"Rechazadas",  v: rejected.length,  c:"text-red-400" },
            ].map((s,i) => (
              <div key={i} className="glass-panel rounded-xl px-4 py-2 border border-white/10 text-center">
                <p className="text-gray-500 text-[9px] uppercase tracking-widest font-mono mb-0.5">{s.l}</p>
                <p className={`font-orbitron font-black text-xl ${s.c}`}>{s.v}</p>
              </div>
            ))}
          </div>
        </header>

        <div className="flex-1 p-8">

          {/* ── NOW PLAYING ── */}
          {playing ? (
            <div className="glass-panel rounded-2xl p-6 border border-neon-purple/40 mb-8 flex items-center gap-6 bg-gradient-to-r from-neon-purple/10 to-transparent">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-neon-purple to-neon-magenta flex items-center justify-center flex-shrink-0">
                <Equalizer />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-neon-purple text-[10px] uppercase tracking-widest font-mono mb-1">▶ Sonando ahora · {fmt(timer)}</p>
                <p className="text-white font-orbitron font-black text-xl truncate">{playing.title}</p>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <span className="text-gray-400 text-sm font-mono">{playing.artist}</span>
                  <span className="text-[10px] px-2 py-0.5 bg-neon-purple/20 border border-neon-purple/40 text-neon-purple rounded-full font-bold">△ {playing.votes} votos</span>
                  {playing.genre && <span className="text-[10px] px-2 py-0.5 bg-white/5 border border-white/10 text-gray-400 rounded-full">{playing.genre}</span>}
                </div>
                {playing.message && (
                  <p className="text-gray-500 text-xs font-mono italic mt-1">"{playing.message}" — {playing.requestedBy}</p>
                )}
              </div>
              <div className="flex gap-3 flex-shrink-0">
                {queued.length > 0 && (
                  <button onClick={() => playSong(queued[0].id)}
                    className="px-4 py-2 bg-neon-purple/20 border border-neon-purple/40 text-neon-purple rounded-xl text-sm font-bold hover:bg-neon-purple/30 transition-all">
                    ⏭ Siguiente
                  </button>
                )}
                <button onClick={() => markPlayed(playing.id)}
                  className="px-4 py-2 bg-green-500/15 border border-green-500/30 text-green-400 rounded-xl text-sm font-bold hover:bg-green-500/25 transition-all">
                  ✓ Marcar tocada
                </button>
              </div>
            </div>
          ) : (
            <div className="glass-panel rounded-2xl p-6 border border-dashed border-white/10 mb-8 flex items-center gap-5">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl text-gray-700 flex-shrink-0">♫</div>
              <div className="flex-1">
                <p className="text-gray-500 text-sm font-mono">Sin canción sonando ahora</p>
                <p className="text-gray-700 text-xs font-mono">
                  {queued.length > 0 ? "Selecciona una canción para comenzar" : "Esperando peticiones del público"}
                </p>
              </div>
              {queued.length > 0 && (
                <button onClick={() => playSong(queued[0].id)}
                  className="px-5 py-2.5 bg-neon-purple text-black font-black rounded-xl hover:bg-neon-magenta transition-all shadow-neon-glow text-sm uppercase tracking-widest">
                  ▶ Poner más votada
                </button>
              )}
            </div>
          )}

          {/* ── EN VIVO / COLA ── */}
          {(activeTab === "live" || activeTab === "queue") && (
            <>
              {/* Filtros por género */}
              {allGenres.length > 1 && (
                <div className="flex gap-2 mb-5 flex-wrap">
                  {allGenres.map(g => (
                    <button key={g} onClick={() => setFilter(g)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                        filter === g
                          ? "border-neon-purple bg-neon-purple/15 text-neon-purple"
                          : "border-white/10 text-gray-500 hover:border-neon-purple/40 hover:text-neon-purple"
                      }`}>
                      {g === "all" ? "Todos" : g}
                    </button>
                  ))}
                </div>
              )}

              {filtered.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-gray-600 font-mono text-sm">Sin canciones en la cola</p>
                </div>
              ) : (
                <div className={activeTab === "queue"
                  ? "grid grid-cols-1 xl:grid-cols-2 gap-4"
                  : "flex flex-col gap-3"
                }>
                  {filtered.map((song, i) => (
                    <div key={song.id}
                      className="glass-panel rounded-2xl border border-white/8 hover:border-neon-purple/40 transition-all p-4 flex items-center gap-4">
                      {/* Rank / vote bar */}
                      <div className="flex flex-col items-center gap-1 flex-shrink-0 w-8">
                        <span className={`font-orbitron font-black text-sm ${i===0?"text-neon-purple":"text-gray-700"}`}>#{i+1}</span>
                        <div className="w-1 h-10 rounded-full bg-white/5 relative overflow-hidden">
                          <div className="absolute bottom-0 left-0 right-0 rounded-full bg-gradient-to-t from-neon-purple to-neon-magenta transition-all duration-500"
                            style={{ height:`${Math.min(100,(song.votes/Math.max(...filtered.map(s=>s.votes),1))*100)}%` }} />
                        </div>
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <p className="text-white font-bold text-sm truncate">{song.title}</p>
                          {i === 0 && <span className="text-[9px] px-1.5 py-0.5 bg-neon-purple/20 border border-neon-purple/40 text-neon-purple rounded font-black">TOP</span>}
                          {song.genre && <span className="text-[9px] px-1.5 py-0.5 bg-white/5 border border-white/10 text-gray-500 rounded">{song.genre}</span>}
                        </div>
                        <p className="text-gray-500 text-xs font-mono">{song.artist} · pedida por {song.requestedBy}</p>
                        {song.message && <p className="text-gray-600 text-xs italic mt-0.5 font-mono">"{song.message}"</p>}
                      </div>
                      {/* Votes */}
                      <div className="text-center flex-shrink-0 min-w-[48px]">
                        <p className="font-orbitron font-black text-xl text-neon-purple">{song.votes}</p>
                        <p className="text-gray-700 text-[9px] font-mono uppercase">votos</p>
                      </div>
                      {/* Actions */}
                      <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => playSong(song.id)}
                          className="px-3 py-2 bg-neon-purple text-black text-xs font-black rounded-xl hover:bg-neon-magenta transition-all">
                          ▶
                        </button>
                        <button onClick={() => rejectSong(song.id)}
                          className="px-3 py-2 bg-red-500/10 border border-red-500/25 text-red-400 text-xs font-bold rounded-xl hover:bg-red-500/20 transition-all">
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── HISTORIAL ── */}
          {activeTab === "history" && (
            <div className="flex flex-col gap-3 max-w-2xl">
              {played.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-gray-600 font-mono text-sm">Nada tocado aún esta noche</p>
                </div>
              ) : (
                [...played].reverse().map(song => (
                  <div key={song.id}
                    className="glass-panel rounded-xl border border-white/5 p-4 flex items-center gap-4 opacity-70">
                    <span className="text-green-400/50 font-mono text-sm w-5 flex-shrink-0">✓</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-400 font-bold text-sm truncate">{song.title}</p>
                      <p className="text-gray-600 text-xs font-mono">{song.artist} · {song.votes} votos</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 border border-green-400/30 text-green-400 rounded font-bold">TOCADA</span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ── RECHAZADAS ── */}
          {activeTab === "rejected" && (
            <div className="flex flex-col gap-3 max-w-2xl">
              {rejected.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-gray-600 font-mono text-sm">Sin canciones rechazadas</p>
                </div>
              ) : (
                rejected.map(song => (
                  <div key={song.id}
                    className="glass-panel rounded-xl border border-red-500/15 p-4 flex items-center gap-4">
                    <span className="text-red-400 font-mono text-sm w-5 flex-shrink-0">✕</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-400 font-bold text-sm truncate">{song.title}</p>
                      <p className="text-gray-600 text-xs font-mono">{song.artist} · {song.requestedBy}</p>
                      {song.message && <p className="text-gray-700 text-xs italic font-mono">"{song.message}"</p>}
                    </div>
                    <button onClick={() => restoreSong(song.id)}
                      className="px-3 py-2 bg-neon-purple/10 border border-neon-purple/25 text-neon-purple text-xs font-bold rounded-xl hover:bg-neon-purple/20 transition-all flex-shrink-0">
                      ↩ Restaurar
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
