import {useState, useRef, useEffect} from "react"
import {useParams, useNavigate} from "react-router"

import MainMap from "../Maps/MainMap.jsx"
import EditMode from "../Editor/EditMode.jsx"
import {getTour, saveTour} from "../data/tourStore.js"
import {graphicsToGeoJSON} from "../Editor/storage.js"

function TripDraw() {

  const {id} = useParams()
  const navigate = useNavigate()

  const [view, setView] = useState(null)
  const [tour, setTour] = useState(null)
  const [initialRoute, setInitialRoute] = useState(null)
  const [saved, setSaved] = useState(false)
  const toolRef = useRef({})

  useEffect(() => {
    let mounted = true;
    getTour(id).then((data) => {
      if (mounted && data) {
        setTour(data);
        setInitialRoute(data.route || null);
      }
    });
    return () => { mounted = false; };
  }, [id])

  const registerTool = (toolId, api) => {
    toolRef.current[toolId] = api;
  };

  const collectRoute = () => {
    const polylineApi = toolRef.current["polyline"];
    const pointApi = toolRef.current["point"];

    const polylineGraphics = polylineApi ? polylineApi.getGraphics() : [];
    const pointGraphics = pointApi ? pointApi.getGraphics() : [];

    const allGraphics = [...polylineGraphics, ...pointGraphics];
    return allGraphics.length > 0
      ? {type: "FeatureCollection", features: graphicsToGeoJSON(allGraphics)}
      : null;
  };

  const handleSaveRoute = async () => {
    if (!tour) return;
    const route = collectRoute();
    const polylineApi = toolRef.current["polyline"];
    const distanceKm = polylineApi ? polylineApi.getDistance() : 0;

    const finalTour = {
      ...tour,
      route: route !== null ? route : tour.route,
      distanceKm: distanceKm || tour.distanceKm,
    };

    await saveTour(finalTour);
    setTour(finalTour);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  if (!tour) {
    return (
      <div style={{background: "#11141c", color: "#fff", padding: "32px", fontFamily: "system-ui"}}>
        Loading tour...
      </div>
    );
  }

  return (
    <div style={{display: "flex", width: "100%", height: "100vh"}}>

      <div
        style={{
          width: "320px",
          flexShrink: 0,
          height: "98%",
          overflowY: "auto",
          background: "#1b1f2a",
          color: "#fff",
          padding: "24px",
          margin: "2px",
          boxSizing: "border-box",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <h2 style={{marginTop: 0, color: "#0cff25"}}>Trip Map Editor</h2>
        <p style={{color: "#aab", fontSize: "13px"}}>{tour.title}</p>

        <div style={{display: "flex", alignItems: "center", marginBottom: 0}}>
          <span
            style={{
              padding: "4px 10px",
              borderRadius: "12px",
              fontSize: "12px",
              fontWeight: "bold",
              background: tour.published ? "rgba(12, 255, 37, 0.15)" : "rgba(170, 170, 187, 0.15)",
              color: tour.published ? "#0cff25" : "#aab",
            }}
          >
            {tour.published ? "Published" : "Draft"}
          </span>
        </div>

        <button
          onClick={handleSaveRoute}
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

        <button
          onClick={() => navigate("/trips")}
          style={{
            width: "100%",
            padding: "12px",
            marginTop: "10px",
            borderRadius: "8px",
            border: "1px solid #555",
            background: "transparent",
            color: "#fff",
            fontSize: "15px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Back to Trips
        </button>

        {saved && (
          <p style={{color: "#4cff8a", fontSize: "13px", marginTop: "10px" }}>
            Route saved.
          </p>
        )}
      </div>

      <div style={{flex: 1, position: "relative"}}>
        <MainMap onViewReady={setView} />
        <EditMode
          view={view}
          onRegister={registerTool}
          initialRoute={initialRoute}
          defaultTool={null}
        />
      </div>

    </div>
  )
}

export default TripDraw
