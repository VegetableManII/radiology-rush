import { useEffect, useRef } from 'react';
import { useGameStore } from '../stores/gameStore';
import { StatusBar } from './StatusBar';
import { PatientQueue } from './PatientQueue';
import { RoomList } from './RoomCard';
import { GameOverlay } from './GameOverlay';
import { MessageBar } from './MessageBar';
import { DrGame } from './DrGame';
import { CtGame } from './CtGame';
import { MriGame } from './MriGame';

export function Game() {
  const { status, phase, currentMinigamePatient, currentRoomType, addPatient, updateGame, completeMinigame1 } = useGameStore();
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    if (status !== 'playing') return;

    const patientIntervals = [500, 1000, 1500, 2000];
    const patientInterval = patientIntervals[Math.floor(Math.random() * patientIntervals.length)];
    let lastPatientTime = 0;

    const gameLoop = (currentTime: number) => {
      if (status !== 'playing') return;

      if (lastTimeRef.current === 0) {
        lastTimeRef.current = currentTime;
      }

      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;

      updateGame(deltaTime);

      lastPatientTime += deltaTime;
      if (lastPatientTime >= patientInterval) {
        addPatient();
        lastPatientTime = 0;
      }

      requestAnimationFrame(gameLoop);
    };

    requestAnimationFrame(gameLoop);

    return () => {
      lastTimeRef.current = 0;
    };
  }, [status, updateGame, addPatient]);

  const handleMinigameComplete = (success: boolean) => {
    completeMinigame1(success ? 1 : 0.5);
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
    <div className="w-full h-screen flex flex-col relative overflow-hidden">
      <img
        src="/assets/scenes/webp/main_bg.webp"
        alt=""
        className="absolute inset-0 w-full h-full object-cover -z-10"
      />
      <div className="absolute inset-0 bg-black/20 -z-10" />

      <StatusBar />

      <main className="flex-1 min-h-0 p-3 sm:p-4 flex flex-col gap-2 sm:gap-3 overflow-hidden">
        <div className="shrink-0 h-[22vh]">
          <RoomList />
        </div>

        <div className="flex-1 min-h-0">
          <PatientQueue />
        </div>

        <div className="shrink-0">
          <MessageBar />
        </div>
      </main>

      <GameOverlay />

      {phase === 'minigame1' && renderMinigame()}
    </div>
  );
}