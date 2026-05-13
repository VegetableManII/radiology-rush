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
  minigame1Score: number;
  minigame2Score: number;
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
}