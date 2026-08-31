import test from 'node:test'
import assert from 'node:assert/strict'
import { pickRoadFeature, getRoadSegmentCoordinates } from './roadSelection.js'

test('pickRoadFeature selects the closest visible road segment', () => {
  const features = [
    {
      id: 'road-a',
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [0, 0],
          [0.01, 0],
          [0.02, 0],
        ],
      },
      properties: { class: 'minor' },
    },
    {
      id: 'road-b',
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [2, 2],
          [2.02, 2],
        ],
      },
      properties: { class: 'major' },
    },
  ]

  const chosen = pickRoadFeature(features, { lng: 0.014, lat: 0.001 }, { previousPoint: { lng: 0, lat: 0 } })
  assert.equal(chosen?.id, 'road-a')
})

test('getRoadSegmentCoordinates returns a continuous segment near the click', () => {
  const feature = {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: [
        [10, 10],
        [10.1, 10],
        [10.2, 10],
      ],
    },
  }

  const coords = getRoadSegmentCoordinates(feature, { lng: 10.12, lat: 10.001 }, { lng: 10, lat: 10 })
  assert.ok(Array.isArray(coords))
  assert.equal(coords.length, 3)
  assert.equal(coords[0].lng, 10)
  assert.equal(coords[2].lng, 10.2)
})
