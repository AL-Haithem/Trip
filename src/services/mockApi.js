const FALLBACK_KEY = "geo_mock_backup";

async function readLocalMockFallback() {
  try {
    const raw = localStorage.getItem(FALLBACK_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("mockApi: failed to read local fallback", e);
  }

  try {
    const res = await fetch("/TempFiles/mock-data.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Fallback fetch failed");
    const json = await res.json();
    localStorage.setItem(FALLBACK_KEY, JSON.stringify(json));
    return json;
  } catch (e) {
    console.error("mockApi: failed to fetch file fallback", e);
    return { auth: { credentials: [], companies: [] }, tours: [] };
  }
}

function writeLocalMockFallback(mock) {
  try {
    localStorage.setItem(FALLBACK_KEY, JSON.stringify(mock));
    return true;
  } catch (e) {
    console.error("mockApi: failed to write local fallback", e);
    return false;
  }
}

async function loadMockFile() {
  const fallback = await readLocalMockFallback();
  return fallback || {auth: {credentials: [], companies: []}, tours: []};
}

async function writeMockFile(mock) {
  return writeLocalMockFallback(mock);
}

export async function getTours() {
  const mock = await loadMockFile();
  return mock.tours || [];
}

export async function getTour(id) {
  const tours = await getTours();
  return tours.find((t) => t.id === id) || null;
}

async function persistTours(tours) {
  const mock = await loadMockFile();
  mock.tours = tours;
  return writeMockFile(mock);
}

export async function saveTour(tour) {
  const tours = await getTours();
  const idx = tours.findIndex((t) => t.id === tour.id);
  if (idx >= 0) {
    tours[idx] = tour;
  } else {
    tours.push(tour);
  }
  await persistTours(tours);
  return tour;
}

export async function deleteTour(id) {
  const tours = await getTours();
  const next = tours.filter((t) => t.id !== id);
  await persistTours(next);
  return true;
}

export async function setPublished(id, published) {
  const tour = await getTour(id);
  if (!tour) return null;
  if (published) {
    const hasStart = Boolean(tour.startPoint && tour.startPoint.features && tour.startPoint.features.length);
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const hasFutureSchedule = (tour.departureSchedule || []).some(
      (day) => day && day.date && day.date >= todayStr && (day.times || []).length
    );
    if (!hasStart || !hasFutureSchedule) {
      const err = new Error("Trip must have a starting point and a valid future departure date before publishing");
      err.code = "PUBLISH_INVALID";
      throw err;
    }
  }
  tour.published = published;
  return saveTour(tour);
}