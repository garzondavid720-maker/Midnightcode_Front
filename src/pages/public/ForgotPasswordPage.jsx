import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { authService } from "../../services/authService";

const schema = yup.object({
  email: yup.string().email("Correo inválido").required("El correo es requerido"),
});

const IS_DEV = import.meta.env.DEV;

export default function ForgotPassword() {
  const [status,       setStatus]       = useState(null);  // 'success' | 'error'
  const [message,      setMessage]      = useState("");
  const [devResetLink, setDevResetLink] = useState(null);
  const [devPreview,   setDevPreview]   = useState(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    setStatus(null);
    setMessage("");
    setDevResetLink(null);
    setDevPreview(null);
    try {
      const res = await authService.forgotPassword(data.email);
      setStatus("success");
      setMessage("Si el correo existe, recibirás un enlace de recuperación en tu bandeja.");
      // En modo dev el backend devuelve el link y la vista previa de Ethereal
      if (res.devResetLink)    setDevResetLink(res.devResetLink);
      if (res.devEmailPreview) setDevPreview(res.devEmailPreview);
    } catch (err) {
      setStatus("error");
      setMessage(err.message || "No se pudo enviar el correo. Intenta de nuevo.");
    }
  };

  return (
    <div className="bg-background-dark text-slate-100 min-h-screen flex items-center justify-center p-0 md:p-6 overflow-hidden">

      <div className="relative w-full max-w-6xl h-full md:h-[800px] flex flex-col md:flex-row overflow-hidden rounded-none md:rounded-xl shadow-2xl bg-background-dark">

        {/* LEFT PANEL */}
        <div className="hidden md:flex relative w-1/2 h-full overflow-hidden bg-background-dark">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-background-dark to-black z-10" />
          <div
            className="absolute inset-0 opacity-60 bg-cover bg-center"
            style={{ backgroundImage: "url(https://lh3.googleusercontent.com/aida-public/AB6AXuDbCWdIi07fC21qGp_MK1QdyOPX7qp3IFpLmjCvebBWP1Vv0hPDSuN-3hJWnV_KXqnE9ouzdC08xR8ZRau4vObp3TViedAgNuVbv2K4h1-fWFj5LIlyhmZCH3lHkAEJt9HOCPHDexasDVAPoYDjqqDOWPGomV09J148xNvOk-6Xfju4lcrVHYJ9g2i90B0dvCX9mDMbjRPtgu6vbTT7RdvJLEnaf-RVh-9k1Zwab5293K9zEDqq6-BHtEOMS3ZQA39sWC2eDcXX-rI)" }}
          />
          <div className="absolute inset-0 flex items-center justify-center z-20 p-12">
            <div className="space-y-6">
              <div className="flex items-center gap-3 text-primary">
                <span className="material-symbols-outlined text-5xl">auto_awesome</span>
                <h1 className="text-4xl font-bold tracking-tighter uppercase">Nocturna</h1>
              </div>
              <p className="text-slate-300 text-xl max-w-md font-light leading-relaxed">
                Reconéctate con el ritmo. Recupera tu acceso a los mejores beats de la ciudad.
              </p>
            </div>
          </div>
          <div className="absolute bottom-10 left-10 z-20 flex gap-4">
            <div className="w-12 h-1 bg-primary rounded-full" />
            <div className="w-12 h-1 bg-primary/20 rounded-full" />
            <div className="w-12 h-1 bg-primary/20 rounded-full" />
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-full md:w-1/2 h-full flex flex-col p-8 md:p-16 relative bg-background-dark">

          <header className="flex items-center justify-between mb-16">
            <div className="flex md:hidden items-center gap-2 text-primary">
              <span className="material-symbols-outlined text-3xl">auto_awesome</span>
              <span className="font-bold text-xl uppercase tracking-widest">Nocturna</span>
            </div>
            <Link to="/login" className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors group ml-auto">
              <span className="text-sm font-medium">Volver al login</span>
              <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </Link>
          </header>

          <main className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">

            <div className="mb-10">
              <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mb-6 border border-primary/20">
                <span className="material-symbols-outlined text-3xl text-primary">lock_reset</span>
              </div>
              <h2 className="text-4xl font-bold text-slate-100 mb-4 tracking-tight">¿Olvidaste tu contraseña?</h2>
              <p className="text-slate-400 text-lg">Ingresa tu correo y te enviaremos un enlace para recuperarla.</p>
            </div>

            {/* Success */}
            {status === "success" && (
              <div className="mb-6 space-y-3">
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm flex items-start gap-3">
                  <span className="material-symbols-outlined text-lg mt-0.5">check_circle</span>
                  <p>{message}</p>
                </div>

                {/* Modo DEV: mostrar link directo + vista previa Ethereal */}
                {IS_DEV && devResetLink && (
                  <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-xs space-y-2">
                    <p className="font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">bug_report</span>
                      Modo DEV — Link de reseteo:
                    </p>
                    <a
                      href={devResetLink}
                      className="block underline break-all hover:text-yellow-200 transition-colors"
                    >
                      {devResetLink}
                    </a>
                    {devPreview && (
                      <>
                        <p className="font-bold flex items-center gap-1 pt-1">
                          <span className="material-symbols-outlined text-sm">mail</span>
                          Vista previa del email (Ethereal):
                        </p>
                        <a
                          href={devPreview}
                          target="_blank"
                          rel="noreferrer"
                          className="block underline break-all hover:text-yellow-200 transition-colors"
                        >
                          {devPreview}
                        </a>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Error */}
            {status === "error" && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-start gap-3">
                <span className="material-symbols-outlined text-lg mt-0.5">error</span>
                <p>{message}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1">Correo electrónico</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">mail</span>
                  <input
                    type="email"
                    placeholder="tu@correo.com"
                    {...register("email")}
                    className="w-full bg-primary/5 border border-primary/20 rounded-xl py-4 pl-12 pr-4 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  />
                </div>
                {errors.email && <p className="text-red-400 text-sm">{errors.email.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || status === "success"}
                className="w-full bg-primary hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg neon-glow transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <span>{isSubmitting ? "Enviando..." : "Enviar enlace de recuperación"}</span>
                <span className="material-symbols-outlined text-xl">{isSubmitting ? "hourglass_empty" : "send"}</span>
              </button>
            </form>

            <div className="mt-10 p-5 rounded-xl glass-panel">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary text-lg mt-0.5">info</span>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Si no ves el correo en 5 minutos, revisa tu carpeta de spam.
                  El enlace es válido por <strong className="text-white">1 hora</strong>.
                </p>
              </div>
            </div>

          </main>

          <footer className="mt-auto pt-8 flex justify-center gap-6 text-slate-600 text-xs uppercase tracking-widest">
            <a className="hover:text-primary transition-colors cursor-pointer">Privacidad</a>
            <a className="hover:text-primary transition-colors cursor-pointer">Términos</a>
          </footer>

        </div>

        {/* Background glows */}
        <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[40%] w-[300px] h-[300px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      </div>

    </div>
  );
}
