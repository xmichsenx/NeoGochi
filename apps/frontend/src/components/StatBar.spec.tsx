import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatBar } from './StatBar';

describe('StatBar', () => {
  it('should render the label', () => {
    render(<StatBar label="hunger" value={75} color="#f59e0b" />);
    expect(screen.getByText('hunger')).toBeInTheDocument();
  });

  it('should display the rounded value', () => {
    render(<StatBar label="health" value={42.7} color="#22c55e" />);
    expect(screen.getByText('43')).toBeInTheDocument();
  });

  it('should render 0 correctly', () => {
    render(<StatBar label="energy" value={0} color="#3b82f6" />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('should render 100 correctly', () => {
    render(<StatBar label="happiness" value={100} color="#ec4899" />);
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('should render SVG circles', () => {
    const { container } = render(<StatBar label="cleanliness" value={50} color="#06b6d4" />);
    const circles = container.querySelectorAll('circle');
    expect(circles.length).toBe(2); // background + progress
  });
});
