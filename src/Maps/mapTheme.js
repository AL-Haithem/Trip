// Map colors per theme. Kept in sync with the CSS tokens in theme.css.
export function getMapColors(theme) {
  if (theme === "light") {
    return {
      bg: "#efe9df",
      land: "#d8e4cf",
      landOutline: "rgba(58, 47, 37, 0.45)",
      label: "#3a2f25",
      labelHalo: "rgba(255, 253, 248, 0.9)",
      countryOutline: "rgba(58, 47, 37, 0.4)",
      countryLabel: "rgba(58, 47, 37, 0.7)",
      pinBg: "#fffdf8",
      pinInk: "#06210b",
      routeIdle: "#2f9d5a",
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
    pinBg: "#0d1117",
    pinInk: "#06210b",
    routeIdle: "#2f7d4a",
  }
}

export default getMapColors
