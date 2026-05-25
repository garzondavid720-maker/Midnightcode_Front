import { useState, useEffect, useCallback } from "react";
import api from "../../../services/api";

const fmt = (n) => "$" + Number(n).toLocaleString("es-CO");

export default function ReservationPage({ event, onBack }) {
  const [step, setStep]             = useState(1);
  const [mesas, setMesas]           = useState([]);
  const [parqueaderos, setParqs]    = useState([]);
  const [loadingMesas, setLoadM]    = useState(true);
  const [selectedMesa, setMesa]     = useState(null);
  const [selectedParq, setParq]     = useState(null);
  const [personas, setPersonas]     = useState(1);
  const [cover, setCover]           = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState("");
  const [done, setDone]             = useState(false);
  const [reservaId, setReservaId]   = useState(null);

  const eventFecha = event?.fecha ? new Date(event.fecha).toISOString().split("T")[0] : "";
  const eventHora  = event?.hora  ? event.hora.slice(0, 5) : "21:00";

  const loadDisponibles = useCallback(async () => {
    if (!eventFecha || !eventHora) return;
    setLoadM(true);
    try {
      const [rm, rp] = await Promise.all([
        api.get(`/reservas/mesas-disponibles?fecha=${eventFecha}&hora=${eventHora}`),
        api.get(`/reservas/parqueaderos-disponibles?fecha=${eventFecha}&hora=${eventHora}`),
      ]);
      if (rm.data.success)  setMesas(rm.data.data || []);
      if (rp.data.success)  setParqs(rp.data.data || []);
    } catch {
      setMesas([]);
      setParqs([]);
    } finally {
      setLoadM(false);
    }
  }, [eventFecha, eventHora]);

  useEffect(() => { loadDisponibles(); }, [loadDisponibles]);

  const handleConfirm = async () => {
    if (!selectedMesa) { setError("Selecciona una mesa"); return; }
    setSubmitting(true);
    setError("");
    try {
      const payload = {
        cod_mesa:          selectedMesa.cod_mesa,
        cod_parqueadero:   selectedParq?.cod_parqueadero || null,
        fecha_reserva:     eventFecha,
        hora_reserva:      eventHora,
        cantidad_personas: Number(personas),
        incluye_cover:     cover,
      };
      const { data } = await api.post("/reservas", payload);
      if (data.success || data.id_reserva || data.data?.id_reserva) {
        setReservaId(data.data?.id_reserva || data.id_reserva || "");
        setDone(true);
      } else {
        setError(data.message || "Error al crear la reserva");
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || "Error al crear la reserva";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success screen ─────────────────────────────────────────────────────────
  if (done) return (
    <div style={{ minHeight:"100vh", background:"#080810", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Syne',sans-serif", padding:"32px" }}>
      <div style={{ textAlign:"center", maxWidth:"420px", padding:"40px" }}>
        <div style={{ width:"72px", height:"72px", borderRadius:"50%", background:"rgba(0,200,122,0.12)", border:"2px solid #00c87a", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 28px", fontSize:"28px", color:"#00c87a" }}>✓</div>
        <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"30px", color:"#fff", margin:"0 0 10px" }}>¡Reserva Confirmada!</h2>
        <p style={{ color:"#6b6b8a", fontFamily:"'Space Mono',monospace", fontSize:"12px", margin:"0 0 24px" }}>{event?.nombre || event?.name} — {eventFecha}</p>
        <div style={{ background:"#0d0d1a", borderRadius:"14px", padding:"18px", marginBottom:"28px", textAlign:"left" }}>
          {[
            ["Mesa",       `#${selectedMesa?.numero_mesa} (${selectedMesa?.tipo_mesa || "Normal"})`],
            ["Personas",   personas],
            ["Cover",      cover ? "Incluido" : "No incluido"],
            selectedParq ? ["Parqueadero", `#${selectedParq?.numero_par}`] : null,
            ["Estado",     "Pendiente de confirmación"],
          ].filter(Boolean).map(([k, v], i) => (
            <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom: i < 4 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
              <span style={{ color:"#6b6b8a", fontSize:"12px", fontFamily:"'Space Mono',monospace" }}>{k}</span>
              <span style={{ color:"#fff", fontSize:"13px", fontWeight:600 }}>{v}</span>
            </div>
          ))}
        </div>
        <p style={{ color:"#4a4a6a", fontSize:"11px", fontFamily:"'Space Mono',monospace", marginBottom:"24px" }}>El equipo confirmará tu reserva próximamente.</p>
        <button onClick={onBack} style={{ padding:"13px 30px", background:"linear-gradient(135deg,#8a2be2,#d400ff)", border:"none", borderRadius:"12px", color:"#fff", fontSize:"14px", fontWeight:700, fontFamily:"'Syne',sans-serif", cursor:"pointer" }}>
          Volver al Dashboard
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#080810", padding:"32px 40px", fontFamily:"'Syne',sans-serif", display:"flex", justifyContent:"center" }}>
    <div style={{ width:"100%", maxWidth:"900px" }}>
      <style>{`
        .res-card{transition:all .2s;cursor:pointer} .res-card:hover{transform:translateY(-2px)}
        .btn-p{transition:all .18s;cursor:pointer} .btn-p:not(:disabled):hover{opacity:.82}
        .btn-ghost{transition:all .18s;cursor:pointer} .btn-ghost:hover{border-color:rgba(255,255,255,.2)!important;color:#fff!important}
      `}</style>

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", gap:"14px", marginBottom:"36px" }}>
        <button onClick={onBack} style={{ padding:"9px 14px", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"10px", color:"#6b6b8a", fontSize:"13px", cursor:"pointer", fontFamily:"'Space Mono',monospace" }}>← Volver</button>
        <div>
          <p style={{ color:"#4a4a6a", fontSize:"10px", letterSpacing:"3px", textTransform:"uppercase", margin:"0 0 3px", fontFamily:"'Space Mono',monospace" }}>Reserva de evento</p>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"24px", color:"#fff", margin:0 }}>{event?.nombre || event?.name} <span style={{ color:"#4a4a6a", fontSize:"16px", fontWeight:400 }}>— {eventFecha}</span></h2>
        </div>
      </div>

      {/* Steps indicator */}
      <div style={{ display:"flex", gap:"6px", marginBottom:"32px", alignItems:"center" }}>
        {["Selecciona mesa", "Detalles", "Confirmar"].map((s, i) => (
          <span key={i} style={{ display:"flex", alignItems:"center", gap:"7px" }}>
            <span style={{ display:"flex", alignItems:"center", gap:"7px" }}>
              <span style={{ width:"24px", height:"24px", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"10px", fontWeight:700, fontFamily:"'Space Mono',monospace", background: step > i+1 ? "#00c87a" : step === i+1 ? "linear-gradient(135deg,#8a2be2,#d400ff)" : "transparent", color: step >= i+1 ? "#080810" : "#4a4a6a", border: step < i+1 ? "1px solid rgba(255,255,255,0.1)" : "none" }}>
                {step > i+1 ? "✓" : i+1}
              </span>
              <span style={{ color: step === i+1 ? "#fff" : "#4a4a6a", fontSize:"11px", fontFamily:"'Space Mono',monospace" }}>{s}</span>
            </span>
            {i < 2 && <span style={{ color:"#1e1e2e", margin:"0 4px" }}>—</span>}
          </span>
        ))}
      </div>

      {/* ── STEP 1: Select mesa ── */}
      {step === 1 && (
        <div>
          <p style={{ color:"#4a4a6a", fontSize:"10px", letterSpacing:"2px", textTransform:"uppercase", margin:"0 0 16px", fontFamily:"'Space Mono',monospace" }}>
            Mesas disponibles para <span style={{ color:"#c084fc" }}>{eventFecha} · {eventHora}</span>
          </p>
          {loadingMesas ? (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"12px" }}>
              {[1,2,3].map(i => <div key={i} style={{ height:"100px", background:"rgba(255,255,255,0.03)", borderRadius:"14px" }} />)}
            </div>
          ) : mesas.length === 0 ? (
            <div style={{ background:"#0d0d1a", borderRadius:"16px", padding:"32px", textAlign:"center", border:"1px solid rgba(255,255,255,0.06)" }}>
              <p style={{ color:"#6b6b8a", fontFamily:"'Space Mono',monospace", fontSize:"13px" }}>No hay mesas disponibles para este horario.</p>
            </div>
          ) : (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(200px,1fr))", gap:"12px", marginBottom:"24px" }}>
              {mesas.map(m => {
                const sel = selectedMesa?.cod_mesa === m.cod_mesa;
                const isVip = m.tipo_mesa === "VIP";
                const color = isVip ? "#d400ff" : "#8a2be2";
                return (
                  <div key={m.cod_mesa} className="res-card" onClick={() => setMesa(m)}
                    style={{ background:"#0d0d1a", border:`1px solid ${sel ? color : "rgba(255,255,255,0.06)"}`, borderRadius:"14px", padding:"18px", position:"relative", boxShadow: sel ? `0 0 16px ${color}33` : "none" }}>
                    {sel && <div style={{ position:"absolute", top:"10px", right:"10px", width:"18px", height:"18px", borderRadius:"50%", background:color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"9px", color:"#fff" }}>✓</div>}
                    <p style={{ color:"#4a4a6a", fontSize:"9px", letterSpacing:"2px", textTransform:"uppercase", fontFamily:"'Space Mono',monospace", margin:"0 0 6px" }}>{isVip ? "⬡ VIP" : "◈ Normal"}</p>
                    <p style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:"18px", color:"#fff", margin:"0 0 4px" }}>Mesa #{m.numero_mesa}</p>
                    <p style={{ color: isVip ? "#d400ff" : "#8a2be2", fontFamily:"'Space Mono',monospace", fontSize:"11px", margin:"0 0 8px" }}>Hasta {m.capacidad_mesa} personas</p>
                    <p style={{ color:"#c084fc", fontFamily:"'Space Mono',monospace", fontWeight:700, fontSize:"14px", margin:0 }}>{fmt(m.precio_reserva)}</p>
                  </div>
                );
              })}
            </div>
          )}

          {parqueaderos.length > 0 && (
            <>
              <p style={{ color:"#4a4a6a", fontSize:"10px", letterSpacing:"2px", textTransform:"uppercase", margin:"24px 0 12px", fontFamily:"'Space Mono',monospace" }}>Parqueadero — opcional</p>
              <div style={{ display:"flex", gap:"10px", flexWrap:"wrap", marginBottom:"24px" }}>
                {parqueaderos.map(p => {
                  const sel = selectedParq?.cod_parqueadero === p.cod_parqueadero;
                  return (
                    <div key={p.cod_parqueadero} className="res-card" onClick={() => setParq(sel ? null : p)}
                      style={{ background:"#0d0d1a", border:`1px solid ${sel ? "#00c87a" : "rgba(255,255,255,0.06)"}`, borderRadius:"12px", padding:"14px 18px", minWidth:"150px" }}>
                      <p style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:"14px", color:"#fff", margin:"0 0 2px" }}>Parqueadero #{p.numero_par}</p>
                      <p style={{ color:"#00c87a", fontFamily:"'Space Mono',monospace", fontSize:"12px", margin:0 }}>{fmt(p.precio_parqueadero)}</p>
                      {sel && <p style={{ color:"#4a4a6a", fontSize:"10px", fontFamily:"'Space Mono',monospace", margin:"4px 0 0" }}>Clic para quitar</p>}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          <div style={{ display:"flex", justifyContent:"flex-end" }}>
            <button className="btn-p" onClick={() => { if (!selectedMesa) return; setStep(2); }} disabled={!selectedMesa}
              style={{ padding:"13px 28px", background: selectedMesa ? "linear-gradient(135deg,#8a2be2,#d400ff)" : "rgba(255,255,255,0.05)", border:"none", borderRadius:"12px", color: selectedMesa ? "#fff" : "#3a3a5a", fontSize:"14px", fontWeight:700, fontFamily:"'Syne',sans-serif", cursor: selectedMesa ? "pointer" : "not-allowed" }}>
              Continuar →
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 2: Detalles ── */}
      {step === 2 && (
        <div style={{ maxWidth:"480px" }}>
          {/* Mesa elegida */}
          <div style={{ background:"#0d0d1a", border:"1px solid rgba(138,43,226,0.2)", borderRadius:"14px", padding:"16px 20px", marginBottom:"24px" }}>
            <p style={{ color:"#4a4a6a", fontSize:"10px", letterSpacing:"2px", textTransform:"uppercase", fontFamily:"'Space Mono',monospace", margin:"0 0 8px" }}>Mesa seleccionada</p>
            <p style={{ color:"#fff", fontWeight:700, fontSize:"16px", margin:"0 0 2px" }}>Mesa #{selectedMesa.numero_mesa} · {selectedMesa.tipo_mesa}</p>
            <p style={{ color:"#c084fc", fontFamily:"'Space Mono',monospace", fontSize:"12px", margin:0 }}>Capacidad: hasta {selectedMesa.capacidad_mesa} personas · {fmt(selectedMesa.precio_reserva)}</p>
            {selectedParq && <p style={{ color:"#00c87a", fontFamily:"'Space Mono',monospace", fontSize:"12px", marginTop:"6px" }}>+ Parqueadero #{selectedParq.numero_par}</p>}
          </div>

          {/* Cantidad de personas */}
          <div style={{ marginBottom:"20px" }}>
            <label style={{ display:"block", color:"#6b6b8a", fontSize:"10px", fontFamily:"'Space Mono',monospace", marginBottom:"8px", letterSpacing:"1px", textTransform:"uppercase" }}>Número de personas *</label>
            <input type="number" min={1} max={selectedMesa.capacidad_mesa} value={personas}
              onChange={e => setPersonas(Math.max(1, Math.min(selectedMesa.capacidad_mesa, Number(e.target.value))))}
              style={{ width:"100%", background:"#080810", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"11px", padding:"13px 15px", color:"#fff", fontSize:"16px", fontFamily:"'Syne',sans-serif", boxSizing:"border-box" }} />
            <p style={{ color:"#4a4a6a", fontSize:"10px", fontFamily:"'Space Mono',monospace", marginTop:"6px" }}>Máximo {selectedMesa.capacidad_mesa} personas para esta mesa</p>
          </div>

          {/* Cover */}
          <div style={{ marginBottom:"28px" }}>
            <label style={{ display:"block", color:"#6b6b8a", fontSize:"10px", fontFamily:"'Space Mono',monospace", marginBottom:"8px", letterSpacing:"1px", textTransform:"uppercase" }}>¿Incluye cover de entrada?</label>
            <div style={{ display:"flex", gap:"10px" }}>
              {[{ val:true, label:"Sí, incluir cover" }, { val:false, label:"No incluir" }].map(opt => (
                <button key={String(opt.val)} onClick={() => setCover(opt.val)}
                  style={{ flex:1, padding:"12px", background: cover === opt.val ? "rgba(138,43,226,0.15)" : "#080810", border:`1px solid ${cover === opt.val ? "#8a2be2" : "rgba(255,255,255,0.08)"}`, borderRadius:"11px", color: cover === opt.val ? "#c084fc" : "#6b6b8a", fontSize:"13px", fontWeight:600, fontFamily:"'Syne',sans-serif", cursor:"pointer", transition:"all .18s" }}>
                  {opt.label}
                </button>
              ))}
            </div>
            {event?.precio && cover && <p style={{ color:"#4a4a6a", fontSize:"10px", fontFamily:"'Space Mono',monospace", marginTop:"6px" }}>Cover del evento: {fmt(event.precio)} por persona</p>}
          </div>

          <div style={{ display:"flex", gap:"10px" }}>
            <button className="btn-ghost" onClick={() => setStep(1)} style={{ padding:"13px 22px", background:"transparent", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"12px", color:"#6b6b8a", fontSize:"13px", fontFamily:"'Syne',sans-serif", cursor:"pointer" }}>← Atrás</button>
            <button className="btn-p" onClick={() => setStep(3)} style={{ flex:1, padding:"13px", background:"linear-gradient(135deg,#8a2be2,#d400ff)", border:"none", borderRadius:"12px", color:"#fff", fontSize:"14px", fontWeight:700, fontFamily:"'Syne',sans-serif", cursor:"pointer" }}>Revisar reserva →</button>
          </div>
        </div>
      )}

      {/* ── STEP 3: Confirm ── */}
      {step === 3 && (
        <div style={{ maxWidth:"480px" }}>
          <div style={{ background:"#0d0d1a", border:"1px solid rgba(138,43,226,0.18)", borderRadius:"18px", padding:"26px", marginBottom:"18px" }}>
            <p style={{ color:"#4a4a6a", fontSize:"10px", letterSpacing:"3px", textTransform:"uppercase", margin:"0 0 18px", fontFamily:"'Space Mono',monospace" }}>Resumen de tu reserva</p>
            {[
              ["Evento",      event?.nombre || event?.name],
              ["Fecha",       eventFecha],
              ["Hora",        eventHora],
              ["Mesa",        `#${selectedMesa.numero_mesa} · ${selectedMesa.tipo_mesa}`],
              ["Personas",    personas],
              ["Cover",       cover ? "Incluido" : "No incluido"],
              selectedParq ? ["Parqueadero", `#${selectedParq.numero_par}`] : null,
            ].filter(Boolean).map(([k, v], i, arr) => (
              <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom: i < arr.length-1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                <span style={{ color:"#4a4a6a", fontSize:"12px", fontFamily:"'Space Mono',monospace" }}>{k}</span>
                <span style={{ color:"#fff", fontSize:"13px", fontWeight:600 }}>{v}</span>
              </div>
            ))}
            <div style={{ display:"flex", justifyContent:"space-between", paddingTop:"14px", marginTop:"4px", borderTop:"1px solid rgba(255,255,255,0.08)" }}>
              <span style={{ color:"#6b6b8a", fontSize:"12px", fontFamily:"'Space Mono',monospace" }}>Reserva de mesa</span>
              <span style={{ color:"#c084fc", fontFamily:"'Space Mono',monospace", fontSize:"16px", fontWeight:700 }}>{fmt(selectedMesa.precio_reserva)}</span>
            </div>
          </div>

          {error && (
            <div style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:"12px", padding:"12px 16px", marginBottom:"16px", color:"#f87171", fontSize:"13px", fontFamily:"'Space Mono',monospace" }}>
              {error}
            </div>
          )}

          <div style={{ display:"flex", gap:"10px" }}>
            <button className="btn-ghost" onClick={() => { setError(""); setStep(2); }} style={{ padding:"13px 22px", background:"transparent", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"12px", color:"#6b6b8a", fontSize:"13px", fontFamily:"'Syne',sans-serif", cursor:"pointer" }}>← Atrás</button>
            <button className="btn-p" onClick={handleConfirm} disabled={submitting}
              style={{ flex:1, padding:"13px", background: submitting ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg,#00b86b,#00f5a0)", border:"none", borderRadius:"12px", color: submitting ? "#4a4a6a" : "#080810", fontSize:"14px", fontWeight:700, fontFamily:"'Syne',sans-serif", cursor: submitting ? "not-allowed" : "pointer" }}>
              {submitting ? "Confirmando..." : "✓ Confirmar reserva"}
            </button>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
