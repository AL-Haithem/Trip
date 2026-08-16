import { BrowserRouter, Routes, Route, useLocation } from "react-router";
import { Suspense, lazy } from "react";

import NotFound from './NotFound.jsx'
import LandingPage from './Routes/LandingPage.jsx'
import ErrorBoundary from './ErrorBoundary.jsx'
import FloatingThemeToggle from './components/FloatingThemeToggle.jsx'
import {getSession} from './services/mockApi.js'
import {Navigate} from 'react-router'

const HomePage = lazy(() => import('./Routes/HomePage.jsx'))
const TripsList = lazy(() => import('./Routes/TripsList.jsx'))
const TripForm = lazy(() => import('./Routes/TripForm.jsx'))
const TripDraw = lazy(() => import('./Routes/TripDraw.jsx'))
const Auth = lazy(() => import('./Routes/Auth.jsx'))

function RequireCompany({children}) {
  const session = getSession()
  if (!session || session.role !== "company") {
    return <Navigate to="/login" replace />
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

function AppShell() {
  const location = useLocation()

  return (
    <ErrorBoundary>
      <FloatingThemeToggle pathname={location.pathname} />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/map" element={<HomePage />} />
          <Route path="/trips" element={<RequireCompany><TripsList /></RequireCompany>} />
          <Route path="/trips/create" element={<RequireCompany><TripForm /></RequireCompany>} />
          <Route path="/trips/edit/:id" element={<RequireCompany><TripForm /></RequireCompany>} />
          <Route path="/trips/draw/:id" element={<RequireCompany><TripDraw /></RequireCompany>} />
          <Route path="/login" element={<Auth />} />
          <Route path="/signup" element={<Auth />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}

export default App
