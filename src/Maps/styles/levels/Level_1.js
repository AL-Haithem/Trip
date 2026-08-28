// countries, country labels, country hover, country borders

export function buildLevel_1(colors) {
  return [

    // Countries //
    {
      id: 'countries',
      type: 'fill',
      source: 'world',
      'source-layer': 'world',

      minzoom: 0, 
      maxzoom: 21,

      paint: {
        'fill-color': [
          'step',['zoom'],
          ['case',['==', ['get', 'ISO_3_coun'], 'XXX'],colors.landDeep,colors.land],
          5,colors.landDeep
        ]
      }
    },

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

    {
      id:"terrain-hillshade",
      type:"hillshade",
      source:"hillshadeDEM",
      minzoom: 1.9,
      maxzoom: 20,

      paint:{
        "hillshade-exaggeration":.25,
        "hillshade-shadow-color":"#000000",
        "hillshade-highlight-color":"#141413",
        "hillshade-accent-color":"#0c0c0c"
      }
    },  

    // Country Labels //
    {
      id: 'country-labels',
      type: 'symbol',
      source: 'countryLabels',

      minzoom: 0,
      maxzoom: 5,

      layout: {
        'text-field': ['get', 'name'],
        'text-size': [
          'interpolate',
          ['linear'],
          ['zoom'],
          3, 18,
          4, 23,
          5, 28,
        ],
        'text-anchor': 'center'
      },
      paint: {
        'text-color': colors.countryLabel,
        'text-halo-color': colors.labelHalo,
        'text-halo-width': 1.5
      }
    },

    // Country Hover //
    {
      id: 'countries-hover',
      type: 'fill',
      source: 'world',
      'source-layer': 'world',

      minzoom: 0,
      maxzoom: 5,

      paint: {
        'fill-color':'#000000',
        'fill-opacity': [ 'case',
          [
            'boolean',
            ['feature-state', 'hover'],
            false
          ],
          0.1,
          0
        ]
      }
    },

    // Country Borders //
    {
      id: 'country-borders',
      type: 'line',
      source: 'world',
      'source-layer': 'world',

      minzoom: 0,
      maxzoom: 5,

      paint: {
        'line-color':colors.borders.country.color,
        'line-width': [
          'interpolate',
          ['linear'],
          ['zoom'],
          3,colors.borders.country.widthMin,
          10,colors.borders.country.widthMax
        ]
      }
    }

  ]
}
