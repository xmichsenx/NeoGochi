import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PetSprite } from './PetSprite';
import type { PetStats } from '@neogochi/shared';

const TEST_ID = '550e8400-e29b-41d4-a716-446655440000';
const defaultProps = {
  petId: TEST_ID,
  state: 'Idle' as const,
  name: 'TestPet',
  level: 1,
};

const fullStats: PetStats = {
  hunger: 80,
  happiness: 80,
  energy: 80,
  health: 80,
  cleanliness: 80,
};

describe('PetSprite', () => {
  it('should render pet name and state', () => {
    render(<PetSprite {...defaultProps} />);
    expect(screen.getByText('TestPet')).toBeInTheDocument();
    expect(screen.getByText('Idle')).toBeInTheDocument();
  });

  it('should render an SVG element', () => {
    const { container } = render(<PetSprite {...defaultProps} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('should render body path', () => {
    const { container } = render(<PetSprite {...defaultProps} />);
    const paths = container.querySelectorAll('path');
    expect(paths.length).toBeGreaterThan(0);
  });

  // ─── Blinking ─────────────────────────────────────────────────

  it('should add blink class to eyes in Idle state', () => {
    const { container } = render(<PetSprite {...defaultProps} state="Idle" />);
    const blinkGroups = container.querySelectorAll('.pet-blink');
    expect(blinkGroups.length).toBe(1);
  });

  it('should add blink class to eyes in Playing state', () => {
    const { container } = render(<PetSprite {...defaultProps} state="Playing" />);
    const blinkGroups = container.querySelectorAll('.pet-blink');
    expect(blinkGroups.length).toBe(1);
  });

  it('should NOT blink in Sleeping state', () => {
    const { container } = render(<PetSprite {...defaultProps} state="Sleeping" />);
    const blinkGroups = container.querySelectorAll('.pet-blink');
    expect(blinkGroups.length).toBe(0);
  });

  it('should NOT blink in Dead state', () => {
    const { container } = render(<PetSprite {...defaultProps} state="Dead" />);
    const blinkGroups = container.querySelectorAll('.pet-blink');
    expect(blinkGroups.length).toBe(0);
  });

  // ─── CSS animation keyframes ──────────────────────────────────

  it('should include blink keyframes in SVG defs', () => {
    const { container } = render(<PetSprite {...defaultProps} />);
    const style = container.querySelector('defs style');
    expect(style?.textContent).toContain('@keyframes blink');
    expect(style?.textContent).toContain('.pet-blink');
  });

  // ─── State overlays ──────────────────────────────────────────

  it('should render floating ZZZ in Sleeping state', () => {
    const { container } = render(<PetSprite {...defaultProps} state="Sleeping" />);
    const zTexts = container.querySelectorAll('text');
    const zElements = Array.from(zTexts).filter((t) => t.textContent?.trim() === 'z');
    expect(zElements.length).toBe(3);
  });

  it('should render food particles in Eating state', () => {
    const { container } = render(<PetSprite {...defaultProps} state="Eating" />);
    // Eating overlay has animated circles for food particles
    const animates = container.querySelectorAll('animate');
    expect(animates.length).toBeGreaterThan(0);
  });

  it('should render sparkles in Playing state', () => {
    const { container } = render(<PetSprite {...defaultProps} state="Playing" />);
    const texts = container.querySelectorAll('text');
    const sparkles = Array.from(texts).filter(
      (t) => t.textContent?.includes('⭐') || t.textContent?.includes('✨'),
    );
    expect(sparkles.length).toBeGreaterThanOrEqual(2);
  });

  it('should render sweat and nausea in Sick state', () => {
    const { container } = render(<PetSprite {...defaultProps} state="Sick" />);
    const texts = container.querySelectorAll('text');
    const nausea = Array.from(texts).filter((t) => t.textContent?.includes('🤢'));
    expect(nausea.length).toBe(1);
  });

  it('should render rainbow glow in Evolution state', () => {
    const { container } = render(<PetSprite {...defaultProps} state="Evolution" />);
    const texts = container.querySelectorAll('text');
    const sparkles = Array.from(texts).filter(
      (t) => t.textContent?.includes('✨') || t.textContent?.includes('⭐'),
    );
    expect(sparkles.length).toBeGreaterThanOrEqual(3);
  });

  it('should render ghost and halo in Dead state', () => {
    const { container } = render(<PetSprite {...defaultProps} state="Dead" />);
    // Ghost has an ellipse body + 2 eye circles + a halo ellipse
    const ellipses = container.querySelectorAll('ellipse');
    expect(ellipses.length).toBeGreaterThanOrEqual(1);
  });

  // ─── Low-stat indicators ─────────────────────────────────────

  it('should render drool and food thought when hungry (hunger < 30)', () => {
    const { container } = render(
      <PetSprite {...defaultProps} stats={{ ...fullStats, hunger: 15 }} />,
    );
    const texts = container.querySelectorAll('text');
    const food = Array.from(texts).filter((t) => t.textContent?.includes('🍖'));
    expect(food.length).toBe(1);
  });

  it('should NOT show hunger indicator when hunger is high', () => {
    const { container } = render(
      <PetSprite {...defaultProps} stats={{ ...fullStats, hunger: 80 }} />,
    );
    const texts = container.querySelectorAll('text');
    const food = Array.from(texts).filter((t) => t.textContent?.includes('🍖'));
    expect(food.length).toBe(0);
  });

  it('should render stink lines and fly when dirty (cleanliness < 30)', () => {
    const { container } = render(
      <PetSprite {...defaultProps} stats={{ ...fullStats, cleanliness: 10 }} />,
    );
    const texts = container.querySelectorAll('text');
    const fly = Array.from(texts).filter((t) => t.textContent?.includes('🪰'));
    expect(fly.length).toBe(1);
  });

  it('should NOT show dirty indicator when cleanliness is high', () => {
    const { container } = render(
      <PetSprite {...defaultProps} stats={{ ...fullStats, cleanliness: 90 }} />,
    );
    const texts = container.querySelectorAll('text');
    const fly = Array.from(texts).filter((t) => t.textContent?.includes('🪰'));
    expect(fly.length).toBe(0);
  });

  it('should render dizzy star when health is low (< 30)', () => {
    const { container } = render(
      <PetSprite {...defaultProps} stats={{ ...fullStats, health: 20 }} />,
    );
    const texts = container.querySelectorAll('text');
    const dizzy = Array.from(texts).filter((t) => t.textContent?.includes('💫'));
    expect(dizzy.length).toBe(1);
  });

  it('should render drowsy eyelids when tired (energy < 30)', () => {
    const { container } = render(
      <PetSprite {...defaultProps} stats={{ ...fullStats, energy: 15 }} />,
    );
    // Drowsy lids are rect elements with animate children for the eyelid drooping
    const drowsyGroup = container.querySelector('.drowsy-lids');
    expect(drowsyGroup).toBeInTheDocument();
  });

  it('should NOT render drowsy lids when energy is high', () => {
    const { container } = render(
      <PetSprite {...defaultProps} stats={{ ...fullStats, energy: 80 }} />,
    );
    const drowsyGroup = container.querySelector('.drowsy-lids');
    expect(drowsyGroup).not.toBeInTheDocument();
  });

  it('should render tear drops when sad (happiness < 30)', () => {
    const { container } = render(
      <PetSprite {...defaultProps} stats={{ ...fullStats, happiness: 10 }} />,
    );
    // Tear drops are animated ellipses with blue fill
    const animates = container.querySelectorAll('animate');
    // Should have tear animations
    expect(animates.length).toBeGreaterThan(0);
  });

  // ─── Blush (cheeks) ──────────────────────────────────────────

  it('should show blush cheeks when happiness > 80', () => {
    const { container } = render(
      <PetSprite {...defaultProps} stats={{ ...fullStats, happiness: 95 }} />,
    );
    const cheekEllipses = container.querySelectorAll('ellipse[fill="hsl(0, 70%, 65%)"]');
    expect(cheekEllipses.length).toBe(2);
  });

  it('should NOT show blush cheeks when happiness <= 80', () => {
    const { container } = render(
      <PetSprite {...defaultProps} stats={{ ...fullStats, happiness: 50 }} />,
    );
    const cheekEllipses = container.querySelectorAll('ellipse[fill="hsl(0, 70%, 65%)"]');
    expect(cheekEllipses.length).toBe(0);
  });

  // ─── No stats (graveyard compatibility) ───────────────────────

  it('should render without stats prop (backward compatible)', () => {
    const { container } = render(<PetSprite {...defaultProps} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
    expect(screen.getByText('TestPet')).toBeInTheDocument();
  });

  // ─── Accessory gating ────────────────────────────────────────

  it('should not crash at any level', () => {
    expect(() => render(<PetSprite {...defaultProps} level={0} />)).not.toThrow();
    expect(() => render(<PetSprite {...defaultProps} level={10} />)).not.toThrow();
  });

  // ─── Active Action Animations ─────────────────────────────────

  it('should display "Eating" label when activeAction is feed', () => {
    render(<PetSprite {...defaultProps} activeAction="feed" />);
    expect(screen.getByText('Eating')).toBeInTheDocument();
  });

  it('should display "Playing" label when activeAction is play', () => {
    render(<PetSprite {...defaultProps} activeAction="play" />);
    expect(screen.getByText('Playing')).toBeInTheDocument();
  });

  it('should display "Cleaning" label when activeAction is clean', () => {
    render(<PetSprite {...defaultProps} activeAction="clean" />);
    expect(screen.getByText('Cleaning')).toBeInTheDocument();
  });

  it('should show food particles overlay when activeAction is feed', () => {
    const { container } = render(<PetSprite {...defaultProps} activeAction="feed" />);
    // Food particles are circles with #f59e0b fill
    const foodParticles = container.querySelectorAll('circle[fill="#f59e0b"]');
    expect(foodParticles.length).toBeGreaterThanOrEqual(2);
  });

  it('should show sparkle overlay when activeAction is play', () => {
    const { container } = render(<PetSprite {...defaultProps} activeAction="play" />);
    const texts = container.querySelectorAll('text');
    const sparkles = Array.from(texts).filter(
      (t) => t.textContent?.includes('⭐') || t.textContent?.includes('✨'),
    );
    expect(sparkles.length).toBeGreaterThanOrEqual(2);
  });

  it('should show soap bubbles when activeAction is clean', () => {
    const { container } = render(<PetSprite {...defaultProps} activeAction="clean" />);
    // Soap bubbles are circles with cyan stroke colors
    const bubbles = container.querySelectorAll(
      'circle[stroke="#06b6d4"], circle[stroke="#38bdf8"], circle[stroke="#22d3ee"]',
    );
    expect(bubbles.length).toBeGreaterThanOrEqual(3);
  });

  it('should show eating mouth when activeAction is feed', () => {
    const { container } = render(<PetSprite {...defaultProps} activeAction="feed" />);
    // Eating mouth renders an open ellipse
    const openMouths = container.querySelectorAll('ellipse');
    expect(openMouths.length).toBeGreaterThan(0);
  });

  it('should render normally when activeAction is null', () => {
    render(<PetSprite {...defaultProps} activeAction={null} />);
    expect(screen.getByText('Idle')).toBeInTheDocument();
  });
});
