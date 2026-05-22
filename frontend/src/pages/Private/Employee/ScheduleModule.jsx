// ScheduleModule — conectado a API real + socket en tiempo real
import { useState, useEffect, useCallback } from "react";
import { io } from "socket.io-client";
import api from "../../../services/api";

const SOCKET_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace("/api", "")
  : "http://localhost:3000";

const DIAS_ES = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
const DIA_PRISMA = { "Lunes":"Lunes","Martes":"Martes","Miercoles":"Miércoles","Jueves":"Jueves","Viernes":"Viernes","Sabado":"Sábado","Domingo":"Domingo" };
const SEMANA = ["Lunes","Martes","Miercoles","Jueves","Viernes","Sabado","Domingo"];

const S = { mono:"'Space Mono',monospace", syne:"'Syne',sans-serif" };

function horaDisplay(dateVal) {
  if (!dateVal) return "--:--";
  const d = new Date(dateVal);
  return `${String(d.getUTCHours()).padStart(2,"0")}:${String(d.getUTCMinutes()).padStart(2,"0")}`;
}

function duracion(entrada, salida) {
  if (!entrada || !salida) return "";
  const e = new Date(entrada);
  const s = new Date(salida);
  let diff = (s.getUTCHours() * 60 + s.getUTCMinutes()) - (e.getUTCHours() * 60 + e.getUTCMinutes());
  if (diff < 0) diff += 24 * 60;
  return `${Math.floor(diff/60)}h${diff%60 > 0 ? ` ${diff%60}m` : ""}`;
}

function verificarEnTurnoAhora(horarios) {
  const now    = new Date();
  const diaHoy = DIAS_ES[now.getDay()]; // "Lunes", "Martes", etc.
  const minAhora = now.getHours() * 60 + now.getMinutes();

  for (const h of horarios) {
    const diaNombre = DIA_PRISMA[h.dia_semana] || h.dia_semana;
    if (diaNombre !== diaHoy || !h.estado) continue;
    const e   = new Date(h.hora_entrada);
    const sal = new Date(h.hora_salida);
    const minE = e.getUTCHours() * 60 + e.getUTCMinutes();
    const minS = sal.getUTCHours() * 60 + sal.getUTCMinutes();
    if (minS > minE) {
      if (minAhora >= minE && minAhora <= minS) return true;
    } else {
      if (minAhora >= minE || minAhora <= minS) return true;
    }
  }
  return false;
}

export default function ScheduleModule({ user }) {
  const [horarios,    setHorarios]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [selectedDia, setSelectedDia] = useState(null);
  const [enTurno,     setEnTurno]     = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const doc = user?.id || user?.doc_identidad;
      const { data } = await api.get(`/horarios/usuario/${doc}`);
      if (data.success) {
        setHorarios(data.data || []);
        setEnTurno(verificarEnTurnoAhora(data.data || []));
      }
    } catch { setHorarios([]); } finally { setLoading(false); }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  // Socket: actualización en tiempo real cuando admin modifica horario
  useEffect(() => {
    const token = localStorage.getItem("neon_token");
    if (!token) return;
    const socket = io(SOCKET_URL, { auth: { token }, transports: ["websocket","polling"] });
    socket.on("actualizarHorarios", () => load());
    return () => socket.disconnect();
  }, [load]);

  // Determinar el día actual (0=Lunes,...,6=Domingo en el enum)
  const diaHoyIdx = (new Date().getDay() + 6) % 7; // 0=Lunes
  const diaActual = SEMANA[diaHoyIdx];

  const horarioDeHoy = horarios.filter(h => h.dia_semana === diaActual && h.estado);
  const totalTurnos  = horarios.filter(h => h.estado).length;

  // Agrupar por día
  const byDia = SEMANA.reduce((acc, dia) => {
    acc[dia] = horarios.filter(h => h.dia_semana === dia && h.estado);
    return acc;
  }, {});

  const diaSeleccionado = selectedDia ?? diaActual;
  const turnosDia = byDia[diaSeleccionado] || [];

  if (loading) return (
    <div style={{ display:"flex", justifyContent:"center", padding:"60px", color:"#4a4a6a", fontFamily:S.mono, fontSize:"13px" }}>
      Cargando horario…
    </div>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"20px" }}>

      {/* Estado de turno actual */}
      <div style={{ padding:"16px 20px", background: enTurno ? "rgba(0,245,160,0.08)" : "rgba(255,56,86,0.06)", border:`1px solid ${enTurno?"rgba(0,245,160,0.3)":"rgba(255,56,86,0.2)"}`, borderRadius:"14px", display:"flex", alignItems:"center", gap:"12px" }}>
        <div style={{ width:"10px", height:"10px", borderRadius:"50%", background: enTurno?"#00f5a0":"#ff3860", boxShadow: enTurno?"0 0 8px #00f5a0":"0 0 8px #ff3860", animation:"pulse 2s infinite", flexShrink:0 }} />
        <div>
          <p style={{ fontFamily:S.syne, fontWeight:700, fontSize:"15px", color: enTurno?"#00f5a0":"#ff3860", margin:"0 0 2px" }}>
            {enTurno ? "En turno laboral" : "Fuera de turno"}
          </p>
          <p style={{ fontFamily:S.mono, fontSize:"11px", color:"#4a4a6a", margin:0 }}>
            {enTurno ? "Puedes registrar ventas y operaciones" : "No puedes registrar ventas fuera de horario"}
          </p>
        </div>
      </div>

      {/* Stats semana */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"12px" }}>
        {[
          { l:"Turnos esta semana", v: totalTurnos,    c:"#c084fc" },
          { l:"Turno hoy",         v: horarioDeHoy.length > 0 ? "✓ Sí" : "— No", c: horarioDeHoy.length > 0 ? "#00f5a0" : "#4a4a6a" },
          { l:"Días libres",       v: `${7 - SEMANA.filter(d => byDia[d]?.length > 0).length}`,  c:"#fff" },
        ].map((s,i) => (
          <div key={i} style={{ background:"#0d0d1a", border:"1px solid rgba(138,43,226,0.1)", borderRadius:"12px", padding:"16px 18px" }}>
            <p style={{ fontFamily:S.mono, fontSize:"9px", color:"#4a4a6a", margin:"0 0 6px", textTransform:"uppercase", letterSpacing:"1px" }}>{s.l}</p>
            <p style={{ fontFamily:S.syne, fontWeight:800, fontSize:"20px", color:s.c, margin:0 }}>{s.v}</p>
          </div>
        ))}
      </div>

      {/* Semana visual */}
      <div style={{ background:"#0d0d1a", border:"1px solid rgba(138,43,226,0.1)", borderRadius:"16px", padding:"20px 24px" }}>
        <p style={{ fontFamily:S.syne, fontWeight:700, fontSize:"14px", color:"#fff", margin:"0 0 16px" }}>Semana actual</p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:"8px" }}>
          {SEMANA.map((dia, i) => {
            const turnos   = byDia[dia] || [];
            const isHoy    = i === diaHoyIdx;
            const isSel    = dia === diaSeleccionado;
            return (
              <div key={dia} onClick={() => setSelectedDia(dia)}
                style={{ borderRadius:"12px", padding:"10px 6px", cursor:"pointer", textAlign:"center", background:isSel?"rgba(138,43,226,0.2)":isHoy?"rgba(138,43,226,0.08)":"#080810", border:`1px solid ${isSel?"rgba(138,43,226,0.5)":isHoy?"rgba(138,43,226,0.25)":"rgba(255,255,255,0.04)"}`, transition:"all .15s" }}>
                <p style={{ fontFamily:S.mono, fontSize:"9px", color:isHoy?"#c084fc":"#4a4a6a", margin:"0 0 5px", letterSpacing:"1px" }}>
                  {dia.slice(0,3).toUpperCase()}
                </p>
                {isHoy && <p style={{ fontFamily:S.mono, fontSize:"7px", color:"#c084fc", margin:"0 0 5px", background:"rgba(138,43,226,0.2)", borderRadius:"4px", padding:"1px 3px" }}>HOY</p>}
                {turnos.length > 0 ? (
                  <>
                    <div style={{ width:"7px", height:"7px", borderRadius:"50%", background:"#c084fc", margin:"0 auto 4px" }} />
                    <p style={{ fontFamily:S.mono, fontSize:"8px", color:"#fff", margin:0 }}>{horaDisplay(turnos[0].hora_entrada)}</p>
                  </>
                ) : (
                  <>
                    <div style={{ width:"7px", height:"7px", borderRadius:"50%", background:"#2a2a3e", margin:"0 auto 4px" }} />
                    <p style={{ fontFamily:S.mono, fontSize:"8px", color:"#2a2a3e", margin:0 }}>Libre</p>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Detalle del día seleccionado */}
      {turnosDia.length > 0 ? (
        <div style={{ background:"#0d0d1a", border:"1px solid rgba(138,43,226,0.15)", borderRadius:"16px", padding:"24px" }}>
          <p style={{ fontFamily:S.mono, fontSize:"10px", color:"#4a4a6a", margin:"0 0 4px", letterSpacing:"2px", textTransform:"uppercase" }}>
            {DIA_PRISMA[diaSeleccionado] || diaSeleccionado}{diaSeleccionado === diaActual ? " · HOY" : ""}
          </p>
          {turnosDia.map((h, i) => (
            <div key={h.id_horario} style={{ marginBottom: i < turnosDia.length - 1 ? "16px" : 0 }}>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"12px" }}>
                {[
                  { l:"Entrada",  v: horaDisplay(h.hora_entrada) },
                  { l:"Salida",   v: horaDisplay(h.hora_salida)  },
                  { l:"Duración", v: duracion(h.hora_entrada, h.hora_salida) },
                ].map((d,j) => (
                  <div key={j} style={{ background:"#080810", borderRadius:"10px", padding:"12px 14px" }}>
                    <p style={{ fontFamily:S.mono, fontSize:"9px", color:"#4a4a6a", margin:"0 0 4px", textTransform:"uppercase", letterSpacing:"1px" }}>{d.l}</p>
                    <p style={{ fontFamily:S.syne, fontWeight:700, fontSize:"18px", color:"#fff", margin:0 }}>{d.v}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ background:"#0d0d1a", border:"1px dashed rgba(255,255,255,0.06)", borderRadius:"16px", padding:"32px", textAlign:"center" }}>
          <p style={{ fontSize:"28px", margin:"0 0 10px" }}>😴</p>
          <p style={{ fontFamily:S.syne, fontWeight:700, fontSize:"16px", color:"#fff", margin:"0 0 4px" }}>Día libre</p>
          <p style={{ fontFamily:S.mono, fontSize:"11px", color:"#4a4a6a", margin:0 }}>
            {DIA_PRISMA[diaSeleccionado] || diaSeleccionado} — Sin turno asignado
          </p>
        </div>
      )}

      {horarios.length === 0 && !loading && (
        <div style={{ background:"rgba(255,193,7,0.06)", border:"1px solid rgba(255,193,7,0.2)", borderRadius:"12px", padding:"20px", textAlign:"center" }}>
          <p style={{ fontFamily:S.mono, fontSize:"12px", color:"#ffc107", margin:0 }}>
            📋 No tienes horarios asignados aún. Contacta con el administrador.
          </p>
        </div>
      )}
    </div>
  );
}
