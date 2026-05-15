import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../stores/gameStore';

export function BulletTimeEffect() {
  const { freezeSeconds, status } = useGameStore();
  const prevFreeze = useRef(0);
  const [showFlash, setShowFlash] = useState(false);

  useEffect(() => {
    // 刚进入冻结时，闪现图标1秒
    if (freezeSeconds > 0 && prevFreeze.current <= 0) {
      setShowFlash(true);
      setTimeout(() => setShowFlash(false), 500);
    }
    prevFreeze.current = freezeSeconds;
  }, [freezeSeconds]);

  if (status !== 'playing') return null;

  return (
    <>
      {/* 触发冻结时的图标闪现 */}
      <AnimatePresence>
        {showFlash && (
          <motion.div
            key="bullet-flash"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.3 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
              zIndex: 50,
            }}
          >
            <img
              src="/assets/ui/bullet_time.webp"
              alt="冻结"
              style={{ width: 'clamp(10rem, 35vw, 12rem)', height: 'clamp(10rem, 35vw, 12rem)' }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 冻结进行中的蓝色遮罩 */}
      {freezeSeconds > 0 && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 80, 200, 0.2)',
            pointerEvents: 'none',
            zIndex: 49,
          }}
        />
      )}
    </>
  );
}