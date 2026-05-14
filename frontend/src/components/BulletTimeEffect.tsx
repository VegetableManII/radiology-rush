import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../stores/gameStore';

export function BulletTimeEffect() {
  const { freezeSeconds, status } = useGameStore();
  const prevFreezeRef = useRef(0);
  const triggered = freezeSeconds > 0 && freezeSeconds > prevFreezeRef.current;
  prevFreezeRef.current = freezeSeconds;

  if (status !== 'playing') return null;

  return (
    <AnimatePresence>
      {triggered && (
        <motion.div
          key="bullet-time-flash"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 0, scale: 1.5 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
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
  );
}
