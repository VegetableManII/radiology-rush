import { useRef } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../stores/gameStore';

export function StatusBar() {
  const { score, lives, time, combo, status } = useGameStore();
  const prevScore = useRef(score);
  const prevLives = useRef(lives);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (status === 'idle') return null;

  const scoreIncreased = score > prevScore.current;
  const scoreDecreased = score < prevScore.current;

  if (score !== prevScore.current) prevScore.current = score;
  if (lives !== prevLives.current) prevLives.current = lives;

  // 计算爱心：1个满心=2条命，最多显示5个
  const maxHearts = 5;
  const fullHearts = Math.floor(lives / 2);
  const halfHeart = lives % 2;
  const displayFullHearts = Math.min(fullHearts, maxHearts);
  const showHalfHeart = halfHeart === 1 && fullHearts < maxHearts;

  return (
    <div className="bg-white/90 backdrop-blur-sm shadow-md px-3 py-2 sm:px-4 sm:py-3 flex items-center justify-between gap-2 sm:gap-4 shrink-0 relative">
      <div className="flex items-center gap-3 sm:gap-6">
        <div className="flex items-center gap-1 sm:gap-2">
          <span className="text-gray-600 text-xs sm:text-sm hidden sm:inline">分数</span>
          <motion.span
            key={score}
            initial={scoreIncreased ? { scale: 1.5 } : scoreDecreased ? { scale: 0.8 } : false}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 15 }}
            className="text-base sm:text-xl font-bold text-blue-600 tabular-nums"
          >
            {score}
          </motion.span>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <span className="text-gray-600 text-xs sm:text-sm hidden sm:inline">连击</span>
          <span className={`text-base sm:text-xl font-bold ${combo > 5 ? 'text-orange-500' : combo > 0 ? 'text-yellow-500' : 'text-gray-400'}`}>
            x{combo}
          </span>
        </div>
      </div>

      <div className="absolute left-1/2 -translate-x-1/2 text-sm sm:text-lg font-medium text-gray-700 font-mono">
        {formatTime(time)}
      </div>

      <div className="flex items-center gap-0 ml-auto pr-2">
        {Array.from({ length: displayFullHearts }).map((_, i) => (
          <img
            key={`full-${i}`}
            src="/assets/icons/heart_full.webp"
            alt="heart"
            className="w-6 h-6 sm:w-8 sm:h-8"
          />
        ))}
        {showHalfHeart && (
          <img
            src="/assets/icons/heart_half.webp"
            alt="half heart"
            className="w-6 h-6 sm:w-8 sm:h-8"
          />
        )}
      </div>
    </div>
  );
}