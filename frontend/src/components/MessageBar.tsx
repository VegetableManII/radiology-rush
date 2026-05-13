import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../stores/gameStore';

const MESSAGES = [
  '今日影像科已爆单。',
  'CT室：我真的转不动了。',
  '病人：护士，我能快点吗？',
  '急诊病人已到达，建议放下奶茶立即处理。',
  '叮～新病人到了',
  '排队的人越来越多了...',
  '稳住，我们能赢！',
  '注意！有急诊！',
  '呼～今天也是忙碌的一天呢',
  '💡 及时清理报告可增加健康值哦',
  '💡 优先处理急诊病人可以获得❤哦',
];

export function MessageBar() {
  const [message, setMessage] = useState('');
  const { status, patients } = useGameStore();
  const emergencyCount = patients.filter(p => p.type === 'emergency').length;

  useEffect(() => {
    if (status !== 'playing') return;
    
    const interval = setInterval(() => {
      if (emergencyCount > 0) {
        setMessage('🚨 警告！有急诊病人需要处理！');
      } else {
        const randomMessage = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
        setMessage(randomMessage);
      }
    }, 5000);

    setMessage(MESSAGES[Math.floor(Math.random() * MESSAGES.length)]);

    return () => clearInterval(interval);
  }, [status, emergencyCount]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={message}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="bg-white/80 backdrop-blur-sm rounded-lg px-3 py-1.5 sm:px-4 sm:py-2 shadow text-center text-gray-700 text-xs sm:text-sm shrink-0"
      >
        {message}
      </motion.div>
    </AnimatePresence>
  );
}