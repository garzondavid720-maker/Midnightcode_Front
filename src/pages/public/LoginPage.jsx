// src/pages/public/LoginPage.jsx
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { roleRedirect } from '../../utils/roleUtils';
import AuthLayout from '../../components/Auth/AuthLayout';
import AuthCard from '../../components/Auth/AuthCard';
import FormInput from '../../components/Auth/FormInput';
import GoogleButton from '../../components/Auth/GoogleButton';
import TestCredentials from '../../components/Auth/TestCredentials';
import AuthFooter from '../../components/Auth/AuthFooter';

const schema = yup.object({
  email: yup.string().email('Correo inválido').required('El correo es requerido'),
  password: yup.string().min(6, 'Mínimo 6 caracteres').required('La contraseña es requerida'),
});

export default function LoginPage() {
  const { login, googleLogin, authError, clearError, loading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated && user) {
      const from = location.state?.from?.pathname || '/';
      navigate(from || roleRedirect(user.role), { replace: true });
    }
  }, [isAuthenticated, user, navigate, location]);

  const onSubmit = async (data) => {
    clearError();
    const result = await login({ email: data.email, password: data.password });
    if (result.success) {
      // Guardar en localStorage (el contexto ya debería hacerlo, pero por si acaso)
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
      const from = location.state?.from?.pathname || '/';
      navigate(from || roleRedirect(result.role), { replace: true });
    }
  };

  const handleGoogleSuccess = async (credential) => {
    clearError();
    const result = await googleLogin(credential);
    if (result.success) {
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
      navigate(roleRedirect(result.role), { replace: true });
    }
  };

  const fillTestCredentials = (email, password) => {
    setValue('email', email);
    setValue('password', password);
    setTimeout(() => handleSubmit(onSubmit)(), 100);
  };

  const leftContent = (
    <>
      <div className="mb-8 flex items-center gap-4 text-white">
        <div className="size-12 text-primary">
          <svg viewBox="0 0 48 48">
            <path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z" fill="currentColor"/>
          </svg>
        </div>
        <h1 className="text-6xl font-bold tracking-[-0.05em]">NOCTURNA</h1>
      </div>
      <p className="text-slate-400 text-xl max-w-md leading-relaxed">
        Step into a world where the music never stops and the night is always young.
      </p>
      <div className="mt-16 flex gap-3">
        {[70,45,85,30,95,55,40,75,60,50,80,35].map((h, i) => (
          <div key={i}
            className="w-1.5 rounded-full bar-anim"
            style={{
              height: `${h}px`,
              background: i % 3 === 0 ? '#BF00FF' : i % 3 === 1 ? '#FF00FF' : 'rgba(255,255,255,0.3)',
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>
    </>
  );

  return (
    <AuthLayout leftContent={leftContent}>
      <AuthCard
        title="Bienvenido de nuevo"
        subtitle="Ingresa tus credenciales para acceder al portal."
        error={authError}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <FormInput
            label="Correo electrónico"
            name="email"
            type="email"
            placeholder="nombre@club.com"
            register={register}
            error={errors.email}
            icon="mail"
            required
          />
          <FormInput
            label="Contraseña"
            name="password"
            type="password"
            placeholder="••••••••"
            register={register}
            error={errors.password}
            icon="lock"
            required
          />
          <div className="text-right">
            <Link to="/forgot-password" className="text-xs text-primary hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 disabled:opacity-60 text-white font-bold py-4 rounded-lg shadow-lg neon-glow flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            {loading ? 'Ingresando...' : 'Entrar'}
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </form>

        <div className="my-6 flex items-center gap-4">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-slate-500 text-xs uppercase tracking-widest">o continúa con</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <GoogleButton onSuccess={handleGoogleSuccess} buttonType="continue_with" />

        <TestCredentials onFill={fillTestCredentials} />

        <div className="mt-8 text-center text-sm text-slate-500">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="text-primary font-bold hover:underline">
            Regístrate
          </Link>
        </div>
      </AuthCard>
      <AuthFooter />
    </AuthLayout>
  );
}