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
  emergencyCount: number;   // 急诊余数（不足1颗心的部分）
  emergencyHearts: number;  // 急诊已兑换爱心数
  normalCount: number;     // 普通病人余数（不足1颗心的部分）
  normalHearts: number;    // 普通病人已兑换爱心数
  reportCount: number;     // 报告余数（不足1份的部分）
  reportBonus: number;      // 提交报告加成（新病人初始耐心+500ms/份）
}

export interface PendingReport {
  id: string;
  patientName: string;
  roomName: string;
  completed: boolean;
}