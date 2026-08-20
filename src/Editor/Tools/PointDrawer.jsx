import {useEffect, useRef, useState} from "react"

import {getMapColors} from "../../Maps/mapTheme.js"

export const WAYPOINT_TYPES = [
  {id: "restaurant", label: "Restaurant", icon: "utensils", vb: 448, path: "M416 0C400 0 288 32 288 176V288c0 35.3 28.7 64 64 64h32V480c0 17.7 14.3 32 32 32s32-14.3 32-32V352 240 32c0-17.7-14.3-32-32-32zM64 16C64 7.8 57.9 1 49.7 .1S34.2 4.6 32.4 12.5L2.1 148.8C.7 155.1 0 161.5 0 167.9c0 45.9 35.1 83.6 80 87.7V480c0 17.7 14.3 32 32 32s32-14.3 32-32V255.6c44.9-4.1 80-41.8 80-87.7c0-6.4-.7-12.8-2.1-19.1L191.6 12.5c-1.8-8-9.3-13.3-17.4-12.4S160 7.8 160 16V150.2c0 5.4-4.4 9.8-9.8 9.8c-5.1 0-9.3-3.9-9.8-9L127.9 14.6C127.2 6.3 120.3 0 112 0s-15.2 6.3-15.9 14.6L83.7 151c-.5 5.1-4.7 9-9.8 9c-5.4 0-9.8-4.4-9.8-9.8V16zm48.3 152l-.3 0-.3 0 .3-.7 .3 .7z"},
  {id: "camp", label: "Camp", icon: "tent", vb: 576, path: "M269.4 6C280.5-2 295.5-2 306.6 6l224 160c7.4 5.3 12.2 13.5 13.2 22.5l32 288c1 9-1.9 18.1-8 24.9s-14.7 10.7-23.8 10.7H464 435.8c-12.1 0-23.2-6.8-28.6-17.7L306.7 293.5c-1.7-3.4-5.1-5.5-8.8-5.5c-5.5 0-9.9 4.4-9.9 9.9V480c0 17.7-14.3 32-32 32H240 32c-9.1 0-17.8-3.9-23.8-10.7s-9-15.8-8-24.9l32-288c1-9 5.8-17.2 13.2-22.5L269.4 6z"},
  {id: "beach", label: "Beach", icon: "umbrella-beach", vb: 576, path: "M346.3 271.8l-60.1-21.9L214 448H32c-17.7 0-32 14.3-32 32s14.3 32 32 32H544c17.7 0 32-14.3 32-32s-14.3-32-32-32H282.1l64.1-176.2zm121.1-.2l-3.3 9.1 67.7 24.6c18.1 6.6 38-4.2 39.6-23.4c6.5-78.5-23.9-155.5-80.8-208.5c2 8 3.2 16.3 3.4 24.8l.2 6c1.8 57-7.3 113.8-26.8 167.4zM462 99.1c-1.1-34.4-22.5-64.8-54.4-77.4c-.9-.4-1.9-.7-2.8-1.1c-33-11.7-69.8-2.4-93.1 23.8l-4 4.5C272.4 88.3 245 134.2 226.8 184l-3.3 9.1L434 269.7l3.3-9.1c18.1-49.8 26.6-102.5 24.9-155.5l-.2-6zM107.2 112.9c-11.1 15.7-2.8 36.8 15.3 43.4l71 25.8 3.3-9.1c19.5-53.6 49.1-103 87.1-145.5l4-4.5c6.2-6.9 13.1-13 20.5-18.2c-79.6 2.5-154.7 42.2-201.2 108z"},
  {id: "rest", label: "Rest", icon: "mug-hot", vb: 512, path: "M88 0C74.7 0 64 10.7 64 24c0 38.9 23.4 59.4 39.1 73.1l1.1 1C120.5 112.3 128 119.9 128 136c0 13.3 10.7 24 24 24s24-10.7 24-24c0-38.9-23.4-59.4-39.1-73.1l-1.1-1C119.5 47.7 112 40.1 112 24c0-13.3-10.7-24-24-24zM32 192c-17.7 0-32 14.3-32 32V416c0 53 43 96 96 96H288c53 0 96-43 96-96h16c61.9 0 112-50.1 112-112s-50.1-112-112-112H352 32zm352 64h16c26.5 0 48 21.5 48 48s-21.5 48-48 48H384V256zM224 24c0-13.3-10.7-24-24-24s-24 10.7-24 24c0 38.9 23.4 59.4 39.1 73.1l1.1 1C232.5 112.3 240 119.9 240 136c0 13.3 10.7 24 24 24s24-10.7 24-24c0-38.9-23.4-59.4-39.1-73.1l-1.1-1C231.5 47.7 224 40.1 224 24z"},
  {id: "attraction", label: "Attraction", icon: "camera-retro", vb: 512, path: "M220.6 121.2L271.1 96 448 96v96H333.2c-21.9-15.1-48.5-24-77.2-24s-55.2 8.9-77.2 24H64V128H192c9.9 0 19.7-2.3 28.6-6.8zM0 128V416c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H271.1c-9.9 0-19.7 2.3-28.6 6.8L192 64H160V48c0-8.8-7.2-16-16-16H80c-8.8 0-16 7.2-16 16l0 16C28.7 64 0 92.7 0 128zM168 304a88 88 0 1 1 176 0 88 88 0 1 1 -176 0z"},
  {id: "forest", label: "Forest", icon: "tree", vb: 448, path: "M210.6 5.9L62 169.4c-3.9 4.2-6 9.8-6 15.5C56 197.7 66.3 208 79.1 208H104L30.6 281.4c-4.2 4.2-6.6 10-6.6 16C24 309.9 34.1 320 46.6 320H80L5.4 409.5C1.9 413.7 0 419 0 424.5c0 13 10.5 23.5 23.5 23.5H192v32c0 17.7 14.3 32 32 32s32-14.3 32-32V448H424.5c13 0 23.5-10.5 23.5-23.5c0-5.5-1.9-10.8-5.4-15L368 320h33.4c12.5 0 22.6-10.1 22.6-22.6c0-6-2.4-11.8-6.6-16L344 208h24.9c12.7 0 23.1-10.3 23.1-23.1c0-5.7-2.1-11.3-6-15.5L237.4 5.9C234 2.1 229.1 0 224 0s-10 2.1-13.4 5.9z"},
  {id: "reststop", label: "Rest Stop", icon: "gas-pump", vb: 512, path: "M32 64C32 28.7 60.7 0 96 0H256c35.3 0 64 28.7 64 64V256h8c48.6 0 88 39.4 88 88v32c0 13.3 10.7 24 24 24s24-10.7 24-24V222c-27.6-7.1-48-32.2-48-62V96L384 64c-8.8-8.8-8.8-23.2 0-32s23.2-8.8 32 0l77.3 77.3c12 12 18.7 28.3 18.7 45.3V168v24 32V376c0 39.8-32.2 72-72 72s-72-32.2-72-72V344c0-22.1-17.9-40-40-40h-8V448c17.7 0 32 14.3 32 32s-14.3 32-32 32H32c-17.7 0-32-14.3-32-32s14.3-32 32-32V64zM96 80v96c0 8.8 7.2 16 16 16H240c8.8 0 16-7.2 16-16V80c0-8.8-7.2-16-16-16H112c-8.8 0-16 7.2-16 16z"},
]

const DEFAULT_PIN = {vb: 384, path: "M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"}

function pathToDataUrl(vb, d, pinBg, pinStroke, pinInk) {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 34 34">` +
    `<circle cx="17" cy="17" r="16" fill="${pinBg}" stroke="${pinStroke}" stroke-width="1.5"/>` +
    `<svg x="7" y="7" width="20" height="20" viewBox="0 0 ${vb} ${vb}" preserveAspectRatio="xMidYMid meet">` +
    `<path d="${d}" fill="${pinInk}"/></svg>` +
    `</svg>`
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg)
}

export function waypointPinUrl(typeId, c) {
  const t = WAYPOINT_TYPES.find(x => x.id === typeId)
  const vb = t ? t.vb : DEFAULT_PIN.vb
  const d = t ? t.path : DEFAULT_PIN.path
  return pathToDataUrl(vb, d, c.pinBg, c.pinInk, c.pinIcon)
}

function makePinSymbol(typeId, selected, c) {
  return {
    type: "picture-marker",
    url: waypointPinUrl(typeId, c),
    width: selected ? "40px" : "34px",
    height: selected ? "40px" : "34px",
    opacity: selected ? 1 : 0.45,
    outline: selected
      ? {color: "#ff4c4c", width: 2}
      : {color: c.pinInk, width: 1},
  }
}

function getLabelForType(typeId) {
  const t = WAYPOINT_TYPES.find(x => x.id === typeId);
  return t ? t.label : "";
}

function symbolFromFeature(feature, selected, c) {
  const props = feature.properties || {};
  if (props.waypointType) return makePinSymbol(props.waypointType, selected, c);
  return makePinSymbol(null, selected, c);
}

function PointDrawer({view, active, onRegister, toolId, initialRoute, onSelectChange, onStateChange}) {

  const colorsRef = useRef(getMapColors())
  colorsRef.current = getMapColors()

  const layerRef = useRef(null)
  const selectedGraphicRef = useRef(null)
  const activeRef = useRef(active)
  activeRef.current = active
  const historyRef = useRef([])
  const onStateChangeRef = useRef(onStateChange)
  onStateChangeRef.current = onStateChange
  const pulseRef = useRef(null)
  const [count, setCount] = useState(0)
  const [selected, setSelected] = useState(false)

  const stopPulse = () => {
    if (pulseRef.current) {
      cancelAnimationFrame(pulseRef.current)
      pulseRef.current = null
    }
  }

  // One-shot: grow to selected size and fade in (opacity only, no oscillation).
  const animateSelect = (graphic) => {
    stopPulse()
    const typeId = graphic.attributes?.waypointType
    const baseSize = 40
    const startOpacity = 0.2
    const duration = 150
    const start = performance.now()
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration)
      graphic.symbol = {
        type: "picture-marker",
        url: waypointPinUrl(typeId, colorsRef.current),
        width: baseSize + "px",
        height: baseSize + "px",
        opacity: startOpacity + (1 - startOpacity) * t,
        outline: {color: "#ff4c4c", width: 2},
      }
      if (t < 1) {
        pulseRef.current = requestAnimationFrame(step)
      } else {
        pulseRef.current = null
      }
    }
    pulseRef.current = requestAnimationFrame(step)
  }

  const emitState = () => {
    if (onStateChangeRef.current) {
      onStateChangeRef.current({
        vertexCount: layerRef.current ? layerRef.current.graphics.length : 0,
        selectedIndex: selectedGraphicRef.current ? 1 : null,
        canUndo: historyRef.current.length > 0,
      })
    }
  }

  const snapshot = () => layerRef.current ? layerRef.current.graphics.toArray().map(g => g.clone()) : []

  const updateCount = (layer) => {
    setCount(layer && layer.graphics ? layer.graphics.length : 0);
  };

  const clearGraphics = () => {
    historyRef.current.push(snapshot());
    if (layerRef.current) {
      layerRef.current.removeAll();
      selectedGraphicRef.current = null;
    }
    setSelected(false);
    setCount(0);
    emitState();
  };

  const getGraphics = () => {
    if (!layerRef.current) return [];
    return layerRef.current.graphics.toArray();
  };

  const selectGraphic = (graphic) => {
    if (selectedGraphicRef.current && selectedGraphicRef.current !== graphic) {
      selectedGraphicRef.current.symbol = makePinSymbol(
        selectedGraphicRef.current.attributes?.waypointType,
        false,
        colorsRef.current
      );
    }
    selectedGraphicRef.current = graphic;
    setSelected(true);
    if (graphic) {
      animateSelect(graphic);
    }
    if (onSelectChange) onSelectChange(graphic);
    emitState();
  };

  const clearSelection = () => {
    stopPulse();
    if (selectedGraphicRef.current) {
      selectedGraphicRef.current.symbol = makePinSymbol(
        selectedGraphicRef.current.attributes?.waypointType,
        false,
        colorsRef.current
      );
    }
    selectedGraphicRef.current = null;
    setSelected(false);
    if (onSelectChange) onSelectChange(null);
    emitState();
  };

  const deleteSelected = () => {
    if (selectedGraphicRef.current && layerRef.current) {
      stopPulse();
      historyRef.current.push(snapshot());
      layerRef.current.remove(selectedGraphicRef.current);
      selectedGraphicRef.current = null;
      setSelected(false);
      updateCount(layerRef.current);
      if (onSelectChange) onSelectChange(null);
      emitState();
    }
  };

  const changeType = (typeId) => {
    const g = selectedGraphicRef.current;
    if (!g) return;
    g.symbol = makePinSymbol(typeId, true, colorsRef.current);
    const attrs = g.attributes || {};
    attrs.waypointType = typeId;
    attrs.waypointLabel = getLabelForType(typeId);
    g.attributes = attrs;
    if (layerRef.current && layerRef.current.refresh) layerRef.current.refresh();
    emitState();
    clearSelection();
  };

  const addPoint = (point) => {
    historyRef.current.push(snapshot());
    const typeId = "rest";
    const graphic = new Graphic({
      geometry: point,
      symbol: makePinSymbol(typeId, false, colorsRef.current),
      attributes: {waypointType: typeId, waypointLabel: "Rest"},
    });
    layerRef.current.add(graphic);
    updateCount(layerRef.current);
    selectGraphic(graphic);
  };

  const undo = () => {
    if (historyRef.current.length === 0) return;
    const prev = historyRef.current.pop();
    layerRef.current.removeAll();
    prev.forEach(g => layerRef.current.add(g));
    selectedGraphicRef.current = null;
    setSelected(false);
    updateCount(layerRef.current);
    if (onSelectChange) onSelectChange(null);
    emitState();
  };

  const drawRoute = (route) => {
    if (!layerRef.current) return;
    layerRef.current.removeAll();
    historyRef.current = [];
    if (!route || !route.features) {
      updateCount(layerRef.current);
      return;
    }
    route.features.forEach(feature => {
      const g = feature.geometry;
      if (g && (g.type === "point" || (g.x !== undefined && g.y !== undefined && !g.paths))) {
        const graphic = new Graphic({
          geometry: new Point(g),
          symbol: symbolFromFeature(feature, false, colorsRef.current),
          attributes: {...(feature.properties || {})},
        });
        layerRef.current.add(graphic);
      }
    });
    updateCount(layerRef.current);
    emitState();
  };

  useEffect(() => {
    if (onRegister && toolId) {
      onRegister(toolId, {
        getGraphics,
        getDistance: () => 0,
        clear: clearGraphics,
        startDraw: () => {},
        getSelection: () => selectedGraphicRef.current,
        deleteSelected,
        changeType,
        clearSelection,
        undo,
        canUndo: () => historyRef.current.length > 0,
      });
    }
  }, [onRegister, toolId]);

  useEffect(() => {
    if (onSelectChange) onSelectChange(selectedGraphicRef.current);
  }, [selected, onSelectChange]);

  useEffect(() => {
    if (!view) return;

    const layer = new GraphicsLayer({id: "point-draw-layer"});
    view.map.add(layer);
    layerRef.current = layer;

    if (layerRef.current.graphics.length === 0) {
      drawRoute(initialRoute);
    }

    const handleClick = (event) => {
      view.hitTest(event).then((response) => {
        const result = (response.results || []).find(
          r => r.graphic && r.graphic.layer === layerRef.current
        );
        if (result) {
          selectGraphic(result.graphic);
        } else if (activeRef.current) {
          addPoint(view.toMap({x: event.x, y: event.y}));
        } else {
          clearSelection();
        }
      }).catch(() => clearSelection());
    };
    const clickHandle = view.on("click", handleClick);

    const handleKeyDown = (e) => {
      if ((e.key === "Delete" || e.key === "Backspace") && selectedGraphicRef.current) {
        deleteSelected();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      try { clickHandle.remove(); } catch (err) { console.error("PointDrawer: failed to remove click handle", err); }
      try {
        if (view && view.map) view.map.remove(layer);
      } catch (err) {
        console.error("PointDrawer: failed to remove layer", err);
      }
      stopPulse();
      layerRef.current = null;
      selectedGraphicRef.current = null;
      setSelected(false);
      setCount(0);
    };

  }, [view, initialRoute]);

  const labelText = count > 0 ? "Pins: " + count : "Click on map to add a waypoint";

  return (
    <>
      {active && (
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--bg-panel-solid)",
            padding: "10px 18px",
            borderRadius: "8px",
            color: "var(--accent)",
            fontSize: "14px",
            fontWeight: "bold",
            fontFamily: "monospace",
            zIndex: 10,
            border: "1px solid rgba(12, 255, 37, 0.3)",
          }}
        >
          {labelText}
        </div>
      )}
    </>
  )
}

export default PointDrawer
