// src/components/Auth/AuthFooter.jsx
import React from 'react';

export default function AuthFooter() {
  return (
    <footer className="absolute bottom-8 text-xs text-slate-500 flex gap-6">
      <a href="#" className="hover:text-primary transition-colors">Privacidad</a>
      <a href="#" className="hover:text-primary transition-colors">Términos</a>
    </footer>
  );
}