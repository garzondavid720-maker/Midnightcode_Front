import React, { useState, useEffect } from "react";
import NavbarUsuario from "../../../components/Layout/NavbarUsuario";

// Clave para productos y carrito en localStorage
const PRODUCTOS_KEY = "afterdark_productos";
const CARRITO_KEY = "afterdark_carrito";

const UserMenu = () => {
  // ===== ESTADOS =====
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [categoriaActiva, setCategoriaActiva] = useState("Todos");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ visible: false, mensaje: "", tipo: "" });
  const [carritoAbierto, setCarritoAbierto] = useState(false);

  // ===== CARGAR DATOS =====
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = () => {
    setLoading(true);
    try {
      // Cargar productos
      const storedProductos = localStorage.getItem(PRODUCTOS_KEY);
      if (storedProductos) {
        const productosData = JSON.parse(storedProductos);
        // Solo mostrar productos con stock > 0
        const disponibles = productosData.filter(p => (p.stock || 0) > 0);
        setProductos(disponibles);
      } else {
        setProductos([]);
      }

      // Cargar carrito
      const storedCarrito = localStorage.getItem(CARRITO_KEY);
      if (storedCarrito) {
        setCarrito(JSON.parse(storedCarrito));
      } else {
        setCarrito([]);
      }
    } catch (err) {
      setProductos([]);
      setCarrito([]);
    } finally {
      setLoading(false);
    }
  };

  // ===== PERSISTIR CARRITO =====
  useEffect(() => {
    localStorage.setItem(CARRITO_KEY, JSON.stringify(carrito));
  }, [carrito]);

  // ===== TOAST =====
  const mostrarToast = (mensaje, tipo = "success") => {
    setToast({ visible: true, mensaje, tipo });
    setTimeout(() => setToast({ visible: false, mensaje: "", tipo: "" }), 3000);
  };

  // ===== MANEJAR CARRITO =====
  const agregarAlCarrito = (producto) => {
    setCarrito((prev) => {
      const existente = prev.find((item) => item.id === producto.id);
      if (existente) {
        // Si ya existe, aumentar cantidad
        return prev.map((item) =>
          item.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      } else {
        return [...prev, { ...producto, cantidad: 1 }];
      }
    });
    mostrarToast(`"${producto.nombre}" añadido al carrito`, "success");
  };

  const eliminarDelCarrito = (id) => {
    setCarrito((prev) => prev.filter((item) => item.id !== id));
    mostrarToast("Item eliminado del carrito", "info");
  };

  const actualizarCantidad = (id, nuevaCantidad) => {
    if (nuevaCantidad < 1) {
      eliminarDelCarrito(id);
      return;
    }
    setCarrito((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, cantidad: nuevaCantidad } : item
      )
    );
  };

  const vaciarCarrito = () => {
    setCarrito([]);
    localStorage.removeItem(CARRITO_KEY);
    mostrarToast("Carrito vaciado", "info");
  };

  const procesarPedido = () => {
    if (carrito.length === 0) {
      mostrarToast("El carrito está vacío", "error");
      return;
    }
    // Simular envío de pedido
    setTimeout(() => {
      mostrarToast("¡Pedido enviado con éxito! Tu camarero te servirá en breve.", "success");
      setCarrito([]);
      localStorage.removeItem(CARRITO_KEY);
      setCarritoAbierto(false);
    }, 800);
  };

  // ===== CALCULAR TOTAL =====
  const totalCarrito = carrito.reduce(
    (acc, item) => acc + item.precio * item.cantidad,
    0
  );
  const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);

  // ===== FILTROS =====
  const categorias = ["Todos", ...new Set(productos.map((p) => p.categoria).filter(Boolean))];
  const productosFiltrados =
    categoriaActiva === "Todos"
      ? productos
      : productos.filter((p) => p.categoria === categoriaActiva);

  // ===== TOGGLE CARRITO =====
  const toggleCarrito = () => {
    setCarritoAbierto(!carritoAbierto);
    if (!carritoAbierto) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  };

  // Limpiar overflow al desmontar
  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // ===== RENDER =====
  return (
    <>
      <NavbarUsuario />
      <main className="md:ml-64 pt-24 pb-20 px-margin-mobile md:px-margin-desktop min-h-screen">
        {/* Header */}
        <header className="py-lg">
          <h1 className="font-display-lg text-display-lg text-primary mb-2">Carta Premium</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
            Explora nuestra exclusiva selección de destilados, cócteles de autor diseñados por expertos y bocados gourmet para elevar tu noche.
          </p>
        </header>

        {/* Category Filter (Sticky) */}
        <div className="sticky top-[72px] z-40 bg-background/80 backdrop-blur-md px-margin-mobile md:px-margin-desktop py-4 mb-8 overflow-x-auto hide-scrollbar border-b border-white/5 -mx-margin-mobile md:-mx-margin-desktop px-margin-mobile md:px-margin-desktop">
          <div className="flex gap-4 min-w-max">
            {categorias.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoriaActiva(cat)}
                className={`px-6 py-2 rounded-full font-label-md text-label-md transition-all ${
                  categoriaActiva === cat
                    ? "bg-primary text-on-primary shadow-[0_0_15px_rgba(233,179,255,0.4)]"
                    : "glass-card hover:bg-white/10"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Grid */}
        {loading ? (
          <div className="text-center text-on-surface-variant py-12">Cargando productos...</div>
        ) : productosFiltrados.length === 0 ? (
          <div className="text-center text-on-surface-variant py-12">No hay productos disponibles</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
            {productosFiltrados.map((producto) => (
              <div key={producto.id} className="glass-card rounded-xl overflow-hidden group">
                <div className="h-64 relative overflow-hidden">
                  <img
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    src={
                      producto.imagen ||
                      "https://lh3.googleusercontent.com/aida-public/AB6AXuAf9MRRIPOBB5ydXihfPFFDXl8nt52sKl3t6_u2yhybtPHfhEIQmQUl-vkIZ_j2t5_U7Cs0oOCCPk_ejWtbNUO-QCs_sICG4S6dCSe8tSzgF7mojKlQF4CBx_O3vJftiO4B_bfaVjLNTxGls7ubJZrvpO9bts5WpvBUziWNQeIcSos-Ml9Y7egHmH5bLZNg0F0EIVShGlhDCwdsFonrbyz11GnsocV6rdlBs9m24A-X5kcZxiiHplltmbM2hIZVcaRqAfpu5pemC97r"
                    }
                    alt={producto.nombre}
                  />
                  {producto.categoria && (
                    <div className="absolute top-4 left-4 bg-primary/20 backdrop-blur-md border border-primary/30 px-3 py-1 rounded-full">
                      <span className="text-primary font-label-md text-label-md">{producto.categoria}</span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-headline-md text-headline-md text-on-surface">{producto.nombre}</h3>
                    <span className="font-stats-number text-primary text-xl">${producto.precio?.toFixed(2)}</span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant mb-6">
                    {producto.descripcion || "Descripción no disponible"}
                  </p>
                  <button
                    onClick={() => agregarAlCarrito(producto)}
                    className="w-full bg-primary text-on-primary py-3 rounded-lg font-label-md text-label-md flex items-center justify-center gap-2 active:scale-95 transition-transform neon-glow-primary"
                  >
                    <span className="material-symbols-outlined text-lg">add_shopping_cart</span>
                    Añadir al Carrito
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ===== BOTÓN CARRITO FLOTANTE (FAB) ===== */}
      <button
        onClick={toggleCarrito}
        className="fixed bottom-24 right-6 md:bottom-10 md:right-10 z-50 w-16 h-16 bg-primary text-on-primary rounded-full shadow-[0_0_30px_rgba(233,179,255,0.6)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all group"
      >
        <span className="material-symbols-outlined text-3xl">shopping_cart</span>
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 bg-secondary text-on-secondary text-[10px] font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(255,178,183,0.6)]">
            {totalItems}
          </span>
        )}
        <span className="absolute right-20 bg-surface-container border border-white/10 px-4 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Ver carrito
        </span>
      </button>

      {/* ===== OVERLAY CARRITO ===== */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-opacity duration-300 ${
          carritoAbierto ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={toggleCarrito}
      ></div>

      {/* ===== CARRITO LATERAL ===== */}
      <aside
        className={`cart-sidebar fixed right-0 top-0 h-full w-full max-w-md bg-surface-container-highest/90 backdrop-blur-2xl z-[70] shadow-2xl flex flex-col transition-transform duration-400 ${
          carritoAbierto ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h2 className="font-headline-lg text-headline-lg text-primary flex items-center gap-3">
            <span className="material-symbols-outlined text-3xl">shopping_bag</span>
            Tu Carrito
          </h2>
          <button className="p-2 rounded-full hover:bg-white/10 transition-colors" onClick={toggleCarrito}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-6 space-y-4 hide-scrollbar" id="cart-items">
          {carrito.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
              <span className="material-symbols-outlined text-6xl mb-4">shopping_cart_off</span>
              <p className="font-body-lg">Tu carrito está vacío</p>
              <p className="text-sm">Empieza a añadir experiencias a tu noche.</p>
            </div>
          ) : (
            carrito.map((item) => (
              <div key={item.id} className="glass-card p-4 rounded-lg flex justify-between items-center">
                <div className="flex-1 min-w-0">
                  <h4 className="font-label-md text-on-surface truncate">{item.nombre}</h4>
                  <p className="text-primary font-stats-number text-sm">
                    ${item.precio.toFixed(2)} x {item.cantidad}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}
                      className="text-on-surface-variant hover:text-primary w-6 h-6 rounded-full flex items-center justify-center border border-white/10"
                    >
                      <span className="material-symbols-outlined text-sm">remove</span>
                    </button>
                    <span className="text-sm text-on-surface-variant">{item.cantidad}</span>
                    <button
                      onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}
                      className="text-on-surface-variant hover:text-primary w-6 h-6 rounded-full flex items-center justify-center border border-white/10"
                    >
                      <span className="material-symbols-outlined text-sm">add</span>
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => eliminarDelCarrito(item.id)}
                  className="text-error hover:bg-error/10 p-2 rounded-full transition-colors"
                >
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-6 border-t border-white/10 bg-surface-container-highest">
          <div className="flex justify-between items-center mb-6">
            <span className="font-label-md text-label-md uppercase tracking-widest text-on-surface-variant">Total Estimado</span>
            <span className="font-stats-number text-primary">${totalCarrito.toFixed(2)}</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={procesarPedido}
              className="flex-1 bg-primary text-on-primary py-4 rounded-xl font-headline-md text-headline-md shadow-[0_0_20px_rgba(233,179,255,0.4)] hover:brightness-110 active:scale-95 transition-all"
            >
              Realizar Pedido
            </button>
            <button
              onClick={vaciarCarrito}
              className="px-4 py-4 border border-white/10 text-on-surface-variant rounded-xl hover:bg-white/5 transition-all"
            >
              <span className="material-symbols-outlined">delete_sweep</span>
            </button>
          </div>
          <p className="text-center text-xs text-on-surface-variant mt-4">
            Los impuestos y el servicio se añadirán al cerrar la cuenta final.
          </p>
        </div>
      </aside>

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

      {/* ===== ESTILOS DE RESPALDO (exactos al HTML de "Carta Premium") ===== */}
      <style jsx>{`
        /* Fondo negro global */
        body,
        html {
          background-color: #050505 !important;
          margin: 0;
          padding: 0;
        }

        .pt-24 {
          padding-top: 6rem;
        }
        .md\\:ml-64 {
          margin-left: 16rem;
        }
        .pb-20 {
          padding-bottom: 5rem;
        }
        .min-h-screen {
          min-height: 100vh;
        }
        .px-margin-mobile {
          padding-left: 16px;
          padding-right: 16px;
        }
        .md\\:px-margin-desktop {
          padding-left: 48px;
          padding-right: 48px;
        }
        .-mx-margin-mobile {
          margin-left: -16px;
          margin-right: -16px;
        }
        .md\\:-mx-margin-desktop {
          margin-left: -48px;
          margin-right: -48px;
        }

        .font-display-lg {
          font-family: Montserrat, sans-serif;
          font-size: 48px;
          line-height: 56px;
          letter-spacing: -0.02em;
          font-weight: 800;
        }
        .text-display-lg {
          font-size: 48px;
          line-height: 56px;
          letter-spacing: -0.02em;
          font-weight: 800;
        }
        .font-body-lg {
          font-family: Inter, sans-serif;
          font-size: 18px;
          line-height: 28px;
          font-weight: 400;
        }
        .text-body-lg {
          font-size: 18px;
          line-height: 28px;
          font-weight: 400;
        }
        .font-label-md {
          font-family: Inter, sans-serif;
          font-size: 14px;
          line-height: 20px;
          letter-spacing: 0.05em;
          font-weight: 600;
        }
        .text-label-md {
          font-size: 14px;
          line-height: 20px;
          letter-spacing: 0.05em;
          font-weight: 600;
        }
        .font-headline-lg {
          font-family: Montserrat, sans-serif;
          font-size: 32px;
          line-height: 40px;
          letter-spacing: -0.01em;
          font-weight: 700;
        }
        .text-headline-lg {
          font-size: 32px;
          line-height: 40px;
          letter-spacing: -0.01em;
          font-weight: 700;
        }
        .font-headline-md {
          font-family: Montserrat, sans-serif;
          font-size: 24px;
          line-height: 32px;
          font-weight: 600;
        }
        .text-headline-md {
          font-size: 24px;
          line-height: 32px;
          font-weight: 600;
        }
        .font-stats-number {
          font-family: Montserrat, sans-serif;
          font-size: 36px;
          line-height: 44px;
          font-weight: 700;
        }

        .text-primary {
          color: #e9b3ff;
        }
        .text-on-surface {
          color: #e5e2e1;
        }
        .text-on-surface-variant {
          color: #d2c1d4;
        }
        .text-secondary {
          color: #ffb2b7;
        }
        .text-error {
          color: #ffb4ab;
        }
        .text-on-primary {
          color: #510074;
        }
        .text-on-secondary {
          color: #67001c;
        }
        .bg-primary {
          background-color: #e9b3ff;
        }
        .bg-primary\\/20 {
          background-color: rgba(233, 179, 255, 0.2);
        }
        .bg-secondary {
          background-color: #ffb2b7;
        }
        .bg-surface-container {
          background-color: #201f1f;
        }
        .bg-surface-container-highest {
          background-color: #353534;
        }
        .bg-surface-container-highest\\/90 {
          background-color: rgba(53, 53, 52, 0.9);
        }
        .bg-background {
          background-color: #131313;
        }
        .bg-background\\/80 {
          background-color: rgba(19, 19, 19, 0.8);
        }
        .bg-black\\/60 {
          background-color: rgba(0, 0, 0, 0.6);
        }
        .border-white\\/10 {
          border-color: rgba(255, 255, 255, 0.1);
        }
        .border-white\\/5 {
          border-color: rgba(255, 255, 255, 0.05);
        }
        .border-primary {
          border-color: #e9b3ff;
        }
        .border-primary\\/30 {
          border-color: rgba(233, 179, 255, 0.3);
        }
        .border-error\\/30 {
          border-color: rgba(255, 180, 171, 0.3);
        }

        .glass-card {
          background: rgba(28, 28, 30, 0.7);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .glass-card:hover {
          border-color: rgba(233, 179, 255, 0.5);
          box-shadow: 0 0 20px rgba(233, 179, 255, 0.15);
        }

        .neon-glow-primary {
          box-shadow: 0 0 12px rgba(233, 179, 255, 0.3);
        }
        .shadow-\\[0_0_15px_rgba\\(233\\,179\\,255\\,0\\.4\\)\\] {
          box-shadow: 0 0 15px rgba(233, 179, 255, 0.4);
        }
        .shadow-\\[0_0_30px_rgba\\(233\\,179\\,255\\,0\\.6\\)\\] {
          box-shadow: 0 0 30px rgba(233, 179, 255, 0.6);
        }
        .shadow-\\[0_0_20px_rgba\\(233\\,179\\,255\\,0\\.4\\)\\] {
          box-shadow: 0 0 20px rgba(233, 179, 255, 0.4);
        }
        .shadow-\\[0_0_10px_rgba\\(255\\,178\\,183\\,0\\.6\\)\\] {
          box-shadow: 0 0 10px rgba(255, 178, 183, 0.6);
        }

        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .cart-sidebar {
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .translate-x-0 {
          transform: translateX(0);
        }
        .translate-x-full {
          transform: translateX(100%);
        }

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

        .gap-gutter {
          gap: 24px;
        }
        .max-w-2xl {
          max-width: 42rem;
        }
        .mx-auto {
          margin-left: auto;
          margin-right: auto;
        }
        .grid {
          display: grid;
        }
        .grid-cols-1 {
          grid-template-columns: repeat(1, minmax(0, 1fr));
        }
        .md\\:grid-cols-2 {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .lg\\:grid-cols-3 {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
        .gap-4 {
          gap: 1rem;
        }
        .gap-2 {
          gap: 0.5rem;
        }
        .gap-3 {
          gap: 0.75rem;
        }
        .w-full {
          width: 100%;
        }
        .h-full {
          height: 100%;
        }
        .h-64 {
          height: 16rem;
        }
        .w-6 {
          width: 1.5rem;
        }
        .h-6 {
          height: 1.5rem;
        }
        .w-16 {
          width: 4rem;
        }
        .h-16 {
          height: 4rem;
        }
        .flex {
          display: flex;
        }
        .flex-col {
          flex-direction: column;
        }
        .items-center {
          align-items: center;
        }
        .justify-between {
          justify-content: space-between;
        }
        .text-center {
          text-align: center;
        }
        .text-sm {
          font-size: 0.875rem;
          line-height: 1.25rem;
        }
        .text-xs {
          font-size: 0.75rem;
          line-height: 1rem;
        }
        .text-3xl {
          font-size: 1.875rem;
          line-height: 2.25rem;
        }
        .text-6xl {
          font-size: 3.75rem;
          line-height: 1;
        }
        .text-lg {
          font-size: 1.125rem;
          line-height: 1.75rem;
        }
        .uppercase {
          text-transform: uppercase;
        }
        .tracking-widest {
          letter-spacing: 0.1em;
        }
        .font-bold {
          font-weight: 700;
        }
        .relative {
          position: relative;
        }
        .absolute {
          position: absolute;
        }
        .fixed {
          position: fixed;
        }
        .sticky {
          position: sticky;
        }
        .inset-0 {
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
        }
        .top-0 {
          top: 0;
        }
        .right-0 {
          right: 0;
        }
        .bottom-0 {
          bottom: 0;
        }
        .right-6 {
          right: 1.5rem;
        }
        .bottom-24 {
          bottom: 6rem;
        }
        .-top-1 {
          top: -0.25rem;
        }
        .-right-1 {
          right: -0.25rem;
        }
        .right-20 {
          right: 5rem;
        }
        .overflow-hidden {
          overflow: hidden;
        }
        .overflow-y-auto {
          overflow-y: auto;
        }
        .object-cover {
          object-fit: cover;
        }
        .p-6 {
          padding: 1.5rem;
        }
        .p-4 {
          padding: 1rem;
        }
        .p-2 {
          padding: 0.5rem;
        }
        .px-6 {
          padding-left: 1.5rem;
          padding-right: 1.5rem;
        }
        .px-4 {
          padding-left: 1rem;
          padding-right: 1rem;
        }
        .px-3 {
          padding-left: 0.75rem;
          padding-right: 0.75rem;
        }
        .py-3 {
          padding-top: 0.75rem;
          padding-bottom: 0.75rem;
        }
        .py-4 {
          padding-top: 1rem;
          padding-bottom: 1rem;
        }
        .py-2 {
          padding-top: 0.5rem;
          padding-bottom: 0.5rem;
        }
        .py-1 {
          padding-top: 0.25rem;
          padding-bottom: 0.25rem;
        }
        .py-lg {
          padding-top: 40px;
          padding-bottom: 40px;
        }
        .mb-2 {
          margin-bottom: 0.5rem;
        }
        .mb-6 {
          margin-bottom: 1.5rem;
        }
        .mb-8 {
          margin-bottom: 2rem;
        }
        .mb-4 {
          margin-bottom: 1rem;
        }
        .mt-1 {
          margin-top: 0.25rem;
        }
        .mt-4 {
          margin-top: 1rem;
        }
        .pt-2 {
          padding-top: 0.5rem;
        }
        .min-w-max {
          min-width: max-content;
        }
        .opacity-0 {
          opacity: 0;
        }
        .opacity-100 {
          opacity: 1;
        }
        .pointer-events-none {
          pointer-events: none;
        }
        .whitespace-nowrap {
          white-space: nowrap;
        }
        .transition-all {
          transition: all 0.3s ease;
        }
        .transition-transform {
          transition-property: transform;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          transition-duration: 150ms;
        }
        .duration-300 {
          transition-duration: 300ms;
        }
        .duration-400 {
          transition-duration: 400ms;
        }
        .duration-500 {
          transition-duration: 500ms;
        }
        .hover\\:scale-110:hover {
          transform: scale(1.1);
        }
        .group-hover\\:scale-110:hover .group {
          transform: scale(1.1);
        }
        .group-hover\\:scale-110 .group:hover {
          transform: scale(1.1);
        }
        .hover\\:bg-white\\/10:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }
        .hover\\:bg-white\\/5:hover {
          background-color: rgba(255, 255, 255, 0.05);
        }
        .hover\\:bg-primary\\/10:hover {
          background-color: rgba(233, 179, 255, 0.1);
        }
        .hover\\:bg-error\\/10:hover {
          background-color: rgba(255, 180, 171, 0.1);
        }
        .hover\\:brightness-110:hover {
          filter: brightness(1.1);
        }
        .active\\:scale-95:active {
          transform: scale(0.95);
        }
        .group-hover\\:opacity-100 .group:hover {
          opacity: 1;
        }
        .rounded-full {
          border-radius: 9999px;
        }
        .rounded-xl {
          border-radius: 0.75rem;
        }
        .rounded-lg {
          border-radius: 0.5rem;
        }
        .backdrop-blur-md {
          backdrop-filter: blur(12px);
        }
        .backdrop-blur-sm {
          backdrop-filter: blur(4px);
        }
        .backdrop-blur-2xl {
          backdrop-filter: blur(40px);
        }
        .bg-gradient-to-t {
          background-image: linear-gradient(to top, var(--tw-gradient-stops));
        }
        .from-background {
          --tw-gradient-from: #131313;
          --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(19, 19, 19, 0));
        }
        .via-background\\/40 {
          --tw-gradient-to: rgba(19, 19, 19, 0.4);
        }
        .to-transparent {
          --tw-gradient-to: transparent;
        }
        .z-40 {
          z-index: 40;
        }
        .z-50 {
          z-index: 50;
        }
        .z-\\[60\\] {
          z-index: 60;
        }
        .z-\\[70\\] {
          z-index: 70;
        }
        .z-\\[100\\] {
          z-index: 100;
        }
        .max-w-md {
          max-width: 28rem;
        }
        .flex-1 {
          flex: 1;
        }
        .min-w-0 {
          min-width: 0;
        }
        .truncate {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .bg-surface-container-highest {
          background-color: #353534;
        }
        .bg-surface-container {
          background-color: #201f1f;
        }
        .border-t {
          border-top-width: 1px;
        }
        .border-b {
          border-bottom-width: 1px;
        }
        .border-r {
          border-right-width: 1px;
        }
        .border-l {
          border-left-width: 1px;
        }
        .border {
          border-width: 1px;
        }
        .border-white\\/10 {
          border-color: rgba(255, 255, 255, 0.1);
        }
        .border-white\\/5 {
          border-color: rgba(255, 255, 255, 0.05);
        }
        .border-primary\\/30 {
          border-color: rgba(233, 179, 255, 0.3);
        }

        .bg-primary/10 {
          background-color: rgba(233, 179, 255, 0.1);
        }

        .bg-background\\/80 {
          background-color: rgba(19, 19, 19, 0.8);
        }

        /* Sobrescritura para el sticky */
        .top-\\[72px\\] {
          top: 72px;
        }

        /* Animación para el carrito */
        .translate-x-0 {
          transform: translateX(0);
        }
        .translate-x-full {
          transform: translateX(100%);
        }

        @media (min-width: 768px) {
          .md\\:ml-64 {
            margin-left: 16rem;
          }
          .md\\:px-margin-desktop {
            padding-left: 48px;
            padding-right: 48px;
          }
          .md\\:-mx-margin-desktop {
            margin-left: -48px;
            margin-right: -48px;
          }
          .md\\:grid-cols-2 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .md\\:bottom-10 {
            bottom: 40px;
          }
          .md\\:right-10 {
            right: 40px;
          }
          .md\\:flex {
            display: flex;
          }
        }
        @media (min-width: 1024px) {
          .lg\\:grid-cols-3 {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
          .lg\\:flex {
            display: flex;
          }
          .lg\\:hidden {
            display: none;
          }
        }
      `}</style>
    </>
  );
};

export default UserMenu;