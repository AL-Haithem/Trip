import { BrowserRouter, Routes, Route } from "react-router";
import './App.css'

import NotFound from './NotFound.jsx'
import HomePage from './Routes/HomePage.jsx'
import CreateTrip from './Routes/CreateTrip.jsx'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/trips/create" element={<CreateTrip />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
