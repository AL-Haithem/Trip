export const SUPPORTED_COUNTRIES = [
  {
    code: "DZA",
    region: "DZ",
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

export async function detectVisitorCountry() {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), 2500)

  try {
    const response = await fetch("https://ipapi.co/country/", {
      headers: {Accept: "text/plain"},
      signal: controller.signal,
    })
    const code = (await response.text()).trim().toUpperCase()
    const country = SUPPORTED_COUNTRIES.find((item) => item.region === code && item.enabled)
    return country?.code || ALL_COUNTRIES_CODE
  } catch {
    return ALL_COUNTRIES_CODE
  } finally {
    window.clearTimeout(timeout)
  }
}
