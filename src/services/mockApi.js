const MOCK_API_URL = "/api/mock";
const SESSION_KEY = "geo_session";

async function loadMockFile() {
  try {
    const res = await fetch(MOCK_API_URL, {cache: "no-store"});
    if (!res.ok) throw new Error("Failed to load mock data");
    return await res.json();
  } catch (e) {
    console.error("mockApi: could not load", MOCK_API_URL, e);
    return {auth: {credentials: [], companies: []}, tours: []};
  }
}

async function writeMockFile(mock) {
  try {
    const res = await fetch(MOCK_API_URL, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(mock),
    });
    if (!res.ok) throw new Error("Failed to write mock data");
    return true;
  } catch (e) {
    console.error("mockApi: could not write mock file", e);
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

export async function createTour(tour) {
  return saveTour(tour);
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
  tour.published = published;
  return saveTour(tour);
}

export async function getCompanies() {
  const mock = await loadMockFile();
  return mock.auth?.companies || [];
}
