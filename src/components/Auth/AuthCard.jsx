// src/components/Auth/AuthCard.jsx
import React from 'react';

export default function AuthCard({
  title,
  subtitle,
  error,
  children,
  footer,
}) {
  return (
    <div className="w-full max-w-md glass-panel p-8 sm:p-10 rounded-xl shadow-2xl relative overflow-hidden">
      <div className="absolute -top-10 -right-10 size-40 bg-primary/20 blur-3xl rounded-full pointer-events-none" />
      <div className="relative z-10">
        <h2 className="text-3xl font-bold text-white mb-2">{title}</h2>
        <p className="text-slate-400 mb-8">{subtitle}</p>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-start gap-3">
            <span className="material-symbols-outlined text-lg mt-0.5">error</span>
            <p>{error}</p>
          </div>
        )}

        {children}

        {footer && <div className="mt-6">{footer}</div>}
      </div>
    </div>
  );
}