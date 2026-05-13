import { motion } from 'framer-motion';
import { useGameStore } from '../stores/gameStore';
import { playSFX, playBGM, unlockAudio } from '../hooks/useSound';

export function GameOverlay() {
  const { status, score, time, resetGame, startGame } = useGameStore();

  if (status === 'playing') return null;

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
    >
      <img
        src="/assets/scenes/main_bg.webp"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <motion.div
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="relative bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 max-w-md w-full text-center"
      >
        {status === 'idle' && (
          <>
            <motion.div
              animate={{ rotate: [0, -5, 5, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-7xl mb-6"
            >
              🏥
            </motion.div>
            
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              影像科的日常
            </h1>
            <p className="text-gray-500 mb-6">
              Radiology Rush
            </p>
            
            <div className="text-left bg-gray-50 rounded-xl p-4 mb-6 text-sm text-gray-600">
              <p className="mb-2">🎯 <strong>目标：</strong>尽可能多地处理病人</p>
              <p className="mb-2">👆 <strong>操作：</strong>点击病人选中，再点击检查室分配</p>
              <p className="mb-2">🚨 <strong>注意：</strong>急诊病人尽量优先处理！</p>
              <p>❤️ <strong>警告：</strong>病人耐心耗尽会扣除生命值</p>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { unlockAudio(); playBGM(); playSFX('sfx_click'); startGame(); }}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-xl rounded-xl shadow-lg"
            >
              开始接诊
            </motion.button>
          </>
        )}

        {status === 'gameover' && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' }}
              className="text-7xl mb-6"
            >
              😵
            </motion.div>
            
            <h1 className="text-3xl font-bold text-red-600 mb-2">
              科室崩盘了
            </h1>
            <p className="text-gray-500 mb-6">
              今天已经尽力了...
            </p>
            
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">最终得分</span>
                <span className="text-2xl font-bold text-blue-600">{score}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">坚持时间</span>
                <span className="text-xl font-bold text-purple-600">{formatTime(time)}</span>
              </div>
            </div>
            
            <div className="text-left text-sm text-gray-500 mb-6">
              <p>💡 提示：记得优先处理急诊病人，保持节奏！</p>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { unlockAudio(); playSFX('sfx_click'); resetGame(); }}
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold text-xl rounded-xl shadow-lg"
            >
              再来一局
            </motion.button>
          </>
        )}

        {status === 'paused' && (
          <>
            <div className="text-7xl mb-6">⏸️</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
              游戏暂停
            </h1>
            <p className="text-gray-500 mb-6">
              休息一下，整理思路
            </p>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}