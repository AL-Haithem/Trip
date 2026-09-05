import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react"
import axios from "axios"

import { API_ROUTES, CDN_BASE_URL, backendUrl, cdnUrl } from "../config/endpoints.js"

const CDN_VERSIONS_STORAGE_KEY = "geo_cdn_versions"
const CdnAssetsContext = createContext(null)
const REQUIRED_VERSION_KEYS = [
  "world",
  "DZA",
  "worldLabels",
  "DZALabels",
  "hero_bg.jpg",
  "tour_1.jpg",
  "tour_2.jpg",
]

function readCachedVersions() {
  try {
    const raw = localStorage.getItem(CDN_VERSIONS_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function cacheVersions(versions) {
  try {
    localStorage.setItem(CDN_VERSIONS_STORAGE_KEY, JSON.stringify(versions))
  } catch {
    // The browser cache can still serve CDN assets when storage is unavailable.
  }
}

function haveSameVersions(first, second) {
  if (!first || !second) return false
  const keys = new Set([...Object.keys(first), ...Object.keys(second)])
  return [...keys].every((key) => first[key] === second[key])
}

function isVersion(value) {
  return Number.isInteger(value) && value >= 0
}

function hasAnyVersions(versions) {
  return versions && Object.values(versions).some(isVersion)
}

function mergeVersions(cached, incoming) {
  const merged = {...cached}
  REQUIRED_VERSION_KEYS.forEach((key) => {
    if (incoming && isVersion(incoming[key])) merged[key] = incoming[key]
  })
  return merged
}

function logCdnResourceStats() {
  const resources = performance.getEntriesByType("resource")
    .filter((entry) => entry.name.startsWith(`${CDN_BASE_URL}/`))
  const networkResources = resources.filter((entry) => entry.transferSize > 0)
  const cachedResources = resources.filter((entry) => entry.transferSize === 0)

  console.info(`[CDN] ${resources.length} ${networkResources.length} ${cachedResources.length}`)
}

function ResourceError() {
  return (
    <div className="cdn-resource-error" role="alert">
      <strong>Could not load site resources</strong>
      <span>Check your network connection and reload the page.</span>
      <button type="button" onClick={() => window.location.reload()}>
        Reload
      </button>
    </div>
  )
}

export function CdnAssetsProvider({ children }) {
  const cachedVersionsRef = useRef(readCachedVersions())
  const [versions, setVersions] = useState(() => hasAnyVersions(cachedVersionsRef.current) ? cachedVersionsRef.current : null)
  const [loading, setLoading] = useState(() => !hasAnyVersions(cachedVersionsRef.current))
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true
    const cachedVersions = cachedVersionsRef.current

    if (cachedVersions) {
      console.info("[CDN] 1")
    } else {
      console.info("[CDN] 0")
    }

    axios.get(backendUrl(API_ROUTES.versions))
      .then(({ data }) => {
        if (!active) return
        if (!data || typeof data !== "object") throw new Error("Invalid CDN versions response")
        const nextVersions = mergeVersions(cachedVersions, data)
        const missingKeys = REQUIRED_VERSION_KEYS.filter((key) => !isVersion(nextVersions[key]))
        if (missingKeys.length) {
          console.warn(`[CDN] ${missingKeys.length}`)
        }
        if (!hasAnyVersions(nextVersions)) {
          throw new Error("CDN versions response contains no usable versions")
        }
        if (haveSameVersions(cachedVersions, nextVersions)) {
          console.info("[CDN] 0")
          setLoading(false)
          if (!hasAnyVersions(nextVersions)) setError(true)
          return
        }
        cacheVersions(nextVersions)
        setVersions(nextVersions)
        setLoading(false)
        console.info("[CDN] 1")
      })
      .catch(() => {
        if (!active) return
        console.warn("[CDN] 0")
        setLoading(false)
        if (!hasAnyVersions(cachedVersions)) setError(true)
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!versions) return undefined

    let timer = null
    const scheduleStats = () => {
      if (timer) window.clearTimeout(timer)
      timer = window.setTimeout(logCdnResourceStats, 250)
    }

    scheduleStats()
    if (!window.PerformanceObserver) return () => window.clearTimeout(timer)

    const observer = new PerformanceObserver(scheduleStats)
    observer.observe({type: "resource", buffered: true})
    return () => {
      observer.disconnect()
      if (timer) window.clearTimeout(timer)
    }
  }, [versions])

  const value = useMemo(() => ({
    versions,
    assetUrl(assetName) {
      const version = versions[assetName]
      if (!isVersion(version)) return cdnUrl(`img/${assetName}`)
      const dot = assetName.lastIndexOf(".")
      const base = dot > 0 ? assetName.slice(0, dot) : assetName
      const extension = dot > 0 ? assetName.slice(dot) : ""
      return cdnUrl(`img/${base}-v${version}${extension}`)
    },
  }), [versions])

  if (error) return <ResourceError />
  if (loading || !versions) return <div className="cdn-resource-loading">Loading site resources...</div>

  return <CdnAssetsContext.Provider value={value}>{children}</CdnAssetsContext.Provider>
}

export function useCdnAssets() {
  const context = useContext(CdnAssetsContext)
  if (!context) throw new Error("useCdnAssets must be used inside CdnAssetsProvider")
  return context
}

