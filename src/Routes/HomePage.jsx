import { useEffect } from "react"
import HomeMap from "../Maps/HomeMap.jsx"
import {brand} from "../content/siteContent.js"
import "../styles/home.css"

function HomePage() {
  useEffect(() => {
    document.title = `Browse Trips - ${brand.name}`
  }, [])
  return (

    <div className="home-wrap">
      <div className="home-map">
        <HomeMap />
      </div>
    </div>
  )
}

export default HomePage
