import React, { useState, useEffect } from "react";
import NavbarEmpleado from "../../../components/Layout/NavbarEmpleado";

const STORAGE_KEY = "afterdark_productos";

// Servicio local (solo lectura + creación para empleado)
const productoService = {
  getAll: async () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  },
  create: async (data) => {
    const productos = await productoService.getAll();
    const newProducto = { ...data, id: Date.now() };
    const updated = [...productos, newProducto];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newProducto;
  }
};

const EmpleadoProductos = () => {
  // ===== ESTADOS =====
  const [productos, setProductos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("Todos");
  const [loading, setLoading] = useState(true);

  // Modal para nuevo producto
  const [modalAbierto, setModalAbierto] = useState(false);
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: "",
    categoria: "",
    stock: 0,
    stockTotal: 10,
    precio: 0,
    imagen: "",
    descripcion: "",
  });

  // Estado para errores por campo
  const [errores, setErrores] = useState({
    nombre: "",
    stock: "",
    stockTotal: "",
    precio: "",
  });

  const [toast, setToast] = useState({ visible: false, mensaje: "", tipo: "" });

  // ===== CARGAR DATOS =====
  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    setLoading(true);
    try {
      const data = await productoService.getAll();
      const productosConTotal = data.map(p => ({
        ...p,
        stockTotal: p.stockTotal || p.stock || 10,
      }));
      setProductos(productosConTotal);
    } catch (err) {
      setProductos([]);
      mostrarToast("Error al cargar productos", "error");
    } finally {
      setLoading(false);
    }
  };

  // ===== TOAST =====
  const mostrarToast = (mensaje, tipo = "success") => {
    setToast({ visible: true, mensaje, tipo });
    setTimeout(() => setToast({ visible: false, mensaje: "", tipo: "" }), 3000);
  };

  // ===== VALIDACIONES CON ERRORES VISIBLES =====
  const validarProducto = (producto) => {
    let erroresTemp = { nombre: "", stock: "", stockTotal: "", precio: "" };
    let esValido = true;

    // 1. Nombre duplicado
    const nombreExistente = productos.some(p =>
      p.nombre?.toLowerCase() === producto.nombre?.toLowerCase().trim()
    );
    if (nombreExistente) {
      erroresTemp.nombre = "Ya existe un producto con ese nombre";
      esValido = false;
    }

    // 2. Stock no puede ser mayor que el total
    if (parseInt(producto.stock) > parseInt(producto.stockTotal)) {
      erroresTemp.stock = "El stock actual no puede ser mayor que la capacidad total";
      esValido = false;
    }

    // 3. Precio no puede ser negativo
    if (parseFloat(producto.precio) < 0) {
      erroresTemp.precio = "El precio no puede ser negativo";
      esValido = false;
    }

    setErrores(erroresTemp);
    return esValido;
  };

  // ===== CREAR PRODUCTO =====
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!nuevoProducto.nombre?.trim() || !nuevoProducto.categoria) {
      mostrarToast("Nombre y categoría son obligatorios", "error");
      return;
    }

    if (!validarProducto(nuevoProducto)) {
      // Si hay errores, mostramos un toast general y no guardamos
      mostrarToast("Corrige los errores en el formulario", "error");
      return;
    }

    try {
      const created = await productoService.create({
        ...nuevoProducto,
        nombre: nuevoProducto.nombre.trim(),
        stock: parseInt(nuevoProducto.stock) || 0,
        stockTotal: parseInt(nuevoProducto.stockTotal) || 1,
        precio: Math.max(0, parseFloat(nuevoProducto.precio) || 0),
      });
      setProductos(prev => [...prev, created]);
      mostrarToast("Producto registrado correctamente", "success");
      setModalAbierto(false);
      setNuevoProducto({
        nombre: "",
        categoria: "",
        stock: 0,
        stockTotal: 10,
        precio: 0,
        imagen: "",
        descripcion: "",
      });
      setErrores({ nombre: "", stock: "", stockTotal: "", precio: "" });
    } catch (err) {
      mostrarToast("Error al guardar", "error");
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    let newValue = value;

    if (type === "number") {
      if (name === "precio") {
        const parsed = parseFloat(value);
        newValue = isNaN(parsed) ? 0 : Math.max(0, parsed);
      } else {
        const parsed = parseInt(value);
        newValue = isNaN(parsed) ? 0 : Math.max(0, parsed);
      }
    }

    setNuevoProducto({
      ...nuevoProducto,
      [name]: newValue,
    });

    // Limpiar el error del campo que se está editando
    setErrores(prev => ({ ...prev, [name]: "" }));
  };

  // ===== FILTROS Y ESTADÍSTICAS =====
  const categoriasUnicas = ["Todos", ...new Set(productos.map(p => p.categoria).filter(Boolean))];

  const productosFiltrados = productos.filter((p) => {
    const matchCategoria = categoriaFiltro === "Todos" || p.categoria === categoriaFiltro;
    const matchSearch = p.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.categoria?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategoria && matchSearch;
  });

  const totalItems = productos.length;
  const productosBajoStock = productos.filter(p => (p.stock / (p.stockTotal || 1)) < 0.3);
  const stockPromedio = productos.length > 0
    ? Math.round(productos.reduce((acc, p) => acc + (p.stock / (p.stockTotal || 1)), 0) / productos.length * 100)
    : 0;

  return (
    <>
      <NavbarEmpleado active="inventario" />
      <main className="md:ml-0 pt-32 px-margin-mobile md:px-margin-desktop pb-20 min-h-screen">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-white mb-2">Inventario de Productos</h1>
            <p className="font-body-md text-on-surface-variant">Gestión de stock y productos disponibles para la venta.</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setModalAbierto(true)}
              className="bg-primary text-on-primary font-label-md px-6 py-2 rounded-lg neon-glow-primary active:scale-95 transition-transform"
            >
              Nuevo Producto
            </button>
          </div>
        </header>

        {/* KPI Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-8">
          <div className="glass-card p-6 rounded-xl relative overflow-hidden">
            <div className="absolute -right-4 -top-4 text-primary opacity-10 scale-150">
              <span className="material-symbols-outlined text-8xl" style={{ fontVariationSettings: "'opsz' 48" }}>inventory_2</span>
            </div>
            <p className="text-on-surface-variant font-label-md text-label-md uppercase tracking-widest mb-2">Total Productos</p>
            <h3 className="font-stats-number text-stats-number text-white">{totalItems}</h3>
          </div>
          <div className="glass-card p-6 rounded-xl border-l-4 border-l-secondary relative overflow-hidden">
            <p className="text-on-surface-variant font-label-md text-label-md uppercase tracking-widest mb-2">Stock Bajo</p>
            <h3 className="font-stats-number text-stats-number text-secondary">{productosBajoStock.length}</h3>
            <div className="flex items-center gap-xs text-on-surface-variant font-label-md">
              <span className="material-symbols-outlined text-sm">warning</span>
              <span>Requieren atención</span>
            </div>
          </div>
          <div className="glass-card p-6 rounded-xl border-l-4 border-l-primary relative overflow-hidden">
            <p className="text-on-surface-variant font-label-md text-label-md uppercase tracking-widest mb-2">Rotación Stock</p>
            <h3 className="font-stats-number text-stats-number text-primary">{stockPromedio}%</h3>
            <div className="flex items-center gap-xs text-green-400 font-label-md">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              <span>+12% vs semana pasada</span>
            </div>
          </div>
        </div>

        {/* Tabla de productos */}
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/5">
            <h4 className="font-headline-md text-headline-md text-white">Listado de Productos</h4>
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                {categoriasUnicas.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoriaFiltro(cat)}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition whitespace-nowrap ${
                      categoriaFiltro === cat
                        ? "bg-primary/20 text-primary border border-primary/30"
                        : "text-on-surface-variant hover:text-on-surface border border-transparent"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="relative flex-1 sm:flex-none">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
                <input
                  className="bg-surface-container border-none rounded-full py-2 pl-10 pr-4 text-label-md w-full sm:w-48 focus:ring-2 focus:ring-primary transition-all"
                  placeholder="Buscar producto..."
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-on-surface-variant text-[12px] uppercase tracking-widest border-b border-white/5">
                  <th className="px-6 py-4 font-semibold">Producto</th>
                  <th className="px-6 py-4 font-semibold">Categoría</th>
                  <th className="px-6 py-4 font-semibold text-center">Nivel Stock</th>
                  <th className="px-6 py-4 font-semibold text-right">Precio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr><td colSpan="4" className="text-center py-4 text-on-surface-variant">Cargando...</td></tr>
                ) : productosFiltrados.length === 0 ? (
                  <tr><td colSpan="4" className="text-center py-4 text-on-surface-variant">No hay productos</td></tr>
                ) : (
                  productosFiltrados.map((p) => {
                    const porcentaje = p.stockTotal > 0 ? Math.round((p.stock / p.stockTotal) * 100) : 0;
                    const esBajo = porcentaje < 30;
                    return (
                      <tr key={p.id} className={`hover:bg-white/5 transition-colors ${esBajo ? "bg-error-container/5" : ""}`}>
                        <td className="px-6 py-4 flex items-center gap-3">
                          <div className="w-10 h-10 bg-surface-container rounded-lg border border-white/10 flex items-center justify-center">
                            <span className={`material-symbols-outlined ${esBajo ? "text-error" : "text-primary"}`}>
                              {p.categoria?.toLowerCase().includes("licor") ? "liquor" :
                               p.categoria?.toLowerCase().includes("cóctel") ? "local_bar" :
                               p.categoria?.toLowerCase().includes("refresco") ? "water_drop" :
                               p.categoria?.toLowerCase().includes("snack") ? "fastfood" : "inventory_2"}
                            </span>
                          </div>
                          <div>
                            <span className="font-label-md text-label-md text-on-surface">{p.nombre}</span>
                            {p.descripcion && (
                              <p className="text-xs text-on-surface-variant truncate max-w-[150px]">{p.descripcion}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-on-surface-variant">{p.categoria || "—"}</td>
                        <td className="px-6 py-4">
                          <div className="w-full flex items-center gap-3 justify-center">
                            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden max-w-[100px]">
                              <div className={`h-full ${esBajo ? "bg-error" : "bg-primary"}`} style={{ width: `${Math.min(porcentaje, 100)}%` }}></div>
                            </div>
                            <span className={`text-xs font-bold ${esBajo ? "text-error" : "text-on-surface"}`}>
                              {p.stock}/{p.stockTotal}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right font-stats-number text-on-surface text-sm">${p.precio?.toFixed(2) || "0.00"}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* ===== FAB ===== */}
      <button
        onClick={() => setModalAbierto(true)}
        className="fixed bottom-24 right-6 md:bottom-10 md:right-10 w-16 h-16 bg-primary rounded-full neon-glow-primary text-on-primary shadow-2xl flex items-center justify-center active:scale-90 transition-transform z-40 group"
      >
        <span className="material-symbols-outlined text-3xl group-hover:rotate-90 transition-transform">add</span>
        <span className="absolute right-20 bg-surface-container border border-white/10 px-4 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">Nuevo Producto</span>
      </button>

      {/* ===== TOAST ===== */}
      {toast.visible && (
        <div className={`fixed bottom-24 right-8 glass-card rounded-xl px-md py-sm flex items-center gap-sm transition-all duration-300 z-[100] border ${toast.tipo === "error" ? "border-error/30" : "border-primary/30"}`}>
          <span className="material-symbols-outlined text-primary">info</span>
          <div>
            <p className="text-on-surface font-bold text-sm">{toast.mensaje}</p>
          </div>
        </div>
      )}

      {/* ===== MODAL CON ERRORES VISIBLES ===== */}
      {modalAbierto && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass-card rounded-2xl p-6 w-full max-w-md relative border border-white/20 shadow-2xl max-h-[90vh] flex flex-col">
            <button
              onClick={() => setModalAbierto(false)}
              className="absolute top-3 right-3 text-on-surface-variant hover:text-primary transition-colors z-10"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <h3 className="font-headline-md text-headline-md text-on-surface mb-4 flex-shrink-0">Registrar Nuevo Producto</h3>
            <div className="overflow-y-auto flex-1 pr-2 custom-scrollbar">
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-label-md text-on-surface-variant mb-1">Nombre *</label>
                  <input
                    type="text"
                    name="nombre"
                    value={nuevoProducto.nombre}
                    onChange={handleChange}
                    className={`w-full bg-surface-container-high rounded-lg border px-3 py-2 text-on-surface focus:border-primary/50 focus:outline-none ${
                      errores.nombre ? "border-error/50" : "border-white/10"
                    }`}
                    required
                    placeholder="ej. Whisky Jack Daniel's"
                  />
                  {errores.nombre && (
                    <p className="text-error text-xs mt-1">{errores.nombre}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-label-md text-on-surface-variant mb-1">Categoría *</label>
                  <select
                    name="categoria"
                    value={nuevoProducto.categoria}
                    onChange={handleChange}
                    className="w-full bg-surface-container-high rounded-lg border border-white/10 px-3 py-2 text-on-surface focus:border-primary/50 focus:outline-none"
                    required
                  >
                    <option value="">Seleccionar</option>
                    <option value="Licores">Licores</option>
                    <option value="Cócteles">Cócteles</option>
                    <option value="Refrescos">Refrescos</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Otros">Otros</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-label-md text-on-surface-variant mb-1">Stock Actual</label>
                  <input
                    type="number"
                    name="stock"
                    value={nuevoProducto.stock}
                    onChange={handleChange}
                    className={`w-full bg-surface-container-high rounded-lg border px-3 py-2 text-on-surface focus:border-primary/50 focus:outline-none ${
                      errores.stock ? "border-error/50" : "border-white/10"
                    }`}
                    min="0"
                    step="1"
                    placeholder="0"
                  />
                  {errores.stock && (
                    <p className="text-error text-xs mt-1">{errores.stock}</p>
                  )}
                  <p className="text-[10px] text-on-surface-variant mt-1">Debe ser un número entero</p>
                </div>
                <div>
                  <label className="block text-xs font-label-md text-on-surface-variant mb-1">Capacidad Total</label>
                  <input
                    type="number"
                    name="stockTotal"
                    value={nuevoProducto.stockTotal}
                    onChange={handleChange}
                    className="w-full bg-surface-container-high rounded-lg border border-white/10 px-3 py-2 text-on-surface focus:border-primary/50 focus:outline-none"
                    min="1"
                    step="1"
                    placeholder="10"
                  />
                  <p className="text-[10px] text-on-surface-variant mt-1">Debe ser un número entero mayor a 0</p>
                </div>
                <div>
                  <label className="block text-xs font-label-md text-on-surface-variant mb-1">Precio ($)</label>
                  <input
                    type="number"
                    name="precio"
                    value={nuevoProducto.precio}
                    onChange={handleChange}
                    className={`w-full bg-surface-container-high rounded-lg border px-3 py-2 text-on-surface focus:border-primary/50 focus:outline-none ${
                      errores.precio ? "border-error/50" : "border-white/10"
                    }`}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                  {errores.precio && (
                    <p className="text-error text-xs mt-1">{errores.precio}</p>
                  )}
                  <p className="text-[10px] text-on-surface-variant mt-1">No puede ser negativo</p>
                </div>
                <div>
                  <label className="block text-xs font-label-md text-on-surface-variant mb-1">Imagen (URL)</label>
                  <input
                    type="text"
                    name="imagen"
                    value={nuevoProducto.imagen}
                    onChange={handleChange}
                    className="w-full bg-surface-container-high rounded-lg border border-white/10 px-3 py-2 text-on-surface focus:border-primary/50 focus:outline-none"
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-label-md text-on-surface-variant mb-1">Descripción</label>
                  <textarea
                    name="descripcion"
                    value={nuevoProducto.descripcion}
                    onChange={handleChange}
                    className="w-full bg-surface-container-high rounded-lg border border-white/10 px-3 py-2 text-on-surface focus:border-primary/50 focus:outline-none resize-none"
                    rows="2"
                    placeholder="Descripción breve..."
                  />
                </div>
                <div className="flex gap-3 pt-2 sticky bottom-0 bg-surface-container/90 backdrop-blur-sm py-2 -mx-2 px-2 rounded-lg">
                  <button
                    type="submit"
                    className="flex-1 bg-primary text-on-primary py-2 rounded-xl font-label-md hover:brightness-110 transition-all active:scale-95"
                  >
                    Registrar
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
        </div>
      )}

      {/* ===== ESTILOS DE RESPALDO ===== */}
      <style jsx>{`
        body, html {
          background-color: #050505 !important;
          margin: 0;
          padding: 0;
        }

        .pt-32 { padding-top: 8rem; }
        .md\\:ml-0 { margin-left: 0; }
        .pb-20 { padding-bottom: 5rem; }
        .px-margin-mobile { padding-left: 16px; padding-right: 16px; }
        .md\\:px-margin-desktop { padding-left: 48px; padding-right: 48px; }
        .min-h-screen { min-height: 100vh; }

        .font-headline-lg { font-family: 'Montserrat', sans-serif; font-size: 32px; line-height: 40px; letter-spacing: -0.01em; font-weight: 700; }
        .text-headline-lg { font-size: 32px; line-height: 40px; letter-spacing: -0.01em; font-weight: 700; }
        .font-body-md { font-family: 'Inter', sans-serif; font-size: 16px; line-height: 24px; font-weight: 400; }
        .text-body-md { font-size: 16px; line-height: 24px; font-weight: 400; }
        .font-label-md { font-family: 'Inter', sans-serif; font-size: 14px; line-height: 20px; letter-spacing: 0.05em; font-weight: 600; }
        .text-label-md { font-size: 14px; line-height: 20px; letter-spacing: 0.05em; font-weight: 600; }
        .font-headline-md { font-family: 'Montserrat', sans-serif; font-size: 24px; line-height: 32px; font-weight: 600; }
        .text-headline-md { font-size: 24px; line-height: 32px; font-weight: 600; }
        .font-stats-number { font-family: 'Montserrat', sans-serif; font-size: 36px; line-height: 44px; font-weight: 700; }
        .text-stats-number { font-size: 36px; line-height: 44px; font-weight: 700; }
        .text-8xl { font-size: 6rem; line-height: 1; }
        .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
        .text-xs { font-size: 0.75rem; line-height: 1rem; }
        .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
        .text-\\[10px\\] { font-size: 10px; }
        .text-\\[12px\\] { font-size: 12px; }

        .text-primary { color: #e9b3ff; }
        .text-on-surface { color: #e5e2e1; }
        .text-on-surface-variant { color: #d2c1d4; }
        .text-secondary { color: #ffb2b7; }
        .text-tertiary { color: #e7c448; }
        .text-error { color: #ffb4ab; }
        .text-green-400 { color: #4ade80; }
        .text-yellow-400 { color: #facc15; }
        .text-white { color: #ffffff; }
        .text-on-primary { color: #510074; }

        .bg-primary { background-color: #e9b3ff; }
        .bg-primary\\/20 { background-color: rgba(233,179,255,0.2); }
        .bg-primary\\/10 { background-color: rgba(233,179,255,0.1); }
        .bg-primary\\/5 { background-color: rgba(233,179,255,0.05); }
        .bg-secondary { background-color: #ffb2b7; }
        .bg-secondary\\/20 { background-color: rgba(255,178,183,0.2); }
        .bg-tertiary { background-color: #e7c448; }
        .bg-tertiary\\/20 { background-color: rgba(231,196,72,0.2); }
        .bg-surface-container { background-color: #201f1f; }
        .bg-surface-container-high { background-color: #2a2a2a; }
        .bg-surface-container-lowest { background-color: #0e0e0e; }
        .bg-surface-container-highest { background-color: #353534; }
        .bg-white\\/5 { background-color: rgba(255,255,255,0.05); }
        .bg-white\\/10 { background-color: rgba(255,255,255,0.1); }
        .bg-error-container\\/5 { background-color: rgba(147,0,10,0.05); }
        .bg-black\\/70 { background-color: rgba(0,0,0,0.7); }

        .border-white\\/10 { border-color: rgba(255,255,255,0.1); }
        .border-white\\/5 { border-color: rgba(255,255,255,0.05); }
        .border-primary { border-color: #e9b3ff; }
        .border-primary\\/20 { border-color: rgba(233,179,255,0.2); }
        .border-primary\\/30 { border-color: rgba(233,179,255,0.3); }
        .border-primary\\/50 { border-color: rgba(233,179,255,0.5); }
        .border-secondary { border-color: #ffb2b7; }
        .border-tertiary { border-color: #e7c448; }
        .border-error\\/30 { border-color: rgba(255,180,171,0.3); }
        .border-error\\/50 { border-color: rgba(255,180,171,0.5); }
        .border-l-4 { border-left-width: 4px; }
        .border-l-primary { border-left-color: #e9b3ff; }
        .border-l-secondary { border-left-color: #ffb2b7; }

        .glass-card {
          background: rgba(28, 28, 30, 0.7);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-top: 1px solid rgba(255, 255, 255, 0.15);
          transition: all 0.3s ease;
        }
        .glass-card:hover {
          border-color: rgba(233, 179, 255, 0.3);
        }

        .neon-glow-primary {
          box-shadow: 0 0 12px 2px rgba(233, 179, 255, 0.3);
        }

        .shadow-2xl { box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); }
        .shadow-\\[0_0_8px_rgba\\(233\\,179\\,255\\,0\\.5\\)\\] { box-shadow: 0 0 8px rgba(233,179,255,0.5); }
        .shadow-\\[0_0_20px_rgba\\(233\\,179\\,255\\,0\\.6\\)\\] { box-shadow: 0 0 20px rgba(233,179,255,0.6); }
        .shadow-\\[0_0_15px_rgba\\(233\\,179\\,255\\,0\\.1\\)\\] { box-shadow: 0 0 15px rgba(233,179,255,0.1); }
        .shadow-\\[0_0_10px_rgba\\(233\\,179\\,255\\,0\\.4\\)\\] { box-shadow: 0 0 10px rgba(233,179,255,0.4); }

        .rounded-full { border-radius: 9999px; }
        .rounded-xl { border-radius: 0.75rem; }
        .rounded-lg { border-radius: 0.5rem; }
        .rounded-2xl { border-radius: 1rem; }

        .transition-all { transition: all 0.3s ease; }
        .duration-300 { transition-duration: 300ms; }
        .active\\:scale-95:active { transform: scale(0.95); }
        .active\\:scale-90:active { transform: scale(0.9); }
        .hover\\:brightness-110:hover { filter: brightness(1.1); }
        .hover\\:bg-white\\/5:hover { background-color: rgba(255,255,255,0.05); }

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

        .gap-gutter { gap: 24px; }
        .gap-xs { gap: 4px; }
        .gap-sm { gap: 12px; }
        .gap-md { gap: 24px; }
        .gap-xl { gap: 40px; }
        .space-y-4 > * + * { margin-top: 1rem; }
        .mb-2 { margin-bottom: 0.5rem; }
        .mb-1 { margin-bottom: 0.25rem; }
        .mb-4 { margin-bottom: 1rem; }
        .mb-6 { margin-bottom: 1.5rem; }
        .mb-8 { margin-bottom: 2rem; }
        .mt-8 { margin-top: 2rem; }
        .mr-xs { margin-right: 4px; }
        .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
        .px-4 { padding-left: 1rem; padding-right: 1rem; }
        .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
        .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
        .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
        .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
        .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
        .p-6 { padding: 1.5rem; }
        .p-4 { padding: 1rem; }
        .p-2 { padding: 0.5rem; }
        .w-full { width: 100%; }
        .w-2 { width: 0.5rem; }
        .w-3 { width: 0.75rem; }
        .w-8 { width: 2rem; }
        .w-10 { width: 2.5rem; }
        .w-16 { width: 4rem; }
        .w-48 { width: 12rem; }
        .max-w-2xl { max-width: 42rem; }
        .max-w-md { max-width: 28rem; }
        .max-w-\\[150px\\] { max-width: 150px; }
        .h-2 { height: 0.5rem; }
        .h-8 { height: 2rem; }
        .h-10 { height: 2.5rem; }
        .flex { display: flex; }
        .flex-col { flex-direction: column; }
        .items-center { align-items: center; }
        .justify-between { justify-content: space-between; }
        .justify-center { justify-content: center; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .text-left { text-align: left; }
        .overflow-hidden { overflow: hidden; }
        .overflow-x-auto { overflow-x: auto; }
        .overflow-y-auto { overflow-y: auto; }
        .border-collapse { border-collapse: collapse; }
        .divide-y > * + * { border-top-width: 1px; }
        .divide-white\\/5 > * + * { border-color: rgba(255,255,255,0.05); }
        .relative { position: relative; }
        .absolute { position: absolute; }
        .fixed { position: fixed; }
        .inset-0 { top:0; right:0; bottom:0; left:0; }
        .top-1\\/2 { top: 50%; }
        .left-3 { left: 0.75rem; }
        .right-6 { right: 1.5rem; }
        .bottom-24 { bottom: 6rem; }
        .right-8 { right: 2rem; }
        .-right-4 { right: -1rem; }
        .-top-4 { top: -1rem; }
        .-translate-y-1\\/2 { transform: translateY(-50%); }
        .-translate-x-1\\/2 { transform: translateX(-50%); }
        .scale-150 { transform: scale(1.5); }
        .opacity-10 { opacity: 0.1; }
        .opacity-0 { opacity: 0; }
        .opacity-100 { opacity: 1; }
        .pointer-events-none { pointer-events: none; }
        .z-10 { z-index: 10; }
        .z-40 { z-index: 40; }
        .z-\\[100\\] { z-index: 100; }
        .z-\\[200\\] { z-index: 200; }
        .backdrop-blur-sm { backdrop-filter: blur(4px); }
        .backdrop-blur-xl { backdrop-filter: blur(16px); }
        .border-none { border: none; }
        .focus\\:ring-2:focus { outline: none; box-shadow: 0 0 0 2px #e9b3ff; }
        .focus\\:ring-primary:focus { --tw-ring-color: #e9b3ff; }
        .focus\\:border-primary\\/50:focus { border-color: rgba(233,179,255,0.5); }
        .focus\\:outline-none:focus { outline: none; }
        .resize-none { resize: none; }
        .whitespace-nowrap { white-space: nowrap; }
        .truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .uppercase { text-transform: uppercase; }
        .tracking-widest { letter-spacing: 0.1em; }
        .tracking-tight { letter-spacing: -0.02em; }
        .tracking-tighter { letter-spacing: -0.05em; }
        .font-bold { font-weight: 700; }
        .font-semibold { font-weight: 600; }

        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e9b3ff;
          border-radius: 10px;
        }
        .flex-shrink-0 { flex-shrink: 0; }
        .sticky { position: sticky; }
        .bottom-0 { bottom: 0; }
        .bg-surface-container\\/90 { background-color: rgba(32, 31, 31, 0.9); }
        .backdrop-blur-sm { backdrop-filter: blur(4px); }

        @media (min-width: 640px) {
          .sm\\:flex-row { flex-direction: row; }
          .sm\\:items-center { align-items: center; }
          .sm\\:w-auto { width: auto; }
          .sm\\:flex-none { flex: none; }
          .sm\\:justify-end { justify-content: flex-end; }
        }

        @media (min-width: 768px) {
          .md\\:flex-row { flex-direction: row; }
          .md\\:items-center { align-items: center; }
          .md\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
          .md\\:px-margin-desktop { padding-left: 48px; padding-right: 48px; }
          .md\\:bottom-10 { bottom: 40px; }
          .md\\:right-10 { right: 40px; }
        }
      `}</style>
    </>
  );
};

export default EmpleadoProductos;