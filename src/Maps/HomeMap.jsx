import {useEffect, useRef} from "react"

import Map from "@arcgis/core/Map"
import MapView from "@arcgis/core/views/MapView"
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer"
import Graphic from "@arcgis/core/Graphic"
import Point from "@arcgis/core/geometry/Point"
import Polyline from "@arcgis/core/geometry/Polyline"

import WorldLayer from "./Layers/WorldLayer.jsx"
import CountryLayer from "./Layers/CountryLayer.jsx"
import {SUPPORTED_COUNTRIES} from "./countries.js"
import {getMapColors} from "./mapTheme.js"
import {WAYPOINT_TYPES, waypointPinUrl} from "../Editor/Tools/PointDrawer.jsx"
import {startEndPinUrl} from "../Editor/Tools/StartEndDrawer.jsx"

const TYPE_MAP = WAYPOINT_TYPES.reduce((acc, t) => {
  acc[t.id] = t
  return acc
}, {})

function makePinSymbol(typeId, active, c) {
  return {
    type: "picture-marker",
    url: waypointPinUrl(typeId, c),
    width: active ? "40px" : "34px",
    height: active ? "40px" : "34px",
    outline: {color: c.pinInk, width: 1},
  }
}

function HomeMap({tours, activeId, onSelectTrip}) {
  const mapRef = useRef(null)
  const viewRef = useRef(null)
  const layersRef = useRef({})
  const selectRef = useRef(onSelectTrip)
  selectRef.current = onSelectTrip
  const worldLayerRef = useRef(null)

  useEffect(() => {
    const c = getMapColors("dark")
    const map = new Map({basemap: null})

    const view = new MapView({
      container: mapRef.current,
      map,
      center: [10, 25],
      scale: 1600 * 100000,
      constraints: {
        minScale: 4000 * 100000,
        maxScale: 5 * 100000,
      },
      background: {color: c.bg},
    })
    viewRef.current = view

    const worldLayer = WorldLayer("dark")
    worldLayerRef.current = worldLayer
    map.add(worldLayer)

    SUPPORTED_COUNTRIES.filter(country => country.enabled).forEach(country => {
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

    const handleClick = (event) => {
      view.hitTest(event).then((res) => {
        const hit = (res.results || []).find((r) => r.graphic && r.graphic.attributes && r.graphic.attributes.tripId)
        if (hit && selectRef.current) selectRef.current(hit.graphic.attributes.tripId)
      }).catch(() => {})
    }
    const clickHandle = view.on("click", handleClick)

    return () => {
      try { clickHandle.remove() } catch {}
      try { view.destroy() } catch (e) { console.error("HomeMap: destroy failed", e) }
    }
  }, [])

  useEffect(() => {
    const view = viewRef.current
    const c = getMapColors("dark")
    if (!view) return

    Object.values(layersRef.current).forEach((l) => {
      try { view.map.remove(l) } catch {}
    })
    layersRef.current = {}

    tours.forEach((tour) => {
      const layer = new GraphicsLayer({id: `home-route-${tour.id}`})
      view.map.add(layer)
      layersRef.current[tour.id] = layer

      const isActive = tour.id === activeId
      const lineColorResolved = isActive ? "#0cff25" : c.routeIdle
      const lineWidth = isActive ? 4.5 : 2.6

      const features = (tour.route && tour.route.features) || []
      features.forEach((f) => {
        const g = f.geometry
        if (!g) return
        if (g.type === "polyline" || (g.paths !== undefined && !g.rings)) {
          layer.add(new Graphic({
            geometry: new Polyline(g),
            symbol: {type: "simple-line", color: lineColorResolved, width: lineWidth},
            attributes: {tripId: tour.id},
          }))
        } else if (g.type === "point" || (g.x !== undefined && g.y !== undefined)) {
          const typeId = f.properties && f.properties.waypointType
          layer.add(new Graphic({
            geometry: new Point(g),
            symbol: makePinSymbol(typeId, isActive, c),
            attributes: {tripId: tour.id},
          }))
        }
      })

      const drawEndpoint = (feature, kind) => {
        if (!feature || !feature.geometry) return
        const g = feature.geometry
        if (g.type === "point" || (g.x !== undefined && g.y !== undefined)) {
          layer.add(new Graphic({
            geometry: new Point(g),
            symbol: {
              type: "picture-marker",
              url: startEndPinUrl(kind, c),
              width: "36px",
              height: "36px",
            },
            attributes: {tripId: tour.id},
          }))
        }
      }

      const startFc = tour.startPoint
      const endFc = tour.endPoint
      if (startFc && startFc.features && startFc.features.length) {
        drawEndpoint(startFc.features[0], "start")
      }
      if (endFc && endFc.features && endFc.features.length) {
        drawEndpoint(endFc.features[0], "end")
      }
    })
  }, [tours, activeId])

  return (
    <div
      ref={mapRef}
      className="map-canvas map-canvas-home"
    />
  )
}

export default HomeMap
