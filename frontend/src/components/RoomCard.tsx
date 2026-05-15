import { useTranslation } from 'react-i18next';
import { useGameStore } from '../stores/gameStore';
import type { Room } from '../types/game';

const PATIENT_TYPE_ICONS: Record<string, string> = {
  emergency: '/assets/icons/icon_emergency.webp',
  xray: '/assets/icons/icon_dr.webp',
  ct: '/assets/icons/icon_ct.webp',
  mri: '/assets/icons/icon_mri.webp',
};

const ROOM_IMAGES: Record<string, string> = {
  dr: '/assets/scenes/dr_room.webp',
  ct: '/assets/scenes/ct_room.webp',
  mri: '/assets/scenes/mri_room.webp',
  registration: '/assets/scenes/waiting_room.webp',
};

function RoomCard({ room }: { room: Room }) {
  const { t } = useTranslation();
  const { selectedPatient, assignPatientToRoom, status } = useGameStore();

  const canAccept = selectedPatient &&
    room.acceptedTypes.includes(selectedPatient.type) &&
    !room.isBusy &&
    status === 'playing';

  const handleClick = () => {
    if (canAccept && selectedPatient) {
      assignPatientToRoom(selectedPatient, room.id);
    }
  };

  return (
    <div
      onClick={handleClick}
      style={{
        position: 'relative',
        borderRadius: '0.5rem',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        height: '100%',
        transition: 'transform 0.2s',
        opacity: room.isBusy ? 0.9 : 1,
      }}
    >
      {canAccept && (
        <div style={{ position: 'absolute', inset: '-3px', borderRadius: '0.75rem', border: '3px solid #f59e0b', backgroundColor: 'rgba(245,158,11,0.1)', pointerEvents: 'none', zIndex: 20 }} />
      )}
      <img
        src={ROOM_IMAGES[room.type]}
        alt={room.name}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0.5rem' }}
      />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0.2), transparent)', borderRadius: '0.5rem' }} />

      <div style={{ position: 'relative', padding: 'clamp(0.25rem, 1.5vw, 0.5rem)', color: 'white', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '100%', zIndex: 10 }}>
        <div style={{ position: 'absolute', top: 'clamp(0.375rem, 1.5vw, 0.625rem)', right: 'clamp(0.375rem, 1.5vw, 0.625rem)' }}>
          <div style={{
            padding: '0.125rem 0.375rem',
            borderRadius: '9999px',
            fontSize: 'clamp(0.5rem, 2vw, 0.625rem)',
            fontWeight: 700,
            backgroundColor: room.isBusy ? 'rgba(239,68,68,0.8)' : 'rgba(34,197,94,0.8)',
          }}>
            {room.isBusy ? t('ui.busy') : t('ui.idle')}
          </div>
        </div>

        <div style={{ minWidth: 0, flex: 1 }}>
          <h3 style={{ fontSize: 'clamp(0.625rem, 2vw, 0.75rem)', fontWeight: 700, textShadow: '0 1px 3px rgba(0,0,0,0.5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{room.name}</h3>

          {room.isBusy && room.currentPatient && (
            <div style={{ marginTop: '0.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <img
                  src={PATIENT_TYPE_ICONS[room.currentPatient.type]}
                  alt=""
                  style={{ width: 'clamp(0.875rem, 2.5vw, 1.125rem)', height: 'clamp(0.875rem, 2.5vw, 1.125rem)' }}
                />
                <span style={{ fontSize: 'clamp(0.5rem, 2vw, 0.625rem)', fontWeight: 500, textShadow: '0 1px 3px rgba(0,0,0,0.5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{room.currentPatient.name}</span>
              </div>

              <div style={{ backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: '9999px', height: 'clamp(3px, 1vw, 6px)', overflow: 'hidden', marginTop: '0.25rem' }}>
                <div
                  style={{ height: '100%', backgroundColor: 'white', borderRadius: '9999px', width: `${((room.currentPatient.processTime - room.remainingTime) / room.currentPatient.processTime) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {room.isBusy && room.currentPatient && (
          <div style={{ flexShrink: 0, fontSize: 'clamp(0.5rem, 2vw, 0.625rem)', color: 'rgba(255,255,255,0.7)', marginLeft: '0.25rem' }}>
            {(room.remainingTime / 1000).toFixed(1)}s
          </div>
        )}
      </div>
    </div>
  );
}

export function RoomList() {
  const { t } = useTranslation();
  const { rooms, status } = useGameStore();

  if (status === 'idle') return null;

  const activeRooms = rooms.filter(r => r.type !== 'registration');

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.25rem',
      padding: 'clamp(0.5rem, 2vw, 0.75rem)',
      borderRadius: '1rem',
      backgroundColor: 'rgba(255,255,255,0.3)',
      backdropFilter: 'blur(12px)',
      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
      border: '1px solid rgba(255,255,255,0.2)',
      overflow: 'hidden',
    }}>
      <h2 style={{ fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)', fontWeight: 700, color: '#374151', display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0 }}>
        <span style={{ fontSize: 'clamp(0.875rem, 2.5vw, 1rem)' }}>🏥</span> {t('ui.examRoom')}
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', flex: 1, minHeight: 0 }}>
        {activeRooms.map(room => (
          <RoomCard key={room.id} room={room} />
        ))}
      </div>
    </div>
  );
}