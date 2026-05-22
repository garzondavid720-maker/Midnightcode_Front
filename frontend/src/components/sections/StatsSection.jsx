import { useState, useEffect, useRef } from "react";

function CountUp({ end, suffix = "", prefix = "", duration = 2000, decimals = 0 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const startTime = Date.now();
          const timer = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = eased * end;
            setCount(decimals > 0 ? parseFloat(current.toFixed(decimals)) : Math.floor(current));
            if (progress >= 1) clearInterval(timer);
          }, 16);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration, decimals]);

  return (
    <span ref={ref}>
      {prefix}{decimals > 0 ? count.toFixed(decimals) : count.toLocaleString()}{suffix}
    </span>
  );
}

const STATS = [
  { label: "Noches épicas", end: 10000, suffix: "+", color: "text-primary" },
  { label: "Artistas en escena", end: 500, suffix: "+", color: "text-purple-400" },
  { label: "Calificación media", end: 4.9, suffix: "★", decimals: 1, color: "text-yellow-400" },
  { label: "Años encendiendo la noche", end: 5, suffix: " años", color: "text-pink-400" },
];

export default function StatsSection() {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-16 px-6 bg-background-dark relative overflow-hidden">
      {/* Glow background */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[200px] bg-primary/10 blur-[100px] rounded-full" />

      <div className={`max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8 relative z-10 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        {STATS.map((s, i) => (
          <div key={i} className="text-center glass p-6 rounded-2xl border border-primary/10 hover:border-primary/30 transition-all">
            <p className={`text-4xl md:text-5xl font-black font-mono mb-2 ${s.color}`}>
              <CountUp end={s.end} suffix={s.suffix} decimals={s.decimals || 0} />
            </p>
            <p className="text-slate-400 text-sm uppercase tracking-widest font-bold">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
