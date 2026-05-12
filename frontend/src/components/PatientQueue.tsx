import { motion } from 'framer-motion';
import { useGameStore } from '../stores/gameStore';
import type { Patient } from '../types/game';

const PATIENT_ICONS: Record<string, string> = {
  xray: '🩻',
  ct: '🧠',
  mri: '🔬',
  emergency: '🚨',
};

const PATIENT_COLORS: Record<string, string> = {
  xray: 'bg-blue-100 border-blue-300',
  ct: 'bg-purple-100 border-purple-300',
  mri: 'bg-green-100 border-green-300',
  emergency: 'bg-red-100 border-red-300 animate-pulse',
};

export function PatientQueue() {
  const { patients, selectedPatient, selectPatient, status } = useGameStore();

  if (status === 'idle') return null;

  const handleSelect = (patient: Patient) => {
    if (status !== 'playing') return;
    selectPatient(selectedPatient?.id === patient.id ? null : patient);
  };

  return (
    <div className="relative overflow-hidden rounded-xl shadow-md flex flex-col min-h-0">
      <img
        src="/assets/scenes/waiting_room.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-white/70 backdrop-blur-sm" />
      
      <div className="relative p-3 sm:p-4 flex flex-col min-h-0">
        <h2 className="text-sm sm:text-lg font-bold text-gray-700 mb-2 sm:mb-3 flex items-center gap-1 sm:gap-2 shrink-0">
          <span>📋</span> 候诊区
          <span className="text-xs sm:text-sm font-normal text-gray-500">({patients.length})</span>
        </h2>
        
        <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 flex-1 min-h-0">
          {patients.length === 0 && (
            <div className="text-gray-400 text-xs sm:text-sm py-6 sm:py-8 text-center w-full">
              暂无候诊病人
            </div>
          )}
          
          {patients.map((patient, index) => {
            const isSelected = selectedPatient?.id === patient.id;
            const patiencePercent = (patient.patience / patient.maxPatience) * 100;
            
            return (
              <motion.div
                key={patient.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleSelect(patient)}
                className={`
                  relative flex-shrink-0 w-20 sm:w-24 p-2 sm:p-3 rounded-lg sm:rounded-xl border cursor-pointer
                  transition-all select-none
                  ${PATIENT_COLORS[patient.type]}
                  ${isSelected ? 'ring-4 ring-yellow-400 scale-105 shadow-xl' : 'hover:scale-102'}
                  ${patient.type === 'emergency' ? 'ring-2 ring-red-500' : ''}
                `}
              >
                <div className="text-2xl sm:text-3xl mb-0.5 sm:mb-1">{PATIENT_ICONS[patient.type]}</div>
                <div className="text-[10px] sm:text-xs font-medium text-gray-700 truncate">{patient.name}</div>
                
                <div className="mt-1.5 sm:mt-2 bg-gray-200 rounded-full h-1 sm:h-1.5 overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full transition-colors ${
                      patiencePercent > 50 ? 'bg-green-400' :
                      patiencePercent > 25 ? 'bg-yellow-400' : 'bg-red-400'
                    }`}
                    initial={{ width: `${patiencePercent}%` }}
                    animate={{ width: `${patiencePercent}%` }}
                  />
                </div>
                
                {patient.type === 'emergency' && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1 py-0.5 rounded-full font-bold">
                    急
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}