import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../stores/gameStore';
import { playSFX } from '../hooks/useSound';

interface Notification {
  id: string;
  message: string;
}

const DOCTOR_MESSAGES = [
  '小羊！动作快点！',
  '效率！效率！我强调多少次了！',
  '今天报告还没写完呢！',
  '别磨蹭！',
  '下一个！下一个！',
  '这速度，午饭都赶不上了！',
  '护士长又在催我了...',
  '急诊病人先处理！',
  '姿势摆好点！',
  '排队的人越来越多了...',
  '小羊～别玩手机了！',
  '快点快点！',
  '我等都等急了！',
];

const MAX_NOTIFICATIONS = 10;

export function DoctorNotification() {
  const status = useGameStore((s) => s.status);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback(() => {
    const message = DOCTOR_MESSAGES[Math.floor(Math.random() * DOCTOR_MESSAGES.length)];
    const newNotification: Notification = {
      id: `doc-${Date.now()}-${Math.random()}`,
      message,
    };

    setNotifications((prev) => {
      const updated = [newNotification, ...prev];
      if (updated.length > MAX_NOTIFICATIONS) return updated.slice(1);
      return updated;
    });

    playSFX('sfx_doctor_notify');
  }, []);

  useEffect(() => {
    if (status !== 'playing') return;

    const initialTimeout = setTimeout(() => addNotification(), 5000);

    let intervalId: ReturnType<typeof setInterval>;
    const scheduleNext = () => {
      const delay = [10000, 12500, 15000][Math.floor(Math.random() * 3)];
      intervalId = setTimeout(() => {
        addNotification();
        scheduleNext();
      }, delay);
    };

    scheduleNext();

    return () => {
      clearTimeout(initialTimeout);
      clearTimeout(intervalId);
    };
  }, [status, addNotification]);

  useEffect(() => {
    if (status !== 'playing') setNotifications([]);
  }, [status]);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <div style={{
      position: 'fixed',
      bottom: '4rem',
      right: '1rem',
      zIndex: 50,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      pointerEvents: 'none',
      alignItems: 'flex-end',
    }}>
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ x: 120, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 80, opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            style={{ position: 'relative', pointerEvents: 'auto', cursor: 'pointer', display: 'flex', alignItems: 'flex-end' }}
          >
            <div style={{ position: 'relative', flexShrink: 0, zIndex: 10, marginRight: '-1.5rem' }}>
              <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: '50%', overflow: 'hidden' }}>
                <img
                  src="/assets/icons/doctor_main.webp"
                  alt="科室主任"
                  style={{ width: '100%', height: '130%', objectFit: 'cover', objectPosition: 'top' }}
                />
              </div>
            </div>

            <div
              style={{
                backgroundColor: 'rgba(255,255,255,0.92)',
                backdropFilter: 'blur(8px)',
                borderRadius: '1rem',
                padding: '0.5rem 0.75rem',
                boxShadow: '0 8px 32px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.1)',
                border: '1px solid #e5e7eb',
              }}
              onClick={() => removeNotification(notification.id)}
            >
              <p style={{ color: '#dc2626', fontWeight: 700, fontSize: '0.875rem', lineHeight: 1.4, whiteSpace: 'nowrap' }}>
                {notification.message}
              </p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}