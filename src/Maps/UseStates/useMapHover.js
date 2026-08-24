import { useRef,useState } from "react"

export function useMapHover(){

  const hoveredId = useRef(null)
  const [tooltip, setTooltip] = useState(null)

  function handleZoom(map) {
    if (map.getZoom() >= 5) {
      clearHover(map)
      setTooltip(null)
      map.getCanvas().style.cursor = ""
    }
  }

  function handleMouseMove(event, map){

    if (map.getZoom() >= 5) {
    return
  }
 
    const features = map.queryRenderedFeatures( event.point,{layers:["countries"]})

    if (features.length) {map.getCanvas().style.cursor="pointer"} else {map.getCanvas().style.cursor=""}

    if (features.length === 0) {
      clearHover(map)
      setTooltip(null)
      return
    }

    const feature = features[0]

    const name = feature.properties?.ISO_3_coun === "XXX" ? "Not Available Yet": feature.properties?.English_Na

    setTooltip({ x: event.point.x, y: event.point.y, name})

    if (hoveredId.current !== feature.id) {
      if (hoveredId.current != null) {
        map.setFeatureState(
          {
            source:"world",
            sourceLayer:"world",
            id: hoveredId.current
          },
          {hover:false}
        )
      }

      map.setFeatureState(
        {
          source:"world",
          sourceLayer:"world",
          id:feature.id
        },
        { hover:true } )
      hoveredId.current = feature.id
    }   

  }

  function clearHover(map){

    if(hoveredId.current !== null){

      map.setFeatureState(
        {
          source:"world",
          sourceLayer:"world",
          id:hoveredId.current
        },
        {hover:false}
      )

      hoveredId.current=null
    }

  }

  function handleMouseLeave(map){
    clearHover(map)
    setTooltip(null)
    map.getCanvas().style.cursor=""
  }

  return {
    handleMouseMove,
    handleMouseLeave,
    tooltip,
    handleZoom,
  }

}