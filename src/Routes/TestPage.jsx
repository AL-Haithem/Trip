import { useEffect } from 'react'
import Map, { useMap } from 'react-map-gl/maplibre'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useMapController } from '../Maps/useMapController2.js'

export default function TestPage() {

  const { mapStyle } = useMapController()

  return (
    <div
      style={{
        width: '100%',
        height: '100vh'
      }}
    >

      {mapStyle && (
        <Map
          mapLib={maplibregl}
          mapStyle={mapStyle}

          initialViewState={{
            longitude: 2.5,
            latitude: 28,
            zoom: 3
          }}

          style={{
            width: '100%',
            height: '100%'
          }}

        >
        </Map>
      )}
    </div>
  )
}