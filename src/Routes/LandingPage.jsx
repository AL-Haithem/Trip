import Navbar from "../components/Navbar.jsx"
import Button from "../components/ui/Button.jsx"
import Card from "../components/ui/Card.jsx"
import Chip from "../components/ui/Chip.jsx"
import Panel from "../components/ui/Panel.jsx"
import Icon from "../components/ui/Icon.jsx"
import {WAYPOINT_TYPES} from "../Editor/Tools/PointDrawer.jsx"
import {brand, landing} from "../content/siteContent.js"
import "../styles/landing.css"

function sectionEyebrow({eyebrow}) {
  return (
    <div className="lp-section">
      <div className="lp-eyebrow">{eyebrow}</div>
    </div>
  )
}

function LandingPage() {
  const waypointChips = WAYPOINT_TYPES.map((t) => (
    <Chip key={t.id} title={t.label} className="lp-waypoint">
      <span className="lp-waypoint-emoji"><Icon name={t.icon} /></span>
      {t.label}
    </Chip>
  ))

  return (
    <div className="lp-page">
      <Navbar />

      {/* HERO */}
      <section className="hero">
        <div className="lp-hero-inner">
          <div className="lp-badge">
            {brand.logo} {brand.name} {brand.separator} {brand.suffix}
          </div>

          <h1 className="lp-hero-title">
            {landing.hero.titleLead}{" "}
            <span className="lp-hero-highlight">{landing.hero.titleHighlight}</span>.
          </h1>

          <p className="lp-hero-subtitle">{landing.hero.subtitle}</p>

          <div className="lp-hero-actions">
            <Button as="link" to="/map" variant="primary" size="lg">{landing.hero.primaryCta}</Button>
            <Button as="link" to="/map" variant="ghost" size="lg">{landing.hero.secondaryCta}</Button>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="lp-section">
        {sectionEyebrow(landing.problems)}
        <h2 className="lp-section-title">{landing.problems.title}</h2>
        <div className="lp-grid lp-grid-sm">
          {landing.problems.items.map((p) => (
            <Card key={p.title} className="lp-card">
              <div className="lp-card-icon"><Icon name={p.icon} /></div>
              <h3 className="lp-card-title">{p.title}</h3>
              <p className="lp-card-text">{p.text}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* SOLUTION */}
      <section className="lp-section lp-section-alt">
        {sectionEyebrow(landing.solutions)}
        <h2 className="lp-section-title">{landing.solutions.title}</h2>
        <div className="lp-grid lp-grid-md">
          {landing.solutions.items.map((s) => (
            <Card key={s.title} className="lp-card">
              <div className="lp-card-icon"><Icon name={s.icon} /></div>
              <h3 className="lp-card-title">{s.title}</h3>
              <p className="lp-card-text">{s.text}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* WAYPOINT LEGEND */}
      <section className="lp-section">
        {sectionEyebrow(landing.waypoints)}
        <h2 className="lp-section-title">{landing.waypoints.title}</h2>
        <div className="lp-waypoint-row">
          {waypointChips}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="lp-section lp-cta-section">
        <Panel className="lp-cta">
          <h2 className="lp-cta-title">{landing.cta.title}</h2>
          <p className="lp-cta-text">{landing.cta.subtitle}</p>
          <Button as="link" to="/map" variant="primary" size="lg">{landing.cta.button}</Button>
        </Panel>
      </section>

      {/* FOOTER */}
      <footer className="lp-footer">
        {landing.footer}
      </footer>
    </div>
  )
}

export default LandingPage
