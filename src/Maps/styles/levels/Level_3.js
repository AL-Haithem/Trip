// OPENFREEMAP | Zoom 9-20
// مستوى واحد من 9 الى 20 يعتمد على بيانات OpenFreeMap (OpenMapTiles schema)
// المصدر: openfreemap (معرّف في MapStyle.js)
// ستايل الطرق في ملف مستقل: ../roadsStyle.js
// ستايل نقاط الاهتمام في ملف مستقل: ../poisStyle.js

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
        'text-field': ['coalesce', ['get', 'name:en'], ['get', 'name']],
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
    
    // Buildings 3D
    {
      id: 'ofm-buildings-3d',
      type: 'fill-extrusion',

      source: 'openfreemap',
      'source-layer': 'building',

      minzoom: 15,

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
        'fill-extrusion-opacity': 0.9
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
