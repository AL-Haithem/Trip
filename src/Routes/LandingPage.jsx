import { useEffect, useState } from "react"
import Navbar from "../components/Navbar.jsx"
import Button from "../components/ui/Button.jsx"
import Card from "../components/ui/Card.jsx"
import Chip from "../components/ui/Chip.jsx"
import Panel from "../components/ui/Panel.jsx"
import Icon from "../components/ui/Icon.jsx"
import { WAYPOINT_TYPES } from "../content/waypointTypes.js"
import { brand, landing } from "../content/siteContent.js"
import { useCdnAssets } from "../services/cdnAssets.jsx"
import { ALL_COUNTRIES_CODE, SUPPORTED_COUNTRIES } from "../Maps/countries.js"
import "../styles/landing.css"

function sectionEyebrow({ eyebrow }) {
  return (
    <div className="lp-section">
      <div className="lp-eyebrow">{eyebrow}</div>
    </div>
  )
}

function LandingPage() {
  const {assetUrl} = useCdnAssets()
  const [country, setCountry] = useState(ALL_COUNTRIES_CODE)

  useEffect(() => {
    const region = new Intl.Locale(navigator.language || "").region
    const isSupported = SUPPORTED_COUNTRIES.some((item) => item.code === region && item.enabled)
    if (isSupported) setCountry(region)
  }, [])

  const mapUrl = `/map?country=${country}`
  useEffect(() => {
    document.title = `${brand.name} ${brand.separator} ${brand.suffix}`
  }, [])

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
      <section className="hero" style={{ "--landing-hero-image": `url("${assetUrl("hero_bg.jpg")}")` }}>
        <div className="lp-hero-inner">
          <div className="lp-badge">
            <Icon name="globe" /> {brand.logo} {brand.name} {brand.separator} {brand.suffix}
          </div>

          <h1 className="lp-hero-title">
            {landing.hero.titleLead}{" "}
            <span className="lp-hero-highlight">{landing.hero.titleHighlight}</span>.
          </h1>

          <p className="lp-hero-subtitle">{landing.hero.subtitle}</p>

          <div className="lp-hero-actions">
            <div className="lp-map-choice">
              <Button as="link" to={mapUrl} variant="primary" size="lg">
                <Icon name="compass" /> {landing.hero.primaryCta}
              </Button>
              <label className="lp-country-select" title="Choose a country">
                {country === ALL_COUNTRIES_CODE
                  ? <Icon name="globe" className="lp-country-icon" />
                  : <span className="lp-country-flag" role="img" aria-label="Algeria">🇩🇿</span>}
                <Icon name="chevron-down" />
                <select value={country} onChange={(event) => setCountry(event.target.value)} aria-label="Map country">
                  <option value={ALL_COUNTRIES_CODE}>All countries</option>
                  {SUPPORTED_COUNTRIES.filter((item) => item.enabled).map((item) => (
                    <option key={item.code} value={item.code}>{item.label}</option>
                  ))}
                </select>
              </label>
            </div>
            <Button as="link" to="/map" variant="ghost" size="lg">
              <Icon name="map" /> {landing.hero.secondaryCta}
            </Button>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="lp-section">
        {sectionEyebrow(landing.problems)}
        <h2 className="lp-section-title">{landing.problems.title}</h2>
        <div className="lp-grid lp-grid-sm">
          {landing.problems.items.map((p, idx) => (
            <Card key={p.title} className="lp-card" style={{ animationDelay: `${idx * 0.1}s` }}>
              <div className="lp-card-icon"><Icon name={p.icon} /></div>
              <h3 className="lp-card-title">{p.title}</h3>
              <p className="lp-card-text">{p.text}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* SOLUTION */}
      <section className="lp-section">
        {sectionEyebrow(landing.solutions)}
        <h2 className="lp-section-title">{landing.solutions.title}</h2>
        <div className="lp-grid lp-grid-md">
          {landing.solutions.items.map((s, idx) => (
            <Card key={s.title} className="lp-card" style={{ animationDelay: `${idx * 0.1}s` }}>
              <div className="lp-card-icon"><Icon name={s.icon} /></div>
              <h3 className="lp-card-title">{s.title}</h3>
              <p className="lp-card-text">{s.text}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* SHOWCASE — each tour image shown exactly once, no repeats */}
      <section className="lp-section">
        <div className="lp-eyebrow">Inspiration</div>
        <h2 className="lp-section-title">Where your trips can take you</h2>
        <div className="lp-showcase">
          <div className="lp-showcase-card">
            <div className="lp-showcase-img" style={{ backgroundImage: `url("${assetUrl("tour_1.jpg")}")` }} />
            <div className="lp-showcase-caption">Forest mountain trail</div>
          </div>
          <div className="lp-showcase-card">
            <div className="lp-showcase-img" style={{ backgroundImage: `url("${assetUrl("tour_2.jpg")}")` }} />
            <div className="lp-showcase-caption">Crystal coast resort</div>
          </div>
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
