import { create } from 'zustand';
import type { GameState, Patient, PatientType, Room, RoomType } from '../types/game';

export type GamePhase = 'idle' | 'playing' | 'minigame1' | 'minigame2' | 'paused' | 'gameover';

const PATIENT_NAMES = [
  '张大爷', '李大妈', '王叔叔', '刘阿姨', '陈医生', '周护士',
  '小林', '小张', '老王', '阿强', '阿丽', '小李', '老张', '阿明'
];

const ROOM_CONFIGS: { type: RoomType; name: string; acceptedTypes: PatientType[] }[] = [
  { type: 'dr', name: 'DR拍片室', acceptedTypes: ['xray', 'emergency'] },
  { type: 'ct', name: 'CT室', acceptedTypes: ['ct', 'emergency'] },
  { type: 'mri', name: 'MRI核磁室', acceptedTypes: ['mri'] },
  { type: 'registration', name: '登记台', acceptedTypes: ['xray', 'ct', 'mri', 'emergency'] },
];

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

const generatePatient = (difficulty: number): Patient => {
  const rand = Math.random();
  let type: PatientType;

  if (rand < 0.40) type = 'xray';
  else if (rand < 0.70) type = 'ct';
  else if (rand < 0.90) type = 'mri';
  else type = 'emergency';

  const config = PATIENT_CONFIGS.find(c => c.type === type)!;
  const patienceReduction = Math.min(0.5, difficulty * 0.05);
  const basePatience = 15000 - (difficulty * 1000);

  const name = PATIENT_NAMES[Math.floor(Math.random() * PATIENT_NAMES.length)];

  const fullPatience = basePatience;
  const patienceSpeed = 0.8 + Math.random() * 0.4;

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
  return ROOM_CONFIGS.map(cfg => ({
    id: generateRoomId(),
    type: cfg.type,
    name: cfg.name,
    isBusy: false,
    currentPatient: null,
    remainingTime: 0,
    queue: [],
    acceptedTypes: cfg.acceptedTypes,
    minigame1Score: 0,
    minigame2Score: 0,
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
  startMinigame1: (patient: Patient) => void;
  completeMinigame1: (score: number) => void;
  completeMinigame2: (correctCount: number, totalCount: number) => void;
  skipMinigame: () => void;
  updateGame: (deltaTime: number) => void;
  addPatient: () => void;
  resetGame: () => void;
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
    });
  },

  pauseGame: () => {
    const { phase } = get();
    if (phase === 'playing' || phase === 'minigame1' || phase === 'minigame2') {
      set({ status: 'paused', phase: 'paused' });
    }
  },
  
  resumeGame: () => {
    const { currentMinigamePatient } = get();
    set({ 
      status: 'playing',
      phase: currentMinigamePatient ? 'minigame1' : 'playing'
    });
  },
  
  endGame: () => set({ status: 'gameover', phase: 'gameover' }),

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
          minigame1Score: 0,
          minigame2Score: 0,
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
      phase: 'minigame1',
    });
  },

  startMinigame1: (patient) => {
    set({ currentMinigamePatient: patient, phase: 'minigame1' });
  },

  completeMinigame1: (success) => {
    const { rooms, currentMinigamePatient, score, combo } = get();
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
          minigame1Score: 0,
          minigame2Score: 0,
        };
      }
      return r;
    });

    set({
      rooms: updatedRooms,
      currentMinigamePatient: null,
      currentRoomType: null,
      phase: 'playing',
      score: score + finalScore + bonusPatience,
      combo: newCombo,
    });
  },

  completeMinigame2: (correctCount, totalCount) => {
    const { rooms, currentMinigamePatient, score, combo } = get();
    if (!currentMinigamePatient) return;

    const baseReward = currentMinigamePatient.reward;
    const room = rooms.find(r => r.currentPatient?.id === currentMinigamePatient.id);
    const minigame1Score = room?.minigame1Score || 1;
    const minigame2Score = totalCount > 0 ? correctCount / totalCount : 0.5;
    
    const finalScore = Math.floor(baseReward * minigame1Score * (minigame2Score > 0.8 ? 1.5 : minigame2Score > 0.5 ? 1.0 : 0.5));
    const newCombo = combo + 1;
    const bonusPatience = Math.floor(currentMinigamePatient.patience / 100);

    const updatedRooms = rooms.map(r => {
      if (r.currentPatient?.id === currentMinigamePatient.id) {
        return {
          ...r,
          isBusy: false,
          currentPatient: null,
          remainingTime: 0,
          minigame1Score: 0,
          minigame2Score: 0,
        };
      }
      return r;
    });

    set({
      rooms: updatedRooms,
      currentMinigamePatient: null,
      phase: 'playing',
      score: score + finalScore + bonusPatience,
      combo: newCombo,
    });
  },

  skipMinigame: () => {
    const { phase } = get();
    if (phase === 'minigame1') {
      get().completeMinigame1(0.5);
    } else if (phase === 'minigame2') {
      get().completeMinigame2(0, 1);
    }
  },

  addPatient: () => {
    const { patients, time, phase } = get();
    if (phase !== 'playing') return;
    
    const difficulty = Math.floor(time / 30000);
    const newPatient = generatePatient(difficulty);
    
    const isEmergency = newPatient.type === 'emergency';
    const updatedPatients = isEmergency
      ? [newPatient, ...patients]
      : [...patients, newPatient];
    
    if (updatedPatients.length > 20) {
      const { lives, endGame } = get();
      if (lives <= 1) {
        endGame();
        return;
      }
      set({ lives: get().lives - 1 });
    }
    
    set({ patients: updatedPatients });
  },

  updateGame: (deltaTime) => {
    const { status, patients, lives, time, phase } = get();
    if (status !== 'playing' || phase === 'minigame1' || phase === 'minigame2') return;

    const adjustedDelta = deltaTime * get().gameSpeed;

    let newLives = lives;
    const updatedPatients = patients.map(patient => ({
      ...patient,
      patience: Math.max(0, patient.patience - adjustedDelta * 0.5 * patient.patienceSpeed),
      mood: Math.max(0, patient.mood - adjustedDelta * 0.01),
    }));

    const impatientPatients = updatedPatients.filter(p => p.patience <= 0);
    newLives -= impatientPatients.length;

    const remainingPatients = updatedPatients.filter(p => p.patience > 0);

    if (newLives <= 0) {
      set({ status: 'gameover', phase: 'gameover', lives: 0 });
      return;
    }

    set({
      time: time + adjustedDelta,
      patients: remainingPatients,
      lives: newLives,
    });
  },
}));