// POIs | نقاط الاهتمام من OpenFreeMap (source-layer: poi)
// تُستخدم داخل Level_3 | الألوان من mapTheme (colors.poi)
// الفئات مصممة حسب فكرة المشروع: طعام | مبيت | ترفيه/شاطئ | معالم | خدمات

export function buildPoisStyle(colors) {

  const foodClasses = ['literal', [
    'restaurant', 'fast_food', 'cafe', 'bar', 'pub', 'ice_cream', 'bakery', 'supermarket'
  ]]
  const stayClasses = ['literal', [
    'hotel', 'hostel', 'guest_house', 'apartment'
  ]]
  const leisureClasses = ['literal', [
    'beach', 'swimming_area', 'water_park', 'theme_park', 'zoo', 'stadium', 'playground', 'casino'
  ]]
  const sightClasses = ['literal', [
    'attraction', 'museum', 'castle', 'monument', 'memorial', 'viewpoint', 'gallery', 'arts_centre', 'place_of_worship', 'mosque'
  ]]

  return [

    // POI dots //
    {
      id: 'ofm-poi-dots',
      type: 'circle',
      source: 'openfreemap',
      'source-layer': 'poi',

      minzoom: 15,

      filter: ['<=', ['coalesce', ['get', 'rank'], 6], 4],

      paint: {

        'circle-color': [
          'case',

          ['in', ['get', 'class'], foodClasses],
          colors.poi.food,

          ['in', ['get', 'class'], stayClasses],
          colors.poi.stay,

          ['in', ['get', 'class'], leisureClasses],
          colors.poi.leisure,

          ['in', ['get', 'class'], sightClasses],
          colors.poi.sight,

          colors.poi.service
        ],

        'circle-radius': [
          'interpolate',
          ['linear'],
          ['zoom'],
          14, 3.5,
          16, 6,
          19, 9
        ],

        'circle-stroke-color': colors.poi.halo,
        'circle-stroke-width': 1.5,

        'circle-opacity': 1
      }
    },

    // POI labels (تظهر عند الاقتراب) //
    {
      id: 'ofm-poi-labels',
      type: 'symbol',
      source: 'openfreemap',
      'source-layer': 'poi',

      minzoom: 16,

      filter: ['<=', ['coalesce', ['get', 'rank'], 6], 3],

      layout: {
        'text-field': [
          'coalesce',
          ['get', 'name:ar'],
          ['get', 'name:en'],
          ['get', 'name']
        ],
        'text-size': [
          'interpolate',
          ['linear'],
          ['zoom'],
          16, 10,
          19, 13
        ],
        'text-anchor': 'left',
        'text-offset': [0.6, 0],
        'text-optional': true,
        'symbol-sort-key': ['get', 'rank']
      },

      paint: {
        'text-color': colors.poi.label,
        'text-halo-color': colors.labelHalo,
        'text-halo-width': 1.2
      }
    }

  ]
}
