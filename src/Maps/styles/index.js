import { buildLevel_0_5 } from './levels/Level_0-5'
import { buildLevel_5_9 } from './levels/Level_5-9'
import { buildLevel_9_13 } from './levels/Level_9-13'
import { buildLevel_13_17 } from './levels/Level_13-17'
import { buildLevel_17_20 } from './levels/Level_17-20'

export function buildAllLayers(colors) {
  return [
    ...buildLevel_0_5(colors),
    ...buildLevel_5_9(colors),
    ...buildLevel_9_13(colors),
    ...buildLevel_13_17(colors),
    ...buildLevel_17_20(colors),
  ]
}
