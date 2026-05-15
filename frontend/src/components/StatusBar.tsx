import { useRef } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../stores/gameStore';

const BASE_FONT = 'clamp(0.75rem, 2.5vw, 0.875rem)';
const LG_FONT = 'clamp(1rem, 3vw, 1.25rem)';

export function StatusBar() {
  const { lives, time, combo, status, difficulty } = useGameStore();
  const prevLives = useRef(lives);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (status === 'idle') return null;

  if (lives !== prevLives.current) prevLives.current = lives;

  const maxHearts = 5;
  const fullHearts = Math.floor(lives / 2);
  const halfHeart = lives % 2;
  const displayFullHearts = Math.min(fullHearts, maxHearts);
  const showHalfHeart = halfHeart === 1 && fullHearts < maxHearts;

  const heartW = 'clamp(1.5rem, 4vw, 2rem)';
  const heartH = heartW;

  const comboColor = combo > 5 ? '#f97316' : combo > 0 ? '#eab308' : '#9ca3af';

  return (
    <div style={{
      backgroundColor: 'rgba(255,255,255,0.92)',
      padding: 'clamp(0.5rem, 2vw, 0.75rem) clamp(0.75rem, 3vw, 1rem)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 'clamp(0.5rem, 2vw, 1rem)',
      flexShrink: 0,
      position: 'relative',
      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        <span style={{ fontSize: BASE_FONT, color: '#4b5563' }}>连击</span>
        <span style={{ fontSize: LG_FONT, fontWeight: 700, color: comboColor }}>
          x{combo}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        <span style={{ fontSize: BASE_FONT, color: '#4b5563' }}>难度</span>
        <motion.span
          key={difficulty}
          initial={{ scale: 2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          style={{ fontSize: LG_FONT, fontWeight: 700, color: '#dc2626', fontVariantNumeric: 'tabular-nums' }}
        >
          {difficulty}
        </motion.span>
      </div>

      <div style={{
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: 'clamp(0.875rem, 3vw, 1.125rem)',
        color: '#374151',
        fontFamily: 'monospace',
      }}>
        {formatTime(time)}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginLeft: 'auto', paddingRight: '0.5rem' }}>
        {Array.from({ length: displayFullHearts }).map((_, i) => (
          <img
            key={`full-${i}`}
            src="/assets/icons/heart_full.webp"
            alt="heart"
            style={{ width: heartW, height: heartH }}
          />
        ))}
        {showHalfHeart && (
          <img
            src="/assets/icons/heart_half.webp"
            alt="half heart"
            style={{ width: heartW, height: heartH }}
          />
        )}
      </div>
    </div>
  );
}