import {useEffect, useState} from "react"

import { Manager } from "./Generator"
import { useMapController } from "./MapController"

const scale = 1

function MainMap() {

  const map = useMapController()

  const [data, setData] = useState(null)

  useEffect(() => {
    async function LoadMapData(){
      const result = await Manager()
      setData(result)
    }
    LoadMapData()
  }, [])

  if (!data) return null

  const zoomPosition = 100 - ((map.zoom - 1) / 9) * 100

  return (
    <div className="map-shell">

      <div className="map-zoom glass">
        <button type="button" className="map-zoom-btn" onClick={map.zoomIn}>+</button>
        <div className="map-zoom-track"> <div className="map-zoom-thumb" style={{top: `${zoomPosition}%`}} /></div>
        <button type="button" className="map-zoom-btn" onClick={map.zoomOut}>−</button>
      </div>

      <svg 
        className="map-canvas" preserveAspectRatio="xMidYMid meet" 
        viewBox={`${map.viewBox.x} ${map.viewBox.y} ${map.viewBox.width} ${map.viewBox.height}`}
        style={{border: "3px solid rgb(255, 255, 255)",touchAction:"none"}}
        onMouseDown={map.startPan}
        onMouseMove={map.movePan}
        onMouseUp={map.endPan}
        onMouseLeave={map.endPan}
        onWheel={map.zoomWheel}
      >

        <defs>
          <pattern id="grid" width={scale} height={scale} patternUnits="userSpaceOnUse" >
            <path d={`M ${scale} 0 L 0 0 0 ${scale}`} fill="none" stroke="rgba(255, 255, 255, 0.29)" strokeWidth="0.05"/>
          </pattern>
        </defs>

        <rect x="-180" y="-90" width="360" height="180"   fill="url(#grid)"/>

        {data.map(country => {

          const code = String(country.code).trim().toUpperCase()
          const isSpecial = code === "XXX"

          return (
            <path
              key={country.code}
              d={country.path}
              fill={isSpecial ? "#00ffe147" : "#2d2626"}
              stroke={isSpecial ? "#ffffff47" :"#fefefe98"}
              strokeWidth={isSpecial ? ".4" : "0.3"}
            />
          )
        })}
  
      </svg>

    </div>
  )
}

export default MainMap