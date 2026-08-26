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
          ['case',['==', ['get', 'ISO_3_coun'], 'XXX'],'#1a1f27',colors.land],
          5,'#1a1f27'
        ]
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
