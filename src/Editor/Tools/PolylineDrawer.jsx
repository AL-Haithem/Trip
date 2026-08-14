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

  const deleteSelected = () => {
    if (selectedGraphicRef.current && layerRef.current) {
      layerRef.current.remove(selectedGraphicRef.current);
      selectedGraphicRef.current = null;
      updateTotalDistance(layerRef.current);
    }
  };

  useEffect(() => {
    if (onRegister && toolId) {
      onRegister(toolId, {getGraphics, getDistance, clear: clearGraphics});
    }
  }, [onRegister, toolId]);

  useEffect(() => {
    if (!view || !active) return;

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
      },
    });
    sketchRef.current = sketch;

    if (initialRoute && initialRoute.features && initialRoute.features.length > 0) {
      initialRoute.features.forEach(feature => {
        if (feature.geometry && feature.geometry.type === "polyline") {
          const graphic = new Graphic({
            geometry: new Polyline(feature.geometry),
            symbol: sketch.polylineSymbol,
            attributes: feature.properties || {},
          });
          layer.add(graphic);
        }
      });
      updateTotalDistance(layer);
    }

    sketch.on("create", (event) => {
      if (event.state === "complete") {
        updateTotalDistance(layer);
        sketch.create("polyline");
      }
    });

    sketch.on("update", (event) => {
      if (event.state === "complete") {
        updateTotalDistance(layer);
      }
      if (event.graphics && event.graphics.length > 0) {
        selectedGraphicRef.current = event.graphics[0];
      }
    });

    const handleKeyDown = (e) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        deleteSelected();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    sketch.create("polyline");

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      sketch.destroy();
      sketchRef.current = null;
      view.map.remove(layer);
      layerRef.current = null;
      selectedGraphicRef.current = null;
      setDistance(null);
    };

  }, [view, active, initialRoute]);

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
        {distance ? `Distance: ${distance} km` : "Click on map to start drawing"}
      </span>
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
