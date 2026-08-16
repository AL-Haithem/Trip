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
import {WAYPOINT_TYPES} from "../Editor/Tools/PointDrawer.jsx"

const TYPE_MAP = WAYPOINT_TYPES.reduce((acc, t) => {
  acc[t.id] = t
  return acc
}, {})

function emojiToDataUrl(emoji, pinBg, pinInk) {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 34 34">` +
    `<circle cx="17" cy="17" r="16" fill="${pinBg}" stroke="${pinInk}" stroke-width="1.5"/>` +
    `<text x="17" y="23" font-size="20" text-anchor="middle">${emoji}</text>` +
    `</svg>`
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg)
}

function makePinSymbol(typeId, active, c) {
  const t = TYPE_MAP[typeId]
  const emoji = t ? t.emoji : "📍"
  return {
    type: "picture-marker",
    url: emojiToDataUrl(emoji, c.pinBg, c.pinInk),
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
      try { clickHandle.remove() } catch (e) { /* noop */ }
      try { view.destroy() } catch (e) { console.error("HomeMap: destroy failed", e) }
    }
  }, [])

  useEffect(() => {
    const view = viewRef.current
    const c = getMapColors("dark")
    if (!view) return

    Object.values(layersRef.current).forEach((l) => {
      try { view.map.remove(l) } catch (e) { /* noop */ }
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

      const endpointSymbol = (color, label) => ({
        type: "picture-marker",
        url:
          "data:image/svg+xml;charset=utf-8," + encodeURIComponent(
            `<svg xmlns='http://www.w3.org/2000/svg' width='36' height='36' viewBox='0 0 36 36'>` +
            `<circle cx='18' cy='18' r='16' fill='${color}' stroke='${c.pinInk}' stroke-width='2'/>` +
            `<text x='18' y='24' font-size='20' text-anchor='middle' fill='${c.pinInk}' font-weight='bold' font-family='sans-serif'>${label}</text>` +
            `</svg>`
          ),
        width: "36px",
        height: "36px",
      })

      const drawEndpoint = (feature, color, label) => {
        if (!feature || !feature.geometry) return
        const g = feature.geometry
        if (g.type === "point" || (g.x !== undefined && g.y !== undefined)) {
          layer.add(new Graphic({
            geometry: new Point(g),
            symbol: endpointSymbol(color, label),
            attributes: {tripId: tour.id},
          }))
        }
      }

      const startFc = tour.startPoint
      const endFc = tour.endPoint
      if (startFc && startFc.features && startFc.features.length) {
        drawEndpoint(startFc.features[0], "#0cff25", "S")
      }
      if (endFc && endFc.features && endFc.features.length) {
        drawEndpoint(endFc.features[0], "#ff4c4c", "E")
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
