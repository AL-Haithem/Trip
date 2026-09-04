import {useState, useRef, useEffect, useCallback, useImperativeHandle, forwardRef} from "react"
import Map, {Source, Layer} from "react-map-gl/maplibre"
import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"

import {useMapController} from "../../Maps/UseStates/useMapController.js"
import Icon from "../../components/ui/Icon.jsx"
import {WAYPOINT_TYPES} from "../../content/waypointTypes.js"
import { ROUTE_LINE_PAINT, START_COLOR, END_COLOR, ROUTE_PIN_COLOR, START_ICON, END_ICON, WAYPOINT_COLORS } from "./theme.js"
import { TripDrawToolbar } from "./components/TripDrawToolbar.jsx"
import "./style.css"

export function pinSvg(typeId, selected) {
  const type = WAYPOINT_TYPES.find(t => t.id === typeId)
  const color = WAYPOINT_COLORS[typeId] || ROUTE_PIN_COLOR
  const iconPath = type ? type.path : DEFAULT_PIN_PATH
  const vb = type ? type.vb : 384
  const size = selected ? 38 : 34
  const stroke = selected ? "#ff4c4c" : "#06210b"
  const strokeW = selected ? 2.2 : 1.8
  return (
    `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 36 36'>` +
    `<circle cx='18' cy='18' r='15' fill='${color}' stroke='${stroke}' stroke-width='${strokeW}'/>` +
    `<svg x='9' y='9' width='18' height='18' viewBox='0 0 ${vb} ${vb}' preserveAspectRatio='xMidYMid meet'>` +
    `<path d='${iconPath}' fill='#fff'/></svg></svg>`
  )
}

function vbOf(type) { return type ? type.vb : 384 }
const DEFAULT_PIN_PATH = "M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"

export function flagSvg(kind) {
  const flagPath = "M32 0C49.7 0 64 14.3 64 32V48l69-17.2c38.1-9.5 78.3-5.1 113.5 12.5c46.3 23.2 100.8 23.2 147.1 0l9.6-4.8C423.8 28.1 448 43.1 448 66.1V345.8c0 13.3-8.3 25.3-20.8 30l-34.7 13c-46.2 17.3-97.6 14.6-141.7-7.4c-37.9-19-81.3-23.7-122.5-13.4L64 384v96c0 17.7-14.3 32-32 32s-32-14.3-32-32V400 334 64 32C0 14.3 14.3 0 32 0zM64 187.1l64-13.9v65.5L64 252.6V318l48.8-12.2c5.1-1.3 10.1-2.4 15.2-3.3V238.7l38.9-8.4c8.3-1.8 16.7-2.5 25.1-2.1l0-64c13.6 .4 27.2 2.6 40.4 6.4l23.6 6.9v66.7l-41.7-12.3c-7.3-2.1-14.8-3.4-22.3-3.8v71.4c21.8 1.9 43.3 6.7 64 14.4V244.2l22.7 6.7c13.5 4 27.3 6.4 41.3 7.4V194c-7.8-.8-15.6-2.3-23.2-4.5l-40.8-12v-62c-13-3.8-25.8-8.8-38.2-15c-8.2-4.1-16.9-7-25.8-8.8v72.4c-13-.4-26 .8-38.7 3.6L128 173.2V98L64 114v73.1zM320 335.7c16.8 1.5 33.9-.7 50-6.8l14-5.2V251.9l-7.9 1.8c-18.4 4.3-37.3 5.7-56.1 4.5v77.4zm64-149.4V115.4c-20.9 6.1-42.4 9.1-64 9.1V194c13.9 1.4 28 .5 41.7-2.6l22.3-5.2z"
  const ic = {
    start: {vb: 448, path: flagPath},
    end: {vb: 448, path: flagPath}
  }[kind]
  // start = white circle black icon, end = red circle black icon - padding improved so icon not touches border
  const color = kind === "start" ? START_COLOR : END_COLOR
  const iconFill = "#06210b"
  return (
    `<svg xmlns='http://www.w3.org/2000/svg' width='36' height='36' viewBox='0 0 36 36'>` +
    `<circle cx='18' cy='18' r='15' fill='${color}' stroke='#06210b' stroke-width='1.8'/>` +
    `<svg x='9.5' y='9.5' width='17' height='17' viewBox='0 0 ${ic.vb} ${ic.vb}' preserveAspectRatio='xMidYMid meet'>` +
    `<path d='${ic.path}' fill='${iconFill}'/></svg></svg>`
  )
}

function svgToUrl(svg) {
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg)
}

function setMarkerIcon(element, svg) {
  const image = document.createElement("img")
  image.src = svgToUrl(svg)
  image.alt = ""
  image.draggable = false
  image.style.display = "block"
  image.style.width = "100%"
  image.style.height = "100%"
  image.style.pointerEvents = "none"
  element.appendChild(image)
}

function haversineKm(a, b) {
  const R = 6371
  const dLat = (b.lat - a.lat) * Math.PI / 180
  const dLng = (b.lng - a.lng) * Math.PI / 180
  const s = Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(s))
}

function computeDistance(verts) {
  let d = 0
  for (let i = 1; i < verts.length; i++) d += haversineKm(verts[i - 1], verts[i])
  return d.toFixed(1)
}

function parseInitial(routeFc, startFc, endFc) {
  const readPoint = (fc) => {
    const f = fc?.type === "Point" ? fc : fc && fc.features && fc.features[0]
    if (!f) return null

    const coordinates = f.type === "Point" ? f.coordinates : f.geometry?.coordinates
    if (!Array.isArray(coordinates)) return null
    return {lng: coordinates[0], lat: coordinates[1]}
  }
  const start = readPoint(startFc)
  const waypoints = []
  let verts = []
  const features = routeFc && routeFc.features ? routeFc.features : []
  // verts types stored as array in LineString properties.vertTypes or per-feature
  let pendingVertTypes = null
  features.forEach((f, i) => {
    const g = f.geometry
    if (!g) return
    if (g.type === "LineString") {
      const coords = g.coordinates
      let types = f.properties?.vertTypes
      let labels = f.properties?.vertLabels
      const vertices = f.properties?.vertices
      if (Array.isArray(vertices)) {
        types = vertices.map((vertex) => vertex?.type || null)
        labels = vertices.map((vertex) => vertex?.label || null)
      }
      // Legacy safety: if vertTypes length matches coordinates (includes start), drop the first
      if (types && types.length === coords.length) types = types.slice(1)
      if (labels && labels.length === coords.length) labels = labels.slice(1)
      // coords[0] is the start (excluded from verts); vertTypes[idx] maps to coords[idx+1]
      verts = coords.slice(1).map(([lng, lat], idx) => ({
        lng, lat,
        type: (types && types[idx]) || "Normal",
        label: (labels && labels[idx]) || null,
      }))
      pendingVertTypes = types
    } else if (g.type === "Point") {
      // Ignore verts/endpoints saved as Point to avoid duplicates
      if (f.properties?.isRouteVertex || f.properties?.kind === "endpoint") return
      const lng = g.coordinates[0]
      const lat = g.coordinates[1]
      // Ignore any Point matching start or a vert coordinate (duplicate legacy data)
      const dupOfVert = verts.some(v => v.lng === lng && v.lat === lat)
      if (dupOfVert) return
      if (start && start.lng === lng && start.lat === lat) return
      waypoints.push({
        id: "w" + i,
        lng, lat,
        type: f.properties?.waypointType || "rest",
        label: f.properties?.waypointLabel || null,
      })
    }
  })
  // if verts were saved as individual Point features with waypointType (fallback)
  if (verts.length === 0 && waypoints.length > 0) {
    // no LineString found, keep waypoints as is
  }
  // Legacy cleanup: if both ends (first & last vert) match the start due to prior duplication,
  // remove the extra first vert (it showed as a duplicate circle at the start)
  if (verts.length > 1 && start &&
      verts[0].lng === start.lng && verts[0].lat === start.lat &&
      verts[verts.length - 1].lng === start.lng && verts[verts.length - 1].lat === start.lat) {
    verts = verts.slice(1)
  }
  return {waypoints, verts, start, end: readPoint(endFc)}
}

function composeRoute(s) {
  const coords = []
  if (!s.startPoint) return coords
  coords.push(s.startPoint)
  if (s.verts && s.verts.length > 0) {
    s.verts.forEach(v => coords.push(v))
  }
  return coords
}

const TripDrawMap = forwardRef(function TripDrawMap(
  {initialRoute, initialStart, initialEnd, pointMode, setPointMode, onPointsChange, onDirtyChange, onDistanceChange, onPlace},
  ref
) {
  const {mapStyle} = useMapController()
  const parsed = useRef(parseInitial(initialRoute, initialStart, initialEnd))
  const [mapReady, setMapReady] = useState(false)
  const mapRef = useRef(null)
  const routeSourceRef = useRef(null)

  const [waypoints, setWaypoints] = useState(parsed.current.waypoints)
  const [verts, setVerts] = useState(parsed.current.verts)
  const [startPoint, setStartPoint] = useState(parsed.current.start)
  const [endPoint, setEndPoint] = useState(parsed.current.end)


  const [activeTool, setActiveTool] = useState(null)
  const [selWaypoint, setSelWaypoint] = useState(null)
  const [selVertex, setSelVertex] = useState(null)
  const [showTypeMenu, setShowTypeMenu] = useState(false)
  const [showLabelInput, setShowLabelInput] = useState(false)
  const [history, setHistory] = useState([])


  const stateRef = useRef({})
  const historyRef = useRef([])
  const initialStateSignature = useRef(null)

  useEffect(() => {
    stateRef.current = {waypoints, verts, startPoint, endPoint, activeTool, pointMode, selWaypoint, selVertex}
    historyRef.current = history
  })

  useEffect(() => {
    const signature = JSON.stringify({waypoints, verts, startPoint, endPoint})
    if (initialStateSignature.current === null) {
      initialStateSignature.current = signature
      onDirtyChange?.(false)
    } else {
      onDirtyChange?.(signature !== initialStateSignature.current)
    }
    const route = composeRoute({startPoint, verts})
    onDistanceChange?.(route.length >= 2 ? Number(computeDistance(route)) : 0)
  }, [endPoint, onDirtyChange, onDistanceChange, startPoint, verts, waypoints])

  useEffect(() => {
    if (onPointsChange) onPointsChange(!!startPoint)
  }, [startPoint, onPointsChange])

  const markersRef = useRef([])

  const pushHistory = useCallback(() => {
    const s = stateRef.current
    setHistory(prev => [...prev, {
      waypoints: s.waypoints.map(w => ({...w})),
      verts: s.verts.map(v => ({...v})),
    }])
  }, [])

  const clearSelection = useCallback(() => {
    setSelWaypoint(null)
    setSelVertex(null)
    setShowTypeMenu(false)
    setShowLabelInput(false)
  }, [])

  useImperativeHandle(ref, () => ({
    getData() {
      const s = stateRef.current
      const features = []
      const routeCoords = composeRoute(s)
      if (routeCoords.length >= 2) {
        features.push({
          type: "Feature",
          geometry: {type: "LineString", coordinates: routeCoords.map(v => [v.lng, v.lat])},
          properties: {
            routePath: true,
            vertices: routeCoords.map((v, index) => ({
              coordinates: [v.lng, v.lat],
              ...(index === 0
                ? {type: "start", label: "Starting point"}
                : {
                    ...(s.verts[index - 1]?.type ? {type: s.verts[index - 1].type} : {}),
                    ...(s.verts[index - 1]?.label ? {label: s.verts[index - 1].label} : {}),
                  }),
            })),
          },
        })
      }
      const dist = routeCoords.length >= 2 ? parseFloat(computeDistance(routeCoords)) : 0
      
      const lastVert = s.verts && s.verts.length > 0 ? s.verts[s.verts.length - 1] : null

      return {
        route: features.length > 0 ? {type: "FeatureCollection", features} : null,
        distanceKm: dist,
        startPoint: s.startPoint ? {type: "Point", coordinates: [s.startPoint.lng, s.startPoint.lat]} : null,
        endPoint: lastVert ? {type: "Point", coordinates: [lastVert.lng, lastVert.lat]} : null,
      }
    },
    markSaved() {
      initialStateSignature.current = JSON.stringify({
        waypoints: stateRef.current.waypoints,
        verts: stateRef.current.verts,
        startPoint: stateRef.current.startPoint,
        endPoint: stateRef.current.endPoint,
      })
      onDirtyChange?.(false)
    },
  }), [onDirtyChange])

  const setDataLive = useCallback(() => {
    const src = routeSourceRef.current
    if (!src) return
    const coords = composeRoute(stateRef.current)
    if (coords.length >= 2) {
      src.setData({
        type: "FeatureCollection",
        features: [{
          type: "Feature",
          geometry: {type: "LineString", coordinates: coords.map(p => [p.lng, p.lat])},
          properties: {},
        }],
      })
    } else {
      src.setData({type: "FeatureCollection", features: []})
    }
  }, [])

  useEffect(() => {
    setDataLive()
  }, [verts, startPoint, endPoint, setDataLive])

  const markerSignature =
    waypoints.map(w => `${w.id}:${w.lng.toFixed(5)}:${w.lat.toFixed(5)}:${w.type}:${w.label || ""}:${selWaypoint === w.id ? 1 : 0}`).join("|") +
    "@" +
    verts.map((v, i) => `${v.lng.toFixed(5)}:${v.lat.toFixed(5)}:${v.type || ""}:${v.label || ""}:${selVertex === i ? 1 : 0}`).join(",") +
    "@" +
    (startPoint ? `${startPoint.lng.toFixed(5)}:${startPoint.lat.toFixed(5)}` : "") +
    (endPoint ? `e:${endPoint.lng.toFixed(5)}:${endPoint.lat.toFixed(5)}` : "") +
    "@" + (pointMode || "")

  useEffect(() => {
    const map = mapRef.current
    if (!mapReady || !map) return

    markersRef.current.forEach(m => m.remove())
    markersRef.current = []
    const created = []

    const appendLabel = (el, text) => {
      if (text) {
        const lab = document.createElement("div")
        lab.className = "td-marker-label"
        lab.textContent = text
        el.appendChild(lab)
      }
    }

    waypoints.forEach((w) => {
      const el = document.createElement("div")
      const isDefault = !w.type || w.type.toLowerCase() === "normal"
      if (isDefault) {
        el.className = "td-vtx" + (selWaypoint === w.id ? " td-vtx-selected" : "")
        el.style.borderColor = ROUTE_PIN_COLOR
      } else {
        el.className = "td-endpoint-marker" + (selWaypoint === w.id ? " td-pin-selected" : "")
        setMarkerIcon(el, pinSvg(w.type, selWaypoint === w.id))
      }
      el.title = isDefault ? "" : ((WAYPOINT_TYPES.find(t => t.id === w.type) || {}).label || "")
      appendLabel(el, w.label)
      el.addEventListener("click", (e) => {
        e.stopPropagation()
        setSelVertex(null)
        setShowTypeMenu(selWaypoint !== w.id)
        setSelWaypoint(selWaypoint === w.id ? null : w.id)
      })
      const m = new maplibregl.Marker({element: el, draggable: true, anchor: 'center'})
        .setLngLat([w.lng, w.lat])
        .addTo(map)
      m.on("dragstart", () => pushHistory())
      m.on("dragend", () => {
        const ll = m.getLngLat()
        setWaypoints(prev => prev.map(x =>
          x.id === w.id ? {...x, lng: ll.lng, lat: ll.lat} : x
        ))
      })
      created.push(m)
    })

    verts.forEach((v, i) => {
      const isLast = i === verts.length - 1
      const el = document.createElement("div")
      if (isLast) {
        el.className = "td-endpoint-marker td-endpoint-end" + (selVertex === i ? " td-vtx-selected" : "")
        setMarkerIcon(el, flagSvg("end"))
      } else {
        const isDefault = !v.type || v.type.toLowerCase() === "normal"
        if (isDefault) {
          el.className = "td-vtx" + (selVertex === i ? " td-vtx-selected" : "")
          el.style.borderColor = ROUTE_PIN_COLOR
        } else {
          el.className = "td-endpoint-marker" + (selVertex === i ? " td-pin-selected" : "")
          setMarkerIcon(el, pinSvg(v.type, selVertex === i))
        }
      }
      appendLabel(el, v.label)

      el.addEventListener("click", (e) => {
        e.stopPropagation()
        setSelWaypoint(null)
        setShowTypeMenu(false)
        setSelVertex(selVertex === i ? null : i)
      })
      const anchor = 'center'
      const m = new maplibregl.Marker({element: el, draggable: true, anchor})
        .setLngLat([v.lng, v.lat])
        .addTo(map)
      m.on("dragstart", () => pushHistory())
      m.on("drag", () => {
        const ll = m.getLngLat()
        const next = [...stateRef.current.verts]
        next[i] = {lng: ll.lng, lat: ll.lat, type: next[i].type, label: next[i].label}
        stateRef.current.verts = next
        setDataLive()
      })
      m.on("dragend", () => {
        const ll = m.getLngLat()
        setVerts(prev => prev.map((x, j) =>
          j === i ? {lng: ll.lng, lat: ll.lat, type: x.type, label: x.label} : x
        ))
      })
      created.push(m)
    })

    const endpoints = [["start", startPoint]]
    endpoints.forEach(([kind, p]) => {
      if (!p) return
      const canDrag = pointMode === kind
      const el = document.createElement("div")
      el.className = "td-endpoint-marker td-endpoint-" + kind + (canDrag ? " td-endpoint-unlocked" : " td-endpoint-locked")
      setMarkerIcon(el, flagSvg(kind))
      
      el.title = canDrag
        ? (kind === "start" ? "Start — drag to move" : "End — drag to move")
        : (kind === "start" ? "Start (locked — use Change Start Point)" : "End (locked — use Change End Point)")
      el.addEventListener("click", (e) => e.stopPropagation())
      const m = new maplibregl.Marker({element: el, draggable: canDrag, anchor: 'center'})
        .setLngLat([p.lng, p.lat])
        .addTo(map)
      if (canDrag) {
        m.on("drag", () => {
          const ll = m.getLngLat()
          if (kind === "start") stateRef.current.startPoint = {lng: ll.lng, lat: ll.lat}
          setDataLive()
        })
        m.on("dragend", () => {
          const ll = m.getLngLat()
          const setter = kind === "start" ? setStartPoint : null
          if (setter) setter({lng: ll.lng, lat: ll.lat})
        })
      }
      created.push(m)
    })

    markersRef.current = created

    return () => {
      created.forEach(m => m.remove())
      markersRef.current = []
    }
  }, [mapReady, markerSignature, pushHistory])

  useEffect(() => {
    const map = mapRef.current
    if (!mapReady || !map) return
    const grabbing = pointMode || activeTool
    map.getCanvas().style.cursor = grabbing ? "crosshair" : ""
  }, [mapReady, pointMode, activeTool])

  const handleMapClick = useCallback((e) => {
    const s = stateRef.current
    if (s.pointMode) {
      const {lng, lat} = e.lngLat
      if (s.pointMode === "start") {
        setStartPoint({lng, lat})
        if (onPointsChange) onPointsChange(true)
      }
      if (onPlace) onPlace()
      return
    }
    if (s.activeTool === "polyline") {
      pushHistory()
      const newVertex = {lng: e.lngLat.lng, lat: e.lngLat.lat, type: null, label: null}
      const curLen = s.verts.length
      setVerts(prev => [...prev, newVertex])
      // The newest point is always the current endpoint.
      setSelVertex(curLen)
      setSelWaypoint(null)
      setShowTypeMenu(false)
      return
    }
    clearSelection()
  }, [pushHistory, clearSelection, onPointsChange, onPlace])

  const handleUndo = useCallback(() => {
    setHistory(prev => {
      if (prev.length === 0) return prev
      const snap = prev[prev.length - 1]
      setWaypoints(snap.waypoints)
      setVerts(snap.verts)
      setSelWaypoint(null)
      setSelVertex(null)
      setShowTypeMenu(false)
      return prev.slice(0, -1)
    })
  }, [])

  const handleDelete = useCallback(() => {
    const s = stateRef.current
    if (s.selWaypoint) {
      pushHistory()
      setWaypoints(prev => prev.filter(w => w.id !== s.selWaypoint))
      setSelWaypoint(null)
      setShowTypeMenu(false)
    } else if (s.selVertex !== null) {
      pushHistory()
      setVerts(prev => prev.filter((_, i) => i !== s.selVertex))
      setSelVertex(null)
    }
  }, [pushHistory])

  const handleChangeType = useCallback((typeId) => {
    const s = stateRef.current
    if (s.selWaypoint) {
      const id = s.selWaypoint
      setWaypoints(prev => prev.map(w => w.id === id ? {...w, type: typeId} : w))
      setShowTypeMenu(false)
      setSelWaypoint(null)
      return
    }
    if (s.selVertex !== null) {
      const idx = s.selVertex
      // Don't change the type of the last endpoint vert - it stays a flag
      if (idx === s.verts.length - 1) return
      setVerts(prev => prev.map((v, i) => i === idx ? {...v, type: typeId} : v))
      setShowTypeMenu(false)
      // keep selection to show color change
    }
  }, [])

  const handleSetLabel = useCallback((text) => {
    const s = stateRef.current
    const val = (text || "").trim() || null
    if (s.selWaypoint) {
      const id = s.selWaypoint
      setWaypoints(prev => prev.map(w => w.id === id ? {...w, label: val} : w))
    } else if (s.selVertex !== null) {
      const idx = s.selVertex
      setVerts(prev => prev.map((v, i) => i === idx ? {...v, label: val} : v))
    }
    setShowLabelInput(false)
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      const t = e.target
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return
      if (e.key === "Delete" || e.key === "Backspace") handleDelete()
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault()
        handleUndo()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [handleDelete, handleUndo])

  const handleLoad = useCallback((event) => {
    mapRef.current = event.target
    const src = event.target.getSource("edit-route-line")
    if (src) {
      routeSourceRef.current = src
      setDataLive()
    }
    setMapReady(true)
    const s = stateRef.current
    const routeFeature = initialRoute?.features?.find(
      (feature) => feature.geometry?.type === "LineString"
    )
    const routeCoordinates = routeFeature?.geometry?.coordinates || []
    const coords = routeCoordinates.length >= 2
      ? routeCoordinates
      : composeRoute(s).map((point) => [point.lng, point.lat])

    if (coords.length >= 2) {
      const bounds = new maplibregl.LngLatBounds()
      coords.forEach(c => bounds.extend(c))
      if (!bounds.isEmpty()) {
        event.target.fitBounds(bounds, {
          padding: {top: 80, bottom: 80, left: 80, right: 80},
          maxZoom: 16,
          duration: 2600,
          essential: true,
        })
        return
      }
    }
    if (s.startPoint) {
      event.target.flyTo({
        center: [s.startPoint.lng, s.startPoint.lat],
        zoom: 14,
        duration: 2600,
        essential: true,
      })
    }
  }, [setDataLive])

  const distance = computeDistance(composeRoute({startPoint, verts, endPoint}))
  const distanceText = composeRoute({startPoint, verts, endPoint}).length >= 2 ? distance : null
  const canUndo = history.length > 0
  const canDelete = selWaypoint !== null || selVertex !== null

  const currentLabel = selWaypoint
    ? ((waypoints.find(w => w.id === selWaypoint) || {}).label || "")
    : selVertex !== null
      ? ((verts[selVertex] || {}).label || "")
      : ""

  return (
    <div className="tdm-shell">
      {mapStyle && (
        <Map
          initialViewState={{longitude: 1, latitude: 35, zoom: 1.9, minZoom: 1.9, maxZoom: 20}}
          mapStyle={mapStyle}
          mapLib={maplibregl}
          style={{width: "100%", height: "100%"}}
          doubleClickZoom={false}
          dragRotate={false}
          touchZoomRotate={false}
          attributionControl={false}
          onLoad={handleLoad}
          onClick={handleMapClick}
        >
          <Source
            id="edit-route-line"
            type="geojson"
            data={{type: "FeatureCollection", features: []}}
          >
            <Layer id="edit-route-line-layer" type="line" paint={ROUTE_LINE_PAINT} />
          </Source>
        </Map>
      )}

      <TripDrawToolbar 
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        pointMode={pointMode}
        setPointMode={setPointMode}
        hasStart={!!startPoint}
        clearSelection={clearSelection}
        handleUndo={handleUndo}
        handleDelete={handleDelete}
        canUndo={canUndo}
        canDelete={canDelete}
        selWaypoint={selWaypoint}
        selVertex={selVertex}
        setShowTypeMenu={setShowTypeMenu}
        handleChangeType={handleChangeType}
        showTypeMenu={showTypeMenu}
        showLabelInput={showLabelInput}
        setShowLabelInput={setShowLabelInput}
        handleSetLabel={handleSetLabel}
        currentLabel={currentLabel}
        WAYPOINT_TYPES={WAYPOINT_TYPES}
        Icon={Icon}
      />

      {activeTool === "polyline" && (
        <div className="td-dist glass">
          {distanceText ? `Distance: ${distanceText} km` : "Route: click to add points"}
        </div>
      )}

      {pointMode && (
        <div className="td-dist glass">
          Click on the map to place the {pointMode} point...
        </div>
      )}
    </div>
  )
})

export default TripDrawMap
