import React, { useEffect, useState } from "react";
import NavbarUsuario from "../../../components/Layout/NavbarUsuario";

const HomePageUser = () => {
  const [progress, setProgress] = useState(45);

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

  // Simular progreso de la barra
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => (prev < 99 ? prev + 0.5 : 45));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <NavbarUsuario />
      <main className="min-h-screen bg-[#050505] pt-20">
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
          <div className="relative z-20 text-center px-4 md:px-8">
            <h2 className="font-display-lg text-display-lg md:text-7xl text-white mb-6 animate-pulse">
              Bienvenidos a <span className="text-primary italic">Midnight Code</span>
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-10">
              Tu destino para la mejor experiencia musical y nocturna. 
              Sumérgete en un ambiente exclusivo donde la luz y el sonido 
              se fusionan para crear momentos inolvidables.
            </p>
          </div>
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 animate-bounce opacity-50">
            <span className="material-symbols-outlined text-white text-3xl">keyboard_double_arrow_down</span>
          </div>
        </section>

        {/* Tonight's Lineup */}
        <section className="py-12 px-4 md:px-8 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 glass-card p-6 rounded-xl neon-glow-primary relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1/2 h-1 bg-primary"></div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-primary font-label-md tracking-widest flex items-center gap-2 mb-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                    </span>
                    EN VIVO
                  </span>
                  <h3 className="font-headline-lg text-headline-lg text-white">DJ KINETIC</h3>
                </div>
                <div className="text-right">
                  <p className="text-on-surface-variant font-label-md">Main Stage</p>
                  <p className="text-white font-headline-md">Midnight - 03:00</p>
                </div>
              </div>
              <div className="mb-8">
                <div className="flex justify-between mb-2">
                  <span className="text-on-surface-variant font-label-md">Set Progress</span>
                  <span className="text-primary font-label-md">{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-primary to-secondary h-full rounded-full transition-all duration-1000" 
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  ></div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 border-2 border-primary">
                  <img
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAfFCGStpd0JRe8-m7RpMqdlgCdNVrpA5ZlDoiBQAxUFhMjHywqWeF0EyAjfjInGwX-bdS_J2Izkr9WPmod-3JTavq1KNC7JjTqA83_r9ibcYzgRzIyGd3X_-VbRsK-NX41XHM-RqVg7eNYnyEogya2pUqzLxgsAIWjp3g0NbUPVpKeiX84PRirP-BZPOXYjzvQWNz4vkso_RlUPxjqbyu3koLAiVBO8dOLpqh2CYcCuuoa-U5ZNZsxVpBprw5vpeigqB7jmtBN_92n"
                    alt="DJ Kinetic"
                  />
                </div>
                <div>
                  <p className="text-white font-headline-md">Pulse Resonance Vol. 4</p>
                  <p className="text-on-surface-variant text-sm">Next: Luna Ray (03:00)</p>
                </div>
              </div>
            </div>
            <div className="md:w-1/3 glass-card p-6 rounded-xl flex flex-col justify-center text-center">
              <span className="material-symbols-outlined text-primary text-5xl mb-4">music_note</span>
              <h3 className="font-headline-md text-headline-md text-white mb-2">Vibe Control</h3>
              <p className="text-on-surface-variant mb-6">
                Want to hear your favorite track? Connect to the Pulse network and send a request directly to the booth.
              </p>
              <button className="bg-white/5 border border-white/10 text-on-surface py-3 rounded-lg hover:bg-white/10 transition-colors font-label-md">
                Request a Song
              </button>
            </div>
          </div>
        </section>

        {/* Trending Menu */}
        <section className="py-12 bg-surface-container-lowest">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="mb-6">
              <h2 className="font-headline-lg text-headline-lg text-white">Trending Tonight</h2>
              <p className="text-on-surface-variant">Most ordered at the main bar</p>
            </div>
            <div className="flex gap-6 overflow-x-auto hide-scrollbar pb-4">
              {[
                {
                  name: "Neon Pulse",
                  price: "$18",
                  desc: "Vodka, Blue Curacao, Lychee, and our signature Electric Syrup.",
                  img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDtf8pjMO1o3-6z-Q7adJFupxYL1ZGfYCjD82lzYtPbK67iiXNAfmkJXGh7BEbdEa_tSeggVqS6eHII68wgBVE1N3MtWLvYGIQtFwgAXBDeh677AV_R0hPnBuCT35oDh6QIxaYtBuyrII2s2EsbE3nFSQvbC7DE493do10ExnNx8kVPBw_91xtBk35sMRY5ZkSF15Li4_7_aCaB6rQeGudco19Czcx4SjnAVuNbmk8PGSaS3GdtUNJnbu7eXSdObEwZi8Az4I79cnZw"
                },
                {
                  name: "Ace of Spades",
                  price: "$750",
                  desc: "Premium Armand de Brignac Brut Gold. Includes VIP sparkler service.",
                  img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDEbU3r8LABZZ5oClFBz_HXaodfJJV_OXMqmlp8_u74K1jlzWYGuQgU2s7IvSs2Hmid0GGLw-rsxZx6XBtwNkzDbZuQIpWm8tUEk1esfFwXpzc7KtC9ONlYw-zfNZ0k1f474OLeWG08qTzSNs8x52gGzzkAACE3ko_n-QPw7-uSLgAZdFH4puPhauY-36bmMNbWwuZlmscgjAzxpJe3Pf0cgLwynqOtFN-tie6MRfUA4CttEu4YEVBxtiO4EPURJc1bcvuIrPqAIlyL"
                },
                {
                  name: "Midnight Smoke",
                  price: "$22",
                  desc: "Mezcal, Black Cherry, Smoked Thyme, and Citrus Zest.",
                  img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBUeVQ5v8XLkBZSo147sbru6Ymd-pbCbm0sChmWuYrmzWlAHifYvXk_kQhT3upckPzXzvDLi9-uz9GS_rYLExOhb3tXF7O2eANTYEppO9O9A57hy_0ofBoQmif4qK7jx8RiWvmhk6oauwInc2vJAFo7p4hF0RSW-sfNgUUHnvdTmOKneRL9W9DFPzyb_tBNQNrOxwNlnJeydhRiZLR9nsyYZw04gETPEuB2cYvj-BpZEoJ4U0K-bygCBTispdCqZlOy2oqCxUnbAGAn"
                },
                {
                  name: "Gravity Drop",
                  price: "$12",
                  desc: "A double-layered shot designed to spark the senses. Sweet & tart.",
                  img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBwqURoTnhDY_rsjCH0ocQ4EymHGJ9t1RJi6b2GjQoffcGd6Flt4aAmuro534SpH0lZWs8w8HZu48X2KWQf58uowwcqlEyeiPdeuusGx3J8bZsLUECMC4f2dXHibRC58nv7QKNoMGyhUk0I0pnhvhBc2-WeS_59tHsCD772LrPyYb-IIKOlxhV9IZsWqkgpmeI6cDCST32RG6EeuvJZ0efjuno2oTPZRFs6L5t0S4XpVfVM9wtIWgYkys-7vE-gUyxKgmJM1N4YPMYs"
                }
              ].map((item, idx) => (
                <div key={idx} className="min-w-[280px] glass-card p-4 rounded-xl flex flex-col gap-4 group">
                  <div className="relative h-48 rounded-lg overflow-hidden">
                    <img
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      src={item.img}
                      alt={item.name}
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-headline-md text-white">{item.name}</h4>
                      <span className="text-primary font-bold">{item.price}</span>
                    </div>
                    <p className="text-on-surface-variant text-sm line-clamp-2">{item.desc}</p>
                  </div>
                  <button className="w-full py-2 bg-primary/20 text-primary border border-primary/30 rounded-lg hover:bg-primary transition-colors hover:text-on-primary">
                    Quick Add
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Upcoming Nights */}
        <section className="py-12 px-4 md:px-8 max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-white">Upcoming Nights</h2>
              <p className="text-on-surface-variant">Don't miss out on the pulse</p>
            </div>
            <a className="text-primary font-label-md flex items-center gap-1 group" href="#">
              All Events
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                date: "FRI, OCT 20",
                title: "Cyber Resonance",
                desc: "Techno Protocol [LIVE SET]",
                img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAx8zYOu6j6h-OqsG1wdoPXDwg-P8EI1zEFzOeYC683IxeVVd6rokdhYGy_aqbL4yEXSjAty-lZqn_wzKx2sv7HIiX3os30qZDtriWNZ_EQTwjajcpo4gbW0MRuFXn4AwVIA85jhKdL1_detx4oMc92k0Xhzjjmb3Sy7yiUuoHkJfma5dJWA0pyxPM5hdAr74XLnSszMx2r-z-lLgH08leSTQzUNDJrkgwiLxMh_6NDo2bRTmxL_XqbtzwmGFfWbt7VUtCtj1lKSZbX"
              },
              {
                date: "SAT, OCT 21",
                title: "Velvet Aura",
                desc: "Soulful House Collective",
                img: "https://lh3.googleusercontent.com/aida-public/AB6AXuB-DlwKqNujDDekBNLWGMWnCm40ylpGxjjFTg6LPLF9WScPh8yspfSn95DBOjHMISrNjNwPpSJb546vujT_qcszjdH8aY3LC4wfQeenff4R9Alasv-hHVW_iHpaPfSnubDEyFJ6txnbE3X17iDPDeZz0PlPPgUIEGVm37fwUS_L3_V01jafshq89LqZVYoLNckNfW9mjU9G3JcBSvC_qD04EWQNTVM_ff1nOViKXMuWSMpbVt-qxXObyQn6OA6UkSdxvPVEYabjqUkb"
              },
              {
                date: "SUN, OCT 22",
                title: "Electric Sundays",
                desc: "Weekly Resident Takeover",
                img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAPW2MHj3XUHBV0RTVETQa489Aa1ZL3StQ8QqYDWOlAFJn7tHvyvO8fKk6WMqGPKbI6VpB8gC2Oa5KSN4GWIVInZyKm26OrmMP3liY3TRrQHaAjDr3YymhPNtkJysQOzj2lnGi5F3BmVhKlVkWcONzpNiWrOISxtlI1_IV1qbnwu7hzyUCmbDx41Zl255R7P008m8G5W-33slx3vRt7cFkNJ1ZgTpQgMKpTpC5XYj8sB-xazpxTztCcLaDQ1LTXq_4WtrlujDKtSf1p"
              }
            ].map((event, idx) => (
              <div key={idx} className="glass-card rounded-xl overflow-hidden group">
                <div className="relative h-64 overflow-hidden">
                  <div className="absolute top-4 left-4 z-20 bg-primary text-on-primary px-3 py-1 rounded font-bold text-sm">
                    {event.date}
                  </div>
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    src={event.img}
                    alt={event.title}
                  />
                </div>
                <div className="p-6">
                  <h4 className="font-headline-md text-headline-md text-white mb-2">{event.title}</h4>
                  <div className="flex items-center gap-2 text-on-surface-variant text-sm mb-4">
                    <span className="material-symbols-outlined text-primary text-base">person</span>
                    {event.desc}
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 bg-white/5 border border-white/10 py-2 rounded font-label-md hover:bg-white/10">
                      Guestlist
                    </button>
                    <button className="flex-1 bg-primary text-on-primary py-2 rounded font-label-md hover:brightness-110">
                      VIP Tables
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-surface-container-lowest border-t border-white/5 pt-12 pb-8 px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="md:col-span-2">
                <h2 className="font-headline-md text-headline-md font-bold tracking-tighter text-primary mb-4">Afterdark Pulse</h2>
                <p className="text-on-surface-variant max-w-sm mb-6">
                  The definitive nightlife destination. Redefining the frequency of the night through immersive sound and visual architecture.
                </p>
                <div className="flex gap-4">
                  <a className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary transition-colors" href="#">
                    <span className="material-symbols-outlined text-white">share</span>
                  </a>
                  <a className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary transition-colors" href="#">
                    <span className="material-symbols-outlined text-white">camera_alt</span>
                  </a>
                  <a className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary transition-colors" href="#">
                    <span className="material-symbols-outlined text-white">video_library</span>
                  </a>
                </div>
              </div>
              <div>
                <h5 className="text-white font-headline-md mb-4">Explore</h5>
                <ul className="space-y-2 text-on-surface-variant">
                  <li><a className="hover:text-primary transition-colors" href="#">Tonight</a></li>
                  <li><a className="hover:text-primary transition-colors" href="#">Floor Plan</a></li>
                  <li><a className="hover:text-primary transition-colors" href="#">Drink Menu</a></li>
                  <li><a className="hover:text-primary transition-colors" href="#">Privacy Policy</a></li>
                </ul>
              </div>
              <div>
                <h5 className="text-white font-headline-md mb-4">Visit Us</h5>
                <p className="text-on-surface-variant mb-2">1024 Neon District Ave,<br/>Metropolis City, 90210</p>
                <p className="text-primary">Doors open at 10:00 PM</p>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-white/5 text-center text-on-surface-variant text-sm">
              © 2023 Afterdark Pulse Management Group. All nights reserved.
            </div>
          </div>
        </footer>
      </main>

      {/* ===== ESTILOS DE RESPALDO ===== */}
      <style jsx>{`
        /* Estilos base y reutilizables */
        .bg-\\[\\#050505\\] { background-color: #050505; }
        .bg-surface-container-lowest { background-color: #0e0e0e; }
        .pt-20 { padding-top: 5rem; }
        .min-h-screen { min-height: 100vh; }

        .max-w-7xl { max-width: 80rem; }
        .mx-auto { margin-left: auto; margin-right: auto; }
        .px-4 { padding-left: 1rem; padding-right: 1rem; }
        .md\\:px-8 { padding-left: 2rem; padding-right: 2rem; }
        .py-12 { padding-top: 3rem; padding-bottom: 3rem; }
        .pb-8 { padding-bottom: 2rem; }
        .pt-12 { padding-top: 3rem; }
        .mb-6 { margin-bottom: 1.5rem; }
        .mb-8 { margin-bottom: 2rem; }
        .mb-4 { margin-bottom: 1rem; }
        .mb-2 { margin-bottom: 0.5rem; }
        .gap-6 { gap: 1.5rem; }
        .gap-4 { gap: 1rem; }
        .gap-2 { gap: 0.5rem; }
        .gap-1 { gap: 0.25rem; }
        .flex { display: flex; }
        .flex-col { flex-direction: column; }
        .items-center { align-items: center; }
        .justify-between { justify-content: space-between; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .overflow-hidden { overflow: hidden; }
        .relative { position: relative; }
        .absolute { position: absolute; }
        .inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
        .z-0 { z-index: 0; }
        .z-10 { z-index: 10; }
        .z-20 { z-index: 20; }
        .bottom-10 { bottom: 2.5rem; }
        .left-1\\/2 { left: 50%; }
        .-translate-x-1\\/2 { transform: translateX(-50%); }
        .opacity-50 { opacity: 0.5; }
        .w-full { width: 100%; }
        .h-full { height: 100%; }
        .h-\\[870px\\] { height: 870px; }
        .w-16 { width: 4rem; }
        .h-16 { height: 4rem; }
        .w-10 { width: 2.5rem; }
        .h-10 { height: 2.5rem; }
        .flex-1 { flex: 1; }
        .shrink-0 { flex-shrink: 0; }

        .bg-black\\/40 { background-color: rgba(0, 0, 0, 0.4); }
        .bg-white\\/10 { background-color: rgba(255, 255, 255, 0.1); }
        .bg-white\\/5 { background-color: rgba(255, 255, 255, 0.05); }
        .bg-primary\\/20 { background-color: rgba(233, 179, 255, 0.2); }
        .bg-primary { background-color: #e9b3ff; }
        .bg-gradient-to-t { background-image: linear-gradient(to top, #050505, transparent, transparent); }
        .bg-cover { background-size: cover; }
        .bg-center { background-position: center; }
        .border-white\\/10 { border-color: rgba(255, 255, 255, 0.1); }
        .border-white\\/5 { border-color: rgba(255, 255, 255, 0.05); }
        .border-primary { border-color: #e9b3ff; }
        .border-primary\\/30 { border-color: rgba(233, 179, 255, 0.3); }
        .border-2 { border-width: 2px; }
        .border-t { border-top-width: 1px; }
        .rounded-xl { border-radius: 0.75rem; }
        .rounded-full { border-radius: 9999px; }
        .rounded-lg { border-radius: 0.5rem; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

        .glass-card {
          background: rgba(28, 28, 30, 0.7);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
        }
        .glass-card:hover {
          border-color: rgba(233, 179, 255, 0.5);
          box-shadow: 0 0 20px rgba(233, 179, 255, 0.15);
        }
        .neon-glow-primary {
          box-shadow: 0 0 12px rgba(233, 179, 255, 0.3);
        }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        .font-display-lg { font-family: Montserrat, sans-serif; font-size: 48px; line-height: 56px; letter-spacing: -0.02em; font-weight: 800; }
        .text-display-lg { font-size: 48px; line-height: 56px; letter-spacing: -0.02em; font-weight: 800; }
        .font-body-lg { font-family: Inter, sans-serif; font-size: 18px; line-height: 28px; font-weight: 400; }
        .text-body-lg { font-size: 18px; line-height: 28px; font-weight: 400; }
        .font-headline-lg { font-family: Montserrat, sans-serif; font-size: 32px; line-height: 40px; letter-spacing: -0.01em; font-weight: 700; }
        .text-headline-lg { font-size: 32px; line-height: 40px; letter-spacing: -0.01em; font-weight: 700; }
        .font-headline-md { font-family: Montserrat, sans-serif; font-size: 24px; line-height: 32px; font-weight: 600; }
        .text-headline-md { font-size: 24px; line-height: 32px; font-weight: 600; }
        .font-label-md { font-family: Inter, sans-serif; font-size: 14px; line-height: 20px; letter-spacing: 0.05em; font-weight: 600; }
        .text-label-md { font-size: 14px; line-height: 20px; letter-spacing: 0.05em; font-weight: 600; }
        .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
        .text-xs { font-size: 0.75rem; line-height: 1rem; }
        .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
        .text-5xl { font-size: 3rem; line-height: 1; }

        .text-primary { color: #e9b3ff; }
        .text-on-surface { color: #e5e2e1; }
        .text-on-surface-variant { color: #d2c1d4; }
        .text-white { color: #ffffff; }
        .text-on-primary { color: #510074; }
        .italic { font-style: italic; }
        .tracking-widest { letter-spacing: 0.1em; }
        .uppercase { text-transform: uppercase; }
        .font-bold { font-weight: 700; }
        .max-w-2xl { max-width: 42rem; }
        .max-w-sm { max-width: 24rem; }
        .mx-auto { margin-left: auto; margin-right: auto; }
        .mb-10 { margin-bottom: 2.5rem; }
        .mb-6 { margin-bottom: 1.5rem; }
        .mb-4 { margin-bottom: 1rem; }
        .mb-2 { margin-bottom: 0.5rem; }
        .mt-2 { margin-top: 0.5rem; }

        .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        .animate-bounce { animation: bounce 1s infinite; }
        .animate-ping { animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite; }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.7; } }
        @keyframes bounce { 0%,100% { transform:translateY(-25%); animation-timing-function:cubic-bezier(0.8,0,1,1); } 50% { transform:translateY(0); animation-timing-function:cubic-bezier(0,0,0.2,1); } }
        @keyframes ping { 0% { transform:scale(1); opacity:1; } 75%,100% { transform:scale(2); opacity:0; } }

        .transition-all { transition: all 0.3s ease; }
        .duration-500 { transition-duration: 500ms; }
        .duration-1000 { transition-duration: 1000ms; }
        .group-hover\\:translate-x-1:hover .group { transform: translateX(4px); }
        .group-hover\\:scale-105:hover .group { transform: scale(1.05); }
        .group-hover\\:scale-110:hover .group { transform: scale(1.1); }
        .hover\\:bg-primary:hover { background-color: #e9b3ff; }
        .hover\\:bg-white\\/5:hover { background-color: rgba(255,255,255,0.05); }
        .hover\\:bg-white\\/10:hover { background-color: rgba(255,255,255,0.1); }
        .hover\\:bg-primary\\/10:hover { background-color: rgba(233,179,255,0.1); }
        .hover\\:brightness-110:hover { filter: brightness(1.1); }
        .hover\\:text-primary:hover { color: #e9b3ff; }
        .active\\:scale-95:active { transform: scale(0.95); }

        .material-symbols-outlined {
          font-family: "Material Symbols Outlined";
          font-weight: normal;
          font-style: normal;
          font-size: 24px;
          line-height: 1;
          letter-spacing: normal;
          text-transform: none;
          display: inline-block;
          white-space: nowrap;
          word-wrap: normal;
          direction: ltr;
          -webkit-font-feature-settings: "liga";
          -webkit-font-smoothing: antialiased;
        }

        .grid { display: grid; }
        .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
        .md\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .lg\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        .md\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
        .md\\:col-span-2 { grid-column: span 2 / span 2; }
        .md\\:w-1\\/3 { width: 33.333333%; }
        .min-w-\\[280px\\] { min-width: 280px; }
        .overflow-x-auto { overflow-x: auto; }
        .pb-4 { padding-bottom: 1rem; }

        @media (min-width: 768px) {
          .md\\:flex-row { flex-direction: row; }
          .md\\:text-7xl { font-size: 72px; line-height: 1; }
          .md\\:px-8 { padding-left: 2rem; padding-right: 2rem; }
          .md\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .md\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
          .md\\:col-span-2 { grid-column: span 2 / span 2; }
          .md\\:w-1\\/3 { width: 33.333333%; }
        }
        @media (min-width: 1024px) {
          .lg\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        }

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