import { useState, useEffect, useRef } from "react"
import Map, { useMap } from "react-map-gl/maplibre"
import "maplibre-gl/dist/maplibre-gl.css"
import "../styles/maps.css"
import maplibregl from "maplibre-gl"
import { useMapController } from "./UseStates/useMapController.js"
import { useMapHover } from "./UseStates/useMapHover.js"
import { FpsMeter } from "../Components/ui/FpsMeter.jsx"

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

function HomeMap() {
  const minZoom = 1.9;
  const maxZoom = 20;

  const { mapStyle } = useMapController();
  const mapInstance = useRef(null)
  const { handleMouseMove, handleMouseLeave, tooltip, handleZoom } = useMapHover()

  useEffect(() => { document.documentElement.setAttribute("data-theme", "dark") }, [])

  const initialViewState = {
    longitude: 1,
    latitude: 35,
    zoom: minZoom,
    pitch: 0,
    minZoom,
    maxZoom,
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

          onLoad={(event) => { mapInstance.current = event.target }}
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
          }}
        >
          <MapControls minZoom={minZoom} maxZoom={maxZoom} />
          <MapInfoPanel />
        </Map>
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
