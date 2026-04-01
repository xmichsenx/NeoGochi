'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { PetState } from '@neogochi/shared';
import {
  deriveTraits,
  primaryColor,
  secondaryColor,
  accentColor,
  eyeColorStr,
} from '@neogochi/shared';
import type { PetTraits } from '@neogochi/shared';

interface PetSpriteProps {
  petId: string;
  state: PetState;
  name: string;
  level: number;
}

// ─── State-based animations ─────────────────────────────────────

function getStateAnimation(state: PetState, traits: PetTraits): object {
  const speed = traits.bounceSpeed;
  const amp = traits.idleAmplitude;

  switch (state) {
    case 'Idle':
      return {
        y: [0, -4 * amp, 0],
        transition: { repeat: Infinity, duration: 2 / speed, ease: 'easeInOut' },
      };
    case 'Eating':
      return {
        scale: [1, 1.06, 1],
        transition: { repeat: Infinity, duration: 0.5 / speed },
      };
    case 'Playing':
      return {
        rotate: [-6 * amp, 6 * amp, -6 * amp],
        transition: { repeat: Infinity, duration: 0.3 / speed },
      };
    case 'Sleeping':
      return {
        opacity: [1, 0.65, 1],
        transition: { repeat: Infinity, duration: 3 / speed, ease: 'easeInOut' },
      };
    case 'Sick':
      return {
        x: [-2, 2, -2],
        transition: { repeat: Infinity, duration: 0.2 },
      };
    case 'Evolution':
      return {
        scale: [1, 1.3, 1],
        rotate: [0, 360],
        transition: { duration: 1 },
      };
    case 'Dead':
      return { opacity: 0.3, rotate: 90 };
    default:
      return {};
  }
}

// ─── SVG Body Paths ─────────────────────────────────────────────

function bodyPath(shape: PetTraits['bodyShape']): string {
  switch (shape) {
    case 'round':
      return 'M50,15 C75,15 85,30 85,50 C85,75 70,88 50,88 C30,88 15,75 15,50 C15,30 25,15 50,15Z';
    case 'tall':
      return 'M50,10 C70,10 78,25 78,40 C78,70 68,90 50,90 C32,90 22,70 22,40 C22,25 30,10 50,10Z';
    case 'square':
      return 'M22,20 C22,16 26,14 30,14 L70,14 C74,14 78,16 78,20 L78,75 C78,82 74,86 70,86 L30,86 C26,86 22,82 22,75Z';
    case 'blob':
      return 'M50,12 C72,12 88,28 86,50 C84,72 72,90 50,88 C28,86 12,72 14,50 C16,28 28,12 50,12Z';
    case 'spiky':
      return 'M50,8 L60,22 L80,18 L72,36 L90,45 L74,55 L82,75 L62,72 L50,92 L38,72 L18,75 L26,55 L10,45 L28,36 L20,18 L40,22Z';
    default:
      return 'M50,15 C75,15 85,35 85,55 C85,78 70,88 50,88 C30,88 15,78 15,55 C15,35 25,15 50,15Z';
  }
}

// ─── SVG Eye Renderers ──────────────────────────────────────────

function renderEyes(traits: PetTraits, state: PetState): JSX.Element {
  const spacing = 12 * traits.eyeSpacing;
  const size = 5 * traits.eyeSize;
  const cx1 = 50 - spacing;
  const cx2 = 50 + spacing;
  const cy = 42;
  const color = eyeColorStr(traits);

  if (state === 'Sleeping') {
    return (
      <g>
        <line
          x1={cx1 - size}
          y1={cy}
          x2={cx1 + size}
          y2={cy}
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1={cx2 - size}
          y1={cy}
          x2={cx2 + size}
          y2={cy}
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </g>
    );
  }

  if (state === 'Dead') {
    return (
      <g>
        <text x={cx1} y={cy + 3} textAnchor="middle" fontSize="10" fill={color}>
          ×
        </text>
        <text x={cx2} y={cy + 3} textAnchor="middle" fontSize="10" fill={color}>
          ×
        </text>
      </g>
    );
  }

  switch (traits.eyeShape) {
    case 'round':
      return (
        <g>
          <circle cx={cx1} cy={cy} r={size} fill="white" />
          <circle cx={cx1 + 1} cy={cy} r={size * 0.55} fill={color} />
          <circle cx={cx1 + 1.5} cy={cy - 1} r={size * 0.2} fill="white" />
          <circle cx={cx2} cy={cy} r={size} fill="white" />
          <circle cx={cx2 + 1} cy={cy} r={size * 0.55} fill={color} />
          <circle cx={cx2 + 1.5} cy={cy - 1} r={size * 0.2} fill="white" />
        </g>
      );
    case 'narrow':
      return (
        <g>
          <ellipse cx={cx1} cy={cy} rx={size} ry={size * 0.5} fill="white" />
          <circle cx={cx1} cy={cy} r={size * 0.35} fill={color} />
          <ellipse cx={cx2} cy={cy} rx={size} ry={size * 0.5} fill="white" />
          <circle cx={cx2} cy={cy} r={size * 0.35} fill={color} />
        </g>
      );
    case 'wide':
      return (
        <g>
          <ellipse cx={cx1} cy={cy} rx={size * 1.2} ry={size * 0.9} fill="white" />
          <circle cx={cx1} cy={cy} r={size * 0.45} fill={color} />
          <circle cx={cx1 + 1} cy={cy - 1} r={size * 0.15} fill="white" />
          <ellipse cx={cx2} cy={cy} rx={size * 1.2} ry={size * 0.9} fill="white" />
          <circle cx={cx2} cy={cy} r={size * 0.45} fill={color} />
          <circle cx={cx2 + 1} cy={cy - 1} r={size * 0.15} fill="white" />
        </g>
      );
    case 'star':
      return (
        <g>
          <polygon points={starPoints(cx1, cy, size * 0.8, size * 0.4, 5)} fill="white" />
          <circle cx={cx1} cy={cy} r={size * 0.35} fill={color} />
          <polygon points={starPoints(cx2, cy, size * 0.8, size * 0.4, 5)} fill="white" />
          <circle cx={cx2} cy={cy} r={size * 0.35} fill={color} />
        </g>
      );
    case 'dot':
      return (
        <g>
          <circle cx={cx1} cy={cy} r={size * 0.5} fill={color} />
          <circle cx={cx2} cy={cy} r={size * 0.5} fill={color} />
        </g>
      );
    default:
      return (
        <g>
          <circle cx={cx1} cy={cy} r={size} fill="white" />
          <circle cx={cx1} cy={cy} r={size * 0.5} fill={color} />
          <circle cx={cx2} cy={cy} r={size} fill="white" />
          <circle cx={cx2} cy={cy} r={size * 0.5} fill={color} />
        </g>
      );
  }
}

function starPoints(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  points: number,
): string {
  const result: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (Math.PI / points) * i - Math.PI / 2;
    result.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
  }
  return result.join(' ');
}

// ─── SVG Mouth Renderers ────────────────────────────────────────

function renderMouth(traits: PetTraits, state: PetState): JSX.Element {
  const cy = 58;
  const accent = accentColor(traits);

  if (state === 'Eating') {
    return <ellipse cx="50" cy={cy} rx="6" ry="5" fill={accent} />;
  }
  if (state === 'Sick') {
    return (
      <path
        d={`M42,${cy + 2} Q50,${cy - 3} 58,${cy + 2}`}
        stroke={accent}
        strokeWidth="1.5"
        fill="none"
      />
    );
  }

  switch (traits.mouthShape) {
    case 'smile':
      return (
        <path
          d={`M42,${cy} Q50,${cy + 7} 58,${cy}`}
          stroke={accent}
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
      );
    case 'open':
      return <ellipse cx="50" cy={cy + 2} rx="5" ry="4" fill={accent} />;
    case 'fangs':
      return (
        <g>
          <path
            d={`M42,${cy} Q50,${cy + 5} 58,${cy}`}
            stroke={accent}
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
          <polygon points={`45,${cy} 43,${cy + 5} 47,${cy}`} fill="white" />
          <polygon points={`53,${cy} 55,${cy + 5} 57,${cy}`} fill="white" />
        </g>
      );
    case 'beak':
      return <polygon points={`46,${cy - 1} 50,${cy + 5} 54,${cy - 1}`} fill={accent} />;
    case 'flat':
      return (
        <line
          x1="44"
          y1={cy + 1}
          x2="56"
          y2={cy + 1}
          stroke={accent}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      );
    default:
      return (
        <path
          d={`M42,${cy} Q50,${cy + 6} 58,${cy}`}
          stroke={accent}
          strokeWidth="1.5"
          fill="none"
        />
      );
  }
}

// ─── SVG Ear Renderers ──────────────────────────────────────────

function renderEars(traits: PetTraits): JSX.Element {
  const color = secondaryColor(traits);

  switch (traits.earShape) {
    case 'pointed':
      return (
        <g>
          <polygon points="25,25 18,5 35,20" fill={color} />
          <polygon points="75,25 82,5 65,20" fill={color} />
        </g>
      );
    case 'round':
      return (
        <g>
          <circle cx="22" cy="22" r="9" fill={color} />
          <circle cx="78" cy="22" r="9" fill={color} />
        </g>
      );
    case 'floppy':
      return (
        <g>
          <ellipse cx="18" cy="35" rx="8" ry="14" fill={color} transform="rotate(-15, 18, 35)" />
          <ellipse cx="82" cy="35" rx="8" ry="14" fill={color} transform="rotate(15, 82, 35)" />
        </g>
      );
    case 'antenna':
      return (
        <g>
          <line x1="38" y1="18" x2="32" y2="2" stroke={color} strokeWidth="2" />
          <circle cx="32" cy="2" r="3" fill={accentColor(traits)} />
          <line x1="62" y1="18" x2="68" y2="2" stroke={color} strokeWidth="2" />
          <circle cx="68" cy="2" r="3" fill={accentColor(traits)} />
        </g>
      );
    case 'none':
    default:
      return <></>;
  }
}

// ─── SVG Pattern Overlays ───────────────────────────────────────

function renderPattern(traits: PetTraits): JSX.Element {
  const color = secondaryColor(traits);

  switch (traits.pattern) {
    case 'spots':
      return (
        <g opacity="0.3">
          <circle cx="35" cy="35" r="4" fill={color} />
          <circle cx="60" cy="50" r="3" fill={color} />
          <circle cx="42" cy="65" r="3.5" fill={color} />
          <circle cx="65" cy="32" r="2.5" fill={color} />
        </g>
      );
    case 'stripes':
      return (
        <g opacity="0.2" stroke={color} strokeWidth="3" strokeLinecap="round">
          <line x1="32" y1="30" x2="68" y2="30" />
          <line x1="28" y1="45" x2="72" y2="45" />
          <line x1="30" y1="60" x2="70" y2="60" />
        </g>
      );
    case 'patches':
      return (
        <g opacity="0.25">
          <ellipse cx="38" cy="55" rx="10" ry="8" fill={color} />
          <ellipse cx="62" cy="35" rx="8" ry="6" fill={color} />
        </g>
      );
    case 'gradient':
      return <rect x="15" y="50" width="70" height="40" fill={color} opacity="0.15" rx="10" />;
    case 'none':
    default:
      return <></>;
  }
}

// ─── SVG Accessory Renderers ────────────────────────────────────

function renderAccessory(traits: PetTraits, level: number): JSX.Element {
  // Accessories unlock at level 5+
  if (level < 5 || traits.accessory === 'none') return <></>;

  const color = accentColor(traits);

  switch (traits.accessory) {
    case 'hat':
      return (
        <g>
          <rect x="35" y="6" width="30" height="14" rx="3" fill={color} />
          <rect x="28" y="18" width="44" height="5" rx="2" fill={color} />
        </g>
      );
    case 'bow':
      return (
        <g>
          <polygon points="50,12 42,6 42,18" fill={color} />
          <polygon points="50,12 58,6 58,18" fill={color} />
          <circle cx="50" cy="12" r="2.5" fill={secondaryColor(traits)} />
        </g>
      );
    case 'scarf':
      return (
        <g>
          <rect x="20" y="76" width="60" height="6" rx="2" fill={color} />
          <rect x="60" y="76" width="8" height="14" rx="2" fill={color} />
        </g>
      );
    case 'horn':
      return <polygon points="50,4 45,18 55,18" fill={color} />;
    default:
      return <></>;
  }
}

// ─── Sleeping ZZZ ───────────────────────────────────────────────

function renderStateOverlay(state: PetState): JSX.Element {
  switch (state) {
    case 'Sleeping':
      return (
        <g className="sleeping-zzz" fill="none" stroke="#a0a0c0" strokeWidth="1">
          <text x="72" y="20" fontSize="8" fill="#a0a0c0" opacity="0.6">
            z
          </text>
          <text x="78" y="12" fontSize="10" fill="#a0a0c0" opacity="0.4">
            z
          </text>
          <text x="85" y="5" fontSize="12" fill="#a0a0c0" opacity="0.2">
            z
          </text>
        </g>
      );
    case 'Sick':
      return (
        <g>
          <text x="74" y="22" fontSize="14">
            🤢
          </text>
        </g>
      );
    case 'Evolution':
      return (
        <g>
          <text x="10" y="20" fontSize="10">
            ✨
          </text>
          <text x="78" y="80" fontSize="10">
            ✨
          </text>
          <text x="14" y="75" fontSize="8">
            ⭐
          </text>
        </g>
      );
    default:
      return <></>;
  }
}

// ─── Blush (appears when happiness > 80) ────────────────────────

function renderCheeks(traits: PetTraits): JSX.Element {
  return (
    <g opacity="0.25">
      <ellipse cx={50 - 12 * traits.eyeSpacing - 2} cy="52" rx="5" ry="3" fill="hsl(0, 70%, 65%)" />
      <ellipse cx={50 + 12 * traits.eyeSpacing + 2} cy="52" rx="5" ry="3" fill="hsl(0, 70%, 65%)" />
    </g>
  );
}

// ─── Main Component ─────────────────────────────────────────────

export function PetSprite({ petId, state, name, level }: PetSpriteProps) {
  const traits = useMemo(() => deriveTraits(petId), [petId]);
  const animation = useMemo(() => getStateAnimation(state, traits), [state, traits]);
  const scale = traits.sizeModifier;

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div animate={animation} key={state} className="select-none">
        <svg
          width={120 * scale}
          height={120 * scale}
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
          style={{ overflow: 'visible' }}
        >
          {/* Ears (behind body) */}
          {renderEars(traits)}

          {/* Body */}
          <path d={bodyPath(traits.bodyShape)} fill={primaryColor(traits)} />

          {/* Pattern overlay */}
          <clipPath id={`body-clip-${petId.slice(0, 8)}`}>
            <path d={bodyPath(traits.bodyShape)} />
          </clipPath>
          <g clipPath={`url(#body-clip-${petId.slice(0, 8)})`}>{renderPattern(traits)}</g>

          {/* Face */}
          {renderEyes(traits, state)}
          {renderMouth(traits, state)}
          {renderCheeks(traits)}

          {/* Accessory */}
          {renderAccessory(traits, level)}

          {/* State overlay effects */}
          {renderStateOverlay(state)}
        </svg>
      </motion.div>
      <p className="text-neogochi-muted text-xs">{name}</p>
      <p className="text-neogochi-accent text-[10px] uppercase tracking-wider">{state}</p>
    </div>
  );
}
