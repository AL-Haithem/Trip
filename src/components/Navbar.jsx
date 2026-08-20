import {Link, useNavigate} from "react-router-dom"
import {getSession, logout} from "../services/mockApi.js"
import Button from "./ui/Button.jsx"
import Chip from "./ui/Chip.jsx"
import Icon from "./ui/Icon.jsx"
import {brand, navbar as copy} from "../content/siteContent.js"
import "../styles/navbar.css"

function Navbar() {
  const session = getSession()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  const displayName = session
    ? (session.role === "company"
        ? (session.company && session.company.name)
        : (session.user && session.user.name))
    : null

  return (
    <header className="navbar">
      <Link to="/" className="nav-brand">
        <span className="nav-logo"><Icon name={brand.icon} /></span>
        <span className="nav-brand-text">
          {brand.name}<span className="nav-brand-sep">{brand.separator}</span>
          <span className="nav-brand-suffix"> {brand.suffix}</span>
        </span>
      </Link>

      <nav className="nav-actions">
        <Button as="link" to="/map" variant="primary">{copy.bookTrip}</Button>

        {session ? (
          <>
            <Chip>
              <span className="nav-status-dot" />
              {displayName || session.email}
            </Chip>
            <Button variant="danger" onClick={handleLogout}>{copy.logout}</Button>
          </>
        ) : (
          <>
            <Button as="link" to="/login" variant="ghost">{copy.login}</Button>
            <Button as="link" to="/signup" variant="primary">{copy.signup}</Button>
          </>
        )}
      </nav>
    </header>
  )
}

export default Navbar


