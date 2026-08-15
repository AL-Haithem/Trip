import {useState, useEffect} from "react"
import {useNavigate} from "react-router"

import {getTours} from "../services/mockApi.js"
import {deleteTour, setPublished} from "../data/tourStore.js"

function TripsList() {

  const [tours, setTours] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true;
    getTours().then((data) => {
      if (mounted) {
        setTours(data);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, [])

  const handleDelete = async (tourId) => {
    if (!confirm("Are you sure you want to delete this trip?")) return;
    await deleteTour(tourId);
    setTours(prev => prev.filter(t => t.id !== tourId));
  };

  const handleTogglePublish = async (tour) => {
    const next = !tour.published;
    await setPublished(tour.id, next);
    setTours(prev => prev.map(t => t.id === tour.id ? {...t, published: next} : t));
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#11141c",
        color: "#fff",
        fontFamily: "system-ui, sans-serif",
        padding: "32px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <h1 style={{margin: 0, color: "#0cff25"}}>Trips</h1>
        <button
          onClick={() => navigate("/trips/create")}
          style={{
            padding: "10px 18px",
            borderRadius: "8px",
            border: "none",
            background: "#0cff25",
            color: "#06210b",
            fontSize: "14px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          + Create New Tour
        </button>
      </div>

      {loading ? (
        <p style={{color: "#aab"}}>Loading tours...</p>
      ) : tours.length === 0 ? (
        <p style={{color: "#aab"}}>No tours yet. Create your first one.</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "18px",
          }}
        >
          {tours.map((tour) => (
            <div
              key={tour.id}
              style={{
                background: "#1b1f2a",
                borderRadius: "12px",
                padding: "20px",
                border: "1px solid #2a2f3a",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <div style={{display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px"}}>
                <h3 style={{margin: 0, color: "#fff"}}>{tour.title}</h3>
                <span
                  style={{
                    padding: "3px 9px",
                    borderRadius: "12px",
                    fontSize: "11px",
                    fontWeight: "bold",
                    whiteSpace: "nowrap",
                    background: tour.published ? "rgba(12, 255, 37, 0.15)" : "rgba(170, 170, 187, 0.15)",
                    color: tour.published ? "#0cff25" : "#aab",
                  }}
                >
                  {tour.published ? "Published" : "Draft"}
                </span>
              </div>
              <p style={{margin: 0, color: "#aab", fontSize: "13px", minHeight: "36px"}}>
                {tour.description || "No description."}
              </p>
              <div style={{display: "flex", gap: "14px", fontSize: "13px", color: "#cdd"}}>
                <span>💰 {tour.price} DA</span>
                <span>📏 {tour.distanceKm || 0} km</span>
                <span>💺 {tour.seats || 0}</span>
              </div>
              <div style={{display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "6px"}}>
                <button
                  onClick={() => navigate(`/trips/edit/${tour.id}`)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "6px",
                    border: "1px solid #0cff25",
                    background: "rgba(12, 255, 37, 0.12)",
                    color: "#0cff25",
                    fontSize: "13px",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => navigate(`/trips/draw/${tour.id}`)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "6px",
                    border: "1px solid #4cff8a",
                    background: "rgba(76, 255, 138, 0.12)",
                    color: "#4cff8a",
                    fontSize: "13px",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  Draw On Map
                </button>
                <button
                  onClick={() => handleTogglePublish(tour)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "6px",
                    border: tour.published ? "1px solid #ffb84c" : "1px solid #0cff25",
                    background: tour.published ? "rgba(255, 184, 76, 0.12)" : "rgba(12, 255, 37, 0.12)",
                    color: tour.published ? "#ffb84c" : "#0cff25",
                    fontSize: "13px",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  {tour.published ? "Unpublish" : "Publish"}
                </button>
                <button
                  onClick={() => handleDelete(tour.id)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "6px",
                    border: "1px solid #ff4c4c",
                    background: "rgba(255, 76, 76, 0.12)",
                    color: "#ff4c4c",
                    fontSize: "13px",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default TripsList
