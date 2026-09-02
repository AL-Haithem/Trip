import { useEffect, useState } from 'react'
import axios from 'axios'
import { Protocol } from 'pmtiles'
import maplibregl from 'maplibre-gl'

import { buildPMTilesStyle } from '../MapStyle'
import { API_ROUTES, backendUrl } from '../../config/endpoints.js'

let protocolRegistered = false

function registerPMTilesProtocol() {

  if (protocolRegistered) return

  const protocol = new Protocol()

  maplibregl.addProtocol(
    'pmtiles',
    protocol.tile.bind(protocol)
  )

  protocolRegistered = true
}

export function useMapController() {

  const [mapStyle, setMapStyle] = useState(null)

  useEffect(() => {

    registerPMTilesProtocol()

    axios.get(backendUrl(API_ROUTES.versions), {
     // headers: { 'Cache-Control': 'no-cache' }
    })
      .then(({ data: versions }) => setMapStyle(buildPMTilesStyle(versions)))
      .catch(() => setMapStyle(buildPMTilesStyle()))

  }, [])

  return {
    mapStyle
  }
}