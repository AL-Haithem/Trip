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
        url: 'pmtiles://https://pub-7e98b7cbd8d54f91a1f94a9b9e71316b.r2.dev/trip%20data/world/v0.pmtiles'
      },

      algeria: {
        type: 'vector',
        url: 'pmtiles://https://pub-7e98b7cbd8d54f91a1f94a9b9e71316b.r2.dev/trip%20data/DZA/v0.pmtiles'
      },

      countryLabels: {
        type: "geojson",
        data: "https://pub-7e98b7cbd8d54f91a1f94a9b9e71316b.r2.dev/trip%20data/labels/world-labels-v0.json"
      },

      WilayasLabels: {
        type: "geojson",
        data: "https://pub-7e98b7cbd8d54f91a1f94a9b9e71316b.r2.dev/trip%20data/labels/DZA-labels-v0.json"
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
