export default function Experience() {
  return (
    <section id="experience" className="py-24 px-6 relative bg-background-dark overflow-hidden">

      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[150px] rounded-full"></div>

      <div className="max-w-7xl mx-auto">

        <div className="mb-16">
          <h2 className="text-primary font-bold tracking-widest uppercase text-sm mb-2">
            El Ritual
          </h2>

          <h3 className="text-4xl md:text-6xl font-black text-white italic uppercase">
            La Experiencia
          </h3>
        </div>

        <div className="grid md:grid-cols-3 gap-8">

          <div className="glass p-8 rounded-2xl border border-primary/10 group hover:border-primary/40 transition-all">

            <div className="size-14 bg-primary/20 rounded-xl flex items-center justify-center mb-6 text-primary group-hover:bg-primary group-hover:text-white">
              <span className="material-symbols-outlined text-3xl">ac_unit</span>
            </div>

            <h4 className="text-2xl font-bold text-white mb-4">
              Ritmos Líquidos
            </h4>

            <p className="text-slate-400">
              Un sistema de sonido de alta fidelidad diseñado para que cada beat recorra tu cuerpo y despierte tus sentidos.
            </p>

          </div>

          <div className="glass p-8 rounded-2xl border border-primary/10 group hover:border-primary/40 transition-all md:translate-y-6">

            <div className="size-14 bg-primary/20 rounded-xl flex items-center justify-center mb-6 text-primary group-hover:bg-primary group-hover:text-white">
              <span className="material-symbols-outlined text-3xl">liquor</span>
            </div>

            <h4 className="text-2xl font-bold text-white mb-4">
              Servicio Elite
            </h4>

            <p className="text-slate-400">
              Atención premium y servicio de botellas con una selección exclusiva de licores cuidadosamente curados.
            </p>

          </div>

          <div className="glass p-8 rounded-2xl border border-primary/10 group hover:border-primary/40 transition-all">

            <div className="size-14 bg-primary/20 rounded-xl flex items-center justify-center mb-6 text-primary group-hover:bg-primary group-hover:text-white">
              <span className="material-symbols-outlined text-3xl">
                visibility
              </span>
            </div>

            <h4 className="text-2xl font-bold text-white mb-4">
              Inmersión Visual
            </h4>

            <p className="text-slate-400">
              Proyecciones LED en 360° y coreografías de láser que transforman cada momento en un espectáculo sensorial.
            </p>

          </div>

        </div>

      </div>
    </section>
  )
}
