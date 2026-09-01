import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router";
import { Suspense, lazy } from "react";

import NotFound from './NotFound.jsx'
import LandingPage from './Routes/LandingPage.jsx'
import ErrorBoundary from './ErrorBoundary.jsx'
import {getSession} from './services/mockApi.js'

const HomePage = lazy(() => import('./Routes/HomePage.jsx'))
const TripsList = lazy(() => import('./Routes/TripsList.jsx'))
const TripForm = lazy(() => import('./Routes/TripForm.jsx'))
const TripDraw = lazy(() => import('./Routes/TripDraw.jsx'))
const BookingPage = lazy(() => import('./Routes/BookingPage.jsx'))
const TripPreview = lazy(() => import('./Routes/TripPreview.jsx'))
const Auth = lazy(() => import('./Routes/Auth.jsx'))

function RequireCompany({children}) {
  const session = getSession()
  if (!session || session.role !== "company") {return <Navigate to="/login" replace />}
  return children
}

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
    <BrowserRouter>
      <ErrorBoundary>
        <Suspense fallback={<RouteFallback />}>
          <LegacyUrlGuard>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/map" element={<HomePage />} />
              <Route path="/trips" element={<TripsList />} />
              <Route path="/trips/create" element={<RequireCompany><TripForm /></RequireCompany>} />
              <Route path="/create" element={<RequireCompany><TripForm /></RequireCompany>} />
              <Route path="/trips/edit/:id" element={<RequireCompany><TripForm /></RequireCompany>} />
              <Route path="/trips/edit:id" element={<RequireCompany><TripForm /></RequireCompany>} />
              <Route path="/edit/:id" element={<RequireCompany><TripForm /></RequireCompany>} />
              <Route path="/edit:id" element={<RequireCompany><TripForm /></RequireCompany>} />
              <Route path="/trips/draw/:id" element={<RequireCompany><TripDraw /></RequireCompany>} />
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
  )
}

export default App
