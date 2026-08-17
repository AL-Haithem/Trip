import axios from "axios"

function GeometryToPath(geometry) {

  if (geometry.type === "Polygon") {
    return geometry.coordinates.map(ring =>ring.map(
      ([x, y], index) =>`${index === 0 ? "M" : "L"} ${x} ${-y}`
    ).join(" ") + " Z").join(" ")
  }

  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates.map(polygon => polygon.map(
      ring => ring.map(([x, y], index) =>`${index === 0 ? "M" : "L"} ${x} ${-y}`).join(" ") + " Z"
    ).join(" ")).join(" ")
  }
  return ""
}

export async function fetchLocalFile() {
  try {
    const response = await axios.get('/TempFiles/world.json')
    return response.data
  }
  catch (error) {console.error('Error fetching the file:', error)}
}

export function CleaningData(data) {
  const cleaned = data.features.map(feature => {
    return {
      name: feature.properties?.English_Na,
      code: feature.properties?.ISO_3_coun,
      path: GeometryToPath(feature.geometry)
    }
  })
  return cleaned
}

export async function Manager() {
  const data = await fetchLocalFile()
  return CleaningData(data)
}