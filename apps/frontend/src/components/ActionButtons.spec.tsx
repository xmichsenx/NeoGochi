import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ActionButtons } from './ActionButtons';

describe('ActionButtons', () => {
  const defaultProps = {
    currentState: 'Idle' as const,
    onFeed: vi.fn(),
    onPlay: vi.fn(),
    onSleep: vi.fn(),
    onWakeUp: vi.fn(),
    onClean: vi.fn(),
    onHeal: vi.fn(),
  };

  it('should render all 6 action buttons', () => {
    render(<ActionButtons {...defaultProps} />);

    expect(screen.getByText('Feed')).toBeInTheDocument();
    expect(screen.getByText('Play')).toBeInTheDocument();
    expect(screen.getByText('Sleep')).toBeInTheDocument();
    expect(screen.getByText('Wake')).toBeInTheDocument();
    expect(screen.getByText('Clean')).toBeInTheDocument();
    expect(screen.getByText('Heal')).toBeInTheDocument();
  });

  it('should enable Feed, Play, Sleep, Clean when Idle', () => {
    render(<ActionButtons {...defaultProps} currentState="Idle" />);

    expect(screen.getByText('Feed').closest('button')).not.toBeDisabled();
    expect(screen.getByText('Play').closest('button')).not.toBeDisabled();
    expect(screen.getByText('Sleep').closest('button')).not.toBeDisabled();
    expect(screen.getByText('Clean').closest('button')).not.toBeDisabled();
  });

  it('should disable Wake and Heal when Idle', () => {
    render(<ActionButtons {...defaultProps} currentState="Idle" />);

    expect(screen.getByText('Wake').closest('button')).toBeDisabled();
    expect(screen.getByText('Heal').closest('button')).toBeDisabled();
  });

  it('should enable Wake when Sleeping', () => {
    render(<ActionButtons {...defaultProps} currentState="Sleeping" />);

    expect(screen.getByText('Wake').closest('button')).not.toBeDisabled();
    // Feed, Play, Sleep should be disabled
    expect(screen.getByText('Feed').closest('button')).toBeDisabled();
    expect(screen.getByText('Play').closest('button')).toBeDisabled();
    expect(screen.getByText('Sleep').closest('button')).toBeDisabled();
  });

  it('should enable Heal and Clean when Sick', () => {
    render(<ActionButtons {...defaultProps} currentState="Sick" />);

    expect(screen.getByText('Heal').closest('button')).not.toBeDisabled();
    expect(screen.getByText('Clean').closest('button')).not.toBeDisabled();
    expect(screen.getByText('Feed').closest('button')).toBeDisabled();
  });

  it('should disable all when Dead', () => {
    render(<ActionButtons {...defaultProps} currentState="Dead" />);

    const buttons = screen.getAllByRole('button');
    buttons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });

  it('should call onFeed when Feed button is clicked', () => {
    render(<ActionButtons {...defaultProps} />);

    fireEvent.click(screen.getByText('Feed').closest('button')!);
    expect(defaultProps.onFeed).toHaveBeenCalledOnce();
  });

  it('should call onPlay when Play button is clicked', () => {
    render(<ActionButtons {...defaultProps} />);

    fireEvent.click(screen.getByText('Play').closest('button')!);
    expect(defaultProps.onPlay).toHaveBeenCalledOnce();
  });

  it('should not call handler when disabled button is clicked', () => {
    const onFeed = vi.fn();
    render(<ActionButtons {...defaultProps} currentState="Sleeping" onFeed={onFeed} />);

    const feedButton = screen.getByText('Feed').closest('button')!;
    expect(feedButton).toBeDisabled();
    fireEvent.click(feedButton);
    expect(onFeed).not.toHaveBeenCalled();
  });
});
