// Level registry | order here = layer draw order on the map

import { buildLevel_1 } from './levels/Level_1'
import { buildLevel_2 } from './levels/Level_2'
import { buildLevel_3 } from './levels/Level_3'

export function buildAllLayers(colors) {
  const layers = [
    ...buildLevel_1(colors),
    ...buildLevel_2(colors),
    ...buildLevel_3(colors),
  ]

  const labels = layers.filter((layer) => layer.type === 'symbol')
  const mapLayers = layers.filter((layer) => layer.type !== 'symbol')

  return [...mapLayers, ...labels]
}
