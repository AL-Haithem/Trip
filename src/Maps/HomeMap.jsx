import { useState, useEffect, useRef } from "react"
import Map, { useMap, Marker, Source, Layer } from "react-map-gl/maplibre"
import { useNavigate } from "react-router"
import "maplibre-gl/dist/maplibre-gl.css"
import "../styles/maps.css"
import maplibregl from "maplibre-gl"
import { useMapController } from "./UseStates/useMapController.js"
import { useMapHover } from "./UseStates/useMapHover.js"
import { getMapTrips } from "../services/tripApi.js"
import Icon from "../components/ui/Icon.jsx"
import { FpsMeter } from "../components/ui/FpsMeter.jsx"

function getStartCoords(tour) {
  const spc = tour.startPoint?.coordinates
  if (Array.isArray(spc) && spc.length >= 2) return [spc[0], spc[1]]
  const route = tour.route && tour.route.features
  const line = route && route.find(f => f.geometry && f.geometry.type === "LineString")
  const rc = line && line.geometry.coordinates && line.geometry.coordinates[0]
  if (Array.isArray(rc) && rc.length >= 2) return [rc[0], rc[1]]
  return null
}

function getRouteFeature(tour) {
  return tour?.route?.features?.find((feature) => feature.geometry?.type === "LineString") || null
}

function getRoutePointFeatures(tour) {
  const route = getRouteFeature(tour)
  if (!route) return []
  const vertices = route.properties?.vertices || []
  return route.geometry.coordinates
    .map((coordinates, index) => ({
      type: "Feature",
      geometry: {type: "Point", coordinates},
      properties: {
        type: index === 0 ? "start" : index === route.geometry.coordinates.length - 1 ? "end" : (vertices[index]?.type || "normal").toLowerCase(),
      },
    }))
    .filter((feature) => feature.properties.type !== "normal")
}

function getAreaName(feature) {
  const properties = feature?.properties || {}
  return properties.name || properties["name:en"] || properties.NAME_1 || properties.NAME || properties.admin || "Area"
}

function getAreaCounts(map, tours, layerId) {
  const groups = new Map()

  tours.forEach((tour) => {
    const coords = getStartCoords(tour)
    if (!coords) return
    const features = map.queryRenderedFeatures(map.project(coords), {layers: [layerId]})
    const name = getAreaName(features[0])
    if (!features.length || name === "Area") return

    const current = groups.get(name) || {name, count: 0, lng: 0, lat: 0}
    current.count += 1
    current.lng += coords[0]
    current.lat += coords[1]
    groups.set(name, current)
  })

  return Array.from(groups.values()).map((group) => ({
    ...group,
    lng: group.lng / group.count,
    lat: group.lat / group.count,
  }))
}

// Group nearby published trips into clusters based on the current zoom.
// Points landing in the same screen-grid cell are merged into one numbered marker.
function computeClusters(points, zoom) {
  const world = 256 * Math.pow(2, zoom)
  const s = world / (2 * Math.PI)
  const grid = 70
  const cells = {}
  for (const p of points) {
    const [lng, lat] = p.coords
    const x = (lng + 180) / 360 * world
    const y = world / 2 - s * Math.log((1 + Math.sin(lat * Math.PI / 180)) / (1 - Math.sin(lat * Math.PI / 180))) / 2
    const key = Math.floor(x / grid) + "_" + Math.floor(y / grid)
    if (!cells[key]) cells[key] = []
    cells[key].push(p)
  }
  return Object.values(cells).map((pts, i) => {
    const lng = pts.reduce((a, p) => a + p.coords[0], 0) / pts.length
    const lat = pts.reduce((a, p) => a + p.coords[1], 0) / pts.length
    return { id: "cl_" + i, lng, lat, points: pts }
  })
}

function MapControls({ minZoom, maxZoom }) {
  const { current: map } = useMap()
  const [zoom, setZoom] = useState(minZoom)
  const [is3D, setIs3D] = useState(false)
  const zoomThumbRef = useRef(null)

  useEffect(() => {
    if (!map) return;

    setZoom(map.getZoom());
    setIs3D(map.getPitch() > 0)

    const handleZoom = () => setZoom(map.getZoom());
    const handlePitch = () => setIs3D(map.getPitch() > 0)

    map.on('zoom', handleZoom);
    map.on('pitch', handlePitch);

    return () => {
      map.off('zoom', handleZoom);
      map.off('pitch', handlePitch);
    }
  }, [map]);

  const zoomIn = () => map && map.zoomTo(Math.min(zoom + 1, maxZoom), { duration: 300 })
  const zoomOut = () => map && map.zoomTo(Math.max(zoom - 1, minZoom), { duration: 300 })

  const toggle3D = () => {
    if (!map) return
    if (!is3D && zoom < 15) {
      map.easeTo({zoom: 15, pitch: 60, duration: 800})
      return
    }
    if (is3D) {
      map.easeTo({ pitch: 0, bearing: 0, duration: 800 })
    } else {
      map.easeTo({ pitch: 60, duration: 800 })
    }
  }

  const handlePointerDown = (e) => {
    if (!map) return;
    e.preventDefault();
    const track = e.currentTarget.closest('.map-zoom-track');
    if (!track) return;

    const trackRect = track.getBoundingClientRect();

    const onPointerMove = (moveEvent) => {
      let newY = moveEvent.clientY - trackRect.top;
      newY = Math.max(0, Math.min(trackRect.height, newY));

      const pct = newY / trackRect.height;
      const newZoom = maxZoom - pct * (maxZoom - minZoom);
      map.jumpTo({ zoom: newZoom });
    };

    const onPointerUp = () => {
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
    };

    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
  };

  const pct = Math.max(0, Math.min(100, ((maxZoom - zoom) / (maxZoom - minZoom)) * 100));

  return (
    <div style={{ position: "absolute", top: "50%", right: 24, left: "auto", transform: "translateY(-50%)", display: "flex", flexDirection: "column", gap: 8, zIndex: 100 }}>
      <div className="map-zoom glass" style={{ position: "relative", top: "auto", left: "auto", transform: "none" }}>
        <button type="button" className="map-zoom-btn" onClick={zoomIn}>+</button>
        <div className="map-zoom-track" onPointerDown={handlePointerDown} style={{ cursor: 'pointer' }}>
          <div
            ref={zoomThumbRef}
            className="map-zoom-thumb"
            style={{ top: `${pct}%` }}
          />
        </div>
        <button type="button" className="map-zoom-btn" onClick={zoomOut}>−</button>
      </div>

      <button className="map-toggle-btn glass" onClick={toggle3D} data-tooltip={is3D ? "2D" : "3D"} style={{
        width: 36, height: 36, borderRadius: 8, fontWeight: 'bold', fontSize: 12,
        background: is3D ? "var(--accent)" : "rgba(15,18,24,0.6)",
        color: is3D ? "var(--accent-ink)" : "var(--text)"
      }}>
        3D
      </button>
    </div>
  )
}

function MapInfoPanel() {
  const { current: map } = useMap()
  const [info, setInfo] = useState({ zoom: 3, lat: 0, lng: 0 })

  useEffect(() => {
    if (!map) return;

    const updateZoom = () => {
      setInfo(prev => ({ ...prev, zoom: map.getZoom() }));
    };

    const handleMouseMove = (e) => {
      setInfo(prev => ({ ...prev, lat: e.lngLat.lat, lng: e.lngLat.lng }));
    };

    const center = map.getCenter();
    setInfo({
      zoom: map.getZoom(),
      lat: center.lat,
      lng: center.lng,
    });

    map.on('zoom', updateZoom);
    map.on('mousemove', handleMouseMove);

    return () => {
      map.off('zoom', updateZoom);
      map.off('mousemove', handleMouseMove);
    };
  }, [map]);

  return (
    <div className="map-info-panel glass" style={{ left: "auto", right: 24, transform: "none", bottom: 24 }}>
      <div className="map-info-item">
        <span>Zoom</span>
        <strong>{info.zoom.toFixed(1)}</strong>
      </div>
      <div className="map-info-divider" />
      <div className="map-info-item">
        <span>X</span>
        <strong>{info.lng.toFixed(2)}</strong>
      </div>
      <div className="map-info-item">
        <span>Y</span>
        <strong>{info.lat.toFixed(2)}</strong>
      </div>
    </div>
  )
}

function TripDetailsPanel({ tour, onClose, onPreview }) {
  if (!tour) return null;

  return (
    <div className="trip-details-panel glass" style={{
      position: "absolute",
      top: 24,
      right: 24,
      bottom: 24,
      width: 380,
      maxWidth: "90vw",
      maxHeight: "90vh",
      overflowY: "auto",
      zIndex: 200,
      borderRadius: 12,
      boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
      display: "flex",
      flexDirection: "column"
    }}>
      <div style={{
        padding: "16px 20px",
        borderBottom: "1px solid var(--line)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 12
      }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: "var(--text)" }}>{tour.title}</h3>
          {tour.description && <p style={{ margin: "6px 0 0", fontSize: 13, color: "var(--muted)" }}>{tour.description}</p>}
        </div>
        <button
          onClick={onClose}
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            border: "1px solid var(--line)",
            background: "var(--bg)",
            color: "var(--text)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            lineHeight: 1,
            flexShrink: 0
          }}
          aria-label="Close"
        >
          ×
        </button>
      </div>

      {tour.image && (
        <img
          src={tour.image}
          alt={tour.title}
          style={{
            width: "100%",
            height: 180,
            objectFit: "cover",
            borderBottom: "1px solid var(--line)"
          }}
        />
      )}

      <div style={{ padding: "16px 20px", flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={{ background: "var(--bg-elevated)", padding: "12px", borderRadius: 8, border: "1px solid var(--line)" }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", color: "var(--muted)", letterSpacing: "0.5px" }}>Price</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--accent)" }}>{tour.minPrice != null ? `${tour.minPrice} DZD` : "—"}</div>
          </div>
          <div style={{ background: "var(--bg-elevated)", padding: "12px", borderRadius: 8, border: "1px solid var(--line)" }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", color: "var(--muted)", letterSpacing: "0.5px" }}>Guests</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>{tour.totalSeats ?? "—"}</div>
          </div>
        </div>

        {tour.distanceKm && (
          <div style={{ background: "var(--bg-elevated)", padding: "12px", borderRadius: 8, border: "1px solid var(--line)" }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", color: "var(--muted)", letterSpacing: "0.5px" }}>Distance</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>{tour.distanceKm} km</div>
          </div>
        )}

        {(tour.includedServices && tour.includedServices.length) && (
          <div>
            <div style={{ fontSize: 11, textTransform: "uppercase", color: "var(--muted)", letterSpacing: "0.5px", marginBottom: 8 }}>Included services</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {tour.includedServices.map((s, i) => (
                <span key={i} style={{ background: "var(--accent)", color: "var(--accent-ink)", padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 500 }}>{s}</span>
              ))}
            </div>
          </div>
        )}

        {(tour.notIncludedServices && tour.notIncludedServices.length) && (
          <div>
            <div style={{ fontSize: 11, textTransform: "uppercase", color: "var(--muted)", letterSpacing: "0.5px", marginBottom: 8 }}>Not included services</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {tour.notIncludedServices.map((s, i) => (
                <span key={i} style={{ background: "var(--bg-elevated)", color: "var(--muted)", padding: "4px 10px", borderRadius: 20, fontSize: 12, border: "1px solid var(--line)" }}>{s}</span>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginTop: "auto", display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            onClick={onPreview}
            style={{
              flex: "1 1 100%",
              padding: "12px 16px",
              background: "var(--accent)",
              color: "var(--accent-ink)",
              border: "none",
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer"
            }}
          >
            Preview
          </button>
        </div>
      </div>
    </div>
  )
}

function HomeMap() {
  const minZoom = 1.9;
  const maxZoom = 20;

  const { mapStyle } = useMapController();
  const mapInstance = useRef(null)
  const navigate = useNavigate()
  const { handleMouseMove, handleMouseLeave, tooltip, handleZoom } = useMapHover()

  const [tours, setTours] = useState([])
  const [zoom, setZoom] = useState(minZoom)
  const [selectedTour, setSelectedTour] = useState(null)
  const [areaCounts, setAreaCounts] = useState([])
  const [mapReady, setMapReady] = useState(false)

  useEffect(() => { document.documentElement.setAttribute("data-theme", "dark") }, [])

  useEffect(() => {
    let mounted = true
    getMapTrips().then((data) => {
      if (mounted) setTours(data || [])
    })
    return () => { mounted = false }
  }, [])

  const initialViewState = {
    longitude: 2.6,
    latitude: 28,
    zoom: minZoom,
    minZoom,
    maxZoom,
    // pitch: 0,
    // bearing: 0,
  }

  const zoomT = Math.max(0, Math.min(1, (zoom - minZoom) / (maxZoom - minZoom)))
  const markerScale = 0.6 + zoomT * 1.1
  const publishedTours = tours
  const clusterPoints = publishedTours
    .map(t => {
      const c = getStartCoords(t)
      return c ? { tour: t, coords: c } : null
    })
    .filter(Boolean)
  const clusters = computeClusters(clusterPoints, zoom)
  const selectedRoute = getRouteFeature(selectedTour)
  const selectedRoutePoints = getRoutePointFeatures(selectedTour)

  useEffect(() => {
    const map = mapInstance.current
    if (!mapReady || !map || !tours.length || !map.isStyleLoaded() || zoom >= 9) {
      setAreaCounts([])
      return undefined
    }

    const layerId = zoom < 5 ? "countries" : "wilayas"
    const updateCounts = () => setAreaCounts(getAreaCounts(map, tours, layerId))
    updateCounts()
    map.once("idle", updateCounts)
    return () => map.off("idle", updateCounts)
  }, [mapReady, tours, zoom])

  useEffect(() => {
    const map = mapInstance.current
    if (!map || !map.isStyleLoaded()) return undefined

    const dimmedLayers = [
      ["ofm-roads-minor", "line-opacity", 0.25],
      ["ofm-roads-major", "line-opacity", 0.35],
      ["ofm-roads-major-casing", "line-opacity", 0.3],
      ["ofm-poi-dots", "circle-opacity", 0.22],
      ["ofm-poi-labels", "text-opacity", 0.2],
      ["ofm-poi-labels-secondary", "text-opacity", 0.2],
      ["ofm-place-labels", "text-opacity", 0.45],
      ["ofm-district-labels", "text-opacity", 0.35],
      ["ofm-neighbourhood-labels", "text-opacity", 0.35],
    ]

    dimmedLayers.forEach(([layerId, property, value]) => {
      if (map.getLayer(layerId)) map.setPaintProperty(layerId, property, selectedTour ? value : 1)
    })

    return () => {
      dimmedLayers.forEach(([layerId, property]) => {
        if (map.getLayer(layerId)) map.setPaintProperty(layerId, property, 1)
      })
    }
  }, [selectedTour])

  useEffect(() => {
    const map = mapInstance.current
    if (!map || !selectedRoute?.geometry?.coordinates?.length) return

    const bounds = new maplibregl.LngLatBounds()
    selectedRoute.geometry.coordinates.forEach((coordinate) => bounds.extend(coordinate))
    map.fitBounds(bounds, {padding: {top: 120, right: 430, bottom: 100, left: 80}, maxZoom: 15, duration: 900})
  }, [selectedRoute])

  useEffect(() => {
    const map = mapInstance.current
    if (!map || !selectedTour) return undefined

    let frameId
    const startedAt = performance.now()
    const animate = (timestamp) => {
      const opacity = 0.86 + Math.sin((timestamp - startedAt) / 650) * 0.1
      if (map.getLayer("selected-route-inner")) map.setPaintProperty("selected-route-inner", "line-opacity", opacity)
      frameId = requestAnimationFrame(animate)
    }
    frameId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameId)
  }, [selectedTour])

  const zoomToCluster = (cl) => {
    const map = mapInstance.current
    if (!map) return
    map.flyTo({
      center: [cl.lng, cl.lat],
      zoom: Math.min(maxZoom, Math.max(zoom + 3, 7)),
      duration: 600,
    })
  }

  const handlePreviewTour = (tour) => {
    setSelectedTour(null)
    navigate(`/Preview/${tour._id}`)
  }

  return (
    <div className="map-shell map-shell-main" style={{ width: '100%', height: '100%', position: 'relative' }}>
      {mapStyle && (
        <Map
          initialViewState={initialViewState}
          mapStyle={mapStyle}
          mapLib={maplibregl}
          style={{ width: '100%', height: '100%', position: "relative" }}
          doubleClickZoom={false}
          dragRotate={true}
          touchZoomRotate={true}
          attributionControl={false}

          onLoad={(event) => { mapInstance.current = event.target; setMapReady(true) }}
          onMouseMove={(event) => {
            if (!mapInstance.current) return
            handleMouseMove(event, mapInstance.current)
          }}
          onMouseLeave={() => {
            if (!mapInstance.current) return
            handleMouseLeave(mapInstance.current)
          }}
          onZoom={(event) => {
            if (!mapInstance.current) return
            handleZoom(event.target)
            setZoom(event.target.getZoom())
          }}
          onPitch={(event) => {
            if (event.target.getZoom() < 15 && event.target.getPitch() > 0) {
              event.target.jumpTo({pitch: 0, bearing: 0})
            }
          }}
        >
          <MapControls minZoom={minZoom} maxZoom={maxZoom} />
          <MapInfoPanel />

          {selectedRoute && (
            <Source
              id="selected-route-source"
              type="geojson"
              data={{type: "FeatureCollection", features: [selectedRoute]}}
            >
              <Layer
                id="selected-route-casing"
                type="line"
                paint={{
                  "line-color": "#111827",
                  "line-width": ["interpolate", ["linear"], ["zoom"], 5, 7, 12, 11, 18, 15],
                  "line-opacity": 0.95,
                  "line-blur": 0.5,
                }}
              />
              <Layer
                id="selected-route-inner"
                type="line"
                paint={{
                  "line-color": "#7cffb2",
                  "line-width": ["interpolate", ["linear"], ["zoom"], 5, 3, 12, 6, 18, 9],
                  "line-opacity": 0.9,
                }}
              />
              <Layer
                id="selected-route-arrows"
                type="symbol"
                layout={{
                  "symbol-placement": "line",
                  "symbol-spacing": 90,
                  "text-field": "➜",
                  "text-size": ["interpolate", ["linear"], ["zoom"], 5, 11, 14, 16],
                  "text-keep-upright": false,
                  "text-allow-overlap": true,
                }}
                paint={{
                  "text-color": "#ffffff",
                  "text-halo-color": "#111827",
                  "text-halo-width": 1.5,
                }}
              />
            </Source>
          )}

          {selectedRoutePoints.length > 0 && (
            <Source
              id="selected-route-points-source"
              type="geojson"
              data={{type: "FeatureCollection", features: selectedRoutePoints}}
            >
              <Layer
                id="selected-route-points"
                type="circle"
                paint={{
                  "circle-color": ["match", ["get", "type"], "start", "#ffffff", "end", "#ff4c4c", "#7cffb2"],
                  "circle-radius": ["interpolate", ["linear"], ["zoom"], 5, 4, 14, 7, 20, 10],
                  "circle-stroke-color": "#111827",
                  "circle-stroke-width": 2,
                }}
              />
            </Source>
          )}

          {areaCounts.map((area) => (
            <Marker key={area.name} longitude={area.lng} latitude={area.lat} anchor="center">
              <div className="hm-area-count">
                <strong>{area.name}</strong>
                <span>{area.count} available trips</span>
              </div>
            </Marker>
          ))}

          {clusters.map((cl) => {
            if (cl.points.length === 1) {
              const t = cl.points[0].tour
              return (
                <Marker
                  key={t._id || t.id || t.title}
                  longitude={cl.lng}
                  latitude={cl.lat}
                  anchor="center"
                  onClick={(e) => {
                    e.originalEvent.stopPropagation()
                    setSelectedTour(t)
                  }}
                >
                  <div className="hm-trip-wrap" style={{ "--hm-scale": markerScale }}>
                    <div className="hm-trip-label">{t.title}</div>
                    <div className="hm-trip-marker" title={t.title}>
                      {t.image
                        ? <img src={t.image} alt="" />
                        : <Icon name="question" />}
                    </div>
                  </div>
                </Marker>
              )
            }
            return (
              <Marker
                key={cl.id}
                longitude={cl.lng}
                latitude={cl.lat}
                anchor="center"
                onClick={() => zoomToCluster(cl)}
              >
                <div className="hm-cluster-marker" style={{ "--hm-scale": markerScale }}>
                  <strong>{cl.points.length}</strong>
                  <span>{zoom < 9 ? "available trips" : "trips"}</span>
                </div>
              </Marker>
            )
          })}
        </Map>
      )}

      {selectedTour && (
        <TripDetailsPanel
          tour={selectedTour}
          onClose={() => setSelectedTour(null)}
          onPreview={() => handlePreviewTour(selectedTour)}
        />
      )}

      {tooltip && (
        <div
          className="glass"
          style={{
            position: "absolute",
            left: tooltip.x + 14,
            top: tooltip.y + 14,
            color: "var(--text)",
            padding: "6px 12px",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: "bold",
            pointerEvents: "none",
            zIndex: 50,
            border: "1px solid var(--line)",
            whiteSpace: "nowrap"
          }}
        >
          {tooltip.name}
        </div>
      )}

      <FpsMeter />
    </div>
  )
}

export default HomeMap
