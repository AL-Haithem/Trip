// ROADS | road layers from OpenFreeMap
// Used inside Level_3 | colors from mapTheme (colors.ofm)

export function buildRoadsStyle(colors) {
  return [

    // Roads: minor //
    {
      id: 'ofm-roads-minor',
      type: 'line',
      source: 'openfreemap',
      'source-layer': 'transportation',

      minzoom: 12,

      filter: [
        'in',
        ['get', 'class'],
        ['literal', ['minor', 'service', 'path']]
      ],

      layout: {
        'line-cap': 'round'
      },

      paint: {
        'line-color': colors.ofm.roadMinor,
        'line-width': [
          'interpolate',
          ['linear'],
          ['zoom'],
          12, 0.5,
          20, 6
        ]
      }
    },

    // Roads: major //
    {
      id: 'ofm-roads-major',
      type: 'line',
      source: 'openfreemap',
      'source-layer': 'transportation',

      minzoom: 9,

      filter: [
        'in',
        ['get', 'class'],
        ['literal', ['motorway', 'trunk', 'primary', 'secondary', 'tertiary']]
      ],

      layout: {
        'line-cap': 'round'
      },

      paint: {
        'line-color': colors.ofm.roadMajor,
        'line-width': [
          'interpolate',
          ['linear'],
          ['zoom'],
          9, 0.5,
          13, 1.5,
          17, 4,
          20, 12
        ]
      }
    },

    // Roads: major casing //
    {
      id: 'ofm-roads-major-casing',
      type: 'line',
      source: 'openfreemap',
      'source-layer': 'transportation',

      minzoom: 13,

      filter: [
        'in',
        ['get', 'class'],
        ['literal', ['motorway', 'trunk', 'primary']]
      ],

      paint: {
        'line-color': colors.ofm.roadCasing,
        'line-width': [
          'interpolate',
          ['linear'],
          ['zoom'],
          13, 2.5,
          17, 6,
          20, 16
        ]
      }
    }

  ]
}
