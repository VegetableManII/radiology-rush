import { useState, useEffect, useCallback } from 'react';
import { playSFX } from '../hooks/useSound';

const BODY_PARTS = ['brain', 'chest', 'abdomen'] as const;
type BodyPart = typeof BODY_PARTS[number];

const bodyPartNames: Record<BodyPart, string> = {
  brain: '脑部',
  chest: '胸部',
  abdomen: '腹部',
};

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
        if (prev <= 1) { setResult('fail'); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [result, isLoading]);

  const handleCellClick = useCallback((index: number) => {
    if (result) return;
    setResult(index === lesionIndex ? 'success' : 'fail');
  }, [result, lesionIndex]);

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
      <div style={{ position: 'relative', backgroundColor: 'white', borderRadius: '1rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)', padding: '1rem', maxWidth: 'min(28rem, 100%)', width: '100%', margin: '0 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <h2 style={{ fontSize: 'clamp(1rem, 3vw, 1.125rem)', fontWeight: 700, color: '#1f2937', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <img src="/assets/icons/icon_ct.webp" alt="" style={{ width: 'clamp(1.25rem, 4vw, 1.5rem)', height: 'clamp(1.25rem, 4vw, 1.5rem)' }} />
            CT室 - 找出病变位置
          </h2>
          <div style={{
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.875rem',
            fontWeight: 700,
            backgroundColor: timeLeft <= 3 ? '#fef2f2' : '#eff6ff',
            color: timeLeft <= 3 ? '#dc2626' : '#2563eb',
          }}>
            <span style={{ fontSize: 'clamp(0.875rem, 3vw, 1rem)', marginRight: '0.25rem' }}>⏱️</span> {timeLeft}s
          </div>
        </div>

        <p style={{ fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)', color: '#4b5563', marginBottom: '0.75rem', textAlign: 'center' }}>
          找出 <span style={{ fontWeight: 700, color: '#2563eb' }}>{bodyPartNames[bodyPart]}</span> CT 中有病变的1张
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
          {Array.from({ length: 9 }).map((_, index) => (
            <button
              key={index}
              onClick={() => handleCellClick(index)}
              disabled={result !== null}
              style={{
                position: 'relative',
                aspectRatio: '1',
                borderRadius: '0.5rem',
                overflow: 'hidden',
                transition: 'all 0.2s',
                ...(result === 'success' && index === lesionIndex ? { outline: '4px solid #22c55e', outlineOffset: '-2px' } : {}),
                ...(result === 'fail' && index === lesionIndex ? { outline: '4px solid #22c55e', outlineOffset: '-2px' } : {}),
                ...(result === 'fail' && index !== lesionIndex ? { opacity: 0.5 } : {}),
              }}
            >
              <img
                src={`/assets/ct_game/ct_${bodyPart}_normal.webp`}
                alt="CT scan"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              {index === lesionIndex && (
                <img
                  src={`/assets/ct_game/ct_${bodyPart}_lesion.webp`}
                  alt="CT lesion"
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                />
              )}
            </button>
          ))}
        </div>

        {result && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '1rem',
            backgroundColor: result === 'success' ? 'rgba(34,197,94,0.8)' : 'rgba(239,68,68,0.8)',
          }}>
            <div style={{ textAlign: 'center', color: 'white' }}>
              <div style={{ fontSize: 'clamp(2.5rem, 8vw, 3rem)', marginBottom: '0.5rem', fontWeight: 700 }}>{result === 'success' ? '✓' : '✗'}</div>
              <div style={{ fontSize: 'clamp(1rem, 3vw, 1.25rem)', fontWeight: 700 }}>{result === 'success' ? '找对了！' : '找错了'}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}