import { useEffect, useRef } from 'react';
import { useGameStore } from '../stores/gameStore';
import { StatusBar } from './StatusBar';
import { PatientQueue } from './PatientQueue';
import { RoomList } from './RoomCard';
import { GameOverlay } from './GameOverlay';
import { MessageBar } from './MessageBar';
import { XrayMatchingGame } from './XrayMatchingGame';
import { ReportWritingGame } from './ReportWritingGame';

export function Game() {
  const { status, phase, currentMinigamePatient, addPatient, updateGame } = useGameStore();
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    if (status !== 'playing') return;

    let lastPatientTime = 0;
    const patientInterval = 3000;

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

  const { skipMinigame, completeMinigame1, completeMinigame2 } = useGameStore();

  const getGridSize = (type: string) => {
    switch (type) {
      case 'xray': return 3;
      case 'ct': return 4;
      case 'mri': return 4;
      case 'emergency': return 3;
      default: return 3;
    }
  };

  const getTimeLimit = (type: string, isFirst: boolean) => {
    if (isFirst) {
      switch (type) {
        case 'xray': return 15;
        case 'ct': return 18;
        case 'mri': return 20;
        case 'emergency': return 8;
        default: return 15;
      }
    }
    return 10;
  };

  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden">
      <img
        src="/assets/scenes/main_bg.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover -z-10"
      />
      <div className="absolute inset-0 bg-black/20 -z-10" />

      <StatusBar />

      <main className="flex-1 min-h-0 p-3 sm:p-4 flex flex-col gap-2 sm:gap-3 overflow-hidden">
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-2 sm:gap-3 overflow-hidden">
          <RoomList />
          <PatientQueue />
        </div>
        
        <MessageBar />
      </main>
      
      <GameOverlay />

      {phase === 'minigame1' && currentMinigamePatient && (
        <XrayMatchingGame
          gridSize={getGridSize(currentMinigamePatient.type)}
          timeLimit={getTimeLimit(currentMinigamePatient.type, true)}
          onComplete={completeMinigame1}
          onCancel={skipMinigame}
        />
      )}

      {phase === 'minigame2' && currentMinigamePatient && (
        <ReportWritingGame
          patientType={currentMinigamePatient.type}
          onComplete={completeMinigame2}
          onCancel={skipMinigame}
        />
      )}
    </div>
  );
}