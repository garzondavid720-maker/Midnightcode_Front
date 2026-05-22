import React, { useState } from "react";
import { useSongs } from "../../../context/SongContext";
import { useAuth } from "../../../context/AuthContext";

const GENRES = ["Techno","House","Electro","Trance","Drum & Bass","Ambient","Industrial","Nu-Disco"];

export default function SongRequestPage({ onBack }) {
  const { queue, queued, playing, votedIds, addSong, voteSong } = useSongs();
  const { user } = useAuth();

  const [title,         setTitle]         = useState("");
  const [artist,        setArtist]        = useState("");
  const [message,       setMessage]       = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [anonymous,     setAnonymous]     = useState(true);
  const [submitted,     setSubmitted]     = useState(false);
  const [activeTab,     setActiveTab]     = useState("queue");

  const handleSubmit = () => {
    if (!title.trim()) return;
    addSong({
      title,
      artist,
      genre:       selectedGenre,
      message,
      requestedBy: anonymous ? "Anon" : (user?.name?.split(" ")[0] || "Tú"),
    });
    setTitle(""); setArtist(""); setMessage(""); setSelectedGenre("");
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setActiveTab("queue");
  };

  // sorted: playing first, then queued by votes
  const sorted = [
    ...(playing ? [playing] : []),
    ...queued,
  ];

  return (
    <div style={{ minHeight:"100vh", background:"#080810", fontFamily:"'Syne',sans-serif", padding:"40px 48px", display:"flex", justifyContent:"center" }}>
    <div style={{ width:"100%", maxWidth:"1000px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Space+Mono:wght@400;700&display=swap');
        .vote-btn{transition:all .2s;cursor:pointer}.vote-btn:not(:disabled):hover{transform:scale(1.05)}
        .genre-chip{transition:all .2s;cursor:pointer}.genre-chip:hover{border-color:rgba(138,43,226,.5)!important;color:#fff!important}
        .tab-btn{transition:all .2s;cursor:pointer}.tab-btn:hover{color:#fff!important}
        input:focus,textarea:focus{border-color:rgba(138,43,226,.6)!important;outline:none}
        @keyframes equalizer{0%,100%{height:8px}50%{height:24px}}
        .bar1{animation:equalizer .8s ease infinite}
        .bar2{animation:equalizer .8s ease .2s infinite}
        .bar3{animation:equalizer .8s ease .4s infinite}
        .song-row{transition:all .2s}
        .song-row:hover{border-color:rgba(138,43,226,.35)!important}
      `}</style>

      {/* HEADER */}
      <div style={{ display:"flex", alignItems:"center", gap:"16px", marginBottom:"40px" }}>
        <button onClick={onBack} style={{ padding:"10px 16px", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"12px", color:"#6b6b8a", fontSize:"14px", cursor:"pointer" }}>
          ← Volver
        </button>
        <div>
          <p style={{ color:"#4a4a6a", fontSize:"11px", letterSpacing:"3px", textTransform:"uppercase", margin:"0 0 4px", fontFamily:"'Space Mono',monospace" }}>Pide tu canción</p>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"28px", color:"#fff", margin:0 }}>
            Sugerencias de{" "}
            <span style={{ background:"linear-gradient(135deg,#8a2be2,#d400ff)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
              Canciones
            </span>
          </h2>
        </div>
        {/* Live indicator */}
        <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:"8px", padding:"8px 16px", background:"rgba(0,245,160,0.08)", border:"1px solid rgba(0,245,160,0.2)", borderRadius:"20px" }}>
          <span style={{ width:"8px", height:"8px", borderRadius:"50%", background:"#00f5a0", display:"inline-block", animation:"equalizer .8s ease infinite" }} />
          <span style={{ color:"#00f5a0", fontSize:"11px", fontFamily:"'Space Mono',monospace", fontWeight:700 }}>
            {queue.filter(s => s.status !== "rejected").length} en cola
          </span>
        </div>
      </div>

      {/* TABS */}
      <div style={{ display:"flex", gap:"4px", background:"#0d0d1a", borderRadius:"14px", padding:"4px", marginBottom:"36px", width:"fit-content", border:"1px solid rgba(255,255,255,0.06)" }}>
        {[{id:"queue",label:"♫ Cola actual"},{id:"request",label:"+ Pedir canción"}].map(t=>(
          <button key={t.id} className="tab-btn" onClick={()=>setActiveTab(t.id)}
            style={{ padding:"10px 24px", borderRadius:"10px", border:"none", background:activeTab===t.id?"linear-gradient(135deg,#8a2be2,#d400ff)":"transparent", color:activeTab===t.id?"#fff":"#6b6b8a", fontSize:"13px", fontWeight:activeTab===t.id?700:400, fontFamily:"'Space Mono',monospace", cursor:"pointer" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── QUEUE TAB ── */}
      {activeTab==="queue" && (
        <div style={{ maxWidth:"680px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:"20px" }}>
            <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:"16px", color:"#fff", margin:0 }}>
              En la pista esta noche
            </h3>
            <span style={{ color:"#4a4a6a", fontSize:"12px", fontFamily:"'Space Mono',monospace" }}>
              {queued.length} en espera
            </span>
          </div>

          {sorted.length === 0 && (
            <div style={{ textAlign:"center", padding:"48px 0", color:"#2a2a3e" }}>
              <p style={{ fontSize:"32px", marginBottom:"12px" }}>♫</p>
              <p style={{ fontFamily:"'Space Mono',monospace", fontSize:"13px" }}>Aún no hay canciones pedidas esta noche</p>
              <button onClick={()=>setActiveTab("request")} style={{ marginTop:"16px", padding:"10px 20px", background:"rgba(138,43,226,0.15)", border:"1px solid rgba(138,43,226,0.3)", borderRadius:"10px", color:"#c084fc", fontSize:"12px", cursor:"pointer", fontFamily:"'Space Mono',monospace" }}>
                Sé el primero → Pedir canción
              </button>
            </div>
          )}

          <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
            {sorted.map((song, i) => {
              const isPlaying = song.status === "playing";
              const hasVoted  = votedIds.includes(song.id);
              return (
                <div key={song.id} className="song-row"
                  style={{ background:isPlaying?"rgba(138,43,226,0.1)":"#0d0d1a", border:`1px solid ${isPlaying?"rgba(138,43,226,0.4)":"rgba(255,255,255,0.05)"}`, borderRadius:"16px", padding:"16px 20px", display:"flex", alignItems:"center", gap:"16px", position:"relative", overflow:"hidden" }}>

                  {isPlaying && <div style={{ position:"absolute", left:0, top:0, bottom:0, width:"3px", background:"linear-gradient(to bottom,#8a2be2,#d400ff)" }} />}

                  {/* Rank / Equalizer */}
                  <div style={{ width:"32px", textAlign:"center", flexShrink:0 }}>
                    {isPlaying ? (
                      <div style={{ display:"flex", alignItems:"flex-end", gap:"2px", height:"24px", justifyContent:"center" }}>
                        <div className="bar1" style={{ width:"3px", background:"#c084fc", borderRadius:"2px" }} />
                        <div className="bar2" style={{ width:"3px", background:"#c084fc", borderRadius:"2px" }} />
                        <div className="bar3" style={{ width:"3px", background:"#c084fc", borderRadius:"2px" }} />
                      </div>
                    ) : (
                      <span style={{ color:"#2a2a3e", fontSize:"13px", fontFamily:"'Space Mono',monospace", fontWeight:700 }}>#{i}</span>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:"15px", color:isPlaying?"#fff":"#d1d1e0", margin:"0 0 2px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {song.title}
                    </p>
                    <div style={{ display:"flex", alignItems:"center", gap:"10px", flexWrap:"wrap" }}>
                      <p style={{ color:"#4a4a6a", fontSize:"12px", margin:0, fontFamily:"'Space Mono',monospace" }}>
                        {song.artist} · por {song.requestedBy}
                      </p>
                      {song.genre && (
                        <span style={{ background:"rgba(138,43,226,0.12)", border:"1px solid rgba(138,43,226,0.2)", borderRadius:"4px", padding:"1px 7px", fontSize:"10px", color:"#c084fc", fontFamily:"'Space Mono',monospace" }}>
                          {song.genre}
                        </span>
                      )}
                    </div>
                    {song.message && (
                      <p style={{ color:"#6b6b8a", fontSize:"11px", margin:"4px 0 0", fontFamily:"'Space Mono',monospace", fontStyle:"italic" }}>
                        "{song.message}"
                      </p>
                    )}
                  </div>

                  {/* Vote button */}
                  <button className="vote-btn" disabled={hasVoted || isPlaying} onClick={()=>voteSong(song.id)}
                    style={{ display:"flex", alignItems:"center", gap:"8px", padding:"8px 14px", background:hasVoted?"rgba(138,43,226,0.2)":"rgba(255,255,255,0.04)", border:`1px solid ${hasVoted?"rgba(138,43,226,0.4)":"rgba(255,255,255,0.08)"}`, borderRadius:"10px", color:hasVoted?"#c084fc":"#6b6b8a", fontSize:"13px", fontFamily:"'Space Mono',monospace", opacity:isPlaying?0.4:1, cursor:isPlaying||hasVoted?"default":"pointer", flexShrink:0 }}>
                    <span style={{ fontSize:"12px" }}>{hasVoted?"▲":"△"}</span>
                    <span style={{ fontWeight:700 }}>{song.votes}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── REQUEST TAB ── */}
      {activeTab==="request" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"40px", maxWidth:"900px" }}>

          {/* Form */}
          <div>
            <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:"16px", color:"#fff", margin:"0 0 24px" }}>
              Pide tu canción
            </h3>

            {submitted && (
              <div style={{ background:"rgba(0,245,160,0.1)", border:"1px solid rgba(0,245,160,0.3)", borderRadius:"12px", padding:"14px 18px", marginBottom:"20px", display:"flex", alignItems:"center", gap:"10px" }}>
                <span style={{ color:"#00f5a0", fontSize:"16px" }}>✓</span>
                <span style={{ color:"#00f5a0", fontSize:"14px" }}>¡Canción agregada a la cola!</span>
              </div>
            )}

            <div style={{ display:"flex", flexDirection:"column", gap:"16px", marginBottom:"24px" }}>
              {[
                {label:"Título *", val:title,  set:setTitle,  ph:"Nombre de la canción"},
                {label:"Artista",  val:artist, set:setArtist, ph:"Nombre del artista"},
              ].map((f,i)=>(
                <div key={i}>
                  <label style={{ display:"block", color:"#6b6b8a", fontSize:"11px", fontFamily:"'Space Mono',monospace", marginBottom:"8px", letterSpacing:"1px", textTransform:"uppercase" }}>{f.label}</label>
                  <input type="text" placeholder={f.ph} value={f.val} onChange={e=>f.set(e.target.value)}
                    style={{ width:"100%", background:"#0d0d1a", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"12px", padding:"14px 16px", color:"#fff", fontSize:"15px", fontFamily:"'Syne',sans-serif", boxSizing:"border-box" }} />
                </div>
              ))}

              <div>
                <label style={{ display:"block", color:"#6b6b8a", fontSize:"11px", fontFamily:"'Space Mono',monospace", marginBottom:"8px", letterSpacing:"1px", textTransform:"uppercase" }}>
                  Mensaje al DJ
                </label>
                <textarea placeholder="¡Es mi cumpleaños, por favor ponla!" value={message} onChange={e=>setMessage(e.target.value)} rows={3}
                  style={{ width:"100%", background:"#0d0d1a", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"12px", padding:"14px 16px", color:"#fff", fontSize:"15px", fontFamily:"'Syne',sans-serif", resize:"none", boxSizing:"border-box" }} />
              </div>
            </div>

            <div style={{ marginBottom:"24px" }}>
              <label style={{ display:"block", color:"#6b6b8a", fontSize:"11px", fontFamily:"'Space Mono',monospace", marginBottom:"12px", letterSpacing:"1px", textTransform:"uppercase" }}>
                Género (opcional)
              </label>
              <div style={{ display:"flex", flexWrap:"wrap", gap:"8px" }}>
                {GENRES.map(g=>(
                  <button key={g} className="genre-chip" onClick={()=>setSelectedGenre(selectedGenre===g?"":g)}
                    style={{ padding:"6px 14px", background:"transparent", border:`1px solid ${selectedGenre===g?"#c084fc":"rgba(255,255,255,0.08)"}`, borderRadius:"20px", color:selectedGenre===g?"#c084fc":"#4a4a6a", fontSize:"12px", fontFamily:"'Space Mono',monospace", cursor:"pointer" }}>
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"28px", cursor:"pointer" }} onClick={()=>setAnonymous(!anonymous)}>
              <div style={{ width:"20px", height:"20px", borderRadius:"6px", border:`1px solid ${anonymous?"#8a2be2":"rgba(255,255,255,0.15)"}`, background:anonymous?"rgba(138,43,226,0.2)":"transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                {anonymous && <span style={{ color:"#c084fc", fontSize:"12px" }}>✓</span>}
              </div>
              <span style={{ color:"#6b6b8a", fontSize:"13px", fontFamily:"'Space Mono',monospace" }}>
                Enviar de forma anónima
              </span>
            </div>

            <button onClick={handleSubmit} disabled={!title.trim()}
              style={{ width:"100%", padding:"16px", background:title.trim()?"linear-gradient(135deg,#8a2be2,#d400ff)":"#1a1a2e", border:"none", borderRadius:"14px", color:title.trim()?"#fff":"#4a4a6a", fontSize:"15px", fontWeight:700, fontFamily:"'Syne',sans-serif", cursor:title.trim()?"pointer":"not-allowed" }}>
              ♫ Enviar sugerencia
            </button>
          </div>

          {/* Top voted preview */}
          <div>
            <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:"16px", color:"#fff", margin:"0 0 24px" }}>
              Top Votadas Ahora
            </h3>
            <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
              {[...(playing?[playing]:[]), ...queued].slice(0,6).map((song,i)=>(
                <div key={song.id} style={{ display:"flex", alignItems:"center", gap:"12px", padding:"12px 16px", background:"#0d0d1a", borderRadius:"12px", border:"1px solid rgba(255,255,255,0.05)" }}>
                  <span style={{ color:song.status==="playing"?"#c084fc":"#2a2a3e", fontSize:"13px", fontFamily:"'Space Mono',monospace", width:"20px", textAlign:"center", fontWeight:700 }}>
                    {song.status==="playing"?"♫":`${i+1}`}
                  </span>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontFamily:"'Syne',sans-serif", fontWeight:600, fontSize:"14px", color:"#d1d1e0", margin:"0 0 1px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {song.title}
                    </p>
                    <p style={{ color:"#4a4a6a", fontSize:"11px", margin:0, fontFamily:"'Space Mono',monospace" }}>{song.artist}</p>
                  </div>
                  <span style={{ color:"#6b6b8a", fontSize:"12px", fontFamily:"'Space Mono',monospace", flexShrink:0 }}>△ {song.votes}</span>
                </div>
              ))}
              {queued.length === 0 && !playing && (
                <p style={{ color:"#2a2a3e", fontSize:"12px", fontFamily:"'Space Mono',monospace", textAlign:"center", padding:"24px 0" }}>
                  Sin canciones aún
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}