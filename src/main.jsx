import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import './styles/theme.css'
import './styles/components.css'
import './styles/maps.css'
import App from './App.jsx'
import { ThemeProvider } from './theme/themeContext.jsx'
import "@arcgis/core/assets/esri/themes/dark/main.css"

const redirect = sessionStorage.getItem("redirect")

if (redirect && location.pathname === "/") {
  window.history.replaceState(null, "", redirect)
  sessionStorage.removeItem("redirect")
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
