import { useState, useEffect, useRef } from "react"
import { useMap } from "react-map-gl/maplibre"

const WILAYAS_GEOJSON = "https://raw.githubusercontent.com/fr33dz/Algeria-geojson/master/all-wilayas.geojson"
const COUNTRIES_GEOJSON = "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson"

export function CountryHoverLayer() {
  const { current: mapRef } = useMap()
  const hoveredIdRef = useRef(null)
  const [tooltip, setTooltip] = useState(null)

  useEffect(() => {
    if (!mapRef) return

    const map = mapRef.getMap()
    let cleanup = () => {}

    const setup = async () => {
      try {
        const res = await fetch(COUNTRIES_GEOJSON)
        const data = await res.json()

        data.features = data.features.map((f, i) => ({ ...f, id: i }))

        if (map.getSource("countries-hover")) return

        map.addSource("countries-hover", {
          type: "geojson",
          data,
          generateId: false
        })

        map.addLayer({
          id: "countries-fill",
          type: "fill",
          source: "countries-hover",
          maxzoom: 5,
          paint: {
            "fill-color": "#3b82f6",
            "fill-opacity": [
              "case",
              ["boolean", ["feature-state", "hover"], false],
              0.15,
              0
            ]
          }
        })

        const onMouseMove = (e) => {
          if (e.features.length === 0) return

          if (hoveredIdRef.current !== null) {
            map.setFeatureState(
              { source: "countries-hover", id: hoveredIdRef.current },
              { hover: false }
            )
          }

          hoveredIdRef.current = e.features[0].id
          map.setFeatureState(
            { source: "countries-hover", id: hoveredIdRef.current },
            { hover: true }
          )

          const name = e.features[0].properties.ADMIN || e.features[0].properties.name
          setTooltip({ x: e.point.x, y: e.point.y, name })
        }

        const onMouseLeave = () => {
          if (hoveredIdRef.current !== null) {
            map.setFeatureState(
              { source: "countries-hover", id: hoveredIdRef.current },
              { hover: false }
            )
          }
          hoveredIdRef.current = null
          setTooltip(null)
        }

        map.on("mousemove", "countries-fill", onMouseMove)
        map.on("mouseleave", "countries-fill", onMouseLeave)

        cleanup = () => {
          map.off("mousemove", "countries-fill", onMouseMove)
          map.off("mouseleave", "countries-fill", onMouseLeave)
          if (map.getLayer("countries-fill")) map.removeLayer("countries-fill")
          if (map.getSource("countries-hover")) map.removeSource("countries-hover")
        }
      } catch (err) {
        console.error("Failed to load countries GeoJSON", err)
      }
    }

    if (map.isStyleLoaded()) {
      setup()
    } else {
      map.once("load", setup)
    }

    return () => cleanup()
  }, [mapRef])

  return tooltip ? (
    <div
      style={{
        position: "absolute",
        left: tooltip.x + 14,
        top: tooltip.y + 14,
        background: "var(--bg-panel)",
        color: "var(--text)",
        padding: "6px 12px",
        borderRadius: "8px",
        fontSize: "13px",
        fontWeight: "bold",
        pointerEvents: "none",
        zIndex: 50,
        boxShadow: "var(--shadow)",
        border: "1px solid var(--line)",
        whiteSpace: "nowrap"
      }}
    >
      {tooltip.name}
    </div>
  ) : null
}

export function WilayaHoverLayer() {
  const { current: mapRef } = useMap()
  const hoveredIdRef = useRef(null)
  const [tooltip, setTooltip] = useState(null)

  useEffect(() => {
    if (!mapRef) return

    const map = mapRef.getMap()
    let cleanup = () => {}

    const setup = async () => {
      try {
        const res = await fetch(WILAYAS_GEOJSON)
        const data = await res.json()

        data.features = data.features.map((f, i) => ({ ...f, id: i }))

        if (map.getSource("wilayas")) return

        map.addSource("wilayas", {
          type: "geojson",
          data,
          generateId: false
        })

        map.addLayer({
          id: "wilayas-fill",
          type: "fill",
          source: "wilayas",
          minzoom: 5,
          maxzoom: 8.5,
          paint: {
            "fill-color": "#fbbf24",
            "fill-opacity": [
              "case",
              ["boolean", ["feature-state", "hover"], false],
              0.18,
              0
            ]
          }
        })

        const onMouseMove = (e) => {
          if (e.features.length === 0) return

          if (hoveredIdRef.current !== null) {
            map.setFeatureState(
              { source: "wilayas", id: hoveredIdRef.current },
              { hover: false }
            )
          }

          hoveredIdRef.current = e.features[0].id
          map.setFeatureState(
            { source: "wilayas", id: hoveredIdRef.current },
            { hover: true }
          )

          const { name, name_ar } = e.features[0].properties
          setTooltip({ x: e.point.x, y: e.point.y, name, name_ar })
        }

        const onMouseLeave = () => {
          if (hoveredIdRef.current !== null) {
            map.setFeatureState(
              { source: "wilayas", id: hoveredIdRef.current },
              { hover: false }
            )
          }
          hoveredIdRef.current = null
          setTooltip(null)
        }

        map.on("mousemove", "wilayas-fill", onMouseMove)
        map.on("mouseleave", "wilayas-fill", onMouseLeave)

        cleanup = () => {
          map.off("mousemove", "wilayas-fill", onMouseMove)
          map.off("mouseleave", "wilayas-fill", onMouseLeave)
          if (map.getLayer("wilayas-fill")) map.removeLayer("wilayas-fill")
          if (map.getSource("wilayas")) map.removeSource("wilayas")
        }
      } catch (err) {
        console.error("Failed to load wilayas GeoJSON", err)
      }
    }

    if (map.isStyleLoaded()) {
      setup()
    } else {
      map.once("load", setup)
    }

    return () => cleanup()
  }, [mapRef])

  return tooltip ? (
    <div
      style={{
        position: "absolute",
        left: tooltip.x + 14,
        top: tooltip.y + 14,
        background: "var(--bg-panel)",
        color: "var(--text)",
        padding: "6px 12px",
        borderRadius: "8px",
        fontSize: "13px",
        fontWeight: "bold",
        pointerEvents: "none",
        zIndex: 50,
        boxShadow: "var(--shadow)",
        border: "1px solid var(--line)"
      }}
    >
      <div style={{ marginBottom: "2px" }}>{tooltip.name_ar}</div>
      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{tooltip.name}</div>
    </div>
  ) : null
}
