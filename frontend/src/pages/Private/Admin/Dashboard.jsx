// Admin Dashboard — conectado a API real + Socket.io
import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth }     from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useSongs }    from "../../../context/SongContext";
import api             from "../../../services/api";
import { io }          from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace("/api", "")
  : "http://localhost:3000";

// ── Iconos ───────────────────────────────────────────────────────────────────
const Icon = ({ d, className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d={d} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
  </svg>
);

const ICONS = {
  overview:     "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z",
  users:        "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
  inventory:    "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  sales:        "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  reservations: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  music:        "M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3",
  schedule:     "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  logout:       "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1",
  edit:         "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
  trash:        "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
  check:        "M5 13l4 4L19 7",
  x:            "M6 18L18 6M6 6l12 12",
  plus:         "M12 4v16m8-8H4",
  play:         "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  ban:          "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636",
  restore:      "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
  done:         "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
};

const ROL_LABELS = { 1: "Admin", 2: "Empleado", 3: "Cliente", 4: "DJ", 5: "Inventario" };
const ROL_COLORS = {
  1: "text-red-400 border-red-400/30",
  2: "text-blue-400 border-blue-400/30",
  3: "text-green-400 border-green-400/30",
  4: "text-neon-purple border-neon-purple/30",
  5: "text-orange-400 border-orange-400/30",
};

// ── Campo de formulario reutilizable — A NIVEL DE MÓDULO (evita re-mount por render) ──
const Field = ({ label, field, type = "text", obj, setObj }) => (
  <div>
    <label className="text-xs text-gray-400 uppercase tracking-widest mb-1 block">{label}</label>
    <input
      type={type}
      value={obj[field] ?? ""}
      onChange={e => setObj(p => ({ ...p, [field]: e.target.value }))}
      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-neon-purple"
    />
  </div>
);

// ── Sección: Overview ─────────────────────────────────────────────────────────
function OverviewSection() {
  const [stats, setStats] = useState({ users: 0, songs: 0, reservations: 0, products: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      api.get("/usuarios"),
      api.get("/canciones"),
      api.get("/reservas"),
      api.get("/productos"),
    ]).then(([u, s, r, p]) => {
      setStats({
        users:        u.status === "fulfilled" ? (u.value.data?.data?.length ?? 0) : 0,
        songs:        s.status === "fulfilled" ? (s.value.data?.data?.length ?? 0) : 0,
        reservations: r.status === "fulfilled" ? (r.value.data?.data?.length ?? 0) : 0,
        products:     p.status === "fulfilled" ? (p.value.data?.data?.length ?? 0) : 0,
      });
      setLoading(false);
    });
  }, []);

  const cards = [
    { label: "Usuarios",     value: stats.users,        border: "border-neon-purple",  color: "text-neon-purple" },
    { label: "Canciones",    value: stats.songs,        border: "border-neon-magenta", color: "text-neon-magenta" },
    { label: "Reservas",     value: stats.reservations, border: "border-blue-500",     color: "text-blue-400" },
    { label: "Productos",    value: stats.products,     border: "border-green-500",    color: "text-green-400" },
  ];

  return (
    <div>
      <h2 className="font-orbitron font-black text-3xl text-white mb-8 uppercase tracking-widest">
        Overview <span className="text-neon-purple animate-pulse">●</span>
      </h2>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        {cards.map((c) => (
          <div key={c.label} className={`glass-panel p-6 rounded-2xl border-l-4 ${c.border}`}>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{c.label}</p>
            {loading ? (
              <div className="h-10 w-16 bg-white/10 rounded animate-pulse" />
            ) : (
              <p className={`text-4xl font-orbitron font-black ${c.color}`}>{c.value}</p>
            )}
          </div>
        ))}
      </div>

      {/* Pulse visual */}
      <div className="glass-panel rounded-3xl p-8 border border-neon-purple/20">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h3 className="font-orbitron text-xl font-bold text-white">LIVE NIGHTLIFE PULSE</h3>
            <p className="text-gray-400 text-sm mt-1">Sistema activo en tiempo real</p>
          </div>
          <span className="text-3xl font-orbitron font-black text-neon-purple">128 <small className="text-xs">BPM</small></span>
        </div>
        <div className="h-24 flex items-end gap-1.5 justify-center">
          {[40,60,30,90,50,75,45,40,20,100,60,35,80,55,70,45,65,85,30,95].map((h, i) => (
            <div key={i}
              className={`flex-1 rounded-full bar-anim ${i%3===0 ? "bg-neon-purple" : i%3===1 ? "bg-neon-magenta" : "bg-white/40"}`}
              style={{ height:`${h}%`, animationDelay:`${i*0.1}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Sección: Usuarios ─────────────────────────────────────────────────────────
function UsersSection() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [editing, setEditing] = useState(null);
  const [saving,  setSaving]  = useState(false);
  const [msg,     setMsg]     = useState(null);
  const socketRef = useRef(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/usuarios");
      if (data.success) setUsers(data.data);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const token = localStorage.getItem("neon_token");
    if (!token) return;
    const socket = io(SOCKET_URL, { auth: { token }, transports: ["websocket", "polling"] });
    socketRef.current = socket;
    socket.on("actualizarUsuarios", () => load());
    return () => { socket.disconnect(); socketRef.current = null; };
  }, [load]);

  const filtered = users.filter(u =>
    u.nombre_usu.toLowerCase().includes(search.toLowerCase()) ||
    u.correo_usu.toLowerCase().includes(search.toLowerCase())
  );

  const saveEdit = async () => {
    setSaving(true);
    try {
      await api.patch(`/usuarios/${editing.doc_identidad}`, {
        nombre_usu: editing.nombre_usu,
        correo_usu: editing.correo_usu,
        cod_rol:    Number(editing.cod_rol),
      });
      setMsg({ type: "ok", text: "Usuario actualizado" });
      setEditing(null);
      load();
    } catch {
      setMsg({ type: "err", text: "Error al actualizar" });
    } finally { setSaving(false); setTimeout(() => setMsg(null), 3000); }
  };

  const deleteUser = async (doc) => {
    if (!window.confirm("¿Eliminar este usuario?")) return;
    try {
      await api.delete(`/usuarios/${doc}`);
      setMsg({ type: "ok", text: "Usuario eliminado" });
      load();
    } catch {
      setMsg({ type: "err", text: "Error al eliminar" });
    } finally { setTimeout(() => setMsg(null), 3000); }
  };

  return (
    <div>
      <h2 className="font-orbitron font-black text-3xl text-white mb-8 uppercase tracking-widest">Usuarios</h2>

      {msg && (
        <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-bold border ${msg.type === "ok" ? "bg-green-500/10 border-green-500/30 text-green-400" : "bg-red-500/10 border-red-500/30 text-red-400"}`}>
          {msg.text}
        </div>
      )}

      <div className="flex gap-4 mb-6">
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre o correo..."
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-neon-purple"
        />
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />)}</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(u => (
            <div key={u.doc_identidad} className="glass-panel rounded-xl p-4 border border-white/10 hover:border-neon-purple/40 transition-all">
              {editing?.doc_identidad === u.doc_identidad ? (
                <div className="flex flex-wrap gap-3 items-center">
                  <input value={editing.nombre_usu} onChange={e => setEditing(p => ({...p, nombre_usu: e.target.value}))}
                    className="flex-1 min-w-32 bg-black/50 border border-neon-purple/40 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-neon-purple" />
                  <input value={editing.correo_usu} onChange={e => setEditing(p => ({...p, correo_usu: e.target.value}))}
                    className="flex-1 min-w-40 bg-black/50 border border-neon-purple/40 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-neon-purple" />
                  <select value={editing.cod_rol} onChange={e => setEditing(p => ({...p, cod_rol: e.target.value}))}
                    className="bg-black/50 border border-neon-purple/40 rounded-lg px-3 py-2 text-white text-sm focus:outline-none">
                    {Object.entries(ROL_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                  <button onClick={saveEdit} disabled={saving}
                    className="px-4 py-2 bg-green-500/20 border border-green-500/30 text-green-400 rounded-lg text-sm font-bold hover:bg-green-500/30 transition-all disabled:opacity-50">
                    {saving ? "..." : "Guardar"}
                  </button>
                  <button onClick={() => setEditing(null)}
                    className="px-4 py-2 bg-white/5 border border-white/10 text-gray-400 rounded-lg text-sm hover:bg-white/10 transition-all">
                    Cancelar
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-neon-purple/20 border border-neon-purple/40 flex items-center justify-center flex-shrink-0">
                    <span className="font-bold text-neon-purple text-sm">{u.nombre_usu[0]?.toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold truncate">{u.nombre_usu}</p>
                    <p className="text-gray-400 text-xs truncate">{u.correo_usu}</p>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border bg-transparent ${ROL_COLORS[u.cod_rol] || "text-gray-400 border-gray-400/30"}`}>
                    {ROL_LABELS[u.cod_rol] || "—"}
                  </span>
                  <p className="text-xs text-gray-500 font-mono hidden sm:block">#{u.doc_identidad}</p>
                  <div className="flex gap-2">
                    <button onClick={() => setEditing({...u})}
                      className="p-2 rounded-lg bg-white/5 hover:bg-neon-purple/20 text-gray-400 hover:text-neon-purple transition-all">
                      <Icon d={ICONS.edit} className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteUser(u.doc_identidad)}
                      className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all">
                      <Icon d={ICONS.trash} className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && <p className="text-gray-500 text-center py-8">No se encontraron usuarios</p>}
        </div>
      )}
    </div>
  );
}

// ── Sección: Inventario ───────────────────────────────────────────────────────
function InventorySection() {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [editing,  setEditing]  = useState(null);
  const [adding,   setAdding]   = useState(false);
  const [form,     setForm]     = useState({ nombre_produc: "", presentacion_produc: "", precio_produc: "", stock: "" });
  const [msg,      setMsg]      = useState(null);
  const socketRef = useRef(null);

  const notify = (type, text) => { setMsg({ type, text }); setTimeout(() => setMsg(null), 3000); };

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/productos");
      if (data.success) setProducts(data.data);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Sincronización en tiempo real con rol inventario
  useEffect(() => {
    const token = localStorage.getItem("neon_token");
    if (!token) return;
    const socket = io(SOCKET_URL, { auth: { token }, transports: ["websocket", "polling"] });
    socketRef.current = socket;
    socket.on("actualizarProductos", () => load());
    return () => { socket.disconnect(); socketRef.current = null; };
  }, [load]);

  const save = async () => {
    try {
      if (editing) {
        await api.put(`/productos/${editing.cod_producto}`, {
          nombre_produc: editing.nombre_produc,
          presentacion_produc: editing.presentacion_produc,
          precio_produc: Number(editing.precio_produc),
          stock: Number(editing.stock),
        });
        setEditing(null);
        notify("ok", "Producto actualizado");
      } else {
        await api.post("/productos", {
          nombre_produc: form.nombre_produc,
          presentacion_produc: form.presentacion_produc,
          precio_produc: Number(form.precio_produc),
          stock: Number(form.stock),
          cantidad: Number(form.stock),
        });
        setAdding(false);
        setForm({ nombre_produc: "", presentacion_produc: "", precio_produc: "", stock: "" });
        notify("ok", "Producto creado");
      }
      load();
    } catch { notify("err", "Error al guardar"); }
  };

  const remove = async (id) => {
    if (!window.confirm("¿Eliminar producto?")) return;
    try { await api.delete(`/productos/${id}`); notify("ok", "Eliminado"); load(); }
    catch { notify("err", "Error al eliminar"); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="font-orbitron font-black text-3xl text-white uppercase tracking-widest">Inventario</h2>
        <button onClick={() => { setAdding(true); setEditing(null); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-neon-purple text-black font-black rounded-xl hover:bg-neon-magenta transition-all shadow-neon-glow text-sm uppercase tracking-widest">
          <Icon d={ICONS.plus} className="w-4 h-4" /> Nuevo
        </button>
      </div>

      {msg && (
        <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-bold border ${msg.type === "ok" ? "bg-green-500/10 border-green-500/30 text-green-400" : "bg-red-500/10 border-red-500/30 text-red-400"}`}>
          {msg.text}
        </div>
      )}

      {(adding || editing) && (
        <div className="glass-panel rounded-2xl p-6 border border-neon-purple/30 mb-6">
          <h3 className="font-orbitron text-sm font-bold text-neon-purple mb-4 uppercase">{editing ? "Editar Producto" : "Nuevo Producto"}</h3>
          <div className="grid grid-cols-2 gap-4">
            {["nombre_produc","presentacion_produc","precio_produc","stock"].map(k => (
              <input key={k} placeholder={k.replace(/_/g," ")}
                value={editing ? editing[k] : form[k]}
                onChange={e => editing ? setEditing(p => ({...p,[k]:e.target.value})) : setForm(p => ({...p,[k]:e.target.value}))}
                className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-neon-purple"
              />
            ))}
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={save} className="px-6 py-2.5 bg-neon-purple text-black font-black rounded-xl hover:bg-neon-magenta transition-all text-sm uppercase">Guardar</button>
            <button onClick={() => { setAdding(false); setEditing(null); }} className="px-6 py-2.5 bg-white/5 border border-white/10 text-gray-400 rounded-xl hover:bg-white/10 transition-all text-sm">Cancelar</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">{[...Array(6)].map((_,i) => <div key={i} className="h-32 bg-white/5 rounded-2xl animate-pulse" />)}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {products.map(p => (
            <div key={p.cod_producto} className="glass-panel rounded-2xl p-5 border border-white/10 hover:border-neon-purple/40 transition-all">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold truncate">{p.nombre_produc}</p>
                  <p className="text-xs text-gray-400 truncate">{p.presentacion_produc}</p>
                </div>
                <div className="flex gap-1.5 ml-2">
                  <button onClick={() => { setEditing({...p}); setAdding(false); }}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-neon-purple/20 text-gray-400 hover:text-neon-purple transition-all">
                    <Icon d={ICONS.edit} className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => remove(p.cod_producto)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all">
                    <Icon d={ICONS.trash} className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Precio</p>
                  <p className="text-neon-purple font-orbitron font-bold">${Number(p.precio_produc).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Stock</p>
                  <p className={`font-orbitron font-bold ${p.stock <= 5 ? "text-red-400" : p.stock <= 20 ? "text-yellow-400" : "text-green-400"}`}>{p.stock}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Sección: Ventas ───────────────────────────────────────────────────────────
function SalesSection() {
  const [sales,   setSales]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState("all");
  const socketRef = useRef(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/ventas");
      if (data.success) setSales(data.data);
    } catch { /* sin ventas aún */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const token = localStorage.getItem("neon_token");
    if (!token) return;
    const socket = io(SOCKET_URL, { auth: { token }, transports: ["websocket", "polling"] });
    socketRef.current = socket;
    socket.on("actualizarVentas", () => load());
    return () => { socket.disconnect(); socketRef.current = null; };
  }, [load]);

  const filtered = sales.filter(s => {
    if (tab === "today") {
      const today = new Date().toDateString();
      return new Date(s.fecha).toDateString() === today;
    }
    if (tab === "pending") return s.estado === "Pendiente";
    return true;
  });

  const total = filtered.reduce((acc, s) => acc + Number(s.total || 0), 0);
  const STATUS_COLOR = { Pagada: "text-green-400 border-green-400/30", Pendiente: "text-yellow-400 border-yellow-400/30", Cancelada: "text-red-400 border-red-400/30" };

  return (
    <div>
      <h2 className="font-orbitron font-black text-3xl text-white mb-8 uppercase tracking-widest">Ventas</h2>

      <div className="flex gap-3 mb-6">
        {[["all","Todas"],["today","Hoy"],["pending","Pendientes"]].map(([k,l]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm uppercase tracking-widest transition-all ${tab===k ? "bg-neon-purple text-black shadow-neon-glow" : "bg-white/5 border border-white/10 text-gray-400 hover:text-white"}`}>
            {l}
          </button>
        ))}
        <div className="ml-auto glass-panel px-5 py-2.5 rounded-xl border border-neon-purple/30">
          <span className="text-xs text-gray-400 uppercase tracking-widest">Total: </span>
          <span className="font-orbitron font-bold text-neon-purple">${total.toLocaleString()}</span>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_,i) => <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />)}</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(s => (
            <div key={s.id_venta} className="glass-panel rounded-xl p-4 border border-white/10 flex flex-wrap gap-4 items-center">
              <span className="font-mono text-gray-500 text-xs">#{s.id_venta}</span>
              <span className="text-white font-bold flex-1 min-w-24">
                {s.usuario?.nombre_usu || `Doc ${s.doc_identidad}`}
              </span>
              <span className="text-gray-400 text-sm">{new Date(s.fecha).toLocaleDateString("es-CO")}</span>
              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${STATUS_COLOR[s.estado] || "text-gray-400 border-gray-400/30"}`}>{s.estado}</span>
              <span className="font-orbitron font-bold text-neon-purple">${Number(s.total).toLocaleString()}</span>
            </div>
          ))}
          {filtered.length === 0 && <p className="text-gray-500 text-center py-8">Sin ventas en esta vista</p>}
        </div>
      )}
    </div>
  );
}

// ── Sección: Reservas ─────────────────────────────────────────────────────────
function ReservationsSection() {
  const [reservas, setReservas] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    api.get("/reservas").then(({ data }) => {
      if (data.success) setReservas(data.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const STATUS_COLOR = { Confirmada: "text-green-400 border-green-400/30", Pendiente: "text-yellow-400 border-yellow-400/30", Cancelada: "text-red-400 border-red-400/30" };

  return (
    <div>
      <h2 className="font-orbitron font-black text-3xl text-white mb-8 uppercase tracking-widest">Reservas</h2>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_,i) => <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />)}</div>
      ) : (
        <div className="space-y-3">
          {reservas.map(r => (
            <div key={r.id_reserva} className="glass-panel rounded-xl p-4 border border-white/10 flex flex-wrap gap-4 items-center hover:border-neon-purple/40 transition-all">
              <span className="font-mono text-gray-500 text-xs">#{r.id_reserva}</span>
              <div className="flex-1 min-w-40">
                <p className="text-white font-bold">{r.usuario?.nombre_usu || `Doc ${r.doc_identidad}`}</p>
                <p className="text-xs text-gray-400">Mesa #{r.mesa?.numero_mesa} · {r.cantidad_personas} personas</p>
              </div>
              <span className="text-gray-400 text-sm">{new Date(r.fecha_reserva).toLocaleDateString("es-CO")}</span>
              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${STATUS_COLOR[r.estado] || "text-gray-400 border-gray-400/30"}`}>{r.estado}</span>
              {r.mesa?.tipo_mesa === "VIP" && (
                <span className="text-xs font-bold px-3 py-1 rounded-full border text-neon-magenta border-neon-magenta/30">VIP</span>
              )}
            </div>
          ))}
          {reservas.length === 0 && <p className="text-gray-500 text-center py-8">Sin reservas registradas</p>}
        </div>
      )}
    </div>
  );
}

// ── Sección: Música (DJ) ──────────────────────────────────────────────────────
function MusicSection() {
  const { queue, loading, playSong, markPlayed, rejectSong, restoreSong, refetch } = useSongs();

  useEffect(() => { refetch(); }, [refetch]);

  const STATUS_STYLE = {
    playing:  "text-neon-purple border-neon-purple/40 bg-neon-purple/10",
    queued:   "text-blue-400 border-blue-400/30 bg-blue-500/5",
    played:   "text-gray-400 border-gray-400/20 bg-white/5",
    rejected: "text-red-400 border-red-400/30 bg-red-500/5",
  };
  const STATUS_LABEL = { playing: "Reproduciendo", queued: "En cola", played: "Reproducida", rejected: "Rechazada" };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="font-orbitron font-black text-3xl text-white uppercase tracking-widest">Cola de Música</h2>
        <button onClick={refetch} className="px-4 py-2 bg-white/5 border border-white/10 text-gray-400 rounded-xl text-sm hover:text-white hover:bg-white/10 transition-all">
          Actualizar
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_,i) => <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />)}</div>
      ) : queue.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <Icon d={ICONS.music} className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>La cola está vacía</p>
        </div>
      ) : (
        <div className="space-y-3">
          {queue.map(song => (
            <div key={song.id}
              className={`rounded-2xl p-4 border transition-all flex flex-wrap gap-4 items-center ${STATUS_STYLE[song.status] || "border-white/10 bg-white/5"}`}>
              <div className="flex-1 min-w-40">
                <p className="text-white font-bold">{song.title}</p>
                <p className="text-xs text-gray-400">{song.artist} · por {song.requestedBy}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">👍 {song.votes}</span>
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${STATUS_STYLE[song.status]}`}>
                  {STATUS_LABEL[song.status] || song.status}
                </span>
              </div>
              <div className="flex gap-2">
                {song.status === "queued" && (
                  <>
                    <button onClick={() => playSong(song.id)} title="Reproducir"
                      className="p-2 rounded-xl bg-neon-purple/20 border border-neon-purple/30 text-neon-purple hover:bg-neon-purple/40 transition-all">
                      <Icon d={ICONS.play} className="w-4 h-4" />
                    </button>
                    <button onClick={() => rejectSong(song.id)} title="Rechazar"
                      className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all">
                      <Icon d={ICONS.ban} className="w-4 h-4" />
                    </button>
                  </>
                )}
                {song.status === "playing" && (
                  <button onClick={() => markPlayed(song.id)} title="Marcar reproducida"
                    className="p-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 transition-all">
                    <Icon d={ICONS.done} className="w-4 h-4" />
                  </button>
                )}
                {(song.status === "played" || song.status === "rejected") && (
                  <button onClick={() => restoreSong(song.id)} title="Restaurar a cola"
                    className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-all">
                    <Icon d={ICONS.restore} className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Sección: Eventos ─────────────────────────────────────────────────────────
// NOTA: Field se declaró a nivel de módulo (arriba) para evitar re-mount por render (lag de escritura)
const TAG_OPTIONS = ["", "HOT", "NEW", "SOLD OUT", "FEW LEFT"];
const TAG_LABELS  = { "": "Sin tag", "HOT": "🔥 HOT", "NEW": "✨ NEW", "SOLD OUT": "🚫 SOLD OUT", "FEW LEFT": "⚠️ FEW LEFT" };
const TAG_COLORS  = { "SOLD OUT":"text-red-400 border-red-400/30","HOT":"text-orange-400 border-orange-400/30","NEW":"text-green-400 border-green-400/30","FEW LEFT":"text-yellow-400 border-yellow-400/30" };
const EVENTO_EMPTY = { nombre:"", dj:"", fecha:"", hora:"", precio:"", imagen_url:"", tag:"", descripcion:"" };

function EventosSection() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [adding,  setAdding]  = useState(false);
  const [msg,     setMsg]     = useState(null);
  const [form,    setForm]    = useState(EVENTO_EMPTY);
  const socketRef = useRef(null);

  const notify = (type, text) => { setMsg({ type, text }); setTimeout(() => setMsg(null), 3500); };

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/eventos");
      if (data.success) setEventos(data.data);
    } catch { /* sin eventos */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const token = localStorage.getItem("neon_token");
    if (!token) return;
    const socket = io(SOCKET_URL, { auth: { token }, transports: ["websocket", "polling"] });
    socketRef.current = socket;
    socket.on("actualizarEventos", () => load());
    return () => { socket.disconnect(); socketRef.current = null; };
  }, [load]);

  const saveNew = async () => {
    if (!form.nombre || !form.fecha || !form.precio) { notify("err", "Nombre, fecha y precio son obligatorios"); return; }
    try {
      await api.post("/eventos", { ...form, precio: Number(form.precio) });
      setAdding(false); setForm(EVENTO_EMPTY); notify("ok", "Evento creado ✓"); load();
    } catch (e) { notify("err", e.response?.data?.message || e.message); }
  };

  const saveEdit = async () => {
    try {
      await api.put(`/eventos/${editing.id_evento}`, {
        ...editing,
        precio: Number(editing.precio),
        fecha: editing.fecha instanceof Date
          ? editing.fecha.toISOString().split("T")[0]
          : editing.fecha,
      });
      setEditing(null); notify("ok", "Evento actualizado ✓"); load();
    } catch (e) { notify("err", e.response?.data?.message || e.message); }
  };

  const remove = async (id) => {
    if (!window.confirm("¿Eliminar este evento?")) return;
    try { await api.delete(`/eventos/${id}`); notify("ok", "Evento eliminado"); load(); }
    catch (e) { notify("err", e.response?.data?.message || e.message); }
  };

  // Subformulario de campos (reutilizado para nuevo y edición)
  const EventoForm = ({ obj, setObj, onSave, onCancel, title, saveLabel }) => (
    <div className="glass-panel rounded-2xl p-6 border border-neon-purple/30 mb-6">
      <h3 className="font-orbitron text-sm font-bold text-neon-purple mb-5 uppercase">{title}</h3>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Field label="Nombre *"        field="nombre"      obj={obj} setObj={setObj} />
        <Field label="DJ / Artista"    field="dj"          obj={obj} setObj={setObj} />
        <Field label="Fecha *"         field="fecha"       type="date"   obj={obj} setObj={setObj} />
        <Field label="Hora (HH:MM)"    field="hora"        type="time"   obj={obj} setObj={setObj} />
        <Field label="Precio (COP) *"  field="precio"      type="number" obj={obj} setObj={setObj} />

        {/* Tag como select */}
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-widest mb-1 block">Tag</label>
          <select
            value={obj.tag ?? ""}
            onChange={e => setObj(p => ({ ...p, tag: e.target.value }))}
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-neon-purple"
          >
            {TAG_OPTIONS.map(t => <option key={t} value={t}>{TAG_LABELS[t]}</option>)}
          </select>
        </div>

        <div className="col-span-2">
          <Field label="URL de imagen"  field="imagen_url"  obj={obj} setObj={setObj} />
        </div>
        <div className="col-span-2">
          <label className="text-xs text-gray-400 uppercase tracking-widest mb-1 block">Descripción</label>
          <textarea
            value={obj.descripcion ?? ""}
            onChange={e => setObj(p => ({ ...p, descripcion: e.target.value }))}
            rows={2}
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-neon-purple resize-none"
          />
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={onSave}  className="px-6 py-2.5 bg-neon-purple text-black font-black rounded-xl hover:bg-neon-magenta transition-all text-sm uppercase">{saveLabel}</button>
        <button onClick={onCancel} className="px-6 py-2.5 bg-white/5 border border-white/10 text-gray-400 rounded-xl hover:bg-white/10 text-sm">Cancelar</button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="font-orbitron font-black text-3xl text-white uppercase tracking-widest">Eventos</h2>
        <button onClick={() => { setAdding(true); setEditing(null); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-neon-purple text-black font-black rounded-xl hover:bg-neon-magenta transition-all shadow-neon-glow text-sm uppercase tracking-widest">
          <Icon d={ICONS.plus} className="w-4 h-4" /> Nuevo Evento
        </button>
      </div>

      {msg && (
        <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-bold border ${msg.type==="ok" ? "bg-green-500/10 border-green-500/30 text-green-400" : "bg-red-500/10 border-red-500/30 text-red-400"}`}>
          {msg.text}
        </div>
      )}

      {adding && (
        <EventoForm
          obj={form} setObj={setForm}
          onSave={saveNew}
          onCancel={() => { setAdding(false); setForm(EVENTO_EMPTY); }}
          title="Nuevo Evento"
          saveLabel="Guardar"
        />
      )}

      {editing && (
        <EventoForm
          obj={editing} setObj={setEditing}
          onSave={saveEdit}
          onCancel={() => setEditing(null)}
          title={`Editar: ${editing.nombre}`}
          saveLabel="Actualizar"
        />
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(3)].map((_,i) => <div key={i} className="h-48 bg-white/5 rounded-2xl animate-pulse" />)}
        </div>
      ) : eventos.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <Icon d={ICONS.reservations} className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p className="font-mono text-sm">Sin eventos. Crea el primero.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {eventos.map(ev => {
            const fechaStr = ev.fecha
              ? new Date(ev.fecha).toLocaleDateString("es-CO", { day:"numeric", month:"short", year:"numeric" })
              : "";
            return (
              <div key={ev.id_evento} className="glass-panel rounded-2xl overflow-hidden border border-white/10 hover:border-neon-purple/40 transition-all">
                {ev.imagen_url ? (
                  <div className="h-36 relative">
                    <img src={ev.imagen_url} alt={ev.nombre} className="w-full h-full object-cover brightness-75" />
                    {ev.tag && (
                      <span className={`absolute top-2 right-2 text-[9px] font-black px-2 py-1 rounded-md border ${TAG_COLORS[ev.tag] || "text-neon-purple border-neon-purple/30"}`}>{ev.tag}</span>
                    )}
                  </div>
                ) : (
                  <div className="h-36 bg-gradient-to-br from-neon-purple/20 to-neon-magenta/10 flex items-center justify-center">
                    <span className="font-orbitron font-black text-2xl text-white/20 uppercase text-center px-4">{ev.nombre}</span>
                  </div>
                )}
                <div className="p-4">
                  <p className="text-neon-purple text-[10px] font-mono mb-0.5">{fechaStr}{ev.hora ? ` · ${ev.hora}` : ""}</p>
                  <h4 className="text-white font-bold text-sm mb-0.5">{ev.nombre}</h4>
                  {ev.dj && <p className="text-gray-400 text-xs font-mono mb-2">{ev.dj}</p>}
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-orbitron font-bold text-neon-purple text-sm">${Number(ev.precio).toLocaleString("es-CO")}</span>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => {
                          setEditing({
                            ...ev,
                            fecha: ev.fecha ? new Date(ev.fecha).toISOString().split("T")[0] : "",
                            tag: ev.tag || "",
                          });
                          setAdding(false);
                        }}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-neon-purple/20 text-gray-400 hover:text-neon-purple transition-all">
                        <Icon d={ICONS.edit} className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => remove(ev.id_evento)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all">
                        <Icon d={ICONS.trash} className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Sección: Horarios ─────────────────────────────────────────────────────────
const SEMANA_KEYS  = ["Lunes","Martes","Miercoles","Jueves","Viernes","Sabado","Domingo"];
const SEMANA_ES    = { Lunes:"Lunes",Martes:"Martes",Miercoles:"Miércoles",Jueves:"Jueves",Viernes:"Viernes",Sabado:"Sábado",Domingo:"Domingo" };
const HORARIO_EMPTY = { dia_semana:"Lunes", hora_entrada:"", hora_salida:"", estado:true };

// Convertir "HH:MM" → "1970-01-01THH:MM:00.000Z" (UTC ISO para Prisma Time)
const toISOTime = (hhmm) => hhmm ? `1970-01-01T${hhmm}:00.000Z` : null;
// Convertir ISO datetime → "HH:MM" (UTC)
const fromISOTime = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return `${String(d.getUTCHours()).padStart(2,"0")}:${String(d.getUTCMinutes()).padStart(2,"0")}`;
};

function HorariosSection() {
  const [empleados,    setEmpleados]    = useState([]);
  const [selectedDoc,  setSelectedDoc]  = useState("");
  const [horarios,     setHorarios]     = useState([]);
  const [loadingEmp,   setLoadingEmp]   = useState(true);
  const [loadingHor,   setLoadingHor]   = useState(false);
  const [adding,       setAdding]       = useState(false);
  const [editing,      setEditing]      = useState(null);
  const [form,         setForm]         = useState(HORARIO_EMPTY);
  const [saving,       setSaving]       = useState(false);
  const [msg,          setMsg]          = useState(null);

  const notify = (type, text) => { setMsg({ type, text }); setTimeout(() => setMsg(null), 3500); };

  // Cargar empleados (roles 2 y 5)
  const loadEmpleados = useCallback(async () => {
    try {
      setLoadingEmp(true);
      const { data } = await api.get("/usuarios");
      if (data.success) {
        setEmpleados(data.data.filter(u => u.cod_rol === 2 || u.cod_rol === 5));
      }
    } catch { /* ignore */ } finally { setLoadingEmp(false); }
  }, []);

  // Cargar horarios del empleado seleccionado
  const loadHorarios = useCallback(async (doc) => {
    if (!doc) return;
    setLoadingHor(true);
    try {
      const { data } = await api.get(`/horarios/usuario/${doc}`);
      setHorarios(data.data || []);
    } catch { setHorarios([]); } finally { setLoadingHor(false); }
  }, []);

  useEffect(() => { loadEmpleados(); }, [loadEmpleados]);

  useEffect(() => {
    if (selectedDoc) loadHorarios(selectedDoc);
    else setHorarios([]);
  }, [selectedDoc, loadHorarios]);

  // Socket en tiempo real
  useEffect(() => {
    const token = localStorage.getItem("neon_token");
    if (!token) return;
    const socket = io(SOCKET_URL, { auth: { token }, transports: ["websocket","polling"] });
    socket.on("actualizarHorarios", () => { if (selectedDoc) loadHorarios(selectedDoc); });
    return () => socket.disconnect();
  }, [selectedDoc, loadHorarios]);

  const openAdd = () => {
    setForm(HORARIO_EMPTY);
    setEditing(null);
    setAdding(true);
  };

  const openEdit = (h) => {
    setForm({
      dia_semana:   h.dia_semana,
      hora_entrada: fromISOTime(h.hora_entrada),
      hora_salida:  fromISOTime(h.hora_salida),
      estado:       h.estado,
    });
    setEditing(h);
    setAdding(false);
  };

  const cancelForm = () => { setAdding(false); setEditing(null); setForm(HORARIO_EMPTY); };

  const save = async () => {
    if (!selectedDoc) { notify("err", "Selecciona un empleado"); return; }
    if (!form.hora_entrada || !form.hora_salida) { notify("err", "Completa la hora de entrada y salida"); return; }

    setSaving(true);
    try {
      const payload = {
        doc_identidad: Number(selectedDoc),
        dia_semana:    form.dia_semana,
        hora_entrada:  toISOTime(form.hora_entrada),
        hora_salida:   toISOTime(form.hora_salida),
        estado:        form.estado,
      };

      if (editing) {
        await api.put(`/horarios/${editing.id_horario}`, payload);
        notify("ok", "Horario actualizado ✓");
        setEditing(null);
      } else {
        await api.post("/horarios", payload);
        notify("ok", "Horario creado ✓");
        setAdding(false);
      }
      setForm(HORARIO_EMPTY);
      loadHorarios(selectedDoc);
    } catch (e) {
      notify("err", e.response?.data?.message || "Error al guardar horario");
    } finally { setSaving(false); }
  };

  const deleteHorario = async (id) => {
    if (!window.confirm("¿Eliminar este turno?")) return;
    try {
      await api.delete(`/horarios/${id}`);
      notify("ok", "Turno eliminado");
      loadHorarios(selectedDoc);
    } catch { notify("err", "Error al eliminar"); }
  };

  // Ordenar por día de la semana
  const horariosSorted = [...horarios].sort((a, b) =>
    SEMANA_KEYS.indexOf(a.dia_semana) - SEMANA_KEYS.indexOf(b.dia_semana)
  );

  const empleadoActual = empleados.find(e => String(e.doc_identidad) === String(selectedDoc));

  return (
    <div>
      <h2 className="font-orbitron font-black text-3xl text-white mb-2 uppercase tracking-widest">Horarios</h2>
      <p className="text-gray-500 text-sm mb-8 font-mono">Asigna turnos a empleados. El empleado solo podrá registrar ventas durante su horario.</p>

      {msg && (
        <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-bold border ${msg.type==="ok" ? "bg-green-500/10 border-green-500/30 text-green-400" : "bg-red-500/10 border-red-500/30 text-red-400"}`}>
          {msg.text}
        </div>
      )}

      {/* Selector de empleado */}
      <div className="glass-panel rounded-2xl p-5 border border-neon-purple/20 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-48">
            <label className="text-xs text-gray-400 uppercase tracking-widest mb-1 block">Empleado</label>
            {loadingEmp ? (
              <div className="h-11 bg-white/5 rounded-xl animate-pulse" />
            ) : (
              <select
                value={selectedDoc}
                onChange={e => { setSelectedDoc(e.target.value); cancelForm(); }}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-neon-purple"
              >
                <option value="">— Seleccionar empleado —</option>
                {empleados.map(e => (
                  <option key={e.doc_identidad} value={e.doc_identidad}>
                    {e.nombre_usu} — {ROL_LABELS[e.cod_rol] || "Empleado"} (#{e.doc_identidad})
                  </option>
                ))}
              </select>
            )}
          </div>

          {selectedDoc && (
            <button onClick={openAdd}
              className="flex items-center gap-2 px-5 py-2.5 bg-neon-purple text-black font-black rounded-xl hover:bg-neon-magenta transition-all text-sm uppercase tracking-widest shadow-neon-glow flex-shrink-0">
              <Icon d={ICONS.plus} className="w-4 h-4" /> Nuevo Turno
            </button>
          )}
        </div>

        {empleadoActual && (
          <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-neon-purple/20 border border-neon-purple/40 flex items-center justify-center flex-shrink-0">
              <span className="text-neon-purple font-bold text-xs">{empleadoActual.nombre_usu[0]?.toUpperCase()}</span>
            </div>
            <div>
              <p className="text-white font-bold text-sm">{empleadoActual.nombre_usu}</p>
              <p className="text-neon-purple text-[10px] font-mono uppercase">{ROL_LABELS[empleadoActual.cod_rol]} · {empleadoActual.correo_usu}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-xs text-gray-500 font-mono">{horarios.filter(h=>h.estado).length} turnos activos</p>
            </div>
          </div>
        )}
      </div>

      {/* Formulario nuevo / edición */}
      {(adding || editing) && (
        <div className="glass-panel rounded-2xl p-6 border border-neon-purple/30 mb-6">
          <h3 className="font-orbitron text-sm font-bold text-neon-purple mb-5 uppercase">
            {editing ? "Editar turno" : "Nuevo turno"}
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-5">
            {/* Día */}
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-widest mb-1 block">Día de la semana</label>
              <select
                value={form.dia_semana}
                onChange={e => setForm(p => ({ ...p, dia_semana: e.target.value }))}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-neon-purple"
              >
                {SEMANA_KEYS.map(d => <option key={d} value={d}>{SEMANA_ES[d]}</option>)}
              </select>
            </div>

            {/* Estado */}
            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="horario-estado"
                checked={form.estado}
                onChange={e => setForm(p => ({ ...p, estado: e.target.checked }))}
                className="w-4 h-4 accent-neon-purple"
              />
              <label htmlFor="horario-estado" className="text-sm text-gray-300 font-mono">Turno activo</label>
            </div>

            {/* Hora entrada */}
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-widest mb-1 block">Hora entrada</label>
              <input
                type="time"
                value={form.hora_entrada}
                onChange={e => setForm(p => ({ ...p, hora_entrada: e.target.value }))}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-neon-purple"
              />
            </div>

            {/* Hora salida */}
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-widest mb-1 block">Hora salida</label>
              <input
                type="time"
                value={form.hora_salida}
                onChange={e => setForm(p => ({ ...p, hora_salida: e.target.value }))}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-neon-purple"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={save} disabled={saving}
              className="px-6 py-2.5 bg-neon-purple text-black font-black rounded-xl hover:bg-neon-magenta transition-all text-sm uppercase disabled:opacity-50">
              {saving ? "Guardando…" : (editing ? "Actualizar" : "Crear turno")}
            </button>
            <button onClick={cancelForm}
              className="px-6 py-2.5 bg-white/5 border border-white/10 text-gray-400 rounded-xl hover:bg-white/10 text-sm">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista de horarios */}
      {!selectedDoc ? (
        <div className="text-center py-20 text-gray-600">
          <Icon d={ICONS.schedule} className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p className="font-mono text-sm">Selecciona un empleado para ver y gestionar sus turnos</p>
        </div>
      ) : loadingHor ? (
        <div className="space-y-3">{[...Array(4)].map((_,i) => <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />)}</div>
      ) : horariosSorted.length === 0 ? (
        <div className="text-center py-16 text-gray-600 glass-panel rounded-2xl border border-dashed border-white/10">
          <p className="font-mono text-sm mb-2">Sin turnos asignados</p>
          <p className="text-xs text-gray-700">Usa "Nuevo Turno" para asignar un horario de trabajo</p>
        </div>
      ) : (
        <div className="space-y-3">
          {horariosSorted.map(h => (
            <div key={h.id_horario} className="glass-panel rounded-xl p-4 border border-white/10 hover:border-neon-purple/30 transition-all flex flex-wrap gap-4 items-center">
              {/* Día */}
              <div className="w-28 flex-shrink-0">
                <p className="font-orbitron font-bold text-neon-purple text-sm">{SEMANA_ES[h.dia_semana] || h.dia_semana}</p>
              </div>

              {/* Horario */}
              <div className="flex-1 min-w-32">
                <p className="text-white font-mono text-sm">
                  {fromISOTime(h.hora_entrada)} <span className="text-gray-500">→</span> {fromISOTime(h.hora_salida)}
                </p>
                {(() => {
                  const e = new Date(h.hora_entrada), s = new Date(h.hora_salida);
                  const mins = (s.getUTCHours()*60+s.getUTCMinutes()) - (e.getUTCHours()*60+e.getUTCMinutes());
                  if (mins > 0) return <p className="text-xs text-gray-500 font-mono">{Math.floor(mins/60)}h{mins%60>0?` ${mins%60}m`:""}</p>;
                  return null;
                })()}
              </div>

              {/* Estado */}
              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${h.estado ? "text-green-400 border-green-400/30 bg-green-500/5" : "text-red-400 border-red-400/30 bg-red-500/5"}`}>
                {h.estado ? "Activo" : "Inactivo"}
              </span>

              {/* Acciones */}
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => openEdit(h)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-neon-purple/20 text-gray-400 hover:text-neon-purple transition-all">
                  <Icon d={ICONS.edit} className="w-4 h-4" />
                </button>
                <button onClick={() => deleteHorario(h.id_horario)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all">
                  <Icon d={ICONS.trash} className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Shell principal ───────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { key: "overview",     label: "Overview",  icon: ICONS.overview },
  { key: "users",        label: "Usuarios",  icon: ICONS.users },
  { key: "inventory",    label: "Inventario",icon: ICONS.inventory },
  { key: "sales",        label: "Ventas",    icon: ICONS.sales },
  { key: "reservations", label: "Reservas",  icon: ICONS.reservations },
  { key: "music",        label: "Música",    icon: ICONS.music },
  { key: "eventos",      label: "Eventos",   icon: ICONS.reservations },
  { key: "horarios",     label: "Horarios",  icon: ICONS.schedule },
];

const SECTIONS = {
  overview:     OverviewSection,
  users:        UsersSection,
  inventory:    InventorySection,
  sales:        SalesSection,
  reservations: ReservationsSection,
  music:        MusicSection,
  eventos:      EventosSection,
  horarios:     HorariosSection,
};

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [active, setActive] = useState("overview");

  const handleLogout = () => { logout(); navigate("/login", { replace: true }); };

  const ActiveSection = SECTIONS[active];

  return (
    <div className="flex h-screen bg-black w-full overflow-hidden">

      {/* SIDEBAR */}
      <aside className="w-20 lg:w-64 bg-deep-charcoal border-r border-gray-800 flex flex-col items-center lg:items-start py-8 transition-all duration-300 flex-shrink-0">
        <div className="px-4 lg:px-6 mb-10 flex items-center gap-3 w-full justify-center lg:justify-start">
          <div className="w-10 h-10 bg-neon-purple rounded-lg flex items-center justify-center shadow-neon-glow animate-pulse-neon flex-shrink-0">
            <span className="font-orbitron font-black text-black text-xl">N</span>
          </div>
          <h1 className="hidden lg:block font-orbitron font-black text-lg tracking-tighter text-white whitespace-nowrap">
            <span className="text-neon-purple">MIDNIGHT</span>CODE
          </h1>
        </div>

        <nav className="flex-1 w-full px-2 lg:px-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(item => (
            <button key={item.key} onClick={() => setActive(item.key)}
              className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all ${
                active === item.key
                  ? "bg-gradient-to-r from-neon-purple/20 to-transparent border-l-4 border-neon-purple text-neon-purple"
                  : "text-gray-500 hover:text-white hover:bg-white/5 border-l-4 border-transparent"
              }`}>
              <Icon d={item.icon} className="w-5 h-5 flex-shrink-0" />
              <span className="hidden lg:block font-bold text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-3 lg:p-4 border-t border-gray-800 w-full">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-neon-magenta/20 border border-neon-magenta/40 flex items-center justify-center flex-shrink-0">
              <span className="text-neon-magenta font-bold text-sm">{(user?.name || "A")[0].toUpperCase()}</span>
            </div>
            <div className="hidden lg:flex flex-col flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{user?.name || "Admin"}</p>
              <p className="text-xs text-neon-magenta uppercase tracking-widest">Admin</p>
            </div>
            <button onClick={handleLogout} title="Cerrar sesión"
              className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-all flex-shrink-0">
              <Icon d={ICONS.logout} className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-10 bg-black/80 backdrop-blur border-b border-white/5 px-8 py-4 flex justify-between items-center">
          <div>
            <h2 className="font-orbitron font-black text-xl text-white uppercase tracking-widest">
              {NAV_ITEMS.find(n => n.key === active)?.label}
            </h2>
            <p className="text-gray-500 text-xs uppercase tracking-widest">
              Live Admin Panel <span className="text-neon-purple animate-pulse">●</span>
            </p>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-all">
            <Icon d={ICONS.logout} className="w-4 h-4" /> Salir
          </button>
        </header>

        <div className="p-8">
          <ActiveSection />
        </div>
      </main>
    </div>
  );
}
