import React, { useState, useEffect } from "react";
import NavbarUsuario from "../../../components/Layout/NavbarUsuario";
import { reservaService } from "../../../services/reservaService";
import { mesaService } from "../../../services/mesaService";
import { parqueaderoService } from "../../../services/parqueaderoService";

const UserReservas = () => {
  // ===== IDENTIFICACIÓN DEL USUARIO =====
  const [usuario, setUsuario] = useState("");

  // ===== ESTADOS DE RECURSOS =====
  const [mesas, setMesas] = useState([]);
  const [covers, setCovers] = useState([]);
  const [parqueaderos, setParqueaderos] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);

  // ===== ESTADO DEL FORMULARIO =====
  const [form, setForm] = useState({
    tipo: "mesa",
    recursoId: "",
    parqueaderoId: "",
    fecha: "",
    hora: "23:00",
    personas: 2,
    cliente: "",
  });

  // ===== ESTADOS DE UI =====
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });
  const [selectedTable, setSelectedTable] = useState(null);

  // ===== FECHA MÍNIMA (HOY) =====
  const hoy = new Date().toISOString().split('T')[0];

  // ===== CARGAR USUARIO Y DATOS =====
  useEffect(() => {
    let user = sessionStorage.getItem("usuarioReservas");
    if (!user) {
      user = prompt("Ingresa tu nombre para gestionar tus reservas:");
      if (user) {
        sessionStorage.setItem("usuarioReservas", user);
      } else {
        user = "Anónimo";
        sessionStorage.setItem("usuarioReservas", user);
      }
    }
    setUsuario(user);
    cargarDatos(user);
  }, []);

  const cargarDatos = async (user) => {
    setLoading(true);
    try {
      const [mesasData, coversData, parqData, reservasData] = await Promise.all([
        mesaService.getAll(),
        coverService.getAll(),
        parqueaderoService.getAll(),
        reservaService.getAll(),
      ]);
      setMesas(mesasData);
      setCovers(coversData);
      setParqueaderos(parqData);
      const delUsuario = reservasData.filter((r) => r.usuario === (user || usuario));
      setReservas(delUsuario);
    } catch (err) {
      // Fallback a localStorage
      const storedMesas = localStorage.getItem("afterdark_mesas");
      const storedCovers = localStorage.getItem("afterdark_covers");
      const storedParq = localStorage.getItem("afterdark_parqueaderos");
      const storedReservas = localStorage.getItem("afterdark_reservas");
      if (storedMesas) setMesas(JSON.parse(storedMesas));
      if (storedCovers) setCovers(JSON.parse(storedCovers));
      if (storedParq) setParqueaderos(JSON.parse(storedParq));
      if (storedReservas) {
        const todas = JSON.parse(storedReservas);
        const delUsuario = todas.filter((r) => r.usuario === (user || usuario));
        setReservas(delUsuario);
      }
      mostrarMensaje("Datos cargados desde caché local", "info");
    } finally {
      setLoading(false);
    }
  };

  // ===== MENSAJES (toast) =====
  const mostrarMensaje = (texto, tipo = "success") => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: "", tipo: "" }), 4000);
  };

  // ===== GUARDAR RESERVA (validando duplicados por fecha completa) =====
  const guardarReserva = async (nuevaReserva) => {
    const stored = localStorage.getItem("afterdark_reservas");
    const todas = stored ? JSON.parse(stored) : [];
    const recursoId = nuevaReserva.mesaId || nuevaReserva.coverId;
    const tipo = nuevaReserva.mesaId ? "mesa" : "cover";
    const duplicado = todas.some(
      (r) =>
        r.fecha === nuevaReserva.fecha &&
        ((tipo === "mesa" && r.mesaId === recursoId) ||
         (tipo === "cover" && r.coverId === recursoId)) &&
        r.estado !== "Cancelado"
    );
    if (duplicado) {
      mostrarMensaje("Este espacio ya está reservado para esa fecha", "error");
      return null;
    }

    try {
      const creada = await reservaService.create(nuevaReserva);
      setReservas((prev) => [...prev, creada]);
      mostrarMensaje("Reserva creada (pendiente de confirmación)", "success");
      return creada;
    } catch (err) {
      const tempId = Date.now();
      const conId = { ...nuevaReserva, id: tempId };
      todas.push(conId);
      localStorage.setItem("afterdark_reservas", JSON.stringify(todas));
      setReservas((prev) => [...prev, conId]);
      mostrarMensaje("Reserva guardada localmente", "info");
      return conId;
    }
  };

  // ===== ELIMINAR RESERVA (cancelar) =====
  const cancelarReserva = async (id) => {
    try {
      await reservaService.remove(id);
      setReservas((prev) => prev.filter((r) => r.id !== id));
      mostrarMensaje("Reserva cancelada", "success");
    } catch (err) {
      const stored = localStorage.getItem("afterdark_reservas");
      if (stored) {
        const todas = JSON.parse(stored);
        const filtradas = todas.filter((r) => r.id !== id);
        localStorage.setItem("afterdark_reservas", JSON.stringify(filtradas));
        setReservas((prev) => prev.filter((r) => r.id !== id));
        mostrarMensaje("Cancelada localmente", "info");
      }
    }
  };

  // ===== HANDLERS DEL FORMULARIO =====
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.recursoId) {
      mostrarMensaje("Selecciona una mesa o cover", "error");
      return;
    }
    if (!form.fecha) {
      mostrarMensaje("Selecciona una fecha", "error");
      return;
    }
    if (!form.cliente.trim()) {
      mostrarMensaje("Ingresa tu nombre", "error");
      return;
    }

    const tipo = form.tipo;
    const recursoId = form.recursoId;
    const parqueaderoId = form.parqueaderoId || null;
    const nuevaReserva = {
      tipo,
      mesaId: tipo === "mesa" ? recursoId : null,
      coverId: tipo === "cover" ? recursoId : null,
      parqueaderoId,
      cliente: form.cliente.trim(),
      fecha: form.fecha,
      hora: form.hora,
      personas: parseInt(form.personas) || 1,
      estado: "Pendiente",
      usuario: usuario,
      createdAt: new Date().toISOString(),
    };

    await guardarReserva(nuevaReserva);
    setForm((prev) => ({ ...prev, recursoId: "", parqueaderoId: "" }));
  };

  // ===== OBTENER RECURSOS DISPONIBLES (por fecha completa) =====
  const getRecursosDisponibles = (tipo) => {
    const recursos = tipo === "mesa" ? mesas : covers;
    const stored = localStorage.getItem("afterdark_reservas");
    const todas = stored ? JSON.parse(stored) : [];
    const reservasEnFecha = todas.filter(
      (r) => r.fecha === form.fecha && r.estado !== "Cancelado"
    );
    const ocupados = reservasEnFecha
      .filter((r) => (tipo === "mesa" ? r.mesaId : r.coverId))
      .map((r) => (tipo === "mesa" ? r.mesaId : r.coverId));
    return recursos.filter((r) => !ocupados.includes(r.id));
  };

  const getRecursoLabel = (id, tipo) => {
    const lista = tipo === "mesa" ? mesas : covers;
    const encontrado = lista.find((r) => r.id === id);
    return encontrado ? encontrado.nombre : "—";
  };

  const getParqueaderoLabel = (id) => {
    const encontrado = parqueaderos.find((p) => p.id === id);
    return encontrado ? encontrado.nombre : "—";
  };

  return (
    <>
      <NavbarUsuario />
      <main className="min-h-screen pt-20 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="font-display-lg text-display-lg text-primary mb-2">Reserva tu Mesa</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Asegura tu lugar en el corazón de la noche.
          </p>
          <p className="text-sm text-on-surface-variant mt-1">
            Usuario: <span className="text-primary font-bold">{usuario}</span>
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Formulario (4 columnas) */}
          <aside className="lg:col-span-4 flex flex-col gap-6">
            <div className="glass-panel rounded-xl p-6">
              <h2 className="font-headline-md text-headline-md text-on-surface mb-4">
                Detalles de Reserva
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Tipo de espacio */}
                <div>
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-2">
                    Tipo de espacio
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-on-surface">
                      <input
                        type="radio"
                        name="tipo"
                        value="mesa"
                        checked={form.tipo === "mesa"}
                        onChange={handleChange}
                        className="accent-primary"
                      />
                      Mesa
                    </label>
                    <label className="flex items-center gap-2 text-on-surface">
                      <input
                        type="radio"
                        name="tipo"
                        value="cover"
                        checked={form.tipo === "cover"}
                        onChange={handleChange}
                        className="accent-primary"
                      />
                      Cover / Tarima
                    </label>
                  </div>
                </div>

                {/* Selector de recurso */}
                <div>
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-2">
                    {form.tipo === "mesa" ? "Mesa" : "Cover"}
                  </label>
                  <select
                    name="recursoId"
                    value={form.recursoId}
                    onChange={handleChange}
                    className="w-full bg-surface-container-highest border-none rounded-lg text-on-surface focus:ring-2 focus:ring-primary h-12 px-4"
                  >
                    <option value="">Selecciona...</option>
                    {getRecursosDisponibles(form.tipo).map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.nombre} (Cap. {r.capacidad})
                      </option>
                    ))}
                  </select>
                  {form.recursoId && (
                    <p className="text-xs text-on-surface-variant mt-1">
                      {getRecursoLabel(form.recursoId, form.tipo)} -{" "}
                      {form.tipo === "mesa"
                        ? mesas.find((m) => m.id === form.recursoId)?.descripcion
                        : covers.find((c) => c.id === form.recursoId)?.descripcion}
                    </p>
                  )}
                </div>

                {/* Parqueadero */}
                <div>
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-2">
                    Parqueadero (opcional)
                  </label>
                  <select
                    name="parqueaderoId"
                    value={form.parqueaderoId}
                    onChange={handleChange}
                    className="w-full bg-surface-container-highest border-none rounded-lg text-on-surface focus:ring-2 focus:ring-primary h-12 px-4"
                  >
                    <option value="">Sin parqueadero</option>
                    {parqueaderos.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre} {p.descripcion ? `- ${p.descripcion}` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Fecha con mínimo = hoy */}
                <div>
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-2">
                    Fecha
                  </label>
                  <input
                    type="date"
                    name="fecha"
                    value={form.fecha}
                    onChange={handleChange}
                    min={hoy}
                    className="w-full bg-surface-container-highest border-none rounded-lg text-on-surface focus:ring-2 focus:ring-primary h-12 px-4"
                    required
                  />
                </div>

                {/* Hora y Personas */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-label-md text-label-md text-on-surface-variant mb-2">
                      Hora
                    </label>
                    <select
                      name="hora"
                      value={form.hora}
                      onChange={handleChange}
                      className="w-full bg-surface-container-highest border-none rounded-lg text-on-surface focus:ring-2 focus:ring-primary h-12 px-4"
                    >
                      <option>22:00</option>
                      <option>22:30</option>
                      <option>23:00</option>
                      <option>23:30</option>
                      <option>00:00</option>
                      <option>00:30</option>
                      <option>01:00</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-label-md text-label-md text-on-surface-variant mb-2">
                      Personas
                    </label>
                    <input
                      type="number"
                      name="personas"
                      value={form.personas}
                      onChange={handleChange}
                      min="1"
                      max="20"
                      className="w-full bg-surface-container-highest border-none rounded-lg text-on-surface focus:ring-2 focus:ring-primary h-12 px-4"
                    />
                  </div>
                </div>

                {/* Nombre del cliente */}
                <div>
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-2">
                    Tu nombre
                  </label>
                  <input
                    type="text"
                    name="cliente"
                    value={form.cliente}
                    onChange={handleChange}
                    placeholder="Ej. Juan Pérez"
                    className="w-full bg-surface-container-highest border-none rounded-lg text-on-surface focus:ring-2 focus:ring-primary h-12 px-4"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary text-on-primary font-label-md text-label-md py-4 rounded-xl active:scale-95 transition-transform font-bold neon-glow-primary"
                >
                  Reservar
                </button>
              </form>
              {mensaje.texto && (
                <div
                  className={`mt-4 text-sm font-label-md ${
                    mensaje.tipo === "success"
                      ? "text-secondary"
                      : mensaje.tipo === "error"
                      ? "text-error"
                      : "text-on-surface-variant"
                  }`}
                >
                  {mensaje.texto}
                </div>
              )}
            </div>

            {/* Indicadores de disponibilidad */}
            <div className="glass-panel rounded-xl p-6 space-y-4">
              <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">
                Pulso en Tiempo Real
              </h3>
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-primary animate-pulse shadow-[0_0_8px_#e9b3ff]"></span>
                <span className="font-body-md text-body-md text-on-surface">
                  Mesas:{" "}
                  <span className="text-primary">
                    {getRecursosDisponibles("mesa").length} disponibles
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-tertiary shadow-[0_0_8px_#e7c448]"></span>
                <span className="font-body-md text-body-md text-on-surface">
                  Covers:{" "}
                  <span className="text-tertiary">
                    {getRecursosDisponibles("cover").length} disponibles
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-secondary shadow-[0_0_8px_#ffb2b7]"></span>
                <span className="font-body-md text-body-md text-on-surface">
                  Parqueaderos:{" "}
                  <span className="text-secondary">
                    {parqueaderos.length - reservas.filter(r => r.parqueaderoId && r.estado !== "Cancelado").length} disponibles
                  </span>
                </span>
              </div>
            </div>
          </aside>

          {/* Plano y lista de reservas (8 columnas) */}
          <section className="lg:col-span-8 flex flex-col gap-6">
            {/* Plano interactivo */}
            <div className="glass-panel rounded-xl p-6 overflow-hidden relative min-h-[400px] flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-headline-md text-headline-md text-on-surface">Plano</h2>
                <div className="flex gap-2">
                  <button className="bg-surface-container-high p-2 rounded-lg text-primary">
                    <span className="material-symbols-outlined">layers</span>
                  </button>
                  <button className="bg-surface-container-high p-2 rounded-lg text-on-surface-variant">
                    <span className="material-symbols-outlined">zoom_in</span>
                  </button>
                </div>
              </div>
              <div className="flex-grow flex items-center justify-center bg-black/40 rounded-lg border border-white/5 relative">
                <div className="relative w-full h-full max-w-md aspect-square p-8 grid grid-cols-6 grid-rows-6 gap-2">
                  <div className="col-span-6 row-span-1 bg-surface-container-highest rounded-t-xl flex items-center justify-center border-b border-primary/50">
                    <span className="font-label-md text-label-md text-primary tracking-widest uppercase">
                      Stage &amp; DJ Booth
                    </span>
                  </div>

                  {mesas.slice(0, 4).map((mesa, idx) => {
                    const stored = localStorage.getItem("afterdark_reservas");
                    const todas = stored ? JSON.parse(stored) : [];
                    const ocupada = todas.some(
                      (r) =>
                        r.mesaId === mesa.id &&
                        r.fecha === form.fecha &&
                        r.estado !== "Cancelado"
                    );
                    const colStart = idx === 0 ? 1 : idx === 1 ? 2 : idx === 2 ? 5 : 6;
                    const rowStart = idx < 2 ? 3 : 5;
                    return (
                      <div
                        key={mesa.id}
                        className={`col-start-${colStart} row-start-${rowStart} ${
                          ocupada
                            ? "bg-error/20 border border-error/50"
                            : "bg-primary/20 border border-primary"
                        } rounded-lg flex items-center justify-center cursor-pointer hover:bg-primary/40 transition`}
                        onClick={() => setSelectedTable(mesa.id)}
                        style={{
                          gridColumn: `${colStart}`,
                          gridRow: `${rowStart}`,
                        }}
                      >
                        <span className={`text-[10px] font-bold ${ocupada ? "text-error" : "text-primary"}`}>
                          {ocupada ? "OCUP" : mesa.nombre || `M${idx+1}`}
                        </span>
                      </div>
                    );
                  })}

                  {covers.length > 0 && (
                    <div className="col-start-2 col-span-4 row-start-2 row-span-2 border border-primary/40 bg-primary/5 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden group">
                      <span className="text-primary font-bold text-xs">
                        {covers[0].nombre || "COVER"}
                      </span>
                      <span className="text-[8px] text-on-surface-variant">Central</span>
                      <div className="absolute inset-0 bg-primary/10 animate-pulse"></div>
                    </div>
                  )}

                  <div className="col-start-1 col-span-6 row-start-6 bg-surface-container-low border-t border-white/10 flex items-center justify-center py-2 mt-4">
                    <span className="text-on-surface-variant font-label-md text-[10px] uppercase">
                      Main Bar
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mis Reservas */}
            <div className="space-y-4">
              <h3 className="font-headline-md text-headline-md text-on-surface px-2">
                Mis Reservas
              </h3>
              {loading ? (
                <div className="text-center text-on-surface-variant py-4">Cargando...</div>
              ) : reservas.length === 0 ? (
                <div className="text-center text-on-surface-variant py-4">
                  No tienes reservas activas.
                </div>
              ) : (
                reservas.map((reserva) => {
                  const espacioLabel =
                    reserva.mesaId
                      ? getRecursoLabel(reserva.mesaId, "mesa")
                      : reserva.coverId
                      ? getRecursoLabel(reserva.coverId, "cover")
                      : "—";
                  const parqLabel = reserva.parqueaderoId
                    ? getParqueaderoLabel(reserva.parqueaderoId)
                    : "Sin parqueadero";
                  const estadoColor =
                    reserva.estado === "Confirmado"
                      ? "text-tertiary border-tertiary"
                      : reserva.estado === "Pendiente"
                      ? "text-primary border-primary"
                      : "text-error border-error";
                  return (
                    <div
                      key={reserva.id}
                      className="glass-panel p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between hover:bg-white/5 transition-all"
                    >
                      <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container-high flex items-center justify-center">
                          <span className="material-symbols-outlined text-primary text-3xl">
                            event_seat
                          </span>
                        </div>
                        <div>
                          <h4 className="font-headline-md text-body-lg text-on-surface">
                            {espacioLabel}
                          </h4>
                          <p className="font-body-md text-sm text-on-surface-variant">
                            {reserva.fecha} a las {reserva.hora} • {reserva.personas} pers.
                          </p>
                          <p className="text-xs text-on-surface-variant">
                            Parqueadero: {parqLabel}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                        <span
                          className={`px-3 py-1 rounded-full border ${estadoColor} text-xs font-bold uppercase`}
                        >
                          {reserva.estado}
                        </span>
                        <button
                          onClick={() => cancelarReserva(reserva.id)}
                          className="bg-error/20 text-error px-4 py-2 rounded-lg font-label-md text-label-md hover:bg-error/40 transition"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </main>

      {/* ===== ESTILOS DE RESPALDO ===== */}
      <style jsx>{`
        body, html {
          background-color: #050505 !important;
          margin: 0;
          padding: 0;
        }

        .pt-20 { padding-top: 5rem; }
        .pb-12 { padding-bottom: 3rem; }
        .px-4 { padding-left: 1rem; padding-right: 1rem; }
        .md\\:px-8 { padding-left: 2rem; padding-right: 2rem; }
        .max-w-7xl { max-width: 80rem; }
        .mx-auto { margin-left: auto; margin-right: auto; }
        .min-h-screen { min-height: 100vh; }

        .mb-8 { margin-bottom: 2rem; }
        .mb-4 { margin-bottom: 1rem; }
        .mb-2 { margin-bottom: 0.5rem; }
        .mt-1 { margin-top: 0.25rem; }
        .mt-4 { margin-top: 1rem; }
        .gap-6 { gap: 1.5rem; }
        .gap-4 { gap: 1rem; }
        .gap-3 { gap: 0.75rem; }
        .gap-2 { gap: 0.5rem; }
        .space-y-4 > * + * { margin-top: 1rem; }

        .font-display-lg { font-family: Montserrat, sans-serif; font-size: 48px; line-height: 56px; letter-spacing: -0.02em; font-weight: 800; }
        .text-display-lg { font-size: 48px; line-height: 56px; letter-spacing: -0.02em; font-weight: 800; }
        .font-body-lg { font-family: Inter, sans-serif; font-size: 18px; line-height: 28px; font-weight: 400; }
        .text-body-lg { font-size: 18px; line-height: 28px; font-weight: 400; }
        .font-label-md { font-family: Inter, sans-serif; font-size: 14px; line-height: 20px; letter-spacing: 0.05em; font-weight: 600; }
        .text-label-md { font-size: 14px; line-height: 20px; letter-spacing: 0.05em; font-weight: 600; }
        .font-headline-md { font-family: Montserrat, sans-serif; font-size: 24px; line-height: 32px; font-weight: 600; }
        .text-headline-md { font-size: 24px; line-height: 32px; font-weight: 600; }
        .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
        .text-xs { font-size: 0.75rem; line-height: 1rem; }
        .text-\\[10px\\] { font-size: 10px; }
        .text-\\[8px\\] { font-size: 8px; }
        .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }

        .text-primary { color: #e9b3ff; }
        .text-on-surface { color: #e5e2e1; }
        .text-on-surface-variant { color: #d2c1d4; }
        .text-secondary { color: #ffb2b7; }
        .text-tertiary { color: #e7c448; }
        .text-error { color: #ffb4ab; }
        .text-on-primary { color: #510074; }

        .bg-primary { background-color: #e9b3ff; }
        .bg-primary\\/20 { background-color: rgba(233,179,255,0.2); }
        .bg-primary\\/10 { background-color: rgba(233,179,255,0.1); }
        .bg-primary\\/5 { background-color: rgba(233,179,255,0.05); }
        .bg-secondary\\/20 { background-color: rgba(255,178,183,0.2); }
        .bg-tertiary\\/20 { background-color: rgba(231,196,72,0.2); }
        .bg-error\\/20 { background-color: rgba(255,180,171,0.2); }
        .bg-error\\/40 { background-color: rgba(255,180,171,0.4); }
        .bg-surface-container-highest { background-color: #353534; }
        .bg-surface-container-high { background-color: #2a2a2a; }
        .bg-surface-container-low { background-color: #1c1b1b; }
        .bg-black\\/40 { background-color: rgba(0,0,0,0.4); }
        .bg-white\\/5 { background-color: rgba(255,255,255,0.05); }

        .border-white\\/10 { border-color: rgba(255,255,255,0.1); }
        .border-white\\/5 { border-color: rgba(255,255,255,0.05); }
        .border-primary { border-color: #e9b3ff; }
        .border-primary\\/40 { border-color: rgba(233,179,255,0.4); }
        .border-primary\\/50 { border-color: rgba(233,179,255,0.5); }
        .border-secondary { border-color: #ffb2b7; }
        .border-tertiary { border-color: #e7c448; }
        .border-error { border-color: #ffb4ab; }
        .border-error\\/50 { border-color: rgba(255,180,171,0.5); }

        .glass-panel {
          background: rgba(28, 28, 30, 0.7);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
        }
        .glass-panel:hover {
          border-color: rgba(233, 179, 255, 0.3);
        }

        .neon-glow-primary { box-shadow: 0 0 12px 2px rgba(233,179,255,0.3); }
        .shadow-\\[0_0_8px_\\#e9b3ff\\] { box-shadow: 0 0 8px #e9b3ff; }
        .shadow-\\[0_0_8px_\\#e7c448\\] { box-shadow: 0 0 8px #e7c448; }
        .shadow-\\[0_0_8px_\\#ffb2b7\\] { box-shadow: 0 0 8px #ffb2b7; }

        .rounded-full { border-radius: 9999px; }
        .rounded-xl { border-radius: 0.75rem; }
        .rounded-lg { border-radius: 0.5rem; }
        .rounded-2xl { border-radius: 1rem; }
        .rounded-t-xl { border-top-left-radius: 0.75rem; border-top-right-radius: 0.75rem; }

        .transition-all { transition: all 0.3s ease; }
        .active\\:scale-95:active { transform: scale(0.95); }
        .hover\\:bg-white\\/5:hover { background-color: rgba(255,255,255,0.05); }
        .hover\\:bg-primary\\/40:hover { background-color: rgba(233,179,255,0.4); }
        .hover\\:bg-error\\/40:hover { background-color: rgba(255,180,171,0.4); }

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

        .grid { display: grid; }
        .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
        .lg\\:grid-cols-12 { grid-template-columns: repeat(12, minmax(0, 1fr)); }
        .lg\\:col-span-4 { grid-column: span 4 / span 4; }
        .lg\\:col-span-8 { grid-column: span 8 / span 8; }
        .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .grid-cols-6 { grid-template-columns: repeat(6, minmax(0, 1fr)); }
        .grid-rows-6 { grid-template-rows: repeat(6, minmax(0, 1fr)); }
        .col-span-6 { grid-column: span 6 / span 6; }
        .col-span-4 { grid-column: span 4 / span 4; }
        .row-span-1 { grid-row: span 1 / span 1; }
        .row-span-2 { grid-row: span 2 / span 2; }
        .col-start-1 { grid-column-start: 1; }
        .col-start-2 { grid-column-start: 2; }
        .col-start-5 { grid-column-start: 5; }
        .col-start-6 { grid-column-start: 6; }
        .row-start-2 { grid-row-start: 2; }
        .row-start-3 { grid-row-start: 3; }
        .row-start-5 { grid-row-start: 5; }
        .row-start-6 { grid-row-start: 6; }

        .flex { display: flex; }
        .flex-col { flex-direction: column; }
        .items-center { align-items: center; }
        .justify-between { justify-content: space-between; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }

        .w-full { width: 100%; }
        .h-12 { height: 3rem; }
        .h-16 { height: 4rem; }
        .w-16 { width: 4rem; }
        .w-3 { width: 0.75rem; }
        .h-3 { height: 0.75rem; }

        .p-6 { padding: 1.5rem; }
        .p-4 { padding: 1rem; }
        .p-2 { padding: 0.5rem; }
        .p-8 { padding: 2rem; }
        .px-4 { padding-left: 1rem; padding-right: 1rem; }
        .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
        .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
        .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
        .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
        .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
        .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }

        .relative { position: relative; }
        .absolute { position: absolute; }
        .inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
        .overflow-hidden { overflow: hidden; }
        .aspect-square { aspect-ratio: 1 / 1; }
        .min-h-\\[400px\\] { min-height: 400px; }
        .cursor-pointer { cursor: pointer; }

        .border-none { border: none; }
        .border-b { border-bottom-width: 1px; }
        .border-t { border-top-width: 1px; }
        .border-l-2 { border-left-width: 2px; }
        .pl-4 { padding-left: 1rem; }
        .pl-3 { padding-left: 0.75rem; }
        .border-l-2.border-primary\\/20 { border-color: rgba(233,179,255,0.2); }
        .border-l-2.border-white\\/5 { border-color: rgba(255,255,255,0.05); }
        .shrink-0 { flex-shrink: 0; }
        .flex-1 { flex: 1; }
        .min-w-0 { min-width: 0; }

        .focus\\:ring-2:focus { outline: none; box-shadow: 0 0 0 2px #e9b3ff; }
        .focus\\:ring-primary:focus { --tw-ring-color: #e9b3ff; }
        .accent-primary { accent-color: #e9b3ff; }

        .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        .uppercase { text-transform: uppercase; }
        .tracking-widest { letter-spacing: 0.1em; }
        .font-bold { font-weight: 700; }

        .md\\:flex-row { flex-direction: row; }
        .md\\:justify-end { justify-content: flex-end; }

        @media (min-width: 768px) {
          .md\\:flex-row { flex-direction: row; }
          .md\\:px-8 { padding-left: 2rem; padding-right: 2rem; }
          .md\\:justify-end { justify-content: flex-end; }
        }
        @media (min-width: 1024px) {
          .lg\\:grid-cols-12 { grid-template-columns: repeat(12, minmax(0, 1fr)); }
          .lg\\:col-span-4 { grid-column: span 4 / span 4; }
          .lg\\:col-span-8 { grid-column: span 8 / span 8; }
        }
      `}</style>
    </>
  );
};

export default UserReservas;