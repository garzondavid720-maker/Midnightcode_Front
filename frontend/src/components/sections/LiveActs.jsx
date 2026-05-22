import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import publicApi from "../../services/publicApi";

const FALLBACK = [
  {
    id_evento: 1,
    nombre: "DJ ECLIPSE",
    dj: "Artista Principal",
    tag: "HOT",
    tagLabel: "Artista Principal / Viernes",
    imagen_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBifF5P0xvYyZBftuwJmumDGNYzpqx0gGxb8jb0b2txruFadLC3x3R2CcalR16U1cDPuPko8DK7sJlVtQFVmeqCvbqh6migcaRSbxPCipDOrok1HmYu2tJ4zxAp6ScoSkggSkk3bj9-iafqdv3RmmY2hzAoZCI1MpNLA4oJ6Lol0THyngf98LlcPoEQv7szUzr6paJnf24d5E2Ch-73MIrexybis2fH4Z0arLfFO-Cpt5kMZtsUh5gmQfoHC4dYIVdph7hbSRwUQTui",
    precio: 80000,
  },
  {
    id_evento: 2,
    nombre: "VALERIA VOID",
    dj: "Tech House",
    tag: "NEW",
    tagLabel: "Tech House / Sábado",
    imagen_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCRW5z3QKvvxc7E4rMXf-Yrbl2KNeKkioAhF56pZFhAisYHc8plvmSCX2cDRtGeyGGgzRfMcW87RnbvgHNrPWSByh1t3wNLvboxsfKH85X4O6uznSnMbQu6ZbwXz_MBK1MJFoWMh5cQGvm-ZPD2xQwI6FgtMkVWrT8prH_MZJcsFN_zgUUTpcbZ3m7McCzT2aM9HXuL2prI4XQ-GeQBgahH-hszK6aCRds_aHVomIB4K1-DPNPtp_-C-",
    precio: 65000,
  },
];

const TAG_COLORS = {
  "HOT":      "bg-orange-500",
  "NEW":      "bg-green-500",
  "SOLD OUT": "bg-red-500",
  "FEW LEFT": "bg-yellow-500",
};

export default function LiveActs() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    publicApi.get("/eventos")
      .then(({ data }) => {
        if (data.success && data.data?.length) {
          // Show upcoming events first, max 4
          const sorted = [...data.data]
            .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
            .slice(0, 4);
          setEvents(sorted);
        } else {
          setEvents(FALLBACK);
        }
      })
      .catch(() => setEvents(FALLBACK))
      .finally(() => setLoading(false));
  }, []);

  const display = events.length ? events : FALLBACK;

  const formatDate = (fecha) => {
    if (!fecha) return "";
    return new Date(fecha).toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" });
  };

  return (
    <section className="py-24 px-6 bg-background-dark/95" id="live-acts" ref={ref}>
      <div className="max-w-7xl mx-auto">
        <div className={`flex flex-col md:flex-row justify-between items-end mb-16 gap-6 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div>
            <h2 className="text-primary font-bold tracking-widest uppercase text-sm mb-2">
              Resonando Este Fin de Semana
            </h2>
            <h3 className="text-4xl md:text-6xl font-black text-white italic uppercase">
              Live Acts
            </h3>
          </div>
          <Link to="/register">
            <button className="text-white border-b border-primary pb-1 font-bold uppercase tracking-widest hover:text-primary transition-all">
              Ver Cartelera Completa →
            </button>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[1,2].map(i => <div key={i} className="h-[500px] rounded-3xl bg-white/5 animate-pulse" />)}
          </div>
        ) : (
          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 transition-all duration-700 delay-200 ${visible ? "opacity-100" : "opacity-0"}`}>
            {display.map((ev, i) => (
              <div key={ev.id_evento || i} className="relative h-[500px] rounded-3xl overflow-hidden group">
                <img
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  src={ev.imagen_url || `https://placehold.co/800x500/0d0d1a/BF00FF?text=${encodeURIComponent(ev.nombre)}`}
                  onError={e => { e.target.src = `https://placehold.co/800x500/0d0d1a/BF00FF?text=${encodeURIComponent(ev.nombre)}`; }}
                  alt={ev.nombre}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/20 to-transparent" />
                <div className="absolute bottom-10 left-10 right-10">
                  {ev.tag && (
                    <span className={`${TAG_COLORS[ev.tag] || "bg-primary"} text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase mb-3 inline-block`}>
                      {ev.dj ? `${ev.dj} · ` : ""}{ev.tag}
                    </span>
                  )}
                  {!ev.tag && ev.dj && (
                    <span className="bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase mb-3 inline-block">
                      {ev.dj}
                    </span>
                  )}
                  <h4 className="text-4xl md:text-5xl font-black text-white uppercase italic mb-2">{ev.nombre}</h4>
                  {ev.fecha && <p className="text-slate-300 text-sm font-mono mb-3">{formatDate(ev.fecha)}{ev.hora ? ` · ${ev.hora}` : ""}</p>}
                  <div className="flex items-center gap-4">
                    {ev.precio && (
                      <span className="text-primary font-black text-xl">
                        ${Number(ev.precio).toLocaleString("es-CO")}
                      </span>
                    )}
                    <Link to="/register">
                      <button className="bg-primary/90 hover:bg-primary text-white px-5 py-2 rounded-xl font-bold text-sm uppercase neon-glow transition-all">
                        Reservar entrada
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
