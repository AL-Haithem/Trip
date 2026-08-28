import {useState, useEffect, useRef} from "react"
import {useParams, useNavigate} from "react-router"

import TripDrawMap from "../Editor/TripDrawMap/TripDrawMap.jsx"
import {getTour, saveTour} from "../data/tourStore.js"
import {tripDraw as copy} from "../content/siteContent.js"
import Icon from "../components/ui/Icon.jsx"
import "../styles/tripDraw.css"

function TripDraw() {

  const {id} = useParams()
  const navigate = useNavigate()

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
        setHasStart(!!(data.startPoint && data.startPoint.features && data.startPoint.features.length))
      }
    })
    return () => { mounted = false }
  }, [id])

  // عند فتح الصفحة بلا نقطة بداية، ادخل تلقائياً وضع رسم البداية
  useEffect(() => {
    if (initialData && !(initialData.start && initialData.start.features && initialData.start.features.length)) {
      setPointMode("start")
    }
  }, [initialData])

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
