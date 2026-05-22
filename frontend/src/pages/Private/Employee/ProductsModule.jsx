// ProductsModule — conectado a API real
// rol inventario/admin: CRUD completo | rol empleado: solo lectura
import { useState, useEffect, useCallback } from "react";
import { io } from "socket.io-client";
import api from "../../../services/api";

const SOCKET_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace("/api", "")
  : "http://localhost:3000";

const EMPTY = { nombre_produc:"", presentacion_produc:"", precio_produc:"", stock:"", estado_produc:true };

function Badge({ children, color="purple" }) {
  const C = {
    purple:{ bg:"rgba(138,43,226,0.15)", border:"rgba(138,43,226,0.35)", text:"#c084fc" },
    green: { bg:"rgba(0,245,160,0.1)",   border:"rgba(0,245,160,0.3)",   text:"#00f5a0" },
    red:   { bg:"rgba(255,56,86,0.1)",   border:"rgba(255,56,86,0.25)", text:"#ff3860" },
    yellow:{ bg:"rgba(255,193,7,0.1)",   border:"rgba(255,193,7,0.25)", text:"#ffc107" },
  };
  const c = C[color] || C.purple;
  return (
    <span style={{ background:c.bg, border:`1px solid ${c.border}`, color:c.text, fontSize:"10px", fontFamily:"'Space Mono',monospace", fontWeight:700, padding:"2px 8px", borderRadius:"5px", letterSpacing:"0.5px" }}>
      {children}
    </span>
  );
}

export default function ProductsModule({ user }) {
  const canEdit  = user?.role === "inventario" || user?.role === "admin";

  const [productos,   setProductos]   = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState("");
  const [view,        setView]        = useState("list"); // list | form
  const [form,        setForm]        = useState(EMPTY);
  const [editing,     setEditing]     = useState(null); // producto en edición
  const [msg,         setMsg]         = useState(null);
  const [saving,      setSaving]      = useState(false);

  const S = { mono:"'Space Mono',monospace", syne:"'Syne',sans-serif" };

  const notify = (type, text) => { setMsg({ type, text }); setTimeout(() => setMsg(null), 3000); };

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/productos");
      if (data.success) setProductos(data.data);
    } catch { notify("err", "Error al cargar productos"); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Sincronización en tiempo real — cuando admin o inventario hacen cambios
  useEffect(() => {
    const token = localStorage.getItem("neon_token");
    if (!token) return;
    const socket = io(SOCKET_URL, { auth: { token }, transports: ["websocket", "polling"] });
    socket.on("actualizarProductos", () => load());
    return () => socket.disconnect();
  }, [load]);

  const filtered = productos.filter(p =>
    p.nombre_produc?.toLowerCase().includes(search.toLowerCase()) ||
    p.presentacion_produc?.toLowerCase().includes(search.toLowerCase())
  );

  const openNew  = () => { setForm(EMPTY); setEditing(null); setView("form"); };
  const openEdit = (p) => { setForm({ nombre_produc: p.nombre_produc, presentacion_produc: p.presentacion_produc, precio_produc: String(p.precio_produc), stock: String(p.stock), estado_produc: p.estado_produc }); setEditing(p); setView("form"); };

  const save = async () => {
    if (!form.nombre_produc || !form.precio_produc || form.stock === "") {
      notify("err", "Nombre, precio y stock son obligatorios"); return;
    }
    setSaving(true);
    try {
      const payload = {
        nombre_produc:       form.nombre_produc,
        presentacion_produc: form.presentacion_produc || "Unidad",
        precio_produc:       Number(form.precio_produc),
        stock:               Number(form.stock),
        cantidad:            Number(form.stock),
        estado_produc:       form.estado_produc,
      };
      if (editing) {
        await api.put(`/productos/${editing.cod_producto}`, payload);
        notify("ok", "Producto actualizado ✓");
      } else {
        await api.post("/productos", payload);
        notify("ok", "Producto creado ✓");
      }
      setView("list");
      setForm(EMPTY);
      setEditing(null);
      load();
    } catch (e) {
      notify("err", e.response?.data?.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (p) => {
    try {
      await api.put(`/productos/${p.cod_producto}`, { estado_produc: !p.estado_produc });
      notify("ok", p.estado_produc ? "Producto desactivado" : "Producto activado");
      load();
    } catch { notify("err", "Error al actualizar estado"); }
  };

  /* ── FORM ── */
  if (view === "form" && canEdit) return (
    <div style={{ maxWidth:"600px" }}>
      <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"28px" }}>
        <button onClick={() => { setView("list"); setForm(EMPTY); setEditing(null); }}
          style={{ padding:"8px 14px", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"9px", color:"#6b6b8a", fontSize:"12px", cursor:"pointer", fontFamily:S.mono }}>
          ← Volver
        </button>
        <h2 style={{ fontFamily:S.syne, fontWeight:800, fontSize:"20px", color:"#fff", margin:0 }}>
          {editing ? "Editar producto" : "Nuevo producto"}
        </h2>
      </div>

      {msg && (
        <div style={{ marginBottom:"16px", padding:"12px 16px", borderRadius:"10px", background:msg.type==="ok"?"rgba(0,245,160,0.08)":"rgba(255,56,86,0.08)", border:`1px solid ${msg.type==="ok"?"rgba(0,245,160,0.25)":"rgba(255,56,86,0.25)"}`, color:msg.type==="ok"?"#00f5a0":"#ff3860", fontSize:"13px", fontFamily:S.mono }}>
          {msg.type==="ok"?"✓":"✕"} {msg.text}
        </div>
      )}

      <div style={{ background:"#0d0d1a", border:"1px solid rgba(138,43,226,0.12)", borderRadius:"16px", padding:"28px" }}>
        <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
          {[
            { id:"nombre_produc",       label:"Nombre del producto *",    type:"text",   ph:"Ej. Aguardiente Antioqueño" },
            { id:"presentacion_produc", label:"Presentación / Unidad",    type:"text",   ph:"Ej. Botella 750ml" },
            { id:"precio_produc",       label:"Precio de venta (COP) *",  type:"number", ph:"28000" },
            { id:"stock",               label:"Stock *",                  type:"number", ph:"24" },
          ].map(f => (
            <div key={f.id}>
              <label style={{ display:"block", fontFamily:S.mono, fontSize:"10px", color:"#6b6b8a", marginBottom:"6px", letterSpacing:"1px", textTransform:"uppercase" }}>{f.label}</label>
              <input type={f.type} placeholder={f.ph} value={form[f.id]}
                onChange={e => setForm(p => ({ ...p, [f.id]: e.target.value }))}
                style={{ width:"100%", padding:"11px 13px", background:"#080810", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"10px", color:"#fff", fontSize:"14px", fontFamily:S.syne, outline:"none", boxSizing:"border-box" }} />
            </div>
          ))}
          <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
            <input type="checkbox" checked={form.estado_produc} onChange={e => setForm(p => ({ ...p, estado_produc: e.target.checked }))} id="estado" />
            <label htmlFor="estado" style={{ color:"#6b6b8a", fontSize:"12px", fontFamily:S.mono }}>Producto activo</label>
          </div>
        </div>

        <div style={{ display:"flex", gap:"10px", marginTop:"24px" }}>
          <button onClick={() => { setView("list"); setForm(EMPTY); setEditing(null); }}
            style={{ padding:"12px 20px", background:"transparent", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"10px", color:"#6b6b8a", fontSize:"13px", fontFamily:S.syne, cursor:"pointer" }}>
            Cancelar
          </button>
          <button onClick={save} disabled={saving}
            style={{ flex:1, padding:"12px", background:"linear-gradient(135deg,#8a2be2,#d400ff)", border:"none", borderRadius:"10px", color:"#fff", fontSize:"14px", fontWeight:700, fontFamily:S.syne, cursor:saving?"wait":"pointer", opacity:saving?0.6:1 }}>
            {saving ? "Guardando…" : (editing ? "Actualizar" : "Guardar producto")}
          </button>
        </div>
      </div>
    </div>
  );

  /* ── LIST ── */
  return (
    <div>
      {msg && (
        <div style={{ marginBottom:"16px", padding:"12px 16px", borderRadius:"10px", background:msg.type==="ok"?"rgba(0,245,160,0.08)":"rgba(255,56,86,0.08)", border:`1px solid ${msg.type==="ok"?"rgba(0,245,160,0.25)":"rgba(255,56,86,0.25)"}`, color:msg.type==="ok"?"#00f5a0":"#ff3860", fontSize:"13px", fontFamily:S.mono }}>
          {msg.type==="ok"?"✓":"✕"} {msg.text}
        </div>
      )}

      {/* Header */}
      <div style={{ display:"flex", gap:"12px", marginBottom:"20px", alignItems:"center", flexWrap:"wrap" }}>
        <div style={{ position:"relative", flex:1, minWidth:"180px" }}>
          <span style={{ position:"absolute", left:"12px", top:"50%", transform:"translateY(-50%)", fontSize:"13px" }}>🔍</span>
          <input type="text" placeholder="Buscar producto…" value={search} onChange={e => setSearch(e.target.value)}
            style={{ width:"100%", paddingLeft:"36px", paddingRight:"12px", paddingTop:"10px", paddingBottom:"10px", background:"#0d0d1a", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"10px", color:"#fff", fontSize:"13px", fontFamily:S.syne, outline:"none", boxSizing:"border-box" }} />
        </div>
        {canEdit && (
          <button onClick={openNew}
            style={{ padding:"10px 20px", background:"linear-gradient(135deg,#8a2be2,#d400ff)", border:"none", borderRadius:"10px", color:"#fff", fontSize:"13px", fontWeight:700, fontFamily:S.syne, cursor:"pointer", flexShrink:0 }}>
            + Nuevo Producto
          </button>
        )}
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"12px", marginBottom:"24px" }}>
        {[
          { l:"Total",      v: productos.length,                                    c:"#c084fc" },
          { l:"Activos",    v: productos.filter(p=>p.estado_produc).length,          c:"#00f5a0" },
          { l:"Stock bajo", v: productos.filter(p=>p.stock<5).length,               c:"#ff6b35" },
          { l:"Sin stock",  v: productos.filter(p=>p.stock===0).length,             c:"#ff3860" },
        ].map((s,i) => (
          <div key={i} style={{ background:"#0d0d1a", border:"1px solid rgba(138,43,226,0.1)", borderRadius:"12px", padding:"14px 16px" }}>
            <p style={{ fontFamily:S.mono, fontSize:"9px", color:"#4a4a6a", margin:"0 0 4px", textTransform:"uppercase", letterSpacing:"1px" }}>{s.l}</p>
            <p style={{ fontFamily:S.syne, fontWeight:800, fontSize:"22px", color:s.c, margin:0 }}>{s.v}</p>
          </div>
        ))}
      </div>

      {!canEdit && (
        <div style={{ padding:"10px 16px", background:"rgba(255,193,7,0.08)", border:"1px solid rgba(255,193,7,0.2)", borderRadius:"10px", marginBottom:"16px", color:"#ffc107", fontSize:"12px", fontFamily:S.mono }}>
          📋 Solo lectura — el inventario es gestionado por el área de inventario
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div style={{ textAlign:"center", padding:"48px", color:"#4a4a6a", fontFamily:S.mono, fontSize:"13px" }}>Cargando…</div>
      ) : (
        <div style={{ background:"#0d0d1a", border:"1px solid rgba(138,43,226,0.1)", borderRadius:"16px", overflow:"hidden" }}>
          <div style={{ display:"grid", gridTemplateColumns: canEdit ? "2fr 1.2fr 1fr 1fr 100px" : "2fr 1.2fr 1fr 1fr", padding:"10px 20px", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
            {["Producto","Presentación","Precio","Stock", canEdit?"Acciones":""].filter(Boolean).map((h,i) => (
              <span key={i} style={{ fontFamily:S.mono, fontSize:"9px", color:"#2a2a3e", textTransform:"uppercase", letterSpacing:"1px" }}>{h}</span>
            ))}
          </div>

          {filtered.length === 0 && (
            <div style={{ textAlign:"center", padding:"40px", color:"#2a2a3e", fontFamily:S.mono, fontSize:"13px" }}>
              {search ? "Sin resultados" : "Sin productos registrados"}
            </div>
          )}

          {filtered.map(p => (
            <div key={p.cod_producto}
              style={{ display:"grid", gridTemplateColumns: canEdit ? "2fr 1.2fr 1fr 1fr 100px" : "2fr 1.2fr 1fr 1fr", padding:"14px 20px", borderBottom:"1px solid rgba(255,255,255,0.04)", alignItems:"center" }}>
              <div>
                <p style={{ fontFamily:S.syne, fontWeight:600, fontSize:"13px", color:p.estado_produc?"#fff":"#4a4a6a", margin:"0 0 3px" }}>{p.nombre_produc}</p>
                <div style={{ display:"flex", gap:"6px" }}>
                  {!p.estado_produc && <Badge color="red">INACTIVO</Badge>}
                  {p.stock < 5 && p.stock > 0 && <Badge color="yellow">BAJO</Badge>}
                  {p.stock === 0 && <Badge color="red">SIN STOCK</Badge>}
                </div>
              </div>
              <span style={{ fontFamily:S.mono, fontSize:"11px", color:"#6b6b8a" }}>{p.presentacion_produc}</span>
              <span style={{ fontFamily:S.mono, fontWeight:700, fontSize:"13px", color:"#c084fc" }}>
                ${Number(p.precio_produc).toLocaleString("es-CO")}
              </span>
              <span style={{ fontFamily:S.mono, fontSize:"12px", color:p.stock < 5?"#ff6b35":"#6b6b8a" }}>
                {p.stock} uds
              </span>
              {canEdit && (
                <div style={{ display:"flex", gap:"6px" }}>
                  <button onClick={() => openEdit(p)}
                    style={{ padding:"5px 10px", background:"rgba(138,43,226,0.1)", border:"1px solid rgba(138,43,226,0.2)", borderRadius:"7px", color:"#c084fc", fontSize:"11px", fontFamily:S.mono, cursor:"pointer" }}>
                    ✎
                  </button>
                  <button onClick={() => toggleActive(p)}
                    style={{ padding:"5px 10px", background: p.estado_produc?"rgba(255,56,86,0.08)":"rgba(0,245,160,0.08)", border:`1px solid ${p.estado_produc?"rgba(255,56,86,0.25)":"rgba(0,245,160,0.25)"}`, borderRadius:"7px", color:p.estado_produc?"#ff3860":"#00f5a0", fontSize:"10px", fontFamily:S.mono, cursor:"pointer" }}>
                    {p.estado_produc?"✕":"✓"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
