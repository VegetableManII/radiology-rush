import { useState, useEffect, useCallback } from 'react';
import { playSFX } from '../hooks/useSound';

const BODY_PARTS = ['brain', 'chest', 'abdomen'] as const;
type BodyPart = typeof BODY_PARTS[number];

interface CtGameProps {
  onComplete: (success: boolean) => void;
}

export function CtGame({ onComplete }: CtGameProps) {
  const [timeLeft, setTimeLeft] = useState(7);
  const [result, setResult] = useState<'success' | 'fail' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [bodyPart, setBodyPart] = useState<BodyPart>('brain');
  const [lesionIndex, setLesionIndex] = useState(0);

  useEffect(() => {
    const randomPart = BODY_PARTS[Math.floor(Math.random() * BODY_PARTS.length)];
    const randomLesionIndex = Math.floor(Math.random() * 9);

    setBodyPart(randomPart);
    setLesionIndex(randomLesionIndex);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (result || isLoading) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setResult('fail');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [result, isLoading]);

  const handleCellClick = useCallback((index: number) => {
    if (result) return;
    setResult(index === lesionIndex ? 'success' : 'fail');
  }, [result, lesionIndex]);

  // Play sound when result appears
  useEffect(() => {
    if (result === 'success') {
      playSFX('sfx_minigame_success');
    } else if (result === 'fail') {
      playSFX('sfx_minigame_fail');
    }
  }, [result]);

  useEffect(() => {
    if (!result) return;

    const timer = setTimeout(() => {
      onComplete(result === 'success');
    }, 1000);
    return () => clearTimeout(timer);
  }, [result, onComplete]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
        <div className="text-white">加载中...</div>
      </div>
    );
  }

  const bodyPartNames: Record<BodyPart, string> = {
    brain: '脑部',
    chest: '胸部',
    abdomen: '腹部',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl shadow-2xl p-4 max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-800">🔬 CT室 - 找出病变位置</h2>
          <div className={`px-3 py-1 rounded-full text-sm font-bold ${
            timeLeft <= 3 ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
          }`}>
            ⏱️ {timeLeft}s
          </div>
        </div>

        {/* Instructions */}
        <p className="text-sm text-gray-600 mb-3 text-center">
          找出 <span className="font-bold text-blue-600">{bodyPartNames[bodyPart]}</span> CT 中有病变的1张
        </p>

        {/* 3x3 Grid */}
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 9 }).map((_, index) => (
            <button
              key={index}
              onClick={() => handleCellClick(index)}
              disabled={result !== null}
              className={`
                relative aspect-square rounded-lg overflow-hidden transition-all duration-200
                ${result === 'success' && index === lesionIndex ? 'ring-4 ring-green-500' : ''}
                ${result === 'fail' && index === lesionIndex ? 'ring-4 ring-green-500' : ''}
                ${result === 'fail' && index !== lesionIndex ? 'opacity-50' : ''}
              `}
            >
              <img
                src={`/assets/ct_game/ct_${bodyPart}_normal.webp`}
                alt="CT scan"
                className="w-full h-full object-cover"
              />
              {index === lesionIndex && (
                <img
                  src={`/assets/ct_game/ct_${bodyPart}_lesion.webp`}
                  alt="CT lesion"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
            </button>
          ))}
        </div>

        {/* Result overlay */}
        {result && (
          <div className={`
            absolute inset-0 flex items-center justify-center rounded-2xl
            ${result === 'success' ? 'bg-green-500/80' : 'bg-red-500/80'}
          `}>
            <div className="text-center text-white">
              <div className="text-5xl mb-2">{result === 'success' ? '✓' : '✗'}</div>
              <div className="text-xl font-bold">
                {result === 'success' ? '找对了！' : '找错了'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}