import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const NAV_LINKS = [
  { label: "Experience", href: "#experience" },
  { label: "Menu",       href: "#menu"       },
  { label: "Live Acts",  href: "#live-acts"  },
  { label: "Location",   href: "#location"   },
];

export default function Navbar() {
  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);

  // Cambiar fondo al hacer scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Cerrar menú móvil al cambiar tamaño
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const scrollTo = (href) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? "bg-background-dark/95 backdrop-blur-md border-b border-primary/10 shadow-lg shadow-black/30"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <span className="material-symbols-outlined text-primary text-3xl group-hover:drop-shadow-[0_0_8px_rgba(192,132,252,0.8)] transition-all">
              flare
            </span>
            <span className="text-xl font-black tracking-tighter text-white uppercase italic">
              Neon Overload
            </span>
          </Link>

          {/* Links — escritorio */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(({ label, href }) => (
              <button
                key={label}
                onClick={() => scrollTo(href)}
                className="text-sm font-semibold text-slate-300 hover:text-primary transition-colors uppercase tracking-widest"
              >
                {label}
              </button>
            ))}
            <Link
              to="/login"
              className="bg-primary hover:bg-primary/80 active:scale-95 text-white px-6 py-2.5 rounded-full font-bold text-sm transition-all neon-glow uppercase tracking-wider"
            >
              Login
            </Link>
          </div>

          {/* Hamburguesa — móvil */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-2 rounded-lg hover:bg-white/5 transition-colors"
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Menú"
          >
            <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${mobileOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${mobileOpen ? "opacity-0" : ""}`} />
            <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${mobileOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>

        </div>
      </nav>

      {/* Menú móvil — dropdown */}
      <div
        className={`fixed top-20 left-0 right-0 z-40 bg-background-dark/98 backdrop-blur-md border-b border-primary/10 transition-all duration-300 md:hidden overflow-hidden ${
          mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-6 py-6 flex flex-col gap-4">
          {NAV_LINKS.map(({ label, href }) => (
            <button
              key={label}
              onClick={() => scrollTo(href)}
              className="text-left text-base font-bold text-slate-200 hover:text-primary transition-colors uppercase tracking-widest py-2 border-b border-white/5"
            >
              {label}
            </button>
          ))}
          <Link
            to="/login"
            onClick={() => setMobileOpen(false)}
            className="mt-2 block text-center bg-primary hover:bg-primary/80 text-white px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wider neon-glow transition-all"
          >
            Login
          </Link>
        </div>
      </div>

      {/* Overlay oscuro cuando el menú móvil está abierto */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}
