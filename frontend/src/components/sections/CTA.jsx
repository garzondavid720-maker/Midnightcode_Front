import { Link } from "react-router-dom";

export default function CTA() {
  return (
    <section className="py-32 px-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-primary/10 blur-[120px] rounded-full" />

      <div className="relative max-w-4xl mx-auto text-center glass p-12 md:p-20 rounded-[3rem] border border-primary/20">
        {/* Badge */}
        <span className="inline-block px-4 py-1 rounded-full border border-primary/30 text-primary text-xs font-bold uppercase tracking-[0.3em] mb-6">
          Acceso gratuito
        </span>

        <h2 className="text-4xl md:text-7xl font-black text-white uppercase italic mb-6">
          Tu noche{" "}
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-pink-500">
            empieza aquí
          </span>
        </h2>

        <p className="text-xl text-slate-300 mb-4 max-w-lg mx-auto">
          Únete a miles de personas que ya viven NOCTURNA de otra manera.
        </p>

        <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-400 mb-10">
          <span className="flex items-center gap-2">
            <span className="text-green-400">✓</span> Reservas VIP
          </span>
          <span className="flex items-center gap-2">
            <span className="text-green-400">✓</span> Canciones en vivo
          </span>
          <span className="flex items-center gap-2">
            <span className="text-green-400">✓</span> Eventos exclusivos
          </span>
          <span className="flex items-center gap-2">
            <span className="text-green-400">✓</span> 100% gratuito
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/register">
            <button className="bg-white text-background-dark px-12 py-5 rounded-full font-black uppercase hover:bg-primary hover:text-white transition-all neon-glow text-lg">
              Crear cuenta gratis
            </button>
          </Link>
          <Link to="/login">
            <button className="glass text-white px-8 py-5 rounded-full font-bold uppercase hover:bg-white/10 transition-all border border-white/20 text-sm">
              Ya tengo cuenta
            </button>
          </Link>
        </div>

        {/* Social proof mini */}
        <div className="mt-10 flex items-center justify-center gap-3">
          <div className="flex -space-x-2">
            {["A","B","C","D"].map((l, i) => (
              <div key={i} className={`w-8 h-8 rounded-full border-2 border-background-dark flex items-center justify-center text-[10px] font-black text-white ${["bg-purple-500","bg-pink-500","bg-blue-500","bg-green-500"][i]}`}>{l}</div>
            ))}
          </div>
          <p className="text-slate-400 text-sm">
            <span className="text-white font-bold">+1,200 personas</span> ya son parte de NOCTURNA
          </p>
        </div>
      </div>
    </section>
  );
}
