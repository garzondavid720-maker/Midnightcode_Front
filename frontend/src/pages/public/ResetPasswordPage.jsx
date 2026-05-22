import { useState } from "react"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { useSearchParams, useNavigate, Link } from "react-router-dom"
import { authService } from "../../services/authService"

/* ---------------- VALIDATION ---------------- */

const schema = yup.object({
  password: yup
    .string()
    .required("Password required")
    .min(12, "Minimum 12 characters")
    .matches(/[0-9]/, "Must contain a number")
    .matches(/[!@#$%^&*]/, "Must contain a symbol"),

  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Confirm your password"),
})

/* ---------------- PAGE ---------------- */

export default function ResetPasswordPage() {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-background-dark font-display">
      <LeftVisual />
      <div className="flex-1 flex items-center justify-center p-6 lg:p-20">
        <ResetForm />
      </div>
    </div>
  )
}

/* ---------------- LEFT VISUAL ---------------- */

function LeftVisual() {
  return (
    <div className="hidden lg:flex lg:w-1/2 relative bg-black items-center justify-center overflow-hidden">
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[100px]" />
      </div>
      <div className="relative z-10 flex flex-col items-center text-center p-12">
        <div className="mb-8 w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-purple-400 flex items-center justify-center shadow-[0_0_20px_rgba(127,13,242,0.5)]">
          <span className="material-symbols-outlined text-5xl text-white">flare</span>
        </div>
        <h1 className="text-6xl font-bold italic text-white">ECLIPSE</h1>
        <p className="text-primary tracking-[0.3em] uppercase">Nightlife redefined</p>
      </div>
      <div className="absolute bottom-10 left-10 text-slate-400 text-sm tracking-widest">
        EST. 2024 • PREMIUM EXPERIENCE
      </div>
    </div>
  )
}

/* ---------------- FORM ---------------- */

function ResetForm() {
  const [searchParams]     = useSearchParams()
  const navigate           = useNavigate()
  const [apiError, setApiError]   = useState(null)
  const [success,  setSuccess]    = useState(false)

  const token = searchParams.get("token")

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: yupResolver(schema)
  })

  const password = watch("password","")

  const onSubmit = async (data) => {
    setApiError(null)
    if (!token) {
      setApiError("El enlace de recuperación no es válido o ha expirado. Solicita uno nuevo.")
      return
    }
    try {
      await authService.resetPassword(token, data.password)
      setSuccess(true)
      setTimeout(() => navigate("/login"), 2500)
    } catch (err) {
      setApiError(err.message || "No se pudo restablecer la contraseña. Intenta de nuevo.")
    }
  }

  return (
    <div className="w-full max-w-md bg-[#191022]/60 backdrop-blur border border-primary/20 p-8 lg:p-10 rounded-xl">
      <div className="mb-10">
        <h2 className="text-3xl font-bold text-white mb-3">Reset Password</h2>
        <p className="text-slate-400">Secure your account with a new strong password.</p>
      </div>

      {success && (
        <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm flex items-start gap-3">
          <span className="material-symbols-outlined text-lg mt-0.5">check_circle</span>
          <p>Contraseña actualizada correctamente. Redirigiendo al login...</p>
        </div>
      )}

      {apiError && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-start gap-3">
          <span className="material-symbols-outlined text-lg mt-0.5">error</span>
          <p>{apiError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <PasswordInput label="New Password" name="password" register={register} error={errors.password} />
        <PasswordStrength password={password} />
        <PasswordInput label="Confirm Password" name="confirmPassword" register={register} error={errors.confirmPassword} />
        <button
          type="submit"
          disabled={isSubmitting || success}
          className="w-full bg-primary hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 rounded-lg transition transform hover:scale-[1.02]"
        >
          {isSubmitting ? "Actualizando..." : "Update Password"}
        </button>
      </form>

      <div className="mt-8 pt-8 border-t border-primary/10">
        <Link to="/login" className="text-sm text-slate-400 hover:text-white flex justify-center gap-2">
          <span className="material-symbols-outlined text-sm">keyboard_backspace</span>
          Back to login
        </Link>
      </div>
    </div>
  )
}

/* ---------------- PASSWORD INPUT ---------------- */

function PasswordInput({ label, name, register, error }) {
  const [show, setShow] = useState(false)
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-300">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          {...register(name)}
          placeholder="••••••••"
          className="w-full bg-background-dark/50 border border-primary/30 rounded-lg py-4 px-4 text-white focus:ring-2 focus:ring-primary outline-none"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-primary"
        >
          <span className="material-symbols-outlined">visibility</span>
        </button>
      </div>
      {error && <p className="text-xs text-red-400">{error.message}</p>}
    </div>
  )
}

/* ---------------- PASSWORD STRENGTH ---------------- */

function PasswordStrength({ password }) {
  const checks = [
    password.length >= 12,
    /[0-9]/.test(password),
    /[!@#$%^&*]/.test(password),
  ]
  const strength = checks.filter(Boolean).length
  const label = ["Weak", "Medium", "Strong", "Very Strong"][strength]
  return (
    <div className="space-y-3">
      <div className="flex justify-between text-xs uppercase">
        <span className="text-slate-400">Security Strength</span>
        <span className="text-primary">{label}</span>
      </div>
      <div className="flex gap-1.5 h-1.5 w-full">
        {[0,1,2,3].map((i) => (
          <div
            key={i}
            className={`flex-1 rounded-full ${i <= strength ? "bg-primary shadow-[0_0_10px_rgba(127,13,242,0.6)]" : "bg-primary/20"}`}
          />
        ))}
      </div>
      <p className="text-[10px] text-slate-500">Include at least 12 characters, a symbol, and a number.</p>
    </div>
  )
}
