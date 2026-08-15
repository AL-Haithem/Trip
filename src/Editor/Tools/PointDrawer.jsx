import {useEffect, useRef, useState} from "react"

import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer"
import Graphic from "@arcgis/core/Graphic"
import Point from "@arcgis/core/geometry/Point"

const PIN_PATH =
  "M16 3.5c-4.4 0-8 3.6-8 8 0 5.7 8 14.5 8 14.5s8-8.8 8-14.5c0-4.4-3.6-8-8-8zM16 14a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z"

export const WAYPOINT_TYPES = [
  {id: "restaurant", label: "مطعم", emoji: "🍽️"},
  {id: "camp", label: "مخيم", emoji: "⛺"},
  {id: "beach", label: "شاطئ", emoji: "🏖️"},
  {id: "rest", label: "راحة", emoji: "☕"},
  {id: "attraction", label: "معلم سياحي", emoji: "📍"},
  {id: "forest", label: "غابة", emoji: "🌲"},
  {id: "reststop", label: "توقف راحة", emoji: "🚏"},
]

function emojiToDataUrl(emoji) {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 34 34">` +
    `<circle cx="17" cy="17" r="16" fill="#0d1117" stroke="#0cff25" stroke-width="1.5"/>` +
    `<text x="17" y="23" font-size="20" text-anchor="middle">${emoji}</text>` +
    `</svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

function makePinSymbol(typeId) {
  const t = WAYPOINT_TYPES.find(x => x.id === typeId);
  const emoji = t ? t.emoji : "📍";
  return {
    type: "picture-marker",
    url: emojiToDataUrl(emoji),
    width: "34px",
    height: "34px",
    outline: {color: "#06210b", width: 1},
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

function symbolFromFeature(feature) {
  const props = feature.properties || {};
  if (props.waypointType) return makePinSymbol(props.waypointType);
  return makePinSymbol(null);
}

function PointDrawer({view, active, onRegister, toolId, initialRoute, onSelectChange}) {

  const layerRef = useRef(null)
  const selectedGraphicRef = useRef(null)
  const activeRef = useRef(active)
  activeRef.current = active
  const [count, setCount] = useState(0)
  const [selected, setSelected] = useState(false)

  const updateCount = (layer) => {
    setCount(layer && layer.graphics ? layer.graphics.length : 0);
  };

  const clearGraphics = () => {
    if (layerRef.current) {
      layerRef.current.removeAll();
      selectedGraphicRef.current = null;
    }
    setSelected(false);
    setCount(0);
  };

  const getGraphics = () => {
    if (!layerRef.current) return [];
    return layerRef.current.graphics.toArray();
  };

  const selectGraphic = (graphic) => {
    selectedGraphicRef.current = graphic;
    setSelected(true);
    if (onSelectChange) onSelectChange(graphic);
  };

  const clearSelection = () => {
    selectedGraphicRef.current = null;
    setSelected(false);
    if (onSelectChange) onSelectChange(null);
  };

  const deleteSelected = () => {
    if (selectedGraphicRef.current && layerRef.current) {
      layerRef.current.remove(selectedGraphicRef.current);
      selectedGraphicRef.current = null;
      setSelected(false);
      updateCount(layerRef.current);
    }
  };

  const changeType = (typeId) => {
    const g = selectedGraphicRef.current;
    if (!g) return;
    g.symbol = makePinSymbol(typeId);
    const attrs = g.attributes || {};
    attrs.waypointType = typeId;
    attrs.waypointLabel = getLabelForType(typeId);
    g.attributes = attrs;
    if (layerRef.current && layerRef.current.refresh) layerRef.current.refresh();
  };

  const drawRoute = (route) => {
    if (!layerRef.current) return;
    layerRef.current.removeAll();
    if (!route || !route.features) {
      updateCount(layerRef.current);
      return;
    }
    route.features.forEach(feature => {
      const g = feature.geometry;
      if (g && (g.type === "point" || (g.x !== undefined && g.y !== undefined && !g.paths))) {
        const graphic = new Graphic({
          geometry: new Point(g),
          symbol: symbolFromFeature(feature),
          attributes: feature.properties || {},
        });
        layerRef.current.add(graphic);
      }
    });
    updateCount(layerRef.current);
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

    drawRoute(initialRoute);

    const handleClick = (event) => {
      view.hitTest(event).then((response) => {
        const result = (response.results || []).find(
          r => r.graphic && r.graphic.layer === layerRef.current
        );
        if (result) {
          selectGraphic(result.graphic);
        } else if (activeRef.current) {
          const typeId = "rest";
          const graphic = new Graphic({
            geometry: view.toMap({x: event.x, y: event.y}),
            symbol: makePinSymbol(typeId),
            attributes: {waypointType: typeId, waypointLabel: "راحة"},
          });
          layer.add(graphic);
          updateCount(layer);
          selectGraphic(graphic);
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
            background: "rgba(0, 0, 0, 0.75)",
            padding: "10px 18px",
            borderRadius: "8px",
            color: "#0cff25",
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
