import i18n from 'i18next';
import { create } from 'zustand';
import type { GameState, Patient, PatientType, Room, RoomType, PendingReport } from '../types/game';
import { playSFX } from '../hooks/useSound';

export type GamePhase = 'idle' | 'playing' | 'minigame' | 'paused' | 'gameover';

const PATIENT_CONFIGS: { type: PatientType; room: RoomType; baseTime: number; reward: number }[] = [
  { type: 'xray', room: 'dr', baseTime: 3000, reward: 10 },
  { type: 'ct', room: 'ct', baseTime: 5000, reward: 20 },
  { type: 'mri', room: 'mri', baseTime: 7000, reward: 30 },
  { type: 'emergency', room: 'dr', baseTime: 4000, reward: 15 },
];

let patientIdCounter = 0;
let roomIdCounter = 0;
const generatePatientId = () => `p-${Date.now()}-${patientIdCounter++}`;
const generateRoomId = () => `r-${Date.now()}-${roomIdCounter++}`;

const getPatientName = () => {
  const names = i18n.t('patient.names', { returnObjects: true }) as string[];
  return names[Math.floor(Math.random() * names.length)];
};

const getRoomName = (type: RoomType) => {
  return i18n.t(`room.${type}`);
};

const getAcceptedTypes = (type: RoomType): PatientType[] => {
  switch (type) {
    case 'dr': return ['xray', 'emergency'];
    case 'ct': return ['ct', 'emergency'];
    case 'mri': return ['mri'];
    case 'registration': return ['xray', 'ct', 'mri', 'emergency'];
    default: return [];
  }
};

const generatePatient = (difficulty: number): Patient => {
  const rand = Math.random();
  let type: PatientType;

  if (rand < 0.40) type = 'xray';
  else if (rand < 0.70) type = 'ct';
  else if (rand < 0.90) type = 'mri';
  else type = 'emergency';

  const config = PATIENT_CONFIGS.find(c => c.type === type)!;
  const patienceReduction = Math.min(0.5, difficulty * 0.05);
  const basePatience = Math.max(2000, 15000 - (difficulty * 500));

  const name = getPatientName();

  const fullPatience = basePatience;
  const patienceSpeed = 0.3 + Math.random() * 0.9;

  return {
    id: generatePatientId(),
    type,
    patience: fullPatience,
    maxPatience: fullPatience,
    patienceSpeed,
    requiredRoom: config.room,
    processTime: config.baseTime * (1 - patienceReduction * 0.3),
    reward: config.reward,
    mood: 100,
    name,
  };
};

const createRooms = (): Room[] => {
  const roomTypes: RoomType[] = ['dr', 'ct', 'mri', 'registration'];
  return roomTypes.map(type => ({
    id: generateRoomId(),
    type,
    name: getRoomName(type),
    isBusy: false,
    currentPatient: null,
    remainingTime: 0,
    queue: [],
    acceptedTypes: getAcceptedTypes(type),
    minigameScore: 0,
  }));
};

interface GameStore extends GameState {
  phase: GamePhase;
  currentMinigamePatient: Patient | null;
  currentRoomType: RoomType | null;
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  endGame: () => void;
  selectPatient: (patient: Patient | null) => void;
  assignPatientToRoom: (patient: Patient, roomId: string) => void;
  startMinigame: (patient: Patient) => void;
  completeMinigame: (score: number) => void;
  skipMinigame: () => void;
  updateGame: (deltaTime: number) => void;
  addPatient: () => void;
  resetGame: () => void;
  addPendingReport: (patientName: string, roomName: string) => void;
  toggleReportComplete: (reportId: string) => void;
  submitReports: () => void;
  dismissPatientLeftAlert: () => void;
  dismissDifficultyAlert: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  status: 'idle',
  phase: 'idle',
  score: 0,
  lives: 10,
  time: 0,
  combo: 0,
  patients: [],
  rooms: createRooms(),
  selectedPatient: null,
  gameSpeed: 1,
  currentMinigamePatient: null,
  currentRoomType: null,
  pendingReports: [],
  emergencyCount: 0,
  emergencyHearts: 0,
  normalCount: 0,
  normalHearts: 0,
  patientLeftAlert: false,
  difficulty: 0,
  difficultyAlertShown: false,
  freezeSeconds: 0,

  startGame: () => {
    set({
      status: 'playing',
      phase: 'playing',
      score: 0,
      lives: 10,
      time: 0,
      combo: 0,
      patients: [],
      rooms: createRooms(),
      selectedPatient: null,
      gameSpeed: 1,
      currentMinigamePatient: null,
      currentRoomType: null,
      pendingReports: [],
      emergencyCount: 0,
      normalCount: 0,
      patientLeftAlert: false,
      difficulty: 0,
      difficultyAlertShown: false,
      freezeSeconds: 0,
    });
  },

  pauseGame: () => {
    const { phase } = get();
    if (phase === 'playing' || phase === 'minigame') {
      set({ status: 'paused', phase: 'paused' });
    }
  },

  resumeGame: () => {
    const { currentMinigamePatient } = get();
    set({
      status: 'playing',
      phase: currentMinigamePatient ? 'minigame' : 'playing'
    });
  },

  endGame: () => {
    set({ status: 'gameover', phase: 'gameover' });
    playSFX('sfx_game_over');
  },

  resetGame: () => {
    const { startGame } = get();
    startGame();
  },

  selectPatient: (patient) => set({ selectedPatient: patient }),

  assignPatientToRoom: (patient, roomId) => {
    const { rooms, patients } = get();
    const room = rooms.find(r => r.id === roomId);

    if (!room || room.isBusy) return;
    if (!room.acceptedTypes.includes(patient.type)) return;

    const updatedRooms = rooms.map(r => {
      if (r.id === roomId) {
        return {
          ...r,
          isBusy: true,
          currentPatient: patient,
          remainingTime: patient.processTime,
          minigameScore: 0,
        };
      }
      return r;
    });

    const updatedPatients = patients.filter(p => p.id !== patient.id);

    set({
      rooms: updatedRooms,
      patients: updatedPatients,
      selectedPatient: null,
      currentMinigamePatient: patient,
      currentRoomType: room.type,
      phase: 'minigame',
    });
  },

  startMinigame: (patient) => {
    set({ currentMinigamePatient: patient, phase: 'minigame' });
  },

  completeMinigame: (success) => {
    const { rooms, currentMinigamePatient, score, combo, pendingReports, emergencyCount, emergencyHearts, lives, normalCount, normalHearts } = get();
    if (!currentMinigamePatient) return;

    const baseReward = currentMinigamePatient.reward;
    const minigameScore = success ? 1 : 0.5;
    const finalScore = Math.floor(baseReward * minigameScore);
    const newCombo = combo + 1;
    const bonusPatience = Math.floor(currentMinigamePatient.patience / 100);

    const updatedRooms = rooms.map(r => {
      if (r.currentPatient?.id === currentMinigamePatient.id) {
        return {
          ...r,
          isBusy: false,
          currentPatient: null,
          remainingTime: 0,
          minigameScore: 0,
        };
      }
      return r;
    });

    const room = rooms.find(r => r.currentPatient?.id === currentMinigamePatient.id);
    const newPendingReport: PendingReport | null = success === 1 ? {
      id: `report-${Date.now()}-${Math.random()}`,
      patientName: currentMinigamePatient.name,
      roomName: room?.name || '',
      completed: false,
    } : null;

    const isEmergency = currentMinigamePatient.type === 'emergency';
    const newEmergencyCount = isEmergency ? emergencyCount + 1 : 0;
    const emergencyHeartsEarned = Math.floor(newEmergencyCount / 1);
    const remainderEmergency = newEmergencyCount % 1;

    const newNormalCount = success === 1 && !isEmergency ? normalCount + 1 : normalCount;
    const normalHeartsEarned = Math.floor(newNormalCount / 2);
    const remainderNormal = newNormalCount % 2;

    const totalHeartsEarned = emergencyHeartsEarned + normalHeartsEarned;

    if (totalHeartsEarned > 0 && lives < 10) {
      playSFX('sfx_heart_earn');
    }

    set({
      rooms: updatedRooms,
      currentMinigamePatient: null,
      currentRoomType: null,
      phase: 'playing',
      score: score + finalScore + bonusPatience,
      combo: newCombo,
      pendingReports: newPendingReport ? [...pendingReports, newPendingReport] : pendingReports,
      emergencyCount: remainderEmergency,
      normalCount: remainderNormal,
      emergencyHearts: emergencyHearts + emergencyHeartsEarned,
      normalHearts: normalHearts + normalHeartsEarned,
      lives: Math.min(lives + totalHeartsEarned, 10),
    });
  },

  skipMinigame: () => {
    const { phase } = get();
    if (phase === 'minigame') {
      get().completeMinigame(0.5);
    }
  },

  addPatient: () => {
    const { patients, time, phase } = get();
    if (phase !== 'playing') return;

    if (patients.length >= 20) return;

    const difficulty = Math.floor(time / 30000);
    const newPatient = generatePatient(difficulty);

    const isEmergency = newPatient.type === 'emergency';
    const updatedPatients = isEmergency
      ? [newPatient, ...patients]
      : [...patients, newPatient];

    set({ patients: updatedPatients });

    if (isEmergency) {
      playSFX('sfx_emergency_alert');
    } else {
      // playSFX('sfx_patient_arrive');
    }
  },

  updateGame: (deltaTime) => {
    const { status, patients, lives, time, freezeSeconds, difficultyAlertShown } = get();
    if (status !== 'playing') return;

    const adjustedDelta = deltaTime * get().gameSpeed;

    const difficulty = Math.floor(time / 30000);

    const isFreeze = freezeSeconds > 0;
    const freezeMultiplier = isFreeze ? 0.2 : 1;
    const difficultyMultiplier = (1 + difficulty * 0.1) * freezeMultiplier;

    let newLives = lives;
    const updatedPatients = patients.map(patient => ({
      ...patient,
      patience: Math.max(0, patient.patience - adjustedDelta * 0.5 * patient.patienceSpeed * difficultyMultiplier),
      mood: Math.max(0, patient.mood - adjustedDelta * 0.01),
    }));

    const impatientPatients = updatedPatients.filter(p => p.patience <= 0);
    newLives -= impatientPatients.length;

    const remainingPatients = updatedPatients.filter(p => p.patience > 0);

    if (newLives <= 0) {
      playSFX('sfx_game_over');
      set({ status: 'gameover', phase: 'gameover', lives: 0 });
      return;
    }

    const newFreezeSeconds = isFreeze ? Math.max(0, freezeSeconds - adjustedDelta / 1000) : freezeSeconds;

    set({
      time: time + adjustedDelta,
      patients: remainingPatients,
      lives: newLives,
      difficulty,
      freezeSeconds: newFreezeSeconds,
      ...(difficulty > 0 && !difficultyAlertShown ? { patientLeftAlert: true, difficultyAlertShown: true } : {}),
    });
  },

  addPendingReport: (patientName: string, roomName: string) => {
    const { pendingReports } = get();
    const newReport: PendingReport = {
      id: `report-${Date.now()}-${Math.random()}`,
      patientName,
      roomName,
      completed: false,
    };
    set({ pendingReports: [...pendingReports, newReport] });
  },

  toggleReportComplete: (reportId: string) => {
    const { pendingReports } = get();
    set({
      pendingReports: pendingReports.map(r =>
        r.id === reportId ? { ...r, completed: !r.completed } : r
      ),
    });
    playSFX('sfx_check');
  },

  submitReports: () => {
    const { pendingReports, score } = get();
    const completedCount = pendingReports.filter(r => r.completed).length;
    const remainingReports = pendingReports.filter(r => !r.completed);
    const bonusScore = completedCount * 5;

    let addFreezeSeconds = 0;
    if (completedCount >= 5) {
      addFreezeSeconds = Math.floor(completedCount / 5) * 15;
    }

    set({
      pendingReports: remainingReports,
      score: score + bonusScore,
      freezeSeconds: get().freezeSeconds + addFreezeSeconds,
    });

    if (completedCount > 0) {
      playSFX('sfx_report_submit');
    }
  },

  dismissPatientLeftAlert: () => {
    set({ patientLeftAlert: false });
  },

  dismissDifficultyAlert: () => {
    set({ difficultyAlertShown: false });
  },
}));