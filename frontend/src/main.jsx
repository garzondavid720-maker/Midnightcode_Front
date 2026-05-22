import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import { SongProvider } from "./context/SongContext"
import App from "./App.jsx"
import "./assets/css/style.css"

document.documentElement.classList.add("dark")

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SongProvider>
          <App />
        </SongProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)
