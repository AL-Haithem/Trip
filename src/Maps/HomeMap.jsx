import {useEffect, useState} from "react"

import { Manager } from "./Generator"
import { updateZoom } from "./MapController"

const scale = 1

function MainMap() {

  const [data, setData] = useState(null)

  const [viewBox,setViewBox] = useState({ x:-180, y:-90, width:360, height:180})
  const [zoom, setZoom] = useState(1)

  useEffect(() => {
    async function LoadMapData(){
      const result = await Manager()
      setData(result)
    }
    LoadMapData()
  }, [])

  if (!data) return null

  const zoomPosition = 100 - ((zoom - 1) / 9) * 100
  function zoomIn() {
    const value = Math.min(zoom + 1,10)
    setZoom(value)
    updateZoom(value,setViewBox)
  }

  function zoomOut() {
    const value = Math.max(zoom - 1,1)
    setZoom(value)
    updateZoom( value, setViewBox)
  }

  return (
    <div className="map-shell">

      <div className="map-zoom glass">
        <button type="button" className="map-zoom-btn" onClick={zoomIn}>+</button>
        <div className="map-zoom-track"> <div className="map-zoom-thumb" style={{top: `${zoomPosition}%`}} /></div>
        <button type="button" className="map-zoom-btn" onClick={zoomOut}>−</button>
      </div>

      <svg 
        className="map-canvas" preserveAspectRatio="xMidYMid slice" 
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
        style={{border: "3px solid rgb(255, 255, 255)"}}
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