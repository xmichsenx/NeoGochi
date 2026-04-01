'use client';

import { useEffect, useCallback } from 'react';
import { getSocket } from '@/lib/socket';
import { usePetState } from './usePetState';
import { WS_EVENTS } from '@neogochi/shared';
import type { Pet, CreatePetDto, PetState } from '@neogochi/shared';

export function useSocket() {
  const { setPet, clearPet, setConnected, setError } = usePetState();

  useEffect(() => {
    const socket = getSocket();

    socket.on('connect', () => {
      setConnected(true);
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on(WS_EVENTS.PET_UPDATE, (pet: Pet) => {
      setPet(pet);
    });

    socket.on(WS_EVENTS.PET_DIED, () => {
      clearPet();
    });

    socket.on(WS_EVENTS.ERROR, (data: { message: string }) => {
      setError(data.message);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off(WS_EVENTS.PET_UPDATE);
      socket.off(WS_EVENTS.PET_DIED);
      socket.off(WS_EVENTS.ERROR);
    };
  }, [setPet, clearPet, setConnected, setError]);

  const createPet = useCallback((data: CreatePetDto) => {
    getSocket().emit(WS_EVENTS.CREATE_PET, data);
  }, []);

  const feed = useCallback(() => {
    getSocket().emit(WS_EVENTS.FEED);
  }, []);

  const play = useCallback(() => {
    getSocket().emit(WS_EVENTS.PLAY);
  }, []);

  const sleep = useCallback(() => {
    getSocket().emit(WS_EVENTS.SLEEP);
  }, []);

  const wakeUp = useCallback(() => {
    getSocket().emit(WS_EVENTS.WAKE_UP);
  }, []);

  const clean = useCallback(() => {
    getSocket().emit(WS_EVENTS.CLEAN);
  }, []);

  const heal = useCallback(() => {
    getSocket().emit(WS_EVENTS.HEAL);
  }, []);

  return { createPet, feed, play, sleep, wakeUp, clean, heal };
}
