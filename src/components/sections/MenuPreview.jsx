import { useRef, useEffect, useState } from "react";

const COCKTAILS = [
  {
    name: "Ultraviolet Fusion",
    desc: "Artisan Gin, Butterfly Pea, Lavender Mist, 24K Gold Flakes",
    price: 68000,
  },
  {
    name: "Neon Noir Old Fashioned",
    desc: "Smoked Japanese Whisky, Black Walnut Bitters, Activated Charcoal",
    price: 75000,
  },
  {
    name: "Electronic Zen",
    desc: "Veuve Clicquot, Yuzu Essence, Hibiscus Cloud, Shiso Infusion",
    price: 55000,
  },
];

const BOTTLES = [
  {
    name: "Ace of Spades Rosé",
    desc: "Armand de Brignac, Champagne, France (750ml)",
    price: 1850000,
  },
  {
    name: "Clase Azul Ultra",
    desc: "Extra Añejo Tequila, Hand-crafted Ceramic Decanter",
    price: 3500000,
  },
  {
    name: "Dom Pérignon P2",
    desc: "Vintage 2004, Plénitude 2, Magnum (1.5L)",
    price: 2200000,
  },
];

function formatCOP(price) {
  return `$${price.toLocaleString("es-CO")} COP`;
}

export default function MenuPreview() {
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
    <section className="py-24 px-6 relative bg-background-dark/80 overflow-hidden" id="menu">
      <div className="max-w-7xl mx-auto relative z-10" ref={ref}>

        <div className="text-center mb-16">
          <h2 className="text-primary font-bold tracking-widest uppercase text-sm mb-2">
            Liquidos Luxury
          </h2>
          <h3 className="text-4xl md:text-6xl font-black text-white italic uppercase">
            Vista del Menú
          </h3>
        </div>

        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>

          {/* Cocktails */}
          <div className="space-y-8">
            <h4 className="text-2xl font-black text-white uppercase italic border-b border-primary/30 pb-4 flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">local_bar</span>
              Cócteles de Autor
            </h4>

            <div className="space-y-6">
              {COCKTAILS.map((item, i) => (
                <div key={i} className="flex justify-between items-start group" style={{ transitionDelay: `${i * 80}ms` }}>
                  <div className="flex-1 pr-4">
                    <h5 className="text-lg font-bold text-white group-hover:text-primary transition-colors uppercase tracking-wider">
                      {item.name}
                    </h5>
                    <p className="text-slate-400 text-sm italic">{item.desc}</p>
                  </div>
                  <span className="text-primary font-black text-lg whitespace-nowrap">{formatCOP(item.price)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottles */}
          <div className="space-y-8">
            <h4 className="text-2xl font-black text-white uppercase italic border-b border-primary/30 pb-4 flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">wine_bar</span>
              Botellas de Prestigio
            </h4>

            <div className="space-y-6">
              {BOTTLES.map((item, i) => (
                <div key={i} className="flex justify-between items-start group" style={{ transitionDelay: `${i * 80}ms` }}>
                  <div className="flex-1 pr-4">
                    <h5 className="text-lg font-bold text-white group-hover:text-primary transition-colors uppercase tracking-wider">
                      {item.name}
                    </h5>
                    <p className="text-slate-400 text-sm italic">{item.desc}</p>
                  </div>
                  <span className="text-primary font-black text-lg whitespace-nowrap">{formatCOP(item.price)}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        <div className="mt-16 text-center">
          <button className="border border-primary text-primary px-8 py-3 rounded-full font-bold uppercase tracking-widest hover:bg-primary hover:text-white transition-all">
            Descargar Menu Completo
          </button>
        </div>

      </div>
    </section>
  );
}
