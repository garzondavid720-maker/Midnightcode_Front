// src/pages/public/SignupPage.jsx
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { roleRedirect } from '../../utils/roleUtils';
import AuthLayout from '../../components/Auth/AuthLayout';
import AuthCard from '../../components/Auth/AuthCard';
import FormInput from '../../components/Auth/FormInput';
import PasswordStrength from '../../components/Auth/PasswordStrength';
import GoogleButton from '../../components/Auth/GoogleButton';
import AuthFooter from '../../components/Auth/AuthFooter';

const schema = yup.object({
  docId: yup.number()
    .typeError('Debe ser un número')
    .positive('Debe ser un número positivo')
    .integer('Debe ser un número entero')
    .required('El documento de identidad es requerido'),
  name: yup.string().min(2, 'Mínimo 2 caracteres').required('El nombre es requerido'),
  email: yup.string().email('Correo inválido').required('El correo es requerido'),
  password: yup.string().min(6, 'Mínimo 6 caracteres').required('La contraseña es requerida'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'Las contraseñas no coinciden')
    .required('Confirma tu contraseña'),
  terms: yup.boolean().oneOf([true], 'Debes aceptar los términos'),
});

export default function RegisterPage() {
  const { register: authRegister, googleLogin, authError, clearError, loading } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const password = watch('password', '');

  const onSubmit = async (data) => {
    clearError();
    const result = await authRegister({
      docId: data.docId,
      name: data.name,
      email: data.email,
      password: data.password,
    });
    if (result.success) {
      navigate(roleRedirect(result.role), { replace: true });
    }
  };

  const handleGoogleSuccess = async (credential) => {
    clearError();
    const result = await googleLogin(credential);
    if (result.success) {
      navigate(roleRedirect(result.role), { replace: true });
    }
  };

  const leftContent = (
    <>
      <div className="flex items-center gap-3 mb-12">
        <span className="material-symbols-outlined text-primary text-4xl">diamond</span>
        <span className="text-3xl font-bold uppercase">Elite Nightlife</span>
      </div>
      <h1 className="text-6xl xl:text-8xl font-black leading-none tracking-tight mb-6 uppercase">
        Únete a la <br />
        <span className="text-primary text-glow">Élite</span>
      </h1>
      <p className="text-xl text-slate-400 font-medium max-w-sm mb-8">
        Acceso exclusivo a los mejores eventos y experiencias VIP de la ciudad.
      </p>
      <div className="flex items-center gap-4 text-slate-400">
        <div className="flex -space-x-3">
          {[3, 5, 7].map((n) => (
            <img key={n} className="size-10 rounded-full border-2 border-background-dark" src={`https://i.pravatar.cc/100?img=${n}`} alt="" />
          ))}
        </div>
        <span className="text-sm font-medium">+2,000 miembros esta semana</span>
      </div>
    </>
  );

  return (
    <AuthLayout leftContent={leftContent}>
      <AuthCard
        title="Crear cuenta"
        subtitle="Ingresa tus datos para solicitar tu pase digital."
        error={authError}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <FormInput
            label="Documento de identidad"
            name="docId"
            type="number"
            placeholder="1234567890"
            register={register}
            error={errors.docId}
            icon="badge"
            required
          />
          <FormInput
            label="Nombre completo"
            name="name"
            type="text"
            placeholder="John Doe"
            register={register}
            error={errors.name}
            icon="person"
            required
          />
          <FormInput
            label="Correo electrónico"
            name="email"
            type="email"
            placeholder="nombre@ejemplo.com"
            register={register}
            error={errors.email}
            icon="mail"
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Contraseña"
              name="password"
              type="password"
              placeholder="••••••"
              register={register}
              error={errors.password}
              icon="lock"
              required
            />
            <FormInput
              label="Confirmar"
              name="confirmPassword"
              type="password"
              placeholder="••••••"
              register={register}
              error={errors.confirmPassword}
              required
            />
          </div>
          <PasswordStrength password={password} />

          <div className="flex items-start gap-2 pt-2">
            <input
              type="checkbox"
              {...register('terms')}
              className="size-4 rounded border-primary/30 bg-primary/10 text-primary mt-0.5"
            />
            <label className="text-xs text-slate-400">
              Acepto los{' '}
              <a href="#" className="text-primary hover:underline">Términos de Servicio</a>
              {' '}y la{' '}
              <a href="#" className="text-primary hover:underline">Política de Privacidad</a>
            </label>
          </div>
          {errors.terms && <p className="text-red-400 text-xs">{errors.terms.message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 disabled:opacity-60 text-white font-bold py-4 rounded-xl neon-glow flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            {loading ? 'Creando cuenta...' : 'Obtener mi Pase'}
          </button>
        </form>

        <div className="my-6 flex items-center gap-4">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-slate-500 text-xs uppercase tracking-widest">o regístrate con</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <GoogleButton onSuccess={handleGoogleSuccess} buttonType="signup" />

        <div className="mt-6 text-center text-sm text-slate-400">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-primary font-bold hover:underline">
            Inicia sesión
          </Link>
        </div>
      </AuthCard>
      <AuthFooter />
    </AuthLayout>
  );
}