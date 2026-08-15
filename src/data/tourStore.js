import {
  getTours as apiGetTours,
  getTour as apiGetTour,
  saveTour as apiSaveTour,
  deleteTour as apiDeleteTour,
  setPublished as apiSetPublished,
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

export function deleteTour(id) {
  return apiDeleteTour(id);
}

export function setPublished(id, published) {
  return apiSetPublished(id, published);
}

export function clearTours() {
  console.warn("clearTours is no longer used; tours live in the mock file");
  return true;
}
