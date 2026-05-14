import { motion } from 'framer-motion';
import { useGameStore } from '../stores/gameStore';
import { playBGM, unlockAudio } from '../hooks/useSound';

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
    <div
      style={{
        position: 'fixed', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 50, padding: 'clamp(3rem, 12vw, 8rem) clamp(1rem, 4vw, 3rem)',
      }}
    >
      <img
        src="/assets/scenes/main_bg.webp"
        alt=""
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
      />
      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)' }} />

      <motion.div
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        style={{
          position: 'relative',
          backgroundColor: 'rgba(255,255,255,0.97)',
          borderRadius: '1.5rem',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)',
          padding: 'clamp(1rem, 5vw, 2rem)',
          maxWidth: 'min(28rem, 100%)',
          width: '100%',
          textAlign: 'center',
        }}
      >
        {status === 'idle' && (
          <>
            <motion.div
              animate={{ rotate: [0, -5, 5, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              style={{ width: 'min(16rem, 60vw)', height: 'min(16rem, 60vw)', margin: '0 auto 1.5rem' }}
            >
              <img src="/assets/ui/game_start.webp" alt="logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </motion.div>

            <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', fontWeight: 700, color: '#1f2937', marginBottom: '0.5rem' }}>
              影像科的日常
            </h1>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Radiology Rush</p>

            <div style={{ textAlign: 'left', backgroundColor: '#f9fafb', borderRadius: '0.75rem', padding: '1rem', marginBottom: '1.5rem', fontSize: '0.875rem', color: '#4b5563' }}>
              <p style={{ marginBottom: '0.5rem' }}>🎯 <strong>目标：</strong>尽可能多地处理病人</p>
              <p style={{ marginBottom: '0.5rem' }}>👆 <strong>操作：</strong>点击病人然后选择检查室</p>
              <p style={{ marginBottom: '0.5rem' }}>🚨 <strong>注意：</strong>急诊病人尽量优先处理！</p>
              <p>❤️ <strong>警告：</strong>病人耐心耗尽会扣除生命值</p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { unlockAudio(); playBGM(); startGame(); }}
              style={{
                width: '100%',
                padding: '1rem',
                background: 'linear-gradient(to right, #3b82f6, #9333ea)',
                color: 'white',
                fontWeight: 700,
                fontSize: '1.25rem',
                borderRadius: '0.75rem',
                boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.4), 0 4px 6px -2px rgba(59, 130, 246, 0.2)',
                border: 'none',
                cursor: 'pointer',
              }}
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
              style={{ width: 'min(16rem, 60vw)', height: 'min(16rem, 60vw)', margin: '0 auto 1.5rem' }}
            >
              <img src="/assets/ui/game_over.webp" alt="game over" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </motion.div>

            <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', fontWeight: 700, color: '#dc2626', marginBottom: '0.5rem' }}>
              科室崩盘了
            </h1>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>今天已经尽力了...</p>

            <div style={{ backgroundColor: '#f9fafb', borderRadius: '0.75rem', padding: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ color: '#4b5563' }}>最终得分</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#2563eb' }}>{score}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#4b5563' }}>坚持时间</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#9333ea' }}>{formatTime(time)}</span>
              </div>
            </div>

            <div style={{ textAlign: 'left', fontSize: '0.875rem', color: '#6b7280', marginBottom: '1.5rem' }}>
              <p>💡 提示：记得优先处理急诊病人，保持节奏！</p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { unlockAudio(); resetGame(); }}
              style={{
                width: '100%',
                padding: '1rem',
                background: 'linear-gradient(to right, #f97316, #dc2626)',
                color: 'white',
                fontWeight: 700,
                fontSize: '1.25rem',
                borderRadius: '0.75rem',
                boxShadow: '0 10px 15px -3px rgba(249, 115, 22, 0.4), 0 4px 6px -2px rgba(220, 38, 38, 0.2)',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              再来一局
            </motion.button>
          </>
        )}

        {status === 'paused' && (
          <>
            <div style={{ fontSize: 'clamp(3rem, 10vw, 4.5rem)', marginBottom: '1rem' }}>⏸️</div>
            <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', fontWeight: 700, color: '#1f2937', marginBottom: '1.5rem' }}>
              游戏暂停
            </h1>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>休息一下，整理思路</p>
          </>
        )}
      </motion.div>
    </div>
  );
}