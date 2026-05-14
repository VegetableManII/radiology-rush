export type PatientType = 'xray' | 'ct' | 'mri' | 'emergency';
export type RoomType = 'dr' | 'ct' | 'mri' | 'registration';
export type GameStatus = 'idle' | 'playing' | 'paused' | 'gameover';

export interface Patient {
  id: string;
  type: PatientType;
  patience: number;
  maxPatience: number;
  patienceSpeed: number;
  requiredRoom: RoomType;
  processTime: number;
  reward: number;
  mood: number;
  name: string;
}

export interface Room {
  id: string;
  type: RoomType;
  name: string;
  isBusy: boolean;
  currentPatient: Patient | null;
  remainingTime: number;
  queue: Patient[];
  acceptedTypes: PatientType[];
  minigameScore: number;
}

export interface GameState {
  status: GameStatus;
  score: number;
  lives: number;
  time: number;
  combo: number;
  patients: Patient[];
  rooms: Room[];
  selectedPatient: Patient | null;
  gameSpeed: number;
  pendingReports: PendingReport[];
  emergencyCount: number;
  emergencyHearts: number;
  normalCount: number;
  normalHearts: number;
  patientLeftAlert: boolean;
  difficulty: number;
  difficultyAlertShown: boolean;
  freezeSeconds: number;
}

export interface PendingReport {
  id: string;
  patientName: string;
  roomName: string;
  completed: boolean;
}