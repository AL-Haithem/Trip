import { getMapColors } from "./mapTheme"
import { buildAllLayers } from "./styles"
import { cdnUrl } from "../config/endpoints.js"

export function buildPMTilesStyle(versions) {

  const colors = getMapColors()

  return {
    version: 8,
    glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
    sources: {

      world: {
        type: 'vector',
        url: `pmtiles://${cdnUrl(`trip data/world/v${versions.world}.pmtiles`)}`
      },

      algeria: {
        type: 'vector',
        url: `pmtiles://${cdnUrl(`trip data/DZA/v${versions.DZA}.pmtiles`)}`
      },

      countryLabels: {
        type: "geojson",
        data: cdnUrl(`trip data/labels/world-labels-v${versions.worldLabels}.json`)
      },

      WilayasLabels: {
        type: "geojson",
        data: cdnUrl(`trip data/labels/DZA-labels-v${versions.DZALabels}.json`)
      },

      openfreemap: {
        type: 'vector',
        url: 'https://tiles.openfreemap.org/planet'
      },

      hillshadeDEM: {
        type: "raster-dem",
        tiles: [
          "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"
        ],
        tileSize: 256,
        encoding: "terrarium",
        maxzoom: 14
      }
    },

    layers: [

      {
        id: "background",
        type: "background",
        paint: { "background-color": colors.water }
      },

      ...buildAllLayers(colors),
    ],

  }
}
