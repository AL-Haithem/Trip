export const DEFAULT_SERVICES = [
  "Food",
  "Lodging",
  "Pool",
  "Gardens",
  "Playground",
  "Transport",
  "Tour Guide",
  "Insurance",
];

export function createEmptyTour() {
  return {
    id: `tour_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    title: "",
    description: "",
    companyId: null,
    price: 0,
    seats: 0,
    includedServices: [],
    notIncludedServices: [],
    route: null,
    distanceKm: 0,
    published: false,
    createdAt: Date.now(),
  };
}

export function isValidTour(tour) {
  return Boolean(
    tour &&
      tour.title &&
      tour.title.trim().length > 0 &&
      tour.route &&
      tour.route.features &&
      tour.route.features.length > 0
  );
}
