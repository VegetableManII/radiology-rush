import { useState, useEffect, useCallback } from 'react';
import { playSFX } from '../hooks/useSound';

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
    setResult(zone === correctZone ? 'success' : 'fail');
  }, [correctZone, result]);

  useEffect(() => {
    if (result === 'success') playSFX('sfx_minigame_success');
    else if (result === 'fail') playSFX('sfx_minigame_fail');
  }, [result]);

  useEffect(() => {
    if (!result) return;
    setTimeout(() => { onComplete(result === 'success'); }, 1000);
  }, [result, onComplete]);

  if (isLoading) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
        <span style={{ color: 'white' }}>加载中...</span>
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div style={{ position: 'relative', backgroundColor: 'white', borderRadius: '1rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)', padding: '1rem', maxWidth: 'min(32rem, 100%)', width: '100%', margin: '0 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: 'clamp(1rem, 3vw, 1.125rem)', fontWeight: 700, color: '#1f2937', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <img src="/assets/icons/icon_dr.webp" alt="" style={{ width: 'clamp(1.25rem, 4vw, 1.5rem)', height: 'clamp(1.25rem, 4vw, 1.5rem)' }} />
            DR拍片 - 找出骨折部位
          </h2>
          <div style={{
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.875rem',
            fontWeight: 700,
            backgroundColor: timeLeft <= 5 ? '#fef2f2' : '#eff6ff',
            color: timeLeft <= 5 ? '#dc2626' : '#2563eb',
          }}>
            <span style={{ fontSize: 'clamp(0.875rem, 3vw, 1rem)', marginRight: '0.25rem' }}>⏱️</span> {timeLeft}s
          </div>
        </div>

        <div style={{ position: 'relative', width: '100%', aspectRatio: '3/4', backgroundColor: '#f3f4f6', borderRadius: '0.75rem', overflow: 'hidden' }}>
          <img
            src={currentImage}
            alt="X-ray skeleton"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />

          <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(3, 1fr)' }}>
            {Array.from({ length: 9 }).map((_, index) => (
              <button
                key={index}
                onClick={() => handleZoneClick(index)}
                disabled={result !== null}
                style={{
                  position: 'relative',
                  transition: 'all 0.2s',
                  outline: selectedZone === index ? '4px solid #f59e0b' : 'none',
                  outlineOffset: '-2px',
                  ...(result === 'success' && index === correctZone ? { backgroundColor: 'rgba(34,197,94,0.3)' } : {}),
                  ...(result === 'fail' && index === selectedZone ? { backgroundColor: 'rgba(239,68,68,0.3)' } : {}),
                  ...(result === 'fail' && index === correctZone ? { backgroundColor: 'rgba(34,197,94,0.3)' } : {}),
                }}
              />
            ))}
          </div>

          {result && (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              backgroundColor: result === 'success' ? 'rgba(34,197,94,0.8)' : 'rgba(239,68,68,0.8)',
            }}>
              <div style={{ textAlign: 'center', color: 'white' }}>
                <div style={{ fontSize: 'clamp(2.5rem, 8vw, 3rem)', marginBottom: '0.5rem', fontWeight: 700 }}>{result === 'success' ? '✓' : '✗'}</div>
                <div style={{ fontSize: 'clamp(1rem, 3vw, 1.25rem)', fontWeight: 700 }}>{result === 'success' ? '找对了！' : '找错了'}</div>
              </div>
            </div>
          )}
        </div>

        <p style={{ textAlign: 'center', fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)', color: '#6b7280', marginTop: '0.75rem' }}>
          点击骨骼图上骨折的位置
        </p>
      </div>
    </div>
  );
}