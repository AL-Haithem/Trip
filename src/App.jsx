import { BrowserRouter, Routes, Route } from "react-router";
import './App.css'

import NotFound from './NotFound.jsx'
import HomePage from './Routes/HomePage.jsx'
import TripsList from './Routes/TripsList.jsx'
import TripForm from './Routes/TripForm.jsx'
import TripDraw from './Routes/TripDraw.jsx'
import ErrorBoundary from './ErrorBoundary.jsx'

function App() {

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/trips" element={<TripsList />} />
          <Route path="/trips/create" element={<TripForm />} />
          <Route path="/trips/edit/:id" element={<TripForm />} />
          <Route path="/trips/draw/:id" element={<TripDraw />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  )
}

export default App
