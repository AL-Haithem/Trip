import GeoJSONLayer from "@arcgis/core/layers/GeoJSONLayer"
import {getMapColors} from "../mapTheme.js"

function WorldLayer(theme) {
  const c = getMapColors(theme)

  return new GeoJSONLayer({

    url: "/TempFiles/world.json",

    renderer: {
      type: "simple",

      symbol: {
        type: "simple-fill",
        color: c.land,
        outline: {color: c.landOutline, width: 0.5}
      }
    },

    labelingInfo: [
      {
        minScale: 700 * 100000,
        maxScale: 100 * 100000,

        labelExpressionInfo: {expression: "$feature.English_Na"},
        labelPlacement: "always-horizontal",

        symbol: {
          type: "text",
          color: c.label,
          haloColor: c.labelHalo,
          haloSize: 1.5,

          font: {
            family: "Arial",
            size: 10,
            weight: "bold"
          }
        }
      }
    ],

    labelsVisible: true
  })
}

export default WorldLayer
