// src/pages/public/ResetPasswordPage.jsx
import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { authService } from '../../../src/services/authService';
import AuthLayout from '../../components/Auth/AuthLayout';
import AuthCard from '../../components/Auth/AuthCard';
import FormInput from '../../components/Auth/FormInput';
import PasswordStrength from '../../components/Auth/PasswordStrength';
import AuthFooter from '../../components/Auth/AuthFooter';

const schema = yup.object({
  password: yup.string()
    .required('Contraseña requerida')
    .min(12, 'Mínimo 12 caracteres')
    .matches(/[0-9]/, 'Debe contener un número')
    .matches(/[!@#$%^&*]/, 'Debe contener un símbolo'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'Las contraseñas deben coincidir')
    .required('Confirma tu contraseña'),
});

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState(null);
  const [success, setSuccess] = useState(false);

  const token = searchParams.get('token');

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
  });

  const password = watch('password', '');

  const onSubmit = async (data) => {
    setApiError(null);
    if (!token) {
      setApiError('El enlace de recuperación no es válido o ha expirado. Solicita uno nuevo.');
      return;
    }
    try {
      await authService.resetPassword(token, data.password);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setApiError(err.message || 'No se pudo restablecer la contraseña. Intenta de nuevo.');
    }
  };

  const leftContent = (
    <>
      <div className="mb-8 w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-purple-400 flex items-center justify-center shadow-[0_0_20px_rgba(127,13,242,0.5)]">
        <span className="material-symbols-outlined text-5xl text-white">flare</span>
      </div>
      <h1 className="text-6xl font-bold italic text-white">ECLIPSE</h1>
      <p className="text-primary tracking-[0.3em] uppercase">Nightlife redefined</p>
    </>
  );

  return (
    <AuthLayout leftContent={leftContent}>
      <AuthCard
        title="Restablecer contraseña"
        subtitle="Asegura tu cuenta con una nueva contraseña fuerte."
        error={apiError}
      >
        {success && (
          <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm flex items-start gap-3">
            <span className="material-symbols-outlined text-lg mt-0.5">check_circle</span>
            <p>Contraseña actualizada correctamente. Redirigiendo al login...</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormInput
            label="Nueva contraseña"
            name="password"
            type="password"
            placeholder="••••••••••••"
            register={register}
            error={errors.password}
            icon="lock"
            required
          />
          <PasswordStrength password={password} />
          <FormInput
            label="Confirmar contraseña"
            name="confirmPassword"
            type="password"
            placeholder="••••••••••••"
            register={register}
            error={errors.confirmPassword}
            required
          />
          <button
            type="submit"
            disabled={isSubmitting || success}
            className="w-full bg-primary hover:bg-primary/90 disabled:opacity-60 text-white font-bold py-4 rounded-lg transition-all active:scale-[0.98]"
          >
            {isSubmitting ? 'Actualizando...' : 'Actualizar contraseña'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm text-slate-400 hover:text-white flex justify-center gap-2">
            <span className="material-symbols-outlined text-sm">keyboard_backspace</span>
            Volver al login
          </Link>
        </div>
      </AuthCard>
      <AuthFooter />
    </AuthLayout>
  );
}