'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { TargetAndTransition } from 'framer-motion';
import type { PetState, PetStats } from '@neogochi/shared';
import {
  deriveTraits,
  primaryColor,
  secondaryColor,
  accentColor,
  eyeColorStr,
} from '@neogochi/shared';
import type { PetTraits } from '@neogochi/shared';

export type ActiveAction = 'feed' | 'play' | 'clean' | null;

interface PetSpriteProps {
  petId: string;
  state: PetState;
  name: string;
  level: number;
  stats?: PetStats;
  activeAction?: ActiveAction;
}

// ─── Action to display state mapping ────────────────────────────

function actionToDisplayState(action: ActiveAction): PetState | null {
  switch (action) {
    case 'feed':
      return 'Eating';
    case 'play':
      return 'Playing';
    case 'clean':
      return null; // Clean has its own animation, not a PetState
    default:
      return null;
  }
}

// ─── State-based animations ─────────────────────────────────────

function getStateAnimation(
  state: PetState,
  traits: PetTraits,
  activeAction?: ActiveAction,
): TargetAndTransition {
  const speed = traits.bounceSpeed;
  const amp = traits.idleAmplitude;

  // Active action overrides state for animation
  const displayState = activeAction ? actionToDisplayState(activeAction) : null;
  const effectiveState = displayState ?? state;

  // Clean action has its own unique animation (not a PetState)
  if (activeAction === 'clean') {
    return {
      scale: [1, 1.04, 0.98, 1.02, 1],
      rotate: [0, -3, 3, -2, 0],
      transition: { repeat: Infinity, duration: 0.7 / speed, ease: 'easeInOut' },
    };
  }

  switch (effectiveState) {
    case 'Idle':
      return {
        y: [0, -6 * amp, 0],
        transition: { repeat: Infinity, duration: 2.2 / speed, ease: 'easeInOut' },
      };
    case 'Eating':
      return {
        scale: [1, 1.08, 0.96, 1.04, 1],
        y: [0, 2, -1, 1, 0],
        transition: { repeat: Infinity, duration: 0.6 / speed, ease: 'easeInOut' },
      };
    case 'Playing':
      return {
        rotate: [-8 * amp, 8 * amp, -8 * amp],
        y: [0, -12 * amp, 0, -8 * amp, 0],
        scale: [1, 1.05, 1, 1.03, 1],
        transition: { repeat: Infinity, duration: 0.5 / speed, ease: 'easeInOut' },
      };
    case 'Sleeping':
      return {
        y: [0, 2, 0],
        scale: [1, 1.02, 1],
        transition: { repeat: Infinity, duration: 3 / speed, ease: 'easeInOut' },
      };
    case 'Sick':
      return {
        x: [-3, 3, -2, 2, -1, 0],
        rotate: [-2, 2, -1, 1, 0],
        transition: { repeat: Infinity, duration: 0.8, ease: 'easeInOut' },
      };
    case 'Evolution':
      return {
        scale: [1, 1.1, 0.9, 1.3, 1],
        rotate: [0, 90, 180, 270, 360],
        transition: { duration: 1.5, ease: 'easeInOut' },
      };
    case 'Dead':
      return { opacity: 0.3, rotate: 90, y: 10 };
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

function renderEyes(traits: PetTraits, state: PetState, stats?: PetStats): JSX.Element {
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

  // Drowsy half-closed eyelids when energy is low
  const tired = stats && stats.energy < 30;
  // Sad droopy eyes when happiness is low
  const sad = stats && stats.happiness < 30;

  const eyeElements = renderEyeShape(traits, cx1, cx2, cy, size, color);

  return (
    <g>
      {/* Eyes with blinking in idle/playing states */}
      <g className={state === 'Idle' || state === 'Playing' ? 'pet-blink' : ''}>{eyeElements}</g>

      {/* Drowsy eyelids for low energy */}
      {tired && state !== 'Sick' && (
        <g className="drowsy-lids">
          <rect
            x={cx1 - size - 1}
            y={cy - size - 1}
            width={(size + 1) * 2}
            height={size * 1.2}
            fill={primaryColor(traits)}
            rx="2"
          >
            <animate
              attributeName="height"
              values={`${size * 0.6};${size * 1.0};${size * 0.6}`}
              dur="2.5s"
              repeatCount="indefinite"
            />
          </rect>
          <rect
            x={cx2 - size - 1}
            y={cy - size - 1}
            width={(size + 1) * 2}
            height={size * 1.2}
            fill={primaryColor(traits)}
            rx="2"
          >
            <animate
              attributeName="height"
              values={`${size * 0.6};${size * 1.0};${size * 0.6}`}
              dur="2.5s"
              repeatCount="indefinite"
            />
          </rect>
        </g>
      )}

      {/* Sad tear drops */}
      {sad && (
        <g>
          <ellipse cx={cx1 + size * 0.3} cy={cy + size + 2} rx="1.5" ry="2" fill="#5bc0eb">
            <animate
              attributeName="cy"
              values={`${cy + size + 2};${cy + size + 12};${cy + size + 2}`}
              dur="1.8s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.8;0;0.8"
              dur="1.8s"
              repeatCount="indefinite"
            />
          </ellipse>
          <ellipse cx={cx2 + size * 0.3} cy={cy + size + 2} rx="1.5" ry="2" fill="#5bc0eb">
            <animate
              attributeName="cy"
              values={`${cy + size + 2};${cy + size + 12};${cy + size + 2}`}
              dur="2.2s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.8;0;0.8"
              dur="2.2s"
              repeatCount="indefinite"
            />
          </ellipse>
        </g>
      )}
    </g>
  );
}

// ─── Eye shape renderer (extracted for blink wrapping) ──────────

function renderEyeShape(
  traits: PetTraits,
  cx1: number,
  cx2: number,
  cy: number,
  size: number,
  color: string,
): JSX.Element {
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

// ─── Action Overlay Effects ─────────────────────────────────────

function renderActionOverlay(actionState: 'Eating' | 'Playing'): JSX.Element {
  if (actionState === 'Eating') {
    return (
      <g>
        {/* Food particles flying out */}
        <circle cx="40" cy="56" r="1.5" fill="#f59e0b">
          <animate attributeName="cx" values="40;28;20" dur="0.8s" repeatCount="indefinite" />
          <animate attributeName="cy" values="56;48;44" dur="0.8s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="1;0.5;0" dur="0.8s" repeatCount="indefinite" />
        </circle>
        <circle cx="60" cy="56" r="1.2" fill="#f59e0b">
          <animate attributeName="cx" values="60;72;80" dur="0.7s" repeatCount="indefinite" />
          <animate attributeName="cy" values="56;50;46" dur="0.7s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="1;0.5;0" dur="0.7s" repeatCount="indefinite" />
        </circle>
        <circle cx="50" cy="54" r="1" fill="#fbbf24">
          <animate attributeName="cy" values="54;42;36" dur="0.9s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.8;0.3;0" dur="0.9s" repeatCount="indefinite" />
        </circle>
      </g>
    );
  }
  // Playing
  return (
    <g>
      {/* Sparkle stars */}
      <text x="8" y="20" fontSize="8">
        ⭐
        <animate attributeName="opacity" values="0;1;0" dur="1.2s" repeatCount="indefinite" />
      </text>
      <text x="82" y="30" fontSize="6">
        ✨
        <animate attributeName="opacity" values="0;1;0" dur="0.9s" repeatCount="indefinite" />
      </text>
      <text x="15" y="75" fontSize="7">
        ✨
        <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite" />
      </text>
      <text x="78" y="80" fontSize="5">
        ⭐
        <animate attributeName="opacity" values="0;1;0" dur="1.1s" repeatCount="indefinite" />
      </text>
      {/* Motion lines */}
      <line x1="10" y1="45" x2="5" y2="45" stroke="#888" strokeWidth="1" strokeLinecap="round">
        <animate attributeName="opacity" values="0;0.5;0" dur="0.4s" repeatCount="indefinite" />
      </line>
      <line x1="90" y1="50" x2="95" y2="50" stroke="#888" strokeWidth="1" strokeLinecap="round">
        <animate attributeName="opacity" values="0;0.5;0" dur="0.5s" repeatCount="indefinite" />
      </line>
    </g>
  );
}

function renderCleanOverlay(): JSX.Element {
  return (
    <g>
      {/* Rising soap bubbles */}
      <circle cx="30" cy="70" r="3" fill="none" stroke="#06b6d4" strokeWidth="0.5" opacity="0.6">
        <animate attributeName="cy" values="70;20;70" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.6;0;0.6" dur="2s" repeatCount="indefinite" />
        <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="55" cy="75" r="2.5" fill="none" stroke="#06b6d4" strokeWidth="0.5" opacity="0.5">
        <animate attributeName="cy" values="75;15;75" dur="2.4s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.5;0;0.5" dur="2.4s" repeatCount="indefinite" />
        <animate attributeName="r" values="2.5;4;2.5" dur="2.4s" repeatCount="indefinite" />
      </circle>
      <circle cx="70" cy="65" r="2" fill="none" stroke="#38bdf8" strokeWidth="0.5" opacity="0.4">
        <animate attributeName="cy" values="65;10;65" dur="1.8s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.4;0;0.4" dur="1.8s" repeatCount="indefinite" />
        <animate attributeName="r" values="2;3.5;2" dur="1.8s" repeatCount="indefinite" />
      </circle>
      <circle cx="42" cy="80" r="2" fill="none" stroke="#22d3ee" strokeWidth="0.5" opacity="0.5">
        <animate attributeName="cy" values="80;25;80" dur="2.6s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.5;0;0.5" dur="2.6s" repeatCount="indefinite" />
        <animate attributeName="r" values="2;4.5;2" dur="2.6s" repeatCount="indefinite" />
      </circle>
      {/* Sparkle shimmer */}
      <text x="20" y="35" fontSize="8">
        ✨
        <animate attributeName="opacity" values="0;0.8;0" dur="1s" repeatCount="indefinite" />
      </text>
      <text x="72" y="55" fontSize="6">
        ✨
        <animate attributeName="opacity" values="0;0.7;0" dur="1.3s" repeatCount="indefinite" />
      </text>
    </g>
  );
}

// ─── State Overlay Effects ──────────────────────────────────────

function renderStateOverlay(state: PetState, activeAction?: ActiveAction): JSX.Element {
  // Active action overlays take priority
  if (activeAction === 'feed') {
    return renderActionOverlay('Eating');
  }
  if (activeAction === 'play') {
    return renderActionOverlay('Playing');
  }
  if (activeAction === 'clean') {
    return renderCleanOverlay();
  }

  switch (state) {
    case 'Sleeping':
      return (
        <g>
          {/* Floating ZZZs with staggered animation */}
          <text x="72" y="20" fontSize="8" fill="#a0a0c0">
            z
            <animate attributeName="y" values="20;10;20" dur="2.5s" repeatCount="indefinite" />
            <animate
              attributeName="opacity"
              values="0.7;0.1;0.7"
              dur="2.5s"
              repeatCount="indefinite"
            />
          </text>
          <text x="80" y="14" fontSize="11" fill="#a0a0c0">
            z
            <animate attributeName="y" values="14;2;14" dur="3s" repeatCount="indefinite" />
            <animate
              attributeName="opacity"
              values="0.5;0.05;0.5"
              dur="3s"
              repeatCount="indefinite"
            />
          </text>
          <text x="87" y="8" fontSize="14" fill="#a0a0c0">
            z
            <animate attributeName="y" values="8;-6;8" dur="3.5s" repeatCount="indefinite" />
            <animate
              attributeName="opacity"
              values="0.3;0.02;0.3"
              dur="3.5s"
              repeatCount="indefinite"
            />
          </text>
          {/* Moon */}
          <circle cx="88" cy="-5" r="5" fill="#f0e68c" opacity="0.3">
            <animate
              attributeName="opacity"
              values="0.2;0.4;0.2"
              dur="4s"
              repeatCount="indefinite"
            />
          </circle>
        </g>
      );
    case 'Eating':
      return (
        <g>
          {/* Food particles flying out */}
          <circle cx="40" cy="56" r="1.5" fill="#f59e0b">
            <animate attributeName="cx" values="40;28;20" dur="0.8s" repeatCount="indefinite" />
            <animate attributeName="cy" values="56;48;44" dur="0.8s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0.5;0" dur="0.8s" repeatCount="indefinite" />
          </circle>
          <circle cx="60" cy="56" r="1.2" fill="#f59e0b">
            <animate attributeName="cx" values="60;72;80" dur="0.7s" repeatCount="indefinite" />
            <animate attributeName="cy" values="56;50;46" dur="0.7s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0.5;0" dur="0.7s" repeatCount="indefinite" />
          </circle>
          <circle cx="50" cy="54" r="1" fill="#fbbf24">
            <animate attributeName="cy" values="54;42;36" dur="0.9s" repeatCount="indefinite" />
            <animate
              attributeName="opacity"
              values="0.8;0.3;0"
              dur="0.9s"
              repeatCount="indefinite"
            />
          </circle>
        </g>
      );
    case 'Playing':
      return (
        <g>
          {/* Sparkle stars around the pet */}
          <text x="8" y="20" fontSize="8">
            ⭐
            <animate attributeName="opacity" values="0;1;0" dur="1.2s" repeatCount="indefinite" />
          </text>
          <text x="82" y="30" fontSize="6">
            ✨
            <animate attributeName="opacity" values="0;1;0" dur="0.9s" repeatCount="indefinite" />
          </text>
          <text x="15" y="75" fontSize="7">
            ✨
            <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite" />
          </text>
          <text x="78" y="80" fontSize="5">
            ⭐
            <animate attributeName="opacity" values="0;1;0" dur="1.1s" repeatCount="indefinite" />
          </text>
          {/* Motion lines */}
          <line x1="10" y1="45" x2="5" y2="45" stroke="#888" strokeWidth="1" strokeLinecap="round">
            <animate attributeName="opacity" values="0;0.5;0" dur="0.4s" repeatCount="indefinite" />
          </line>
          <line x1="90" y1="50" x2="95" y2="50" stroke="#888" strokeWidth="1" strokeLinecap="round">
            <animate attributeName="opacity" values="0;0.5;0" dur="0.5s" repeatCount="indefinite" />
          </line>
        </g>
      );
    case 'Sick':
      return (
        <g>
          {/* Sweat drops */}
          <ellipse cx="26" cy="28" rx="1.5" ry="2.5" fill="#5bc0eb" opacity="0.6">
            <animate attributeName="cy" values="28;36;28" dur="1.5s" repeatCount="indefinite" />
            <animate
              attributeName="opacity"
              values="0.6;0;0.6"
              dur="1.5s"
              repeatCount="indefinite"
            />
          </ellipse>
          <ellipse cx="76" cy="32" rx="1.2" ry="2" fill="#5bc0eb" opacity="0.5">
            <animate attributeName="cy" values="32;40;32" dur="1.8s" repeatCount="indefinite" />
            <animate
              attributeName="opacity"
              values="0.5;0;0.5"
              dur="1.8s"
              repeatCount="indefinite"
            />
          </ellipse>
          {/* Nausea swirl */}
          <text x="74" y="22" fontSize="12">
            🤢
            <animate
              attributeName="opacity"
              values="0.6;1;0.6"
              dur="1.2s"
              repeatCount="indefinite"
            />
          </text>
          {/* Dizzy spiral */}
          <circle
            cx="82"
            cy="40"
            r="4"
            fill="none"
            stroke="#9ca3af"
            strokeWidth="0.8"
            strokeDasharray="2 2"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="0 82 40;360 82 40"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>
        </g>
      );
    case 'Evolution':
      return (
        <g>
          {/* Rainbow glow ring */}
          <circle cx="50" cy="50" r="45" fill="none" strokeWidth="2">
            <animate
              attributeName="stroke"
              values="#ff0000;#ff8800;#ffff00;#00ff00;#0088ff;#8800ff;#ff0000"
              dur="2s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.3;0.8;0.3"
              dur="1s"
              repeatCount="indefinite"
            />
            <animate attributeName="r" values="42;48;42" dur="1.5s" repeatCount="indefinite" />
          </circle>
          {/* Sparkle burst */}
          <text x="5" y="15" fontSize="10">
            ✨<animate attributeName="opacity" values="0;1;0" dur="0.6s" repeatCount="indefinite" />
          </text>
          <text x="80" y="10" fontSize="12">
            ⭐<animate attributeName="opacity" values="0;1;0" dur="0.8s" repeatCount="indefinite" />
          </text>
          <text x="85" y="85" fontSize="9">
            ✨<animate attributeName="opacity" values="0;1;0" dur="0.7s" repeatCount="indefinite" />
          </text>
          <text x="8" y="80" fontSize="11">
            ⭐<animate attributeName="opacity" values="0;1;0" dur="0.9s" repeatCount="indefinite" />
          </text>
          {/* Rising particles */}
          <circle cx="30" cy="90" r="2" fill="#fbbf24">
            <animate attributeName="cy" values="90;10" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0" dur="1.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="70" cy="85" r="1.5" fill="#f472b6">
            <animate attributeName="cy" values="85;5" dur="1.8s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0" dur="1.8s" repeatCount="indefinite" />
          </circle>
          <circle cx="50" cy="92" r="1.8" fill="#38bdf8">
            <animate attributeName="cy" values="92;8" dur="1.3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0" dur="1.3s" repeatCount="indefinite" />
          </circle>
        </g>
      );
    case 'Dead':
      return (
        <g>
          {/* Ghost rising */}
          <g opacity="0.2">
            <ellipse cx="50" cy="30" rx="12" ry="15" fill="white">
              <animate attributeName="cy" values="30;15;30" dur="4s" repeatCount="indefinite" />
              <animate
                attributeName="opacity"
                values="0.15;0.3;0.15"
                dur="4s"
                repeatCount="indefinite"
              />
            </ellipse>
            <circle cx="46" cy="26" r="1.5" fill="#666">
              <animate attributeName="cy" values="26;11;26" dur="4s" repeatCount="indefinite" />
            </circle>
            <circle cx="54" cy="26" r="1.5" fill="#666">
              <animate attributeName="cy" values="26;11;26" dur="4s" repeatCount="indefinite" />
            </circle>
          </g>
          {/* Halo */}
          <ellipse
            cx="50"
            cy="5"
            rx="10"
            ry="3"
            fill="none"
            stroke="#fbbf24"
            strokeWidth="1"
            opacity="0.3"
          >
            <animate
              attributeName="opacity"
              values="0.2;0.4;0.2"
              dur="3s"
              repeatCount="indefinite"
            />
          </ellipse>
        </g>
      );
    default:
      return <></>;
  }
}

// ─── Low-Stat Visual Indicators ─────────────────────────────────

function renderStatIndicators(stats: PetStats | undefined, traits: PetTraits): JSX.Element {
  if (!stats) return <></>;

  return (
    <g>
      {/* Hungry: drool + rumbling belly */}
      {stats.hunger < 30 && (
        <g>
          {/* Drool drop */}
          <ellipse cx="53" cy="64" rx="1.5" ry="2" fill="white" opacity="0.7">
            <animate attributeName="cy" values="64;72;64" dur="1.6s" repeatCount="indefinite" />
            <animate
              attributeName="opacity"
              values="0.7;0;0.7"
              dur="1.6s"
              repeatCount="indefinite"
            />
          </ellipse>
          {/* Thought bubble with food */}
          <circle
            cx="72"
            cy="18"
            r="8"
            fill="white"
            opacity="0.15"
            stroke="#aaa"
            strokeWidth="0.5"
          />
          <text x="72" y="21" textAnchor="middle" fontSize="8">
            🍖
          </text>
          <circle cx="64" cy="28" r="2" fill="white" opacity="0.12" />
          <circle cx="60" cy="33" r="1.2" fill="white" opacity="0.1" />
        </g>
      )}

      {/* Dirty: stink lines + flies */}
      {stats.cleanliness < 30 && (
        <g>
          {/* Wavy stink lines */}
          <path
            d="M30,8 Q33,4 36,8 Q39,12 42,8"
            fill="none"
            stroke="#8b9a46"
            strokeWidth="0.8"
            opacity="0.4"
          >
            <animate
              attributeName="opacity"
              values="0.2;0.5;0.2"
              dur="1.5s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="d"
              values="M30,8 Q33,4 36,8 Q39,12 42,8;M30,6 Q33,10 36,6 Q39,2 42,6;M30,8 Q33,4 36,8 Q39,12 42,8"
              dur="1.5s"
              repeatCount="indefinite"
            />
          </path>
          <path
            d="M55,5 Q58,1 61,5 Q64,9 67,5"
            fill="none"
            stroke="#8b9a46"
            strokeWidth="0.8"
            opacity="0.3"
          >
            <animate
              attributeName="opacity"
              values="0.15;0.4;0.15"
              dur="1.8s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="d"
              values="M55,5 Q58,1 61,5 Q64,9 67,5;M55,3 Q58,7 61,3 Q64,-1 67,3;M55,5 Q58,1 61,5 Q64,9 67,5"
              dur="1.8s"
              repeatCount="indefinite"
            />
          </path>
          {/* Orbiting fly */}
          <g>
            <text x="0" y="0" fontSize="6">
              🪰
            </text>
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="0 50 25;360 50 25"
              dur="3s"
              repeatCount="indefinite"
            />
            <animateMotion
              path="M-25,-20 A25,20 0 1,1 25,20 A25,20 0 1,1 -25,-20"
              dur="3s"
              repeatCount="indefinite"
            />
          </g>
        </g>
      )}

      {/* Low health: green pallor + dizzy */}
      {stats.health < 30 && (
        <g>
          <rect x="15" y="14" width="70" height="76" rx="20" fill="#4ade80" opacity="0.08">
            <animate
              attributeName="opacity"
              values="0.04;0.12;0.04"
              dur="2s"
              repeatCount="indefinite"
            />
          </rect>
          {/* Dizzy stars */}
          <text x="18" y="18" fontSize="6" opacity="0.5">
            💫
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="0 22 15;360 22 15"
              dur="2s"
              repeatCount="indefinite"
            />
          </text>
        </g>
      )}
    </g>
  );
}

// ─── Blush (appears when happiness > 80) ────────────────────────

function renderCheeks(traits: PetTraits, stats?: PetStats): JSX.Element {
  // Only show blush when happiness is high
  if (stats && stats.happiness <= 80) return <></>;

  return (
    <g opacity="0.25">
      <ellipse cx={50 - 12 * traits.eyeSpacing - 2} cy="52" rx="5" ry="3" fill="hsl(0, 70%, 65%)" />
      <ellipse cx={50 + 12 * traits.eyeSpacing + 2} cy="52" rx="5" ry="3" fill="hsl(0, 70%, 65%)" />
    </g>
  );
}

// ─── SVG CSS Animations ─────────────────────────────────────────

function svgStyles(): JSX.Element {
  return (
    <defs>
      <style>{`
        .pet-blink {
          animation: blink 4s ease-in-out infinite;
        }
        @keyframes blink {
          0%, 42% { transform: scaleY(1); transform-origin: 50% 42px; }
          45% { transform: scaleY(0.05); transform-origin: 50% 42px; }
          48%, 100% { transform: scaleY(1); transform-origin: 50% 42px; }
        }
        .pet-action-flash {
          animation: action-flash 0.3s ease-out;
        }
        @keyframes action-flash {
          0% { filter: brightness(1); }
          50% { filter: brightness(1.5); }
          100% { filter: brightness(1); }
        }
      `}</style>
    </defs>
  );
}

// ─── Main Component ─────────────────────────────────────────────

export function PetSprite({ petId, state, name, level, stats, activeAction }: PetSpriteProps) {
  const traits = useMemo(() => deriveTraits(petId), [petId]);
  const animation = useMemo(
    () => getStateAnimation(state, traits, activeAction),
    [state, traits, activeAction],
  );
  const scale = traits.sizeModifier;

  // Determine effective display state for face/mouth rendering
  const displayState: PetState = activeAction
    ? (actionToDisplayState(activeAction) ?? state)
    : state;
  // Animation key: change when state OR activeAction changes to reset Framer Motion
  const animKey = activeAction ? `action-${activeAction}` : state;

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div animate={animation} key={animKey} className="select-none">
        <svg
          width={120 * scale}
          height={120 * scale}
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
          style={{ overflow: 'visible' }}
        >
          {/* SVG animations CSS */}
          {svgStyles()}

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
          {renderEyes(traits, displayState, stats)}
          {renderMouth(traits, displayState)}
          {renderCheeks(traits, stats)}

          {/* Accessory */}
          {renderAccessory(traits, level)}

          {/* Low-stat visual indicators */}
          {renderStatIndicators(stats, traits)}

          {/* State overlay effects */}
          {renderStateOverlay(state, activeAction)}
        </svg>
      </motion.div>
      <p className="text-neogochi-muted text-xs">{name}</p>
      <p className="text-neogochi-accent text-[10px] uppercase tracking-wider">
        {activeAction
          ? activeAction === 'feed'
            ? 'Eating'
            : activeAction === 'play'
              ? 'Playing'
              : 'Cleaning'
          : state}
      </p>
    </div>
  );
}
