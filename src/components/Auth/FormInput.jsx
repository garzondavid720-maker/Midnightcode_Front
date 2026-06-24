// src/components/Auth/FormInput.jsx
import React, { useState } from 'react';

export default function FormInput({
  label,
  name,
  type = 'text',
  placeholder,
  register,
  error,
  icon = null,
  required = false,
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className="space-y-2">
      <label className="text-sm text-slate-300 ml-1">
        {label} {required && <span className="text-primary">*</span>}
      </label>
      <div className="relative group">
        {icon && (
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">
            {icon}
          </span>
        )}
        <input
          type={isPassword ? (show ? 'text' : 'password') : type}
          placeholder={placeholder}
          {...register(name)}
          className="w-full bg-primary/5 border border-primary/20 rounded-xl py-4 pl-12 pr-12 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-sm">
              {show ? 'visibility_off' : 'visibility'}
            </span>
          </button>
        )}
      </div>
      {error && <p className="text-red-400 text-xs">{error.message}</p>}
    </div>
  );
}