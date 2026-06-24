// src/components/Auth/PasswordStrength.jsx
import React from 'react';

export default function PasswordStrength({ password }) {
  const checks = [
    password.length >= 12,
    /[0-9]/.test(password),
    /[!@#$%^&*]/.test(password),
  ];
  const strength = checks.filter(Boolean).length;
  const label = ['Débil', 'Media', 'Fuerte', 'Muy fuerte'][strength] || '';

  return (
    <div className="space-y-3">
      <div className="flex justify-between text-xs uppercase">
        <span className="text-slate-400">Seguridad</span>
        <span className="text-primary">{label}</span>
      </div>
      <div className="flex gap-1.5 h-1.5 w-full">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`flex-1 rounded-full ${
              i < strength ? 'bg-primary shadow-[0_0_10px_rgba(127,13,242,0.6)]' : 'bg-primary/20'
            }`}
          />
        ))}
      </div>
      <p className="text-[10px] text-slate-500">
        Mínimo 12 caracteres, incluye un número y un símbolo.
      </p>
    </div>
  );
}