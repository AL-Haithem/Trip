import {useEffect, useRef} from "react"

import Map from "@arcgis/core/Map"
import MapView from "@arcgis/core/views/MapView"

import WorldLayer from "./Layers/BackMapLayer.jsx"
import CountryLayer from "./Layers/CountryLayer.jsx"

function MainMap({onViewReady}) {

  const mapRef = useRef(null)

  useEffect(() => {

    const map = new Map({basemap: null})

    const view = new MapView({
      container: mapRef.current,
      map,
      center: [3, 25],
      scale: 250 * 100000,
      constraints: {
        minScale: 1600 * 100000,
        maxScale: 5 * 100000
      },
      background: {color: "#0d1117"}
    })

    map.add(WorldLayer())
    map.add(CountryLayer("DZA"))

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

  }, [])

  return (
    <div
      ref={mapRef}
      style={{
        width: "100%",
        height: "900px",
      }}
    />
  )
}

export default MainMap