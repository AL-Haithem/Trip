import { useEffect, useState } from 'react'
import { Protocol } from 'pmtiles'
import maplibregl from 'maplibre-gl'

import { buildPMTilesStyle } from '../MapStyle'

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

    setMapStyle(buildPMTilesStyle())

  }, [])

  return {
    mapStyle
  }
}