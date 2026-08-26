// wilayas, wilaya labels, wilaya hover, wilaya borders

export function buildLevel_2(colors) {
  return [

    // Wilayas //
    {
      id: 'wilayas',
      type: 'fill',
      source: 'algeria',
      'source-layer': 'DZA',
      minzoom: 5,
      maxzoom: 20,
      paint: {'fill-color': colors.land}
    },

    // Wilaya Borders //
    {
      id: 'wilaya-borders',
      type: 'line',
      source: 'algeria',
      'source-layer': 'DZA',

      minzoom: 5,
      maxzoom: 20,

      paint: {
        'line-color': colors.borders.state.color,
        'line-width': [
          'interpolate',
          ['linear'],
          ['zoom'],
          3,colors.borders.state.widthMin,
          10,colors.borders.state.widthMax
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
        "fill-color": "#00000053",
        "fill-opacity": [ "case",
          [
            "boolean",
            ["feature-state", "hover"],
            false
          ],
          0.5, 0
        ]
      }

    },
  ]
}
