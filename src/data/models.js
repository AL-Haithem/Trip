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

// "YYYY-MM-DD" for the user's local timezone
export function todayStr() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function nowTimeStr() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

// Returns the first schedule slot that is already in the past, or null
export function findPastSlot(schedule) {
  const today = todayStr();
  const nowTime = nowTimeStr();
  for (const day of schedule || []) {
    if (!day || !day.date) continue;
    if (day.date < today) return day;
    if (day.date === today) {
      const past = (day.times || []).find((slot) => slot.time && slot.time <= nowTime);
      if (past) return day;
    }
  }
  return null;
}

export function hasStartPoint(tour) {
  const point = tour?.startPoint
  return Boolean(point?.type === "Point" && point.coordinates?.length === 2 || point?.features?.length);
}

export function getTripMissingFields(tour) {
  const missing = []
  const hasRoute = tour?.route?.features?.some((feature) =>
    feature.geometry?.type === "LineString" && feature.geometry.coordinates?.length >= 2
  )
  const hasSchedule = tour?.departureSchedule?.some((day) =>
    day?.date && day.times?.some((slot) => slot?.time && Number(slot.seatsAvailable) > 0 && Number(slot.price) >= 0)
  )

  if (!tour?.title?.trim()) missing.push("title")
  if (!tour?.description?.trim()) missing.push("description")
  if (!hasSchedule) missing.push("departure date and time")
  if (!hasStartPoint(tour)) missing.push("start point")
  if (!hasRoute) missing.push("route")
  return missing
}

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
    image: null,
    distanceKm: 0,
    departureSchedule: [],
    published: false,
    createdAt: Date.now(),
  };
}

export function toCreateTripPayload(tour) {
  return {
    title: tour.title?.trim() || "",
    description: tour.description?.trim() || "",
    includedServices: (tour.includedServices || []).map((service) => service.trim()).filter(Boolean),
    notIncludedServices: (tour.notIncludedServices || []).map((service) => service.trim()).filter(Boolean),
    departureSchedule: (tour.departureSchedule || [])
      .filter((day) => day && day.date)
      .map((day) => ({
        date: day.date,
        times: (day.times || []).map((slot) => ({
          time: slot.time,
          seatsAvailable: Number(slot.seatsAvailable),
          price: Number(slot.price),
        })),
      })),
    status: tour.status || "draft",
  };
}
