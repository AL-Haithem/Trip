import {
  getTour as apiGetTour,
  saveTour as apiSaveTour,
  deleteTour as apiDeleteTour,
  setPublished as apiSetPublished,
} from "../services/mockApi.js";

export function saveTour(tour) {
  return apiSaveTour(tour);
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
