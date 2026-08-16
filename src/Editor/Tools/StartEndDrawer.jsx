import {useEffect, useRef} from "react"

import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer"
import Graphic from "@arcgis/core/Graphic"
import Point from "@arcgis/core/geometry/Point"

const START_PATH = "M64 32C64 14.3 49.7 1.4 33.2 4.4C17.4 7.3 6.6 19.1 5.1 35.2S7.3 64.6 18.4 76.4L160 224l-141.6 147.6c-11.1 11.8-13.3 29.4-5.8 43.6s26.9 21.7 42.6 17.2c17.4-4.9 30.3-19.9 31.9-37.7L112 384V512c0 17.7 14.3 32 32 32s32-14.3 32-32V352l142.4 0c17.1 0 32.4-10.6 38.4-26.7s3.3-34.5-11.2-45.9L198.4 152.4 340 4.8c14.5-11.4 17.3-32 5.8-46.2S305.6 1.4 288.8 5.6L160 48 32 5.6C16.2 0.4 0 9.5 0 25.6L0 32z"
const END_PATH = "M32 0C49.7 0 64 14.3 64 32V48l69-17.2c38.1-9.5 78.3-5.1 113.5 12.5c46.3 23.2 100.8 23.2 147.1 0l9.6-4.8C423.8 28.1 448 43.1 448 66.1V345.8c0 13.3-8.3 25.3-20.8 30l-34.7 13c-46.2 17.3-97.6 14.6-141.7-7.4c-37.9-19-81.3-23.7-122.5-13.4L64 384v96c0 17.7-14.3 32-32 32s-32-14.3-32-32V400 334 64 32C0 14.3 14.3 0 32 0zM64 187.1l64-13.9v65.5L64 252.6V318l48.8-12.2c5.1-1.3 10.1-2.4 15.2-3.3V238.7l38.9-8.4c8.3-1.8 16.7-2.5 25.1-2.1l0-64c13.6 .4 27.2 2.6 40.4 6.4l23.6 6.9v66.7l-41.7-12.3c-7.3-2.1-14.8-3.4-22.3-3.8v71.4c21.8 1.9 43.3 6.7 64 14.4V244.2l22.7 6.7c13.5 4 27.3 6.4 41.3 7.4V194c-7.8-.8-15.6-2.3-23.2-4.5l-40.8-12v-62c-13-3.8-25.8-8.8-38.2-15c-8.2-4.1-16.9-7-25.8-8.8v72.4c-13-.4-26 .8-38.7 3.6L128 173.2V98L64 114v73.1zM320 335.7c16.8 1.5 33.9-.7 50-6.8l14-5.2V251.9l-7.9 1.8c-18.4 4.3-37.3 5.7-56.1 4.5v77.4zm64-149.4V115.4c-20.9 6.1-42.4 9.1-64 9.1V194c13.9 1.4 28 .5 41.7-2.6l22.3-5.2z"

const START_VB = 512
const END_VB = 448

export function startEndPinUrl(kind, c) {
  const isStart = kind === "start"
  const d = isStart ? START_PATH : END_PATH
  const vb = isStart ? START_VB : END_VB
  const fill = isStart ? "#0cff25" : "#ff4c4c"
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='36' height='36' viewBox='0 0 36 36'>` +
    `<circle cx='18' cy='18' r='16' fill='${fill}' stroke='${c.pinInk}' stroke-width='2'/>` +
    `<svg x='8' y='8' width='20' height='20' viewBox='0 0 ${vb} ${vb}' preserveAspectRatio='xMidYMid meet'>` +
    `<path d='${d}' fill='#06210b'/></svg>` +
    `</svg>`
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg)
}

function pathSymbol(fill, d) {
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='36' height='36' viewBox='0 0 36 36'>` +
    `<circle cx='18' cy='18' r='16' fill='${fill}' stroke='#06210b' stroke-width='2'/>` +
    `<svg x='8' y='8' width='20' height='20' viewBox='0 0 384 384' preserveAspectRatio='xMidYMid meet'>` +
    `<path d='${d}' fill='#06210b'/></svg>` +
    `</svg>`
  return {
    type: "picture-marker",
    url: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg),
    width: "36px",
    height: "36px",
    outline: {color: "#06210b", width: 1},
  }
}

function makeStartSymbol() {
  return pathSymbol("#0cff25", START_PATH)
}

function makeEndSymbol() {
  return pathSymbol("#ff4c4c", END_PATH)
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
      try { clickHandle.remove() } catch {}
      try { view.map.remove(layer) } catch {}
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
