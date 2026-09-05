import { getMapColors } from "./mapTheme"
import { buildAllLayers } from "./styles"
import { cdnUrl } from "../config/endpoints.js"
import { getSupportedCountry } from "./countries.js"

function versionedCdnUrl(path, version) {
  if (Number.isInteger(version)) return cdnUrl(path.replace("{version}", `v${version}`))
  return cdnUrl(path.replace("/{version}", "").replace("-{version}", ""))
}

export function buildPMTilesStyle(versions, countryCode = "all") {

  const colors = getMapColors()
  const country = getSupportedCountry(countryCode)

  return {
    version: 8,
    glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
    sources: {

      world: {
        type: 'vector',
        url: `pmtiles://${versionedCdnUrl("trip data/world/{version}.pmtiles", versions.world)}`,
        ...(country ? {bounds: country.bounds} : {}),
      },

      algeria: {
        type: 'vector',
        url: `pmtiles://${versionedCdnUrl("trip data/DZA/{version}.pmtiles", versions.DZA)}`,
        bounds: getSupportedCountry("DZA").bounds,
      },

      countryLabels: {
        type: "geojson",
        data: versionedCdnUrl("trip data/labels/world-labels-{version}.json", versions.worldLabels)
      },

      WilayasLabels: {
        type: "geojson",
        data: versionedCdnUrl("trip data/labels/DZA-labels-{version}.json", versions.DZALabels)
      },

      openfreemap: {
        type: 'vector',
        url: 'https://tiles.openfreemap.org/planet',
        // OpenFreeMap detail is currently needed only for the Algeria coverage.
        // This prevents MapLibre from requesting tiles outside its bounding box.
        bounds: [-8.67, 18.96, 11.99, 37.09]
      },

      hillshadeDEM: {
        type: "raster-dem",
        tiles: [
          "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"
        ],
        tileSize: 256,
        encoding: "terrarium",
        maxzoom: 14
      }
    },

    layers: [

      {
        id: "background",
        type: "background",
        paint: { "background-color": colors.water }
      },

      ...buildAllLayers(colors),
    ],

  }
}
