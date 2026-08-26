// OPENFREEMAP | Zoom 9-20
// مستوى واحد من 9 الى 20 يعتمد على بيانات OpenFreeMap (OpenMapTiles schema)
// المصدر: openfreemap (معرّف في MapStyle.js)
// ستايل الطرق في ملف مستقل: ../roadsStyle.js

import { buildRoadsStyle } from '../roadsStyle'

export function buildLevel_3(colors) {
  return [

    // Landcover //
    // {
    //   id: 'ofm-landcover',
    //   type: 'fill',
    //   source: 'openfreemap',
    //   'source-layer': 'landcover',

    //   minzoom: 9,

    //   paint: {
    //     'fill-color': '#58565168',
    //     'fill-opacity': 1
    //   }
    // },

    // Landuse //
    {
      id: 'ofm-landuse',
      type: 'fill',
      source: 'openfreemap',
      'source-layer': 'landuse',

      minzoom: 13,

      paint: {
        'fill-color': '#ced4dc53',
        'fill-opacity': 1
      }
    },

    ...buildRoadsStyle(),

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
        'text-field': ['coalesce', ['get', 'name:en'], ['get', 'name']],
        'text-size': [
          'interpolate',
          ['linear'],
          ['zoom'],
          9, 11,
          14, 14,
          18, 18
        ],
        'text-anchor': 'center',
        'text-variable-anchor': ['center', 'left', 'right'],
        'symbol-sort-key': ['get', 'rank']
      },

      paint: {
        'text-color': colors.label,
        'text-halo-color': colors.labelHalo,
        'text-halo-width': 1.5
      }
    },
    
    // Buildings 3D
    {
      id: 'ofm-buildings-3d',
      type: 'fill-extrusion',

      source: 'openfreemap',
      'source-layer': 'building',

      minzoom: 13,

      paint: {

        'fill-extrusion-color': '#e28306',
        'fill-extrusion-height': [
          'coalesce',
          ['get', 'render_height'],
          30
        ],
        'fill-extrusion-base': [
          'coalesce',
          ['get', 'render_min_height'],
          0
        ],
        'fill-extrusion-opacity': 0.5
      }
    },

    // Wilayas Labels //
    {
      id: "wilaya-labels",
      type: "symbol",
      source: "WilayasLabels",
      minzoom: 4,
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
    }


  ]
}
