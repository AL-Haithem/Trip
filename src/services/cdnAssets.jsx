import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react"
import axios from "axios"

import { API_ROUTES, BACKEND_BASE_URL, CDN_BASE_URL, backendUrl, cdnUrl } from "../config/endpoints.js"

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

function hasAllVersions(versions) {
  return versions && REQUIRED_VERSION_KEYS.every((key) =>
    Number.isInteger(versions[key]) && versions[key] >= 0
  )
}

function logCdnResourceStats() {
  const resources = performance.getEntriesByType("resource")
    .filter((entry) => entry.name.startsWith(`${CDN_BASE_URL}/`))
  const networkResources = resources.filter((entry) => entry.transferSize > 0)
  const cachedResources = resources.filter((entry) => entry.transferSize === 0)

  console.groupCollapsed(`[CDN] ${resources.length} resources requested`)
  console.info(`From CDN/network: ${networkResources.length}`)
  console.info(`From browser cache: ${cachedResources.length}`)
  console.table(resources.map((entry) => ({
    source: entry.transferSize === 0 ? "browser cache" : "CDN/network",
    resource: entry.name.replace(`${CDN_BASE_URL}/`, ""),
    transferKB: Number((entry.transferSize / 1024).toFixed(1)),
  })))
  console.groupEnd()
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
  const [versions, setVersions] = useState(() => hasAllVersions(cachedVersionsRef.current) ? cachedVersionsRef.current : null)
  const [loading, setLoading] = useState(() => !hasAllVersions(cachedVersionsRef.current))
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true
    const cachedVersions = cachedVersionsRef.current

    if (cachedVersions) {
      console.info("[CDN] Versions loaded from browser storage")
    } else {
      console.info("[CDN] No cached versions; requesting versions from API")
    }

    axios.get(backendUrl(API_ROUTES.versions))
      .then(({ data }) => {
        if (!active) return
        if (!hasAllVersions(data)) throw new Error("Invalid CDN versions response")
        if (haveSameVersions(cachedVersions, data)) {
          console.info("[CDN] Versions API unchanged; keeping browser cache")
          setLoading(false)
          return
        }
        const nextVersions = data
        cacheVersions(nextVersions)
        setVersions(nextVersions)
        setLoading(false)
        console.info("[CDN] New versions loaded from API; CDN asset URLs updated")
      })
      .catch(() => {
        if (!active) return
        console.warn(`[CDN] Versions request failed: ${BACKEND_BASE_URL}${API_ROUTES.versions}`)
        setLoading(false)
        if (!hasAllVersions(cachedVersions)) setError(true)
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
      const version = versions[assetName] ?? 0
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

