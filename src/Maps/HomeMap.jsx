import { useState, useEffect, useRef } from "react"
import Map, { useMap } from "react-map-gl/maplibre"
import "maplibre-gl/dist/maplibre-gl.css"
import "../styles/maps.css"
import maplibregl from "maplibre-gl"
import { useMapController } from "./useMapController.js"
import { FpsMeter } from "../Components/ui/FpsMeter.jsx"
import { CountryHoverLayer, WilayaHoverLayer } from "./HoverLayers.jsx"

function MapControls({ minZoom, maxZoom }) {
  const { current: map } = useMap()
  const [zoom, setZoom] = useState(minZoom)
  const [is3D, setIs3D] = useState(false)
  const zoomThumbRef = useRef(null)

  useEffect(() => {
    if (!map) return;
    
    // Set initial zoom
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

  // Calculate percentage (0% = maxZoom, 100% = minZoom)
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

    // Initialize with center, then track mouse
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
  const minZoom = 3;
  const maxZoom = 20;

  const { mapStyle, showPOIs, togglePOIs } = useMapController();

  useEffect(() => {document.documentElement.setAttribute("data-theme", "dark")}, [])

  const initialViewState = {
    latitude: 0,
    longitude: 0,
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
          style={{ width: '100%', height: '100%' }}
          doubleClickZoom={false}
          dragRotate={true}
          touchZoomRotate={true}
          attributionControl={false}
        >
          <MapControls minZoom={minZoom} maxZoom={maxZoom} />
          <MapInfoPanel />
          <CountryHoverLayer />
          <WilayaHoverLayer />
        </Map>
      )}

      <div 
        className="glass" 
        style={{
          position: 'absolute', top: 12, right: 12, zIndex: 100,
          display: 'flex', flexDirection: 'column',
          borderRadius: '8px', overflow: 'hidden',
          border: '1px solid var(--line)'
        }}
      >
        <button
          className="map-toggle-btn"
          data-tooltip={showPOIs ? "إخفاء الأماكن" : "إظهار الأماكن"}
          onClick={togglePOIs}
          style={{
            background: showPOIs ? 'var(--accent)' : 'transparent',
            color: showPOIs ? 'var(--accent-ink)' : 'var(--text-muted)',
            opacity: showPOIs ? 1 : 0.6
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
            {!showPOIs && <line x1="3" y1="3" x2="21" y2="21" stroke="currentColor" strokeWidth="2" />}
          </svg>
        </button>
      </div>

      <FpsMeter />
    </div>
  )
}

export default HomeMap