import {useRef} from "react"
import Map from 'react-map-gl/maplibre'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

import { useMapController } from '../Maps//UseStates/useMapController.js'
import { useMapHover } from '../Maps//UseStates/useMapHover.js'
 

export default function TestPage() {

  const { mapStyle } = useMapController()
  const mapInstance = useRef(null)
  const { handleMouseMove , handleMouseLeave , tooltip , handleZoom } = useMapHover()

  return (
    <div style={{width: '100%', height: '100vh'}}>

      {mapStyle && (
        <Map
          renderWorldCopies={false}
          mapLib={maplibregl}
          mapStyle={mapStyle}
          initialViewState={{zoom: 1.9}}
          style={{ width: '100%' , height: '100vh', position: "relative" }}

          onLoad={(event)=>{mapInstance.current = event.target}}
          onMouseMove={(event)=>  {
            if (!mapInstance.current) return
            handleMouseMove(event, mapInstance.current) 
          }}
          onMouseLeave={()=>{
            if (!mapInstance.current) return
            handleMouseLeave( mapInstance.current)
          }}
          onZoom={(event) => {
            if (!mapInstance.current) return
            handleZoom(mapInstance.current)
          }}
        />
      )}

      {tooltip && (
        <div
          style={{
            position: "absolute",
            left: tooltip.x + 14,
            top: tooltip.y + 14,
            background: "var(--bg-panel)",
            color: "var(--text)",
            padding: "6px 12px",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: "bold",
            pointerEvents: "none",
            zIndex: 50,
            boxShadow: "var(--shadow)",
            border: "1px solid var(--line)",
            whiteSpace: "nowrap"
          }}
        >
          {tooltip.name}
        </div>
      )}
    </div>  
  )
}