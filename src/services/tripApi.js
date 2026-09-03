import axios from "axios"
import {API_ROUTES, backendUrl} from "../config/endpoints.js"

export function createTrip(payload) {
  return axios.post(backendUrl(API_ROUTES.tripCreate), payload)
}

export async function getTrips() {
  const response = await axios.get(backendUrl(API_ROUTES.trips))
  return response.data?.trips || []
}

export async function getTrip(id) {
  const response = await axios.get(backendUrl(API_ROUTES.tripById(id)))
  return response.data?.trip || response.data?.data || response.data
}

export async function getTripRoute(id) {
  const response = await axios.get(backendUrl(API_ROUTES.tripRoute(id)))
  return response.data
}

export async function updateTrip(id, payload) {
  const response = await axios.patch(backendUrl(API_ROUTES.tripById(id)), payload)
  return response.data
}

export async function deleteTrip(id) {
  const response = await axios.delete(backendUrl(API_ROUTES.tripById(id)))
  return response.data
}

export async function publishTrip(id) {
  const response = await axios.post(backendUrl(API_ROUTES.tripPublish(id)))
  return response.data
}

export async function saveTripRoute(id, payload) {
  const response = await axios.patch(backendUrl(API_ROUTES.tripRoute(id)), payload)
  return response.data
}