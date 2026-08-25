// WILAYAS | Zoom 5-9
// wilayas, wilaya labels, wilaya hover, wilaya borders

export function buildLevel_5_9(colors) {
  return [

    // Wilayas //
    {
      id: 'wilayas',
      type: 'fill',

      source: 'algeria',
      'source-layer': 'DZA',

      minzoom: 5,
      maxzoom: 9,

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

    // Wilaya Borders //
    {
      id: 'wilaya-borders',
      type: 'line',

      source: 'algeria',
      'source-layer': 'DZA',

      minzoom: 5,
      maxzoom: 9,

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
    },

    // Wilayas Hover //
    {
      id: "wilayas-hover",
      type: "fill",
      source: "algeria",

      "source-layer": "DZA",

      minzoom: 5,
      maxzoom: 9,

      paint: {
        "fill-color": "#000000",
        "fill-opacity": [ "case",
          [
            "boolean",
            ["feature-state", "hover"],
            false
          ],
          0.5,
          0
        ]
      }

    },

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
          6, 10,
          7, 10,
          8, 10,
          9, 10,
        ],
        "text-anchor": "center"
      },
      paint: {
        "text-color": colors.countryLabel,
        "text-halo-color": colors.labelHalo,
        "text-halo-width": 1.5
      }
    }

  ]
}
