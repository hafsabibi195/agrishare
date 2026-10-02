import assert from "node:assert/strict";
import test from "node:test";

import { haversineDistanceKm } from "./geo";

test("haversineDistanceKm computes a known short distance", () => {
  const distance = haversineDistanceKm({ lat: 31.5204, lng: 74.3587 }, { lat: 31.4187, lng: 73.0791 });
  assert.ok(distance > 121 && distance < 123, `Expected around 122km, got ${distance}`);
});

test("haversineDistanceKm returns near-zero for same coordinates", () => {
  const distance = haversineDistanceKm({ lat: 30.8, lng: 73.4 }, { lat: 30.8, lng: 73.4 });
  assert.equal(distance, 0);
});
