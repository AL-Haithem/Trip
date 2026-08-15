import {useState, useEffect} from "react"
import {useParams, useNavigate} from "react-router"

import {createEmptyTour, DEFAULT_SERVICES} from "../data/models.js"
import {saveTour, getTour} from "../data/tourStore.js"

function TripForm() {

  const {id} = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const [tour, setTour] = useState(createEmptyTour())
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    getTour(id).then((data) => {
      if (mounted && data) setTour(data);
    });
    return () => { mounted = false; };
  }, [id])

  const updateField = (field, value) => {
    setTour(prev => ({...prev, [field]: value}));
    setSaved(false);
  };

  const toggleService = (service, list) => {
    setTour(prev => {
      const current = prev[list];
      const exists = current.includes(service);
      const next = exists
        ? current.filter(s => s !== service)
        : [...current, service];
      return {...prev, [list]: next};
    });
    setSaved(false);
  };

  const handleSave = async () => {
    if (!tour.title || tour.title.trim().length === 0) {
      alert("Please provide a title before saving.");
      return;
    }
    await saveTour(tour);
    setSaved(true);
    navigate("/trips");
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
      <div style={{maxWidth: "640px", margin: "0 auto"}}>
        <h1 style={{marginTop: 0, color: "#0cff25"}}>
          {isEdit ? "Edit Tour" : "Create Tour"}
        </h1>

        <label style={labelStyle}>Title</label>
        <input
          style={inputStyle}
          value={tour.title}
          onChange={(e) => updateField("title", e.target.value)}
          placeholder="e.g. Northern Algeria Adventure"
        />

        <label style={labelStyle}>Description</label>
        <textarea
          style={{...inputStyle, minHeight: "90px", resize: "vertical"}}
          value={tour.description}
          onChange={(e) => updateField("description", e.target.value)}
          placeholder="Describe the trip program..."
        />

        <label style={labelStyle}>Price (per person)</label>
        <input
          style={inputStyle}
          type="number"
          min="0"
          value={tour.price}
          onChange={(e) => updateField("price", parseFloat(e.target.value) || 0)}
        />

        <label style={labelStyle}>Seats</label>
        <input
          style={inputStyle}
          type="number"
          min="0"
          value={tour.seats}
          onChange={(e) => updateField("seats", parseInt(e.target.value) || 0)}
        />

        <label style={labelStyle}>Included Services</label>
        <div style={{display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "12px"}}>
          {DEFAULT_SERVICES.map(service => (
            <button
              key={service}
              type="button"
              onClick={() => toggleService(service, "includedServices")}
              style={chipStyle(tour.includedServices.includes(service))}
            >
              {service}
            </button>
          ))}
        </div>

        <label style={labelStyle}>Not Included Services</label>
        <div style={{display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "12px"}}>
          {DEFAULT_SERVICES.map(service => (
            <button
              key={service}
              type="button"
              onClick={() => toggleService(service, "notIncludedServices")}
              style={chipStyle(tour.notIncludedServices.includes(service), "#ff4c4c")}
            >
              {service}
            </button>
          ))}
        </div>

        <button
          onClick={handleSave}
          style={{
            width: "100%",
            padding: "12px",
            marginTop: "8px",
            borderRadius: "8px",
            border: "none",
            background: saved ? "#4cff8a" : "#0cff25",
            color: "#06210b",
            fontSize: "15px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          {saved ? "Saved ✓" : "Save"}
        </button>

        {saved && (
          <p style={{color: "#4cff8a", fontSize: "13px", marginTop: "10px"}}>
            Tour saved.
          </p>
        )}
      </div>
    </div>
  )
}

const labelStyle = {
  display: "block",
  fontSize: "13px",
  margin: "14px 0 6px",
  color: "#aab",
};

const inputStyle = {
  width: "100%",
  padding: "10px",
  borderRadius: "6px",
  border: "1px solid #444",
  background: "#1b1f2a",
  color: "#fff",
  fontSize: "14px",
  boxSizing: "border-box",
};

const chipStyle = (active, color = "#0cff25") => ({
  padding: "6px 10px",
  borderRadius: "14px",
  border: active ? `1px solid ${color}` : "1px solid #444",
  background: active ? `${color}22` : "transparent",
  color: active ? color : "#ccc",
  fontSize: "12px",
  cursor: "pointer",
});

export default TripForm
