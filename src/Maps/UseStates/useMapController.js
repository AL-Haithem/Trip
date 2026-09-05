import { useEffect, useState } from 'react'
import { Protocol } from 'pmtiles'
import maplibregl from 'maplibre-gl'

import { buildPMTilesStyle } from '../MapStyle'
import { useCdnAssets } from '../../services/cdnAssets.jsx'

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

  const {versions} = useCdnAssets()
  const [mapStyle, setMapStyle] = useState(null)

  useEffect(() => {

    registerPMTilesProtocol()
    setMapStyle(buildPMTilesStyle(versions))
  }, [versions])

  return {
    mapStyle
  }
}