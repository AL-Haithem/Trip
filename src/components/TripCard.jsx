import Card from "./ui/Card.jsx"
import Chip from "./ui/Chip.jsx"
import Button from "./ui/Button.jsx"
import Icon from "./ui/Icon.jsx"
import {WAYPOINT_TYPES} from "../Editor/Tools/PointDrawer.jsx"
import {tripsList as copy} from "../content/siteContent.js"
import "../styles/tripCard.css"

const TYPE_MAP = WAYPOINT_TYPES.reduce((acc, t) => {
  acc[t.id] = t;
  return acc;
}, {})

function waypointChips(route) {
  const seen = new Set()
  const chips = []
  if (!route || !route.features) return chips
  route.features.forEach((f) => {
    const t = f.properties && f.properties.waypointType
    if (t && !seen.has(t) && TYPE_MAP[t]) {
      seen.add(t)
      chips.push(TYPE_MAP[t])
    }
  })
  return chips
}

function TripCard({tour, active, onSelect, onView}) {
  const chips = waypointChips(tour.route)

  return (
    <Card
      className={active ? "tc-card tc-card-active" : "tc-card"}
      onClick={() => onSelect(tour.id)}
      onMouseEnter={() => onSelect(tour.id)}
    >
      <div className="tc-head">
        <h3 className="tc-title">{tour.title}</h3>
        <Chip green>{tour.published ? copy.published : copy.draft}</Chip>
      </div>

      <p className="tc-desc">
        {tour.description || copy.noDescription}
      </p>

      <div className="tc-waypoints">
        {chips.length > 0 ? (
          chips.map((c) => (
            <span key={c.id} title={c.label} className="tc-waypoint">
              <Icon name={c.icon} />
            </span>
          ))
        ) : (
          <span className="tc-no-waypoints">No waypoints drawn</span>
        )}
      </div>

      <div className="tc-meta">
        <span><Icon name="ruler-horizontal" /> {copy.distance(tour.distanceKm || 0)}</span>
        <span><Icon name="chair" /> {copy.seats(tour.seats || 0)}</span>
        {tour.includedServices && tour.includedServices.length > 0 && (
          <span><Icon name="circle-check" /> {tour.includedServices.length} services</span>
        )}
      </div>

      {tour.includedServices && tour.includedServices.length > 0 && (
        <div className="tc-services">
          {tour.includedServices.map((s) => (
            <Chip green key={s}>{s}</Chip>
          ))}
        </div>
      )}

      <div className="tc-foot">
        <div>
          <div className="tc-price">{Number(tour.price || 0).toLocaleString()} $</div>
          <div className="tc-price-unit">{copy.pricePerPerson}</div>
        </div>
        <Button
          variant="primary"
          onClick={(e) => {
            e.stopPropagation()
            onView(tour.id)
          }}
        >
          {copy.viewTrip}
        </Button>
      </div>
    </Card>
  )
}

export default TripCard
