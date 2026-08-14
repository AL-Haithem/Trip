export const DEFAULT_SERVICES = [
  "الإطعام",
  "المبيت",
  "المسبح",
  "الحدائق",
  "الألعاب",
  "المواصلات",
  "المرشد السياحي",
  "التأمين",
];

export function createEmptyTour() {
  return {
    id: `tour_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    title: "",
    description: "",
    price: 0,
    seats: 0,
    includedServices: [],
    notIncludedServices: [],
    route: null,
    distanceKm: 0,
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
