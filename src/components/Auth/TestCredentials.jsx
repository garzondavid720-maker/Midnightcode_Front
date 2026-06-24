// src/components/Auth/TestCredentials.jsx
import React from 'react';

const TEST_USERS = [
  { label: 'Admin', email: 'admin@test.com', password: 'Admin123!' },
  { label: 'Empleado', email: 'empleado@test.com', password: 'Empleado123!' },
  { label: 'Usuario', email: 'usuario@test.com', password: 'Usuario123!' },
  { label: 'DJ', email: 'dj@test.com', password: 'DJ123!' },
];

export default function TestCredentials({ onFill }) {
  return (
    <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/20">
      <p className="text-xs text-slate-400 uppercase tracking-wider mb-3">🔑 Credenciales de prueba</p>
      <div className="flex flex-wrap gap-2">
        {TEST_USERS.map((user) => (
          <button
            key={user.label}
            type="button"
            onClick={() => onFill(user.email, user.password)}
            className="text-xs bg-white/5 hover:bg-primary/20 text-slate-300 px-3 py-1.5 rounded-full border border-white/10 transition-colors"
          >
            {user.label}
          </button>
        ))}
      </div>
    </div>
  );
}