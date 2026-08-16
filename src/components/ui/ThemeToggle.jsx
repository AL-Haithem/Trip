import {useTheme} from "../../theme/themeContext.jsx"
import Icon from "./Icon.jsx"
import "../../styles/themeToggle.css"

export default function ThemeToggle() {
  const {theme, toggleTheme} = useTheme()
  const isDark = theme === "dark"
  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-label="Toggle color theme"
      className="theme-toggle"
    >
      <Icon name={isDark ? "sun" : "moon"} />
    </button>
  )
}
