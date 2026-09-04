import {useState, useEffect, useRef} from "react"
import {useParams, useNavigate, useLocation} from "react-router"

import TripDrawMap from "../Editor/TripDrawMap/TripDrawMap.jsx"
import {getTripRoute, saveTripRoute} from "../services/tripApi.js"
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
  const location = useLocation()
  const {showPopup, confirmPopup} = usePopup()

  const [tour, setTour] = useState({title: location.state?.title || ""})
  const [saved, setSaved] = useState(false)
  const [pointMode, setPointMode] = useState(null)
  const [routeError, setRouteError] = useState("")
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [distanceKm, setDistanceKm] = useState(0)


  // Initial editor load data (read once) //
  const [initialData, setInitialData] = useState(null)

  const editorRef = useRef(null)
  const allowNavigationRef = useRef(false)

  useEffect(() => {
    let mounted = true
    getTripRoute(id).then((response) => {
      if (mounted && response?.data) {
        setInitialData({
          route: response.data.route || null,
          start: response.data.startPoint || null,
          distanceKm: response.data.distanceKm || 0,
        })
      }
    }).catch((error) => {
      if (!mounted) return
      const message = error.response?.data?.message || error.message || "Could not load the trip route."

      if (message === "Trip route not found") {
        setInitialData({route: null, start: null, distanceKm: 0})
        return
      }

      setRouteError(message)
      showPopup(message)
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
      editorRef.current?.markSaved()
      setHasUnsavedChanges(false)
      setSaved(true)
      showPopup(response.message || "Trip route saved successfully", "success")
      setTimeout(() => setSaved(false), 1500)
    } catch (error) {
      showPopup(error.response?.data?.message || error.message || "Could not save the trip route.")
    }
  }

  const confirmLeave = async (destination) => {
    if (!hasUnsavedChanges) {
      navigate(destination)
      return
    }
    const confirmed = await confirmPopup("You have unsaved route changes. Leave without saving?", {
      title: "Leave without saving?",
      confirmLabel: "Leave",
      icon: "triangle-exclamation",
    })
    if (confirmed) {
      allowNavigationRef.current = true
      navigate(destination)
    }
  }

  const handlePreview = () => {
    const editorData = editorRef.current?.getData()
    if (!editorData?.route || !editorData.startPoint) {
      showPopup("Add a start point and at least one route segment before previewing.")
      return
    }
    allowNavigationRef.current = true
    navigate(`/Preview/${id}`, {
      state: {
        previewData: {
          title: tour.title,
          route: editorData.route,
          startPoint: editorData.startPoint,
          distanceKm: editorData.distanceKm,
        },
      },
    })
  }

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (!hasUnsavedChanges) return
      event.preventDefault()
      event.returnValue = ""
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [hasUnsavedChanges])

  if (routeError) {
    return <div className="td-loading">{routeError}</div>
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
          onDirtyChange={setHasUnsavedChanges}
          onDistanceChange={setDistanceKm}
        />
      </div>

      <div className="td-float-left">
        <div className="td-float-row">
          <button onClick={() => confirmLeave("/trips")} className="td-float-back" title={copy.back}>
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
          <button onClick={handlePreview} className="td-float-preview" title="Preview trip">
            <Icon name="eye" />
          </button>
          <div className="td-float-name" title={tour.title}>{tour.title}</div>
        </div>
        {saved && (
          <p className="td-float-saved">{copy.savedMessage}</p>
        )}
      </div>

      <div className="td-distance-badge">Distance: {distanceKm.toFixed(1)} km</div>

    </div>
  )
}

export default TripDraw
