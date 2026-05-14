import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../stores/gameStore';

export function ReportList() {
  const { pendingReports, toggleReportComplete, submitReports, status } = useGameStore();
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // 重置为 playing 时关闭面板
  useEffect(() => {
    if (status === 'playing') {
      setIsOpen(false);
    }
  }, [status]);

  // 点击非报告容器区域关闭
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isOpen && panelRef.current && !panelRef.current.contains(e.target as Node)) {
        const button = document.querySelector('[data-report-button]');
        if (button && !button.contains(e.target as Node)) {
          setIsOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const incompleteCount = pendingReports.filter(r => !r.completed).length;
  const completedCount = pendingReports.filter(r => r.completed).length;

  const handleSubmit = () => {
    submitReports();
    setIsOpen(false);
  };

  if (status !== 'playing') return null;

  return (
    <>
      {/* Report Count Icon Button */}
      <button
        data-report-button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 left-4 z-40 flex items-center"
      >
        <div className="relative pointer-events-auto">
          <img
            src="/assets/icons/computer_icon.webp"
            alt="报告"
            className="w-16 h-16"
          />
          {incompleteCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 15 }}
              className="absolute -top-1 -right-1 bg-red-500 text-white text-sm font-bold rounded-full min-w-[22px] h-[22px] flex items-center justify-center px-1"
            >
              {incompleteCount}
            </motion.span>
          )}
        </div>
      </button>

      {/* Report List Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={panelRef}
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed bottom-4 left-4 z-50 w-80 bg-transparent overflow-hidden"
          >
            {/* Header */}
            <div className="bg-blue-500 text-white px-4 py-3 flex items-center justify-between rounded-t-2xl">
              <h3 className="font-bold text-sm">待写报告清单</h3>
            </div>

            {/* Report List */}
            <div className="max-h-80 overflow-y-auto bg-white/95 backdrop-blur-sm">
              {pendingReports.length === 0 ? (
                <div className="px-4 py-6 text-center text-gray-400 text-sm">
                  暂无待写报告
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {pendingReports.map((report) => (
                    <li
                      key={report.id}
                      className="px-3 py-2.5 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                    >
                      <button
                        onClick={() => toggleReportComplete(report.id)}
                        className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                          report.completed
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-gray-300 hover:border-blue-400'
                        }`}
                      >
                        {report.completed && '✓'}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${
                          report.completed ? 'line-through text-gray-400' : 'text-gray-800'
                        }`}>
                          {report.patientName}
                        </p>
                        <p className="text-xs text-gray-500">{report.roomName}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Submit Button */}
            <div className="bg-white/95 backdrop-blur-sm border-t border-gray-200 p-3 rounded-b-2xl">
              <button
                onClick={handleSubmit}
                disabled={completedCount === 0}
                className={`w-full py-2.5 rounded-xl font-bold text-sm transition-colors ${
                  completedCount > 0
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                提交已完成报告 ({completedCount})
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}