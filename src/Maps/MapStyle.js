import { getMapColors } from "./mapTheme"
import { buildAllLayers } from "./styles"

export function buildPMTilesStyle() {

  const colors = getMapColors()

  return {
    version: 8,
    glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
    sources: {

      world: {
        type: 'vector',
        url: 'pmtiles:///maps/world.pmtiles'
      },

      algeria: {
        type: 'vector',
        url: 'pmtiles:///maps/DZA.pmtiles'
      },

      countryLabels: {
        type: 'geojson',
        data: "/maps/world-labels.json"
      },

      WilayasLabels: {
        type: 'geojson',
        data: "/maps/DZA-labels.json"
      },

      openfreemap: {
        type: 'vector',
        url: 'https://tiles.openfreemap.org/planet'
      },

      hillshadeDEM:{
        type:"raster-dem",
        tiles:[
          "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"
        ],
        tileSize:256,
        encoding:"terrarium",
        maxzoom:14
      }
    },

    layers: [

      {
        id:"background",
        type:"background",
        paint:{ "background-color":colors.water  }
      },

      ...buildAllLayers(colors),
    ],

  }
}
