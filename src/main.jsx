import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import "@arcgis/core/assets/esri/themes/dark/main.css"

const redirect = sessionStorage.getItem("redirect")

if (redirect && location.pathname === "/") {
  window.history.replaceState(null, "", redirect)
  sessionStorage.removeItem("redirect")
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
