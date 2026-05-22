// src/context/SongContext.jsx
// Conectado a Socket.io + API real del backend

import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import api from "../services/api";

const SongContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace("/api", "")
  : "http://localhost:3000";

// ── Normaliza un objeto del backend al formato del frontend ──────────────────
const toFrontend = (c) => {
  const fila = Number(c.numero_fila);
  let status = "queued";
  if (fila === 0)       status = "playing";
  else if (fila === -1) status = "played";
  else if (fila <= -2)  status = "rejected";

  const [title, ...rest] = (c.nombre_can || " - ").split(" - ");
  return {
    id:          c.id_cancion,
    title:       title?.trim() || c.nombre_can,
    artist:      rest.join(" - ").trim() || "Desconocido",
    link:        c.Link_can || "",
    votes:       c.votos || 0,
    status,
    requestedBy: c.usuario?.nombre_usu || "Anon",
    timestamp:   Date.now(),
  };
};

const sort = (q) =>
  [...q].sort((a, b) => {
    if (a.status === "playing") return -1;
    if (b.status === "playing") return 1;
    if (a.status === "played"   && b.status !== "played")  return 1;
    if (b.status === "played"   && a.status !== "played")  return -1;
    if (a.status === "rejected" && b.status !== "rejected") return 1;
    if (b.status === "rejected" && a.status !== "rejected") return -1;
    return b.votes - a.votes;
  });

export function SongProvider({ children }) {
  const [queue,    setQueue]    = useState([]);
  const [votedIds, setVotedIds] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const socketRef  = useRef(null);

  // ── Carga inicial desde la API ────────────────────────────────────────────
  const fetchQueue = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/canciones/queue");
      if (data.success) {
        setQueue(sort(data.data));
      }
    } catch {
      // sin token o sin servidor: mantiene cola vacía
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Socket.io ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("neon_token");
    if (!token) return;

    // Solo carga la cola si hay token
    fetchQueue();

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    socket.on("colaCanciones", (lista) => {
      setQueue(sort(lista.map(toFrontend)));
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [fetchQueue]);

  // ── Usuario: solicitar canción ────────────────────────────────────────────
  const addSong = useCallback(async ({ title, artist, link, genre, message }) => {
    try {
      const { data } = await api.post("/canciones/request", {
        title, artist, link, genre, message,
      });
      if (data.success) {
        const song = data.data;
        if (song.duplicado) return { duplicado: true, id: song.id };
        return { duplicado: false, id: song.id };
      }
    } catch (err) {
      throw err;
    }
  }, []);

  // ── Usuario: votar por una canción ────────────────────────────────────────
  const voteSong = useCallback(async (id) => {
    if (votedIds.includes(id)) return false;
    setVotedIds(prev => [...prev, id]);
    try {
      await api.post(`/canciones/${id}/vote`);
      return true;
    } catch {
      setVotedIds(prev => prev.filter(v => v !== id));
      return false;
    }
  }, [votedIds]);

  // ── DJ: cambios de estado ─────────────────────────────────────────────────
  const playSong = useCallback(async (id) => {
    try { await api.patch(`/canciones/${id}/play`); } catch { /**/ }
  }, []);

  const markPlayed = useCallback(async (id) => {
    try { await api.patch(`/canciones/${id}/played`); } catch { /**/ }
  }, []);

  const rejectSong = useCallback(async (id) => {
    try { await api.patch(`/canciones/${id}/reject`); } catch { /**/ }
  }, []);

  const restoreSong = useCallback(async (id) => {
    try { await api.patch(`/canciones/${id}/restore`); } catch { /**/ }
  }, []);

  // ── Vistas derivadas ──────────────────────────────────────────────────────
  const queued   = queue.filter(s => s.status === "queued");
  const playing  = queue.find(s  => s.status === "playing") || null;
  const played   = queue.filter(s => s.status === "played");
  const rejected = queue.filter(s => s.status === "rejected");

  return (
    <SongContext.Provider value={{
      queue, loading, votedIds,
      queued, playing, played, rejected,
      addSong, voteSong, playSong, markPlayed, rejectSong, restoreSong,
      refetch: fetchQueue,
    }}>
      {children}
    </SongContext.Provider>
  );
}

export function useSongs() {
  const ctx = useContext(SongContext);
  if (!ctx) throw new Error("useSongs must be used inside SongProvider");
  return ctx;
}
