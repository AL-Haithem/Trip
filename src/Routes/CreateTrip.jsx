import {useState, useRef} from "react"

import MainMap from "../Maps/MainMap.jsx"
import EditMode from "../Editor/EditMode.jsx"
import {createEmptyTour, isValidTour, DEFAULT_SERVICES} from "../data/models.js"
import {saveTour} from "../data/tourStore.js"
import {graphicsToGeoJSON} from "../Editor/storage.js"

function CreateTrip() {

  const [view, setView] = useState(null)
  const [tour, setTour] = useState(createEmptyTour())
  const [saved, setSaved] = useState(false)
  const toolRef = useRef({})

  const registerTool = (id, api) => {
    toolRef.current[id] = api;
  };

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
    const polylineApi = toolRef.current["polyline"];
    const graphics = polylineApi ? polylineApi.getGraphics() : [];
    const distanceKm = polylineApi ? polylineApi.getDistance() : 0;

    const route = graphics.length > 0 ? {type: "FeatureCollection", features: graphicsToGeoJSON(graphics)} : null;

    const finalTour = {
      ...tour,
      route,
      distanceKm,
    };

    if (!isValidTour(finalTour)) {
      alert("Please provide a title and draw at least one route before saving.");
      return;
    }

    await saveTour(finalTour);
    setSaved(true);
  };

  return (
    <div style={{display: "flex", width: "100%", height: "100vh"}}>

      <div
        style={{
          width: "380px",
          flexShrink: 0,
          height: "100%",
          overflowY: "auto",
          background: "#1b1f2a",
          color: "#fff",
          padding: "24px",
          boxSizing: "border-box",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <h2 style={{marginTop: 0, color: "#0cff25"}}>Create Tour</h2>

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
          {saved ? "Saved ✓" : "Save Tour"}
        </button>

        {saved && (
          <p style={{color: "#4cff8a", fontSize: "13px", marginTop: "10px"}}>
            Tour saved to local storage.
          </p>
        )}
      </div>

      <div style={{flex: 1, position: "relative"}}>
        <MainMap onViewReady={setView} />
        <EditMode view={view} onRegister={registerTool} />
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
  background: "#11141c",
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

export default CreateTrip
