const SESSION_KEY = "geo_session";
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

export async function login(email, password) {
  const session = {
    email,
    role: "company",
    company: {email},
    user: null,
    loggedInAt: Date.now(),
  };
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch (e) {
    console.error("mockApi: failed to store session", e);
  }
  return session;
}

export async function register({email, password, name, phone}) {
  const id = `user_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const profile = {id, name, email, phone: phone || ""};

  const session = {
    email,
    role: "company",
    company: profile,
    user: null,
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

// Temporary in-memory OTP store for password reset (no real email service).
const resetCodes = new Map();

export async function requestPasswordReset(email) {
  const mock = await loadMockFile();
  const cred = (mock.auth?.credentials || []).find(
    (c) => c.email === email.trim().toLowerCase()
  );
  if (!cred) {
    const err = new Error("Email not found");
    err.code = "AUTH_NOTFOUND";
    throw err;
  }
  const code = String(Math.floor(100000 + Math.random() * 900000));
  resetCodes.set(email.trim().toLowerCase(), code);
  return {code};
}

export async function confirmPasswordReset(email, code, newPassword) {
  const key = email.trim().toLowerCase();
  const expected = resetCodes.get(key);
  if (!expected || expected !== String(code).trim()) {
    const err = new Error("Invalid or expired code");
    err.code = "AUTH_BADCODE";
    throw err;
  }
  const mock = await loadMockFile();
  const creds = mock.auth?.credentials || [];
  const cred = creds.find((c) => c.email === key);
  if (!cred) {
    const err = new Error("Email not found");
    err.code = "AUTH_NOTFOUND";
    throw err;
  }
  cred.password = newPassword;
  mock.auth.credentials = creds;
  const ok = await writeMockFile(mock);
  if (!ok) {
    const err = new Error("Failed to save password");
    err.code = "AUTH_WRITE";
    throw err;
  }
  resetCodes.delete(key);
  return true;
}
