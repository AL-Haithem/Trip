import GeoJSONLayer from "@arcgis/core/layers/GeoJSONLayer"
import {getMapColors} from "../mapTheme.js"

function CountryLayer(theme, fileUrl) {
  const c = getMapColors(theme)

  return new GeoJSONLayer({

    url: fileUrl,

    minScale: 10000000,
    maxScale: 0,

    renderer: {
      type: "simple",

      symbol: {
        type: "simple-fill",
        color: [0, 0, 0, 0],
        outline: {color: c.countryOutline, width: 0.9},
      },
    },

    labelingInfo: [{
      minScale: 100 * 100000,
      maxScale: 0,

      labelExpressionInfo: {expression: "$feature.NAME_1"},

      labelPlacement: "always-horizontal",

      symbol: {
        type: "text",
        color: c.countryLabel,
        haloColor: c.labelHalo,
        haloSize: 1,

        font: {
          family: "Arial",
          size: 8,
          weight: "bold",
        },
      },
    }],

    labelsVisible: true,
  })
}

export default CountryLayer
