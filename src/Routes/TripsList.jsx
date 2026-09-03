import {useState, useEffect} from "react"
import {useNavigate} from "react-router"
import {brand} from "../content/siteContent.js"
import {getTrips, publishTrip} from "../services/tripApi.js"
import {deleteTrip} from "../services/tripApi.js"
import Button from "../components/ui/Button.jsx"
import Chip from "../components/ui/Chip.jsx"
import Icon from "../components/ui/Icon.jsx"
import {tripsList as copy} from "../content/siteContent.js"
import {usePopup} from "../components/ui/Popup.jsx"
import "../styles/tripsList.css"

function TripsList() {
  useEffect(() => {
    document.title = `My Trips - ${brand.name}`
  }, [])

  const [tours, setTours] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const {showPopup} = usePopup()

  useEffect(() => {
    let mounted = true;
    getTrips().then((data) => {
      if (!mounted) return;
      setTours(data || []);
      setLoading(false);
    });
    return () => { mounted = false; };
  }, [])

  const handleDelete = async (tourId) => {
    if (!confirm(copy.deleteConfirm)) return;
    try {
      await deleteTrip(tourId)
      setTours(prev => prev.filter(t => t._id !== tourId))
    } catch (error) {
      showPopup(error.response?.data?.message || error.message || "Could not delete the trip.")
    }
  };

  const handleTogglePublish = async (tour) => {
    if (tour.status === "published") return;

    try {
      const response = await publishTrip(tour._id)
      const status = response.data?.status || "published"
      setTours(prev => prev.map(t => t._id === tour._id ? {...t, status} : t))
      showPopup(response.message || "Trip published successfully", "success")
    } catch (error) {
      showPopup(error.response?.data?.message || error.message || "Could not publish the trip.")
    }
  };

  const handleEditImage = (tourId) => {
    console.log("Editing image for tour:", tourId)
    alert("Image upload feature coming soon!")
  }

  return (
    <div className="tl-page">
      <div className="tl-head">
        <div style={{display: "flex", flexDirection: "column"}}>
          <h1 className="tl-title"><Icon name="route" /> {copy.title}</h1>
        </div>
        <Button variant="primary" onClick={() => navigate("/trips/create")}>
          <Icon name="plus" /> {copy.createButton}
        </Button>
      </div>

      {loading ? (
        <p className="tl-msg">{copy.loading}</p>
      ) : tours.length === 0 ? (
        <p className="tl-msg">{copy.empty}</p>
      ) : (
        <div className="tl-grid">
          {tours.map((tour, idx) => {
            const firstSlot = tour.departureSchedule?.flatMap((day) => day.times || [])[0]
            const seats = tour.departureSchedule?.flatMap((day) => day.times || [])
              .reduce((total, slot) => total + Number(slot.seatsAvailable || 0), 0) || 0
            const isPublished = tour.status === "published"

            return (
            <div key={tour._id} className="tl-card" style={{animationDelay: `${idx * 0.1}s`}}>
              <div className="tl-card-img-wrap">
                <img 
                  src={tour.image || `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200">
                      <defs>
                        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
                          <stop offset="0%" stop-color="#0f172a" />
                          <stop offset="100%" stop-color="#1d4ed8" />
                        </linearGradient>
                      </defs>
                      <rect width="400" height="200" fill="url(#g)"/>
                      <circle cx="70" cy="68" r="18" fill="rgba(255,255,255,0.18)"/>
                      <path d="M42 146 C 120 80, 160 64, 214 96 S 318 120, 360 66" stroke="rgba(255,255,255,0.72)" stroke-width="6" fill="none" stroke-linecap="round"/>
                      <text x="200" y="166" text-anchor="middle" fill="white" font-size="16" font-family="Quicksand, sans-serif">${(tour.title || "No image").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}</text>
                    </svg>
                  `)}`}
                  className="tl-card-img" 
                  alt={tour.title || "Trip image"}
                />
                <div className="tl-card-img-overlay">
                  <button className="tl-edit-img-btn" onClick={() => handleEditImage(tour._id)} title="Change image">
                    <Icon name="pencil" />
                  </button>
                </div>
              </div>

              <div className="tl-card-body">
                <div className="tl-card-head">
                  <h3 className="tl-card-title">{tour.title}</h3>
                  <Chip green={isPublished}>{isPublished ? copy.published : copy.draft}</Chip>
                </div>
                
                <p className="tl-card-desc">
                  {tour.description || copy.noDescription}
                </p>

                <div className="tl-card-meta">
                  <div className="tl-meta-item">
                    <Icon name="dollar-sign" /> {copy.price(firstSlot?.price || 0)}
                  </div>
                  <div className="tl-meta-item">
                    <Icon name="road" /> {copy.distance(tour.distanceKm || 0)}
                  </div>
                  <div className="tl-meta-item">
                    <Icon name="users" /> {copy.seats(seats)}
                  </div>
                </div>

                <div className="tl-card-actions">
                  <Button variant="info" size="sm" onClick={() => navigate(`/trips/edit/${tour._id}`)}>
                    <Icon name="pencil" /> {copy.edit}
                  </Button>
                  <Button variant="primary" size="sm" onClick={() => navigate(`/trips/draw/${tour._id}`, {state: {title: tour.title}})}>
                    <Icon name="map-location-dot" /> {copy.draw}
                  </Button>
                  <Button
                    variant={isPublished ? "warning" : "primary"}
                    size="sm"
                    onClick={() => handleTogglePublish(tour)}
                  >
                    <Icon name={isPublished ? "eye-slash" : "eye"} /> {isPublished ? copy.unpublish : copy.publish}
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(tour._id)}>
                    <Icon name="trash" /> {copy.delete}
                  </Button>
                </div>
              </div>
            </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default TripsList
