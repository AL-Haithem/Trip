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
      }

    },

    layers: [

      // Background | Water //
      {
        id: 'background',
        type: 'background',

        paint: {
          'background-color': colors.water
        }
      },

      ...buildAllLayers(colors)

    ]
  }
}
