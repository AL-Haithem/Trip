export const SUPPORTED_COUNTRIES = [
  {
    code: "DZA",
    label: "Algeria",
    enabled: true,
    bounds: [-8.67, 18.96, 11.99, 37.09],
    center: [1.66, 28.02],
    zoom: 4.9,
  },
]

export const ALL_COUNTRIES_CODE = "all"

export function getSupportedCountry(code) {
  return SUPPORTED_COUNTRIES.find((country) => country.code === code && country.enabled)
}
