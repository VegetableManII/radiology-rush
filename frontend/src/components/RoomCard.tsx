import { motion } from 'framer-motion';
import { useGameStore } from '../stores/gameStore';
import type { Room } from '../types/game';

const ROOM_IMAGES: Record<string, string> = {
  dr: '/assets/scenes/dr_room.png',
  ct: '/assets/scenes/ct_room.png',
  mri: '/assets/scenes/mri_room.png',
  registration: '/assets/scenes/waiting_room.png',
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
    <motion.div
      whileHover={canAccept ? { scale: 1.02 } : {}}
      whileTap={canAccept ? { scale: 0.98 } : {}}
      onClick={handleClick}
      className={`
        relative overflow-hidden rounded-xl shadow-md cursor-pointer
        flex flex-col min-h-0
        ${canAccept ? 'ring-4 ring-yellow-400 ring-offset-2' : ''}
        ${room.isBusy ? 'opacity-90' : ''}
      `}
    >
      <img
        src={ROOM_IMAGES[room.type]}
        alt={room.name}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      
      <div className="relative p-3 sm:p-5 text-white flex flex-col justify-end h-full">
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4">
          <div className={`
            px-1.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold
            ${room.isBusy ? 'bg-red-500/80' : 'bg-green-500/80'}
          `}>
            {room.isBusy ? '工作中' : '空闲'}
          </div>
        </div>
        
        <h3 className="text-sm sm:text-xl font-bold mb-0.5 sm:mb-1 drop-shadow-lg">{room.name}</h3>

        {room.isBusy && room.currentPatient && (
          <motion.div 
            className="mt-1 sm:mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
              <span className="text-base sm:text-2xl">
                {room.currentPatient.type === 'emergency' ? '🚨' : 
                 room.currentPatient.type === 'xray' ? '🩻' :
                 room.currentPatient.type === 'ct' ? '🧠' : '🔬'}
              </span>
              <span className="font-medium text-xs sm:text-base drop-shadow truncate">{room.currentPatient.name}</span>
            </div>
            
            <div className="bg-white/30 rounded-full h-1.5 sm:h-2 overflow-hidden">
              <motion.div
                className="h-full bg-white rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((room.currentPatient.processTime - room.remainingTime) / room.currentPatient.processTime) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            
            <div className="text-[10px] sm:text-xs text-white/70 mt-0.5 text-right">
              {(room.remainingTime / 1000).toFixed(1)}秒
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export function RoomList() {
  const { rooms, status } = useGameStore();

  if (status === 'idle') return null;

  const activeRooms = rooms.filter(r => r.type !== 'registration');

  return (
    <div className="flex flex-col gap-2 sm:gap-3 overflow-auto">
      <h2 className="text-sm sm:text-lg font-bold text-gray-700 flex items-center gap-1 sm:gap-2 shrink-0 px-1">
        <span>🏥</span> 检查室
      </h2>
      
      <div className="grid grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-3 flex-1 min-h-0">
        {activeRooms.map(room => (
          <RoomCard key={room.id} room={room} />
        ))}
      </div>
    </div>
  );
}