import { useRef,useState } from "react"

export function useMapHover(){

  const hoveredCountry = useRef(null)
  const hoveredWilaya = useRef(null)
  const [tooltip, setTooltip] = useState(null)

  function handleZoom(map) {
    if (map.getZoom() >= 5) {
      clearHover(map)
      setTooltip(null)
      map.getCanvas().style.cursor = ""
    }
  }

  function handleMouseMove(event, map){

    const zoom = map.getZoom()

    let layer
    let source
    let sourceLayer

    if(zoom < 5) {
      layer="countries"
      source="world"
      sourceLayer="world" 
    } else {
      layer="wilayas"
      source="algeria"
      sourceLayer="DZA"
    }
 
    const features = map.queryRenderedFeatures( event.point,{layers:[layer]})

    if (features.length) {map.getCanvas().style.cursor="pointer"} else {map.getCanvas().style.cursor=""}

    if (features.length === 0) {
      clearHover(map)
      setTooltip(null)
      return
    }

    const feature = features[0]

    const id = feature.id

    if (layer==="countries") {
      if (hoveredCountry.current !== id) {
        if (hoveredCountry.current != null) {
          map.setFeatureState(
            {
              source :"world",
              sourceLayer :"world",
              id: hoveredCountry.current
            },
            {hover:false}
          )
        }

        map.setFeatureState(
          {
            source :"world",
            sourceLayer :"world",
            id
          },
          { hover:true } )
        hoveredCountry.current = id
      }

      const name = feature.properties?.ISO_3_coun === "XXX" ? "Not Available Yet": feature.properties?.English_Na
      setTooltip({ x: event.point.x, y: event.point.y, name})
    } else {  
      if (hoveredWilaya.current !== id) {

        if (hoveredWilaya.current != null) {
          map.setFeatureState({
              source:"algeria",
              sourceLayer:"DZA",
              id: hoveredWilaya.current
          },{hover:false})
        }

        map.setFeatureState({
            source:"algeria",
            sourceLayer:"DZA",
            id
        },{ hover:true } )
        hoveredWilaya.current = id
      }
      
      setTooltip({
        x:event.point.x,
        y:event.point.y,
        name:feature.properties.name
      })
    }
  }

  function clearHover(map){

    if(hoveredCountry.current !== null){
      map.setFeatureState( {
          source:"world",
          sourceLayer:"world",
          id:hoveredCountry.current
        }, {hover:false})
      hoveredCountry.current = null
    }

    if(hoveredWilaya.current !== null){
      map.setFeatureState({
          source:"algeria",
          sourceLayer:"DZA",
          id:hoveredWilaya.current
        },{hover:false})
      hoveredWilaya.current = null
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