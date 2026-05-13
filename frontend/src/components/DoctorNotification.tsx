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
      if (updated.length > MAX_NOTIFICATIONS) {
        return updated.slice(1);
      }
      return updated;
    });

    playSFX('sfx_doctor_notify');
  }, []);

  useEffect(() => {
    if (status !== 'playing') return;

    // Add first notification after a short delay
    const initialTimeout = setTimeout(() => {
      addNotification();
    }, 5000);

    // Set up interval for subsequent notifications
    let intervalId: ReturnType<typeof setInterval>;

    const scheduleNext = () => {
      const delay = [10000, 12500, 15000][Math.floor(Math.random() * 3)]; // random 10-15s
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
    if (status !== 'playing') {
      setNotifications([]);
    }
  }, [status]);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <div className="fixed bottom-16 right-4 z-50 flex flex-col gap-2 pointer-events-none items-end">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ x: 120, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 80, opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="relative pointer-events-auto cursor-pointer group flex items-end"
          >
            {/* Avatar - left side, overlapping bubble edge */}
            <div className="relative shrink-0 z-10 -mr-6">
              <div className="w-14 h-14 rounded-full overflow-hidden">
                <img
                  src="/assets/doctor_main.webp"
                  alt="科室主任"
                  className="w-full h-[130%] object-cover object-top"
                />
              </div>
            </div>

            {/* Bubble body */}
            <div
              className="bg-white/90 backdrop-blur-sm rounded-2xl px-3 py-2 shadow-xl border border-gray-200 hover:bg-white hover:shadow-2xl transition-all duration-150 inline-flex items-center relative group cursor-pointer"
              style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.1)' }}
              onClick={() => removeNotification(notification.id)}
            >
              <p className="text-red-600 font-bold text-sm leading-snug whitespace-nowrap">
                {notification.message}
              </p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}