import { useState } from "react"

export default function PasswordInput({ label, name, register, error }) {

  const [show,setShow] = useState(false)

  return (

    <div className="space-y-2">

      <label className="text-sm text-slate-300">
        {label}
      </label>

      <div className="relative">

        <input
          type={show ? "text":"password"}
          {...register(name)}
          placeholder="••••••••"
          className="w-full pl-4 pr-12 py-4 rounded-lg bg-background-dark/50 border border-primary/30 text-white"
        />

        <button
          type="button"
          onClick={()=>setShow(!show)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
        >
          <span className="material-symbols-outlined">
            visibility
          </span>
        </button>

      </div>

      {error && (
        <p className="text-red-400 text-xs">
          {error.message}
        </p>
      )}

    </div>

  )
}
