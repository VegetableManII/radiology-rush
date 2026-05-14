import { useEffect, useRef } from 'react';
import { useGameStore } from '../stores/gameStore';
import { useBGM } from '../hooks/useSound';
import { StatusBar } from './StatusBar';
import { PatientQueue } from './PatientQueue';
import { RoomList } from './RoomCard';
import { GameOverlay } from './GameOverlay';
import { MessageBar } from './MessageBar';
import { DrGame } from './DrGame';
import { CtGame } from './CtGame';
import { MriGame } from './MriGame';
import { DoctorNotification } from './DoctorNotification';
import { ReportList } from './ReportList';
import { BulletTimeEffect } from './BulletTimeEffect';

export function Game() {
  const { status, phase, currentMinigamePatient, currentRoomType, addPatient, updateGame, completeMinigame } = useGameStore();
  const lastTimeRef = useRef<number>(0);
  const statusRef = useRef<string>(status);
  const phaseRef = useRef<string>(phase);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useBGM(status);

  useEffect(() => {
    if (status !== 'playing') return;

    const patientIntervals = [500, 1000, 1500, 2000];
    let lastPatientTime = 0;
    let patientInterval = patientIntervals[Math.floor(Math.random() * patientIntervals.length)];

    const gameLoop = (currentTime: number) => {
      if (statusRef.current !== 'playing') return;

      if (lastTimeRef.current === 0) {
        lastTimeRef.current = currentTime;
      }

      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;

      lastPatientTime += deltaTime;
      if (lastPatientTime >= patientInterval) {
        addPatient();
        lastPatientTime = 0;
        patientInterval = patientIntervals[Math.floor(Math.random() * patientIntervals.length)];
      }

      updateGame(deltaTime);

      requestAnimationFrame(gameLoop);
    };

    lastTimeRef.current = 0;
    requestAnimationFrame(gameLoop);

    return () => {
      lastTimeRef.current = 0;
    };
  }, [status, currentMinigamePatient, updateGame, addPatient]);

  const handleMinigameComplete = (success: boolean) => {
    completeMinigame(success ? 1 : 0.5);
  };

  const renderMinigame = () => {
    if (!currentMinigamePatient || !currentRoomType) return null;

    switch (currentRoomType) {
      case 'dr':
        return <DrGame onComplete={handleMinigameComplete} />;
      case 'ct':
        return <CtGame onComplete={handleMinigameComplete} />;
      case 'mri':
        return <MriGame onComplete={handleMinigameComplete} />;
      default:
        return null;
    }
  };

  return (
    <div style={{ width: '100%', height: '100dvh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      <img
        src="/assets/scenes/main_bg.webp"
        alt=""
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: -10 }}
      />
      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.2)', zIndex: -10 }} />

      <StatusBar />

      <main style={{ flex: 1, minHeight: 0, padding: 'clamp(0.75rem, 2vw, 1rem)', display: 'flex', flexDirection: 'column', gap: 'clamp(0.5rem, 2vw, 0.75rem)', overflow: 'hidden' }}>
        <div style={{ flexShrink: 0, height: 'clamp(5rem, 20vh, 10rem)' }}>
          <RoomList />
        </div>

        <div style={{ flex: 1, minHeight: 0 }}>
          <PatientQueue />
        </div>

        <div style={{ flexShrink: 0 }}>
          <MessageBar />
        </div>
      </main>

      <GameOverlay />
      <DoctorNotification />
      <ReportList />
      <BulletTimeEffect />

      {phase === 'minigame' && renderMinigame()}
    </div>
  );
}