export const SUPPORTED_COUNTRIES = [
  {
    code: "DZA",
    label: "Algeria",
    enabled: true,
    bounds: [-8.67, 18.96, 11.99, 37.09],
    center: [2.6, 28],
    zoom: 5,
  },
]

export const ALL_COUNTRIES_CODE = "all"

export function getSupportedCountry(code) {
  return SUPPORTED_COUNTRIES.find((country) => country.code === code && country.enabled)
}
