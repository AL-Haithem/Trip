import {useEffect, useRef} from "react"

import Map from "@arcgis/core/Map"
import MapView from "@arcgis/core/views/MapView"

import WorldLayer from "./Layers/WorldLayer.jsx"
import CountryLayer from "./Layers/CountryLayer.jsx"
import {SUPPORTED_COUNTRIES} from "./countries.js"
import {getMapColors} from "./mapTheme.js"

function MainMap({onViewReady}) {

  const mapRef = useRef(null)

  useEffect(() => {
    const c = getMapColors("dark")

    const map = new Map({basemap: null})

    const view = new MapView({
      container: mapRef.current,
      map,
      center: [10, 20],
      scale: 1200 * 100000,
      constraints: {
        minScale: 4000 * 100000,
        maxScale: 5 * 100000
      },
      background: {color: c.bg}
    })

    map.add(WorldLayer("dark"))

    SUPPORTED_COUNTRIES.filter(country => country.enabled && country.file).forEach(country => {
      map.add(CountryLayer("dark", country.file))
    })

    const MAX_LAT = 85
    const clampLat = (lat) => Math.max(-MAX_LAT, Math.min(MAX_LAT, lat))
    let adjusting = false
    view.watch("center", (center) => {
      if (!center || adjusting) return
      const lat = center.latitude
      if (lat > MAX_LAT || lat < -MAX_LAT) {
        adjusting = true
        view.center = [center.longitude, clampLat(lat)]
        adjusting = false
      }
    })

    if (onViewReady) onViewReady(view)

    return () => {
      try {
        view.destroy()
      } catch (err) {
        console.error("MainMap: failed to destroy view", err)
      }
    }

  }, [onViewReady])

  return (
    <div
      ref={mapRef}
      className="map-canvas map-canvas-main"
    />
  )
}

export default MainMap
