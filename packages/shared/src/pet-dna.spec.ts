import { describe, it, expect } from 'vitest';
import {
  deriveTraits,
  primaryColor,
  secondaryColor,
  accentColor,
  eyeColorStr,
  BODY_SHAPES,
  EYE_SHAPES,
  MOUTH_SHAPES,
  EAR_SHAPES,
  PATTERNS,
  ACCESSORIES,
} from './pet-dna';

const UUID_A = '550e8400-e29b-41d4-a716-446655440000';
const UUID_B = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
const UUID_C = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

describe('Pet DNA', () => {
  describe('deriveTraits', () => {
    it('should return deterministic traits for the same UUID', () => {
      const traits1 = deriveTraits(UUID_A);
      const traits2 = deriveTraits(UUID_A);
      expect(traits1).toEqual(traits2);
    });

    it('should return different traits for different UUIDs', () => {
      const traitsA = deriveTraits(UUID_A);
      const traitsB = deriveTraits(UUID_B);
      // Extremely unlikely (1/5^6 * continuous) that all discrete traits match
      const allSame =
        traitsA.bodyShape === traitsB.bodyShape &&
        traitsA.eyeShape === traitsB.eyeShape &&
        traitsA.mouthShape === traitsB.mouthShape &&
        traitsA.primaryHue === traitsB.primaryHue;
      expect(allSame).toBe(false);
    });

    it('should produce valid body shape', () => {
      const traits = deriveTraits(UUID_A);
      expect(BODY_SHAPES).toContain(traits.bodyShape);
    });

    it('should produce valid eye shape', () => {
      const traits = deriveTraits(UUID_A);
      expect(EYE_SHAPES).toContain(traits.eyeShape);
    });

    it('should produce valid mouth shape', () => {
      const traits = deriveTraits(UUID_A);
      expect(MOUTH_SHAPES).toContain(traits.mouthShape);
    });

    it('should produce valid ear shape', () => {
      const traits = deriveTraits(UUID_A);
      expect(EAR_SHAPES).toContain(traits.earShape);
    });

    it('should produce valid pattern', () => {
      const traits = deriveTraits(UUID_A);
      expect(PATTERNS).toContain(traits.pattern);
    });

    it('should produce valid accessory', () => {
      const traits = deriveTraits(UUID_A);
      expect(ACCESSORIES).toContain(traits.accessory);
    });

    it('should produce hue in 0-359 range', () => {
      for (const uuid of [UUID_A, UUID_B, UUID_C]) {
        const traits = deriveTraits(uuid);
        expect(traits.primaryHue).toBeGreaterThanOrEqual(0);
        expect(traits.primaryHue).toBeLessThan(360);
        expect(traits.secondaryHue).toBeGreaterThanOrEqual(0);
        expect(traits.secondaryHue).toBeLessThan(360);
        expect(traits.accentHue).toBeGreaterThanOrEqual(0);
        expect(traits.accentHue).toBeLessThan(360);
      }
    });

    it('should produce size modifier in 0.85-1.15 range', () => {
      for (const uuid of [UUID_A, UUID_B, UUID_C]) {
        const traits = deriveTraits(uuid);
        expect(traits.sizeModifier).toBeGreaterThanOrEqual(0.85);
        expect(traits.sizeModifier).toBeLessThanOrEqual(1.15);
      }
    });

    it('should produce eye size in 0.7-1.3 range', () => {
      for (const uuid of [UUID_A, UUID_B, UUID_C]) {
        const traits = deriveTraits(uuid);
        expect(traits.eyeSize).toBeGreaterThanOrEqual(0.7);
        expect(traits.eyeSize).toBeLessThanOrEqual(1.3);
      }
    });

    it('should produce bounce speed in 0.7-1.4 range', () => {
      for (const uuid of [UUID_A, UUID_B, UUID_C]) {
        const traits = deriveTraits(uuid);
        expect(traits.bounceSpeed).toBeGreaterThanOrEqual(0.7);
        expect(traits.bounceSpeed).toBeLessThanOrEqual(1.4);
      }
    });

    it('should be consistent across 100 calls', () => {
      const reference = deriveTraits(UUID_B);
      for (let i = 0; i < 100; i++) {
        expect(deriveTraits(UUID_B)).toEqual(reference);
      }
    });
  });

  describe('color helpers', () => {
    it('should produce valid HSL primary color string', () => {
      const traits = deriveTraits(UUID_A);
      const color = primaryColor(traits);
      expect(color).toMatch(/^hsl\(\d+, \d+(\.\d+)?%, \d+(\.\d+)?%\)$/);
    });

    it('should produce valid HSL secondary color string', () => {
      const traits = deriveTraits(UUID_A);
      const color = secondaryColor(traits);
      expect(color).toMatch(/^hsl\(\d+, \d+(\.\d+)?%, \d+(\.\d+)?%\)$/);
    });

    it('should produce valid HSL accent color string', () => {
      const traits = deriveTraits(UUID_A);
      const color = accentColor(traits);
      expect(color).toMatch(/^hsl\(\d+, \d+%, \d+%\)$/);
    });

    it('should produce valid HSL eye color string', () => {
      const traits = deriveTraits(UUID_A);
      const color = eyeColorStr(traits);
      expect(color).toMatch(/^hsl\(\d+, \d+%, \d+%\)$/);
    });
  });
});
