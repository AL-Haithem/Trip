import {useEffect, useRef, useState} from "react"

import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer"
import Graphic from "@arcgis/core/Graphic"
import Point from "@arcgis/core/geometry/Point"
import Polyline from "@arcgis/core/geometry/Polyline"
import {geodesicLength} from "@arcgis/core/geometry/geometryEngine"

const LINE_SYMBOL = {
  type: "simple-line",
  color: "#0cff25",
  width: 3,
}

function makeVertexSymbol(selected) {
  const fill = selected ? "#ffffff" : "#0cff25"
  const stroke = selected ? "#ff4c4c" : "#06210b"
  const r = selected ? 9 : 7
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 28 28'>` +
    `<circle cx='14' cy='14' r='${r}' fill='${fill}' stroke='${stroke}' stroke-width='2'/>` +
    `</svg>`
  return {
    type: "picture-marker",
    url: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg),
    width: "28px",
    height: "28px",
  }
}

function PolylineDrawer({view, active, onRegister, toolId, initialRoute, onStateChange}) {

  const layerRef = useRef(null)
  const polylineGraphicRef = useRef(null)
  const vertexGraphicsRef = useRef([])
  const verticesRef = useRef([])
  const selectedIndexRef = useRef(null)
  const activeRef = useRef(active)
  activeRef.current = active

  const draggingRef = useRef(null)
  const movedRef = useRef(false)
  const suppressClickRef = useRef(false)

  const historyRef = useRef([])

  const distanceRef = useRef(null)
  const [distance, setDistance] = useState(null)

  const onStateChangeRef = useRef(onStateChange)
  onStateChangeRef.current = onStateChange

  const toXY = (point) => ({
    x: point.x,
    y: point.y,
    spatialReference: point.spatialReference,
  })

  const snapshot = () => verticesRef.current.map(v => ({...v}))

  const pushHistory = () => {
    historyRef.current.push(snapshot())
  }

  const emitState = () => {
    if (onStateChangeRef.current) {
      onStateChangeRef.current({
        vertexCount: verticesRef.current.length,
        selectedIndex: selectedIndexRef.current,
        canUndo: historyRef.current.length > 0,
      })
    }
  }

  const syncUi = () => {
    emitState()
  }

  const updateDistance = () => {
    const g = polylineGraphicRef.current
    let value = null
    if (g && g.geometry) {
      const len = geodesicLength(g.geometry, "kilometers")
      if (len > 0) value = len.toFixed(2)
    }
    distanceRef.current = value
    setDistance(value)
  }

  const render = () => {
    const layer = layerRef.current
    if (!layer) return
    const verts = verticesRef.current
    const sr = verts[0] ? verts[0].spatialReference : (view && view.spatialReference)

    if (verts.length >= 2) {
      const poly = new Polyline({
        spatialReference: sr,
        paths: [[verts.map(v => [v.x, v.y])]],
      })
      if (!polylineGraphicRef.current) {
        polylineGraphicRef.current = new Graphic({
          geometry: poly,
          symbol: LINE_SYMBOL,
          attributes: {routePath: true},
        })
        layer.add(polylineGraphicRef.current)
      } else {
        polylineGraphicRef.current.geometry = poly
      }
    } else if (polylineGraphicRef.current) {
      layer.remove(polylineGraphicRef.current)
      polylineGraphicRef.current = null
    }

    vertexGraphicsRef.current.forEach(g => layer.remove(g))
    vertexGraphicsRef.current = []
    for (let i = 0; i < verts.length; i++) {
      const p = new Point({x: verts[i].x, y: verts[i].y, spatialReference: verts[i].spatialReference})
      const sel = selectedIndexRef.current === i
      const g = new Graphic({
        geometry: p,
        symbol: makeVertexSymbol(sel),
        attributes: {vertexIndex: i},
      })
      vertexGraphicsRef.current.push(g)
      layer.add(g)
    }
  }

  const clearInternal = () => {
    const layer = layerRef.current
    if (layer) layer.removeAll()
    polylineGraphicRef.current = null
    vertexGraphicsRef.current = []
    verticesRef.current = []
    selectedIndexRef.current = null
  }

  const selectVertex = (index) => {
    selectedIndexRef.current = index
    render()
    syncUi()
  }

  const clearSelection = () => {
    selectedIndexRef.current = null
    render()
    syncUi()
  }

  const addVertex = (point) => {
    pushHistory()
    verticesRef.current.push(toXY(point))
    selectedIndexRef.current = null
    render()
    updateDistance()
    syncUi()
  }

  const deleteSelected = () => {
    const idx = selectedIndexRef.current
    if (idx === null) return
    pushHistory()
    verticesRef.current.splice(idx, 1)
    selectedIndexRef.current = null
    render()
    updateDistance()
    syncUi()
  }

  const clearAll = () => {
    pushHistory()
    clearInternal()
    updateDistance()
    syncUi()
  }

  const undo = () => {
    if (historyRef.current.length === 0) return
    verticesRef.current = historyRef.current.pop()
    if (selectedIndexRef.current !== null && selectedIndexRef.current >= verticesRef.current.length) {
      selectedIndexRef.current = null
    }
    render()
    updateDistance()
    syncUi()
  }

  const getGraphics = () => {
    const graphics = []
    if (polylineGraphicRef.current) graphics.push(polylineGraphicRef.current)
    return graphics
  }

  const getDistance = () => {
    return distanceRef.current ? parseFloat(distanceRef.current) : 0
  }

  const drawRoute = (route) => {
    if (!layerRef.current) return
    clearInternal()
    historyRef.current = []
    if (!route || !route.features) {
      render()
      updateDistance()
      syncUi()
      return
    }
    const polyFeature = route.features.find(f =>
      f.geometry && (f.geometry.type === "polyline" || (f.geometry.paths !== undefined && !f.geometry.rings))
    )
    const sr = view ? view.spatialReference : null

    let verts = []
    if (polyFeature) {
      const g = polyFeature.geometry
      const paths = g.paths
      if (paths && paths[0]) {
        verts = paths[0].map(([x, y]) => ({x, y, spatialReference: g.spatialReference || sr}))
      }
    }
    verticesRef.current = verts
    selectedIndexRef.current = null
    render()
    updateDistance()
    syncUi()
  }

  useEffect(() => {
    if (onRegister && toolId) {
      onRegister(toolId, {
        getGraphics,
        getDistance,
        clear: clearAll,
        startDraw: () => {},
        undo,
        deleteSelected,
        clearSelection,
        canUndo: () => historyRef.current.length > 0,
      })
    }
  }, [onRegister, toolId])

  useEffect(() => {
    if (!view) return

    const layer = new GraphicsLayer({id: "polyline-draw-layer"})
    view.map.add(layer)
    layerRef.current = layer

    drawRoute(initialRoute)

    const findVertexGraphic = (results) => {
      return (results || []).find(
        r => r.graphic && r.graphic.layer === layerRef.current &&
          r.graphic.attributes && r.graphic.attributes.vertexIndex !== undefined
      )
    }

    const handlePointerDown = (event) => {
      if (!activeRef.current) return
      view.hitTest(event).then((response) => {
        const hit = findVertexGraphic(response.results)
        if (hit) {
          draggingRef.current = {index: hit.graphic.attributes.vertexIndex}
          selectVertex(hit.graphic.attributes.vertexIndex)
        }
      }).catch(() => {})
    }

    const handlePointerMove = (event) => {
      if (!draggingRef.current) return
      const point = view.toMap({x: event.x, y: event.y})
      if (!point) return
      if (!movedRef.current) {
        pushHistory()
        movedRef.current = true
      }
      const idx = draggingRef.current.index
      verticesRef.current[idx] = toXY(point)
      render()
      updateDistance()
    }

    const handlePointerUp = () => {
      if (draggingRef.current) {
        draggingRef.current = null
        if (movedRef.current) {
          suppressClickRef.current = true
        }
        movedRef.current = false
        syncUi()
      }
    }

    const handleClick = (event) => {
      if (!activeRef.current) {
        clearSelection()
        return
      }
      if (suppressClickRef.current) {
        suppressClickRef.current = false
        return
      }
      const point = view.toMap({x: event.x, y: event.y})
      if (!point) return
      view.hitTest(event).then((response) => {
        const hit = findVertexGraphic(response.results)
        if (hit) {
          selectVertex(hit.graphic.attributes.vertexIndex)
          return
        }
        addVertex(point)
      }).catch(() => {})
    }

    const handleKeyDown = (e) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        deleteSelected()
      }
    }

    const pointerDownHandle = view.on("pointer-down", handlePointerDown)
    const pointerMoveHandle = view.on("pointer-move", handlePointerMove)
    const pointerUpHandle = view.on("pointer-up", handlePointerUp)
    const clickHandle = view.on("click", handleClick)
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      try { pointerDownHandle.remove() } catch {}
      try { pointerMoveHandle.remove() } catch {}
      try { pointerUpHandle.remove() } catch {}
      try { clickHandle.remove() } catch {}
      try { view.map.remove(layer) } catch {}
      layerRef.current = null
      polylineGraphicRef.current = null
      vertexGraphicsRef.current = []
      verticesRef.current = []
      selectedIndexRef.current = null
    }
  }, [view])

  useEffect(() => {
    if (!view) return
    if (verticesRef.current.length === 0 && historyRef.current.length === 0) {
      drawRoute(initialRoute)
    }
  }, [view, initialRoute])

  return (
    <div
      style={{
        position: "absolute",
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        background: "var(--bg-panel-solid)",
        padding: "10px 18px",
        borderRadius: "8px",
        color: "var(--green)",
        fontSize: "14px",
        fontWeight: "bold",
        fontFamily: "monospace",
        zIndex: 10,
        border: "1px solid rgba(12, 255, 37, 0.3)",
      }}
    >
      <span>{distance ? `Distance: ${distance} km` : "Route"}</span>
    </div>
  )
}

export default PolylineDrawer
