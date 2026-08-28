// ثيم الخريطة | محوّل من Google Styling "Retro" (خريطة ورقية سيبيا)
// landscape #f9ddc5 -7 | road #813033 +43 | water #1994bf -69sat +43 | local #f19f53

export function getMapColors() {

  return {

    // الأساس | landscape = #f9ddc5 + lightness -7 //
    bg: "#e8ceb7",
    water: "#a0b5bd",
    land: "#e8ceb7",
    landDeep: "#d9c1a8",
    landOutline: "rgb(0, 0, 0)",

    // النصوص | حبر بني داكن على الورق //
    label: "#3a2b1f",
    labelHalo: "#f9ddc5",
    countryLabel: "#5f4632",

    borders: {
      country: {
        color: "#813033",
        widthMin: 1.0,
        widthMax: 4.0
      },

      state: {
        color: "#a95521",
        widthMin: 0.5,
        widthMax: 0.9
      },

      district: {
        color: "#8130337a",
        widthMin: 0.3,
        widthMax: 1.0
      }
    },

    // طبقات OpenFreeMap التفصيلية (zoom 9-20) //
    ofm: {
      // park #645c20 +39 //
      landuse: "#a09c77",

      building3d: "#b4ac96",

      // local #f19f53 +16 | road #813033 +43 | local stroke #f19f53 -10 //
      roadMinor: "#f3ae6e",
      roadMajor: "#b7898b",
      roadCasing: "#d98f4b",
      roadOutline: "#813033"
    },

    // نقاط الاهتمام POI //
    poi: {
      food: "#f19f53",
      stay: "#9f9a75",
      leisure: "#bd8e60",
      sight: "#cba581",
      service: "#c7906f",
      label: "#5f4632",
      halo: "#2e2a27"
    },

    pinBg: "#10241a",
    pinInk: "#7CFFB2",
    pinIcon: "#7CFFB2",
    routeIdle: "#2f7d4a"
  }
}
