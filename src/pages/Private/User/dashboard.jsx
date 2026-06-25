import React, { useEffect } from "react";
import NavbarUsuario from "../../../components/Layout/NavbarUsuario";

const HomePageUser = () => {
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const heroBg = document.querySelector("section.relative > div:first-child");
      if (heroBg) {
        heroBg.style.transform = `translateY(${scrolled * 0.3}px)`;
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <NavbarUsuario />
      <main className="pt-20 md:ml-64 pb-24 md:pb-0 min-h-screen bg-[#050505]">
        {/* Hero Section */}
        <section className="relative h-[870px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent z-10"></div>
            <div className="absolute inset-0 bg-black/40 z-10"></div>
            <div
              className="w-full h-full bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA5q4mTKQuNUVvfeBkoOFiDsZjJwxBXbZMQ9JGMdqzQj3s0-wWuO1SkDyLWgwhbq5THlwdB0XagHfy5T1Oz6FGXQ3zf5z56gBeu0tMbjDbfjKgRJEBJdb3CH2YT4k_K1CSy_qb_Pq19vVOOwrhfrpTm5M4uqd2J_HgrsvXHY92rUM5j2mtwLnqflVOo8YYLVDzPmWRr2JIa6uBJk_SlsE20Uv0lIttd6xYKO36kVlztBvK2eJ9GA-yx65Jc05SYfN2cATXJT4lnlETV')",
              }}
            ></div>
          </div>
          <div className="relative z-20 text-center px-margin-mobile">
            <h2 className="font-display-lg text-display-lg md:text-7xl text-white mb-6 animate-pulse">
              Bienvenidos a <span className="text-primary italic">Midnight Code</span>
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-10">
              Tu destino para la mejor experiencia musical y nocturna. 
              Sumérgete en un ambiente exclusivo donde la luz y el sonido 
              se fusionan para crear momentos inolvidables.
            </p>
            {/* Botones eliminados */}
          </div>
          
        </section>
      </main>
      {/* Estilos de respaldo para la hero */}
      <style jsx>{`
        .bg-\\[\\#050505\\] { background-color: #050505; }
        .pt-20 { padding-top: 5rem; }
        .md\\:ml-64 { margin-left: 16rem; }
        .pb-24 { padding-bottom: 6rem; }
        .min-h-screen { min-height: 100vh; }
        .px-margin-mobile { padding-left: 16px; padding-right: 16px; }
        .font-display-lg { font-family: Montserrat, sans-serif; }
        .text-display-lg { font-size: 48px; line-height: 56px; letter-spacing: -0.02em; font-weight: 800; }
        .font-body-lg { font-family: Inter, sans-serif; }
        .text-body-lg { font-size: 18px; line-height: 28px; font-weight: 400; }
        .font-headline-md { font-family: Montserrat, sans-serif; }
        .text-headline-md { font-size: 24px; line-height: 32px; font-weight: 600; }
        .text-primary { color: #e9b3ff; }
        .text-on-surface-variant { color: #d2c1d4; }
        .text-on-primary { color: #510074; }
        .bg-primary { background-color: #e9b3ff; }
        .border-primary { border-color: #e9b3ff; }
        .hover\\:bg-primary\\/10:hover { background-color: rgba(233,179,255,0.1); }
        .shadow-\\[0_0_20px_rgba\\(233\\,179\\,255\\,0\\.4\\)\\] { box-shadow: 0 0 20px rgba(233,179,255,0.4); }
        .md\\:text-7xl { font-size: 72px; line-height: 1; }
        .animate-pulse { animation: pulse 2s cubic-bezier(0.4,0,0.6,1) infinite; }
        .animate-bounce { animation: bounce 1s infinite; }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.7; } }
        @keyframes bounce { 0%,100% { transform:translateY(-25%); animation-timing-function:cubic-bezier(0.8,0,1,1); } 50% { transform:translateY(0); animation-timing-function:cubic-bezier(0,0,0.2,1); } }
        .material-symbols-outlined { font-family:"Material Symbols Outlined"; font-weight:normal; font-style:normal; font-size:24px; line-height:1; letter-spacing:normal; text-transform:none; display:inline-block; white-space:nowrap; word-wrap:normal; direction:ltr; -webkit-font-feature-settings:"liga"; -webkit-font-smoothing:antialiased; }
        .transition-all { transition: all 0.15s ease; }
        .active\\:scale-95:active { transform: scale(0.95); }
        .rounded-xl { border-radius: 0.75rem; }
        .border-2 { border-width: 2px; }
        .px-8 { padding-left: 2rem; padding-right: 2rem; }
        .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
        .text-white { color: white; }
        .italic { font-style: italic; }
        .max-w-2xl { max-width: 42rem; }
        .mx-auto { margin-left: auto; margin-right: auto; }
        .mb-6 { margin-bottom: 1.5rem; }
        .mb-10 { margin-bottom: 2.5rem; }
        .gap-4 { gap: 1rem; }
        .flex-col { flex-direction: column; }
        .justify-center { justify-content: center; }
        .relative { position: relative; }
        .absolute { position: absolute; }
        .inset-0 { top:0; right:0; bottom:0; left:0; }
        .z-0 { z-index:0; }
        .z-10 { z-index:10; }
        .z-20 { z-index:20; }
        .bg-black\\/40 { background-color: rgba(0,0,0,0.4); }
        .bg-gradient-to-t { background-image: linear-gradient(to top, #050505, transparent, transparent); }
        .bg-cover { background-size: cover; }
        .bg-center { background-position: center; }
        .text-center { text-align: center; }
        .overflow-hidden { overflow: hidden; }
        .h-\\[870px\\] { height: 870px; }
        .flex { display: flex; }
        .items-center { align-items: center; }
        .bottom-10 { bottom: 2.5rem; }
        .left-1\\/2 { left: 50%; }
        .-translate-x-1\\/2 { transform: translateX(-50%); }
        .opacity-50 { opacity: 0.5; }
        .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
        @media (min-width: 768px) {
          .md\\:flex-row { flex-direction: row; }
        }
        /* Fondo negro global para evitar espacios blancos */
        body, html {
          background-color: #050505 !important;
          margin: 0;
          padding: 0;
        }
      `}</style>
    </>
  );
};

export default HomePageUser;