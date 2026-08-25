export function getMapColors() {

  return {
    bg: "#0d1117",

    water: "rgb(38, 66, 109)",

    land: "#ffffff25",

    landOutline: "rgb(0, 0, 0)",

    label: "#ffffff",

    labelHalo: "#101114",

    countryLabel: "rgb(255, 255, 255)",

    borders: {
      country: {
        color: "#fefefe9d",
        widthMin: 1.0,
        widthMax: 4.0
      },

      state: {
        color: "#a8c235",
        widthMin: 0.5,
        widthMax: 0.9
      },

      district: {
        color: "#0808085a",
        widthMin: 0.3,
        widthMax: 1.0
      }
    },

    pinBg: "#10241a",
    pinInk: "#7CFFB2",
    pinIcon: "#7CFFB2",
    routeIdle: "#2f7d4a"
  }
}