import {useRef,useState} from "react"
import Map from 'react-map-gl/maplibre'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useMapController } from '../Maps/useMapController2.js'


export default function TestPage() {

  const { mapStyle } = useMapController()
  const mapRef = useRef()
  const hoveredId = useRef(null)

  return (
    <div style={{width: '100%', height: '100vh'}}>

      {mapStyle && (
        <Map
          mapLib={maplibregl}
          mapStyle={mapStyle}
          initialViewState={{longitude: 0,latitude: 28,zoom: 1.9}}
          style={{width: '100%',height: '100%'}}
          ref={mapRef}
          onMouseMove={(event)=>{

            const map = mapRef.current.getMap()
            const features = mapRef.current.queryRenderedFeatures( event.point,{layers:["countries"]})

            if(features.length) {map.getCanvas().style.cursor="pointer"} else {map.getCanvas().style.cursor=""}

            if (features.length === 0) {
              if (hoveredId.current !== null) {
                map.setFeatureState(
                  {
                    source:"world",
                    sourceLayer:"world",
                    id: hoveredId.current
                  },{ hover:false}
                )
              }
              hoveredId.current = null
              return
            }

            const feature = features[0]

            if(hoveredId.current !== feature.id){

              if(hoveredId.current !== null){
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
                },{ hover:true } )
                hoveredId.current = feature.id
              }
            }
          }
          onMouseLeave={()=>{
  
            const map = mapRef.current.getMap()

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
              map.getCanvas().style.cursor=""
          }}
        >
        </Map>
      )}

    </div>  
  )
}