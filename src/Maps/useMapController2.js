import { useEffect, useState } from 'react'
import { Protocol } from 'pmtiles'
import maplibregl from 'maplibre-gl'

let protocolRegistered = false

function registerPMTilesProtocol() {

  if (protocolRegistered) return

  const protocol = new Protocol()

  maplibregl.addProtocol(
    'pmtiles',
    protocol.tile.bind(protocol)
  )

  protocolRegistered = true
}

function buildPMTilesStyle() {

  return {

    version: 8,

    sources: {

      world: {
        type: 'vector',
        url: 'pmtiles:///maps/world.pmtiles'
      },

      algeria: {
        type: 'vector',
        url: 'pmtiles:///maps/DZA.pmtiles'
      }

    },

    layers: [

 {
  id: 'countries',

  type: 'fill',

  source: 'world',

  'source-layer': 'world',

  paint: {
    'fill-color': '#00ff00',
    'fill-opacity': 0.2
  }
},

{
  id: 'country-borders',

  type: 'line',

  source: 'world',

  'source-layer': 'world',

  maxzoom: 5,

  paint: {
    'line-color': '#0000ff',
    'line-width': 5
  }
},

      {
  id: 'wilayas',

  type: 'fill',

  source: 'algeria',

  'source-layer': 'DZA',

  minzoom: 5,

  paint: {
    'fill-color': '#ff00ff',
    'fill-opacity': 0.7
  }
},

{
  id: 'wilaya-borders',

  type: 'line',

  source: 'algeria',

  'source-layer': 'DZA',

  minzoom: 5,

  paint: {
    'line-color': '#ff0000',
    'line-width': 5
  }
}

    ]

  }

}

export function useMapController() {

  const [mapStyle, setMapStyle] = useState(null)

  useEffect(() => {

    registerPMTilesProtocol()

    setMapStyle(
      buildPMTilesStyle()
    )

  }, [])

  return {
    mapStyle
  }

}