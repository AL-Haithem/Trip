export const BUILDING_3D_LAYER_ID = "ofm-buildings-3d"
export const BUILDING_3D_MIN_ZOOM = 15

export function isSmallScreen() {
  return typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches
}

export function setBuilding3DVisibility(map, enabled, zoom = map?.getZoom?.()) {
  if (!map?.getLayer?.(BUILDING_3D_LAYER_ID)) return

  const visible = enabled && !isSmallScreen() && Number(zoom) >= BUILDING_3D_MIN_ZOOM
  map.setLayoutProperty(BUILDING_3D_LAYER_ID, "visibility", visible ? "visible" : "none")
}