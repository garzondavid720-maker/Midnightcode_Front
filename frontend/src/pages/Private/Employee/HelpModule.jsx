import { useState } from "react";

const S = { mono:"'Space Mono',monospace", syne:"'Syne',sans-serif" };

/* ─── CONTENIDO ─────────────────────────────────────────────────────────── */
const TUTORIALS = [
  {
    id:"sell",
    icon:"💳",
    title:"Cómo realizar una venta",
    badge:"Esencial",
    badgeColor:"#c084fc",
    steps:[
      { n:1, icon:"🛒", title:"Abre el módulo de Ventas",    body:"En el menú lateral haz clic en Ventas. Verás el catálogo de productos a la izquierda y el carrito a la derecha." },
      { n:2, icon:"🔍", title:"Busca el producto",            body:"Usa el buscador o filtra por categoría (Licores, Cervezas, Cócteles…). Cada tarjeta muestra precio y stock disponible." },
      { n:3, icon:"➕", title:"Agrega al carrito",            body:"Haz clic en la tarjeta del producto para agregarlo. Puedes ajustar la cantidad con los botones + y − en el carrito." },
      { n:4, icon:"💰", title:"Selecciona el método de pago", body:"Elige entre Efectivo, Tarjeta, Nequi o Daviplata. Si es efectivo, ingresa el monto recibido y el sistema calcula el cambio automáticamente." },
      { n:5, icon:"✅", title:"Confirma la venta",            body:"Haz clic en 'Confirmar Venta'. Se genera un recibo con el ID, hora, método y cambio si aplica. La venta queda registrada en el historial." },
    ],
    tips:[
      "Si el producto no aparece en el catálogo, regístralo primero en el módulo de Productos.",
      "Revisa el stock antes de confirmar — si está en rojo, hay pocas unidades disponibles.",
      "Siempre registra la venta aunque el cliente pague en partes.",
    ],
  },
  {
    id:"product",
    icon:"📦",
    title:"Cómo registrar un producto",
    badge:"Inventario",
    badgeColor:"#00f5a0",
    steps:[
      { n:1, icon:"📦", title:"Ve al módulo de Productos",    body:"Haz clic en Productos en el menú. Verás la lista de todos los ítems registrados con su stock y precio." },
      { n:2, icon:"➕", title:"Haz clic en 'Nuevo Producto'", body:"El botón aparece en la esquina superior derecha. Se abre el formulario de registro." },
      { n:3, icon:"📝", title:"Completa el formulario",       body:"Nombre, categoría, código SKU (ej: LIC-003), precio de venta, costo y stock inicial. El margen de ganancia se calcula solo." },
      { n:4, icon:"💾", title:"Guarda el producto",           body:"Haz clic en 'Guardar producto'. Aparece en la lista y ya está disponible en el módulo de Ventas." },
      { n:5, icon:"✏️", title:"Edita cuando sea necesario",   body:"Haz clic en 'Ver' en cualquier producto y luego en 'Editar' para actualizar precio, stock o cualquier dato." },
    ],
    tips:[
      "El código SKU debe ser único. Sigue el formato: categoría-número (LIC-001, CER-002…).",
      "Siempre ingresa el costo para que el sistema pueda calcular el margen de ganancia.",
      "Puedes desactivar un producto sin eliminarlo — así deja de aparecer en ventas pero conserva el historial.",
    ],
  },
  {
    id:"schedule",
    icon:"📅",
    title:"Consultar tu horario",
    badge:"Horario",
    badgeColor:"#ffc107",
    steps:[
      { n:1, icon:"📅", title:"Abre el módulo de Horario",    body:"Haz clic en Horario. Verás la semana actual con todos tus turnos marcados." },
      { n:2, icon:"📍", title:"Identifica tu turno de hoy",   body:"El día de hoy aparece resaltado. Haz clic en cualquier día para ver los detalles del turno." },
      { n:3, icon:"📋", title:"Revisa los detalles del turno",body:"Verás hora de entrada y salida, área asignada, supervisor y notas especiales si las hay." },
      { n:4, icon:"🕐", title:"Consulta el historial",        body:"Cambia a la pestaña 'Historial' para ver tus turnos de semanas anteriores y el total de horas trabajadas." },
    ],
    tips:[
      "Si hay una nota 📌 en tu turno, es importante — léela antes de comenzar.",
      "Los sábados suelen tener turnos extendidos. Revisa con anticipación.",
      "Si ves un error en tu horario, contacta al supervisor inmediatamente.",
    ],
  },
];

const FAQ = [
  {
    cat:"Ventas",
    color:"#c084fc",
    qa:[
      { q:"¿Qué hago si el sistema no deja confirmar la venta?",           a:"Verifica que el carrito no esté vacío, que hayas seleccionado un método de pago, y si es efectivo, que el monto ingresado cubra el total." },
      { q:"¿Puedo cancelar una venta ya registrada?",                       a:"Por ahora no desde la app. Notifica a tu supervisor para que la anule desde el panel admin." },
      { q:"¿Qué pasa si un producto está agotado?",                        a:"La tarjeta se muestra en rojo y no se puede agregar. Informa al supervisor para reponer el stock." },
      { q:"¿Cómo registro una venta de mesa completa (múltiples items)?",  a:"Agrega todos los productos al carrito antes de confirmar. No es necesario hacer una venta por item." },
      { q:"¿El cambio se registra automáticamente?",                       a:"Sí. Si seleccionas 'Efectivo' e ingresas el monto recibido, el sistema calcula y muestra el cambio en el recibo." },
    ],
  },
  {
    cat:"Productos",
    color:"#00f5a0",
    qa:[
      { q:"¿Puedo editar el precio de un producto?",                       a:"Sí. Ve a Productos → haz clic en 'Ver' → luego 'Editar'. Actualiza el precio y guarda." },
      { q:"¿Cómo actualizo el stock cuando llega mercancía?",              a:"Ve al producto, haz clic en 'Editar' y cambia el número en el campo Stock. Guarda los cambios." },
      { q:"¿Qué significa el porcentaje de margen?",                       a:"Es la ganancia sobre el precio de venta. Por ejemplo, si vendes algo a $20.000 y costó $12.000, el margen es 40%." },
      { q:"¿Cómo elimino un producto?",                                    a:"No se puede eliminar definitivamente para conservar el historial. Usa 'Desactivar' para que no aparezca en ventas." },
      { q:"¿Qué es el código SKU?",                                        a:"Es el identificador único del producto (ej: LIC-001). Sigue el formato categoría-número y asegúrate de que no se repita." },
    ],
  },
  {
    cat:"Horario",
    color:"#ffc107",
    qa:[
      { q:"¿Por qué no veo mi turno de hoy?",                              a:"Es posible que sea tu día libre o que el horario aún no haya sido publicado. Contacta a tu supervisor." },
      { q:"¿Cómo sé cuántas horas trabajé en la semana?",                  a:"El módulo de Horario > Historial muestra el total de horas por semana." },
      { q:"¿Qué significa la nota 📌 en mi turno?",                        a:"Es una instrucción especial para ese día (evento, operativo, revisión). Léela antes de iniciar el turno." },
    ],
  },
  {
    cat:"General",
    color:"#ff6b35",
    qa:[
      { q:"¿Cómo cambio mi contraseña?",                                   a:"Por ahora contacta al administrador del sistema. Próximamente estará disponible en el perfil." },
      { q:"¿Qué hago si la app no carga bien?",                            a:"Recarga la página (F5). Si el problema persiste, limpia el caché del navegador o contacta al admin." },
      { q:"¿Los datos se guardan si cierro el navegador?",                 a:"Las ventas registradas se guardan en la sesión actual. Para producción, todo se sincronizará con el servidor automáticamente." },
    ],
  },
];

const QUICK_TIPS = [
  { icon:"⚡", tip:"Al inicio del turno revisa el stock de los 3 productos más vendidos: Aguardiente, Cerveza Andina y Mojito." },
  { icon:"💬", tip:"Saluda siempre al cliente por su nombre si tienes acceso al listado VIP — genera fidelización." },
  { icon:"🎯", tip:"Ofrece el upgrade de presentación grande cuando el cliente pide una botella — aumenta el ticket promedio." },
  { icon:"⏱", tip:"Los sábados el punto máximo de ventas es entre 11 PM y 1 AM. Ten el POS listo y ágil." },
  { icon:"🔒", tip:"Cierra sesión siempre al terminar tu turno. Nunca dejes la app abierta en un dispositivo compartido." },
  { icon:"📊", tip:"Si una categoría se acaba frecuentemente, reporta el patrón al supervisor para ajustar el inventario." },
];

/* ─── COMPONENT ─────────────────────────────────────────────────────────── */
export default function HelpModule() {
  const [section,   setSection]   = useState("tutorials"); // tutorials | faq | tips
  const [openTut,   setOpenTut]   = useState("sell");
  const [openStep,  setOpenStep]  = useState(null);
  const [openFaq,   setOpenFaq]   = useState({});

  const toggleFaq = (catIdx, qIdx) => {
    const key = `${catIdx}-${qIdx}`;
    setOpenFaq(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const currentTut = TUTORIALS.find(t => t.id === openTut);

  return (
    <div>
      {/* Section tabs */}
      <div style={{ display:"flex", gap:"4px", background:"#0d0d1a", borderRadius:"12px", padding:"4px", width:"fit-content", border:"1px solid rgba(255,255,255,0.06)", marginBottom:"24px" }}>
        {[
          { id:"tutorials", label:"📖 Tutoriales" },
          { id:"faq",       label:"❓ Preguntas frecuentes" },
          { id:"tips",      label:"⚡ Consejos rápidos" },
        ].map(t => (
          <button key={t.id} onClick={() => setSection(t.id)}
            style={{ padding:"9px 18px", borderRadius:"8px", border:"none", background:section===t.id?"linear-gradient(135deg,#8a2be2,#d400ff)":"transparent", color:section===t.id?"#fff":"#6b6b8a", fontSize:"12px", fontWeight:section===t.id?700:400, fontFamily:S.mono, cursor:"pointer", whiteSpace:"nowrap" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── TUTORIALS ── */}
      {section === "tutorials" && (
        <div style={{ display:"grid", gridTemplateColumns:"220px 1fr", gap:"20px", alignItems:"start" }}>

          {/* Sidebar de tutoriales */}
          <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
            {TUTORIALS.map(t => (
              <button key={t.id} onClick={() => { setOpenTut(t.id); setOpenStep(null); }}
                style={{ padding:"12px 14px", background:openTut===t.id?"rgba(138,43,226,0.2)":"#0d0d1a", border:`1px solid ${openTut===t.id?"rgba(138,43,226,0.4)":"rgba(255,255,255,0.05)"}`, borderRadius:"11px", cursor:"pointer", textAlign:"left", transition:"all .15s" }}>
                <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"4px" }}>
                  <span style={{ fontSize:"18px" }}>{t.icon}</span>
                  <p style={{ fontFamily:S.syne, fontWeight:openTut===t.id?700:600, fontSize:"12px", color:openTut===t.id?"#fff":"#8b8baa", margin:0 }}>{t.title}</p>
                </div>
                <span style={{ background:"rgba(138,43,226,0.12)", border:"1px solid rgba(138,43,226,0.2)", borderRadius:"5px", padding:"1px 8px", fontSize:"9px", color:t.badgeColor, fontFamily:S.mono }}>
                  {t.badge}
                </span>
              </button>
            ))}
          </div>

          {/* Tutorial content */}
          {currentTut && (
            <div style={{ background:"#0d0d1a", border:"1px solid rgba(138,43,226,0.1)", borderRadius:"16px", padding:"28px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"14px", marginBottom:"24px" }}>
                <div style={{ width:"52px", height:"52px", background:"rgba(138,43,226,0.15)", borderRadius:"14px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"26px", border:"1px solid rgba(138,43,226,0.25)", flexShrink:0 }}>
                  {currentTut.icon}
                </div>
                <div>
                  <p style={{ fontFamily:S.mono, fontSize:"10px", color:"#4a4a6a", margin:"0 0 4px", letterSpacing:"2px", textTransform:"uppercase" }}>Mini tutorial</p>
                  <h2 style={{ fontFamily:S.syne, fontWeight:800, fontSize:"20px", color:"#fff", margin:0 }}>{currentTut.title}</h2>
                </div>
              </div>

              {/* Pasos */}
              <div style={{ display:"flex", flexDirection:"column", gap:"10px", marginBottom:"24px" }}>
                {currentTut.steps.map(step => {
                  const isOpen = openStep === `${currentTut.id}-${step.n}`;
                  return (
                    <div key={step.n} style={{ background:"#080810", borderRadius:"12px", border:"1px solid rgba(255,255,255,0.05)", overflow:"hidden", transition:"all .2s" }}>
                      <div onClick={() => setOpenStep(isOpen ? null : `${currentTut.id}-${step.n}`)}
                        style={{ padding:"14px 18px", display:"flex", alignItems:"center", gap:"14px", cursor:"pointer" }}>
                        <div style={{ width:"28px", height:"28px", borderRadius:"50%", background:"linear-gradient(135deg,#8a2be2,#d400ff)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:S.mono, fontSize:"11px", fontWeight:700, color:"#fff", flexShrink:0 }}>
                          {step.n}
                        </div>
                        <span style={{ fontSize:"18px", flexShrink:0 }}>{step.icon}</span>
                        <p style={{ fontFamily:S.syne, fontWeight:600, fontSize:"14px", color:"#fff", margin:0, flex:1 }}>{step.title}</p>
                        <span style={{ color:"#4a4a6a", fontSize:"12px", flexShrink:0 }}>{isOpen?"▲":"▼"}</span>
                      </div>
                      {isOpen && (
                        <div style={{ padding:"0 18px 16px 60px" }}>
                          <p style={{ color:"#8b8baa", fontSize:"14px", lineHeight:"1.6", margin:0 }}>{step.body}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Tips del tutorial */}
              <div style={{ background:"rgba(138,43,226,0.06)", border:"1px solid rgba(138,43,226,0.15)", borderRadius:"12px", padding:"18px" }}>
                <p style={{ fontFamily:S.mono, fontSize:"10px", color:"#c084fc", margin:"0 0 12px", letterSpacing:"2px", textTransform:"uppercase" }}>💡 Consejos para este módulo</p>
                {currentTut.tips.map((tip, i) => (
                  <div key={i} style={{ display:"flex", gap:"10px", marginBottom:i<currentTut.tips.length-1?"10px":0 }}>
                    <span style={{ color:"#c084fc", fontSize:"12px", flexShrink:0, marginTop:"1px" }}>→</span>
                    <p style={{ color:"#8b8baa", fontSize:"13px", lineHeight:"1.5", margin:0 }}>{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── FAQ ── */}
      {section === "faq" && (
        <div style={{ display:"flex", flexDirection:"column", gap:"20px" }}>
          {FAQ.map((cat, ci) => (
            <div key={ci} style={{ background:"#0d0d1a", border:"1px solid rgba(138,43,226,0.08)", borderRadius:"16px", overflow:"hidden" }}>
              <div style={{ padding:"16px 20px", borderBottom:"1px solid rgba(255,255,255,0.05)", display:"flex", alignItems:"center", gap:"10px" }}>
                <div style={{ width:"8px", height:"8px", borderRadius:"50%", background:cat.color }} />
                <p style={{ fontFamily:S.syne, fontWeight:700, fontSize:"15px", color:"#fff", margin:0 }}>{cat.cat}</p>
                <span style={{ fontFamily:S.mono, fontSize:"10px", color:"#4a4a6a" }}>{cat.qa.length} preguntas</span>
              </div>
              <div>
                {cat.qa.map((item, qi) => {
                  const key = `${ci}-${qi}`;
                  const isOpen = openFaq[key];
                  return (
                    <div key={qi} style={{ borderBottom:qi<cat.qa.length-1?"1px solid rgba(255,255,255,0.04)":"none" }}>
                      <div onClick={() => toggleFaq(ci, qi)}
                        style={{ padding:"14px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", cursor:"pointer", gap:"12px" }}
                        onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.02)"}
                        onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                        <p style={{ fontFamily:S.syne, fontWeight:600, fontSize:"13px", color:isOpen?"#fff":"#d1d1e0", margin:0 }}>{item.q}</p>
                        <span style={{ color:isOpen?cat.color:"#3a3a5a", fontSize:"14px", flexShrink:0, transition:"color .15s" }}>{isOpen?"▲":"▼"}</span>
                      </div>
                      {isOpen && (
                        <div style={{ padding:"0 20px 16px 20px" }}>
                          <p style={{ color:"#8b8baa", fontSize:"13px", lineHeight:"1.6", margin:0, borderLeft:`2px solid ${cat.color}`, paddingLeft:"14px" }}>{item.a}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── TIPS ── */}
      {section === "tips" && (
        <div>
          <p style={{ fontFamily:S.mono, fontSize:"11px", color:"#4a4a6a", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"20px" }}>
            Consejos del equipo Neon Overload
          </p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px" }}>
            {QUICK_TIPS.map((t, i) => (
              <div key={i} style={{ background:"#0d0d1a", border:"1px solid rgba(138,43,226,0.08)", borderRadius:"14px", padding:"20px" }}>
                <div style={{ width:"40px", height:"40px", background:"rgba(138,43,226,0.12)", borderRadius:"10px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"20px", marginBottom:"14px", border:"1px solid rgba(138,43,226,0.2)" }}>
                  {t.icon}
                </div>
                <p style={{ color:"#d1d1e0", fontSize:"14px", lineHeight:"1.6", margin:0, fontFamily:S.syne }}>{t.tip}</p>
              </div>
            ))}
          </div>

          {/* Contacto de emergencia */}
          <div style={{ marginTop:"24px", background:"rgba(255,193,7,0.08)", border:"1px solid rgba(255,193,7,0.2)", borderRadius:"14px", padding:"20px 24px", display:"flex", alignItems:"center", gap:"16px" }}>
            <span style={{ fontSize:"28px", flexShrink:0 }}>📞</span>
            <div>
              <p style={{ fontFamily:S.syne, fontWeight:700, fontSize:"15px", color:"#ffc107", margin:"0 0 6px" }}>¿Necesitas ayuda urgente?</p>
              <p style={{ fontFamily:S.mono, fontSize:"12px", color:"#8b8baa", margin:0, lineHeight:"1.5" }}>
                Supervisor de turno: <span style={{ color:"#fff" }}>+57 300 000 1234</span><br />
                Soporte técnico: <span style={{ color:"#fff" }}>soporte@neonoverload.co</span><br />
                WhatsApp del equipo: <span style={{ color:"#fff" }}>+57 310 000 5678</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
