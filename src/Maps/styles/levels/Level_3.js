// OPENFREEMAP | Zoom 9-20
// Single level from 9 to 20 based on OpenFreeMap data (OpenMapTiles schema)
// Source: openfreemap (defined in MapStyle.js)
// Road style in separate file: ../roadsStyle.js
// POI style in separate file: ../poisStyle.js

import { buildRoadsStyle } from '../roadsStyle'
import { buildPoisStyle } from '../poisStyle'

export function buildLevel_3(colors) {
  return [
    // Landuse //
    // {
    //   id: 'ofm-landuse',
    //   type: 'fill',
    //   source: 'openfreemap',
    //   'source-layer': 'landuse',

    //   minzoom: 14,

    //   paint: {
    //     'fill-color': colors.ofm.landuse,
    //     'fill-opacity': 1
    //   }
    // },

    ...buildRoadsStyle(colors),


    // Place Labels: city / town //
    {
      id: 'ofm-place-labels',
      type: 'symbol',
      source: 'openfreemap',
      'source-layer': 'place',

      minzoom: 9,

      filter: [
        'in',
        ['get', 'class'],
        ['literal', ['city', 'town', 'village']]
      ],

      layout: {
        'text-field': ['coalesce', ['get', 'name:ar'], ['get', 'name:fr'], ['get', 'name:en'], ['get', 'name']],
        'text-size': [
          'interpolate',
          ['linear'],
          ['zoom'],
          9, 15,
          14, 19,
          18, 22
        ],
        'text-anchor': 'center',
        'text-variable-anchor': ['center', 'left', 'right'],
        'symbol-sort-key': ['get', 'rank']
      },

      paint: {
        'text-color': colors.label,
        'text-halo-color': colors.labelHalo,
        'text-halo-width': .2
      }
    },

    // District and neighbourhood labels from OpenFreeMap //
    {
      id: 'ofm-district-labels',
      type: 'symbol',
      source: 'openfreemap',
      'source-layer': 'place',
      minzoom: 12,
      filter: [
        'in',
        ['get', 'class'],
        ['literal', ['district', 'suburb', 'locality']]
      ],
      layout: {
        'text-field': ['coalesce', ['get', 'name:ar'], ['get', 'name:fr'], ['get', 'name:en'], ['get', 'name']],
        'text-size': [
          'interpolate',
          ['linear'],
          ['zoom'],
          12, 12,
          16, 15,
          20, 18
        ],
        'text-anchor': 'center',
        'text-variable-anchor': ['center', 'left', 'right'],
        'symbol-sort-key': ['coalesce', ['get', 'rank'], 99]
      },
      paint: {
        'text-color': colors.label,
        'text-halo-color': colors.labelHalo,
        'text-halo-width': 1
      }
    },

    {
      id: 'ofm-neighbourhood-labels',
      type: 'symbol',
      source: 'openfreemap',
      'source-layer': 'place',
      minzoom: 12,
      filter: [
        'in',
        ['get', 'class'],
        ['literal', ['neighbourhood', 'quarter']]
      ],
      layout: {
        'text-field': ['coalesce', ['get', 'name:ar'], ['get', 'name:fr'], ['get', 'name:en'], ['get', 'name']],
        'text-size': [
          'interpolate',
          ['linear'],
          ['zoom'],
          12, 10,
          16, 12,
          20, 15
        ],
        'text-anchor': 'center',
        'text-variable-anchor': ['center', 'left', 'right'],
        'symbol-sort-key': ['coalesce', ['get', 'rank'], 99]
      },
      paint: {
        'text-color': colors.countryLabel,
        'text-halo-color': colors.labelHalo,
        'text-halo-width': 0.8
      }
    },
    
    // Buildings 3D
    {
      id: 'ofm-buildings-3d',
      type: 'fill-extrusion',

      source: 'openfreemap',
      'source-layer': 'building',

      minzoom: 16,

      paint: {

        'fill-extrusion-color': colors.ofm.building3d,
        'fill-extrusion-height': [
          'coalesce',
          ['get', 'render_height'],
          1
        ],
        'fill-extrusion-base': [
          'coalesce',
          ['get', 'render_min_height'],
          0
        ],
        'fill-extrusion-opacity': 0.72
      }
    },

    // Major street names only at the highest zoom levels //
    {
      id: 'ofm-major-street-labels',
      type: 'symbol',
      source: 'openfreemap',
      'source-layer': 'transportation_name',
      minzoom: 16,
      filter: [
        'in',
        ['get', 'class'],
        ['literal', ['motorway', 'trunk', 'primary', 'secondary', 'tertiary']]
      ],
      layout: {
        'text-field': ['coalesce', ['get', 'name:ar'], ['get', 'name:fr'], ['get', 'name:en'], ['get', 'name']],
        'symbol-placement': 'line',
        'text-size': ['interpolate', ['linear'], ['zoom'], 16, 10, 20, 13],
        'text-optional': true,
        'symbol-sort-key': ['coalesce', ['get', 'rank'], 99]
      },
      paint: {
        'text-color': colors.label,
        'text-halo-color': colors.labelHalo,
        'text-halo-width': 1
      }
    },

    ...buildPoisStyle(colors),

    // Wilayas Labels //
    {
      id: "wilaya-labels",
      type: "symbol",
      source: "WilayasLabels",
      minzoom: 5,
      maxzoom: 9,
      layout: {
        "text-field": ["get", "name"],
        "text-size": [
          "interpolate",
          ["linear"],   
          ["zoom"],
          5, 15,
          6, 13,
          7, 10,
        ],
        "text-anchor": "center",
      },
      paint: {
        "text-color": colors.countryLabel,
        "text-halo-color": colors.labelHalo,
        "text-halo-width": 1.5
      }
    },

    


  ]
}
