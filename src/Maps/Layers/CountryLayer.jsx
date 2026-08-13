import GeoJSONLayer from "@arcgis/core/layers/GeoJSONLayer"

function CountryLayer(countryCode) {

  return new GeoJSONLayer({

    url: `/TempFiles/${countryCode}.json`,

    minScale: 10000000,
    maxScale: 0,

    renderer: {
      type: "simple",

      symbol: {
        type: "simple-fill",
        color: [0, 0, 0, 0],
        outline: {color: "rgba(255, 255, 255, 0.3)", width: 0.9}
      }
    },

    labelingInfo: [{
      minScale: 100 * 100000,
      maxScale: 0,

      labelExpressionInfo: {expression: "$feature.NAME_1"},

      labelPlacement: "always-horizontal",

      symbol: {
        type: "text",
        color: "rgba(255, 255, 255, 0.77)",
        haloColor: "rgba(0, 0, 0, 0.45)",
        haloSize: 1,

        font: {
          family: "Arial",
          size: 8,
          weight: "bold"
        }
      }
    }],

    labelsVisible: true
  })
}

export default CountryLayer