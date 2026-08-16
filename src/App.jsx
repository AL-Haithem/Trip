import { BrowserRouter, Routes, Route, useLocation } from "react-router";

import NotFound from './NotFound.jsx'
import LandingPage from './Routes/LandingPage.jsx'
import HomePage from './Routes/HomePage.jsx'
import TripsList from './Routes/TripsList.jsx'
import TripForm from './Routes/TripForm.jsx'
import TripDraw from './Routes/TripDraw.jsx'
import Auth from './Routes/Auth.jsx'
import ErrorBoundary from './ErrorBoundary.jsx'
import FloatingThemeToggle from './components/FloatingThemeToggle.jsx'
import {getSession} from './services/mockApi.js'
import {Navigate} from 'react-router'

function RequireCompany({children}) {
  const session = getSession()
  if (!session || session.role !== "company") {
    return <Navigate to="/login" replace />
  }
  return children
}

function AppShell() {
  const location = useLocation()

  return (
    <ErrorBoundary>
      <FloatingThemeToggle pathname={location.pathname} />
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
