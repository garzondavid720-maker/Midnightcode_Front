import React, { useState, useMemo } from "react";

// Tipos de reserva y opciones, con precios y beneficios asociados
const TYPES = [
  {
    id: "asistencia", icon: "◈", label: "Asistencia", color: "#8a2be2",
    opts: [
      { id: "gen", label: "General", price: 80000, perks: ["Acceso zona principal", "Cerveza incluida"] },
      { id: "prem", label: "Premium", price: 120000, perks: ["Acceso preferencial", "Botella incluida", "Meet & Greet"] },
    ],
  },
  {
    id: "mesa", icon: "⬡", label: "Mesa", color: "#d400ff",
    opts: [
      { id: "m2", label: "Mesa 2 pax", price: 200000, perks: ["Zona central", "2 entradas incl.", "Botella cortesía"] },
      { id: "m4", label: "Mesa 4 pax", price: 350000, perks: ["Zona central", "4 entradas incl.", "2 botellas"] },
      { id: "m8", label: "Mesa 8 pax", price: 600000, perks: ["Mesa privada", "8 entradas incl.", "3 botellas + servicio"] },
    ],
  },
  {
    id: "vip", icon: "◆", label: "Zona VIP", color: "#ff6b35",
    opts: [
      { id: "v1", label: "VIP Individual", price: 250000, perks: ["Acceso zona VIP", "Silla reservada", "Mesero", "2 bebidas premium", "Meet & Greet"] },
      { id: "vg", label: "VIP Grupo ×5", price: 900000, perks: ["Mesa VIP", "5 entradas", "Botella Don julio 70años", "Servicio dedicado"] },
    ],
  },
  {
    id: "parqueadero", icon: "⬢", label: "Parqueadero", color: "#00c87a",
    opts: [
      { id: "moto", label: "Moto", price: 15000, perks: ["Zona cubierta", "Vigilancia 24h", "Tarifa plena"] },
      { id: "carro", label: "Carro", price: 25000, perks: ["Zona Cubierta", "Vigilancia 24h", "Salida prioritaria", "Tarifa plena"] },
      { id: "vprem", label: "Carro Premium", price: 45000, perks: ["Zona VIP parking", "Vigilancia 24h", "Valet parking", "Tarifa plena"] },
    ],
  },
];

// Formateo de precios a formato moneda local

const fmt = (n) => "$" + n.toLocaleString("es-CO");

export default function ReservationPage({ event, onBack }) {
  const [step, setStep] = useState(1);
  const [activeType, setActiveType] = useState("asistencia");
  const [cart, setCart] = useState({});
  const [form, setForm] = useState({ name: "", email: "", phone: "", notes: "" });
  const [done, setDone] = useState(false);

// Función para agregar o quitar opciones del carrito de reserva

  const toggleOpt = (typeId, opt) => {
    setCart((prev) => {
      const cur = prev[typeId];
      if (cur && cur.id === opt.id) { const n = { ...prev }; delete n[typeId]; return n; }
      return { ...prev, [typeId]: { ...opt, typeId } };
    });
  };

// Cálculo de items en el carrito y total acumulado, con memoización para optimizar rendimiento

  const cartItems = useMemo(() => Object.values(cart), [cart]);
  const total = useMemo(() => cartItems.reduce((s, i) => s + i.price, 0), [cartItems]);
  const curType = TYPES.find((t) => t.id === activeType);

  if (done) return (
    <div style={{ minHeight: "100vh", background: "#080810", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Syne',sans-serif", padding: "32px" }}>
      <div style={{ textAlign: "center", maxWidth: "420px", padding: "40px" }}>
        <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "rgba(0,200,122,0.12)", border: "2px solid #00c87a", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 28px", fontSize: "28px", color: "#00c87a" }}>✓</div>
        <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "30px", color: "#fff", margin: "0 0 10px" }}>¡Reserva Confirmada!</h2>
        <p style={{ color: "#6b6b8a", fontFamily: "'Space Mono',monospace", fontSize: "12px", margin: "0 0 20px" }}>{event?.name} — {event?.date}</p>
        <div style={{ background: "#0d0d1a", borderRadius: "14px", padding: "18px", marginBottom: "28px" }}>
          {cartItems.map((item, i) => {
            const t = TYPES.find((x) => x.id === item.typeId);
            return (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < cartItems.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                <span style={{ color: "#d1d1e0", fontSize: "13px" }}><span style={{ color: t.color }}>{t.icon}</span> {t.label} — {item.label}</span>
                <span style={{ color: "#fff", fontFamily: "'Space Mono',monospace", fontSize: "12px", fontWeight: 700 }}>{fmt(item.price)}</span>
              </div>
            );
          })}
          <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "12px", marginTop: "4px" }}>
            <span style={{ color: "#6b6b8a", fontSize: "12px", fontFamily: "'Space Mono',monospace" }}>TOTAL</span>
            <span style={{ color: "#c084fc", fontFamily: "'Space Mono',monospace", fontSize: "16px", fontWeight: 700 }}>{fmt(total)}</span>
          </div>
        </div>
        <button onClick={onBack} style={{ padding: "13px 30px", background: "linear-gradient(135deg,#8a2be2,#d400ff)", border: "none", borderRadius: "12px", color: "#fff", fontSize: "14px", fontWeight: 700, fontFamily: "'Syne',sans-serif", cursor: "pointer" }}>
          Volver al Dashboard
        </button>
      </div>
    </div>
  );

// Renderizado de la interfaz de reserva, con navegación entre pasos y selección de servicios

  return (
    <div style={{ minHeight: "100vh", background: "#080810", padding: "32px 40px", fontFamily: "'Syne',sans-serif", display: "flex", justifyContent: "center" }}>
    <div style={{ width: "100%", maxWidth: "1100px" }}>
      <style>{`
        .opt-card{transition:all .2s;cursor:pointer}.opt-card:hover{transform:translateY(-2px)}
        .type-tab{transition:all .2s;cursor:pointer}.btn-p{transition:all .18s;cursor:pointer}
        .btn-p:not(:disabled):hover{opacity:.82}.btn-ghost{transition:all .18s;cursor:pointer}
        .btn-ghost:hover{border-color:rgba(255,255,255,.2)!important;color:#fff!important}
        input:focus,textarea:focus{border-color:rgba(138,43,226,.6)!important;outline:none}
        .cart-item{animation:slideIn .2s ease}
        @keyframes slideIn{from{opacity:0;transform:translateX(8px)}to{opacity:1;transform:translateX(0)}}
      `}</style>

      <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "36px" }}>
        <button onClick={onBack} style={{ padding: "9px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", color: "#6b6b8a", fontSize: "13px", cursor: "pointer", fontFamily: "'Space Mono',monospace" }}>← Volver</button>
        <div>
          <p style={{ color: "#4a4a6a", fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase", margin: "0 0 3px", fontFamily: "'Space Mono',monospace" }}>Reserva de evento</p>
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "24px", color: "#fff", margin: 0 }}>{event?.name} <span style={{ color: "#4a4a6a", fontSize: "16px", fontWeight: 400 }}>— {event?.date}</span></h2>
        </div>
      </div>

      <div style={{ display: "flex", gap: "6px", marginBottom: "32px", alignItems: "center" }}>
        {["Selecciona servicios", "Tus datos", "Confirmar"].map((s, i) => (
          <React.Fragment key={i}>
            <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
              <div style={{ width: "24px", height: "24px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 700, fontFamily: "'Space Mono',monospace", background: step > i + 1 ? "#00c87a" : step === i + 1 ? "linear-gradient(135deg,#8a2be2,#d400ff)" : "transparent", color: step >= i + 1 ? "#080810" : "#4a4a6a", border: step < i + 1 ? "1px solid rgba(255,255,255,0.1)" : "none" }}>
                {step > i + 1 ? "✓" : i + 1}
              </div>
              <span style={{ color: step === i + 1 ? "#fff" : "#4a4a6a", fontSize: "11px", fontFamily: "'Space Mono',monospace" }}>{s}</span>
            </div>
            {i < 2 && <span style={{ color: "#1e1e2e", margin: "0 2px" }}>—</span>}
          </React.Fragment>
        ))}
      </div>

      {step === 1 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "28px", alignItems: "start" }}>
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "8px", marginBottom: "24px" }}>
              {TYPES.map((t) => (
                <div key={t.id} className="type-tab" onClick={() => setActiveType(t.id)}
                  style={{ background: activeType === t.id ? "rgba(138,43,226,0.12)" : "#0d0d1a", border: `1px solid ${activeType === t.id ? t.color : "rgba(255,255,255,0.06)"}`, borderRadius: "13px", padding: "14px 10px", textAlign: "center", position: "relative" }}>
                  {cart[t.id] && <div style={{ position: "absolute", top: "8px", right: "8px", width: "16px", height: "16px", borderRadius: "50%", background: t.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", color: "#fff", fontWeight: 700 }}>✓</div>}
                  <div style={{ fontSize: "20px", marginBottom: "6px" }}>{t.icon}</div>
                  <p style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "12px", color: activeType === t.id ? "#fff" : "#6b6b8a", margin: 0 }}>{t.label}</p>
                </div>
              ))}
            </div>
            <p style={{ color: "#4a4a6a", fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 14px", fontFamily: "'Space Mono',monospace" }}>
              <span style={{ color: curType.color }}>{curType.icon}</span> Opciones de {curType.label}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${curType.opts.length <= 2 ? "2" : "3"},1fr)`, gap: "12px" }}>
              {curType.opts.map((o) => {
                const sel = cart[activeType]?.id === o.id;
                return (
                  <div key={o.id} className="opt-card" onClick={() => toggleOpt(activeType, o)}
                    style={{ background: "#0d0d1a", border: `1px solid ${sel ? curType.color : "rgba(255,255,255,0.06)"}`, borderRadius: "16px", padding: "18px", position: "relative" }}>
                    {sel && <div style={{ position: "absolute", top: "12px", right: "12px", width: "20px", height: "20px", borderRadius: "50%", background: curType.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "#fff" }}>✓</div>}
                    <p style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "15px", color: "#fff", margin: "0 0 6px" }}>{o.label}</p>
                    <p style={{ fontFamily: "'Space Mono',monospace", fontWeight: 700, fontSize: "18px", color: curType.color, margin: "0 0 14px" }}>{fmt(o.price)}</p>
                    {o.perks.map((p, i) => (
                      <p key={i} style={{ color: "#6b6b8a", fontSize: "11px", fontFamily: "'Space Mono',monospace", margin: "0 0 5px", display: "flex", gap: "7px" }}>
                        <span style={{ color: curType.color, flexShrink: 0 }}>—</span>{p}
                      </p>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ background: "#0d0d1a", borderRadius: "18px", padding: "20px", border: "1px solid rgba(138,43,226,0.15)", position: "sticky", top: "24px" }}>
            <p style={{ color: "#4a4a6a", fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 16px", fontFamily: "'Space Mono',monospace" }}>Mi reserva</p>
            {cartItems.length === 0 ? (
              <div style={{ textAlign: "center", padding: "24px 0" }}>
                <p style={{ fontSize: "28px", marginBottom: "8px" }}>◻</p>
                <p style={{ color: "#2a2a3e", fontSize: "12px", fontFamily: "'Space Mono',monospace" }}>Selecciona opciones<br />del menú izquierdo</p>
              </div>
            ) : (
              <div style={{ marginBottom: "16px" }}>
                {cartItems.map((item, i) => {
                  const t = TYPES.find((x) => x.id === item.typeId);
                  return (
                    <div key={i} className="cart-item" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "10px 0", borderBottom: i < cartItems.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                      <div>
                        <p style={{ fontSize: "10px", color: t.color, fontFamily: "'Space Mono',monospace", margin: "0 0 2px" }}>{t.icon} {t.label}</p>
                        <p style={{ fontSize: "13px", color: "#fff", fontWeight: 600, margin: 0 }}>{item.label}</p>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <p style={{ fontSize: "13px", color: "#c084fc", fontFamily: "'Space Mono',monospace", fontWeight: 700, margin: "0 0 4px" }}>{fmt(item.price)}</p>
                        <button onClick={() => toggleOpt(item.typeId, item)} style={{ background: "none", border: "none", color: "#3a3a5a", fontSize: "10px", cursor: "pointer", fontFamily: "'Space Mono',monospace" }}>quitar</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {cartItems.length > 0 && (
              <>
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "14px", marginBottom: "16px", display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#6b6b8a", fontSize: "12px", fontFamily: "'Space Mono',monospace" }}>TOTAL</span>
                  <span style={{ color: "#c084fc", fontFamily: "'Space Mono',monospace", fontSize: "18px", fontWeight: 700 }}>{fmt(total)}</span>
                </div>
                <button className="btn-p" onClick={() => setStep(2)} style={{ width: "100%", padding: "13px", background: "linear-gradient(135deg,#8a2be2,#d400ff)", border: "none", borderRadius: "12px", color: "#fff", fontSize: "13px", fontWeight: 700, fontFamily: "'Syne',sans-serif", cursor: "pointer" }}>
                  Continuar ({cartItems.length} {cartItems.length === 1 ? "servicio" : "servicios"}) →
                </button>
              </>
            )}
            <p style={{ color: "#2a2a3e", fontSize: "10px", fontFamily: "'Space Mono',monospace", textAlign: "center", marginTop: "12px" }}>Combina múltiples servicios</p>
          </div>
        </div>
      )}

      {step === 2 && (
        <div style={{ maxWidth: "500px" }}>
          <div style={{ background: "#0d0d1a", border: "1px solid rgba(138,43,226,0.15)", borderRadius: "14px", padding: "16px 20px", marginBottom: "24px" }}>
            {cartItems.map((item, i) => {
              const t = TYPES.find((x) => x.id === item.typeId);
              return (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: i < cartItems.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                  <span style={{ color: "#d1d1e0", fontSize: "12px" }}><span style={{ color: t.color }}>{t.icon}</span> {t.label} — {item.label}</span>
                  <span style={{ color: "#c084fc", fontSize: "12px", fontFamily: "'Space Mono',monospace", fontWeight: 700 }}>{fmt(item.price)}</span>
                </div>
              );
            })}
            <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "10px", marginTop: "4px" }}>
              <span style={{ color: "#6b6b8a", fontSize: "11px", fontFamily: "'Space Mono',monospace" }}>TOTAL</span>
              <span style={{ color: "#c084fc", fontFamily: "'Space Mono',monospace", fontSize: "15px", fontWeight: 700 }}>{fmt(total)}</span>
            </div>
          </div>
          {[{ id: "name", label: "Nombre completo", type: "text", ph: "Tu nombre" }, { id: "email", label: "Correo", type: "email", ph: "correo@ejemplo.com" }, { id: "phone", label: "Celular", type: "tel", ph: "+57 300 000 0000" }].map((f) => (
            <div key={f.id} style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", color: "#6b6b8a", fontSize: "10px", fontFamily: "'Space Mono',monospace", marginBottom: "7px", letterSpacing: "1px", textTransform: "uppercase" }}>{f.label}</label>
              <input type={f.type} placeholder={f.ph} value={form[f.id]} onChange={(e) => setForm({ ...form, [f.id]: e.target.value })}
                style={{ width: "100%", background: "#080810", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "11px", padding: "13px 15px", color: "#fff", fontSize: "14px", fontFamily: "'Syne',sans-serif" }} />
            </div>
          ))}
          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", color: "#6b6b8a", fontSize: "10px", fontFamily: "'Space Mono',monospace", marginBottom: "7px", letterSpacing: "1px", textTransform: "uppercase" }}>Notas</label>
            <textarea placeholder="Solicitudes especiales..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2}
              style={{ width: "100%", background: "#080810", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "11px", padding: "13px 15px", color: "#fff", fontSize: "14px", fontFamily: "'Syne',sans-serif", resize: "none" }} />
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button className="btn-ghost" onClick={() => setStep(1)} style={{ padding: "13px 22px", background: "transparent", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", color: "#6b6b8a", fontSize: "13px", fontFamily: "'Syne',sans-serif", cursor: "pointer" }}>← Atrás</button>
            <button className="btn-p" onClick={() => setStep(3)} style={{ flex: 1, padding: "13px", background: "linear-gradient(135deg,#8a2be2,#d400ff)", border: "none", borderRadius: "12px", color: "#fff", fontSize: "14px", fontWeight: 700, fontFamily: "'Syne',sans-serif", cursor: "pointer" }}>Revisar y Confirmar →</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div style={{ maxWidth: "500px" }}>
          <div style={{ background: "#0d0d1a", border: "1px solid rgba(138,43,226,0.18)", borderRadius: "18px", padding: "26px", marginBottom: "18px" }}>
            <p style={{ color: "#4a4a6a", fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase", margin: "0 0 18px", fontFamily: "'Space Mono',monospace" }}>Confirmación final</p>
            {[["Evento", event?.name], ["Fecha", event?.date]].map(([k, v], i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
                <span style={{ color: "#4a4a6a", fontSize: "12px", fontFamily: "'Space Mono',monospace" }}>{k}</span>
                <span style={{ color: "#fff", fontSize: "12px", fontWeight: 600 }}>{v}</span>
              </div>
            ))}
            <p style={{ color: "#6b6b8a", fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", margin: "16px 0 10px", fontFamily: "'Space Mono',monospace", paddingBottom: "8px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>Servicios reservados</p>
            {cartItems.map((item, i) => {
              const t = TYPES.find((x) => x.id === item.typeId);
              return (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
                  <span style={{ color: "#d1d1e0", fontSize: "12px" }}><span style={{ color: t.color }}>{t.icon}</span> {t.label} — {item.label}</span>
                  <span style={{ color: "#c084fc", fontSize: "12px", fontFamily: "'Space Mono',monospace", fontWeight: 700 }}>{fmt(item.price)}</span>
                </div>
              );
            })}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0 0", marginTop: "6px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <span style={{ color: "#6b6b8a", fontSize: "12px", fontFamily: "'Space Mono',monospace", fontWeight: 700 }}>TOTAL</span>
              <span style={{ color: "#c084fc", fontFamily: "'Space Mono',monospace", fontSize: "18px", fontWeight: 700 }}>{fmt(total)}</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button className="btn-ghost" onClick={() => setStep(2)} style={{ padding: "13px 22px", background: "transparent", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", color: "#6b6b8a", fontSize: "13px", fontFamily: "'Syne',sans-serif", cursor: "pointer" }}>← Atrás</button>
            <button className="btn-p" onClick={() => setDone(true)} style={{ flex: 1, padding: "13px", background: "linear-gradient(135deg,#00b86b,#00f5a0)", border: "none", borderRadius: "12px", color: "#080810", fontSize: "14px", fontWeight: 700, fontFamily: "'Syne',sans-serif", cursor: "pointer" }}>
              ✓ Confirmar — {fmt(total)}
            </button>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}