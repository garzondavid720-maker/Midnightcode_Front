import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function WelcomeModal() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem("nocturna_welcome_seen");
    if (seen) return;
    const timer = setTimeout(() => setShow(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const close = () => {
    localStorage.setItem("nocturna_welcome_seen", "1");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={close} />

      {/* Modal */}
      <div className="relative glass border border-primary/30 rounded-3xl p-8 md:p-10 max-w-md w-full shadow-2xl neon-glow">
        {/* Close */}
        <button onClick={close} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
          <span className="material-symbols-outlined">close</span>
        </button>

        {/* Content */}
        <div className="text-center">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 neon-glow">
            <span className="material-symbols-outlined text-primary text-3xl">nightlife</span>
          </div>

          <span className="inline-block px-3 py-1 rounded-full border border-primary/30 text-primary text-[10px] font-bold uppercase tracking-widest mb-4">
            ¡Bienvenido a NOCTURNA!
          </span>

          <h3 className="text-2xl md:text-3xl font-black text-white uppercase italic mb-3">
            ¿Primera vez aquí?
          </h3>

          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Crea tu cuenta <span className="text-white font-bold">gratis</span> y desbloquea reservas VIP,
            canciones en vivo y acceso anticipado a eventos exclusivos.
          </p>

          <div className="flex flex-col gap-3">
            <Link to="/register" onClick={close}>
              <button className="w-full bg-primary text-white py-4 rounded-xl font-black uppercase neon-glow hover:translate-y-[-2px] transition-all">
                Registrarme gratis
              </button>
            </Link>
            <Link to="/login" onClick={close}>
              <button className="w-full glass text-slate-400 py-3 rounded-xl font-bold text-sm hover:text-white hover:bg-white/5 transition-all border border-white/10">
                Ya tengo cuenta → Entrar
              </button>
            </Link>
            <button onClick={close} className="text-slate-600 text-xs hover:text-slate-400 transition-colors mt-1">
              Continuar sin registrarme
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
