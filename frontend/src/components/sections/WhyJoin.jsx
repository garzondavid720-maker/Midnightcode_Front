import { Link } from "react-router-dom";
import { useRef, useEffect, useState } from "react";

const BENEFITS = [
  {
    icon: "music_note",
    title: "Pide tu canción",
    desc: "Elige la música de la noche. Tus solicitudes suben a la cola del DJ en tiempo real.",
    color: "from-purple-600/20 to-transparent",
    border: "border-purple-500/30",
    iconColor: "text-purple-400",
  },
  {
    icon: "chair",
    title: "Mesa VIP garantizada",
    desc: "Reserva tu espacio exclusivo sin hacer fila. Atención premium desde el primer momento.",
    color: "from-pink-600/20 to-transparent",
    border: "border-pink-500/30",
    iconColor: "text-pink-400",
  },
  {
    icon: "confirmation_number",
    title: "Acceso anticipado",
    desc: "Entérate primero de los eventos especiales y asegura tu entrada antes que nadie.",
    color: "from-blue-600/20 to-transparent",
    border: "border-blue-500/30",
    iconColor: "text-blue-400",
  },
  {
    icon: "auto_awesome",
    title: "Tu historial de noches",
    desc: "Revive cada momento. Accede a tu historial de reservas, canciones y eventos.",
    color: "from-green-600/20 to-transparent",
    border: "border-green-500/30",
    iconColor: "text-green-400",
  },
];

export default function WhyJoin() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-24 px-6 bg-background-dark relative overflow-hidden">
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/5 blur-[150px] rounded-full" />

      <div className="max-w-7xl mx-auto relative z-10" ref={ref}>
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 rounded-full border border-primary/30 text-primary text-xs font-bold uppercase tracking-[0.3em] mb-4 glass">
            Únete a la experiencia
          </span>
          <h2 className="text-4xl md:text-6xl font-black text-white italic uppercase mb-4">
            ¿Por qué{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">
              registrarte?
            </span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Tu cuenta de NOCTURNA desbloquea todo el ecosistema de la noche.
            Gratis, siempre.
          </p>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          {BENEFITS.map((b, i) => (
            <div
              key={i}
              className={`glass p-6 rounded-2xl border ${b.border} bg-gradient-to-b ${b.color} hover:scale-105 transition-all duration-300 group`}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4 group-hover:bg-white/10 transition-all">
                <span className={`material-symbols-outlined text-2xl ${b.iconColor}`}>{b.icon}</span>
              </div>
              <h4 className="text-white font-black text-lg mb-2">{b.title}</h4>
              <p className="text-slate-400 text-sm leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link to="/register">
            <button className="bg-primary text-white px-12 py-4 rounded-xl font-black text-lg neon-glow uppercase hover:translate-y-[-2px] transition-all mr-4">
              Crear cuenta gratis
            </button>
          </Link>
          <Link to="/login">
            <button className="glass text-white px-8 py-4 rounded-xl font-bold text-sm uppercase hover:bg-white/10 transition-all border border-white/10">
              Ya tengo cuenta →
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
