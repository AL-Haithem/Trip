import {useState, useEffect, useRef} from "react"
import {useParams, useNavigate} from "react-router"

import TripDrawMap from "../Editor/TripDrawMap/TripDrawMap.jsx"
import {getTour} from "../data/tourStore.js"
import {saveTripRoute} from "../services/tripApi.js"
import {tripDraw as copy, brand} from "../content/siteContent.js"
import Icon from "../components/ui/Icon.jsx"
import {usePopup} from "../components/ui/Popup.jsx"
import "../styles/tripDraw.css"

function TripDraw() {
  useEffect(() => {
    document.title = `Draw Route - ${brand.name}`
  }, [])

  const {id} = useParams()
  const navigate = useNavigate()
  const {showPopup} = usePopup()

  const [tour, setTour] = useState(null)
  const [saved, setSaved] = useState(false)
  const [pointMode, setPointMode] = useState(null)
  const [hasStart, setHasStart] = useState(false)


  // Initial editor load data (read once) //
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
        setHasStart(Boolean(data.startPoint?.coordinates?.length === 2))
      }
    })
    return () => { mounted = false }
  }, [id])

  // When opening the page with no starting point, automatically enter start-drawing mode
  useEffect(() => {
    if (initialData && !(initialData.start && initialData.start.coordinates?.length === 2)) {
      setPointMode("start")
    }
  }, [initialData])

  const handleSaveRoute = async () => {
    if (!tour) return
    const editorData = editorRef.current ? editorRef.current.getData() : null

    if (!editorData?.route || !editorData.startPoint) {
      showPopup("A valid route and start point are required.")
      return
    }

    try {
      const response = await saveTripRoute(id, {
        route: editorData.route,
        startPoint: editorData.startPoint,
      })
      setTour(prev => ({...prev, route: editorData.route, startPoint: editorData.startPoint, distanceKm: response.data?.distanceKm || editorData.distanceKm}))
      setSaved(true)
      showPopup(response.message || "Trip route saved successfully", "success")
      setTimeout(() => setSaved(false), 1500)
    } catch (error) {
      showPopup(error.response?.data?.message || error.message || "Could not save the trip route.")
    }
  }

  if (!tour || !initialData) {
    return <div className="td-loading">Loading tour...</div>
  }

  return (
    <div className="td-wrap">

      <div className="td-map">
        <TripDrawMap
          ref={editorRef}
          initialRoute={initialData.route}
          initialStart={initialData.start}
          pointMode={pointMode}
          setPointMode={setPointMode}
          onPlace={() => setPointMode(null)}
          onPointsChange={(s) => {setHasStart(s)}}
        />
      </div>

      <div className="td-float-left">
        <div className="td-float-row">
          <button onClick={() => navigate("/trips")} className="td-float-back" title={copy.back}>
            <Icon name="arrow-left" />
          </button>
          <div className="td-wm-title">{copy.editorTitle}</div>
        </div>
      </div>

      <div className="td-float-right">
        <div className="td-float-row">
          <button onClick={handleSaveRoute} className="td-float-save">
            {saved ? copy.saved : copy.save}
          </button>
          <div className="td-float-name" title={tour.title}>{tour.title}</div>
        </div>
        {saved && (
          <p className="td-float-saved">{copy.savedMessage}</p>
        )}
      </div>

    </div>
  )
}

export default TripDraw
