import { useGameStore } from '../stores/gameStore';
import type { Room } from '../types/game';

const ROOM_IMAGES: Record<string, string> = {
  dr: '/assets/scenes/webp/dr_room.webp',
  ct: '/assets/scenes/webp/ct_room.webp',
  mri: '/assets/scenes/webp/mri_room.webp',
  registration: '/assets/scenes/webp/waiting_room.webp',
};

export function RoomCard({ room }: { room: Room }) {
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
      className={`
        relative rounded-lg shadow-md cursor-pointer
        flex flex-col min-h-0 h-full
        transition-transform duration-200
        ${room.isBusy ? 'opacity-90' : ''}
        ${canAccept ? 'hover:scale-[1.02]' : ''}
      `}
    >
      {canAccept && (
        <div className="absolute -inset-[3px] rounded-lg border-[3px] border-amber-400 bg-amber-400/10 pointer-events-none z-20" />
      )}
      <img
        src={ROOM_IMAGES[room.type]}
        alt={room.name}
        className="absolute inset-0 w-full h-full object-cover rounded-lg"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent rounded-lg" />

      <div className="relative px-2 py-1.5 sm:px-3 sm:py-2 text-white flex items-end justify-between h-full z-10">
        <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2">
          <div className={`
            px-1 py-0.5 rounded-full text-[8px] sm:text-[10px] font-bold
            ${room.isBusy ? 'bg-red-500/80' : 'bg-green-500/80'}
          `}>
            {room.isBusy ? '工作中' : '空闲'}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-xs sm:text-sm font-bold drop-shadow-lg truncate">{room.name}</h3>

          {room.isBusy && room.currentPatient && (
            <div className="mt-0.5 sm:mt-1">
              <div className="flex items-center gap-1">
                <span className="text-xs sm:text-base">
                  {room.currentPatient.type === 'emergency' ? '🚨' :
                   room.currentPatient.type === 'xray' ? '🩻' :
                   room.currentPatient.type === 'ct' ? '🧠' : '🔬'}
                </span>
                <span className="font-medium text-[10px] sm:text-xs drop-shadow truncate">{room.currentPatient.name}</span>
              </div>

              <div className="bg-white/30 rounded-full h-1 sm:h-1.5 overflow-hidden mt-0.5">
                <div
                  className="h-full bg-white rounded-full"
                  style={{ width: `${((room.currentPatient.processTime - room.remainingTime) / room.currentPatient.processTime) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {room.isBusy && room.currentPatient && (
          <div className="shrink-0 text-[8px] sm:text-[10px] text-white/70 ml-1">
            {(room.remainingTime / 1000).toFixed(1)}s
          </div>
        )}
      </div>
    </div>
  );
}

export function RoomList() {
  const { rooms, status } = useGameStore();

  if (status === 'idle') return null;

  const activeRooms = rooms.filter(r => r.type !== 'registration');

  return (
    <div className="h-full flex flex-col gap-1 px-3 py-2 rounded-2xl bg-white/30 backdrop-blur-lg shadow-lg ring-1 ring-white/20 overflow-hidden">
      <h2 className="text-xs sm:text-sm font-bold text-gray-700 flex items-center gap-1 shrink-0">
        <span>🏥</span> 检查室
      </h2>

      <div className="grid grid-cols-3 gap-2 flex-1 min-h-0">
        {activeRooms.map(room => (
          <RoomCard key={room.id} room={room} />
        ))}
      </div>
    </div>
  );
}