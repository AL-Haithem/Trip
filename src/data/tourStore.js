import {
  getTours as apiGetTours,
  getTour as apiGetTour,
  saveTour as apiSaveTour,
} from "../services/mockApi.js";

export function saveTour(tour) {
  return apiSaveTour(tour);
}

export function loadTours() {
  return apiGetTours();
}

export function getTour(id) {
  return apiGetTour(id);
}

export function clearTours() {
  console.warn("clearTours is deprecated; saved tours live in localStorage under geo_tours_mock");
  return true;
}
