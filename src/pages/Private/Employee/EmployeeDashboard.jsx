// Employee Dashboard — empleado (ventas) y inventario (productos)
import { useState } from "react";
import { useAuth }    from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import SalesModule    from "./SalesModule";
import ProductsModule from "./ProductsModule";
import ScheduleModule from "./ScheduleModule";
import HelpModule     from "./HelpModule";

function NavIcon({ d }) {
  return (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d={d} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

const NAV_EMPLEADO = [
  {
    id: "sales", label: "Ventas", desc: "Registrar una venta",
    icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    id: "products", label: "Inventario", desc: "Ver productos disponibles",
    icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  },
  {
    id: "schedule", label: "Mi Horario", desc: "Tu turno esta semana",
    icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  },
  {
    id: "help", label: "Ayuda", desc: "Tutoriales y FAQ",
    icon: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
];

export default function EmployeeDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isInventario = user?.role === "inventario";
  // Inventario = todas las capacidades de empleado + gestión de inventario (mismo NAV)
  const NAV = NAV_EMPLEADO;

  const [active, setActive] = useState(NAV[0].id);

  const handleLogout = () => { logout(); navigate("/login", { replace: true }); };
  const current = NAV.find(n => n.id === active);

  return (
    <div className="flex h-screen bg-black w-full overflow-hidden">

      {/* SIDEBAR */}
      <aside className="w-20 lg:w-64 bg-deep-charcoal border-r border-gray-800 flex flex-col items-center lg:items-start py-8 transition-all duration-300 flex-shrink-0">

        {/* Logo */}
        <div className="px-4 lg:px-6 mb-10 flex items-center gap-3 w-full justify-center lg:justify-start">
          <div className="w-10 h-10 bg-neon-purple rounded-lg flex items-center justify-center shadow-neon-glow animate-pulse-neon flex-shrink-0">
            <span className="font-orbitron font-black text-black text-xl">N</span>
          </div>
          <div className="hidden lg:block">
            <p className="font-orbitron font-black text-sm text-white leading-tight">
              <span className="text-neon-purple">MIDNIGHT</span>CODE
            </p>
            <p className="text-neon-magenta text-[9px] uppercase tracking-widest font-mono">
              {isInventario ? "Portal Inventario" : "Portal Empleado"}
            </p>
          </div>
        </div>

        {/* Avatar */}
        <div className="hidden lg:flex items-center gap-3 mx-4 p-3 mb-6 bg-neon-purple/5 rounded-xl border border-neon-purple/15 w-[calc(100%-2rem)]">
          <div className="w-9 h-9 rounded-full bg-neon-purple/20 border border-neon-purple/40 flex items-center justify-center flex-shrink-0">
            <span className="text-neon-purple font-bold text-sm">{(user?.name || "E")[0].toUpperCase()}</span>
          </div>
          <div className="min-w-0">
            <p className="text-white font-bold text-sm truncate">{user?.name}</p>
            <p className="text-neon-magenta text-[10px] font-mono capitalize">{user?.role}</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 w-full px-2 lg:px-4 space-y-1">
          <p className="hidden lg:block text-gray-700 text-[9px] uppercase tracking-widest font-mono px-3 mb-3">Menú principal</p>
          {NAV.map(item => (
            <button key={item.id} onClick={() => setActive(item.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                active === item.id
                  ? "bg-gradient-to-r from-neon-purple/20 to-transparent border-l-4 border-neon-purple text-neon-purple"
                  : "text-gray-500 hover:text-white hover:bg-white/5 border-l-4 border-transparent"
              }`}>
              <NavIcon d={item.icon} />
              <div className="hidden lg:block text-left">
                <p className={`font-bold text-sm ${active === item.id ? "text-white" : "text-gray-400"}`}>{item.label}</p>
                <p className={`text-[10px] font-mono ${active === item.id ? "text-neon-purple" : "text-gray-600"}`}>{item.desc}</p>
              </div>
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 lg:p-4 border-t border-gray-800 w-full">
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20">
            <NavIcon d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            <span className="hidden lg:block font-bold text-sm">Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 overflow-y-auto flex flex-col">

        {/* Topbar */}
        <header className="sticky top-0 z-10 bg-black/80 backdrop-blur border-b border-white/5 px-8 py-4 flex justify-between items-center flex-shrink-0">
          <div>
            <p className="text-gray-500 text-xs uppercase tracking-widest flex items-center gap-2 font-mono mb-1">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              Neon Overload · {isInventario ? "Inventario" : "Empleado"}
            </p>
            <h1 className="font-orbitron font-black text-2xl text-white uppercase tracking-wide">
              {current?.label}
            </h1>
          </div>
          <div className="text-right">
            <p className="text-gray-500 text-xs font-mono mb-1">
              {new Date().toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" })}
            </p>
          </div>
        </header>

        {/* Módulo activo */}
        <div key={active} className="flex-1 p-8">
          {active === "sales"    && <SalesModule    user={user} />}
          {active === "products" && <ProductsModule user={user} />}
          {active === "schedule" && <ScheduleModule user={user} />}
          {active === "help"     && <HelpModule />}
        </div>
      </main>
    </div>
  );
}
