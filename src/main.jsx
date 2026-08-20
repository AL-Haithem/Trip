import { createRoot } from "react-dom/client"
import "./styles/index.css"
import "./styles/theme.css"
import "./styles/components.css"
import "./styles/maps.css"
import App from "./App.jsx"

const redirect = sessionStorage.getItem("redirect")

if (redirect && location.pathname === "/") {
  window.history.replaceState(null, "", redirect)
  sessionStorage.removeItem("redirect")
}

createRoot(document.getElementById("root")).render(<App />)
