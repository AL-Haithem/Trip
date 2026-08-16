import {useState, useRef, useEffect} from "react"
import {useParams, useNavigate} from "react-router"
import {webMercatorToGeographic} from "@arcgis/core/geometry/support/webMercatorUtils"
import Point from "@arcgis/core/geometry/Point"

import MainMap from "../Maps/MainMap.jsx"
import EditMode from "../Editor/EditMode.jsx"
import StartEndDrawer from "../Editor/Tools/StartEndDrawer.jsx"
import {getTour, saveTour} from "../data/tourStore.js"
import {tripDraw as copy} from "../content/siteContent.js"
import "../styles/tripDraw.css"

function to4326(geometry) {
  if (!geometry) return null
  const sr = geometry.spatialReference
  const isWebMercator = sr && (sr.isWebMercator || sr.wkid === 102100 || sr.latestWkid === 3857)
  if (isWebMercator) return webMercatorToGeographic(geometry)
  return geometry
}

function toGeoJSONPoint(geometry) {
  if (!geometry) return null
  const normalized = to4326(geometry)
  return {
    type: "Feature",
    geometry: {...normalized.toJSON(), type: "Point"},
    properties: {kind: "endpoint"},
  }
}

function fcToGeom(fc) {
  if (!fc) return null
  const features = fc.features || (fc.type === "Feature" ? [fc] : [])
  const feature = features[0]
  const g = feature ? (feature.geometry || feature) : null
  if (!g || (g.x === undefined && g.longitude === undefined)) return null
  return new Point(g)
}

function TripDraw() {

  const {id} = useParams()
  const navigate = useNavigate()

  const [view, setView] = useState(null)
  const [tour, setTour] = useState(null)
  const [initialRoute, setInitialRoute] = useState(null)
  const [saved, setSaved] = useState(false)
  const [pointMode, setPointMode] = useState(null)
  const [startPoint, setStartPoint] = useState(null)
  const [endPoint, setEndPoint] = useState(null)
  const toolRef = useRef({})

  useEffect(() => {
    let mounted = true;
    getTour(id).then((data) => {
      if (mounted && data) {
        setTour(data);
        setInitialRoute(data.route || null);
        setStartPoint(fcToGeom(data.startPoint));
        setEndPoint(fcToGeom(data.endPoint));
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
    if (allGraphics.length === 0) return null;
    const features = allGraphics.map((g) => {
      const norm = to4326(g.geometry)
      const json = norm.toJSON()
      return {
        type: "Feature",
        geometry: {type: norm.type, ...json},
        properties: {...(g.attributes || {}), symbol: g.symbol.toJSON()},
      }
    })
    return {type: "FeatureCollection", features};
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
      startPoint: {type: "FeatureCollection", features: startPoint ? [toGeoJSONPoint(startPoint)] : []},
      endPoint: {type: "FeatureCollection", features: endPoint ? [toGeoJSONPoint(endPoint)] : []},
    };

    await saveTour(finalTour);
    setTour(finalTour);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const handleEndpointChange = ({start, end}) => {
    setStartPoint(start || null);
    setEndPoint(end || null);
  };

  if (!tour) {
    return (
      <div className="td-loading">
        Loading tour...
      </div>
    );
  }

  return (
    <div className="td-wrap">

      <div className="td-sidebar">
        <h2 className="td-title">{copy.editorTitle}</h2>
        <p className="td-subtitle">{tour.title}</p>

        <div className="td-status">
          <span className={tour.published ? "td-status-chip td-status-published" : "td-status-chip"}>
            {tour.published ? copy.published : copy.draft}
          </span>
        </div>

        <div className="td-endpoints">
          <div className="td-endpoint">
            <div className="td-endpoint-head">
              <span className="td-dot td-dot-start" />
              <span className="td-endpoint-label">{copy.startLabel}</span>
            </div>
            <button
              onClick={() => setPointMode(pointMode === "start" ? null : "start")}
              className={pointMode === "start" ? "td-endpoint-btn td-active-start" : "td-endpoint-btn"}
            >
              {pointMode === "start" ? copy.startClick : startPoint ? copy.startChange : copy.startAdd}
            </button>
          </div>

          <div className="td-endpoint">
            <div className="td-endpoint-head">
              <span className="td-dot td-dot-end" />
              <span className="td-endpoint-label">{copy.endLabel}</span>
            </div>
            <button
              onClick={() => setPointMode(pointMode === "end" ? null : "end")}
              className={pointMode === "end" ? "td-endpoint-btn td-active-end" : "td-endpoint-btn"}
            >
              {pointMode === "end" ? copy.endClick : endPoint ? copy.endChange : copy.endAdd}
            </button>
          </div>
        </div>

        <button onClick={handleSaveRoute} className="td-save">
          {saved ? copy.saved : copy.save}
        </button>

        <button onClick={() => navigate("/trips")} className="td-back">
          {copy.back}
        </button>

        {saved && (
          <p className="td-saved">{copy.savedMessage}</p>
        )}
      </div>

      <div className="td-map">
        <MainMap onViewReady={setView} />
        <EditMode
          view={view}
          onRegister={registerTool}
          initialRoute={initialRoute}
          defaultTool={null}
        />
        <StartEndDrawer
          view={view}
          mode={pointMode}
          initialStart={startPoint}
          initialEnd={endPoint}
          onChange={handleEndpointChange}
        />
      </div>

    </div>
  )
}

export default TripDraw
