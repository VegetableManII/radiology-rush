import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '../stores/gameStore';

export function MessageBar() {
  const { t } = useTranslation();
  const [message, setMessage] = useState('');
  const { status, patients } = useGameStore();
  const emergencyCount = patients.filter(p => p.type === 'emergency').length;

  useEffect(() => {
    if (status !== 'playing') return;

    const interval = setInterval(() => {
      if (emergencyCount > 0) {
        setMessage(t('message.emergency'));
      } else {
        const messages = t('message.messages', { returnObjects: true }) as string[];
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        setMessage(randomMessage);
      }
    }, 5000);

    const messages = t('message.messages', { returnObjects: true }) as string[];
    setMessage(messages[Math.floor(Math.random() * messages.length)]);

    return () => clearInterval(interval);
  }, [status, emergencyCount, t]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={message}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        style={{
          backgroundColor: 'rgba(255,255,255,0.8)',
          backdropFilter: 'blur(8px)',
          borderRadius: '0.5rem',
          padding: 'clamp(0.375rem, 1.5vw, 0.625rem) clamp(0.75rem, 3vw, 1rem)',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
          textAlign: 'center',
          color: '#374151',
          fontSize: 'clamp(0.625rem, 2.5vw, 0.875rem)',
          flexShrink: 0,
        }}
      >
        {message}
      </motion.div>
    </AnimatePresence>
  );
}