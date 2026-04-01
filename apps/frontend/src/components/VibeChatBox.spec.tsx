import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VibeChatBox } from './VibeChatBox';
import type { PetStats } from '@neogochi/shared';

const fullStats: PetStats = {
  hunger: 80,
  happiness: 80,
  energy: 80,
  health: 80,
  cleanliness: 80,
};

describe('VibeChatBox', () => {
  it('should display dialogue for Sleeping state', () => {
    render(<VibeChatBox state="Sleeping" stats={fullStats} name="Buddy" />);
    expect(screen.getByText('Zzz... Zzz...')).toBeInTheDocument();
  });

  it('should display dialogue for Sick state', () => {
    render(<VibeChatBox state="Sick" stats={fullStats} name="Buddy" />);
    expect(screen.getByText("I don't feel so good...")).toBeInTheDocument();
  });

  it('should display dialogue for Dead state', () => {
    render(<VibeChatBox state="Dead" stats={fullStats} name="Buddy" />);
    expect(screen.getByText('Buddy has passed away...')).toBeInTheDocument();
  });

  it('should display hunger warning when hunger is low', () => {
    const lowHunger: PetStats = { ...fullStats, hunger: 10 };
    render(<VibeChatBox state="Idle" stats={lowHunger} name="Buddy" />);
    expect(screen.getByText("I'm starving... need food!")).toBeInTheDocument();
  });

  it('should display happy dialogue when stats are good', () => {
    const happy: PetStats = { ...fullStats, happiness: 90, hunger: 70 };
    render(<VibeChatBox state="Idle" stats={happy} name="Buddy" />);
    expect(screen.getByText('Life is great! ✨')).toBeInTheDocument();
  });

  it('should display generic dialogue for neutral stats', () => {
    const neutral: PetStats = {
      hunger: 50,
      happiness: 50,
      energy: 50,
      health: 50,
      cleanliness: 50,
    };
    render(<VibeChatBox state="Idle" stats={neutral} name="Buddy" />);
    expect(screen.getByText("Hey there! I'm doing okay.")).toBeInTheDocument();
  });
});
