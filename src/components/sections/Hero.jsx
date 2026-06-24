import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import publicApi from "../../services/publicApi";

export default function Hero() {
  const [offset,    setOffset]    = useState(0);
  const [countdown, setCountdown] = useState(null);
  const [statusBar, setStatusBar] = useState({ open: false, text: "" });

  // Parallax suave
  useEffect(() => {
    const onScroll = () => setOffset(window.scrollY * 0.4);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Estado abierto/cerrado
  useEffect(() => {
    const DAYS      = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
    const OPEN_DAYS = [3, 4, 5, 6, 0];
    const now       = new Date();
    const day       = now.getDay();
    const hour      = now.getHours();
    const isOpenDay  = OPEN_DAYS.includes(day);
    const isOpenHour = hour >= 22 || hour < 5;

    if (isOpenDay && isOpenHour) {
      setStatusBar({ open: true, text: `Abierto · ${DAYS[day]} · Puertas 10PM` });
    } else {
      let nextDay = (day + 1) % 7;
      let daysAhead = 1;
      while (!OPEN_DAYS.includes(nextDay)) { nextDay = (nextDay + 1) % 7; daysAhead++; }
      setStatusBar({ open: false, text: `Próxima apertura: ${DAYS[nextDay]}${daysAhead === 1 ? " mañana" : ""}` });
    }
  }, []);

  // Countdown al próximo evento
  useEffect(() => {
    let timer;
    publicApi.get("/eventos").then(({ data }) => {
      if (!data.success || !data.data?.length) return;
      const now      = new Date();
      const upcoming = data.data
        .filter(e => new Date(e.fecha) > now)
        .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
      if (!upcoming.length) return;
      const next   = upcoming[0];
      const target = new Date(next.fecha);
      const tick = () => {
        const diff = target - new Date();
        if (diff <= 0) { setCountdown(null); return; }
        setCountdown({
          label: next.nombre,
          days:  Math.floor(diff / 86400000),
          hours: Math.floor((diff % 86400000) / 3600000),
          mins:  Math.floor((diff % 3600000) / 60000),
          secs:  Math.floor((diff % 60000) / 1000),
        });
      };
      tick();
      timer = setInterval(tick, 1000);
    }).catch(() => {});
    return () => clearInterval(timer);
  }, []);

  const bars = Array.from({ length: 32 });

  return (
    <section
      id="hero"
      className="relative w-full flex flex-col items-center overflow-hidden"
      style={{ minHeight: "100svh" }}
    >
      {/* ── Fondo con parallax ── */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDvyU3ZUiG_yO08zTeWovuNZvrMsmOC3-hfKEyqjIZaaow73PJCKxT3cyWQxRD-sI05ldZMEkEQsXrx8XvP7MXtfuV49a3dDAdYOoWedvyx14jQto9zzdIktxteVuiyuTYBVbBO-gIstc6LRUSG1EMJ6tDIz9CWKQkv4goX8JKzhtGrbj04eCLcT7_viTgqoHb3yH2QLe8XrqVdHxjEhFFJYb2aDko1QmMo51fMxQ_GEuvT0BT8TSzAKKY_TYlfM34hBzhPizGM"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-50 scale-110 pointer-events-none select-none"
          style={{ transform: `scale(1.1) translateY(${offset * 0.3}px)`, transition: "transform 0.1s linear" }}
        />
        {/* Gradiente oscuro desde abajo */}
        <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/60 to-background-dark/20" />
        {/* Tinte de color primario muy sutil */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
      </div>

      {/* ── Contenido principal — ocupa todo el alto disponible ── */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 w-full px-4 pt-32 pb-36 text-center">

        {/* Badge de estado — ahora dentro del flujo, no absolute */}
        <div className="mb-6">
          <span className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest glass border ${
            statusBar.open
              ? "border-emerald-400/40 text-emerald-400"
              : "border-primary/30 text-primary"
          }`}>
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${statusBar.open ? "bg-emerald-400 status-dot" : "bg-primary animate-pulse"}`} />
            {statusBar.text}
          </span>
        </div>

        {/* Tagline */}
        <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-primary/70 mb-4">
          El Eclipse de la Vida Nocturna
        </p>

        {/* Título principal */}
        <h1 className="text-7xl sm:text-8xl md:text-[9rem] font-black leading-none tracking-tighter italic uppercase mb-6 text-white">
          SOBRECARGA{" "}
          <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400 text-glow">
            NEON
          </span>
        </h1>

        {/* Descripción */}
        <p className="text-slate-300 text-base md:text-lg max-w-xl mx-auto mb-8 font-light leading-relaxed">
          Entra a un universo donde la energía, la música y el lujo se fusionan.
          El santuario más exclusivo de la ciudad te espera.
        </p>

        {/* Countdown */}
        {countdown && (
          <div className="mb-8">
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mb-3">
              Próximo evento · {countdown.label}
            </p>
            <div className="flex justify-center gap-3">
              {[
                { val: countdown.days,  label: "Días"  },
                { val: countdown.hours, label: "Horas" },
                { val: countdown.mins,  label: "Min"   },
                { val: countdown.secs,  label: "Seg"   },
              ].map(({ val, label }) => (
                <div key={label} className="glass border border-primary/20 px-3 py-2.5 rounded-xl text-center min-w-[60px]">
                  <p className="text-2xl font-black text-primary font-mono tabular-nums">
                    {String(val).padStart(2, "0")}
                  </p>
                  <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/login">
            <button className="bg-primary hover:bg-primary/90 active:scale-95 text-white px-10 py-4 rounded-xl font-black text-base uppercase tracking-wide neon-glow transition-all duration-200">
              Reservar VIP
            </button>
          </Link>
          <Link to="/login">
            <button className="glass border border-white/10 hover:border-primary/40 hover:bg-primary/10 active:scale-95 text-white px-10 py-4 rounded-xl font-black text-base uppercase tracking-wide transition-all duration-200">
              Pedir Canción
            </button>
          </Link>
        </div>

      </div>

      {/* ── Scroll hint — separado del contenido, pegado al fondo ── */}
      <div className="relative z-10 pb-28 flex flex-col items-center gap-1.5 opacity-40 pointer-events-none select-none">
        <p className="text-[9px] uppercase tracking-[0.5em] text-slate-400">Desliza para sumergirte</p>
        <span className="material-symbols-outlined text-lg animate-bounce text-slate-400">keyboard_double_arrow_down</span>
      </div>

      {/* ── Visualizador de audio — borde inferior ── */}
      <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center gap-[2px] h-16 z-10 px-6 pointer-events-none">
        {bars.map((_, i) => (
          <div
            key={i}
            className="flex-1 max-w-[6px] rounded-t-full bar-anim opacity-50"
            style={{
              animationDelay: `${i * 0.06}s`,
              animationDuration: `${1.0 + (i % 5) * 0.15}s`,
              background:
                i % 3 === 0 ? "#c084fc"
                : i % 3 === 1 ? "#a855f7"
                : "rgba(255,255,255,0.2)",
              minHeight: "6px",
            }}
          />
        ))}
      </div>
    </section>
  );
}
