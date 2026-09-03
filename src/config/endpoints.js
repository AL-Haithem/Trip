const trimTrailingSlash = (value) => value.replace(/\/+$/, "")

export const BACKEND_BASE_URL = trimTrailingSlash("https://trip-backend-production-82d3.up.railway.app")
export const CDN_BASE_URL = trimTrailingSlash("https://pub-7e98b7cbd8d54f91a1f94a9b9e71316b.r2.dev")

export const API_ROUTES = {
  versions: "/api/public/versions",
  tripCreate: "/api/trip/create",
  trips: "/api/trip/trips",
  tripById: (id) => `/api/trip/trips/${id}`,
  tripPublish: (id) => `/api/trip/trips/publish/${id}`,
  tripUnpublish: (id) => `/api/trip/trips/unpublish/${id}`,
  tripRoute: (id) => `/api/trip/trips/${id}/route`,
}

export function backendUrl(route) {
  return `${BACKEND_BASE_URL}/${route.replace(/^\/+/, "")}`
}

export function cdnUrl(assetPath) {
  return `${CDN_BASE_URL}/${assetPath.replace(/^\/+/, "")}`
}
