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
        maxScale: 39 * 100000
      },
      background: {color: "#243656"}
    })

    map.add(WorldLayer())
    map.add(CountryLayer("DZA"))
    if (onViewReady) onViewReady(view)

    return () => {view.destroy()}

  }, [])

  return (
    <div
      ref={mapRef}
      style={{
        width: "80%",
        height: "819px"
      }}
    />
  )
}

export default MainMap