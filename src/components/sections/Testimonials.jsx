import { useRef, useEffect, useState } from "react";

const REVIEWS = [
  {
    name: "Valentina Rodríguez",
    role: "Cliente VIP",
    avatar: "V",
    color: "bg-purple-500",
    stars: 5,
    text: "La mejor experiencia nocturna de Bogotá. La energía de la pista es única y el servicio VIP supera cualquier expectativa. Ya llevo 3 eventos y cada uno mejor que el anterior.",
  },
  {
    name: "Sebastián Torres",
    role: "Miembro desde 2023",
    avatar: "S",
    color: "bg-pink-500",
    stars: 5,
    text: "Pedir canciones desde la app es una locura. El DJ realmente las pone y la conexión con la música en vivo es increíble. Se nota que los organizadores viven la noche.",
  },
  {
    name: "Camila Jiménez",
    role: "Habitual los viernes",
    avatar: "C",
    color: "bg-blue-500",
    stars: 5,
    text: "Reservé mesa VIP para el cumpleaños de mi mejor amiga y todo fue perfecto. La atención, las luces, el sonido... NOCTURNA es otro nivel. ¡Volveremos siempre!",
  },
];

export default function Testimonials() {
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
    <section className="py-24 px-6 bg-background-dark relative overflow-hidden" ref={ref}>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-900/10 blur-[150px] rounded-full" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-primary font-bold tracking-widest uppercase text-sm mb-2">Reseñas</h2>
          <h3 className="text-4xl md:text-6xl font-black text-white italic uppercase">
            Lo que dicen{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">
              ellos
            </span>
          </h3>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          {REVIEWS.map((r, i) => (
            <div
              key={i}
              className="glass p-6 rounded-2xl border border-primary/10 hover:border-primary/30 transition-all"
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: r.stars }).map((_, s) => (
                  <span key={s} className="text-yellow-400 text-lg">★</span>
                ))}
              </div>

              {/* Quote */}
              <p className="text-slate-300 text-sm leading-relaxed mb-6 italic">
                "{r.text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${r.color} flex items-center justify-center font-black text-white`}>
                  {r.avatar}
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{r.name}</p>
                  <p className="text-slate-500 text-xs">{r.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
