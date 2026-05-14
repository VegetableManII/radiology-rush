import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../stores/gameStore';

export function BulletTimeEffect() {
  const { bulletTimeTriggered, status } = useGameStore();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (bulletTimeTriggered && status === 'playing') {
      setShow(true);
      // 2秒后自动隐藏
      const timer = setTimeout(() => {
        setShow(false);
        useGameStore.setState({ bulletTimeTriggered: false });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [bulletTimeTriggered, status]);

  if (status !== 'playing') return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{
            duration: 0.3,
            type: 'spring',
            stiffness: 300,
            damping: 20,
          }}
          className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
        >
          <div className="relative flex flex-col items-center">
            {/* 半透明背景光晕 */}
            <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-3xl scale-150" />

            {/* 子弹时间图标 */}
            <img
              src="/assets/ui/bullet_time.webp"
              alt="子弹时间"
              className="w-48 h-48 md:w-56 md:h-56 drop-shadow-lg relative z-10"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}