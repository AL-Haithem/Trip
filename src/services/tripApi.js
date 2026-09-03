import axios from "axios"
import {API_ROUTES, backendUrl} from "../config/endpoints.js"

export function createTrip(payload) {
  return axios.post(backendUrl(API_ROUTES.tripCreate), payload)
}

export async function getTrips() {
  const response = await axios.get(backendUrl(API_ROUTES.trips))
  return response.data?.trips || []
}

export async function publishTrip(id) {
  const response = await axios.post(backendUrl(API_ROUTES.tripPublish(id)))
  return response.data
}

export async function saveTripRoute(id, payload) {
  const response = await axios.patch(backendUrl(API_ROUTES.tripRoute(id)), payload)
  return response.data
}