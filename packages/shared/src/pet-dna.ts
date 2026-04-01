// ─── Pet DNA: UUID-Seeded Deterministic Trait Generation ────────
// Every pet's appearance is a pure function of its UUID.
// Same UUID = same pet. No extra storage needed.

// ─── Seeded PRNG (splitmix32) ───────────────────────────────────

function splitmix32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x9e3779b9) | 0;
    let t = seed ^ (seed >>> 16);
    t = Math.imul(t, 0x21f0aaad);
    t = t ^ (t >>> 15);
    t = Math.imul(t, 0x735a2d97);
    t = t ^ (t >>> 15);
    return (t >>> 0) / 4294967296; // [0, 1)
  };
}

function seedFromUUID(uuid: string): number {
  const hex = uuid.replace(/-/g, '');
  // Combine all 4 x 32-bit chunks via XOR for a single seed
  let seed = 0;
  for (let i = 0; i < hex.length; i += 8) {
    seed ^= parseInt(hex.slice(i, i + 8), 16);
  }
  return seed;
}

// ─── Trait Option Sets ──────────────────────────────────────────

export const BODY_SHAPES = ['round', 'tall', 'square', 'blob', 'spiky'] as const;
export type BodyShape = (typeof BODY_SHAPES)[number];

export const EYE_SHAPES = ['round', 'narrow', 'wide', 'star', 'dot'] as const;
export type EyeShape = (typeof EYE_SHAPES)[number];

export const MOUTH_SHAPES = ['smile', 'open', 'fangs', 'beak', 'flat'] as const;
export type MouthShape = (typeof MOUTH_SHAPES)[number];

export const EAR_SHAPES = ['pointed', 'round', 'floppy', 'none', 'antenna'] as const;
export type EarShape = (typeof EAR_SHAPES)[number];

export const PATTERNS = ['none', 'spots', 'stripes', 'patches', 'gradient'] as const;
export type Pattern = (typeof PATTERNS)[number];

export const ACCESSORIES = ['none', 'hat', 'bow', 'scarf', 'horn'] as const;
export type Accessory = (typeof ACCESSORIES)[number];

// ─── Pet Traits Interface ───────────────────────────────────────

export interface PetTraits {
  // Body
  bodyShape: BodyShape;
  sizeModifier: number; // 0.85 – 1.15

  // Colors (HSL)
  primaryHue: number; // 0–360
  primarySaturation: number; // 40–90
  primaryLightness: number; // 35–65
  secondaryHue: number; // 0–360
  accentHue: number; // 0–360

  // Face
  eyeShape: EyeShape;
  eyeSize: number; // 0.7 – 1.3
  eyeSpacing: number; // 0.8 – 1.2
  eyeColor: number; // hue 0–360

  mouthShape: MouthShape;

  // Extras
  earShape: EarShape;
  pattern: Pattern;
  accessory: Accessory;

  // Personality modifiers (affect animations)
  bounceSpeed: number; // 0.7 – 1.4
  idleAmplitude: number; // 0.6 – 1.4
}

// ─── Derivation Function ────────────────────────────────────────

function pick<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

function range(rng: () => number, min: number, max: number): number {
  return Math.round((min + rng() * (max - min)) * 100) / 100;
}

export function deriveTraits(uuid: string): PetTraits {
  const seed = seedFromUUID(uuid);
  const rng = splitmix32(seed);

  return {
    bodyShape: pick(rng, BODY_SHAPES),
    sizeModifier: range(rng, 0.85, 1.15),

    primaryHue: Math.floor(rng() * 360),
    primarySaturation: range(rng, 40, 90),
    primaryLightness: range(rng, 35, 65),
    secondaryHue: Math.floor(rng() * 360),
    accentHue: Math.floor(rng() * 360),

    eyeShape: pick(rng, EYE_SHAPES),
    eyeSize: range(rng, 0.7, 1.3),
    eyeSpacing: range(rng, 0.8, 1.2),
    eyeColor: Math.floor(rng() * 360),

    mouthShape: pick(rng, MOUTH_SHAPES),

    earShape: pick(rng, EAR_SHAPES),
    pattern: pick(rng, PATTERNS),
    accessory: pick(rng, ACCESSORIES),

    bounceSpeed: range(rng, 0.7, 1.4),
    idleAmplitude: range(rng, 0.6, 1.4),
  };
}

// ─── Color Helpers ──────────────────────────────────────────────

export function hsl(h: number, s: number, l: number): string {
  return `hsl(${h}, ${s}%, ${l}%)`;
}

export function primaryColor(traits: PetTraits): string {
  return hsl(traits.primaryHue, traits.primarySaturation, traits.primaryLightness);
}

export function secondaryColor(traits: PetTraits): string {
  return hsl(traits.secondaryHue, traits.primarySaturation * 0.7, traits.primaryLightness + 15);
}

export function accentColor(traits: PetTraits): string {
  return hsl(traits.accentHue, 80, 55);
}

export function eyeColorStr(traits: PetTraits): string {
  return hsl(traits.eyeColor, 70, 45);
}
