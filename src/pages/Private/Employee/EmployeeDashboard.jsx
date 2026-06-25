import React, { useState, useEffect } from "react";
import NavbarEmpleado from "../../../components/Layout/NavbarEmpleado";

const STORAGE_KEY = "afterdark_horarios";
const SOLICITUDES_KEY = "afterdark_solicitudes_cambio";

const EmpleadoHorarios = () => {
  const [horarios, setHorarios] = useState([]);
  const [empleado, setEmpleado] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ visible: false, mensaje: "", tipo: "" });
  const [modalAbierto, setModalAbierto] = useState(false);
  const [solicitud, setSolicitud] = useState({ dia: "", motivo: "" });

  // Días de la semana
  const diasSemana = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"];

  // Identificar empleado al cargar
  useEffect(() => {
    let user = sessionStorage.getItem("empleadoActual");
    if (!user) {
      user = prompt("Ingresa tu nombre completo o documento para ver tu horario:");
      if (user) {
        sessionStorage.setItem("empleadoActual", user);
      } else {
        user = "Anónimo";
        sessionStorage.setItem("empleadoActual", user);
      }
    }
    setEmpleado(user);
    cargarHorarios();
  }, []);

  const cargarHorarios = () => {
    setLoading(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        setHorarios(data);
      } else {
        setHorarios([]);
      }
    } catch (err) {
      setHorarios([]);
      mostrarToast("Error al cargar horarios", "error");
    } finally {
      setLoading(false);
    }
  };

  const mostrarToast = (mensaje, tipo = "success") => {
    setToast({ visible: true, mensaje, tipo });
    setTimeout(() => setToast({ visible: false, mensaje: "", tipo: "" }), 3000);
  };

  // Filtrar horarios del empleado actual
  const horariosEmpleado = horarios.filter(
    (h) =>
      h.nombre?.toLowerCase().includes(empleado.toLowerCase()) ||
      h.documento?.toLowerCase().includes(empleado.toLowerCase())
  );

  // Obtener horario por día
  const getHorarioPorDia = (dia) => {
    return horariosEmpleado.find((h) => h.dia === dia);
  };

  // Enviar solicitud de cambio
  const handleSolicitarCambio = (e) => {
    e.preventDefault();
    if (!solicitud.dia || !solicitud.motivo.trim()) {
      mostrarToast("Selecciona un día y escribe un motivo", "error");
      return;
    }

    // Guardar solicitud en localStorage (separado)
    const stored = localStorage.getItem(SOLICITUDES_KEY);
    const solicitudes = stored ? JSON.parse(stored) : [];
    solicitudes.push({
      id: Date.now(),
      empleado,
      dia: solicitud.dia,
      motivo: solicitud.motivo,
      estado: "Pendiente",
      fechaSolicitud: new Date().toISOString(),
    });
    localStorage.setItem(SOLICITUDES_KEY, JSON.stringify(solicitudes));
    mostrarToast(`Solicitud enviada para el día ${solicitud.dia}`, "success");
    setModalAbierto(false);
    setSolicitud({ dia: "", motivo: "" });
  };

  // Obtener color según rol
  const getColorRol = (rol) => {
    if (rol === "Seguridad") return "primary";
    if (rol === "Bartender") return "secondary";
    if (rol === "Server") return "tertiary";
    return "on-surface";
  };

  return (
    <>
      <NavbarEmpleado active="horario" />
      <main className="pt-24 pb-20 px-margin-mobile md:px-margin-desktop min-h-screen bg-[#050505]">
        <div className="max-w-6xl mx-auto">
          <header className="mb-lg">
            <h1 className="font-display-lg text-display-lg text-primary mb-2">Mi Horario</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              Visualiza tus turnos y solicita cambios si lo necesitas.
            </p>
            <p className="text-sm text-on-surface-variant mt-1">
              Empleado: <span className="text-primary font-bold">{empleado}</span>
            </p>
          </header>

          {loading ? (
            <div className="text-center text-on-surface-variant py-12">Cargando horario...</div>
          ) : horariosEmpleado.length === 0 ? (
            <div className="text-center text-on-surface-variant py-12 glass-card rounded-xl p-12">
              <span className="material-symbols-outlined text-6xl text-on-surface-variant/40 mb-4">event_busy</span>
              <p className="font-body-lg">No tienes turnos asignados aún.</p>
              <p className="text-sm">Contacta a tu supervisor para más información.</p>
            </div>
          ) : (
            <div className="glass-card rounded-xl p-md overflow-hidden">
              <div className="grid grid-cols-8 gap-1 border border-white/5 rounded-lg overflow-hidden bg-white/5">
                {/* Header */}
                <div className="p-2 bg-surface-container-high text-on-surface-variant font-label-md text-center border-b border-r border-white/5">
                  Día
                </div>
                {diasSemana.map((dia) => (
                  <div key={dia} className="p-2 bg-surface-container-high font-label-md text-center border-b border-r border-white/5">
                    {dia}
                  </div>
                ))}

                {/* Fila del empleado */}
                <div className="p-3 bg-surface-container border-b border-r border-white/5 flex items-center gap-2 col-span-1">
                  <div className="w-8 h-8 rounded-full bg-surface-variant overflow-hidden">
                    <img
                      className="w-full h-full object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuACoXGc4a1d7HOUx7q5fXp6KhHag81a3nDc_VH8_OCOJ8T9yuUlKDmy1l0H_7uMxCZaQI2Qr9U2NKTJs6cWOwvBm7OnCNKxa0iQaiu5qkf6UuCErZ7gTkN6v8xROE4C5WQ0Ye9qsYbp-6mX08OIpEgWrrBoGK9Dr-UWGJrzMWh5hDjy7z9UJiNMo3qLVCZLrKa9eZ7x57z3scakB4-GcVoiNlqPiFh7gYuw4wMjiUUiSj1zT84WyPLExlcbn-aGFAnN14e2d1W6jf8U"
                      alt={empleado}
                    />
                  </div>
                  <span className="text-xs font-label-md truncate">{empleado}</span>
                </div>
                {diasSemana.map((dia) => {
                  const horario = getHorarioPorDia(dia);
                  const rol = horario?.rol || "Seguridad";
                  const color = getColorRol(rol);
                  return (
                    <div key={dia} className="p-2 bg-surface-container/50 border-b border-r border-white/5 flex items-center justify-center col-span-1">
                      {horario ? (
                        <div
                          className={`w-full h-8 rounded flex items-center justify-center text-[10px] text-${color} bg-${color}/20 border border-${color}/40 cursor-pointer hover:brightness-110 transition-all`}
                          title={`${horario.horaInicio} - ${horario.horaFin}`}
                        >
                          {horario.horaInicio} - {horario.horaFin}
                        </div>
                      ) : (
                        <div className="w-full h-8 bg-white/5 border border-white/5 rounded flex items-center justify-center text-[10px] text-on-surface-variant">—</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Botón para solicitar cambio (solo si hay horarios) */}
          {horariosEmpleado.length > 0 && (
            <div className="mt-lg flex justify-center">
              <button
                onClick={() => setModalAbierto(true)}
                className="bg-primary text-on-primary px-8 py-3 rounded-xl font-label-md shadow-[0_0_20px_rgba(233,179,255,0.4)] hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined">edit_calendar</span>
                Solicitar Cambio de Turno
              </button>
            </div>
          )}
        </div>
      </main>

      {/* ===== MODAL DE SOLICITUD ===== */}
      {modalAbierto && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass-card rounded-2xl p-6 w-full max-w-md relative border border-white/20 shadow-2xl">
            <button
              onClick={() => setModalAbierto(false)}
              className="absolute top-3 right-3 text-on-surface-variant hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <h3 className="font-headline-md text-headline-md text-on-surface mb-4">Solicitar Cambio de Turno</h3>
            <form onSubmit={handleSolicitarCambio} className="space-y-4">
              <div>
                <label className="block text-xs font-label-md text-on-surface-variant mb-1">Día a cambiar</label>
                <select
                  value={solicitud.dia}
                  onChange={(e) => setSolicitud({ ...solicitud, dia: e.target.value })}
                  className="w-full bg-surface-container-high rounded-lg border border-white/10 px-3 py-2 text-on-surface focus:border-primary/50 focus:outline-none"
                  required
                >
                  <option value="">Seleccionar día</option>
                  {diasSemana.map((dia) => (
                    <option key={dia} value={dia}>
                      {dia}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-label-md text-on-surface-variant mb-1">Motivo del cambio</label>
                <textarea
                  value={solicitud.motivo}
                  onChange={(e) => setSolicitud({ ...solicitud, motivo: e.target.value })}
                  className="w-full bg-surface-container-high rounded-lg border border-white/10 px-3 py-2 text-on-surface focus:border-primary/50 focus:outline-none resize-none"
                  rows="3"
                  placeholder="Ej. Necesito cubrir un turno de mañana..."
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-primary text-on-primary py-2 rounded-xl font-label-md hover:brightness-110 transition-all active:scale-95"
                >
                  Enviar Solicitud
                </button>
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="flex-1 bg-surface-container-high border border-white/10 text-on-surface-variant py-2 rounded-xl font-label-md hover:bg-white/5 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== TOAST ===== */}
      {toast.visible && (
        <div
          className={`fixed bottom-24 right-8 glass-card rounded-xl px-md py-sm flex items-center gap-sm transition-all duration-300 z-[100] border ${
            toast.tipo === "error" ? "border-error/30" : "border-primary/30"
          }`}
        >
          <span className="material-symbols-outlined text-primary">check_circle</span>
          <div>
            <p className="text-on-surface font-bold text-sm">{toast.mensaje}</p>
          </div>
        </div>
      )}

      {/* ===== ESTILOS DE RESPALDO (idénticos a los del admin) ===== */}
      <style jsx>{`
        body, html {
          background-color: #050505 !important;
          margin: 0;
          padding: 0;
        }
        .pt-24 { padding-top: 6rem; }
        .pb-20 { padding-bottom: 5rem; }
        .min-h-screen { min-height: 100vh; }
        .px-margin-mobile { padding-left: 16px; padding-right: 16px; }
        .md\\:px-margin-desktop { padding-left: 48px; padding-right: 48px; }
        .max-w-6xl { max-width: 72rem; }
        .mx-auto { margin-left: auto; margin-right: auto; }
        .font-display-lg { font-family: Montserrat, sans-serif; font-size: 48px; line-height: 56px; letter-spacing: -0.02em; font-weight: 800; }
        .text-display-lg { font-size: 48px; line-height: 56px; letter-spacing: -0.02em; font-weight: 800; }
        .font-body-lg { font-family: Inter, sans-serif; font-size: 18px; line-height: 28px; font-weight: 400; }
        .text-body-lg { font-size: 18px; line-height: 28px; font-weight: 400; }
        .font-label-md { font-family: Inter, sans-serif; font-size: 14px; line-height: 20px; letter-spacing: 0.05em; font-weight: 600; }
        .text-label-md { font-size: 14px; line-height: 20px; letter-spacing: 0.05em; font-weight: 600; }
        .font-headline-md { font-family: Montserrat, sans-serif; font-size: 24px; line-height: 32px; font-weight: 600; }
        .text-headline-md { font-size: 24px; line-height: 32px; font-weight: 600; }
        .text-primary { color: #e9b3ff; }
        .text-on-surface { color: #e5e2e1; }
        .text-on-surface-variant { color: #d2c1d4; }
        .text-secondary { color: #ffb2b7; }
        .text-tertiary { color: #e7c448; }
        .text-error { color: #ffb4ab; }
        .text-on-primary { color: #510074; }
        .bg-primary { background-color: #e9b3ff; }
        .bg-primary\\/20 { background-color: rgba(233,179,255,0.2); }
        .bg-surface-container-high { background-color: #2a2a2a; }
        .bg-surface-container { background-color: #201f1f; }
        .bg-surface-variant { background-color: #353534; }
        .bg-white\\/5 { background-color: rgba(255,255,255,0.05); }
        .border-white\\/10 { border-color: rgba(255,255,255,0.1); }
        .border-white\\/5 { border-color: rgba(255,255,255,0.05); }
        .border-primary\\/40 { border-color: rgba(233,179,255,0.4); }
        .border-primary\\/30 { border-color: rgba(233,179,255,0.3); }
        .glass-card {
          background: rgba(28, 28, 30, 0.7);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
        }
        .shadow-\\[0_0_20px_rgba\\(233\\,179\\,255\\,0\\.4\\)\\] {
          box-shadow: 0 0 20px rgba(233,179,255,0.4);
        }
        .rounded-xl { border-radius: 0.75rem; }
        .rounded-lg { border-radius: 0.5rem; }
        .transition-all { transition: all 0.3s ease; }
        .active\\:scale-95:active { transform: scale(0.95); }
        .hover\\:brightness-110:hover { filter: brightness(1.1); }
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
        .mb-lg { margin-bottom: 40px; }
        .mb-2 { margin-bottom: 0.5rem; }
        .mt-lg { margin-top: 40px; }
        .mt-1 { margin-top: 0.25rem; }
        .py-12 { padding-top: 3rem; padding-bottom: 3rem; }
        .p-12 { padding: 3rem; }
        .p-6 { padding: 1.5rem; }
        .p-2 { padding: 0.5rem; }
        .p-3 { padding: 0.75rem; }
        .px-8 { padding-left: 2rem; padding-right: 2rem; }
        .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
        .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
        .gap-2 { gap: 0.5rem; }
        .gap-1 { gap: 0.25rem; }
        .grid { display: grid; }
        .grid-cols-8 { grid-template-columns: repeat(8, minmax(0, 1fr)); }
        .col-span-1 { grid-column: span 1 / span 1; }
        .text-center { text-align: center; }
        .text-xs { font-size: 0.75rem; line-height: 1rem; }
        .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
        .text-\\[10px\\] { font-size: 10px; }
        .text-6xl { font-size: 3.75rem; line-height: 1; }
        .truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .bg-\\[\\#050505\\] { background-color: #050505; }
        .w-8 { width: 2rem; }
        .h-8 { height: 2rem; }
        .h-full { height: 100%; }
        .w-full { width: 100%; }
        .object-cover { object-fit: cover; }
        .overflow-hidden { overflow: hidden; }
        .border { border-width: 1px; }
        .border-b { border-bottom-width: 1px; }
        .border-r { border-right-width: 1px; }
        .border-r { border-right-width: 1px; }
        .flex { display: flex; }
        .items-center { align-items: center; }
        .justify-center { justify-content: center; }
        .gap-2 { gap: 0.5rem; }
        .gap-4 { gap: 1rem; }
        .space-y-4 > * + * { margin-top: 1rem; }
        .bg-surface-container-highest { background-color: #353534; }
        .bg-surface-container-high { background-color: #2a2a2a; }
        .bg-surface-container/50 { background-color: rgba(32,31,31,0.5); }
        .bg-white/5 { background-color: rgba(255,255,255,0.05); }
        .cursor-pointer { cursor: pointer; }
        .resize-none { resize: none; }
        .border-error\\/30 { border-color: rgba(255,180,171,0.3); }
        .fixed { position: fixed; }
        .bottom-24 { bottom: 6rem; }
        .right-8 { right: 2rem; }
        .z-\\[100\\] { z-index: 100; }
        .z-\\[200\\] { z-index: 200; }
        .inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
        .bg-black\\/70 { background-color: rgba(0,0,0,0.7); }
        .backdrop-blur-sm { backdrop-filter: blur(4px); }
        .shadow-2xl { box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); }
        @media (min-width: 768px) {
          .md\\:px-margin-desktop { padding-left: 48px; padding-right: 48px; }
        }
      `}</style>
    </>
  );
};

export default EmpleadoHorarios;