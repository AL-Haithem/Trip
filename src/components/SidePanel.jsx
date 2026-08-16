import {useState} from "react"
import TripCard from "./TripCard.jsx"
import Chip from "./ui/Chip.jsx"
import {brand, sidePanel as copy} from "../content/siteContent.js"
import "../styles/sidePanel.css"

function SidePanel({tours, activeId, onSelect, onView}) {
  const [query, setQuery] = useState("")
  const [sort, setSort] = useState("price")

  const filtered = tours
    .filter((t) => {
      const q = query.trim().toLowerCase()
      if (!q) return true
      return (
        (t.title || "").toLowerCase().includes(q) ||
        (t.description || "").toLowerCase().includes(q)
      )
    })
    .sort((a, b) => {
      if (sort === "price") return (a.price || 0) - (b.price || 0)
      if (sort === "distanceKm") return (a.distanceKm || 0) - (b.distanceKm || 0)
      return 0
    })

  const sortOptions = [
    {key: "price", label: copy.sortPrice},
    {key: "distanceKm", label: copy.sortDistance},
  ]

  return (
    <aside className="side-panel">
      <div className="sp-header">
        <div className="sp-brand">
          <span className="sp-logo">{brand.logo}</span>
          <span className="sp-brand-text">{copy.eyebrow}</span>
        </div>
        <h2 className="sp-title">{copy.title}</h2>
        <p className="sp-subtitle">{copy.subtitle}</p>

        <div className="sp-search">
          <span className="sp-search-icon">🔍</span>
          <input
            className="sp-search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={copy.searchPlaceholder}
          />
        </div>

        <div className="sp-sort">
          <span className="sp-sort-label">{copy.sortLabel}</span>
          <div className="sp-sort-options">
            {sortOptions.map((o) => {
              const active = sort === o.key
              return (
                <button
                  key={o.key}
                  onClick={() => setSort(o.key)}
                  className={active ? "sp-sort-btn sp-sort-btn-active" : "sp-sort-btn"}
                >
                  {o.label}
                </button>
              )
            })}
          </div>
        </div>

        <Chip green className="sp-count">{copy.verifiedChip(tours.length)}</Chip>
      </div>

      <div className="sp-list">
        {filtered.length === 0 ? (
          <p className="sp-empty">{copy.noResults}</p>
        ) : (
          filtered.map((tour) => (
            <TripCard
              key={tour.id}
              tour={tour}
              active={tour.id === activeId}
              onSelect={onSelect}
              onView={onView}
            />
          ))
        )}
      </div>
    </aside>
  )
}

export default SidePanel
