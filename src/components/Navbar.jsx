import {Link} from "react-router-dom"
import Button from "./ui/Button.jsx"
import Icon from "./ui/Icon.jsx"
import {brand, navbar as copy} from "../content/siteContent.js"
import "../styles/navbar.css"

function Navbar() {
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

        <Button as="link" to="/login" variant="ghost">{copy.login}</Button>
        <Button as="link" to="/signup" variant="primary">{copy.signup}</Button>
      </nav>
    </header>
  )
}

export default Navbar


