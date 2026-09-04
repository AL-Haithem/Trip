import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Map, { Marker, Source, Layer } from "react-map-gl/maplibre"
import { useLocation, useNavigate, useParams } from "react-router"
import maplibregl from "maplibre-gl"

import { getTrip } from "../services/tripApi.js"
import { useMapController } from "../Maps/UseStates/useMapController.js"
import { WAYPOINT_TYPES } from "../content/waypointTypes.js"
import { START_ICON, END_ICON } from "../Editor/TripDrawMap/theme.js"
import { flagSvg, pinSvg } from "../Editor/TripDrawMap/TripDrawMap.jsx"
import { brand } from "../content/siteContent.js"
import Icon from "../components/ui/Icon.jsx"
import "../styles/routePreview.css"
import "maplibre-gl/dist/maplibre-gl.css"

function svgToUrl(svg) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

function TripPreview() {
  useEffect(() => {
    document.title = `Trip Preview - ${brand.name}`
  }, [])

  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const mapRef = useRef(null)
  const { mapStyle } = useMapController()

  const previewData = location.state?.previewData
  const isEditorPreview = Boolean(previewData)
  const [tour, setTour] = useState(previewData || null)
  const [progress, setProgress] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [busSpeed, setBusSpeed] = useState(1)
  const [viewMode, setViewMode] = useState("2d")
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const activeStepRef = useRef(null)
  const progressRef = useRef(0)

  const handleBack = () => {
    if (isEditorPreview) {
      navigate(`/trips/draw/${id}`, {state: {previewData}})
      return
    }
    navigate(-1)
  }

  useEffect(() => {
    let mounted = true

    getTrip(id).then((data) => {
      if (mounted) setTour(previewData ? { ...data, ...previewData } : data)
    })

    return () => {
      mounted = false
    }
  }, [id, previewData])

  const routeData = useMemo(() => {
    if (!tour || !tour.route || !tour.route.features) {
      return { coords: [], stops: [] }
    }

    const routeFeature = tour.route.features.find((feature) => feature.geometry && feature.geometry.type === "LineString")
    const coords = routeFeature?.geometry?.coordinates || []
    const vertices = routeFeature?.properties?.vertices || []

    let runningDistanceKm = 0

    const stops = coords.map((coord, index) => {
      const isStart = index === 0
      const isEnd = index === coords.length - 1
      const previousCoord = index > 0 ? coords[index - 1] : null

      if (previousCoord) {
        const toRad = (value) => (value * Math.PI) / 180
        const earthRadiusKm = 6371
        const lat1 = toRad(previousCoord[1])
        const lat2 = toRad(coord[1])
        const deltaLat = toRad(coord[1] - previousCoord[1])
        const deltaLng = toRad(coord[0] - previousCoord[0])

        const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
          Math.cos(lat1) * Math.cos(lat2) *
          Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2)

        const distanceKm = 2 * earthRadiusKm * Math.asin(Math.sqrt(a))
        runningDistanceKm += distanceKm
      }

      const vertex = vertices[index]
      const rawType = isStart ? "start" : isEnd ? "end" : (vertex?.type || "normal").toLowerCase()
      const rawLabel = isStart
        ? "Start Point"
        : isEnd
          ? "Final Destination"
          : (vertex?.label || "")
      const label = rawType === "normal" && !rawLabel ? null : (rawLabel || (rawType !== "normal" ? `${rawType} stop` : null))

      return {
        id: index,
        coords: coord,
        label,
        type: rawType,
        order: index + 1,
        distanceKm: Number(runningDistanceKm.toFixed(1)),
        isDestination: isEnd,
        isStart,
        hasLabel: Boolean(label && label.trim()),
      }
    })

    return { coords, stops }
  }, [tour])

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max)
  const routeLength = Math.max(routeData.stops.length - 1, 1)
  const currentIndex = Math.min(routeData.stops.length - 1, Math.max(0, Math.floor(progress * routeLength)))
  const segmentIndex = Math.min(routeData.coords.length - 2, Math.max(0, Math.floor(progress * routeLength)))
  const segmentProgress = routeData.coords.length > 1 ? (progress * routeLength) - segmentIndex : 0
  const departureSchedule = (tour?.departureSchedule || []).filter((day) => day && day.date)

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

  const routeBearings = useMemo(() => {
    if (routeData.coords.length < 2) return []

    return routeData.coords.slice(0, -1).map((point, index) =>
      getBearingToTarget(point, routeData.coords[index + 1]),
    )
  }, [routeData.coords])

  const getRouteHeading = useCallback((index, ratio) => {
    const currentBearing = routeBearings[index] ?? 24
    const nextBearing = routeBearings[index + 1] ?? currentBearing
    const turnProgress = clamp((ratio - 0.1) / 0.8, 0, 1)
    const smoothTurn = turnProgress * turnProgress * (3 - 2 * turnProgress)
    return interpolateAngle(currentBearing, nextBearing, smoothTurn)
  }, [routeBearings])

  const currentTravelPoint = useMemo(() => routeData.coords.length > 1
    ? interpolatePoint(routeData.coords[segmentIndex], routeData.coords[segmentIndex + 1], segmentProgress)
    : routeData.coords[0], [routeData.coords, segmentIndex, segmentProgress])
  const currentStop = routeData.stops[currentIndex] || routeData.stops[0]

  const startPoint = routeData.coords[0]

  const cameraBearing = routeData.coords.length > 1
    ? getRouteHeading(segmentIndex, segmentProgress)
    : 24

  const cameraCenter = useMemo(() => currentTravelPoint || startPoint || [0, 0], [currentTravelPoint, startPoint])
  const cameraBearingValue = viewMode === "3d" ? cameraBearing : 0
  const cameraPitch = viewMode === "3d" ? 62 : 0
  const routeGeoJson = useMemo(() => ({
    type: "FeatureCollection",
    features: [{
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: routeData.coords,
      },
      properties: {},
    }],
  }), [routeData.coords])

  const speedOptions = [0.5, 1, 1.25, 1.5, 1.75, 2]
  const currentSpeedIndex = speedOptions.indexOf(busSpeed)
  const nextSpeed = speedOptions[(currentSpeedIndex + 1) % speedOptions.length]

  const traveledDistanceKm = tour?.distanceKm
    ? Number((tour.distanceKm * progress).toFixed(1))
    : 0
  const totalDistanceKm = Number(tour?.distanceKm || routeData.stops.at(-1)?.distanceKm || 0)
  const playbackDurationMs = Math.max(totalDistanceKm * 800, 2000)

  const handlePlayToggle = () => {
    setPlaying((value) => !value)
  }

  const handleRestart = () => {
    progressRef.current = 0
    setProgress(0)
    setPlaying(true)
  }

  useEffect(() => {
    if (playing || !routeData.coords.length || !mapRef.current || !currentTravelPoint) return

    mapRef.current.jumpTo({
      center: cameraCenter,
      zoom: 16,
      pitch: cameraPitch,
      bearing: cameraBearingValue,
      animate: false,
      essential: true,
    })
  }, [cameraBearingValue, cameraCenter, cameraPitch, currentTravelPoint, getRouteHeading, playing, routeData.coords.length])

  useEffect(() => {
    if (!playing || !routeData.coords.length) return

    let frameId = null
    let lastTimestamp = null
    let lastUiUpdate = 0
    const animate = (timestamp) => {
      if (lastTimestamp === null) {
        lastTimestamp = timestamp
      }

      const elapsed = (timestamp - lastTimestamp) / 1000
      lastTimestamp = timestamp

      const nextProgress = Math.min(
        progressRef.current + (elapsed * 1000 * busSpeed) / playbackDurationMs,
        1,
      )
      progressRef.current = nextProgress

      const segment = Math.min(routeData.coords.length - 2, Math.max(0, Math.floor(nextProgress * routeLength)))
      const ratio = (nextProgress * routeLength) - segment
      const from = routeData.coords[segment]
      const to = routeData.coords[Math.min(segment + 1, routeData.coords.length - 1)]

      if (from && to && mapRef.current) {
        const center = interpolatePoint(from, to, ratio)
        mapRef.current.jumpTo({
          center,
          zoom: 16,
          pitch: viewMode === "3d" ? 62 : 0,
          bearing: viewMode === "3d" ? getRouteHeading(segment, ratio) : 0,
          animate: false,
          essential: true,
        })
      }

      if (timestamp - lastUiUpdate >= 100 || nextProgress >= 1) {
        lastUiUpdate = timestamp
        setProgress(nextProgress)
      }

      if (nextProgress >= 1) {
        setPlaying(false)
      } else {
        frameId = requestAnimationFrame(animate)
      }
    }

    frameId = requestAnimationFrame(animate)

    return () => {
      if (frameId) cancelAnimationFrame(frameId)
    }
  }, [busSpeed, getRouteHeading, playing, playbackDurationMs, routeLength, routeData.coords, viewMode])

  useEffect(() => {
    if (!activeStepRef.current) return

    activeStepRef.current.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    })
  }, [currentIndex])

  if (!tour || !routeData.coords.length) {
    return <div className="rp-loading">Loading preview…</div>
  }

  return (
    <div className="rp-page">
      <header className="rp-editor-header">
        <div className="rp-header-left">
          <button className="rp-nav-btn rp-back" onClick={handleBack} type="button" aria-label={isEditorPreview ? "Back to drawing" : "Back"} title={isEditorPreview ? "Back to drawing" : "Back"}>
            <Icon name="arrow-left" />
          </button>

          <h1 className="rp-page-title"><Icon name="map-location-dot" /> Preview</h1>
        </div>

        <div className="rp-controls-stack" aria-label="Route controls">
          <button className="rp-control-btn rp-control-btn-icon" onClick={handlePlayToggle} type="button" title={playing ? "Pause" : "Play route"}>
            <Icon name={playing ? "pause" : "play"} />
          </button>

          <button className="rp-control-btn rp-control-btn-icon" onClick={handleRestart} type="button" title="Restart route" aria-label="Restart route">
            <Icon name="rotate-left" />
          </button>

          <button
            className="rp-control-btn rp-view-toggle"
            onClick={() => setViewMode((mode) => mode === "2d" ? "3d" : "2d")}
            type="button"
            title={`Switch to ${viewMode === "2d" ? "3D" : "2D"} view`}
          >
            <Icon name={viewMode === "2d" ? "cube" : "map"} /> {viewMode.toUpperCase()}
          </button>

          <button
            className="rp-control-btn rp-control-btn-icon rp-control-btn-muted"
            onClick={() => setBusSpeed(nextSpeed)}
            type="button"
            title="Change bus playback speed"
          >
            <Icon name="gauge" /> {busSpeed}x
          </button>
        </div>

        <div className={`rp-header-right ${isEditorPreview ? "rp-header-right-editor" : ""}`}>
          <span className="rp-trip-name">{tour.title}</span>
          {!isEditorPreview && (
            <button
              className="rp-save-btn rp-booking-btn"
              type="button"
              onClick={() => navigate(`/booking/${tour._id}`)}
            >
              <Icon name="calendar-check" /> Book Now
            </button>
          )}
        </div>
      </header>

      <div className="rp-main-layout">
        <aside className="rp-timeline">
          <div className="rp-schedule-panel">
            <button
              type="button"
              className="rp-schedule-trigger"
              onClick={() => setScheduleOpen((value) => !value)}
              aria-expanded={scheduleOpen}
            >
              <span className="rp-kicker"><Icon name="clock" /> Departure schedule</span>
              <span className="rp-schedule-trigger-text">Available launch times</span>
            </button>
          </div>

          {scheduleOpen && (
            <div className="rp-schedule-popup-backdrop" onClick={() => setScheduleOpen(false)}>
              <div className="rp-schedule-popup" onClick={(event) => event.stopPropagation()}>
                <div className="rp-schedule-popup-header">
                  <span className="rp-kicker">Departure schedule</span>
                  <button type="button" className="rp-schedule-close" onClick={() => setScheduleOpen(false)}>
                    Close
                  </button>
                </div>
                <div className="rp-schedule-popup-list">
                  {departureSchedule.length ? (
                    departureSchedule.map((day) => (
                      <div key={day.id || day.date} className="rp-schedule-day rp-schedule-day-popup">
                        <strong>{new Date(`${day.date}T00:00:00`).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}</strong>
                        <div className="rp-schedule-times">
                          {(day.times || []).filter((slot) => slot && slot.time).map((slot) => (
                            <span key={slot.id || `${day.date}-${slot.time}`} className="rp-schedule-chip">
                              {slot.time} · {Number(slot.seatsAvailable || 0)} seats
                            </span>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="rp-schedule-empty">No departure schedule has been added for this trip yet.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="rp-timeline-header">
            <div>
              <span className="rp-kicker">Route Order</span>
              <h2>Station Sequence</h2>
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
                progressRef.current = value
                setProgress(value)
                setPlaying(false)
              }}
            />
          </div>

          <div className="rp-steps">
            {routeData.stops.filter((stop) => stop.type !== "normal").map((stop) => {
              const index = stop.id
              const isActive = index <= currentIndex
              const typeMeta = WAYPOINT_TYPES.find((item) => item.id === stop.type) || WAYPOINT_TYPES[0]
              const isStart = index === 0
              const isEnd = index === routeData.stops.length - 1
              const labelIcon = isStart ? START_ICON : isEnd ? END_ICON : typeMeta?.icon || "location-dot"
              const labelClass = isStart ? "start" : isEnd ? "end" : ""
              const stepCopy = stop.isStart ? "Start Point" : stop.isDestination ? "Final Destination" : (stop.label || "")

              return (
                <button
                  key={stop.id}
                  ref={isActive && index === currentIndex ? activeStepRef : null}
                  className={`rp-step ${isActive ? "active" : ""}`}
                  type="button"
                  onClick={() => {
                    const next = routeData.stops.length > 1 ? index / routeLength : 0
                    progressRef.current = next
                    setProgress(next)
                    setPlaying(false)
                  }}
                >
                  <span className="rp-step-time">#{stop.order}</span>
                  <span className={`rp-step-icon ${labelClass}`} title={typeMeta?.label || "Stop"}>
                    <Icon name={labelIcon} />
                  </span>
                  <div className="rp-step-text">
                    {stepCopy ? <span className="rp-step-copy">{stepCopy}</span> : null}
                    <span className="rp-step-distance">{stop.distanceKm.toFixed(1)} km</span>
                  </div>
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
              pitch: viewMode === "3d" ? 62 : 0,
              bearing: viewMode === "3d" ? 24 : 0,
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
              data={routeGeoJson}
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
              if (stop.type === "normal") return null

              const isActive = index <= currentIndex
              const [lng, lat] = stop.coords
              const typeMeta = WAYPOINT_TYPES.find((item) => item.id === stop.type) || WAYPOINT_TYPES[0]
              const isStart = index === 0
              const isEnd = index === routeData.stops.length - 1
              const markerClass = isStart ? "start" : isEnd ? "end" : ""
              const markerSvg = isStart || isEnd
                ? flagSvg(isStart ? "start" : "end")
                : pinSvg(stop.type, false)
              return (
                <Marker key={stop.id} longitude={lng} latitude={lat} anchor="center">
                  <div className={`rp-stop ${isActive ? "active" : ""} ${markerClass}`} title={stop.label || typeMeta?.label || "Stop"}>
                    <img src={svgToUrl(markerSvg)} alt="" draggable="false" />
                  </div>
                </Marker>
              )
            })}

          </Map>

          {currentTravelPoint && (
            <div className="rp-vehicle-overlay" aria-label="Bus position">
              <div className="rp-vehicle"><Icon name="bus" /></div>
            </div>
          )}

          {currentStop && currentStop.hasLabel && currentIndex > 0 && currentIndex < routeData.stops.length - 1 && (
            <div className="rp-stop-label">
              <div className="rp-stop-label-head">
                <span className="rp-stop-label-badge">Stop {currentStop.order}</span>
                <span className={`rp-stop-label-icon ${currentStop.isStart ? "start" : currentStop.isDestination ? "end" : ""}`}>
                  <Icon name={currentStop.isStart ? START_ICON : currentStop.isDestination ? END_ICON : (WAYPOINT_TYPES.find((item) => item.id === currentStop.type)?.icon || "location-dot")} />
                </span>
              </div>
              <strong>{currentStop.label}</strong>
              <small>{currentStop.isDestination ? "Final destination" : currentStop.isStart ? "Starting point" : (WAYPOINT_TYPES.find((item) => item.id === currentStop.type)?.label || "Route stop")}</small>
            </div>
          )}

          <div className="rp-map-badge">
            <span>{tour.title}</span>
            <strong>{traveledDistanceKm} km</strong>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TripPreview
