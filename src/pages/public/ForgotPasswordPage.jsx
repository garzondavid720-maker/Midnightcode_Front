// src/pages/public/ForgotPasswordPage.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { authService } from '../../services/authService';
import AuthLayout from '../../components/Auth/AuthLayout';
import AuthCard from '../../components/Auth/AuthCard';
import FormInput from '../../components/Auth/FormInput';
import AuthFooter from '../../components/Auth/AuthFooter';

const schema = yup.object({
  email: yup.string().email('Correo inválido').required('El correo es requerido'),
});

const IS_DEV = import.meta.env.DEV;

export default function ForgotPassword() {
  const [status, setStatus] = useState(null); // 'success' | 'error'
  const [message, setMessage] = useState('');
  const [devResetLink, setDevResetLink] = useState(null);
  const [devPreview, setDevPreview] = useState(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    setStatus(null);
    setMessage('');
    setDevResetLink(null);
    setDevPreview(null);
    try {
      const res = await authService.forgotPassword(data.email);
      setStatus('success');
      setMessage('Si el correo existe, recibirás un enlace de recuperación en tu bandeja.');
      if (res.devResetLink) setDevResetLink(res.devResetLink);
      if (res.devEmailPreview) setDevPreview(res.devEmailPreview);
    } catch (err) {
      setStatus('error');
      setMessage(err.message || 'No se pudo enviar el correo. Intenta de nuevo.');
    }
  };

  const leftContent = (
    <>
      <div className="flex items-center gap-3 text-primary">
        <span className="material-symbols-outlined text-5xl">auto_awesome</span>
        <h1 className="text-4xl font-bold tracking-tighter uppercase">Nocturna</h1>
      </div>
      <p className="text-slate-300 text-xl max-w-md font-light leading-relaxed mt-6">
        Reconéctate con el ritmo. Recupera tu acceso a los mejores beats de la ciudad.
      </p>
    </>
  );

  return (
    <AuthLayout leftContent={leftContent}>
      <AuthCard
        title="¿Olvidaste tu contraseña?"
        subtitle="Ingresa tu correo y te enviaremos un enlace para recuperarla."
        error={status === 'error' ? message : null}
      >
        {status === 'success' && (
          <div className="mb-6 space-y-3">
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm flex items-start gap-3">
              <span className="material-symbols-outlined text-lg mt-0.5">check_circle</span>
              <p>{message}</p>
            </div>
            {IS_DEV && devResetLink && (
              <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-xs space-y-2">
                <p className="font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">bug_report</span>
                  Modo DEV — Link de reseteo:
                </p>
                <a href={devResetLink} className="block underline break-all hover:text-yellow-200 transition-colors">
                  {devResetLink}
                </a>
                {devPreview && (
                  <>
                    <p className="font-bold flex items-center gap-1 pt-1">
                      <span className="material-symbols-outlined text-sm">mail</span>
                      Vista previa del email (Ethereal):
                    </p>
                    <a href={devPreview} target="_blank" rel="noreferrer" className="block underline break-all hover:text-yellow-200 transition-colors">
                      {devPreview}
                    </a>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormInput
            label="Correo electrónico"
            name="email"
            type="email"
            placeholder="tu@correo.com"
            register={register}
            error={errors.email}
            icon="mail"
            required
          />
          <button
            type="submit"
            disabled={isSubmitting || status === 'success'}
            className="w-full bg-primary hover:bg-primary/90 disabled:opacity-60 text-white font-bold py-4 rounded-xl shadow-lg neon-glow transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <span>{isSubmitting ? 'Enviando...' : 'Enviar enlace de recuperación'}</span>
            <span className="material-symbols-outlined text-xl">{isSubmitting ? 'hourglass_empty' : 'send'}</span>
          </button>
        </form>

        <div className="mt-8 p-5 rounded-xl glass-panel">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-primary text-lg mt-0.5">info</span>
            <p className="text-sm text-slate-400 leading-relaxed">
              Si no ves el correo en 5 minutos, revisa tu carpeta de spam.
              El enlace es válido por <strong className="text-white">1 hora</strong>.
            </p>
          </div>
        </div>

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