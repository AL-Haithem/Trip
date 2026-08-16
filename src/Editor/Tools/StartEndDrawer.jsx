import {useEffect, useRef} from "react"

import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer"
import Graphic from "@arcgis/core/Graphic"
import Point from "@arcgis/core/geometry/Point"

function makeStartSymbol() {
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='36' height='36' viewBox='0 0 36 36'>` +
    `<circle cx='18' cy='18' r='16' fill='#0cff25' stroke='#06210b' stroke-width='2'/>` +
    `<text x='18' y='24' font-size='20' text-anchor='middle' fill='#06210b' font-weight='bold' font-family='sans-serif'>S</text>` +
    `</svg>`
  return {
    type: "picture-marker",
    url: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg),
    width: "36px",
    height: "36px",
    outline: {color: "#06210b", width: 1},
  }
}

function makeEndSymbol() {
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='36' height='36' viewBox='0 0 36 36'>` +
    `<circle cx='18' cy='18' r='16' fill='#ff4c4c' stroke='#06210b' stroke-width='2'/>` +
    `<text x='18' y='24' font-size='20' text-anchor='middle' fill='#06210b' font-weight='bold' font-family='sans-serif'>E</text>` +
    `</svg>`
  return {
    type: "picture-marker",
    url: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg),
    width: "36px",
    height: "36px",
    outline: {color: "#06210b", width: 1},
  }
}

function StartEndDrawer({view, mode, initialStart, initialEnd, onChange}) {
  const layerRef = useRef(null)
  const startRef = useRef(null)
  const endRef = useRef(null)

  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const modeRef = useRef(mode)
  modeRef.current = mode

  const emit = () => {
    if (onChangeRef.current) {
      onChangeRef.current({
        start: startRef.current ? startRef.current.geometry : null,
        end: endRef.current ? endRef.current.geometry : null,
      })
    }
  }

  const placeMarker = (which, point) => {
    const layer = layerRef.current
    if (!layer) return
    if (which === "start") {
      if (!startRef.current) {
        startRef.current = new Graphic({
          geometry: point,
          symbol: makeStartSymbol(),
          attributes: {kind: "start"},
        })
        layer.add(startRef.current)
      } else {
        startRef.current.geometry = point
      }
    } else {
      if (!endRef.current) {
        endRef.current = new Graphic({
          geometry: point,
          symbol: makeEndSymbol(),
          attributes: {kind: "end"},
        })
        layer.add(endRef.current)
      } else {
        endRef.current.geometry = point
      }
    }
    emit()
  }

  const toGeometry = (input) => {
    if (!input) return null
    let g = input
    if (Array.isArray(g.features)) g = g.features[0] || null
    if (g && g.geometry) g = g.geometry
    if (g && (g.x !== undefined || g.longitude !== undefined)) return new Point(g)
    return null
  }

  const drawInitial = () => {
    const layer = layerRef.current
    if (!layer) return
    layer.removeAll()
    startRef.current = null
    endRef.current = null
    const startGeom = toGeometry(initialStart)
    if (startGeom) {
      startRef.current = new Graphic({
        geometry: startGeom,
        symbol: makeStartSymbol(),
        attributes: {kind: "start"},
      })
      layer.add(startRef.current)
    }
    const endGeom = toGeometry(initialEnd)
    if (endGeom) {
      endRef.current = new Graphic({
        geometry: endGeom,
        symbol: makeEndSymbol(),
        attributes: {kind: "end"},
      })
      layer.add(endRef.current)
    }
    emit()
  }

  useEffect(() => {
    if (!view) return
    const layer = new GraphicsLayer({id: "start-end-layer"})
    view.map.add(layer)
    layerRef.current = layer
    drawInitial()

    const handleClick = (event) => {
      if (!modeRef.current) return
      const point = view.toMap({x: event.x, y: event.y})
      if (!point) return
      placeMarker(modeRef.current, point)
    }
    const clickHandle = view.on("click", handleClick)

    return () => {
      try { clickHandle.remove() } catch (err) {}
      try { view.map.remove(layer) } catch (err) {}
      layerRef.current = null
      startRef.current = null
      endRef.current = null
    }
  }, [view])

  useEffect(() => {
    if (view && layerRef.current) drawInitial()
  }, [view, initialStart, initialEnd])

  return null
}

export default StartEndDrawer
