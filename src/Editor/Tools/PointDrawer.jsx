import {useEffect, useRef, useState} from "react"

import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer"
import Graphic from "@arcgis/core/Graphic"
import Point from "@arcgis/core/geometry/Point"

import {useTheme} from "../../theme/themeContext.jsx"
import {getMapColors} from "../../Maps/mapTheme.js"

const PIN_PATH =
  "M16 3.5c-4.4 0-8 3.6-8 8 0 5.7 8 14.5 8 14.5s8-8.8 8-14.5c0-4.4-3.6-8-8-8zM16 14a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z"

export const WAYPOINT_TYPES = [
  {id: "restaurant", label: "Restaurant", emoji: "🍽️"},
  {id: "camp", label: "Camp", emoji: "⛺"},
  {id: "beach", label: "Beach", emoji: "🏖️"},
  {id: "rest", label: "Rest", emoji: "☕"},
  {id: "attraction", label: "Attraction", emoji: "📍"},
  {id: "forest", label: "Forest", emoji: "🌲"},
  {id: "reststop", label: "Rest Stop", emoji: "🚏"},
]

function emojiToDataUrl(emoji, pinBg, pinStroke) {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 34 34">` +
    `<circle cx="17" cy="17" r="16" fill="${pinBg}" stroke="${pinStroke}" stroke-width="1.5"/>` +
    `<text x="17" y="23" font-size="20" text-anchor="middle">${emoji}</text>` +
    `</svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

function makePinSymbol(typeId, selected, c) {
  const t = WAYPOINT_TYPES.find(x => x.id === typeId);
  const emoji = t ? t.emoji : "📍";
  return {
    type: "picture-marker",
    url: emojiToDataUrl(emoji, c.pinBg, c.pinInk),
    width: selected ? "40px" : "34px",
    height: selected ? "40px" : "34px",
    opacity: selected ? 1 : 0.45,
    outline: selected
      ? {color: "#ff4c4c", width: 2}
      : {color: c.pinInk, width: 1},
  };
}

function getEmojiForType(typeId) {
  const t = WAYPOINT_TYPES.find(x => x.id === typeId);
  return t ? t.emoji : "📍";
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

  const {theme} = useTheme()
  const colorsRef = useRef(getMapColors(theme))
  colorsRef.current = getMapColors(theme)

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
      clearInterval(pulseRef.current)
      pulseRef.current = null
    }
  }

  const startPulse = (graphic) => {
    stopPulse()
    let frame = 0
    pulseRef.current = setInterval(() => {
      frame += 1
      const t = (Math.sin(frame / 6) + 1) / 2
      const opacity = 0.5 + t * 0.5
      const size = 40 + Math.round(t * 8)
      const typeId = graphic.attributes?.waypointType
      graphic.symbol = {
        type: "picture-marker",
        url: emojiToDataUrl(getEmojiForType(typeId), colorsRef.current.pinBg, colorsRef.current.pinInk),
        width: size + "px",
        height: size + "px",
        opacity,
        outline: {color: "#ff4c4c", width: 2},
      }
    }, 60)
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
        selectedGraphicRef.current.attributes?.waypointType
      );
    }
    selectedGraphicRef.current = graphic;
    setSelected(true);
    if (graphic) {
      startPulse(graphic);
    }
    if (onSelectChange) onSelectChange(graphic);
    emitState();
  };

  const clearSelection = () => {
    stopPulse();
    if (selectedGraphicRef.current) {
      selectedGraphicRef.current.symbol = makePinSymbol(
        selectedGraphicRef.current.attributes?.waypointType
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
          attributes: feature.properties || {},
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
            color: "var(--green)",
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
