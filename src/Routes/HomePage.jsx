import {useState} from "react"

import HomeMap from "../Maps/HomeMap.jsx"
import Button from "../components/ui/Button.jsx"
import {home as copy} from "../content/siteContent.js"
import "../styles/home.css"

const HOME_COUNTRIES = ["DZA"]

function HomePage() {

  return (

    <div className="home-wrap">
      <div className="home-map">
        <HomeMap />
      </div>
    </div>
  )
}

export default HomePage
