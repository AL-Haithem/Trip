import { getMapColors } from "./mapTheme"

const COUNTRY_LABEL_POINTS = {
  DZA: {
    name: 'Algeria',
    coordinates: [2.5, 28]
  }
}

const countryLabels = {
  type: 'FeatureCollection',

  features: Object.entries(COUNTRY_LABEL_POINTS).map(
    ([iso, country]) => ({
      type: 'Feature',

      properties: {
        ISO_3_coun: iso,
        English_Na: country.name
      },

      geometry: {
        type: 'Point',
        coordinates: country.coordinates
      }
    })
  )
}

export function buildPMTilesStyle() {

  const colors = getMapColors()

  return {
    version: 8,

    glyphs:
      'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',

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
        data: countryLabels
      }

    },

    layers: [

      // ─────────────────────────────
      // Background / Water
      // ─────────────────────────────

      {
        id: 'background',
        type: 'background',

        paint: {
          'background-color': colors.water
        }
      },


      // ─────────────────────────────
      // Countries
      // ─────────────────────────────

      {
        id: 'countries',
        type: 'fill',

        source: 'world',
        'source-layer': 'world',

        paint: {
          'fill-color': [
            'case',

            ['==', ['get', 'ISO_3_coun'], 'XXX'],
            '#1a1f27',

            '#2c3440'
          ]
        }
      },


      // ─────────────────────────────
      // Country Labels
      // ─────────────────────────────

      {
        id: 'country-labels',
        type: 'symbol',
        source: 'countryLabels',

        maxzoom: 5,

        layout: {
          'text-field': ['get', 'English_Na'],

          'text-size': [
            'interpolate',
            ['linear'],
            ['zoom'],
            3, 10,
            5, 13,
            8, 16
          ],

          'text-anchor': 'center'
        },

        paint: {
          'text-color': colors.countryLabel,
          'text-halo-color': colors.labelHalo,
          'text-halo-width': 1.5
        }
      },


      // ─────────────────────────────
      // Country Hover
      // ─────────────────────────────

      {
        id: 'countries-hover',
        type: 'fill',

        source: 'world',
        'source-layer': 'world',
        

        paint: {

          'fill-color':
            '#000000',

          'fill-opacity': [
            'case',

            [
              'boolean',
              ['feature-state', 'hover'],
              false
            ],

            0.2,

            0
          ]
        }
      },


      // ─────────────────────────────
      // Country Borders
      // ─────────────────────────────

      {
        id: 'country-borders',
        type: 'line',

        source: 'world',
        'source-layer': 'world',

        maxzoom: 5,

        paint: {

          'line-color':
            colors.borders.country.color,

          'line-width': [
            'interpolate',
            ['linear'],
            ['zoom'],

            3,
            colors.borders.country.widthMin,

            10,
            colors.borders.country.widthMax
          ]
        }
      },


      // ─────────────────────────────
      // Wilayas
      // ─────────────────────────────

      {
        id: 'wilayas',
        type: 'fill',

        source: 'algeria',
        'source-layer': 'DZA',

        minzoom: 3,

        paint: {

          'fill-color': [
            'case',

            [
              'boolean',
              ['feature-state', 'hover'],
              false
            ],

            '#ffe6007e',

            '#2c3440'
          ]
        }
      },


      // ─────────────────────────────
      // Wilaya Borders
      // ─────────────────────────────

      {
        id: 'wilaya-borders',
        type: 'line',

        source: 'algeria',
        'source-layer': 'DZA',

        minzoom: 3,

        paint: {

          'line-color':
            colors.borders.state.color,

          'line-width': [
            'interpolate',
            ['linear'],
            ['zoom'],

            3,
            colors.borders.state.widthMin,

            10,
            colors.borders.state.widthMax
          ]
        }
      }

    ]
  }
}