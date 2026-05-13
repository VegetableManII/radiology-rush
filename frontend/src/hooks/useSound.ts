import { useEffect } from 'react';
import { Howl } from 'howler';

export type SoundKey =
  | 'bgm'
  | 'sfx_click'
  | 'sfx_check'
  | 'sfx_patient_arrive'
  | 'sfx_minigame_success'
  | 'sfx_minigame_fail'
  | 'sfx_report_submit'
  | 'sfx_heart_earn'
  | 'sfx_doctor_notify'
  | 'sfx_emergency_alert'
  | 'sfx_life_lost'
  | 'sfx_game_over';

const SOUND_URLS: Record<SoundKey, string> = {
  bgm: '/assets/bgm/hospital_bgm.mp3',
  sfx_click: '/assets/sfx/sfx_click.mp3',
  sfx_check: '/assets/sfx/sfx_check.mp3',
  sfx_patient_arrive: '/assets/sfx/sfx_patient_arrive.mp3',
  sfx_minigame_success: '/assets/sfx/sfx_minigame_success.mp3',
  sfx_minigame_fail: '/assets/sfx/sfx_minigame_fail.mp3',
  sfx_report_submit: '/assets/sfx/sfx_report_submit.mp3',
  sfx_heart_earn: '/assets/sfx/sfx_heart_earn.mp3',
  sfx_doctor_notify: '/assets/sfx/sfx_doctor_notify.mp3',
  sfx_emergency_alert: '/assets/sfx/sfx_emergency_alert.mp3',
  sfx_life_lost: '/assets/sfx/sfx_life_lost.mp3',
  sfx_game_over: '/assets/sfx/sfx_game_over.mp3',
};

const VOLUMES: Partial<Record<SoundKey, number>> = {
  bgm: 0.3,
};

const soundMap = new Map<SoundKey, Howl>();

function getSound(key: SoundKey): Howl {
  if (!soundMap.has(key)) {
    soundMap.set(key, new Howl({
      src: [SOUND_URLS[key]],
      loop: key === 'bgm',
      volume: VOLUMES[key] ?? 0.6,
    }));
  }
  return soundMap.get(key)!;
}

// Sync playSFX - can be used in non-React context (store, etc)
export function playSFX(key: SoundKey) {
  getSound(key).play();
}

// Hook for background music based on game status
export function useBGM(status: string) {
  useEffect(() => {
    const bgm = getSound('bgm');

    if (status === 'playing') {
      if (!bgm.playing()) {
        bgm.play();
      }
    } else {
      bgm.stop();
    }

    return () => {
      bgm.stop();
    };
  }, [status]);
}