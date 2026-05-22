import { useState, useRef } from "react";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../services/api";

function Stars({ n }) {
  return (
    <span>
      {Array.from({ length:5 }, (_,i) => (
        <span key={i} style={{ color:i<n?"#ffc107":"#2a2a3e", fontSize:"13px" }}>★</span>
      ))}
    </span>
  );
}

function resizeImage(file, maxSize = 200) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ratio  = Math.min(maxSize / img.width, maxSize / img.height, 1);
        canvas.width  = img.width  * ratio;
        canvas.height = img.height * ratio;
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function ProfilePage({ user: propUser, onBack }) {
  const { user: ctxUser, updateUser } = useAuth();
  const user = propUser || ctxUser;

  const [tab,        setTab]        = useState("account");
  const [form,       setForm]       = useState({
    name:  user?.name  || "",
    email: user?.email || "",
    phone: user?.phone || "",
    city:  user?.city  || "",
  });
  const [passwords,  setPasswords]  = useState({ current: "", newPw: "", confirm: "" });
  const [showPw,     setShowPw]     = useState(false);
  const [saved,      setSaved]      = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [msg,        setMsg]        = useState(null);
  const [avatar,     setAvatar]     = useState(user?.avatar || null);
  const [uploading,  setUploading]  = useState(false);
  const fileRef = useRef();

  const notify = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 3000);
  };

  const save = async () => {
    setSaving(true);
    try {
      const { data } = await api.patch("/usuarios/me", { name: form.name, phone: form.phone });
      if (data.success) {
        updateUser({ ...data.user });
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch {
      notify("err", "Error al guardar los cambios");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { notify("err", "Selecciona una imagen válida"); return; }
    setUploading(true);
    try {
      const base64 = await resizeImage(file, 200);
      const { data } = await api.patch("/usuarios/me", { avatar: base64 });
      if (data.success) {
        setAvatar(base64);
        updateUser({ avatar: base64 });
        notify("ok", "Foto de perfil actualizada");
      }
    } catch {
      notify("err", "Error al subir la foto");
    } finally {
      setUploading(false);
    }
  };

  const changePassword = async () => {
    if (passwords.newPw !== passwords.confirm) { notify("err", "Las contraseñas nuevas no coinciden"); return; }
    setSaving(true);
    try {
      await api.patch("/usuarios/me/password", { currentPassword: passwords.current, newPassword: passwords.newPw });
      notify("ok", "Contraseña actualizada");
      setPasswords({ current: "", newPw: "", confirm: "" });
    } catch (err) {
      notify("err", err.response?.data?.message || "Error al cambiar contraseña");
    } finally {
      setSaving(false);
    }
  };

  const TABS = [
    { id:"account",  label:"Cuenta"    },
    { id:"history",  label:"Historial" },
    { id:"reviews",  label:"Reseñas"   },
    { id:"security", label:"Seguridad" },
  ];

  const displayAvatar = avatar || user?.avatar;

  return (
    <div style={{ minHeight:"100vh", background:"#080810", padding:"32px 40px", fontFamily:"'Syne',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Space+Mono:wght@400;700&display=swap');
        .tab-btn{transition:all .15s;cursor:pointer}.tab-btn:hover{color:#fff!important}
        .ev-card{transition:all .2s}.ev-card:hover{border-color:rgba(138,43,226,.5)!important}
        .btn-save{transition:all .2s;cursor:pointer}.btn-save:hover{opacity:.85}
        .upload-lbl{transition:all .2s;cursor:pointer}.upload-lbl:hover{background:#d400ff!important}
        input:focus,textarea:focus{border-color:rgba(138,43,226,.6)!important;outline:none}
      `}</style>

      <div style={{ display:"flex", alignItems:"center", gap:"14px", marginBottom:"36px" }}>
        <button onClick={onBack} style={{ padding:"9px 14px", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"10px", color:"#6b6b8a", fontSize:"13px", cursor:"pointer", fontFamily:"'Space Mono',monospace" }}>
          ← Volver
        </button>
        <div>
          <p style={{ color:"#4a4a6a", fontSize:"10px", letterSpacing:"3px", textTransform:"uppercase", margin:"0 0 3px", fontFamily:"'Space Mono',monospace" }}>Tu identidad</p>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"26px", color:"#fff", margin:0 }}>Perfil</h2>
        </div>
      </div>

      {msg && (
        <div style={{ marginBottom:"16px", padding:"12px 16px", borderRadius:"10px", background:msg.type==="ok"?"rgba(0,245,160,0.08)":"rgba(255,56,86,0.08)", border:`1px solid ${msg.type==="ok"?"rgba(0,245,160,0.25)":"rgba(255,56,86,0.25)"}`, color:msg.type==="ok"?"#00f5a0":"#ff3860", fontSize:"13px", fontFamily:"'Space Mono',monospace" }}>
          {msg.type==="ok"?"✓":"✕"} {msg.text}
        </div>
      )}

      <div style={{ display:"grid", gridTemplateColumns:"240px 1fr", gap:"28px", alignItems:"start" }}>

        {/* LEFT — avatar + member info */}
        <div style={{ background:"#0d0d1a", border:"1px solid rgba(138,43,226,0.12)", borderRadius:"20px", padding:"28px", textAlign:"center" }}>
          <div style={{ position:"relative", width:"fit-content", margin:"0 auto 20px" }}>
            {displayAvatar ? (
              <img src={displayAvatar} alt="avatar"
                style={{ width:"96px", height:"96px", borderRadius:"50%", border:"2px solid rgba(138,43,226,0.5)", objectFit:"cover", display:"block" }} />
            ) : (
              <div style={{ width:"96px", height:"96px", borderRadius:"50%", border:"2px solid rgba(138,43,226,0.5)", background:"rgba(138,43,226,0.15)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"36px", fontWeight:700, color:"#c084fc", margin:"0 auto" }}>
                {(form.name || user?.name || "U")[0].toUpperCase()}
              </div>
            )}
            <label
              className="upload-lbl"
              title={uploading ? "Subiendo..." : "Cambiar foto"}
              style={{ position:"absolute", bottom:"-4px", right:"-4px", background: uploading ? "#555" : "#8a2be2", borderRadius:"50%", width:"28px", height:"28px", display:"flex", alignItems:"center", justifyContent:"center", cursor: uploading ? "wait" : "pointer", border:"2px solid #080810", fontSize:"13px", color:"#fff" }}>
              {uploading ? "…" : "✎"}
              <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleAvatarChange} disabled={uploading} />
            </label>
          </div>

          <p style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"17px", color:"#fff", margin:"0 0 4px" }}>{form.name || user?.name}</p>
          <p style={{ fontFamily:"'Space Mono',monospace", fontSize:"10px", color:"#c084fc", margin:"0 0 24px", letterSpacing:"1px" }}>MIEMBRO</p>

          {/* Join date — real from backend */}
          <div style={{ background:"rgba(0,245,160,0.08)", borderRadius:"10px", padding:"10px 12px", border:"1px solid rgba(0,245,160,0.15)" }}>
            <p style={{ color:"#00f5a0", fontSize:"10px", fontFamily:"'Space Mono',monospace", margin:"0 0 2px", letterSpacing:"1px" }}>MIEMBRO DESDE</p>
            <p style={{ color:"#fff", fontSize:"13px", fontWeight:600, margin:0 }}>
              {user?.memberSince || (user?.fecha_registro
                ? new Date(user.fecha_registro).toLocaleDateString("es-CO", { year:"numeric", month:"long", day:"numeric" })
                : "—")}
            </p>
          </div>
        </div>

        {/* RIGHT — tabs */}
        <div>
          <div style={{ display:"flex", gap:"4px", background:"#0d0d1a", borderRadius:"12px", padding:"4px", marginBottom:"24px", width:"fit-content", border:"1px solid rgba(255,255,255,0.06)" }}>
            {TABS.map(t => (
              <button key={t.id} className="tab-btn" onClick={() => setTab(t.id)}
                style={{ padding:"8px 18px", borderRadius:"8px", border:"none", background:tab===t.id?"linear-gradient(135deg,#8a2be2,#d400ff)":"transparent", color:tab===t.id?"#fff":"#6b6b8a", fontSize:"12px", fontWeight:tab===t.id?700:400, fontFamily:"'Space Mono',monospace", cursor:"pointer" }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* ACCOUNT */}
          {tab==="account" && (
            <div style={{ background:"#0d0d1a", border:"1px solid rgba(138,43,226,0.1)", borderRadius:"20px", padding:"28px" }}>
              <p style={{ color:"#4a4a6a", fontSize:"10px", letterSpacing:"2px", textTransform:"uppercase", margin:"0 0 20px", fontFamily:"'Space Mono',monospace" }}>Información personal</p>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px", marginBottom:"24px" }}>
                {[
                  {id:"name",  label:"Nombre completo",    type:"text",  readOnly:false},
                  {id:"email", label:"Correo electrónico", type:"email", readOnly:true},
                  {id:"phone", label:"Celular",            type:"tel",   readOnly:false},
                  {id:"city",  label:"Ciudad",             type:"text",  readOnly:false},
                ].map(f=>(
                  <div key={f.id}>
                    <label style={{ display:"block", color:"#6b6b8a", fontSize:"10px", fontFamily:"'Space Mono',monospace", marginBottom:"7px", letterSpacing:"1px", textTransform:"uppercase" }}>{f.label}</label>
                    <input type={f.type} value={form[f.id]} readOnly={f.readOnly}
                      onChange={e => !f.readOnly && setForm({...form,[f.id]:e.target.value})}
                      style={{ width:"100%", background: f.readOnly ? "rgba(255,255,255,0.02)" : "#080810", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"11px", padding:"13px 15px", color: f.readOnly ? "#4a4a6a" : "#fff", fontSize:"14px", fontFamily:"'Syne',sans-serif", cursor: f.readOnly ? "not-allowed" : "text" }} />
                  </div>
                ))}
              </div>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                {saved && <p style={{ color:"#00f5a0", fontSize:"12px", fontFamily:"'Space Mono',monospace" }}>✓ Cambios guardados</p>}
                <div style={{ marginLeft:"auto" }}>
                  <button className="btn-save" onClick={save} disabled={saving}
                    style={{ padding:"12px 28px", background:"linear-gradient(135deg,#8a2be2,#d400ff)", border:"none", borderRadius:"12px", color:"#fff", fontSize:"13px", fontWeight:700, fontFamily:"'Syne',sans-serif", opacity:saving?0.6:1 }}>
                    {saving ? "Guardando..." : "Guardar cambios"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* HISTORY — empty state for new users */}
          {tab==="history" && (
            <div style={{ background:"#0d0d1a", border:"1px solid rgba(138,43,226,0.1)", borderRadius:"20px", padding:"28px" }}>
              <p style={{ color:"#4a4a6a", fontSize:"10px", letterSpacing:"2px", textTransform:"uppercase", margin:"0 0 20px", fontFamily:"'Space Mono',monospace" }}>Eventos asistidos</p>
              <div style={{ textAlign:"center", padding:"48px 20px" }}>
                <p style={{ fontSize:"40px", margin:"0 0 14px" }}>🎪</p>
                <p style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:"17px", color:"#fff", margin:"0 0 8px" }}>Sin historial aún</p>
                <p style={{ fontFamily:"'Space Mono',monospace", fontSize:"11px", color:"#4a4a6a", margin:0, lineHeight:1.6 }}>
                  Tu historial de eventos aparecerá aquí<br />después de asistir a uno.
                </p>
              </div>
            </div>
          )}

          {/* REVIEWS — empty state for new users */}
          {tab==="reviews" && (
            <div style={{ background:"#0d0d1a", border:"1px solid rgba(138,43,226,0.1)", borderRadius:"20px", padding:"28px" }}>
              <p style={{ color:"#4a4a6a", fontSize:"10px", letterSpacing:"2px", textTransform:"uppercase", margin:"0 0 20px", fontFamily:"'Space Mono',monospace" }}>Mis reseñas</p>
              <div style={{ textAlign:"center", padding:"48px 20px" }}>
                <p style={{ fontSize:"40px", margin:"0 0 14px" }}>⭐</p>
                <p style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:"17px", color:"#fff", margin:"0 0 8px" }}>Sin reseñas aún</p>
                <p style={{ fontFamily:"'Space Mono',monospace", fontSize:"11px", color:"#4a4a6a", margin:0, lineHeight:1.6 }}>
                  Podrás dejar tu reseña después<br />de asistir a un evento.
                </p>
              </div>
            </div>
          )}

          {/* SECURITY */}
          {tab==="security" && (
            <div style={{ background:"#0d0d1a", border:"1px solid rgba(138,43,226,0.1)", borderRadius:"20px", padding:"28px" }}>
              <p style={{ color:"#4a4a6a", fontSize:"10px", letterSpacing:"2px", textTransform:"uppercase", margin:"0 0 20px", fontFamily:"'Space Mono',monospace" }}>Seguridad de cuenta</p>
              <div style={{ display:"flex", flexDirection:"column", gap:"14px", maxWidth:"400px", marginBottom:"24px" }}>
                {[
                  { key:"current", label:"Contraseña actual" },
                  { key:"newPw",   label:"Nueva contraseña"  },
                  { key:"confirm", label:"Confirmar contraseña" },
                ].map((f)=>(
                  <div key={f.key} style={{ position:"relative" }}>
                    <label style={{ display:"block", color:"#6b6b8a", fontSize:"10px", fontFamily:"'Space Mono',monospace", marginBottom:"7px", letterSpacing:"1px", textTransform:"uppercase" }}>{f.label}</label>
                    <input type={showPw?"text":"password"} placeholder="••••••••"
                      value={passwords[f.key]}
                      onChange={e=>setPasswords({...passwords,[f.key]:e.target.value})}
                      style={{ width:"100%", background:"#080810", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"11px", padding:"13px 40px 13px 15px", color:"#fff", fontSize:"14px", fontFamily:"'Syne',sans-serif" }} />
                    {f.key==="newPw" && (
                      <button onClick={()=>setShowPw(!showPw)} style={{ position:"absolute", right:"14px", bottom:"13px", background:"none", border:"none", color:"#4a4a6a", fontSize:"11px", cursor:"pointer", fontFamily:"'Space Mono',monospace" }}>
                        {showPw?"ocultar":"mostrar"}
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button className="btn-save" onClick={changePassword} disabled={saving}
                style={{ padding:"12px 28px", background:"linear-gradient(135deg,#8a2be2,#d400ff)", border:"none", borderRadius:"12px", color:"#fff", fontSize:"13px", fontWeight:700, fontFamily:"'Syne',sans-serif", opacity:saving?0.6:1 }}>
                {saving ? "Actualizando..." : "Actualizar contraseña"}
              </button>
              <div style={{ marginTop:"32px", paddingTop:"24px", borderTop:"1px solid rgba(255,255,255,0.06)" }}>
                <p style={{ color:"#4a4a6a", fontSize:"10px", letterSpacing:"2px", textTransform:"uppercase", margin:"0 0 14px", fontFamily:"'Space Mono',monospace" }}>Zona de peligro</p>
                <button style={{ padding:"10px 20px", background:"transparent", border:"1px solid rgba(255,56,86,0.3)", borderRadius:"10px", color:"#ff3860", fontSize:"12px", fontFamily:"'Space Mono',monospace", cursor:"pointer" }}>
                  ⊗ Eliminar cuenta
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
