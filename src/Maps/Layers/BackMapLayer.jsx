import GeoJSONLayer from "@arcgis/core/layers/GeoJSONLayer"

function WorldLayer() {

    return new GeoJSONLayer({

        url: "/TempFiles/world.json",

        renderer: {
            type: "simple",

            symbol: {
                type: "simple-fill",
                color: "#3e4e35",
                outline: {color: "rgb(0, 0, 0)", width: 0.5}
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
                    color: "rgb(255, 255, 255)",
                    haloColor: "#101114",
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