import { createRoot } from "react-dom/client"
import "./styles/index.css"
import "./styles/theme.css"
import "./styles/components.css"
import "./styles/maps.css"
import "./styles/booking.css"
import App from "./App.jsx"
import {PopupProvider} from "./components/ui/Popup.jsx"
import {CdnAssetsProvider} from "./services/cdnAssets.jsx"

const redirect = sessionStorage.getItem("redirect")
const basePath = import.meta.env.BASE_URL || "/"

if (redirect && location.pathname === basePath) {
  window.history.replaceState(null, "", redirect)
  sessionStorage.removeItem("redirect")
}

createRoot(document.getElementById("root")).render(
  <CdnAssetsProvider>
    <PopupProvider>
      <App />
    </PopupProvider>
  </CdnAssetsProvider>
)
