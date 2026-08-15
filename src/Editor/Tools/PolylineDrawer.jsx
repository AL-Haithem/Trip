import {useEffect, useRef, useState} from "react"

import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer"
import SketchViewModel from "@arcgis/core/widgets/Sketch/SketchViewModel"
import Graphic from "@arcgis/core/Graphic"
import Polyline from "@arcgis/core/geometry/Polyline"
import {geodesicLength} from "@arcgis/core/geometry/geometryEngine"

function PolylineDrawer({view, active, onRegister, toolId, initialRoute}) {

  const layerRef = useRef(null)
  const sketchRef = useRef(null)
  const selectedGraphicRef = useRef(null)
  const distanceRef = useRef(null)
  const initialRouteRef = useRef(initialRoute)
  initialRouteRef.current = initialRoute
  const [distance, setDistance] = useState(null)

  const updateTotalDistance = (layer) => {
    if (!layer || !layer.graphics) {
      distanceRef.current = null;
      setDistance(null);
      return;
    }
    let total = 0;
    layer.graphics.forEach(g => {
      if (g.geometry && g.geometry.paths && g.geometry.paths.length > 0) {
        const len = geodesicLength(g.geometry, "kilometers");
        if (len > 0) total += len;
      }
    });
    const value = total > 0 ? total.toFixed(2) : null;
    distanceRef.current = value;
    setDistance(value);
  };

  const clearGraphics = () => {
    if (layerRef.current) {
      layerRef.current.removeAll();
      selectedGraphicRef.current = null;
    }
    distanceRef.current = null;
    setDistance(null);
    if (sketchRef.current) {
      sketchRef.current.cancel();
    }
  };

  const getGraphics = () => {
    if (!layerRef.current) return [];
    return layerRef.current.graphics.toArray();
  };

  const getDistance = () => {
    return distanceRef.current ? parseFloat(distanceRef.current) : 0;
  };

  const startDraw = () => {
    if (sketchRef.current) sketchRef.current.create("polyline");
  };

  const deleteSelected = () => {
    if (selectedGraphicRef.current && layerRef.current) {
      layerRef.current.remove(selectedGraphicRef.current);
      selectedGraphicRef.current = null;
      updateTotalDistance(layerRef.current);
    }
  };

  const drawRoute = (route) => {
    if (!layerRef.current || !sketchRef.current) return;
    layerRef.current.removeAll();
    if (!route || !route.features) {
      updateTotalDistance(layerRef.current);
      return;
    }
    route.features.forEach(feature => {
      const g = feature.geometry;
      if (g && (g.type === "polyline" || (g.paths !== undefined && !g.rings))) {
        const graphic = new Graphic({
          geometry: new Polyline(g),
          symbol: sketchRef.current.polylineSymbol,
          attributes: feature.properties || {},
        });
        layerRef.current.add(graphic);
      }
    });
    updateTotalDistance(layerRef.current);
  };

  useEffect(() => {
    if (onRegister && toolId) {
      onRegister(toolId, {getGraphics, getDistance, clear: clearGraphics, startDraw});
    }
  }, [onRegister, toolId]);

  useEffect(() => {
    if (!view) return;

    const layer = new GraphicsLayer({id: "polyline-draw-layer"});
    view.map.add(layer);
    layerRef.current = layer;

    const sketch = new SketchViewModel({
      view,
      layer,
      polylineSymbol: {
        type: "simple-line",
        color: "#0cff25",
        width: 3
      },
      defaultUpdateOptions: {
        enableRotation: false,
        enableScaling: false,
        enableMove: false,
      },
    });
    sketchRef.current = sketch;

    const UPDATE_OPTIONS = {tool: "reshape", enableMove: false, enableRotation: false, enableScaling: false, toggleToolOnClick: false};

    drawRoute(initialRouteRef.current);

    sketch.on("create", (event) => {
      if (event.state === "complete") {
        updateTotalDistance(layer);
      }
    });

    sketch.on("update", (event) => {
      if (event.state === "complete") {
        updateTotalDistance(layer);
      }
      if (event.graphics && event.graphics.length > 0) {
        selectedGraphicRef.current = event.graphics[0];
        if (event.tool === "transform") {
          sketch.update(event.graphics, UPDATE_OPTIONS);
        }
      }
    });

    const handleKeyDown = (e) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        deleteSelected();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      try { sketch.destroy(); } catch (err) { console.error("PolylineDrawer: sketch destroy failed", err); }
      sketchRef.current = null;
      try {
        if (view && view.map) view.map.remove(layer);
      } catch (err) {
        console.error("PolylineDrawer: failed to remove layer", err);
      }
      layerRef.current = null;
      selectedGraphicRef.current = null;
      setDistance(null);
    };

  }, [view]);

  useEffect(() => {
    if (!view || !sketchRef.current) return;
    if (active) {
      startDraw();
    } else {
      sketchRef.current.cancel();
    }
  }, [view, active]);

  useEffect(() => {
    if (!view || !layerRef.current) return;
    drawRoute(initialRoute);
  }, [view, initialRoute]);

  if (!active) return null;

  return (
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
        display: "flex",
        gap: "18px",
        alignItems: "center",
        zIndex: 10,
        border: "1px solid rgba(12, 255, 37, 0.3)",
      }}
    >
      <span>
        {distance ? `Distance: ${distance} km` : "Click on map to start a line"}
      </span>
      <button
        onClick={startDraw}
        style={{
          padding: "4px 10px",
          borderRadius: "4px",
          border: "1px solid #0cff25",
          background: "rgba(12, 255, 37, 0.15)",
          color: "#0cff25",
          cursor: "pointer",
          fontSize: "12px",
          fontWeight: "bold",
        }}
      >
        Add Line
      </button>
      {selectedGraphicRef.current && (
        <button
          onClick={deleteSelected}
          style={{
            padding: "4px 10px",
            borderRadius: "4px",
            border: "1px solid #ff4c4c",
            background: "rgba(255, 76, 76, 0.15)",
            color: "#ff4c4c",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: "bold",
          }}
        >
          Delete Selected
        </button>
      )}
    </div>
  )
}

export default PolylineDrawer
