import {useState, useEffect} from "react"
import {useNavigate} from "react-router"

import {getTours} from "../services/mockApi.js"
import SidePanel from "../components/SidePanel.jsx"
import HomeMap from "../Maps/HomeMap.jsx"
import Button from "../components/ui/Button.jsx"
import {home as copy} from "../content/siteContent.js"
import "../styles/home.css"

function HomePage() {
  const [tours, setTours] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [view, setView] = useState("map")
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true
    getTours().then((data) => {
      if (!mounted) return
      const published = (data || []).filter((t) => t.published)
      setTours(published)
      setActiveId(published.length ? published[0].id : null)
    })
    return () => { mounted = false }
  }, [])

  const handleView = (id) => {
    const tour = tours.find((t) => t.id === id)
    if (tour) {
      setView("preview")
      setActiveId(id)
    }
  }

  return (
    <div className="home-wrap">
      <div className="home-map">
        <HomeMap tours={tours} activeId={activeId} onSelectTrip={setActiveId} />
      </div>

      <SidePanel
        tours={tours}
        activeId={activeId}
        onSelect={setActiveId}
        onView={handleView}
      />

      {view === "preview" && (
        <div className="home-preview">
          <span className="home-preview-dot">●</span>
          <span className="home-preview-text">
            {copy.previewPrefix}{" "}
            <span className="home-preview-title">
              {tours.find((t) => t.id === activeId)?.title}
            </span>
          </span>
          <Button variant="ghost" size="sm" onClick={() => setView("map")}>{copy.backToMap}</Button>
        </div>
      )}
    </div>
  )
}

export default HomePage
