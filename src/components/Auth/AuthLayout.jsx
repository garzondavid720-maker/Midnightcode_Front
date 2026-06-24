// src/components/Auth/AuthLayout.jsx
import React from 'react';

export default function AuthLayout({ children, leftContent }) {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen w-full overflow-hidden bg-background-dark">
      {/* Panel izquierdo (visual) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-background-dark items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary/10" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]" />
        </div>
        <div className="relative z-10 flex flex-col items-center text-center px-12">
          {leftContent}
        </div>
      </div>

      {/* Panel derecho (formulario) */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 lg:p-24 relative bg-background-light dark:bg-background-dark">
        {children}
      </div>
    </div>
  );
}