const STORAGE_KEY = "geo_trip_DZA";

export function saveTrip(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error("Failed to save trip:", e);
    return false;
  }
}

export function loadTrip() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error("Failed to load trip:", e);
    return null;
  }
}

export function clearTrip() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (e) {
    console.error("Failed to clear trip:", e);
    return false;
  }
}

export function graphicsToGeoJSON(graphics) {
  return graphics.map((g) => ({
    type: "Feature",
    geometry: g.geometry.toJSON(),
    properties: { ...(g.attributes || {}), symbol: g.symbol.toJSON() },
  }));
}

export function geoJSONToFeatures(geojson) {
  if (!geojson || !Array.isArray(geojson)) return [];
  return geojson;
}
