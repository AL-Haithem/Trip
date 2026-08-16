import {useState, useEffect} from "react"
import {useNavigate} from "react-router"

import {getTours, getSession} from "../services/mockApi.js"
import {deleteTour, setPublished} from "../data/tourStore.js"
import Card from "../components/ui/Card.jsx"
import Chip from "../components/ui/Chip.jsx"
import Button from "../components/ui/Button.jsx"
import {tripsList as copy} from "../content/siteContent.js"
import "../styles/tripsList.css"

function TripsList() {
  const [tours, setTours] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const sessionCompany = getSession()?.company || null

  useEffect(() => {
    let mounted = true;
    getTours().then((data) => {
      if (!mounted) return;
      const companyId = sessionCompany ? sessionCompany.id : null;
      const filtered = companyId
        ? (data || []).filter((t) => t.companyId === companyId)
        : (data || []);
      setTours(filtered);
      setLoading(false);
    });
    return () => { mounted = false; };
  }, [sessionCompany])

  const handleDelete = async (tourId) => {
    if (!confirm(copy.deleteConfirm)) return;
    await deleteTour(tourId);
    setTours(prev => prev.filter(t => t.id !== tourId));
  };

  const handleTogglePublish = async (tour) => {
    const next = !tour.published;
    await setPublished(tour.id, next);
    setTours(prev => prev.map(t => t.id === tour.id ? {...t, published: next} : t));
  };

  return (
    <div className="tl-page">
      <div className="tl-head">
        <div>
          <h1 className="tl-title">{copy.title}</h1>
          {sessionCompany && (
            <div className="tl-managed">
              {copy.managedBy(sessionCompany.name)}
            </div>
          )}
        </div>
        <Button variant="primary" onClick={() => navigate("/trips/create")}>{copy.createButton}</Button>
      </div>

      {loading ? (
        <p className="tl-msg">{copy.loading}</p>
      ) : tours.length === 0 ? (
        <p className="tl-msg">{copy.empty}</p>
      ) : (
        <div className="tl-grid">
          {tours.map((tour) => (
            <Card key={tour.id} className="tl-card">
              <div className="tl-card-head">
                <h3 className="tl-card-title">{tour.title}</h3>
                <Chip green={tour.published}>{tour.published ? copy.published : copy.draft}</Chip>
              </div>
              <p className="tl-card-desc">
                {tour.description || copy.noDescription}
              </p>
              <div className="tl-card-meta">
                <span>{copy.price(tour.price || 0)}</span>
                <span>{copy.distance(tour.distanceKm || 0)}</span>
                <span>{copy.seats(tour.seats || 0)}</span>
              </div>
              <div className="tl-card-actions">
                <Button variant="info" size="sm" onClick={() => navigate(`/trips/edit/${tour.id}`)}>{copy.edit}</Button>
                <Button variant="primary" size="sm" onClick={() => navigate(`/trips/draw/${tour.id}`)}>{copy.draw}</Button>
                <Button
                  variant={tour.published ? "warning" : "primary"}
                  size="sm"
                  onClick={() => handleTogglePublish(tour)}
                >
                  {tour.published ? copy.unpublish : copy.publish}
                </Button>
                <Button variant="danger" size="sm" onClick={() => handleDelete(tour.id)}>{copy.delete}</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default TripsList
