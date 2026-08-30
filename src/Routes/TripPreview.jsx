import { useEffect, useMemo, useRef, useState } from "react"
import Map, { Marker, Source, Layer } from "react-map-gl/maplibre"
import { useNavigate, useParams } from "react-router"
import maplibregl from "maplibre-gl"

import { getTour } from "../data/tourStore.js"
import { useMapController } from "../Maps/UseStates/useMapController.js"
import { WAYPOINT_TYPES } from "../content/waypointTypes.js"
import { START_ICON, END_ICON, START_COLOR, END_COLOR } from "../Editor/TripDrawMap/theme.js"
import Icon from "../components/ui/Icon.jsx"
import "../styles/routePreview.css"
import "maplibre-gl/dist/maplibre-gl.css"

function TripPreview() {
  const { id } = useParams()
  const navigate = useNavigate()
  const mapRef = useRef(null)
  const { mapStyle } = useMapController()

  const [tour, setTour] = useState(null)
  const [progress, setProgress] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [busSpeed, setBusSpeed] = useState(1)
  const initialCameraRef = useRef(false)

  useEffect(() => {
    let mounted = true

    getTour(id).then((data) => {
      if (mounted) setTour(data)
    })

    return () => {
      mounted = false
    }
  }, [id])

  const routeData = useMemo(() => {
    if (!tour || !tour.route || !tour.route.features) {
      return { coords: [], stops: [] }
    }

    const routeFeature = tour.route.features.find((feature) => feature.geometry && feature.geometry.type === "LineString")
    const coords = routeFeature?.geometry?.coordinates || []
    const vertTypes = routeFeature?.properties?.vertTypes || []
    const vertLabels = routeFeature?.properties?.vertLabels || []

    const stops = coords.map((coord, index) => {
      const isStart = index === 0
      const isEnd = index === coords.length - 1
      return {
        id: index,
        coords: coord,
        label: isStart
          ? "Start Point"
          : isEnd
            ? "Final Destination"
            : (vertLabels[index] || (vertTypes[index] ? `${vertTypes[index]} stop` : `Stop ${index + 1}`)),
        type: isStart ? "start" : isEnd ? "end" : (vertTypes[index] || "waypoint"),
        order: index + 1,
        isDestination: isEnd,
        isStart,
      }
    })

    return { coords, stops }
  }, [tour])

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max)
  const routeLength = Math.max(routeData.stops.length - 1, 1)
  const currentIndex = Math.min(routeData.stops.length - 1, Math.max(0, Math.floor(progress * routeLength)))
  const segmentIndex = Math.min(routeData.coords.length - 2, Math.max(0, Math.floor(progress * routeLength)))
  const segmentProgress = routeData.coords.length > 1 ? (progress * routeLength) - segmentIndex : 0

  const interpolatePoint = (from, to, ratio) => [
    from[0] + (to[0] - from[0]) * ratio,
    from[1] + (to[1] - from[1]) * ratio,
  ]

  const getBearingToTarget = (from, to) => {
    const toRad = (value) => (value * Math.PI) / 180
    const toDeg = (value) => (value * 180) / Math.PI

    const lat1 = toRad(from[1])
    const lat2 = toRad(to[1])
    const dLon = toRad(to[0] - from[0])

    const y = Math.sin(dLon) * Math.cos(lat2)
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon)
    const angle = toDeg(Math.atan2(y, x))

    return (angle + 360) % 360
  }

  const normalizeAngle = (angle) => ((angle % 360) + 360) % 360
  const shortestAngleDelta = (from, to) => {
    const diff = normalizeAngle(to - from)
    return diff > 180 ? diff - 360 : diff
  }
  const interpolateAngle = (from, to, ratio) => normalizeAngle(from + shortestAngleDelta(from, to) * ratio)

  const getPointBehind = (point, bearing, distanceMeters = 42) => {
    const lat = point[1]
    const metersPerLat = 111_320
    const metersPerLng = 111_320 * Math.cos((lat * Math.PI) / 180)
    const direction = (bearing + 180) * (Math.PI / 180)

    const lngOffset = (Math.sin(direction) * distanceMeters) / metersPerLng
    const latOffset = (Math.cos(direction) * distanceMeters) / metersPerLat

    return [point[0] + lngOffset, point[1] + latOffset]
  }

  const currentTravelPoint = routeData.coords.length > 1
    ? interpolatePoint(routeData.coords[segmentIndex], routeData.coords[segmentIndex + 1], segmentProgress)
    : routeData.coords[0]
  const nextTravelPoint = routeData.coords.length > 1
    ? routeData.coords[Math.min(segmentIndex + 1, routeData.coords.length - 1)]
    : routeData.coords[0]
  const currentStop = routeData.stops[currentIndex] || routeData.stops[0]

  const startPoint = routeData.coords[0]
  const endPoint = routeData.coords[routeData.coords.length - 1]

  const currentHeading = currentTravelPoint && nextTravelPoint
    ? getBearingToTarget(currentTravelPoint, nextTravelPoint)
    : 24

  const previousTravelPoint = routeData.coords[Math.max(segmentIndex - 1, 0)] || currentTravelPoint
  const previousHeading = previousTravelPoint && currentTravelPoint
    ? getBearingToTarget(previousTravelPoint, currentTravelPoint)
    : currentHeading

  const turnBlend = routeData.coords.length > 2
    ? clamp((segmentProgress - 0.25) / 0.55, 0, 1)
    : 1
  const cameraBearing = routeData.coords.length > 2
    ? interpolateAngle(previousHeading, currentHeading, turnBlend)
    : currentHeading
  const cameraCenter = currentTravelPoint || startPoint || [0, 0]

  const speedOptions = [0.5, 1, 1.25, 1.5, 1.75, 2]
  const currentSpeedIndex = speedOptions.indexOf(busSpeed)
  const nextSpeed = speedOptions[(currentSpeedIndex + 1) % speedOptions.length]

  const handlePlayToggle = () => {
    setPlaying((value) => !value)
  }

  useEffect(() => {
    if (!routeData.coords.length || !mapRef.current || !currentTravelPoint) return

    if (!initialCameraRef.current) {
      mapRef.current.jumpTo({
        center: cameraCenter,
        zoom: 16,
        pitch: 62,
        bearing: cameraBearing,
        animate: false,
        essential: true,
      })
      initialCameraRef.current = true
      return
    }

    mapRef.current.easeTo({
      center: cameraCenter,
      zoom: 16,
      pitch: 62,
      bearing: cameraBearing,
      duration: 160,
      essential: true,
    })
  }, [cameraBearing, cameraCenter, currentTravelPoint, routeData.coords.length])

  useEffect(() => {
    if (!playing || !routeData.coords.length) return

    let frameId = null
    let lastTimestamp = null

    const animate = (timestamp) => {
      if (lastTimestamp === null) {
        lastTimestamp = timestamp
      }

      const elapsed = (timestamp - lastTimestamp) / 1000
      lastTimestamp = timestamp

      setProgress((prev) => {
        const next = prev + elapsed * 0.018 * busSpeed
        if (next >= 1) {
          setPlaying(false)
          return 1
        }
        return next
      })

      frameId = requestAnimationFrame(animate)
    }

    frameId = requestAnimationFrame(animate)

    return () => {
      if (frameId) cancelAnimationFrame(frameId)
    }
  }, [busSpeed, playing, routeData.coords.length])

  if (!tour || !routeData.coords.length) {
    return <div className="rp-loading">Loading preview…</div>
  }

  return (
    <div className="rp-page">
      <header className="rp-editor-header">
        <div className="rp-header-left">
          <button className="rp-nav-btn rp-back" onClick={() => navigate(-1)} type="button" aria-label="Back">
            ←
          </button>

          <h1 className="rp-page-title">Trip Preview</h1>
        </div>

        <div className="rp-controls-stack" aria-label="Route controls">
          <button className="rp-control-btn rp-control-btn-icon" onClick={handlePlayToggle} type="button" title={playing ? "Pause" : "Play route"}>
            {playing ? "⏸" : "▶"}
          </button>

          <button
            className="rp-control-btn rp-control-btn-icon rp-control-btn-muted"
            onClick={() => setBusSpeed(nextSpeed)}
            type="button"
            title="Change bus playback speed"
          >
            {busSpeed}x
          </button>
        </div>

        <div className="rp-header-right">
          <span className="rp-trip-name">{tour.title}</span>
          <button className="rp-save-btn" type="button">Reservation</button>
        </div>
      </header>

      <div className="rp-main-layout">
        <aside className="rp-timeline">
          <div className="rp-timeline-header">
            <div>
              <span className="rp-kicker">Route Order</span>
              <h2>Station Sequence</h2>
            </div>
            <div className="rp-summary">
              {startPoint && endPoint && (
                <span>
                  Start → Finish: {routeData.stops.length} stops
                </span>
              )}
            </div>
          </div>

          <div className="rp-slider-wrap">
            <input
              type="range"
              min={0}
              max={1}
              step={0.001}
              value={progress}
              onChange={(event) => {
                const value = Number(event.target.value)
                setProgress(value)
                setPlaying(false)
              }}
            />
          </div>

          <div className="rp-steps">
            {routeData.stops.map((stop, index) => {
              const isActive = index <= currentIndex
              const typeMeta = WAYPOINT_TYPES.find((item) => item.id === stop.type) || WAYPOINT_TYPES[0]
              const isStart = index === 0
              const isEnd = index === routeData.stops.length - 1
              const labelIcon = isStart ? START_ICON : isEnd ? END_ICON : typeMeta?.icon || "location-dot"
              const labelClass = isStart ? "start" : isEnd ? "end" : ""
              return (
                <button
                  key={stop.id}
                  className={`rp-step ${isActive ? "active" : ""}`}
                  type="button"
                  onClick={() => {
                    const next = routeData.stops.length > 1 ? index / routeLength : 0
                    setProgress(next)
                    setPlaying(false)
                  }}
                >
                  <span className="rp-step-time">#{stop.order}</span>
                  <span className={`rp-step-icon ${labelClass}`} title={typeMeta?.label || "Stop"}>
                    <Icon name={labelIcon} />
                  </span>
                  <span className="rp-step-copy">{stop.isStart ? "Start Point" : stop.isDestination ? "Final Destination" : stop.label}</span>
                </button>
              )
            })}
          </div>
        </aside>

        <div className="rp-map-shell">
          <Map
            ref={mapRef}
            mapLib={maplibregl}
            mapStyle={mapStyle || "https://demotiles.maplibre.org/style.json"}
            initialViewState={{
              longitude: startPoint[0],
              latitude: startPoint[1],
              zoom: 16,
              pitch: 62,
              bearing: 24,
            }}
            style={{ width: "100%", height: "100%" }}
            scrollZoom={false}
            dragRotate={false}
            dragPan={false}
            doubleClickZoom={false}
            touchZoomRotate={false}
            minZoom={16}
            maxZoom={16}
            attributionControl={false}
          >
            <Source
              id="preview-route-source"
              type="geojson"
              data={{
                type: "FeatureCollection",
                features: [{
                  type: "Feature",
                  geometry: {
                    type: "LineString",
                    coordinates: routeData.coords,
                  },
                  properties: {},
                }],
              }}
            >
              <Layer
                id="preview-route-layer"
                type="line"
                paint={{
                  "line-color": "#395829",
                  "line-width": 6,
                  "line-opacity": 0.95,
                  "line-gap-width": 0,
                }}
              />
            </Source>

            {routeData.stops.map((stop, index) => {
              const isActive = index <= currentIndex
              const [lng, lat] = stop.coords
              const typeMeta = WAYPOINT_TYPES.find((item) => item.id === stop.type) || WAYPOINT_TYPES[0]
              const isStart = index === 0
              const isEnd = index === routeData.stops.length - 1
              const markerIcon = isStart ? START_ICON : isEnd ? END_ICON : typeMeta?.icon || "location-dot"
              const markerClass = isStart ? "start" : isEnd ? "end" : ""
              return (
                <Marker key={stop.id} longitude={lng} latitude={lat} anchor="center">
                  <div className={`rp-stop ${isActive ? "active" : ""} ${markerClass}`} title={stop.label}>
                    <span>
                      {isStart || isEnd ? <Icon name={markerIcon} /> : <span>{index + 1}</span>}
                    </span>
                  </div>
                </Marker>
              )
            })}

            {currentTravelPoint && (
              <Marker longitude={currentTravelPoint[0]} latitude={currentTravelPoint[1]} anchor="center">
                <div className="rp-vehicle">🚌</div>
              </Marker>
            )}
          </Map>

          {currentStop && currentStop.label && currentIndex > 0 && currentIndex < routeData.stops.length - 1 && (
            <div className="rp-stop-label">
              <span className="rp-stop-label-badge">Stop</span>
              <strong>{currentStop.label}</strong>
            </div>
          )}

          <div className="rp-map-badge">
            <span>{tour.title}</span>
            <strong>{tour.distanceKm || 0} km</strong>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TripPreview
