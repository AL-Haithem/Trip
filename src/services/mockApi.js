const MOCK_FILE_URL = "/TempFiles/mock-data.json";
const SESSION_KEY = "geo_session";
const SAVED_TOURS_KEY = "geo_tours_mock";

async function loadMockFile() {
  try {
    const res = await fetch(MOCK_FILE_URL);
    if (!res.ok) throw new Error("Failed to load mock data");
    return await res.json();
  } catch (e) {
    console.error("mockApi: could not load", MOCK_FILE_URL, e);
    return {auth: {credentials: [], companies: []}, tours: []};
  }
}

function loadSavedTours() {
  try {
    const raw = localStorage.getItem(SAVED_TOURS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("mockApi: failed to read saved tours", e);
    return [];
  }
}

function persistSavedTours(tours) {
  try {
    localStorage.setItem(SAVED_TOURS_KEY, JSON.stringify(tours));
    return true;
  } catch (e) {
    console.error("mockApi: failed to persist saved tours", e);
    return false;
  }
}

export async function login(email, password) {
  const mock = await loadMockFile();
  const cred = (mock.auth?.credentials || []).find(
    (c) => c.email === email && c.password === password
  );
  if (!cred) {
    const err = new Error("Invalid email or password");
    err.code = "AUTH_INVALID";
    throw err;
  }
  const company = (mock.auth?.email === email)
    ? mock.auth
    : (mock.auth?.companies || []).find((c) => c.email === email) || null;

  const session = {
    email,
    company,
    loggedInAt: Date.now(),
  };
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch (e) {
    console.error("mockApi: failed to store session", e);
  }
  return session;
}

export function logout() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch (e) {
    console.error("mockApi: failed to clear session", e);
  }
}

export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error("mockApi: failed to read session", e);
    return null;
  }
}

export async function getTours() {
  const mock = await loadMockFile();
  const baseTours = mock.tours || [];
  const savedTours = loadSavedTours();
  return [...savedTours, ...baseTours];
}

export async function getTour(id) {
  const tours = await getTours();
  return tours.find((t) => t.id === id) || null;
}

export async function saveTour(tour) {
  const saved = loadSavedTours();
  const idx = saved.findIndex((t) => t.id === tour.id);
  if (idx >= 0) {
    saved[idx] = tour;
  } else {
    saved.push(tour);
  }
  persistSavedTours(saved);
  return tour;
}

export async function createTour(tour) {
  return saveTour(tour);
}

export async function getCompanies() {
  const mock = await loadMockFile();
  return mock.auth?.companies || [];
}
