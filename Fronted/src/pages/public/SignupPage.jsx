import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, roleRedirect } from "../../context/AuthContext";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const schema = yup.object({
  docId:           yup.number()
    .typeError("Debe ser un número")
    .positive("Debe ser un número positivo")
    .integer("Debe ser un número entero")
    .required("El documento de identidad es requerido"),
  name:            yup.string().min(2, "Mínimo 2 caracteres").required("El nombre es requerido"),
  email:           yup.string().email("Correo inválido").required("El correo es requerido"),
  password:        yup.string().min(6, "Mínimo 6 caracteres").required("La contraseña es requerida"),
  confirmPassword: yup.string()
    .oneOf([yup.ref("password")], "Las contraseñas no coinciden")
    .required("Confirma tu contraseña"),
  terms:           yup.boolean().oneOf([true], "Debes aceptar los términos"),
});

export default function RegisterPage() {
  const [showPass, setShowPass] = useState(false);
  const { register: authRegister, googleLogin, authError, clearError, loading } = useAuth();
  const navigate      = useNavigate();
  const googleBtnRef  = useRef(null);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    clearError();
    const result = await authRegister({
      docId:    data.docId,
      name:     data.name,
      email:    data.email,
      password: data.password,
    });
    if (result.success) {
      navigate(roleRedirect(result.role), { replace: true });
    }
  };

  // ── Google Identity Services ─────────────────────────────────────────────
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !window.google) return;
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback:  handleGoogleCallback,
    });
    if (googleBtnRef.current) {
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme:  "filled_black",
        size:   "large",
        width:  400,
        text:   "signup_with",
        locale: "es",
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGoogleCallback = async (response) => {
    clearError();
    const result = await googleLogin(response.credential);
    if (result.success) {
      navigate(roleRedirect(result.role), { replace: true });
    }
  };

  return (
    <div className="relative flex min-h-screen w-full overflow-hidden bg-background-dark text-slate-100 font-display">

      {/* LEFT SIDE */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-center items-center px-12 overflow-hidden border-r border-primary/10">
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-primary/20 via-transparent to-black" />
        <div className="relative z-10 flex flex-col items-start max-w-md">
          <div className="flex items-center gap-3 mb-12">
            <span className="material-symbols-outlined text-primary text-4xl">diamond</span>
            <span className="text-3xl font-bold uppercase">Elite Nightlife</span>
          </div>
          <h1 className="text-6xl xl:text-8xl font-black leading-none tracking-tight mb-6 uppercase">
            Únete a la <br />
            <span className="text-primary text-glow">Élite</span>
          </h1>
          <p className="text-xl text-slate-400 font-medium max-w-sm mb-8">
            Acceso exclusivo a los mejores eventos y experiencias VIP de la ciudad.
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <div className="flex -space-x-3">
              {[3, 5, 7].map((n) => (
                <img key={n} className="size-10 rounded-full border-2 border-background-dark" src={`https://i.pravatar.cc/100?img=${n}`} alt="" />
              ))}
            </div>
            <span className="text-sm font-medium">+2,000 miembros esta semana</span>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-3xl">diamond</span>
              <span className="text-2xl font-bold uppercase">Elite</span>
            </div>
          </div>

          <div className="glass p-8 sm:p-10 rounded-xl shadow-2xl relative overflow-hidden">
            <div className="absolute -top-10 -right-10 size-40 bg-primary/20 blur-3xl rounded-full" />
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-2">Crear cuenta</h2>
              <p className="text-slate-400 mb-8">Ingresa tus datos para solicitar tu pase digital.</p>

              {authError && (
                <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  {authError}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                {/* Documento de identidad */}
                <div className="space-y-2">
                  <label className="text-sm text-slate-300 ml-1">Documento de identidad</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">badge</span>
                    <input
                      type="number"
                      placeholder="1234567890"
                      {...register("docId")}
                      className="w-full pl-12 pr-4 py-4 bg-primary/5 border border-primary/20 rounded-xl text-slate-100 placeholder:text-slate-600 outline-none"
                    />
                  </div>
                  {errors.docId && <p className="text-red-400 text-xs">{errors.docId.message}</p>}
                </div>

                {/* Nombre */}
                <div className="space-y-2">
                  <label className="text-sm text-slate-300 ml-1">Nombre completo</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">person</span>
                    <input
                      type="text"
                      placeholder="John Doe"
                      {...register("name")}
                      className="w-full pl-12 pr-4 py-4 bg-primary/5 border border-primary/20 rounded-xl text-slate-100 placeholder:text-slate-600 outline-none"
                    />
                  </div>
                  {errors.name && <p className="text-red-400 text-xs">{errors.name.message}</p>}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-sm text-slate-300 ml-1">Correo electrónico</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">mail</span>
                    <input
                      type="email"
                      placeholder="nombre@ejemplo.com"
                      {...register("email")}
                      className="w-full pl-12 pr-4 py-4 bg-primary/5 border border-primary/20 rounded-xl text-slate-100 placeholder:text-slate-600 outline-none"
                    />
                  </div>
                  {errors.email && <p className="text-red-400 text-xs">{errors.email.message}</p>}
                </div>

                {/* Passwords */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-slate-300 ml-1">Contraseña</label>
                    <div className="relative">
                      <input
                        type={showPass ? "text" : "password"}
                        placeholder="••••••"
                        {...register("password")}
                        className="w-full px-4 py-4 bg-primary/5 border border-primary/20 rounded-xl text-slate-100 outline-none pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-primary"
                      >
                        <span className="material-symbols-outlined text-sm">
                          {showPass ? "visibility_off" : "visibility"}
                        </span>
                      </button>
                    </div>
                    {errors.password && <p className="text-red-400 text-xs">{errors.password.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-slate-300 ml-1">Confirmar</label>
                    <input
                      type="password"
                      placeholder="••••••"
                      {...register("confirmPassword")}
                      className="w-full px-4 py-4 bg-primary/5 border border-primary/20 rounded-xl text-slate-100 outline-none"
                    />
                    {errors.confirmPassword && <p className="text-red-400 text-xs">{errors.confirmPassword.message}</p>}
                  </div>
                </div>

                {/* Términos */}
                <div className="flex items-start gap-2 pt-2">
                  <input
                    type="checkbox"
                    {...register("terms")}
                    className="size-4 rounded border-primary/30 bg-primary/10 text-primary mt-0.5"
                  />
                  <label className="text-xs text-slate-400">
                    Acepto los{" "}
                    <a href="#" className="text-primary hover:underline">Términos de Servicio</a>
                    {" "}y la{" "}
                    <a href="#" className="text-primary hover:underline">Política de Privacidad</a>
                  </label>
                </div>
                {errors.terms && <p className="text-red-400 text-xs">{errors.terms.message}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary/90 disabled:opacity-60 text-white font-bold py-4 rounded-xl neon-glow flex items-center justify-center gap-2"
                >
                  {loading ? "Creando cuenta..." : "Obtener mi Pase"}
                </button>

              </form>

              {/* Divider */}
              <div className="my-6 flex items-center gap-4">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-slate-500 text-xs uppercase tracking-widest">o regístrate con</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {/* Google Sign-Up button */}
              {GOOGLE_CLIENT_ID ? (
                <div ref={googleBtnRef} className="flex justify-center" />
              ) : (
                <div className="flex items-center justify-center gap-3 w-full py-3.5 rounded-xl border border-white/10 bg-white/5 text-slate-500 text-sm cursor-not-allowed opacity-50">
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Registrarse con Google (configura VITE_GOOGLE_CLIENT_ID)
                </div>
              )}

              <p className="mt-6 text-center text-sm text-slate-400">
                ¿Ya tienes cuenta?{" "}
                <Link to="/login" className="text-primary font-bold hover:underline">
                  Inicia sesión
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
