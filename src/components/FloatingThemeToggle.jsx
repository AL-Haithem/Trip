import ThemeToggle from "./ui/ThemeToggle.jsx"
import "../styles/floatingThemeToggle.css"

const NAVBAR_ROUTES = ["/", "/map"]

export default function FloatingThemeToggle({pathname}) {
  if (NAVBAR_ROUTES.includes(pathname)) return null
  return (
    <div className="floating-toggle">
      <ThemeToggle />
    </div>
  )
}
