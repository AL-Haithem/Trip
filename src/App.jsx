import { BrowserRouter, Routes, Route, useLocation } from "react-router";
import { Suspense, lazy } from "react";

import NotFound from './NotFound.jsx'
import LandingPage from './Routes/LandingPage.jsx'
import ErrorBoundary from './ErrorBoundary.jsx'
import VersionBadge from './components/VersionBadge.jsx'

// Get the base URL from Vite's import.meta.env.BASE_URL for GitHub Pages support
const basePath = import.meta.env.BASE_URL || "/"

const HomePage = lazy(() => import('./Routes/HomePage.jsx'))
const TripsList = lazy(() => import('./Routes/TripsList.jsx'))
const TripForm = lazy(() => import('./Routes/TripForm.jsx'))
const TripDraw = lazy(() => import('./Routes/TripDraw.jsx'))
const BookingPage = lazy(() => import('./Routes/BookingPage.jsx'))
const TripPreview = lazy(() => import('./Routes/TripPreview.jsx'))
const Auth = lazy(() => import('./Routes/Auth.jsx'))

function LegacyUrlGuard({children}) {
  const location = useLocation()
  const params = new URLSearchParams(location.search)

  if (params.has("view") || params.has("font")) {
    return <NotFound />
  }

  return children
}

function RouteFallback() {
  return (
    <div className="route-loading">
      <span className="spinner" />
    </div>
  )
}

function App() {
  return (
    <>
      <BrowserRouter basename={basePath}>
        <ErrorBoundary>
          <Suspense fallback={<RouteFallback />}>
            <LegacyUrlGuard>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/map" element={<HomePage />} />
                <Route path="/trips" element={<TripsList />} />
                <Route path="/trips/create" element={<TripForm />} />
                <Route path="/create" element={<TripForm />} />
                <Route path="/trips/edit/:id" element={<TripForm />} />
                <Route path="/trips/edit:id" element={<TripForm />} />
                <Route path="/edit/:id" element={<TripForm />} />
                <Route path="/edit:id" element={<TripForm />} />
                <Route path="/trips/draw/:id" element={<TripDraw />} />
                <Route path="/Preview/:id" element={<TripPreview />} />
                <Route path="/Preview:id" element={<TripPreview />} />
                <Route path="/booking/:id" element={<BookingPage />} />
                <Route path="/login" element={<Auth />} />
                <Route path="/register" element={<Auth />} />
                <Route path="/signup" element={<Auth />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </LegacyUrlGuard>
          </Suspense>
        </ErrorBoundary>
      </BrowserRouter>
      <VersionBadge />
    </>
  )
}

export default App
