import { Routes, Route, Navigate } from "react-router-dom"
import { Suspense, lazy } from "react"
import "./assets/css/style.css"

// Auth guards
import PrivateRoute  from "./components/Auth/PrivateRoute"
import PublicRoute   from "./components/Auth/PublicRoute"
import Canciones from './pages/Private/Admin/canciones';
import AdminHorarios from "./pages/Private/Admin/horario"




// Public pages
const HomePage       = lazy(() => import("./pages/public/Home"))
const LoginPage      = lazy(() => import("./pages/public/LoginPage"))
const RegisterPage   = lazy(() => import("./pages/public/SignupPage"))
const ForgotPassword = lazy(() => import("./pages/public/ForgotPasswordPage"))
const ResetPassword  = lazy(() => import("./pages/public/ResetPasswordPage"))

// Private — Admin
const Overview = lazy(() => import("./pages/Private/Admin/Overview"))
const AdminReservas = lazy(() => import("./pages/Private/Admin/Reservas"))
const horarioService = lazy(() => import("./pages/Private/Admin/horario"))
const AdminUsuarios = lazy(() => import("./pages/Private/Admin/usuarios"))
const AdminVentas = lazy(() => import("./pages/Private/Admin/ventas"))
const AdminProductos = lazy(() => import("./pages/Private/Admin/productos"))
const AdminEventos = lazy(() => import("./pages/Private/Admin/eventos"))


// Private — User
const HomePageUser = lazy(() => import("./pages/Private/User/dashboard"))
const UserCanciones = lazy(() => import("./pages/Private/User/userCancion"))
const UserReservas = lazy(() => import("./pages/Private/User/reserva"))
const UserEventos = lazy(() => import("./pages/Private/User/eventos"))
const UserMenu = lazy(() => import("./pages/Private/User/menu"))



// Private — DJ
const DJPanel = lazy(() => import("./pages/Private/DJ/DJPanel"))

// Private — Employee
const EmployeeDashboard = lazy(() => import("./pages/Private/Employee/EmployeeDashboard"))

function App() {
  
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: "#080810", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: "40px", height: "40px", border: "3px solid #c084fc", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      </div>
    }>
    <Routes>

      {/* ── Public ── */}
      <Route path="/" element={<HomePage />} />

      <Route path="/login" element={
        <PublicRoute><LoginPage /></PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute><RegisterPage /></PublicRoute>
      } />
      <Route path="/forgot-password" element={
        <PublicRoute><ForgotPassword /></PublicRoute>
      } />
      <Route path="/reset-password" element={
        <PublicRoute><ResetPassword /></PublicRoute>
      } />

      {/* ── Private — Admin ── */}
      <Route path="/admin" element={<Overview/>} />
      
      <Route path="/admin/canciones" element={<Canciones />} />
      <Route path="/admin/reservas" element={<AdminReservas />} />
      <Route path="/admin/horarios" element={<AdminHorarios />} />
      <Route path="/admin/usuarios" element={<AdminUsuarios />} />
      <Route path="/admin/ventas" element={<AdminVentas />} />
      <Route path="/admin/productos" element={<AdminProductos />} />
      <Route path="/admin/eventos" element={<AdminEventos />} />
      
    {/* usuario */}
    <Route path="/usuario" element={<HomePageUser />} />
    <Route path="/usuario/cancion" element={<UserCanciones />} />
    <Route path="/usuario/reserva" element={<UserReservas />} />
    <Route path="/usuario/evento" element={<UserEventos />} />
    <Route path="/usuario/menu" element={<UserMenu />} />
    
    
    
      

      {/* ── Private — DJ Panel ── */}
      <Route path="/dj" element={
        <PrivateRoute role="dj"><DJPanel /></PrivateRoute>
      } />

      {/* ── Private — Employee Portal (empleado + inventario) ── */}
      <Route path="/empleado" element={
        <PrivateRoute role={["empleado", "inventario"]}><EmployeeDashboard /></PrivateRoute>
      } />

      {/* 404 */}
      <Route path="*" element={
        <div style={{ minHeight:"100vh", background:"#080810", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:"16px", fontFamily:"'Syne',sans-serif", color:"#fff" }}>
          <p style={{ fontSize:"80px", margin:0, color:"#c084fc" }}>404</p>
          <p style={{ color:"#6b6b8a", fontSize:"18px" }}>Página no encontrada</p>
          <a href="/" style={{ color:"#c084fc", fontSize:"14px" }}>← Volver al inicio</a>
        </div>
      } />

    </Routes>
    </Suspense>
  )

}

export default App