import { useTranslation } from 'react-i18next';
import { useGameStore } from '../stores/gameStore';
import type { Patient } from '../types/game';

const PATIENT_ICONS: Record<string, string> = {
  xray: '/assets/icons/icon_dr.webp',
  ct: '/assets/icons/icon_ct.webp',
  mri: '/assets/icons/icon_mri.webp',
  emergency: '/assets/icons/icon_emergency.webp',
};

const PATIENT_BG: Record<string, string> = {
  xray: '#eff6ff',
  ct: '#f5f3ff',
  mri: '#f0fdf4',
  emergency: '#fef2f2',
};

const PATIENT_BORDER: Record<string, string> = {
  xray: '#bfdbfe',
  ct: '#ddd6fe',
  mri: '#bbf7d0',
  emergency: '#fecaca',
};

const getPatienceColor = (percent: number) => {
  if (percent > 50) return '#4ade80';
  if (percent > 25) return '#facc15';
  return '#f87171';
};

export function PatientQueue() {
  const { t } = useTranslation();
  const { patients, selectedPatient, selectPatient, status } = useGameStore();

  if (status === 'idle') return null;

  const handleSelect = (patient: Patient) => {
    if (status !== 'playing') return;
    selectPatient(selectedPatient?.id === patient.id ? null : patient);
  };

  return (
    <div style={{
      height: '100%',
      borderRadius: '1rem',
      backgroundColor: 'rgba(255,255,255,0.3)',
      backdropFilter: 'blur(12px)',
      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
      border: '1px solid rgba(255,255,255,0.2)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <div style={{ flexShrink: 0, padding: 'clamp(0.5rem, 2vw, 0.75rem) clamp(0.75rem, 2vw, 1rem)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
        <h2 style={{ fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)', fontWeight: 700, color: '#374151', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <span style={{ fontSize: 'clamp(0.875rem, 2.5vw, 1rem)' }}>📋</span> {t('ui.waitingRoom')}
          <span style={{ fontSize: 'clamp(0.625rem, 2vw, 0.75rem)', fontWeight: 400, color: '#9ca3af' }}>({patients.length}/20)</span>
        </h2>
      </div>

      <div style={{ flex: 1, minHeight: 0, padding: '0.5rem', overflowY: 'auto' }}>
        {patients.length === 0 ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: 'clamp(0.625rem, 2vw, 0.75rem)' }}>
            {t('ui.noPatients')}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
            {patients.map((patient) => {
              const isSelected = selectedPatient?.id === patient.id;
              const patiencePercent = (patient.patience / patient.maxPatience) * 100;

              return (
                <div
                  key={patient.id}
                  onClick={() => handleSelect(patient)}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    padding: 'clamp(0.375rem, 1.5vw, 0.625rem)',
                    borderRadius: '0.5rem',
                    border: `1px solid ${PATIENT_BORDER[patient.type]}`,
                    backgroundColor: PATIENT_BG[patient.type],
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    userSelect: 'none',
                    ...(isSelected ? {
                      outline: '2px solid #f59e0b',
                      outlineOffset: '-2px',
                      backgroundColor: 'rgba(253,230,138,0.5)',
                    } : {}),
                  }}
                >
                  <img
                    src={PATIENT_ICONS[patient.type]}
                    alt=""
                    style={{ width: 'clamp(1.5rem, 4vw, 2rem)', height: 'clamp(1.5rem, 4vw, 2rem)', flexShrink: 0 }}
                  />

                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.25rem' }}>
                      <span style={{ fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)', fontWeight: 500, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{patient.name}</span>
                      {patient.type === 'emergency' && (
                        <span style={{ flexShrink: 0, fontSize: 'clamp(0.625rem, 2vw, 0.75rem)', fontWeight: 700, color: '#dc2626', backgroundColor: '#fee2e2', padding: '0 0.5rem', borderRadius: '0.25rem' }}>{t('ui.emergency')}</span>
                      )}
                    </div>
                    <div style={{ backgroundColor: 'rgba(209,213,219,0.6)', borderRadius: '9999px', height: 'clamp(4px, 1.5vw, 6px)', overflow: 'hidden' }}>
                      <div
                        style={{ height: '100%', borderRadius: '9999px', transition: 'background-color 0.3s', width: `${patiencePercent}%`, backgroundColor: getPatienceColor(patiencePercent) }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}