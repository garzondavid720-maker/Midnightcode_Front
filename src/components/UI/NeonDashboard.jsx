import React from "react";

export default function NeonDashboard() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-black text-gray-200 font-rajdhani selection:bg-fuchsia-500 selection:text-white">

      {/* SIDEBAR */}
      <aside className="w-24 lg:w-64 bg-[#0A0A0B] border-r border-gray-800 flex flex-col items-center lg:items-start py-8 transition-all duration-300">

        {/* LOGO */}
        <div className="px-6 mb-12 flex items-center gap-3">
          <div className="w-10 h-10 bg-fuchsia-600 rounded-lg flex items-center justify-center shadow-lg">
            <span className="font-black text-black text-xl">N</span>
          </div>

          <h1 className="hidden lg:block font-bold text-xl tracking-tight text-white">
            <span className="text-fuchsia-500">NEON</span> OVERLOAD
          </h1>
        </div>

        {/* NAV */}
        <nav className="flex-1 w-full px-4 space-y-4">

          <a className="flex items-center gap-4 p-3 rounded-xl bg-fuchsia-500/20 border-l-4 border-fuchsia-500 text-fuchsia-400">
            <span className="hidden lg:block font-bold">Dashboard</span>
          </a>

          <a className="flex items-center gap-4 p-3 rounded-xl text-gray-500 hover:text-white hover:bg-white/5">
            <span className="hidden lg:block font-bold">Users</span>
          </a>

          <a className="flex items-center gap-4 p-3 rounded-xl text-gray-500 hover:text-white hover:bg-white/5">
            <span className="hidden lg:block font-bold">Inventory</span>
          </a>

          <a className="flex items-center gap-4 p-3 rounded-xl text-gray-500 hover:text-white hover:bg-white/5">
            <span className="hidden lg:block font-bold">Reservations</span>
          </a>

          <a className="flex items-center gap-4 p-3 rounded-xl text-gray-500 hover:text-white hover:bg-white/5">
            <span className="hidden lg:block font-bold">Music</span>
          </a>

          <a className="flex items-center gap-4 p-3 rounded-xl text-gray-500 hover:text-white hover:bg-white/5">
            <span className="hidden lg:block font-bold">Sales</span>
          </a>

          <a className="flex items-center gap-4 p-3 rounded-xl text-gray-500 hover:text-white hover:bg-white/5">
            <span className="hidden lg:block font-bold">Parking</span>
          </a>

        </nav>

        {/* PROFILE */}
        <div className="p-6 border-t border-gray-800 w-full">
          <div className="flex items-center gap-3">
            <img
              className="rounded-full border border-fuchsia-500 w-10 h-10"
              src="https://i.pravatar.cc/100"
            />

            <div className="hidden lg:block">
              <p className="text-sm font-bold text-white">System Admin</p>
              <p className="text-xs text-fuchsia-400 uppercase tracking-widest">
                Level 10
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 overflow-y-auto p-8">

        {/* HEADER */}
        <header className="flex justify-between items-end mb-10">

          <div>
            <h2 className="text-4xl font-black text-white uppercase">
              Dashboard
            </h2>

            <p className="text-gray-400 text-sm mt-1">
              Live Operational Environment
              <span className="text-fuchsia-500 animate-pulse"> ●</span>
            </p>
          </div>

          <div className="px-6 py-3 rounded-xl border border-fuchsia-500/40 shadow-lg flex items-center gap-3">
            <span className="text-fuchsia-400 text-xs font-bold uppercase">
              Status:
            </span>
            <span className="text-white font-bold">OPTIMIZED</span>
          </div>

        </header>

        {/* HERO */}
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">

          {/* LIVE PULSE */}
          <div className="xl:col-span-2 bg-[#0f0f11] rounded-3xl p-8 border border-fuchsia-500/20">

            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-white">
                  LIVE NIGHTLIFE PULSE
                </h3>
                <p className="text-gray-400 text-sm">
                  Real-time venue acoustics
                </p>
              </div>

              <span className="text-3xl font-black text-fuchsia-500">
                128 BPM
              </span>
            </div>

            {/* BARS */}
            <div className="mt-12 h-32 flex items-end gap-2 justify-center">

              {[40,60,30,90,50,75,45,40,20,100,60,35].map((h,i)=>(
                <div
                  key={i}
                  className="w-2 bg-fuchsia-500 rounded-full"
                  style={{height:`${h}%`}}
                />
              ))}

            </div>

          </div>

          {/* METRICS */}
          <div className="flex flex-col gap-6">

            <div className="bg-[#0f0f11] p-6 rounded-2xl border-l-4 border-fuchsia-500">
              <span className="text-xs text-gray-400 uppercase">
                Nightly Revenue
              </span>
              <h4 className="text-3xl font-black text-white mt-2">
                $42,105
              </h4>
              <p className="text-green-400 text-xs mt-2">
                +12.4% vs Last Friday
              </p>
            </div>

            <div className="bg-[#0f0f11] p-6 rounded-2xl border-l-4 border-pink-500">
              <span className="text-xs text-gray-400 uppercase">
                VIP Saturation
              </span>
              <h4 className="text-3xl font-black text-white mt-2">
                88%
              </h4>

              <div className="w-full bg-white/10 h-1.5 mt-4 rounded-full">
                <div className="bg-pink-500 h-full w-[88%]" />
              </div>
            </div>

            <div className="bg-[#0f0f11] p-6 rounded-2xl border-l-4 border-white">
              <span className="text-xs text-gray-400 uppercase">
                Active Guests
              </span>
              <h4 className="text-3xl font-black text-white mt-2">
                1,248
              </h4>
              <p className="text-fuchsia-400 text-xs mt-2">
                Capacity: 1,500
              </p>
            </div>

          </div>

        </section>

        {/* FOOTER */}
        <footer className="flex justify-between items-center bg-[#0f0f11] px-6 py-4 rounded-2xl border border-white/10">

          <div className="flex items-center gap-8">

            <div className="flex items-center gap-3">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"/>
              <span className="text-xs text-gray-400 uppercase">
                Security: Optimal
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400 uppercase">
                Network: encrypted
              </span>
            </div>

          </div>

          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase">
              Current Track
            </p>
            <p className="text-sm text-white font-bold">
              TECHNO_OVERLOAD_V4.MP3
            </p>
          </div>

        </footer>

      </main>
    </div>
  );
}