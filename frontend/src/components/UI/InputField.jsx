export default function InputField({
  label,
  icon,
  register,
  name,
  placeholder,
  type = "text",
  error
}) {
  return (
    <div className="space-y-2">

      <label className="text-sm text-slate-300">
        {label}
      </label>

      <div className="relative">

        {icon && (
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </span>
        )}

        <input
          {...register(name)}
          type={type}
          placeholder={placeholder}
          className="w-full pl-12 pr-4 py-4 rounded-lg bg-background-dark/50 border border-primary/30 focus:ring-primary focus:border-primary outline-none text-white"
        />

      </div>

      {error && (
        <p className="text-red-400 text-xs">
          {error.message}
        </p>
      )}

    </div>
  )
}
