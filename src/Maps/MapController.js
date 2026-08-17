export function updateZoom(value, setViewBox) {

  const width = 360 / value
  const height = 180 / value

  setViewBox({

    x: -width / 2,
    y: -height / 2,

    width,
    height
  })
}