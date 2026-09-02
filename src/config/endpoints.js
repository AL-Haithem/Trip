const trimTrailingSlash = (value) => value.replace(/\/+$/, "")

export const BACKEND_BASE_URL = trimTrailingSlash("https://trip-backend-production-82d3.up.railway.app")
export const CDN_BASE_URL = trimTrailingSlash("https://pub-7e98b7cbd8d54f91a1f94a9b9e71316b.r2.dev/trip")

export const API_ROUTES = {
  mock: "/api/mock",
  versions: "/api/public/versions",
}

export function backendUrl(route) {
  return `${BACKEND_BASE_URL}/${route.replace(/^\/+/, "")}`
}

export function cdnUrl(assetPath) {
  return `${CDN_BASE_URL}/${assetPath.replace(/^\/+/, "")}`
}
