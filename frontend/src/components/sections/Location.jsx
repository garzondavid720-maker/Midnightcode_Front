export default function Location() {
  return (
    <section id="location" className="py-24 px-6 bg-background-dark/90 relative">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* MAP */}
          <div className="order-2 lg:order-1">
            <div className="h-[450px] w-full rounded-3xl overflow-hidden border border-primary/20 neon-glow relative">
              <div className="absolute inset-0 bg-[#0a0a0c]">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBkB7ZkRZEob1Un9Choi3AoOyff_3gF4VDwqUn4Dve9-K77PgQGKxCZy3yrMd8BCZ4L17aGF06xjyjhzr8KBLfMIdSeOlb8WF1fEPN3W3SMIWSb7KfPtYSDAQ-5KKNkhiwePJgPOQWZJJNSCe-eGVE2t696T43t2xwolZ077sca6-mIBHooA5QLnZZZz_4cq3OkNIngEgZbYORMbtsfWWA9QaP6XXClanreeAjRRk17sutJjbc4r8OJztuSTvM8hO1cz_3cY05r"
                  className="w-full h-full object-cover opacity-40 grayscale contrast-125"
                  alt="Neo Tokyo Dark Map"
                />

                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent"></div>

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                  <span className="material-symbols-outlined text-primary text-5xl text-glow animate-pulse">
                    location_on
                  </span>
                  <span className="bg-primary text-white text-[10px] font-bold px-4 py-1 rounded-full uppercase tracking-widest mt-2 cursor-pointer">
                    Estas Aqui
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* INFO */}
          <div className="order-1 lg:order-2">
            <h2 className="text-primary font-bold tracking-widest uppercase text-sm mb-2">
              El Santuario
            </h2>

            <h3 className="text-4xl md:text-6xl font-black text-white italic uppercase mb-6">
              Monaco
            </h3>

            <div className="space-y-6">

              <p className="text-slate-300 text-lg leading-relaxed italic">
                "Ubicado en el corazón de la ciudad, Overload es un refugio oculto donde la música,
                las luces y la energía de la noche crean una experiencia única."
              </p>

              {/* ADDRESS */}
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-primary">
                  pin_drop
                </span>

                <div>
                  <h4 className="text-white font-bold uppercase tracking-wider">
                    Dirección
                  </h4>

                  <p className="text-slate-400">
                    Zona T, Calle 82 #12-45<br />
                    Bogotá, Colombia
                  </p>
                </div>
              </div>

              {/* HOURS */}
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-primary">
                  schedule
                </span>

                <div>
                  <h4 className="text-white font-bold uppercase tracking-wider">
                    Horarios
                  </h4>

                  <p className="text-slate-400">
                    Miércoles — Domingo: 10:00 PM - 5:00 AM  <br />
                    Cerrado Lunes y Martes
                  </p>
                </div>
              </div>

              {/* BUTTON */}
              <button className="bg-primary/20 border border-primary/40 text-white px-8 py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-primary transition-all">
                Obtener Dirrección
              </button>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
