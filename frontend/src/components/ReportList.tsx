import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '../stores/gameStore';

export function ReportList() {
  const { t } = useTranslation();
  const { pendingReports, toggleReportComplete, submitReports, status, patientLeftAlert, dismissPatientLeftAlert, difficultyAlertShown, dismissDifficultyAlert } = useGameStore();
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === 'playing') setIsOpen(false);
  }, [status]);

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

  const handleComputerClick = () => {
    if (patientLeftAlert) {
      dismissPatientLeftAlert();
      if (difficultyAlertShown) dismissDifficultyAlert();
      return;
    }
    setIsOpen(!isOpen);
  };

  if (status !== 'playing') return null;

  return (
    <>
      <button
        data-report-button
        onClick={handleComputerClick}
        style={{ position: 'fixed', bottom: '1rem', left: '1rem', zIndex: 40, display: 'flex', alignItems: 'center' }}
      >
        <div style={{ position: 'relative', pointerEvents: 'auto' }}>
          <img
            src="/assets/icons/computer_icon.webp"
            alt={t('report.title')}
            style={{ width: '4rem', height: '4rem' }}
          />
          {incompleteCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 15 }}
              style={{
                position: 'absolute',
                top: '-0.25rem',
                right: '-0.25rem',
                backgroundColor: '#ef4444',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: 700,
                borderRadius: '9999px',
                minWidth: '1.375rem',
                height: '1.375rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 0.25rem',
              }}
            >
              {incompleteCount}
            </motion.span>
          )}
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={panelRef}
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{ position: 'fixed', bottom: '1rem', left: '1rem', zIndex: 50, width: '20rem', backgroundColor: 'transparent', overflow: 'hidden' }}
          >
            <div style={{ backgroundColor: '#2563eb', color: 'white', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '1rem 1rem 0 0' }}>
              <h3 style={{ fontWeight: 700, fontSize: '0.875rem' }}>{t('report.title')}</h3>
            </div>

            <div style={{ maxHeight: '20rem', overflowY: 'auto', backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)' }}>
              {pendingReports.length === 0 ? (
                <div style={{ padding: '1.5rem 1rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.875rem' }}>
                  {t('report.empty')}
                </div>
              ) : (
                <ul style={{ borderTop: '1px solid #f3f4f6' }}>
                  {pendingReports.map((report) => (
                    <li
                      key={report.id}
                      style={{ padding: '0.625rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid #f9fafb', cursor: 'pointer' }}
                      onClick={() => { /* click handled by button */ }}
                    >
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleReportComplete(report.id); }}
                        style={{
                          width: '1.5rem',
                          height: '1.5rem',
                          borderRadius: '0.375rem',
                          border: '2px solid',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          ...(report.completed
                            ? { backgroundColor: '#22c55e', borderColor: '#22c55e', color: 'white' }
                            : { borderColor: '#d1d5db', backgroundColor: 'transparent' }),
                        }}
                      >
                        {report.completed && '✓'}
                      </button>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          ...(report.completed ? { textDecoration: 'line-through', color: '#9ca3af' } : { color: '#1f2937' }),
                        }}>
                          {report.patientName}
                        </p>
                        <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>{report.roomName}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div style={{ backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', borderTop: '1px solid #e5e7eb', padding: '0.75rem', borderRadius: '0 0 1rem 1rem' }}>
              <button
                onClick={handleSubmit}
                disabled={completedCount === 0}
                style={{
                  width: '100%',
                  padding: '0.625rem',
                  borderRadius: '0.75rem',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  border: 'none',
                  cursor: completedCount > 0 ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s',
                  ...(completedCount > 0
                    ? { background: 'linear-gradient(to right, #22c55e, #16a34a)', color: 'white', boxShadow: '0 4px 6px -1px rgba(34,197,94,0.3)' }
                    : { backgroundColor: '#e5e7eb', color: '#9ca3af' }),
                }}
              >
                {t('report.submit')} ({completedCount})
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {patientLeftAlert && (
        <div
          onClick={dismissPatientLeftAlert}
          style={{
            position: 'fixed',
            bottom: '2rem',
            left: '1rem',
            zIndex: 42,
            backgroundColor: '#fef3c7',
            border: '2px solid #f59e0b',
            borderRadius: '0.75rem',
            padding: '0.375rem 0.625rem',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.1)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'flex-start',
          }}
        >
          <div>
            <p
              style={{ color: '#92400e', fontWeight: 700, fontSize: '0.75rem', lineHeight: 1.4 }}
              dangerouslySetInnerHTML={{ __html: t('report.freezeTip').replace('\n', '<br />') }}
            />
          </div>
        </div>
      )}
    </>
  );
}