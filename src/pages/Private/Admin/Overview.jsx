import React, { useState, useEffect } from "react";

// Helpers para leer datos de localStorage
const getFromStorage = (key, defaultValue = []) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const AdminHome = () => {
  // Estados para estadísticas
  const [stats, setStats] = useState({
    usuarios: 0,
    ventas: 0,
    eventos: 0,
    productos: 0,
    reservas: 0,
    ingresosTotales: 0,
    ocupacionActual: 0,
  });

  // Cargar datos de localStorage al montar
  useEffect(() => {
    const usuarios = getFromStorage("afterdark_usuarios");
    const ventas = getFromStorage("afterdark_ventas");
    const eventos = getFromStorage("afterdark_eventos");
    const productos = getFromStorage("afterdark_productos");
    const reservas = getFromStorage("afterdark_reservas");

    const totalIngresos = ventas.reduce((acc, v) => acc + parseFloat(v.monto || 0), 0);

    setStats({
      usuarios: usuarios.length,
      ventas: ventas.length,
      eventos: eventos.length,
      productos: productos.length,
      reservas: reservas.length,
      ingresosTotales: totalIngresos,
      ocupacionActual: Math.floor(Math.random() * 200) + 600, // simulación
    });
  }, []);

  // Datos quemados para los gráficos (estáticos)
  const topSpirits = [
    { name: "Vesper", value: 85 },
    { name: "Old Fashioned", value: 60 },
    { name: "Black Card", value: 95 },
    { name: "Paloma", value: 45 },
    { name: "Martini", value: 70 },
  ];

  const revenueData = [
    { hour: "18:00 - 19:00", amount: 2140, percent: 15 },
    { hour: "19:00 - 20:00", amount: 4500, percent: 30 },
    { hour: "20:00 - 21:00", amount: 8120, percent: 55 },
    { hour: "21:00 - 22:00", amount: 12450, percent: 75 },
  ];

  const liveEvents = [
    { id: 1, label: "14", title: "Ace of Spades Service", time: "2 mins ago", zone: "VIP Area B", color: "secondary-container" },
    { id: 2, label: "08", title: "Bottle Service Requested", time: "5 mins ago", zone: "Terrace", color: "primary-container" },
    { id: 3, label: "VIP", title: "Black Card Entry", time: "Just now", zone: "Gate 1", color: "tertiary-container" },
    { id: 4, label: "22", title: "Check Out Complete", time: "12 mins ago", zone: "Lounge", color: "surface-variant", opacity: "50" },
  ];

  return (
    <>
      {/* ===== ESTILOS (idénticos al HTML) ===== */}
      <style>{`
        body { background-color: #050505; color: #e5e2e1; }
        .glass-card {
          background: rgba(28, 28, 30, 0.7);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-top: 1px solid rgba(255, 255, 255, 0.15);
        }
        .neon-glow-primary {
          box-shadow: 0 0 12px 2px rgba(233, 179, 255, 0.3);
        }
        .neon-glow-cyan {
          box-shadow: 0 0 12px 2px rgba(6, 182, 212, 0.3);
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(0.98); }
        }
        .animate-pulse-slow { animation: pulse-slow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        .chart-bar {
          transition: height 1s ease-out;
        }

        /* Clases de color y utilidades (mapeo) */
        .bg-surface { background-color: #131313; }
        .bg-surface-container { background-color: #201f1f; }
        .bg-surface-container-high { background-color: #2a2a2a; }
        .bg-surface-container-highest { background-color: #353534; }
        .bg-surface-container-low { background-color: #1c1b1b; }
        .bg-surface-variant { background-color: #353534; }
        .text-on-surface { color: #e5e2e1; }
        .text-on-surface-variant { color: #d2c1d4; }
        .text-primary { color: #e9b3ff; }
        .bg-primary { background-color: #e9b3ff; }
        .text-on-primary { color: #510074; }
        .bg-primary-container { background-color: #c863fb; }
        .text-secondary { color: #ffb2b7; }
        .bg-secondary { background-color: #ffb2b7; }
        .bg-secondary-container { background-color: #d00242; }
        .text-on-secondary { color: #67001c; }
        .text-tertiary { color: #e7c448; }
        .bg-tertiary { background-color: #e7c448; }
        .bg-tertiary-container { background-color: #c9a82e; }
        .text-on-tertiary-container { color: #4d3e00; }
        .bg-error { background-color: #ffb4ab; }
        .text-error { color: #ffb4ab; }
        .text-on-error { color: #690005; }
        .border-primary { border-color: #e9b3ff; }
        .border-secondary { border-color: #ffb2b7; }
        .border-white\\/10 { border-color: rgba(255,255,255,0.1); }
        .border-white\\/5 { border-color: rgba(255,255,255,0.05); }
        .bg-white\\/5 { background-color: rgba(255,255,255,0.05); }
        .bg-white\\/10 { background-color: rgba(255,255,255,0.1); }
        .bg-primary\\/5 { background-color: rgba(233,179,255,0.05); }
        .bg-primary\\/10 { background-color: rgba(233,179,255,0.1); }
        .bg-primary\\/20 { background-color: rgba(233,179,255,0.2); }
        .bg-secondary\\/10 { background-color: rgba(255,178,183,0.1); }
        .bg-secondary\\/20 { background-color: rgba(255,178,183,0.2); }
        .bg-tertiary\\/10 { background-color: rgba(231,196,72,0.1); }
        .bg-tertiary\\/20 { background-color: rgba(231,196,72,0.2); }
        .border-error\\/30 { border-color: rgba(255,180,171,0.3); }
        .shadow-primary\\/20 { box-shadow: 0 4px 14px rgba(233,179,255,0.2); }
        .shadow-\\[0_0_8px_\\#ffb2b7\\] { box-shadow: 0 0 8px #ffb2b7; }
        .shadow-\\[0_0_5px_\\#e9b3ff\\] { box-shadow: 0 0 5px #e9b3ff; }
        .shadow-\\[0_0_20px_rgba\\(233\\,179\\,255\\,0\\.1\\)\\] { box-shadow: 0 0 20px rgba(233,179,255,0.1); }
        .shadow-\\[0_0_15px_rgba\\(233\\,179\\,255\\,0\\.1\\)\\] { box-shadow: 0 0 15px rgba(233,179,255,0.1); }
        .shadow-\\[0_0_8px_rgba\\(233\\,179\\,255\\,0\\.5\\)\\] { box-shadow: 0 0 8px rgba(233,179,255,0.5); }
        .shadow-\\[0_0_20px_rgba\\(233\\,179\\,255\\,0\\.6\\)\\] { box-shadow: 0 0 20px rgba(233,179,255,0.6); }
        .shadow-\\[0_0_30px_rgba\\(233\\,179\\,255\\,0\\.6\\)\\] { box-shadow: 0 0 30px rgba(233,179,255,0.6); }
        .shadow-\\[0_0_8px_rgba\\(231\\,196\\,72\\,0\\.6\\)\\] { box-shadow: 0 0 8px rgba(231,196,72,0.6); }

        .font-headline-lg { font-family: 'Montserrat', sans-serif; }
        .font-headline-md { font-family: 'Montserrat', sans-serif; }
        .font-body-md { font-family: 'Inter', sans-serif; }
        .font-label-md { font-family: 'Inter', sans-serif; }
        .font-stats-number { font-family: 'Montserrat', sans-serif; }
        .font-display-lg { font-family: 'Montserrat', sans-serif; }

        .text-headline-lg { font-size: 32px; line-height: 40px; letter-spacing: -0.01em; font-weight: 700; }
        .text-headline-md { font-size: 24px; line-height: 32px; font-weight: 600; }
        .text-body-md { font-size: 16px; line-height: 24px; font-weight: 400; }
        .text-label-md { font-size: 14px; line-height: 20px; letter-spacing: 0.05em; font-weight: 600; }
        .text-stats-number { font-size: 36px; line-height: 44px; font-weight: 700; }
        .text-display-lg { font-size: 48px; line-height: 56px; letter-spacing: -0.02em; font-weight: 800; }

        .px-margin-mobile { padding-left: 16px; padding-right: 16px; }
        .px-margin-desktop { padding-left: 48px; padding-right: 48px; }
        .pt-\\[80px\\] { padding-top: 80px; }
        .pb-xl { padding-bottom: 64px; }
        .gap-gutter { gap: 24px; }
        .gap-base { gap: 8px; }
        .gap-xs { gap: 4px; }
        .gap-sm { gap: 12px; }
        .gap-md { gap: 24px; }
        .gap-lg { gap: 40px; }
        .gap-xl { gap: 64px; }
        .px-md { padding-left: 24px; padding-right: 24px; }
        .px-sm { padding-left: 12px; padding-right: 12px; }
        .px-xs { padding-left: 4px; padding-right: 4px; }
        .py-sm { padding-top: 12px; padding-bottom: 12px; }
        .py-xs { padding-top: 4px; padding-bottom: 4px; }
        .py-lg { padding-top: 40px; padding-bottom: 40px; }
        .p-md { padding: 24px; }
        .p-sm { padding: 12px; }
        .p-xs { padding: 4px; }
        .mt-auto { margin-top: auto; }
        .mb-lg { margin-bottom: 40px; }
        .mb-xs { margin-bottom: 4px; }
        .mb-sm { margin-bottom: 12px; }
        .mt-xs { margin-top: 4px; }
        .mt-sm { margin-top: 12px; }
        .mt-md { margin-top: 24px; }
        .mr-xs { margin-right: 4px; }
        .ml-sm { margin-left: 12px; }
        .ml-md { margin-left: 24px; }
        .mb-1 { margin-bottom: 4px; }
        .mb-2 { margin-bottom: 8px; }
        .mb-4 { margin-bottom: 16px; }
        .mb-6 { margin-bottom: 24px; }
        .mb-8 { margin-bottom: 32px; }
        .mb-10 { margin-bottom: 40px; }

        .w-64 { width: 16rem; }
        .w-full { width: 100%; }
        .h-full { height: 100%; }
        .h-20 { height: 5rem; }
        .h-10 { height: 2.5rem; }
        .h-8 { height: 2rem; }
        .h-14 { height: 3.5rem; }
        .h-2 { height: 0.5rem; }
        .h-1\\.5 { height: 0.375rem; }
        .h-32 { height: 8rem; }
        .h-40 { height: 10rem; }
        .h-\\[400px\\] { height: 400px; }
        .h-\\[350px\\] { height: 350px; }
        .w-8 { width: 2rem; }
        .w-10 { width: 2.5rem; }
        .w-14 { width: 3.5rem; }
        .w-2 { width: 0.5rem; }
        .w-3 { width: 0.75rem; }
        .w-1\\.5 { width: 0.375rem; }
        .w-16 { width: 4rem; }
        .h-16 { height: 4rem; }
        .w-12 { width: 3rem; }
        .h-12 { height: 3rem; }
        .max-w-2xl { max-width: 42rem; }
        .max-w-md { max-width: 28rem; }
        .flex-1 { flex: 1; }
        .flex-col { flex-direction: column; }
        .items-center { align-items: center; }
        .items-start { align-items: flex-start; }
        .items-end { align-items: flex-end; }
        .justify-center { justify-content: center; }
        .justify-between { justify-content: space-between; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .text-left { text-align: left; }
        .overflow-hidden { overflow: hidden; }
        .overflow-x-auto { overflow-x: auto; }
        .overflow-y-auto { overflow-y: auto; }
        .border-collapse { border-collapse: collapse; }
        .divide-y > * + * { border-top-width: 1px; }
        .divide-white\\/5 > * + * { border-color: rgba(255,255,255,0.05); }
        .space-y-xs > * + * { margin-top: 4px; }
        .space-y-sm > * + * { margin-top: 12px; }
        .space-y-md > * + * { margin-top: 24px; }
        .space-y-6 > * + * { margin-top: 24px; }
        .grid { display: grid; }
        .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
        .grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
        .grid-cols-12 { grid-template-columns: repeat(12, minmax(0, 1fr)); }
        .col-span-8 { grid-column: span 8 / span 8; }
        .col-span-4 { grid-column: span 4 / span 4; }
        .col-span-5 { grid-column: span 5 / span 5; }
        .col-span-7 { grid-column: span 7 / span 7; }
        .bg-black\\/70 { background-color: rgba(0,0,0,0.7); }
        .backdrop-blur-sm { backdrop-filter: blur(4px); }
        .backdrop-blur-xl { backdrop-filter: blur(16px); }
        .backdrop-blur-2xl { backdrop-filter: blur(40px); }
        .focus\\:border-primary\\/50:focus { border-color: rgba(233,179,255,0.5); }
        .focus\\:ring-0:focus { outline: none; box-shadow: none; }
        .focus\\:ring-2:focus { outline: none; box-shadow: 0 0 0 2px rgba(233,179,255,0.5); }
        .focus\\:ring-primary:focus { --tw-ring-color: #e9b3ff; }
        .hover\\:bg-secondary\\/20:hover { background-color: rgba(255,178,183,0.2); }
        .hover\\:bg-primary\\/10:hover { background-color: rgba(233,179,255,0.1); }
        .hover\\:bg-white\\/5:hover { background-color: rgba(255,255,255,0.05); }
        .hover\\:bg-surface-variant:hover { background-color: #353534; }
        .hover\\:text-primary:hover { color: #e9b3ff; }
        .hover\\:text-on-surface:hover { color: #e5e2e1; }
        .hover\\:bg-error\\/10:hover { background-color: rgba(255,180,171,0.1); }
        .group-hover\\:text-primary:hover .group { color: #e9b3ff; }
        .group-hover\\:scale-110 .group:hover { transform: scale(1.1); }
        .group-hover\\:scale-110:hover .group { transform: scale(1.1); }
        .group-hover\\:opacity-100 .group:hover { opacity: 1; }
        .active\\:translate-x-1:active { transform: translateX(4px); }
        .active\\:scale-95:active { transform: scale(0.95); }
        .active\\:scale-90:active { transform: scale(0.9); }
        .bg-gradient-to-t { background-image: linear-gradient(to top, var(--tw-gradient-stops)); }
        .from-background { --tw-gradient-from: #131313; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(19,19,19,0)); }
        .via-background\\/40 { --tw-gradient-via: rgba(19,19,19,0.4); }
        .to-transparent { --tw-gradient-to: transparent; }
        .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
        .text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
        .text-6xl { font-size: 3.75rem; line-height: 1; }
        .text-8xl { font-size: 6rem; line-height: 1; }
        .text-\\[140px\\] { font-size: 140px; }
        .text-\\[10px\\] { font-size: 10px; }
        .text-\\[12px\\] { font-size: 12px; }
        .text-\\[20px\\] { font-size: 20px; }
        .font-bold { font-weight: 700; }
        .font-semibold { font-weight: 600; }
        .font-mono { font-family: monospace; }
        .leading-none { line-height: 1; }
        .cursor-pointer { cursor: pointer; }
        .transition-all { transition: all 0.3s ease; }
        .duration-200 { transition-duration: 200ms; }
        .duration-300 { transition-duration: 300ms; }
        .duration-1000 { transition-duration: 1000ms; }
        .hover\\:scale-105:hover { transform: scale(1.05); }
        .hover\\:scale-110:hover { transform: scale(1.1); }
        .hover\\:brightness-110:hover { filter: brightness(1.1); }
        .hidden { display: none; }
        .flex { display: flex; }
        .block { display: block; }
        .table { display: table; }
        .border-none { border-style: none; }
        .outline-none { outline: none; }
        .object-cover { object-fit: cover; }
        .object-contain { object-fit: contain; }
        .truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .min-h-screen { min-height: 100vh; }
        .relative { position: relative; }
        .absolute { position: absolute; }
        .fixed { position: fixed; }
        .sticky { position: sticky; }
        .inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
        .left-0 { left: 0; }
        .top-0 { top: 0; }
        .right-0 { right: 0; }
        .bottom-0 { bottom: 0; }
        .translate-y-0 { transform: translateY(0); }
        .translate-y-24 { transform: translateY(6rem); }
        .-translate-y-1\\/2 { transform: translateY(-50%); }
        .-translate-x-1\\/2 { transform: translateX(-50%); }
        .-right-4 { right: -1rem; }
        .-top-4 { top: -1rem; }
        .-top-8 { top: -2rem; }
        .-right-8 { right: -2rem; }
        .-bottom-8 { bottom: -2rem; }
        .z-10 { z-index: 10; }
        .z-40 { z-index: 40; }
        .z-50 { z-index: 50; }
        .z-\\[60\\] { z-index: 60; }
        .z-\\[100\\] { z-index: 100; }
        .z-\\[200\\] { z-index: 200; }
        .z-\\[-1\\] { z-index: -1; }
        .rounded-l-md { border-radius: 0.375rem 0 0 0.375rem; }
        .rounded-t-sm { border-radius: 0.25rem 0.25rem 0 0; }
        .rounded-t-lg { border-radius: 0.5rem 0.5rem 0 0; }
        .shadow-\\[0_0_20px_rgba\\(233\\,179\\,255\\,0\\.6\\)\\] { box-shadow: 0 0 20px rgba(233,179,255,0.6); }
        .shadow-\\[0_0_10px_rgba\\(233\\,179\\,255\\,0\\.4\\)\\] { box-shadow: 0 0 10px rgba(233,179,255,0.4); }
        .shadow-\\[0_0_10px_rgba\\(231\\,196\\,72\\,0\\.5\\)\\] { box-shadow: 0 0 10px rgba(231,196,72,0.5); }
        .shadow-\\[0_0_10px_rgba\\(255\\,180\\,171\\,0\\.5\\)\\] { box-shadow: 0 0 10px rgba(255,180,171,0.5); }
        .shadow-\\[0_0_20px_rgba\\(233\\,179\\,255\\,0\\.6\\)\\] { box-shadow: 0 0 20px rgba(233,179,255,0.6); }
        .shadow-\\[0_0_30px_rgba\\(233\\,179\\,255\\,0\\.6\\)\\] { box-shadow: 0 0 30px rgba(233,179,255,0.6); }
        .shadow-\\[0_0_8px_rgba\\(231\\,196\\,72\\,0\\.6\\)\\] { box-shadow: 0 0 8px rgba(231,196,72,0.6); }
        .text-outline { color: #9b8c9e; }
        .text-outline-variant { color: #4f4352; }
        .border-outline-variant { border-color: #4f4352; }
        .bg-surface-container-highest\\/30 { background-color: rgba(53,53,52,0.3); }
        .bg-primary\\/30 { background-color: rgba(233,179,255,0.3); }
        .blur-3xl { filter: blur(3rem); }
        .bg-surface-container-low { background-color: #1c1b1b; }
        .bg-error\\/5 { background-color: rgba(255,180,171,0.05); }
        .bg-tertiary\\/5 { background-color: rgba(231,196,72,0.05); }
        .border-error\\/30 { border-color: rgba(255,180,171,0.3); }
        .border-tertiary\\/30 { border-color: rgba(231,196,72,0.3); }
        .filter { filter: var(--tw-filter); }
        .max-h-\\[600px\\] { max-height: 600px; }
        .max-h-\\[500px\\] { max-height: 500px; }
        .pointer-events-none { pointer-events: none; }
        .whitespace-nowrap { white-space: nowrap; }
        .opacity-30 { opacity: 0.3; }
        .opacity-10 { opacity: 0.1; }
        .opacity-40 { opacity: 0.4; }
        .opacity-60 { opacity: 0.6; }
        .opacity-80 { opacity: 0.8; }
        .scale-150 { transform: scale(1.5); }
        .rotate-90 { transform: rotate(90deg); }
        .rotate-45 { transform: rotate(45deg); }
        .bg-cyan-400 { background-color: #22d3ee; }
        .bg-cyan-500 { background-color: #06b6d4; }
        .bg-cyan-600 { background-color: #0891b2; }
        .border-primary\\/40 { border-color: rgba(233,179,255,0.4); }
        .border-primary\\/50 { border-color: rgba(233,179,255,0.5); }
        .border-primary\\/10 { border-color: rgba(233,179,255,0.1); }
        .border-primary\\/20 { border-color: rgba(233,179,255,0.2); }
        .border-primary\\/30 { border-color: rgba(233,179,255,0.3); }
        .border-dashed { border-style: dashed; }
        .border-l-4 { border-left-width: 4px; }
        .border-l-primary { border-left-color: #e9b3ff; }
        .border-l-primary\\/40 { border-left-color: rgba(233,179,255,0.4); }
        .border-l-primary\\/20 { border-left-color: rgba(233,179,255,0.2); }
        .border-l-primary\\/10 { border-left-color: rgba(233,179,255,0.1); }
        .border-r-2 { border-right-width: 2px; }
        .border-r-primary { border-right-color: #e9b3ff; }
        .ring-1 { ring-width: 1px; }
        .ring-white\\/10 { ring-color: rgba(255,255,255,0.1); }
        .group-hover\\:ring-primary\\/50 .group:hover { ring-color: rgba(233,179,255,0.5); }
        .bg-cover { background-size: cover; }
        .bg-center { background-position: center; }
        .bg-gradient-to-t { background-image: linear-gradient(to top, var(--tw-gradient-stops)); }
        .from-background { --tw-gradient-from: #131313; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(19,19,19,0)); }
        .via-background\\/40 { --tw-gradient-via: rgba(19,19,19,0.4); }
        .to-transparent { --tw-gradient-to: transparent; }
        .drop-shadow-\\[0_0_8px_rgba\\(233\\,179\\,255\\,0\\.5\\)\\] { filter: drop-shadow(0 0 8px rgba(233,179,255,0.5)); }
        .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05); }
        .shadow-\\[0_0_30px_rgba\\(233\\,179\\,255\\,0\\.6\\)\\] { box-shadow: 0 0 30px rgba(233,179,255,0.6); }
        .shadow-\\[0_0_20px_rgba\\(233\\,179\\,255\\,0\\.6\\)\\] { box-shadow: 0 0 20px rgba(233,179,255,0.6); }
        .shadow-\\[0_0_15px_rgba\\(233\\,179\\,255\\,0\\.1\\)\\] { box-shadow: 0 0 15px rgba(233,179,255,0.1); }
        .shadow-\\[0_0_8px_rgba\\(231\\,196\\,72\\,0\\.6\\)\\] { box-shadow: 0 0 8px rgba(231,196,72,0.6); }
        .shadow-\\[0_0_8px_rgba\\(233\\,179\\,255\\,0\\.5\\)\\] { box-shadow: 0 0 8px rgba(233,179,255,0.5); }
        .shadow-\\[0_0_10px_rgba\\(233\\,179\\,255\\,0\\.4\\)\\] { box-shadow: 0 0 10px rgba(233,179,255,0.4); }
        .shadow-\\[0_0_10px_rgba\\(231\\,196\\,72\\,0\\.5\\)\\] { box-shadow: 0 0 10px rgba(231,196,72,0.5); }
        .shadow-\\[0_0_10px_rgba\\(255\\,180\\,171\\,0\\.5\\)\\] { box-shadow: 0 0 10px rgba(255,180,171,0.5); }
        .shadow-\\[0_0_20px_rgba\\(233\\,179\\,255\\,0\\.6\\)\\] { box-shadow: 0 0 20px rgba(233,179,255,0.6); }
        .shadow-\\[0_0_30px_rgba\\(233\\,179\\,255\\,0\\.6\\)\\] { box-shadow: 0 0 30px rgba(233,179,255,0.6); }

        .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        @media (min-width: 768px) {
          .md\\:flex { display: flex; }
          .md\\:hidden { display: none; }
          .md\\:ml-64 { margin-left: 16rem; }
          .md\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
          .md\\:col-span-2 { grid-column: span 2 / span 2; }
          .md\\:flex-row { flex-direction: row; }
          .md\\:items-end { align-items: flex-end; }
          .md\\:px-margin-desktop { padding-left: 48px; padding-right: 48px; }
          .md\\:bottom-10 { bottom: 40px; }
          .md\\:right-10 { right: 40px; }
          .md\\:block { display: block; }
          .md\\:w-\\[calc\\(100\\%-16rem\\)\\] { width: calc(100% - 16rem); }
        }
        @media (min-width: 1024px) {
          .lg\\:grid-cols-12 { grid-template-columns: repeat(12, minmax(0, 1fr)); }
          .lg\\:col-span-8 { grid-column: span 8 / span 8; }
          .lg\\:col-span-4 { grid-column: span 4 / span 4; }
          .lg\\:flex { display: flex; }
          .lg\\:hidden { display: none; }
        }
      `}</style>

      {/* ===== SIDEBAR ===== */}
      <aside className="h-screen w-64 fixed left-0 top-0 bg-surface/70 backdrop-blur-xl border-r border-white/10 shadow-[0_0_15px_rgba(233,179,255,0.1)] flex flex-col h-full py-lg px-md z-50">
        <div className="mb-xl">
          <h1 className="font-display-lg text-display-lg text-primary tracking-tighter">Luxe Management</h1>
          <p className="text-on-surface-variant text-sm mt-xs">Deep Night Ops</p>
        </div>
        <nav className="flex-grow space-y-base">
          <a className="flex items-center gap-md py-sm px-sm rounded-lg text-primary font-bold border-r-2 border-primary bg-primary/10 transition-all duration-300" href="#">
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-label-md">Dashboard</span>
          </a>
          <a className="flex items-center gap-md py-sm px-sm rounded-lg text-on-surface-variant font-medium hover:bg-primary/5 hover:text-primary transition-all duration-300" href="/admin/usuarios">
            <span className="material-symbols-outlined">group</span>
            <span className="font-label-md">Usuarios</span>
          </a>
          <a className="flex items-center gap-md py-sm px-sm rounded-lg text-on-surface-variant font-medium hover:bg-primary/5 hover:text-primary transition-all duration-300" href="/admin/ventas">
            <span className="material-symbols-outlined">payments</span>
            <span className="font-label-md">Ventas</span>
          </a>
          <a className="flex items-center gap-md py-sm px-sm rounded-lg text-on-surface-variant font-medium hover:bg-primary/5 hover:text-primary transition-all duration-300" href="/admin/eventos">
            <span className="material-symbols-outlined">event</span>
            <span className="font-label-md">Eventos</span>
          </a>
          <a className="flex items-center gap-md py-sm px-sm rounded-lg text-on-surface-variant font-medium hover:bg-primary/5 hover:text-primary transition-all duration-300" href="/admin/productos">
            <span className="material-symbols-outlined">inventory_2</span>
            <span className="font-label-md">Productos</span>
          </a>
          <a className="flex items-center gap-md py-sm px-sm rounded-lg text-on-surface-variant font-medium hover:bg-primary/5 hover:text-primary transition-all duration-300" href="/admin/reservas">
            <span className="material-symbols-outlined">event_seat</span>
            <span className="font-label-md">Reservas</span>
          </a>
        </nav>
        <div className="mt-auto">
          <button className="w-full py-sm bg-primary text-on-primary font-bold rounded-lg hover:brightness-110 transition-all scale-105 shadow-lg shadow-primary/20">
            Live Status
          </button>
        </div>
      </aside>

      {/* ===== HEADER ===== */}
      <header className="fixed top-0 right-0 w-[calc(100%-16rem)] z-40 bg-surface/70 backdrop-blur-xl border-b border-white/10 shadow-md flex justify-between items-center px-margin-desktop py-base">
        <div className="flex items-center gap-md">
          <span className="font-headline-lg text-headline-lg text-primary uppercase tracking-widest">Luxe Nightlife</span>
          <div className="relative group">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant">search</span>
            <input
              className="bg-surface-container-low border-none rounded-full pl-10 pr-md py-xs text-on-surface focus:ring-2 focus:ring-primary/50 transition-all w-64"
              placeholder="Search data points..."
              type="text"
            />
          </div>
        </div>
        <div className="flex items-center gap-lg">
          <div className="flex gap-md">
            <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">notifications</button>
            <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">settings</button>
            <button
              className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors"
              onClick={() => window.location.href = "/home"}
            >
              logout
            </button>
          </div>
          <div className="flex items-center gap-sm border-l border-white/10 pl-lg">
            <div className="text-right">
              <p className="text-sm font-bold text-on-surface">Alex Mercer</p>
              <p className="text-[10px] text-primary tracking-widest uppercase">Floor Manager</p>
            </div>
            <img
              className="w-10 h-10 rounded-full border-2 border-primary/30 object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD1tRGL0ovUcZGUj5j7hT0iXS5W6iV5fm_pFEfzqQR85TgEhhp_OTd7msnSsYNtFsumUWCXOze2lr7T8Bnd94j17wb0Wn7Zup-vhwU8_LkbvwZF_Vdq6CkWPtda7Y2KlD5vua6HRZgjNUwkY3UA9ri33iaO-vE2mCXYfBNBlcY6wDSFq2Uw0vqmDZClDuME39UU7zvXhngluEBXUck1t94l1rc_SX5GZcdqnGPzyEGtdKYViMXwR8uWrNHKcHhR5miyUq7bQMkoBzJn"
              alt="Alex Mercer"
            />
          </div>
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main className="ml-64 pt-[80px] min-h-screen relative overflow-hidden">
        <div className="p-margin-desktop space-y-md relative z-10">
          {/* Header Section */}
          <div className="flex justify-between items-end mb-lg">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface mb-xs">Live Analytics</h2>
              <p className="text-on-surface-variant flex items-center gap-xs">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                Streaming data from 4 Bar Terminals &amp; Entry Gate
              </p>
            </div>
            <div className="flex gap-sm">
              <div className="glass-card px-md py-sm rounded-xl flex items-center gap-md">
                <div className="text-center">
                  <p className="text-on-surface-variant text-[10px] uppercase tracking-tighter">Current Occupancy</p>
                  <p className="font-stats-number text-stats-number text-primary">{stats.ocupacionActual}</p>
                </div>
                <div className="w-12 h-12">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" fill="none" r="16" stroke="rgba(255,255,255,0.1)" strokeWidth="3"></circle>
                    <circle className="text-primary" cx="18" cy="18" fill="none" r="16" stroke="currentColor" strokeDasharray="84, 100" strokeLinecap="round" strokeWidth="3"></circle>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-12 gap-gutter">
            {/* Main Chart: Entry Speed (Line Chart) - Estático */}
            <div className="col-span-8 glass-card rounded-xl p-md flex flex-col h-[400px]">
              <div className="flex justify-between items-start mb-md">
                <div>
                  <h3 className="font-headline-md text-headline-md text-on-surface">Entry Flow Speed</h3>
                  <p className="text-on-surface-variant text-sm">Real-time people/min through Main Entry</p>
                </div>
                <div className="flex gap-xs">
                  <span className="px-sm py-1 bg-primary/10 text-primary text-xs rounded-full border border-primary/20">LIVE</span>
                  <span className="px-sm py-1 bg-surface-container text-on-surface-variant text-xs rounded-full">Last 60 Mins</span>
                </div>
              </div>
              <div className="flex-grow relative flex items-end justify-between gap-2 pt-md">
                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <defs>
                    <linearGradient id="lineGrad" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#e9b3ff" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#e9b3ff" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,80 Q10,75 20,40 T40,60 T60,20 T80,45 T100,10 L100,100 L0,100 Z" fill="url(#lineGrad)" />
                  <path d="M0,80 Q10,75 20,40 T40,60 T60,20 T80,45 T100,10" fill="none" stroke="#e9b3ff" strokeLinecap="round" strokeWidth="2" />
                  <circle cx="20" cy="40" fill="#e9b3ff" r="1.5" />
                  <circle cx="40" cy="60" fill="#e9b3ff" r="1.5" />
                  <circle cx="60" cy="20" fill="#e9b3ff" r="1.5" />
                  <circle className="animate-pulse" cx="100" cy="10" fill="#e9b3ff" r="2.5" />
                </svg>
                <div className="absolute bottom-0 w-full flex justify-between text-[10px] text-on-surface-variant font-mono">
                  <span>21:00</span><span>21:15</span><span>21:30</span><span>21:45</span><span>22:00</span>
                </div>
              </div>
            </div>

            {/* AI Module: Peak Prediction */}
            <div className="col-span-4 glass-card rounded-xl p-md border-primary/30 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-md opacity-20 group-hover:opacity-40 transition-opacity">
                <span className="material-symbols-outlined text-6xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
              </div>
              <div className="relative z-10 flex flex-col h-full">
                <span className="font-label-md text-primary tracking-widest uppercase mb-xs">AI Insight</span>
                <h3 className="font-headline-md text-headline-md text-on-surface mb-md">Peak Prediction</h3>
                <div className="space-y-lg flex-grow">
                  <div className="flex items-center gap-md">
                    <div className="w-16 h-16 rounded-full border-4 border-dashed border-primary/30 flex items-center justify-center">
                      <span className="font-stats-number text-primary">23:15</span>
                    </div>
                    <div>
                      <p className="text-on-surface font-bold">Estimated Peak</p>
                      <p className="text-on-surface-variant text-sm">Expect +20% surge from North Gate VIPs</p>
                    </div>
                  </div>
                  <div className="bg-primary/5 border border-primary/10 p-md rounded-lg">
                    <p className="text-on-surface-variant text-sm leading-relaxed italic">"Arrival patterns suggest a bottleneck at Bar 2 within 15 minutes. Suggest deploying 2 floaters to the lounge zone."</p>
                  </div>
                </div>
                <button className="mt-md w-full py-sm border border-primary/50 text-primary font-bold rounded-lg hover:bg-primary hover:text-on-primary transition-all flex items-center justify-center gap-sm">
                  <span className="material-symbols-outlined text-sm">bolt</span> Apply Logistics Optimization
                </button>
              </div>
            </div>

            {/* Secondary Chart: Top Selling Drinks (Bar Chart) */}
            <div className="col-span-5 glass-card rounded-xl p-md h-[350px] flex flex-col">
              <div className="mb-md">
                <h3 className="font-headline-md text-headline-md text-on-surface">Top Spirits</h3>
                <p className="text-on-surface-variant text-sm">Volume by unit tonight</p>
              </div>
              <div className="flex-grow flex items-end justify-around gap-sm pt-md">
                {topSpirits.map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-sm flex-1">
                    <div
                      className="w-full bg-cyan-500 chart-bar rounded-t-sm neon-glow-cyan"
                      style={{ height: `${item.value}%` }}
                    ></div>
                    <span className="text-[10px] text-on-surface-variant uppercase rotate-45 mt-sm">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tertiary: Hourly Revenue (Heatmap/List) */}
            <div className="col-span-7 glass-card rounded-xl p-md h-[350px] flex flex-col">
              <div className="flex justify-between items-center mb-md">
                <div>
                  <h3 className="font-headline-md text-headline-md text-on-surface">Revenue Velocity</h3>
                  <p className="text-on-surface-variant text-sm">Hourly cumulative breakdown</p>
                </div>
                <div className="text-right">
                  <p className="text-primary font-stats-number text-stats-number">${stats.ingresosTotales.toFixed(2)}</p>
                  <p className="text-on-surface-variant text-[10px] uppercase">Tonight's Total</p>
                </div>
              </div>
              <div className="flex-grow space-y-sm overflow-y-auto pr-xs">
                {revenueData.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-sm bg-white/5 rounded-lg border-l-4 border-primary" style={{ borderLeftColor: `rgba(233,179,255,${0.3 + idx * 0.15})` }}>
                    <span className="font-mono text-sm">{item.hour}</span>
                    <div className="flex-grow mx-lg h-2 bg-surface-container rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary neon-glow-primary"
                        style={{ width: `${item.percent}%` }}
                      ></div>
                    </div>
                    <span className="font-bold text-on-surface">${item.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Live Feed */}
          <div className="glass-card rounded-xl p-md">
            <div className="flex items-center gap-sm mb-md text-primary">
              <span className="material-symbols-outlined">live_tv</span>
              <h3 className="font-label-md uppercase tracking-widest">Live Table Events</h3>
            </div>
            <div className="grid grid-cols-4 gap-md">
              {liveEvents.map((event) => (
                <div
                  key={event.id}
                  className={`p-sm bg-surface-container rounded border border-white/5 flex gap-sm items-center ${event.opacity ? `opacity-${event.opacity}` : ''}`}
                >
                  <span className={`w-8 h-8 rounded-full bg-${event.color} text-on-${event.color.includes('secondary') ? 'secondary' : event.color.includes('primary') ? 'primary' : event.color.includes('tertiary') ? 'tertiary' : 'surface'} flex items-center justify-center font-bold`}>
                    {event.label}
                  </span>
                  <div>
                    <p className="text-xs font-bold text-on-surface">{event.title}</p>
                    <p className="text-[10px] text-on-surface-variant">{event.time} • {event.zone}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tarjetas de resumen de módulos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mt-md">
            <div className="glass-card p-md rounded-xl flex justify-between items-center">
              <div>
                <p className="text-xs text-on-surface-variant uppercase tracking-widest">Usuarios</p>
                <p className="font-stats-number text-stats-number text-primary">{stats.usuarios}</p>
              </div>
              <span className="material-symbols-outlined text-4xl text-primary">group</span>
            </div>
            <div className="glass-card p-md rounded-xl flex justify-between items-center">
              <div>
                <p className="text-xs text-on-surface-variant uppercase tracking-widest">Ventas</p>
                <p className="font-stats-number text-stats-number text-secondary">{stats.ventas}</p>
              </div>
              <span className="material-symbols-outlined text-4xl text-secondary">payments</span>
            </div>
            <div className="glass-card p-md rounded-xl flex justify-between items-center">
              <div>
                <p className="text-xs text-on-surface-variant uppercase tracking-widest">Eventos</p>
                <p className="font-stats-number text-stats-number text-tertiary">{stats.eventos}</p>
              </div>
              <span className="material-symbols-outlined text-4xl text-tertiary">event</span>
            </div>
          </div>
        </div>
      </main>

      {/* ===== FAB ===== */}
      <button className="fixed bottom-margin-desktop right-margin-desktop w-16 h-16 rounded-full bg-primary text-on-primary shadow-2xl flex items-center justify-center group hover:scale-110 transition-transform z-50">
        <span className="material-symbols-outlined text-3xl group-hover:rotate-90 transition-transform">add</span>
        <span className="absolute right-20 bg-primary text-on-primary px-md py-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none font-bold">Add Live Note</span>
      </button>
    </>
  );
};

export default AdminHome;