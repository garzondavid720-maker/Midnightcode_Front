import React, { useState, useEffect } from "react";
import { productoService } from "../../../services/productoService";
import NavbarAdmin from "../../../components/Layout/NavbarHeader";

const AdminProductos = () => {
  // ===== ESTADOS =====
  const [productos, setProductos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("Todos");
  const [loading, setLoading] = useState(false);

  // Modal de producto
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [productoActual, setProductoActual] = useState({
    id: null,
    nombre: "",
    categoria: "",
    stock: 0,
    stockTotal: 10,
    precio: 0,
    imagen: "",
    descripcion: "",
  });

  // Modal de proveedores
  const [modalProveedorAbierto, setModalProveedorAbierto] = useState(false);
  const [mensajeProveedor, setMensajeProveedor] = useState("");

  // Toast
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
      localStorage.setItem("afterdark_productos", JSON.stringify(productosConTotal));
    } catch (err) {
      const stored = localStorage.getItem("afterdark_productos");
      if (stored) {
        setProductos(JSON.parse(stored));
        mostrarToast("Datos cargados desde caché local", "info");
      } else {
        setProductos([]);
        mostrarToast("Error al cargar productos", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  // ===== TOAST =====
  const mostrarToast = (mensaje, tipo = "success") => {
    setToast({ visible: true, mensaje, tipo });
    setTimeout(() => setToast({ visible: false, mensaje: "", tipo: "" }), 3000);
  };

  // ===== VALIDACIONES =====
  const validarProducto = (producto) => {
    if (!producto.nombre.trim()) {
      mostrarToast("El nombre del producto es obligatorio", "error");
      return false;
    }
    const duplicado = productos.some(p =>
      p.nombre?.toLowerCase() === producto.nombre?.toLowerCase().trim() &&
      p.id !== producto.id
    );
    if (duplicado) {
      mostrarToast("Ya existe un producto con ese nombre", "error");
      return false;
    }
    if (!producto.categoria) {
      mostrarToast("La categoría es obligatoria", "error");
      return false;
    }
    if (producto.precio < 0) {
      mostrarToast("El precio no puede ser negativo", "error");
      return false;
    }
    if (producto.stock > producto.stockTotal) {
      mostrarToast("El stock actual no puede ser mayor que la capacidad total", "error");
      return false;
    }
    return true;
  };

  // ===== CRUD =====
  const handleCreate = async (nuevoProducto) => {
    if (!validarProducto(nuevoProducto)) return;
    try {
      const created = await productoService.create(nuevoProducto);
      const updated = [...productos, created];
      setProductos(updated);
      localStorage.setItem("afterdark_productos", JSON.stringify(updated));
      mostrarToast("Producto agregado correctamente", "success");
      cerrarModal();
    } catch (err) {
      const tempId = Date.now();
      const nuevo = { ...nuevoProducto, id: tempId };
      const updated = [...productos, nuevo];
      setProductos(updated);
      localStorage.setItem("afterdark_productos", JSON.stringify(updated));
      mostrarToast("Producto guardado localmente (sin conexión)", "info");
      cerrarModal();
    }
  };

  const handleUpdate = async (id, data) => {
    if (!validarProducto(data)) return;
    try {
      const updated = await productoService.update(id, data);
      const updatedList = productos.map((p) => (p.id === id ? updated : p));
      setProductos(updatedList);
      localStorage.setItem("afterdark_productos", JSON.stringify(updatedList));
      mostrarToast("Producto actualizado", "success");
      cerrarModal();
    } catch (err) {
      const updatedList = productos.map((p) =>
        p.id === id ? { ...p, ...data } : p
      );
      setProductos(updatedList);
      localStorage.setItem("afterdark_productos", JSON.stringify(updatedList));
      mostrarToast("Actualizado localmente (sin conexión)", "info");
      cerrarModal();
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este producto?")) return;
    try {
      await productoService.remove(id);
      const filtered = productos.filter((p) => p.id !== id);
      setProductos(filtered);
      localStorage.setItem("afterdark_productos", JSON.stringify(filtered));
      mostrarToast("Producto eliminado", "success");
    } catch (err) {
      const filtered = productos.filter((p) => p.id !== id);
      setProductos(filtered);
      localStorage.setItem("afterdark_productos", JSON.stringify(filtered));
      mostrarToast("Eliminado localmente (sin conexión)", "info");
    }
  };

  // ===== MODAL DE PRODUCTO =====
  const abrirModalCrear = () => {
    setModoEdicion(false);
    setProductoActual({ id: null, nombre: "", categoria: "", stock: 0, stockTotal: 10, precio: 0, imagen: "", descripcion: "" });
    setModalAbierto(true);
  };

  const abrirModalEditar = (producto) => {
    setModoEdicion(true);
    setProductoActual(producto);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setProductoActual({ id: null, nombre: "", categoria: "", stock: 0, stockTotal: 10, precio: 0, imagen: "", descripcion: "" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (modoEdicion) {
      handleUpdate(productoActual.id, productoActual);
    } else {
      handleCreate(productoActual);
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setProductoActual({
      ...productoActual,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    });
  };

  // ===== MODAL DE PROVEEDORES =====
  const abrirModalProveedor = () => {
    setModalProveedorAbierto(true);
    setMensajeProveedor("");
  };

  const cerrarModalProveedor = () => {
    setModalProveedorAbierto(false);
    setMensajeProveedor("");
  };

  const enviarMensajeProveedor = () => {
    if (!mensajeProveedor.trim()) {
      mostrarToast("Escribe un mensaje para el proveedor", "error");
      return;
    }
    mostrarToast("Mensaje enviado a los proveedores", "success");
    cerrarModalProveedor();
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
      <NavbarAdmin />

      {/* ===== ESTILOS ===== */}
      <style>{`
        body {
          background-color: #050505;
          color: #e5e2e1;
          overflow-x: hidden;
        }
        .glass-card {
          background: rgba(28, 28, 30, 0.7);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-top: 1px solid rgba(255, 255, 255, 0.15);
        }
        .neon-glow-primary {
          box-shadow: 0 0 15px rgba(233, 179, 255, 0.2);
        }
        .neon-border-primary {
          border: 1px solid #e9b3ff;
          box-shadow: 0 0 10px rgba(233, 179, 255, 0.3);
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e9b3ff; border-radius: 10px; }
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }

        .bg-surface { background-color: #131313; }
        .bg-surface-container { background-color: #201f1f; }
        .bg-surface-container-high { background-color: #2a2a2a; }
        .bg-surface-container-highest { background-color: #353534; }
        .bg-surface-container-low { background-color: #1c1b1b; }
        .bg-surface-container-lowest { background-color: #0e0e0e; }
        .bg-surface-variant { background-color: #353534; }
        .text-on-surface { color: #e5e2e1; }
        .text-on-surface-variant { color: #d2c1d4; }
        .text-primary { color: #e9b3ff; }
        .bg-primary { background-color: #e9b3ff; }
        .text-on-primary { color: #510074; }
        .bg-primary-container { background-color: #c863fb; }
        .text-secondary { color: #ffb2b7; }
        .bg-secondary { background-color: #ffb2b7; }
        .bg-secondary-container { background-color: #d00242; }
        .text-on-secondary { color: #67001c; }
        .text-tertiary { color: #e7c448; }
        .bg-tertiary { background-color: #e7c448; }
        .bg-error { background-color: #ffb4ab; }
        .text-error { color: #ffb4ab; }
        .text-on-error { color: #690005; }
        .border-primary { border-color: #e9b3ff; }
        .border-secondary { border-color: #ffb2b7; }
        .border-white/10 { border-color: rgba(255,255,255,0.1); }
        .border-white/5 { border-color: rgba(255,255,255,0.05); }
        .bg-white/5 { background-color: rgba(255,255,255,0.05); }
        .bg-white/10 { background-color: rgba(255,255,255,0.1); }
        .bg-primary/5 { background-color: rgba(233,179,255,0.05); }
        .bg-primary/10 { background-color: rgba(233,179,255,0.1); }
        .bg-primary/20 { background-color: rgba(233,179,255,0.2); }
        .bg-secondary/10 { background-color: rgba(255,178,183,0.1); }
        .bg-secondary/20 { background-color: rgba(255,178,183,0.2); }
        .bg-tertiary/20 { background-color: rgba(231,196,72,0.2); }
        .bg-error-container/20 { background-color: rgba(147,0,10,0.2); }
        .bg-error-container/5 { background-color: rgba(147,0,10,0.05); }
        .border-error/30 { border-color: rgba(255,180,171,0.3); }
        .bg-surface-container-highest/50 { background-color: rgba(53,53,52,0.5); }
        .shadow-primary/20 { box-shadow: 0 4px 14px rgba(233,179,255,0.2); }
        .shadow-[0_0_8px_#ffb2b7] { box-shadow: 0 0 8px #ffb2b7; }
        .shadow-[0_0_5px_#e9b3ff] { box-shadow: 0 0 5px #e9b3ff; }
        .shadow-[0_0_20px_rgba(233,179,255,0.1)] { box-shadow: 0 0 20px rgba(233,179,255,0.1); }
        .shadow-[0_0_15px_rgba(233,179,255,0.3)] { box-shadow: 0 0 15px rgba(233,179,255,0.3); }
        .shadow-[0_0_8px_rgba(231,196,72,0.6)] { box-shadow: 0 0 8px rgba(231,196,72,0.6); }
        .shadow-[0_0_8px_rgba(233,179,255,0.6)] { box-shadow: 0 0 8px rgba(233,179,255,0.6); }
        .shadow-[0_0_30px_rgba(233,179,255,0.6)] { box-shadow: 0 0 30px rgba(233,179,255,0.6); }
        .shadow-[0_0_20px_rgba(233,179,255,0.4)] { box-shadow: 0 0 20px rgba(233,179,255,0.4); }

        .font-headline-lg { font-family: 'Montserrat', sans-serif; }
        .font-headline-md { font-family: 'Montserrat', sans-serif; }
        .font-body-md { font-family: 'Inter', sans-serif; }
        .font-label-md { font-family: 'Inter', sans-serif; }
        .font-stats-number { font-family: 'Montserrat', sans-serif; }
        .font-display-lg { font-family: 'Montserrat', sans-serif; }

        .text-headline-lg { font-size: 32px; line-height: 40px; letter-spacing: -0.01em; font-weight: 700; }
        .text-headline-md { font-size: 24px; line-height: 32px; font-weight: 600; }
        .text-body-md { font-size: 16px; line-height: 24px; font-weight: 400; }
        .text-label-md { font-size: 14px; line-height: 20px; letter-spacing: 0.05em; font-weight: 600; }
        .text-stats-number { font-size: 36px; line-height: 44px; font-weight: 700; }
        .text-display-lg { font-size: 48px; line-height: 56px; letter-spacing: -0.02em; font-weight: 800; }

        .px-margin-mobile { padding-left: 16px; padding-right: 16px; }
        .px-margin-desktop { padding-left: 48px; padding-right: 48px; }
        .pt-20 { padding-top: 5rem; }
        .pb-xl { padding-bottom: 64px; }
        .gap-gutter { gap: 24px; }
        .gap-base { gap: 8px; }
        .gap-xs { gap: 4px; }
        .gap-sm { gap: 12px; }
        .gap-md { gap: 24px; }
        .gap-lg { gap: 40px; }
        .px-md { padding-left: 24px; padding-right: 24px; }
        .px-sm { padding-left: 12px; padding-right: 12px; }
        .px-xs { padding-left: 4px; padding-right: 4px; }
        .py-sm { padding-top: 12px; padding-bottom: 12px; }
        .py-xs { padding-top: 4px; padding-bottom: 4px; }
        .py-lg { padding-top: 40px; padding-bottom: 40px; }
        .p-md { padding: 24px; }
        .p-sm { padding: 12px; }
        .mt-auto { margin-top: auto; }
        .mb-lg { margin-bottom: 40px; }
        .mb-xs { margin-bottom: 4px; }
        .mb-sm { margin-bottom: 12px; }
        .mt-xs { margin-top: 4px; }
        .mt-sm { margin-top: 12px; }
        .mt-md { margin-top: 24px; }
        .mr-xs { margin-right: 4px; }
        .ml-sm { margin-left: 12px; }
        .ml-md { margin-left: 24px; }
        .ml-2 { margin-left: 8px; }
        .mb-xl { margin-bottom: 64px; }
        .mb-4 { margin-bottom: 16px; }
        .mb-2 { margin-bottom: 8px; }

        .w-64 { width: 16rem; }
        .w-full { width: 100%; }
        .h-full { height: 100%; }
        .h-20 { height: 5rem; }
        .h-10 { height: 2.5rem; }
        .h-8 { height: 2rem; }
        .h-14 { height: 3.5rem; }
        .h-2 { height: 0.5rem; }
        .h-48 { height: 12rem; }
        .h-64 { height: 16rem; }
        .h-1\\.5 { height: 0.375rem; }
        .w-8 { width: 2rem; }
        .w-10 { width: 2.5rem; }
        .w-14 { width: 3.5rem; }
        .w-2 { width: 0.5rem; }
        .w-1\\.5 { width: 0.375rem; }
        .w-48 { width: 12rem; }
        .w-16 { width: 4rem; }
        .max-w-2xl { max-width: 42rem; }
        .max-w-md { max-width: 28rem; }
        .flex-1 { flex: 1; }
        .flex-col { flex-direction: column; }
        .items-center { align-items: center; }
        .items-start { align-items: flex-start; }
        .items-end { align-items: flex-end; }
        .justify-center { justify-content: center; }
        .justify-between { justify-content: space-between; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .text-left { text-align: left; }
        .overflow-hidden { overflow: hidden; }
        .overflow-x-auto { overflow-x: auto; }
        .overflow-y-auto { overflow-y: auto; }
        .border-collapse { border-collapse: collapse; }
        .divide-y > * + * { border-top-width: 1px; }
        .divide-white/5 > * + * { border-color: rgba(255,255,255,0.05); }
        .space-y-xs > * + * { margin-top: 4px; }
        .space-y-sm > * + * { margin-top: 12px; }
        .space-y-md > * + * { margin-top: 24px; }
        .space-y-4 > * + * { margin-top: 16px; }
        .grid { display: grid; }
        .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
        .grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
        .col-span-1 { grid-column: span 1 / span 1; }
        .col-span-2 { grid-column: span 2 / span 2; }
        .col-span-4 { grid-column: span 4 / span 4; }
        .row-span-2 { grid-row: span 2 / span 2; }
        .aspect-square { aspect-ratio: 1 / 1; }
        .bg-black/70 { background-color: rgba(0,0,0,0.7); }
        .backdrop-blur-sm { backdrop-filter: blur(4px); }
        .backdrop-blur-xl { backdrop-filter: blur(16px); }
        .backdrop-blur-2xl { backdrop-filter: blur(40px); }
        .focus\\:border-primary/50:focus { border-color: rgba(233,179,255,0.5); }
        .focus\\:ring-0:focus { outline: none; box-shadow: none; }
        .hover\\:bg-secondary/20:hover { background-color: rgba(255,178,183,0.2); }
        .hover\\:bg-primary/10:hover { background-color: rgba(233,179,255,0.1); }
        .hover\\:bg-white/5:hover { background-color: rgba(255,255,255,0.05); }
        .hover\\:bg-surface-variant:hover { background-color: #353534; }
        .hover\\:text-primary:hover { color: #e9b3ff; }
        .hover\\:text-on-surface:hover { color: #e5e2e1; }
        .hover\\:bg-error/10:hover { background-color: rgba(255,180,171,0.1); }
        .group-hover\\:text-primary:hover .group { color: #e9b3ff; }
        .group-hover\\:scale-110 .group:hover { transform: scale(1.1); }
        .group-hover\\:scale-110:hover .group { transform: scale(1.1); }
        .group-hover\\:opacity-100 .group:hover { opacity: 1; }
        .active\\:translate-x-1:active { transform: translateX(4px); }
        .active\\:scale-95:active { transform: scale(0.95); }
        .active\\:scale-90:active { transform: scale(0.9); }
        .bg-gradient-to-t { background-image: linear-gradient(to top, var(--tw-gradient-stops)); }
        .from-background { --tw-gradient-from: #131313; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(19,19,19,0)); }
        .via-background/40 { --tw-gradient-to: rgba(19,19,19,0.4); }
        .to-transparent { --tw-gradient-to: transparent; }
        .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
        .text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
        .text-8xl { font-size: 6rem; line-height: 1; }
        .text-\\[140px\\] { font-size: 140px; }
        .text-\\[10px\\] { font-size: 10px; }
        .text-\\[12px\\] { font-size: 12px; }
        .text-\\[20px\\] { font-size: 20px; }
        .font-bold { font-weight: 700; }
        .font-semibold { font-weight: 600; }
        .leading-none { line-height: 1; }
        .cursor-pointer { cursor: pointer; }
        .transition-all { transition: all 0.3s ease; }
        .duration-200 { transition-duration: 200ms; }
        .duration-300 { transition-duration: 300ms; }
        .duration-1000 { transition-duration: 1000ms; }
        .duration-700 { transition-duration: 700ms; }
        .hover\\:scale-105:hover { transform: scale(1.05); }
        .hover\\:scale-110:hover { transform: scale(1.1); }
        .hover\\:brightness-110:hover { filter: brightness(1.1); }
        .hidden { display: none; }
        .flex { display: flex; }
        .block { display: block; }
        .table { display: table; }
        .border-none { border-style: none; }
        .outline-none { outline: none; }
        .object-cover { object-fit: cover; }
        .object-contain { object-fit: contain; }
        .truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .min-h-screen { min-height: 100vh; }
        .relative { position: relative; }
        .absolute { position: absolute; }
        .fixed { position: fixed; }
        .sticky { position: sticky; }
        .inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
        .left-0 { left: 0; }
        .top-0 { top: 0; }
        .right-0 { right: 0; }
        .bottom-0 { bottom: 0; }
        .translate-y-0 { transform: translateY(0); }
        .translate-y-24 { transform: translateY(6rem); }
        .-translate-y-1\\/2 { transform: translateY(-50%); }
        .-translate-x-1\\/2 { transform: translateX(-50%); }
        .-right-4 { right: -1rem; }
        .-top-4 { top: -1rem; }
        .-top-8 { top: -2rem; }
        .-right-8 { right: -2rem; }
        .-bottom-8 { bottom: -2rem; }
        .z-10 { z-index: 10; }
        .z-40 { z-index: 40; }
        .z-50 { z-index: 50; }
        .z-\\[60\\] { z-index: 60; }
        .z-\\[100\\] { z-index: 100; }
        .z-\\[200\\] { z-index: 200; }
        .z-\\[-1\\] { z-index: -1; }
        .rounded-l-md { border-radius: 0.375rem 0 0 0.375rem; }
        .rounded-t-lg { border-radius: 0.5rem 0.5rem 0 0; }
        .shadow-\\[0_0_20px_rgba\\(233\\,179\\,255\\,0\\.6\\)\\] { box-shadow: 0 0 20px rgba(233,179,255,0.6); }
        .shadow-\\[0_0_10px_rgba\\(233\\,179\\,255\\,0\\.4\\)\\] { box-shadow: 0 0 10px rgba(233,179,255,0.4); }
        .shadow-\\[0_0_10px_rgba\\(231\\,196\\,72\\,0\\.5\\)\\] { box-shadow: 0 0 10px rgba(231,196,72,0.5); }
        .shadow-\\[0_0_10px_rgba\\(255\\,180\\,171\\,0\\.5\\)\\] { box-shadow: 0 0 10px rgba(255,180,171,0.5); }
        .shadow-\\[0_0_20px_rgba\\(233\\,179\\,255\\,0\\.6\\)\\] { box-shadow: 0 0 20px rgba(233,179,255,0.6); }
        .text-outline { color: #9b8c9e; }
        .text-outline-variant { color: #4f4352; }
        .border-outline-variant { border-color: #4f4352; }
        .bg-surface-container-highest/30 { background-color: rgba(53,53,52,0.3); }
        .bg-primary/30 { background-color: rgba(233,179,255,0.3); }
        .blur-3xl { filter: blur(3rem); }
        .bg-error-container/20 { background-color: rgba(147,0,10,0.2); }
        .border-error/30 { border-color: rgba(255,180,171,0.3); }
        .border-primary/30 { border-color: rgba(233,179,255,0.3); }
        .border-primary/50 { border-color: rgba(233,179,255,0.5); }
        .filter { filter: var(--tw-filter); }
        .max-h-\\[600px\\] { max-height: 600px; }
        .pointer-events-none { pointer-events: none; }
        .whitespace-nowrap { white-space: nowrap; }
        .opacity-30 { opacity: 0.3; }
        .opacity-10 { opacity: 0.1; }
        .opacity-60 { opacity: 0.6; }
        .opacity-80 { opacity: 0.8; }
        .scale-150 { transform: scale(1.5); }
        .rotate-90 { transform: rotate(90deg); }
        .bg-green-500 { background-color: #22c55e; }
        .text-green-500 { color: #22c55e; }
        .text-green-400 { color: #4ade80; }
        .text-yellow-400 { color: #facc15; }
        .bg-yellow-500 { background-color: #eab308; }
        .text-yellow-500 { color: #eab308; }
        .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .border-l-4 { border-left-width: 4px; }
        .border-l-primary { border-left-color: #e9b3ff; }
        .border-l-secondary { border-left-color: #ffb2b7; }
        .border-t-2 { border-top-width: 2px; }
        .border-t-primary { border-top-color: #e9b3ff; }
        .stroke-white/10 { stroke: rgba(255,255,255,0.1); }
        .stroke-primary { stroke: #e9b3ff; }
        .stroke-primary/30 { stroke: rgba(233,179,255,0.3); }
        .fill-none { fill: none; }
        .stroke-linecap-round { stroke-linecap: round; }
        .uppercase { text-transform: uppercase; }
        .tracking-wider { letter-spacing: 0.05em; }
        .tracking-widest { letter-spacing: 0.1em; }
        .tracking-tight { letter-spacing: -0.02em; }
        .tracking-tighter { letter-spacing: -0.05em; }
        .min-w-\\[200px\\] { min-width: 200px; }

        @media (min-width: 640px) {
          .sm\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .sm\\:flex-row { flex-direction: row; }
          .sm\\:items-center { align-items: center; }
          .sm\\:pb-0 { padding-bottom: 0; }
          .sm\\:w-auto { width: auto; }
        }
        @media (min-width: 768px) {
          .md\\:flex { display: flex; }
          .md\\:hidden { display: none; }
          .md\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
          .md\\:col-span-2 { grid-column: span 2 / span 2; }
          .md\\:flex-row { flex-direction: row; }
          .md\\:items-end { align-items: flex-end; }
          .md\\:px-margin-desktop { padding-left: 48px; padding-right: 48px; }
          .md\\:bottom-12 { bottom: 48px; }
          .md\\:right-12 { right: 48px; }
          .md\\:block { display: block; }
          .md\\:p-margin-desktop { padding: 48px; }
        }
        @media (min-width: 1024px) {
          .lg\\:grid-cols-12 { grid-template-columns: repeat(12, minmax(0, 1fr)); }
          .lg\\:col-span-8 { grid-column: span 8 / span 8; }
          .lg\\:col-span-4 { grid-column: span 4 / span 4; }
          .lg\\:flex { display: flex; }
          .lg\\:hidden { display: none; }
        }
      `}</style>

      {/* ===== MAIN CONTENT ===== */}
      <main className="min-h-screen pt-20 px-margin-mobile md:px-margin-desktop pb-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="font-headline-md text-headline-md text-on-surface">Inventario de Productos</h2>
            <p className="text-on-surface-variant text-sm">Gestión de stock y productos disponibles para la venta.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
              <input
                className="bg-surface-container-high border border-white/10 rounded-full pl-10 pr-4 py-2 text-on-surface w-48 focus:border-primary/50 focus:outline-none transition-all"
                placeholder="Buscar producto..."
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={abrirModalCrear}
              className="bg-primary text-on-primary font-bold px-4 py-2 rounded-lg flex items-center gap-2 hover:brightness-110 transition-all active:scale-95 shadow-lg shadow-primary/20"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              <span className="text-label-md">Nuevo Producto</span>
            </button>
          </div>
        </div>

        {/* Buscador móvil */}
        <div className="md:hidden mb-4">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input
              className="bg-surface-container-high border border-white/10 rounded-full pl-10 pr-4 py-2 text-on-surface w-full focus:border-primary/50 focus:outline-none transition-all"
              placeholder="Buscar producto..."
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Quick Actions & Alerts Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-8">
          <div className="glass-card p-md rounded-xl col-span-1 md:col-span-2 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-md">
              <div>
                <h3 className="font-headline-md text-headline-md text-primary">Alertas de Stock Bajo</h3>
                <p className="text-on-surface-variant">{productosBajoStock.length} productos requieren reposición inmediata</p>
              </div>
              <span className="material-symbols-outlined text-error text-3xl">warning</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
              {productosBajoStock.slice(0, 4).map((p) => (
                <div key={p.id} className="bg-error-container/20 border border-error/30 p-sm rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-label-md text-label-md text-on-surface">{p.nombre}</p>
                    <p className="text-xs text-error">{p.stock} unidades restantes</p>
                  </div>
                  <button
                    onClick={() => abrirModalEditar(p)}
                    className="bg-error text-on-error px-3 py-1 rounded text-xs font-bold uppercase tracking-wider hover:brightness-110 transition"
                  >
                    Reabastecer
                  </button>
                </div>
              ))}
              {productosBajoStock.length === 0 && (
                <p className="text-on-surface-variant col-span-2 text-center py-4">¡Todo en stock! No hay alertas.</p>
              )}
            </div>
          </div>

          <div className="glass-card p-md rounded-xl flex flex-col justify-center items-center gap-md">
            <button
              onClick={abrirModalCrear}
              className="w-full py-4 bg-primary text-on-primary font-bold rounded-lg flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(233,179,255,0.4)]"
            >
              <span className="material-symbols-outlined">add_circle</span>
              <span>AÑADIR PRODUCTO</span>
            </button>
            <button
              onClick={abrirModalProveedor}
              className="w-full py-4 border border-primary text-primary font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-primary/10 transition-all"
            >
              <span className="material-symbols-outlined">local_shipping</span>
              <span>ÓRDENES PROVEEDOR</span>
            </button>
          </div>
        </div>

        {/* Main Inventory Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          <div className="lg:col-span-8 glass-card rounded-xl overflow-hidden flex flex-col">
            <div className="p-md border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md">
              <div className="flex gap-4 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto custom-scrollbar">
                {categoriasUnicas.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoriaFiltro(cat)}
                    className={`px-4 py-2 rounded-full font-label-md text-label-md whitespace-nowrap transition ${
                      categoriaFiltro === cat
                        ? "bg-primary/20 text-primary border border-primary/30"
                        : "text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <span className="text-on-surface-variant font-label-md text-label-md">{totalItems} Items Totales</span>
            </div>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-md py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Producto</th>
                    <th className="px-md py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Categoría</th>
                    <th className="px-md py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-center">Nivel Stock</th>
                    <th className="px-md py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Precio</th>
                    <th className="px-md py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    <tr><td colSpan="5" className="text-center py-4 text-on-surface-variant">Cargando...</td></tr>
                  ) : productosFiltrados.length === 0 ? (
                    <tr><td colSpan="5" className="text-center py-4 text-on-surface-variant">No hay productos</td></tr>
                  ) : (
                    productosFiltrados.map((p) => {
                      const porcentaje = p.stockTotal > 0 ? Math.round((p.stock / p.stockTotal) * 100) : 0;
                      const esBajo = porcentaje < 30;
                      return (
                        <tr key={p.id} className={`hover:bg-white/5 transition-colors ${esBajo ? "bg-error-container/5" : ""}`}>
                          <td className="px-md py-4 flex items-center gap-3">
                            <div className="w-10 h-10 bg-surface-container rounded-lg border border-white/10 flex items-center justify-center">
                              <span className={`material-symbols-outlined ${esBajo ? "text-error" : "text-primary"}`}>
                                {p.categoria?.toLowerCase().includes("licor") ? "liquor" :
                                 p.categoria?.toLowerCase().includes("cóctel") ? "local_bar" :
                                 p.categoria?.toLowerCase().includes("refresco") ? "water_drop" :
                                 p.categoria?.toLowerCase().includes("snack") ? "fastfood" : "inventory_2"}
                              </span>
                            </div>
                            <span className="font-label-md text-label-md">{p.nombre}</span>
                          </td>
                          <td className="px-md py-4 text-on-surface-variant">{p.categoria || "—"}</td>
                          <td className="px-md py-4 min-w-[200px]">
                            <div className="w-full flex items-center gap-3">
                              <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div className={`h-full ${esBajo ? "bg-error" : "bg-primary"}`} style={{ width: `${Math.min(porcentaje, 100)}%` }}></div>
                              </div>
                              <span className={`text-xs font-bold ${esBajo ? "text-error" : "text-on-surface"}`}>
                                {p.stock}/{p.stockTotal}
                              </span>
                            </div>
                          </td>
                          <td className="px-md py-4 font-stats-number text-on-surface text-sm">${p.precio?.toFixed(2) || "0.00"}</td>
                          <td className="px-md py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => abrirModalEditar(p)}
                                className="text-primary hover:underline text-xs"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => handleDelete(p.id)}
                                className="text-error hover:underline text-xs"
                              >
                                Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-md flex justify-between items-center border-t border-white/5">
              <button className="text-on-surface-variant hover:text-primary flex items-center gap-1 transition-colors">
                <span className="material-symbols-outlined">chevron_left</span> Anterior
              </button>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-primary text-on-primary rounded font-bold">1</span>
                <span className="px-3 py-1 text-on-surface-variant hover:bg-white/5 rounded cursor-pointer">2</span>
                <span className="px-3 py-1 text-on-surface-variant hover:bg-white/5 rounded cursor-pointer">3</span>
              </div>
              <button className="text-on-surface-variant hover:text-primary flex items-center gap-1 transition-colors">
                Siguiente <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-gutter">
            <div className="glass-card rounded-xl p-md overflow-hidden relative">
              <div className="relative z-10">
                <h4 className="font-headline-md text-headline-md text-on-surface mb-md flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">schedule</span>
                  Pedidos en Curso
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-tertiary shadow-[0_0_8px_rgba(231,196,72,0.6)] animate-pulse"></div>
                    <div className="flex-1">
                      <p className="font-label-md text-label-md text-on-surface">Distribuidora Premium BCN</p>
                      <p className="text-xs text-on-surface-variant italic">Llegada estimada: Hoy, 18:00</p>
                    </div>
                    <span className="text-xs font-bold text-tertiary">PENDIENTE</span>
                  </div>
                  <div className="flex items-center gap-4 opacity-70">
                    <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(233,179,255,0.6)]"></div>
                    <div className="flex-1">
                      <p className="font-label-md text-label-md text-on-surface">Bebidas Global S.L.</p>
                      <p className="text-xs text-on-surface-variant italic">Completado ayer</p>
                    </div>
                    <span className="text-xs font-bold text-primary">RECIBIDO</span>
                  </div>
                </div>
                <button className="mt-lg w-full py-3 border border-white/10 rounded-lg text-label-md text-on-surface-variant hover:bg-white/5 hover:text-on-surface transition-all">
                  Ver historial de órdenes
                </button>
              </div>
            </div>

            <div className="glass-card rounded-xl p-md text-center">
              <h4 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest mb-md">Rotación de Stock Semanal</h4>
              <div className="relative w-48 h-48 mx-auto flex items-center justify-center mb-md">
                <svg className="w-full h-full transform -rotate-90">
                  <circle className="stroke-white/10 fill-none" cx="50%" cy="50%" r="70" strokeWidth="12"></circle>
                  <circle
                    className="stroke-primary fill-none"
                    cx="50%" cy="50%" r="70"
                    strokeDasharray="440"
                    strokeDashoffset={440 - (440 * (stockPromedio / 100))}
                    strokeLinecap="round"
                    strokeWidth="12"
                  ></circle>
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="font-stats-number text-stats-number text-on-surface">{stockPromedio}%</span>
                  <span className="text-xs text-on-surface-variant font-bold">ALTO</span>
                </div>
              </div>
              <p className="text-body-md text-on-surface-variant px-4">
                La rotación es un 12% superior a la semana pasada debido al evento VIP del viernes.
              </p>
            </div>

            <div className="h-64 rounded-xl overflow-hidden relative group">
              <div className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-700" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCLL_wpe6AuOtFX-XOH_Y8F7XB0F4_oXvTJkGflmu62higEwR3zpbCJWiUu2eJS_Jhpt6tUJWP1EeK5u7Gissdos1Hvc6MsrEslzZ9XzuIMk5WOXdMHyVDj-_XMfje4nb-zdvYjMvV7G_aShiRB--pI76xaRVFUNcit-0IZ-Mo8DkjX-H3J2QWbltrHoO3aE4sfUSpX2P01vIJZzYCcaJ5cOpF53dIMwbFne3GLgao2e_YCkdXjLcH1oGtvrKAqNUa0l5WSoDly-2Rr')" }}></div>
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4">
                <span className="text-xs font-bold text-primary uppercase tracking-widest">Novedad</span>
                <h5 className="font-headline-md text-headline-md leading-tight text-on-surface">Colección Gin Premium Japonesa</h5>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ===== FAB ===== */}
      <div className="fixed bottom-24 right-6 md:bottom-12 md:right-12 z-40">
        <button
          onClick={abrirModalCrear}
          className="w-16 h-16 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(233,179,255,0.6)] hover:scale-110 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-4xl">add</span>
        </button>
      </div>

      {/* ===== TOAST ===== */}
      {toast.visible && (
        <div className={`fixed bottom-24 right-8 glass-card rounded-xl px-md py-sm flex items-center gap-sm transition-all duration-300 z-[100] border ${toast.tipo === "error" ? "border-error/30" : "border-primary/30"}`}>
          <span className="material-symbols-outlined text-primary">info</span>
          <div>
            <p className="text-on-surface font-bold text-sm">{toast.mensaje}</p>
          </div>
        </div>
      )}

      {/* ===== MODAL DE PRODUCTO (con scroll) ===== */}
      {modalAbierto && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass-card rounded-2xl p-6 w-full max-w-md max-h-[90vh] flex flex-col relative border border-white/20 shadow-2xl">
            <button
              onClick={cerrarModal}
              className="absolute top-3 right-3 text-on-surface-variant hover:text-primary transition-colors z-10"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <h3 className="font-headline-md text-headline-md text-on-surface mb-4 flex-shrink-0">
              {modoEdicion ? "Editar Producto" : "Nuevo Producto"}
            </h3>
            <div className="overflow-y-auto flex-1 pr-2 custom-scrollbar">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-label-md text-on-surface-variant mb-1">Nombre *</label>
                  <input
                    type="text"
                    name="nombre"
                    value={productoActual.nombre || ""}
                    onChange={handleChange}
                    className="w-full bg-surface-container-high rounded-lg border border-white/10 px-3 py-2 text-on-surface focus:border-primary/50 focus:outline-none"
                    required
                    placeholder="ej. Whisky Jack Daniel's"
                  />
                </div>
                <div>
                  <label className="block text-xs font-label-md text-on-surface-variant mb-1">Categoría *</label>
                  <select
                    name="categoria"
                    value={productoActual.categoria || ""}
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
                    value={productoActual.stock || 0}
                    onChange={handleChange}
                    className="w-full bg-surface-container-high rounded-lg border border-white/10 px-3 py-2 text-on-surface focus:border-primary/50 focus:outline-none"
                    min="0"
                    step="1"
                  />
                  <p className="text-[10px] text-on-surface-variant mt-1">Debe ser un número entero</p>
                </div>
                <div>
                  <label className="block text-xs font-label-md text-on-surface-variant mb-1">Capacidad Total *</label>
                  <input
                    type="number"
                    name="stockTotal"
                    value={productoActual.stockTotal || 10}
                    onChange={handleChange}
                    className="w-full bg-surface-container-high rounded-lg border border-white/10 px-3 py-2 text-on-surface focus:border-primary/50 focus:outline-none"
                    min="1"
                    step="1"
                    required
                  />
                  <p className="text-[10px] text-on-surface-variant mt-1">Debe ser mayor a 0</p>
                </div>
                <div>
                  <label className="block text-xs font-label-md text-on-surface-variant mb-1">Precio ($) *</label>
                  <input
                    type="number"
                    name="precio"
                    value={productoActual.precio || 0}
                    onChange={handleChange}
                    className="w-full bg-surface-container-high rounded-lg border border-white/10 px-3 py-2 text-on-surface focus:border-primary/50 focus:outline-none"
                    min="0"
                    step="0.01"
                    required
                  />
                  <p className="text-[10px] text-on-surface-variant mt-1">No puede ser negativo</p>
                </div>
                <div>
                  <label className="block text-xs font-label-md text-on-surface-variant mb-1">Imagen (URL)</label>
                  <input
                    type="text"
                    name="imagen"
                    value={productoActual.imagen || ""}
                    onChange={handleChange}
                    className="w-full bg-surface-container-high rounded-lg border border-white/10 px-3 py-2 text-on-surface focus:border-primary/50 focus:outline-none"
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-label-md text-on-surface-variant mb-1">Descripción</label>
                  <textarea
                    name="descripcion"
                    value={productoActual.descripcion || ""}
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
                    {modoEdicion ? "Actualizar" : "Guardar"}
                  </button>
                  <button
                    type="button"
                    onClick={cerrarModal}
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

      {/* ===== MODAL DE PROVEEDORES ===== */}
      {modalProveedorAbierto && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass-card rounded-2xl p-6 w-full max-w-md relative border border-white/20 shadow-2xl">
            <button
              onClick={cerrarModalProveedor}
              className="absolute top-3 right-3 text-on-surface-variant hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <h3 className="font-headline-md text-headline-md text-on-surface mb-4">Enviar Mensaje a Proveedores</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-label-md text-on-surface-variant mb-1">Mensaje</label>
                <textarea
                  value={mensajeProveedor}
                  onChange={(e) => setMensajeProveedor(e.target.value)}
                  className="w-full bg-surface-container-high rounded-lg border border-white/10 px-3 py-2 text-on-surface focus:border-primary/50 focus:outline-none resize-none"
                  rows="4"
                  placeholder="Escribe tu mensaje para los proveedores..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={enviarMensajeProveedor}
                  className="flex-1 bg-primary text-on-primary py-2 rounded-xl font-label-md hover:brightness-110 transition-all active:scale-95"
                >
                  Enviar Mensaje
                </button>
                <button
                  type="button"
                  onClick={cerrarModalProveedor}
                  className="flex-1 bg-surface-container-high border border-white/10 text-on-surface-variant py-2 rounded-xl font-label-md hover:bg-white/5 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminProductos;