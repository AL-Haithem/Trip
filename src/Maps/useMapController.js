import { useState, useEffect } from "react";
import { getMapColors } from "./mapTheme.js";

const OPENFREEMAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";

// Class to handle the heavy map style generation logic
export class MapStyleController {
  constructor(rawStyle, showPOIs) {
    this.rawStyle = rawStyle;
    this.showPOIs = showPOIs;
    this.colors = getMapColors();
  }

  generateStyle() {
    if (!this.rawStyle) return null;

    const newLayers = this.rawStyle.layers.map(layer => {
      // 1. Water
      if (layer.id === "water" || layer.id.includes("waterway")) {
        if (layer.type === "fill") {
          return { ...layer, paint: { ...layer.paint, "fill-color": this.colors.water || this.colors.bg } };
        }
        if (layer.type === "line") {
          return { ...layer, paint: { ...layer.paint, "line-color": this.colors.water || this.colors.bg } };
        }
      }
      
      // 2. Background
      if (layer.id === "background") {
        return { ...layer, paint: { ...layer.paint, "background-color": this.colors.land } };
      }
      
      // 3. Natural Earth
      if (layer.id === "natural_earth") {
        return { ...layer, layout: { ...layer.layout, visibility: "none" } };
      }
      
      // 4. Landcover, parks, etc (Hide them for uniform flat color)
      if (
        layer.id.includes("landcover") || 
        layer.id.includes("landuse") || 
        layer.id.includes("park") || 
        layer.id.includes("aeroway")
      ) {
        return { ...layer, layout: { ...layer.layout, visibility: "none" } };
      }

      // 4b. 3D Buildings
      if (layer.id.includes("building")) {
        if (layer.type === "fill-extrusion") {
          return {
            ...layer,
            paint: {
              ...layer.paint,
              "fill-extrusion-color": "#2c3440", // Dark 3D color
              "fill-extrusion-opacity": 0.8,
            }
          };
        } else if (layer.type === "fill") {
          return {
            ...layer,
            paint: {
              ...layer.paint,
              "fill-color": "#2c3440",
              "fill-opacity": 0.4
            }
          };
        }
        return layer;
      }

      // 5. Borders / Boundaries
      if (layer.id.includes("boundary")) {
        const b = this.colors.borders;
        
        // Use data-driven expressions on "admin_level" since layer IDs are generic
        const colorExpr = [
          "match", ["get", "admin_level"],
          2, b.country.color,
          4, b.state.color,
          b.district.color // Default for 6, 8, etc.
        ];

        const widthExpr = [
          "interpolate", ["linear"], ["zoom"],
          3, ["match", ["get", "admin_level"], 2, b.country.widthMin, 4, b.state.widthMin, b.district.widthMin],
          10, ["match", ["get", "admin_level"], 2, b.country.widthMax, 4, b.state.widthMax, b.district.widthMax]
        ];

        const newPaint = { 
          ...layer.paint, 
          "line-color": colorExpr, 
          "line-width": widthExpr 
        };
        delete newPaint["line-dasharray"];

        const newLayout = { ...layer.layout };
        delete newLayout["line-dasharray"];

        return { ...layer, paint: newPaint, layout: newLayout };
      }

      // 6. Roads and transportation (Always dim them slightly to match theme, no toggle)
      if (
        layer.type === "line" && 
        (
          layer.id.includes("road") || 
          layer.id.includes("tunnel") || 
          layer.id.includes("bridge") || 
          layer.id.includes("highway") ||
          layer.id.includes("transportation") ||
          layer.id.includes("street") ||
          layer.id.includes("rail") ||
          layer.id.includes("path")
        )
      ) {
        return { ...layer, paint: { ...layer.paint, "line-color": "rgba(255, 255, 255, 0.08)" } };
      }

      // POI Toggle Rule (Restaurants, Shops, Stations, etc.)
      if (!this.showPOIs && layer.id.includes("poi")) {
        return { ...layer, layout: { ...layer.layout, visibility: "none" } };
      }

      // 7. Labels and Symbols
      if (layer.type === "symbol") {
        if (
          layer.id.includes("road") ||
          layer.id.includes("highway") ||
          layer.id.includes("transportation") ||
          layer.id.includes("street") ||
          layer.id.includes("shield")
        ) {
          return { ...layer, layout: { ...layer.layout, visibility: "none" } };
        }

        if (layer.paint && layer.paint["text-color"]) {
          const newLayer = { 
            ...layer, 
            paint: { 
              ...layer.paint, 
              "text-color": layer.id.includes("country") || layer.id.includes("state") ? this.colors.countryLabel : this.colors.label,
              "text-halo-color": this.colors.labelHalo,
              "text-halo-width": 1
            } 
          };
        
          if (layer.id.includes("country")) {
            newLayer.maxzoom = 5;
          }
          else if (
            layer.id.includes("state") || 
            layer.id.includes("province") ||
            layer.id.includes("city") ||
            layer.id.includes("town") ||
            layer.id.includes("village") ||
            layer.id.includes("capital")
          ) {
            newLayer.minzoom = 5;
          }
          
          return newLayer;
        }
      }
      
      return layer;
    });

    return { ...this.rawStyle, layers: newLayers };
  }
}

// React Hook that exposes the Controller
export function useMapController() {
  const [rawStyle, setRawStyle] = useState(null);
  const [mapStyle, setMapStyle] = useState(null);
  const [showPOIs, setShowPOIs] = useState(true);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "dark");
    
    fetch(OPENFREEMAP_STYLE)
      .then(res => res.json())
      .then(style => setRawStyle(style))
      .catch(err => {
        console.error("Failed to load map style", err);
        setMapStyle(OPENFREEMAP_STYLE);
      });
  }, []);

  useEffect(() => {
    if (!rawStyle) return;
    
    // Instantiate the class and generate style
    const controller = new MapStyleController(rawStyle, showPOIs);
    setMapStyle(controller.generateStyle());
  }, [rawStyle, showPOIs]);

  return {
    mapStyle,
    showPOIs,
    togglePOIs: () => setShowPOIs(prev => !prev)
  };
}
