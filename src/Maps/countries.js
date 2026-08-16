// Supported country overlays.
// Currently only DZA is enabled (data lives in TempFiles).
// To add a country later (or wire to a backend), add an entry here:
//   { code, label, file, enabled }
// The frontend rendering logic stays unchanged.
export const SUPPORTED_COUNTRIES = [
  {code: "DZA", label: "Algeria", file: "/TempFiles/DZA.json", enabled: true},
]
