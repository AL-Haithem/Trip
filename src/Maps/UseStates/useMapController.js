import { useEffect, useState } from 'react'
import axios from 'axios'
import { Protocol } from 'pmtiles'
import maplibregl from 'maplibre-gl'

import { buildPMTilesStyle } from '../MapStyle'
import { API_ROUTES, backendUrl } from '../../config/endpoints.js'

let protocolRegistered = false
const VERSIONS_CACHE_KEY = 'geo_map_versions'

function readCachedVersions() {
  try {
    const raw = localStorage.getItem(VERSIONS_CACHE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function cacheVersions(versions) {
  try {
    localStorage.setItem(VERSIONS_CACHE_KEY, JSON.stringify(versions))
  } catch {
    // The map can still use the browser HTTP cache when storage is unavailable.
  }
}

function haveSameVersions(first, second) {
  return first?.world === second?.world
    && first?.DZA === second?.DZA
    && first?.worldLabels === second?.worldLabels
    && first?.DZALabels === second?.DZALabels
}

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

    const cachedVersions = readCachedVersions()
    if (cachedVersions) {
      setMapStyle(buildPMTilesStyle(cachedVersions))
    }

    let isActive = true

        axios.get(backendUrl(API_ROUTES.versions))
      .then(({ data: versions }) => {
        if (!isActive) return
        if (haveSameVersions(cachedVersions, versions)) return
        cacheVersions(versions)
        setMapStyle(buildPMTilesStyle(versions))
      })
      .catch(() => {
        if (isActive && !cachedVersions) setMapStyle(buildPMTilesStyle())
      })

    return () => {
      isActive = false
    }

  }, [])

  return {
    mapStyle
  }
}