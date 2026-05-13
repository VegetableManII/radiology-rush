import { useState, useEffect, useCallback, useMemo } from 'react';

const DR_IMAGES = [
  '/assets/dr_game/bone_1.webp',
  '/assets/dr_game/bone_3.webp',
  '/assets/dr_game/bone_4.webp',
  '/assets/dr_game/bone_5.webp',
  '/assets/dr_game/bone_6.webp',
  '/assets/dr_game/bone_8.webp',
];

function getCorrectZone(imagePath: string): number {
  const match = imagePath.match(/bone_(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

interface DrGameProps {
  onComplete: (success: boolean) => void;
}

export function DrGame({ onComplete }: DrGameProps) {
  const [timeLeft, setTimeLeft] = useState(5);
  const [result, setResult] = useState<'success' | 'fail' | null>(null);
  const [selectedZone, setSelectedZone] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState<string>('');
  const [correctZone, setCorrectZone] = useState(0);

  useEffect(() => {
    const randomImage = DR_IMAGES[Math.floor(Math.random() * DR_IMAGES.length)];
    setCurrentImage(randomImage);
    setCorrectZone(getCorrectZone(randomImage));
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

  const handleZoneClick = useCallback((zone: number) => {
    if (result) return;

    setSelectedZone(zone);
    if (zone === correctZone) {
      setResult('success');
    } else {
      setResult('fail');
    }
  }, [correctZone, result]);

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl shadow-2xl p-4 max-w-lg w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">🩻 DR拍片 - 找出骨折部位</h2>
          <div className={`px-3 py-1 rounded-full text-sm font-bold ${
            timeLeft <= 5 ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
          }`}>
            ⏱️ {timeLeft}s
          </div>
        </div>

        {/* Image with 9 zones */}
        <div className="relative w-full aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden">
          <img
            src={currentImage}
            alt="X-ray skeleton"
            className="w-full h-full object-cover"
          />

          {/* Zone grid overlay */}
          <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
            {Array.from({ length: 9 }).map((_, index) => (
              <button
                key={index}
                onClick={() => handleZoneClick(index)}
                disabled={result !== null}
                className={`
                  relative transition-all duration-200
                  ${selectedZone === index ? 'ring-4 ring-amber-400' : ''}
                  ${result === 'success' && index === correctZone ? 'bg-green-500/30' : ''}
                  ${result === 'fail' && index === selectedZone ? 'bg-red-500/30' : ''}
                  ${result === 'fail' && index === correctZone ? 'bg-green-500/30' : ''}
                  hover:bg-white/20
                `}
              />
            ))}
          </div>

          {/* Result overlay */}
          {result && (
            <div className={`
              absolute inset-0 flex items-center justify-center
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

        {/* Instructions */}
        <p className="text-center text-sm text-gray-500 mt-3">
          点击骨骼图上骨折的位置
        </p>
      </div>
    </div>
  );
}