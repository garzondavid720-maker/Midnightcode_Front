import { useState, useMemo, useEffect, useCallback } from "react";
import api from "../../../services/api";

const S = { mono:"'Space Mono',monospace", syne:"'Syne',sans-serif" };

const PAY_METHODS = [
  { id:"cash",  label:"Efectivo",  icon:"💵" },
  { id:"card",  label:"Tarjeta",   icon:"💳" },
  { id:"nequi", label:"Nequi",     icon:"📱" },
  { id:"davip", label:"Daviplata", icon:"📲" },
];

const COD_METODO = { cash: 1, card: 2, nequi: 3, davip: 4 };

const fmt = (n) => `$${Number(n).toLocaleString("es-CO")}`;

export default function SalesModule({ user }) {
  const [products,  setProducts]  = useState([]);
  const [loadingProd, setLoadingProd] = useState(true);
  const [cat,       setCat]       = useState("Todos");
  const [search,    setSearch]    = useState("");
  const [cart,      setCart]      = useState([]);
  const [payMethod, setPayMethod] = useState("cash");
  const [cashGiven, setCashGiven] = useState("");
  const [done,      setDone]      = useState(false);
  const [receipt,   setReceipt]   = useState(null);
  const [sending,   setSending]   = useState(false);
  const [errMsg,    setErrMsg]    = useState(null);
  const [sales,     setSales]     = useState([]);

  // ── Cargar productos reales desde la API ────────────────────────────────────
  const loadProducts = useCallback(async () => {
    try {
      setLoadingProd(true);
      const { data } = await api.get("/productos");
      if (data.success) setProducts(data.data.filter(p => p.estado_produc && p.stock > 0));
    } catch { /* sin conexión — catálogo vacío */ }
    finally { setLoadingProd(false); }
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const cats = useMemo(() => {
    const unique = [...new Set(products.map(p => p.presentacion_produc))];
    return ["Todos", ...unique];
  }, [products]);

  const filtered = useMemo(() => products.filter(p =>
    (cat === "Todos" || p.presentacion_produc === cat) &&
    p.nombre_produc.toLowerCase().includes(search.toLowerCase())
  ), [products, cat, search]);

  const total  = useMemo(() => cart.reduce((s, i) => s + Number(i.precio_produc) * i.qty, 0), [cart]);
  const change = cashGiven ? Math.max(0, Number(cashGiven.replace(/\D/g, "")) - total) : 0;

  const addToCart = (p) => {
    if (p.stock === 0) return;
    setCart(prev => {
      const ex = prev.find(i => i.cod_producto === p.cod_producto);
      if (ex) return prev.map(i => i.cod_producto === p.cod_producto ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...p, qty: 1 }];
    });
  };

  const updateQty = (cod, delta) => {
    setCart(prev => {
      const updated = prev.map(i => i.cod_producto === cod ? { ...i, qty: Math.max(0, i.qty + delta) } : i);
      return updated.filter(i => i.qty > 0);
    });
  };

  // ── Confirmar venta → POST /ventas ─────────────────────────────────────────
  const confirmSale = async () => {
    if (cart.length === 0 || sending) return;
    setErrMsg(null);
    setSending(true);
    try {
      const { data } = await api.post("/ventas", {
        detalles: cart.map(i => ({
          cod_producto: i.cod_producto,
          cantidad:     i.qty,
        })),
      });

      const saleData = data.data || data;
      const receipt = {
        id:       `V-${saleData.id_venta || Date.now()}`,
        codigo:   saleData.codigo_pago,
        items:    cart,
        total,
        method:   PAY_METHODS.find(p => p.id === payMethod).label,
        change:   payMethod === "cash" ? change : 0,
        time:     new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }),
        employee: user?.name,
      };

      setSales(prev => [receipt, ...prev]);
      setReceipt(receipt);
      setDone(true);
      setCart([]);
      setCashGiven("");
      // Recargar productos para stock actualizado
      loadProducts();
    } catch (err) {
      setErrMsg(err.response?.data?.message || err.message || "Error al registrar la venta");
    } finally {
      setSending(false);
    }
  };

  const newSale = () => { setDone(false); setReceipt(null); setErrMsg(null); };

  // ── Comprobante ────────────────────────────────────────────────────────────
  if (done && receipt) return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", paddingTop:"32px" }}>
      <div style={{ background:"#0d0d1a", border:"1px solid rgba(0,245,160,0.3)", borderRadius:"20px", padding:"32px", maxWidth:"400px", width:"100%", textAlign:"center" }}>
        <div style={{ width:"60px", height:"60px", background:"rgba(0,245,160,0.12)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px", fontSize:"28px", border:"2px solid rgba(0,245,160,0.4)" }}>✓</div>
        <p style={{ fontFamily:S.mono, fontSize:"11px", color:"#00f5a0", letterSpacing:"3px", textTransform:"uppercase", margin:"0 0 4px" }}>VENTA REGISTRADA</p>
        <h2 style={{ fontFamily:S.syne, fontWeight:800, fontSize:"28px", color:"#fff", margin:"0 0 4px" }}>{fmt(receipt.total)}</h2>
        <p style={{ fontFamily:S.mono, fontSize:"12px", color:"#4a4a6a", margin:"0 0 8px" }}>{receipt.id} · {receipt.time} · {receipt.method}</p>
        {receipt.codigo && (
          <p style={{ fontFamily:S.mono, fontSize:"11px", color:"#c084fc", margin:"0 0 20px" }}>Código de pago: <strong>#{receipt.codigo}</strong></p>
        )}

        <div style={{ background:"#080810", borderRadius:"12px", padding:"16px", marginBottom:"20px", textAlign:"left" }}>
          {receipt.items.map(i => (
            <div key={i.cod_producto} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
              <span style={{ color:"#d1d1e0", fontSize:"13px" }}>{i.nombre_produc} ×{i.qty}</span>
              <span style={{ color:"#c084fc", fontFamily:S.mono, fontSize:"12px", fontWeight:700 }}>{fmt(Number(i.precio_produc) * i.qty)}</span>
            </div>
          ))}
          {receipt.change > 0 && (
            <div style={{ display:"flex", justifyContent:"space-between", paddingTop:"10px", marginTop:"6px" }}>
              <span style={{ color:"#00f5a0", fontSize:"12px", fontFamily:S.mono }}>Cambio</span>
              <span style={{ color:"#00f5a0", fontFamily:S.mono, fontSize:"14px", fontWeight:700 }}>{fmt(receipt.change)}</span>
            </div>
          )}
        </div>

        <button onClick={newSale}
          style={{ width:"100%", padding:"14px", background:"linear-gradient(135deg,#8a2be2,#d400ff)", border:"none", borderRadius:"12px", color:"#fff", fontSize:"14px", fontWeight:700, fontFamily:S.syne, cursor:"pointer" }}>
          + Nueva Venta
        </button>
      </div>

      {sales.length > 0 && (
        <div style={{ maxWidth:"400px", width:"100%", marginTop:"24px" }}>
          <p style={{ fontFamily:S.mono, fontSize:"10px", color:"#4a4a6a", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"12px" }}>Ventas de esta sesión</p>
          {sales.slice(0, 5).map(s => (
            <div key={s.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 14px", background:"#0d0d1a", borderRadius:"10px", marginBottom:"6px", border:"1px solid rgba(255,255,255,0.05)" }}>
              <div>
                <p style={{ fontFamily:S.mono, fontSize:"11px", color:"#fff", margin:"0 0 1px" }}>{s.id}</p>
                <p style={{ fontFamily:S.mono, fontSize:"10px", color:"#4a4a6a", margin:0 }}>{s.time} · {s.method} · {s.items.length} ítem(s)</p>
              </div>
              <span style={{ fontFamily:S.syne, fontWeight:700, color:"#c084fc", fontSize:"14px" }}>{fmt(s.total)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ── POS Layout ─────────────────────────────────────────────────────────────
  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:"20px", height:"100%" }}>

      {/* LEFT — Catálogo */}
      <div style={{ display:"flex", flexDirection:"column", gap:"16px", overflow:"hidden" }}>

        <div style={{ display:"flex", gap:"10px", flexWrap:"wrap" }}>
          <div style={{ position:"relative", flex:1, minWidth:"180px" }}>
            <span style={{ position:"absolute", left:"12px", top:"50%", transform:"translateY(-50%)", fontSize:"14px" }}>🔍</span>
            <input type="text" placeholder="Buscar producto…" value={search} onChange={e => setSearch(e.target.value)}
              style={{ width:"100%", paddingLeft:"36px", paddingRight:"12px", paddingTop:"10px", paddingBottom:"10px", background:"#0d0d1a", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"10px", color:"#fff", fontSize:"13px", fontFamily:S.syne, outline:"none", boxSizing:"border-box" }} />
          </div>
        </div>

        <div style={{ display:"flex", gap:"6px", flexWrap:"wrap" }}>
          {cats.map(c => (
            <button key={c} onClick={() => setCat(c)}
              style={{ padding:"5px 14px", background:"transparent", border:`1px solid ${cat===c?"#c084fc":"rgba(255,255,255,0.08)"}`, borderRadius:"20px", color:cat===c?"#c084fc":"#4a4a6a", fontSize:"11px", fontFamily:S.mono, cursor:"pointer", transition:"all .15s" }}>
              {c}
            </button>
          ))}
        </div>

        {loadingProd ? (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"10px" }}>
            {[...Array(6)].map((_,i) => (
              <div key={i} style={{ height:"80px", background:"rgba(255,255,255,0.04)", borderRadius:"14px", animation:"pulse 1.5s infinite" }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:"center", padding:"40px", color:"#4a4a6a", fontFamily:S.mono, fontSize:"13px" }}>
            {products.length === 0 ? "Sin productos disponibles en inventario" : "No se encontraron productos"}
          </div>
        ) : (
          <div style={{ flex:1, overflowY:"auto", display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"10px", alignContent:"start" }}>
            {filtered.map(p => {
              const inCart = cart.find(i => i.cod_producto === p.cod_producto);
              const oos    = p.stock === 0;
              return (
                <button key={p.cod_producto} onClick={() => addToCart(p)} disabled={oos}
                  style={{ padding:"14px", background:inCart?"rgba(138,43,226,0.15)":"#0d0d1a", border:`1px solid ${inCart?"rgba(138,43,226,0.45)":oos?"rgba(255,56,86,0.15)":"rgba(255,255,255,0.06)"}`, borderRadius:"14px", cursor:oos?"not-allowed":"pointer", textAlign:"left", transition:"all .15s", opacity:oos?.5:1 }}>
                  <p style={{ fontFamily:S.syne, fontWeight:700, fontSize:"12px", color:"#fff", margin:"0 0 4px", lineHeight:1.3 }}>{p.nombre_produc}</p>
                  <p style={{ fontFamily:S.mono, fontSize:"10px", color:"#4a4a6a", margin:"0 0 8px" }}>{p.presentacion_produc}</p>
                  <p style={{ fontFamily:S.mono, fontWeight:700, fontSize:"13px", color:"#c084fc", margin:"0 0 2px" }}>{fmt(p.precio_produc)}</p>
                  <p style={{ fontFamily:S.mono, fontSize:"9px", color: p.stock <= 5 ? "#ff3860" : "#4a4a6a", margin:0 }}>Stock: {p.stock}</p>
                  {inCart && <p style={{ fontFamily:S.mono, fontSize:"9px", color:"#c084fc", margin:"4px 0 0" }}>En carrito: {inCart.qty}</p>}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* RIGHT — Carrito */}
      <div style={{ background:"#0d0d1a", borderRadius:"16px", border:"1px solid rgba(255,255,255,0.06)", display:"flex", flexDirection:"column", overflow:"hidden" }}>
        <div style={{ padding:"16px 20px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
          <p style={{ fontFamily:S.mono, fontSize:"10px", color:"#4a4a6a", letterSpacing:"2px", textTransform:"uppercase", margin:"0 0 2px" }}>Orden actual</p>
          <p style={{ fontFamily:S.syne, fontWeight:800, fontSize:"18px", color:"#fff", margin:0 }}>{cart.length} ítem(s)</p>
        </div>

        <div style={{ flex:1, overflowY:"auto", padding:"12px" }}>
          {cart.length === 0 ? (
            <div style={{ textAlign:"center", padding:"32px 16px", color:"#4a4a6a", fontFamily:S.mono, fontSize:"12px" }}>
              Selecciona productos del catálogo
            </div>
          ) : cart.map(i => (
            <div key={i.cod_producto} style={{ display:"flex", alignItems:"center", gap:"8px", padding:"10px", background:"#080810", borderRadius:"10px", marginBottom:"6px" }}>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontFamily:S.syne, fontWeight:700, fontSize:"12px", color:"#fff", margin:"0 0 2px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{i.nombre_produc}</p>
                <p style={{ fontFamily:S.mono, fontSize:"10px", color:"#c084fc", margin:0 }}>{fmt(Number(i.precio_produc) * i.qty)}</p>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:"4px" }}>
                <button onClick={() => updateQty(i.cod_producto, -1)} style={{ width:"22px", height:"22px", background:"rgba(255,255,255,0.06)", border:"none", borderRadius:"6px", color:"#fff", cursor:"pointer", fontSize:"14px" }}>−</button>
                <span style={{ fontFamily:S.mono, fontSize:"12px", color:"#fff", minWidth:"16px", textAlign:"center" }}>{i.qty}</span>
                <button onClick={() => updateQty(i.cod_producto, 1)} disabled={i.qty >= i.stock} style={{ width:"22px", height:"22px", background:"rgba(138,43,226,0.2)", border:"none", borderRadius:"6px", color:"#c084fc", cursor:"pointer", fontSize:"14px" }}>+</button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding:"16px 20px", borderTop:"1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"12px" }}>
            <span style={{ fontFamily:S.mono, fontSize:"12px", color:"#4a4a6a" }}>Total</span>
            <span style={{ fontFamily:S.syne, fontWeight:800, fontSize:"20px", color:"#c084fc" }}>{fmt(total)}</span>
          </div>

          {/* Método de pago */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"6px", marginBottom:"10px" }}>
            {PAY_METHODS.map(m => (
              <button key={m.id} onClick={() => setPayMethod(m.id)}
                style={{ padding:"7px", background:payMethod===m.id?"rgba(138,43,226,0.25)":"transparent", border:`1px solid ${payMethod===m.id?"rgba(138,43,226,0.5)":"rgba(255,255,255,0.08)"}`, borderRadius:"8px", color:payMethod===m.id?"#c084fc":"#6b6b8a", fontSize:"11px", fontFamily:S.mono, cursor:"pointer", transition:"all .15s" }}>
                {m.icon} {m.label}
              </button>
            ))}
          </div>

          {payMethod === "cash" && (
            <input type="text" placeholder="Efectivo recibido…" value={cashGiven}
              onChange={e => setCashGiven(e.target.value)}
              style={{ width:"100%", padding:"8px 12px", background:"#080810", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"8px", color:"#fff", fontSize:"12px", fontFamily:S.mono, outline:"none", boxSizing:"border-box", marginBottom:"6px" }} />
          )}
          {payMethod === "cash" && cashGiven && change > 0 && (
            <p style={{ fontFamily:S.mono, fontSize:"11px", color:"#00f5a0", marginBottom:"8px" }}>Cambio: {fmt(change)}</p>
          )}

          {errMsg && (
            <p style={{ fontFamily:S.mono, fontSize:"11px", color:"#ff3860", marginBottom:"8px", background:"rgba(255,56,86,0.08)", padding:"8px 10px", borderRadius:"8px", border:"1px solid rgba(255,56,86,0.2)" }}>{errMsg}</p>
          )}

          <button onClick={confirmSale} disabled={cart.length === 0 || sending}
            style={{ width:"100%", padding:"13px", background:cart.length===0||sending?"rgba(138,43,226,0.15)":"linear-gradient(135deg,#8a2be2,#d400ff)", border:"none", borderRadius:"12px", color:cart.length===0||sending?"#6b6b8a":"#fff", fontSize:"13px", fontWeight:700, fontFamily:S.syne, cursor:cart.length===0||sending?"not-allowed":"pointer", transition:"all .2s" }}>
            {sending ? "Registrando…" : "Confirmar Venta"}
          </button>
        </div>
      </div>
    </div>
  );
}
