import {useState, useEffect, useRef} from "react"
import {useParams, useNavigate} from "react-router"

import TripDrawMap from "../Editor/TripDrawMap/TripDrawMap.jsx"
import {getTour, saveTour} from "../data/tourStore.js"
import {tripDraw as copy} from "../content/siteContent.js"
import "../styles/tripDraw.css"

function TripDraw() {

  const {id} = useParams()
  const navigate = useNavigate()

  const [tour, setTour] = useState(null)
  const [saved, setSaved] = useState(false)
  const [pointMode, setPointMode] = useState(null)
  const [hasStart, setHasStart] = useState(false)


  // بيانات التحميل الأولية للمحرر (تُقرأ مرة واحدة) //
  const [initialData, setInitialData] = useState(null)

  const editorRef = useRef(null)

  useEffect(() => {
    let mounted = true
    getTour(id).then((data) => {
      if (mounted && data) {
        setTour(data)
        setInitialData({
          route: data.route || null,
          start: data.startPoint || null,
        })
        setHasStart(!!(data.startPoint && data.startPoint.features && data.startPoint.features.length))
      }
    })
    return () => { mounted = false }
  }, [id])

  const handleSaveRoute = async () => {
    if (!tour) return
    const editorData = editorRef.current ? editorRef.current.getData() : null

    const finalTour = {
      ...tour,
      route: editorData && editorData.route !== null ? editorData.route : tour.route,
      distanceKm: editorData && editorData.distanceKm ? editorData.distanceKm : tour.distanceKm,
      startPoint: editorData ? editorData.startPoint : tour.startPoint,
    }

    await saveTour(finalTour)
    setTour(finalTour)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  if (!tour || !initialData) {
    return <div className="td-loading">Loading tour...</div>
  }

  return (
    <div className="td-wrap">

      <div className="td-sidebar">
        <h2 className="td-title">{copy.editorTitle}</h2>
        <p className="td-subtitle">{tour.title}</p>

        <div className="td-status">
          <span className={tour.published ? "td-status-chip td-status-published" : "td-status-chip"}>
            {tour.published ? copy.published ?? "Published" : copy.draft ?? "Draft"}
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
              {pointMode === "start" ? copy.startClick : hasStart ? copy.startChange : copy.startAdd}
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
        <TripDrawMap
          ref={editorRef}
          initialRoute={initialData.route}
          initialStart={initialData.start}
          pointMode={pointMode}
          onPlace={() => setPointMode(null)}
          onPointsChange={(s) => {setHasStart(s)}}
        />
      </div>

    </div>
  )
}

export default TripDraw
