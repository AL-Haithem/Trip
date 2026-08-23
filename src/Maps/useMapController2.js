import { useEffect, useState } from 'react'
import { Protocol } from 'pmtiles'
import maplibregl from 'maplibre-gl'

let protocolRegistered = false

function registerPMTilesProtocol() {
  if (protocolRegistered) return
  const protocol = new Protocol()
  maplibregl.addProtocol( 'pmtiles', protocol.tile.bind(protocol) )
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
        id: 'background',
        type: 'background',
        paint: {'background-color': 'rgb(38, 66, 109)'}
      },

      {
        id: 'countries',
        type: 'fill',
        source: 'world',
        'source-layer': 'world',
        paint: { "fill-color":["case",["boolean",["feature-state","hover"],false],"#ffe6007e","#252b34"]}
      },

      {
        id: 'country-borders',
        type: 'line',
        source: 'world',
        'source-layer': 'world',
        maxzoom: 5,
        paint: { 'line-color': '#000000', 'line-width': 2 }
      },

      {
        id: 'wilayas',
        type: 'fill',
        source: 'algeria',
        'source-layer': 'DZA',
        minzoom: 3,
        paint: { "fill-color":["case",["boolean",["feature-state","hover"],false],"#ffe6007e  ","#2c3440"]}
      },

      {
        id: 'wilaya-borders',
        type: 'line',
        source: 'algeria',
        'source-layer': 'DZA',
        minzoom: 3,
        paint: {'line-color': '#a8c23588','line-width': 1}
      }
    ]
  }
}

export function useMapController() {

  const [mapStyle, setMapStyle] = useState(null)

  useEffect(() => {
    registerPMTilesProtocol()
    setMapStyle(buildPMTilesStyle())
  }, [])

  return {mapStyle}
}