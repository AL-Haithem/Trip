import { useState, useEffect, useRef, useCallback } from "react"
import Map, { useMap, Source, Layer } from "react-map-gl/maplibre"
import "maplibre-gl/dist/maplibre-gl.css"
import "../styles/maps.css"
import maplibregl from "maplibre-gl"
import { useMapController } from "../Maps/useMapController.js"
import { FpsMeter } from "../components/ui/FpsMeter.jsx"
import { CountryHoverLayer, WilayaHoverLayer } from "../Maps/HoverLayers.jsx"
import { isSmallScreen, setBuilding3DVisibility } from "../Maps/building3d.js"

// ─── Zoom Slider ───────────────────────────────────────────────────────────────
function MapControls({ minZoom, maxZoom }) {
  const { current: map } = useMap()
  const [zoom, setZoom] = useState(minZoom)
  const [is3D, setIs3D] = useState(false)
  const zoomThumbRef = useRef(null)
  const smallScreen = isSmallScreen()
  const canUse3D = !smallScreen && zoom >= 15

  useEffect(() => {
    if (!map) return
    setZoom(map.getZoom())
    setIs3D(map.getPitch() > 0)
    const onZoom = () => setZoom(map.getZoom())
    const onPitch = () => setIs3D(map.getPitch() > 0)
    map.on("zoom", onZoom)
    map.on("pitch", onPitch)
    return () => { map.off("zoom", onZoom); map.off("pitch", onPitch) }
  }, [map])

  useEffect(() => {
    if (!map) return
    const syncBuildings = () => setBuilding3DVisibility(map, canUse3D && is3D, zoom)
    if (!canUse3D && is3D) {
      map.easeTo({ pitch: 0, bearing: 0, duration: 500 })
      setIs3D(false)
    }
    syncBuildings()
  }, [canUse3D, is3D, map, zoom])

  const zoomIn = () => map && map.zoomTo(Math.min(zoom + 1, maxZoom), { duration: 300 })
  const zoomOut = () => map && map.zoomTo(Math.max(zoom - 1, minZoom), { duration: 300 })
  
  const toggle3D = () => {
    if (!map || !canUse3D) return
    if (is3D) {
      map.easeTo({ pitch: 0, bearing: 0, duration: 800 })
    } else {
      map.easeTo({ pitch: 60, duration: 800 })
    }
  }

  const handlePointerDown = (e) => {
    if (!map) return
    e.preventDefault()
    const track = e.currentTarget.closest(".map-zoom-track")
    if (!track) return
    const rect = track.getBoundingClientRect()
    const move = (me) => {
      let y = Math.max(0, Math.min(rect.height, me.clientY - rect.top))
      map.jumpTo({ zoom: maxZoom - (y / rect.height) * (maxZoom - minZoom) })
    }
    const up = () => {
      document.removeEventListener("pointermove", move)
      document.removeEventListener("pointerup", up)
    }
    document.addEventListener("pointermove", move)
    document.addEventListener("pointerup", up)
  }

  const pct = Math.max(0, Math.min(100, ((maxZoom - zoom) / (maxZoom - minZoom)) * 100))
  return (
    <div style={{ position: "absolute", top: "50%", right: 24, left: "auto", transform: "translateY(-50%)", display: "flex", flexDirection: "column", gap: 8, zIndex: 100 }}>
      <div className="map-zoom glass" style={{ position: "relative", top: "auto", left: "auto", transform: "none" }}>
        <button type="button" className="map-zoom-btn" onClick={zoomIn}>+</button>
        <div className="map-zoom-track" onPointerDown={handlePointerDown} style={{ cursor: "pointer" }}>
          <div ref={zoomThumbRef} className="map-zoom-thumb" style={{ top: `${pct}%` }} />
        </div>
        <button type="button" className="map-zoom-btn" onClick={zoomOut}>−</button>
      </div>
      
      <button className="map-toggle-btn glass" onClick={toggle3D} disabled={!canUse3D} data-tooltip={canUse3D ? (is3D ? "2D" : "3D") : "3D available at zoom 15+"} style={{
        width: 36, height: 36, borderRadius: 8, fontWeight: 'bold', fontSize: 12,
        background: is3D ? "var(--accent)" : "rgba(15,18,24,0.6)",
        color: is3D ? "var(--accent-ink)" : "var(--text)"
      }}>
        3D
      </button>
    </div>
  )
}

// ─── Info Panel ────────────────────────────────────────────────────────────────
function MapInfoPanel() {
  const { current: map } = useMap()
  const [info, setInfo] = useState({ zoom: 3, lat: 0, lng: 0 })

  useEffect(() => {
    if (!map) return
    const center = map.getCenter()
    setInfo({ zoom: map.getZoom(), lat: center.lat, lng: center.lng })
    const onZoom = () => setInfo(p => ({ ...p, zoom: map.getZoom() }))
    const onMove = (e) => setInfo(p => ({ ...p, lat: e.lngLat.lat, lng: e.lngLat.lng }))
    map.on("zoom", onZoom)
    map.on("mousemove", onMove)
    return () => { map.off("zoom", onZoom); map.off("mousemove", onMove) }
  }, [map])

  return (
    <div className="map-info-panel glass" style={{ left: "auto", right: 24, transform: "none", bottom: 24 }}>
      <div className="map-info-item"><span>Zoom</span><strong>{info.zoom.toFixed(1)}</strong></div>
      <div className="map-info-divider" />
      <div className="map-info-item"><span>X</span><strong>{info.lng.toFixed(2)}</strong></div>
      <div className="map-info-item"><span>Y</span><strong>{info.lat.toFixed(2)}</strong></div>
    </div>
  )
}

// ─── Drawing Layer (GeoJSON-backed) ───────────────────────────────────────────
function DrawingLayer({ mode, points, line }) {
  const pointFeatures = points.map((p, i) => ({
    type: "Feature",
    id: i,
    geometry: { type: "Point", coordinates: [p.lng, p.lat] },
    properties: { index: i }
  }))

  const lineFeature = line.length >= 2 ? [{
    type: "Feature",
    geometry: { type: "LineString", coordinates: line.map(p => [p.lng, p.lat]) },
    properties: {}
  }] : []

  const pointsGeoJSON = { type: "FeatureCollection", features: pointFeatures }
  const lineGeoJSON = { type: "FeatureCollection", features: lineFeature }

  return (
    <>
      {/* Line */}
      <Source id="draw-line" type="geojson" data={lineGeoJSON}>
        <Layer id="draw-line-layer" type="line" paint={{
          "line-color": "#3b82f6",
          "line-width": 3,
          "line-opacity": 0.9
        }} />
      </Source>

      {/* Points */}
      <Source id="draw-points" type="geojson" data={pointsGeoJSON}>
        <Layer id="draw-points-layer" type="circle" paint={{
          "circle-radius": 7,
          "circle-color": "#3b82f6",
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 2
        }} />
      </Source>
    </>
  )
}

// ─── Draw Page ─────────────────────────────────────────────────────────────────
export default function DrawPage() {
  const minZoom = 3
  const maxZoom = 20
  const smallScreen = isSmallScreen()
  const { mapStyle, showPOIs, togglePOIs } = useMapController()

  // mode: null | "point" | "line"
  const [mode, setMode] = useState(null)
  const [points, setPoints] = useState([])  // { lat, lng }[]
  const [line, setLine] = useState([])      // { lat, lng }[]

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "dark")
  }, [])

  const handleMapClick = useCallback((e) => {
    const { lat, lng } = e.lngLat
    if (mode === "point") {
      setPoints(prev => [...prev, { lat, lng }])
    } else if (mode === "line") {
      setLine(prev => [...prev, { lat, lng }])
    }
  }, [mode])

  const clearAll = () => {
    setPoints([])
    setLine([])
  }

  const undoLast = () => {
    if (mode === "point") setPoints(prev => prev.slice(0, -1))
    if (mode === "line") setLine(prev => prev.slice(0, -1))
  }

  const totalDistance = () => {
    if (line.length < 2) return null
    let d = 0
    for (let i = 1; i < line.length; i++) {
      const a = line[i - 1], b = line[i]
      // Haversine formula
      const R = 6371
      const dLat = (b.lat - a.lat) * Math.PI / 180
      const dLng = (b.lng - a.lng) * Math.PI / 180
      const sin2 = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2
      d += 2 * R * Math.asin(Math.sqrt(sin2))
    }
    return d.toFixed(1)
  }

  const dist = totalDistance()

  return (
    <div style={{
      width: "100vw", height: "100vh",
      display: "flex", flexDirection: "row",
      background: "#0d1117", overflow: "hidden",
      position: "fixed", top: 0, left: 0
    }}>

      {/* ─── Map Panel (80%) ─── */}
      <div style={{
        flex: "1 1 0", minWidth: 0, height: "100%",
        position: "relative", overflow: "hidden"
      }}>
        {mapStyle && (
          <Map
            initialViewState={{ latitude: 0, longitude: 0, zoom: minZoom, pitch: 0, minZoom, maxZoom }}
            mapStyle={mapStyle}
            mapLib={maplibregl}
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
            dragRotate={!smallScreen}
            touchZoomRotate={!smallScreen}
            attributionControl={false}
            cursor={mode ? "crosshair" : "grab"}
            onClick={handleMapClick}
          >
            <MapControls minZoom={minZoom} maxZoom={maxZoom} />
            <MapInfoPanel />
            <CountryHoverLayer />
            <WilayaHoverLayer />
            <DrawingLayer mode={mode} points={points} line={line} />
          </Map>
        )}

        {/* ─── Toolbar (top center of map) ─── */}
        <div className="glass" style={{
          position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)",
          display: "flex", gap: 0, borderRadius: "10px", overflow: "hidden",
          border: "1px solid var(--line)", zIndex: 100
        }}>
          {/* Point Tool */}
          <button className="map-toggle-btn" data-tooltip="رسم نقطة"
            onClick={() => setMode(m => m === "point" ? null : "point")}
            style={{ width: 44, height: 44, background: mode === "point" ? "var(--accent)" : "transparent", color: mode === "point" ? "var(--accent-ink)" : "var(--text)", borderRight: "1px solid var(--line)" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
            </svg>
          </button>

          {/* Line Tool */}
          <button className="map-toggle-btn" data-tooltip="رسم طريق"
            onClick={() => setMode(m => m === "line" ? null : "line")}
            style={{ width: 44, height: 44, background: mode === "line" ? "#3b82f6" : "transparent", color: mode === "line" ? "#fff" : "var(--text)", borderRight: "1px solid var(--line)" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 17 9 11 13 15 21 7" />
              <circle cx="3" cy="17" r="1.5" fill="currentColor" />
              <circle cx="21" cy="7" r="1.5" fill="currentColor" />
            </svg>
          </button>

          <div style={{ width: 1, background: "var(--line)" }} />

          {/* Undo */}
          <button className="map-toggle-btn" data-tooltip="تراجع" onClick={undoLast}
            style={{ width: 44, height: 44, background: "transparent", color: "var(--text)", borderRight: "1px solid var(--line)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 7v6h6" /><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
            </svg>
          </button>

          {/* Clear */}
          <button className="map-toggle-btn" data-tooltip="مسح الكل" onClick={clearAll}
            style={{ width: 44, height: 44, background: "transparent", color: "var(--text)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
            </svg>
          </button>
        </div>

        {/* POI toggle */}
        <div className="glass" style={{
          position: "absolute", top: 12, right: 12, zIndex: 100,
          display: "flex", flexDirection: "column",
          borderRadius: "8px", overflow: "hidden", border: "1px solid var(--line)"
        }}>
          <button className="map-toggle-btn" data-tooltip={showPOIs ? "إخفاء الأماكن" : "إظهار الأماكن"}
            onClick={togglePOIs}
            style={{ background: showPOIs ? "var(--accent)" : "transparent", color: showPOIs ? "var(--accent-ink)" : "var(--text-muted)", opacity: showPOIs ? 1 : 0.6 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
              {!showPOIs && <line x1="3" y1="3" x2="21" y2="21" stroke="currentColor" strokeWidth="2" />}
            </svg>
          </button>
        </div>

        <FpsMeter />
      </div>

      {/* ─── Editor Panel (20%) ─── */}
      <div style={{
        width: "20%", minWidth: 220, height: "100%",
        background: "var(--bg-panel)", borderLeft: "1px solid var(--line)",
        display: "flex", flexDirection: "column", overflow: "hidden"
      }}>
        {/* Header */}
        <div style={{
          padding: "14px 16px", borderBottom: "1px solid var(--line)",
          display: "flex", alignItems: "center", gap: 8
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
          <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>Trip Map Editor</span>
        </div>

        {/* Drawing Mode Indicator */}
        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--line)" }}>
          <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "0 0 8px" }}>وضع الرسم</p>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => setMode(m => m === "point" ? null : "point")} style={{
              flex: 1, padding: "7px 0", borderRadius: 6, fontSize: 12, fontWeight: 600,
              border: `1px solid ${mode === "point" ? "var(--accent)" : "var(--line)"}`,
              background: mode === "point" ? "var(--accent)" : "transparent",
              color: mode === "point" ? "var(--accent-ink)" : "var(--text)", cursor: "pointer"
            }}>📍 نقطة</button>
            <button onClick={() => setMode(m => m === "line" ? null : "line")} style={{
              flex: 1, padding: "7px 0", borderRadius: 6, fontSize: 12, fontWeight: 600,
              border: `1px solid ${mode === "line" ? "#3b82f6" : "var(--line)"}`,
              background: mode === "line" ? "#3b82f6" : "transparent",
              color: mode === "line" ? "#fff" : "var(--text)", cursor: "pointer"
            }}>🛣️ طريق</button>
          </div>
          {mode && (
            <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 8, marginBottom: 0 }}>
              {mode === "point" ? "انقر على الخريطة لإضافة نقطة" : "انقر لإضافة نقاط المسار"}
            </p>
          )}
        </div>

        {/* Stats */}
        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--line)" }}>
          <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "0 0 8px" }}>الإحصائيات</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
              <span style={{ color: "var(--text-muted)" }}>نقاط</span>
              <strong style={{ color: "var(--accent)" }}>{points.length}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
              <span style={{ color: "var(--text-muted)" }}>نقاط المسار</span>
              <strong style={{ color: "#3b82f6" }}>{line.length}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
              <span style={{ color: "var(--text-muted)" }}>المسافة</span>
              <strong style={{ color: "var(--text)" }}>{dist ? `${dist} كم` : "—"}</strong>
            </div>
          </div>
        </div>

        {/* Points List */}
        {points.length > 0 && (
          <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--line)", flex: 1, overflowY: "auto" }}>
            <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "0 0 8px" }}>النقاط المضافة</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {points.map((p, i) => (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "5px 8px", borderRadius: 5, background: "rgba(255,255,255,0.04)",
                  fontSize: 12
                }}>
                  <span style={{ color: "var(--accent)" }}>📍 {i + 1}</span>
                  <span style={{ color: "var(--text-muted)", fontFamily: "monospace" }}>
                    {p.lng.toFixed(2)}, {p.lat.toFixed(2)}
                  </span>
                  <button onClick={() => setPoints(prev => prev.filter((_, j) => j !== i))}
                    style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 13, padding: 0 }}>×</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Actions */}
        <div style={{ padding: "12px 16px", borderTop: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 6 }}>
          <button onClick={undoLast} style={{
            width: "100%", padding: "8px 0", borderRadius: 6, fontSize: 13,
            border: "1px solid var(--line)", background: "transparent",
            color: "var(--text)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7v6h6" /><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" /></svg>
            تراجع
          </button>
          <button onClick={clearAll} style={{
            width: "100%", padding: "8px 0", borderRadius: 6, fontSize: 13,
            border: "1px solid rgba(239,68,68,0.4)", background: "rgba(239,68,68,0.1)",
            color: "#ef4444", cursor: "pointer"
          }}>
            مسح الكل
          </button>
        </div>
      </div>

    </div>
  )
}
