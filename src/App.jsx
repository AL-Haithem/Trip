import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import './App.css'

import NotFound from './NotFound.jsx'
import MainPage from './Routes/MainPage.jsx'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
  </BrowserRouter>
  )
}

export default App
