import { useGameStore } from '../stores/gameStore';
import type { Patient } from '../types/game';

const PATIENT_ICONS: Record<string, string> = {
  xray: '🩻',
  ct: '🧠',
  mri: '🔬',
  emergency: '🚨',
};

const PATIENT_COLORS: Record<string, string> = {
  xray: 'bg-blue-50 border-blue-200',
  ct: 'bg-purple-50 border-purple-200',
  mri: 'bg-green-50 border-green-200',
  emergency: 'bg-red-50 border-red-200',
};

const PATIENCE_COLORS: Record<string, string> = {
  high: 'bg-green-400',
  medium: 'bg-yellow-400',
  low: 'bg-red-400',
};

function getPatienceColor(percent: number): string {
  if (percent > 50) return PATIENCE_COLORS.high;
  if (percent > 25) return PATIENCE_COLORS.medium;
  return PATIENCE_COLORS.low;
}

export function PatientQueue() {
  const { patients, selectedPatient, selectPatient, status } = useGameStore();

  if (status === 'idle') return null;

  const handleSelect = (patient: Patient) => {
    if (status !== 'playing') return;
    selectPatient(selectedPatient?.id === patient.id ? null : patient);
  };

  return (
    <div className="h-full rounded-2xl bg-white/30 backdrop-blur-lg shadow-lg ring-1 ring-white/20 flex flex-col overflow-hidden">
      <div className="shrink-0 px-3 py-2 flex items-center justify-between border-b border-white/20">
        <h2 className="text-xs sm:text-sm font-bold text-gray-700 flex items-center gap-1">
          <span>📋</span> 候诊区
          <span className="text-[10px] sm:text-xs font-normal text-gray-400">({patients.length}/20)</span>
        </h2>
      </div>

      <div className="flex-1 min-h-0 p-2 overflow-y-auto">
        {patients.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400 text-xs">
            暂无候诊病人
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {patients.map((patient) => {
              const isSelected = selectedPatient?.id === patient.id;
              const patiencePercent = (patient.patience / patient.maxPatience) * 100;

              return (
                <div
                  key={patient.id}
                  onClick={() => handleSelect(patient)}
                  className={`
                    relative flex items-center gap-1.5 px-2 py-1.5 rounded-lg border cursor-pointer
                    transition-all select-none
                    ${PATIENT_COLORS[patient.type]}
                    ${isSelected ? 'ring-2 ring-amber-400 bg-amber-50/80' : 'hover:bg-white/50'}
                  `}
                >
                  <span className="text-xl sm:text-2xl shrink-0">{PATIENT_ICONS[patient.type]}</span>

                  <div className="flex-1 min-w-0 flex flex-col gap-2 px-3 py-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-sm sm:text-base font-medium text-gray-700 truncate">{patient.name}</span>
                      {patient.type === 'emergency' && (
                        <span className="shrink-0 text-xs sm:text-sm font-bold text-red-500 bg-red-100 px-2 rounded">急</span>
                      )}
                    </div>
                    <div className="bg-gray-200/60 rounded-full h-[6px] sm:h-[8px] overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-colors duration-300 ${getPatienceColor(patiencePercent)}`}
                        style={{ width: `${patiencePercent}%` }}
                      />
                    </div>
                  </div>

                  {isSelected && (
                    <div className="absolute -inset-[2px] rounded-lg border-2 border-amber-400 pointer-events-none" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
