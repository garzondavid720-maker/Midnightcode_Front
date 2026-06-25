import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import "./assets/css/style.css";

// Auth guards
import PrivateRoute from "./components/Auth/PrivateRoute";
import PublicRoute from "./components/Auth/PublicRoute";

// Public pages
const HomePage = lazy(() => import("./pages/public/Home"));
const LoginPage = lazy(() => import("./pages/public/LoginPage"));
const RegisterPage = lazy(() => import("./pages/public/SignupPage"));
const ForgotPassword = lazy(() => import("./pages/public/ForgotPasswordPage"));
const ResetPassword = lazy(() => import("./pages/public/ResetPasswordPage"));

// Admin
const Overview = lazy(() => import("./pages/Private/Admin/Overview"));
const AdminReservas = lazy(() => import("./pages/Private/Admin/Reservas"));
const AdminHorarios = lazy(() => import("./pages/Private/Admin/horario"));
const AdminUsuarios = lazy(() => import("./pages/Private/Admin/usuarios"));
const AdminVentas = lazy(() => import("./pages/Private/Admin/ventas"));
const AdminProductos = lazy(() => import("./pages/Private/Admin/productos"));
const AdminEventos = lazy(() => import("./pages/Private/Admin/eventos"));
const Canciones = lazy(() => import("./pages/Private/Admin/canciones"));

// User
const HomePageUser = lazy(() => import("./pages/Private/User/dashboard"));
const UserCanciones = lazy(() => import("./pages/Private/User/userCancion"));
const UserReservas = lazy(() => import("./pages/Private/User/reserva"));
const UserEventos = lazy(() => import("./pages/Private/User/eventos"));
const UserMenu = lazy(() => import("./pages/Private/User/menu"));

// DJ
const DjCanciones = lazy(() => import("./pages/Private/DJ/DJPanel"));

// Employee
const EmpleadoHorarios = lazy(() => import("./pages/Private/Employee/EmployeeDashboard"));
const EmpleadoVentas = lazy(() => import("./pages/Private/Employee/ventas"));
const EmpleadoProductos = lazy(() => import("./pages/Private/Employee/inventario"));

function App() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            background: "#080810",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "3px solid #c084fc",
              borderTopColor: "transparent",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />
        </div>
      }
    >
      <Routes>
        {/* ── Públicas ── */}
        <Route path="/" element={<HomePage />} />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <PublicRoute>
              <ResetPassword />
            </PublicRoute>
          }
        />

        {/* ── Admin ── */}
        <Route
          path="/admin"
          element={
            <PrivateRoute role="admin">
              <Overview />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/canciones"
          element={
            <PrivateRoute role="admin">
              <Canciones />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/reservas"
          element={
            <PrivateRoute role="admin">
              <AdminReservas />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/horarios"
          element={
            <PrivateRoute role="admin">
              <AdminHorarios />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/usuarios"
          element={
            <PrivateRoute role="admin">
              <AdminUsuarios />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/ventas"
          element={
            <PrivateRoute role="admin">
              <AdminVentas />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/productos"
          element={
            <PrivateRoute role="admin">
              <AdminProductos />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/eventos"
          element={
            <PrivateRoute role="admin">
              <AdminEventos />
            </PrivateRoute>
          }
        />

        {/* ── Usuario ── */}
        <Route
          path="/usuario"
          element={
            <PrivateRoute role="usuario">
              <HomePageUser />
            </PrivateRoute>
          }
        />
        <Route
          path="/usuario/cancion"
          element={
            <PrivateRoute role="usuario">
              <UserCanciones />
            </PrivateRoute>
          }
        />
        <Route
          path="/usuario/reserva"
          element={
            <PrivateRoute role="usuario">
              <UserReservas />
            </PrivateRoute>
          }
        />
        <Route
          path="/usuario/evento"
          element={
            <PrivateRoute role="usuario">
              <UserEventos />
            </PrivateRoute>
          }
        />
        <Route
          path="/usuario/menu"
          element={
            <PrivateRoute role="usuario">
              <UserMenu />
            </PrivateRoute>
          }
        />

        {/* ── DJ ── */}
        <Route
          path="/dj"
          element={
            <PrivateRoute role="dj">
              <DjCanciones />
            </PrivateRoute>
          }
        />

        {/* ── Empleado ── */}
        <Route
          path="/empleado"
          element={
            <PrivateRoute role="empleado">
              <EmpleadoHorarios />
            </PrivateRoute>
          }
        />
        <Route
          path="/empleado/ventas"
          element={
            <PrivateRoute role="empleado">
              <EmpleadoVentas />
            </PrivateRoute>
          }
        />
        <Route
          path="/empleado/inventario"
          element={
            <PrivateRoute role="empleado">
              <EmpleadoProductos />
            </PrivateRoute>
          }
        />

        {/* 404 */}
        <Route
          path="*"
          element={
            <div
              style={{
                minHeight: "100vh",
                background: "#080810",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: "16px",
                fontFamily: "'Syne',sans-serif",
                color: "#fff",
              }}
            >
              <p style={{ fontSize: "80px", margin: 0, color: "#c084fc" }}>404</p>
              <p style={{ color: "#6b6b8a", fontSize: "18px" }}>Página no encontrada</p>
              <a href="/" style={{ color: "#c084fc", fontSize: "14px" }}>
                ← Volver al inicio
              </a>
            </div>
          }
        />
      </Routes>
    </Suspense>
  );
}

export default App;