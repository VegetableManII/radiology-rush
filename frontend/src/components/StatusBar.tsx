import { motion } from 'framer-motion';
import { useGameStore } from '../stores/gameStore';

export function StatusBar() {
  const { score, lives, time, combo, status } = useGameStore();

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (status === 'idle') return null;

  return (
    <div className="bg-white/90 backdrop-blur-sm shadow-md px-3 py-2 sm:px-4 sm:py-3 flex items-center justify-between gap-2 sm:gap-4 shrink-0 relative">
      <div className="flex items-center gap-3 sm:gap-6">
        <div className="flex items-center gap-1 sm:gap-2">
          <span className="text-gray-600 text-xs sm:text-sm hidden sm:inline">分数</span>
          <motion.span
            key={score}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="text-base sm:text-xl font-bold text-blue-600 tabular-nums"
          >
            {score}
          </motion.span>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <span className="text-gray-600 text-xs sm:text-sm hidden sm:inline">连击</span>
          <motion.span
            animate={{ scale: combo > 0 ? [1, 1.3, 1] : 1 }}
            transition={{ duration: 0.3 }}
            className={`text-base sm:text-xl font-bold ${combo > 5 ? 'text-orange-500' : combo > 0 ? 'text-yellow-500' : 'text-gray-400'}`}
          >
            x{combo}
          </motion.span>
        </div>
      </div>

      <div className="absolute left-1/2 -translate-x-1/2 text-sm sm:text-lg font-medium text-gray-700 font-mono">
        {formatTime(time)}
      </div>

      <div className="flex items-center gap-0.5 sm:gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.span
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className={`text-lg sm:text-2xl ${i < lives ? 'opacity-100' : 'opacity-30'}`}
          >
            ❤️
          </motion.span>
        ))}
        <span className="text-sm sm:text-base font-bold text-red-500 ml-1">
          {lives}
        </span>
      </div>
    </div>
  );
}