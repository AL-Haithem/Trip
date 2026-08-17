// Map colors per theme. Kept in sync with the CSS tokens in theme.css.
export function getMapColors(theme) {
  if (theme === "light") {
    return {
      bg: "#e6ccb2",
      land: "#ddb892",
      landOutline: "rgba(127, 85, 57, 0.45)",
      label: "#7f5539",
      labelHalo: "rgba(237, 224, 212, 0.9)",
      countryOutline: "rgba(127, 85, 57, 0.4)",
      countryLabel: "rgba(127, 85, 57, 0.7)",
      pinBg: "#e6ccb2",
      pinInk: "#7f5539",
      pinIcon: "#ede0d4",
      routeIdle: "#9c6644",
    }
  }
  return {
    bg: "#0d1117",
    land: "#3e4e35",
    landOutline: "rgba(0, 0, 0, 0.85)",
    label: "#ffffff",
    labelHalo: "#101114",
    countryOutline: "rgba(255, 255, 255, 0.3)",
    countryLabel: "rgba(255, 255, 255, 0.77)",
    pinBg: "#10241a",
    pinInk: "#7CFFB2",
    pinIcon: "#7CFFB2",
    routeIdle: "#2f7d4a",
  }
}
