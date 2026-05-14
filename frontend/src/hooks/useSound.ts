import { useEffect, useState } from 'react';
import { Howl } from 'howler';

export type SoundKey =
  | 'bgm'
  | 'sfx_check'
  | 'sfx_patient_arrive'
  | 'sfx_minigame_success'
  | 'sfx_minigame_fail'
  | 'sfx_report_submit'
  | 'sfx_heart_earn'
  | 'sfx_doctor_notify'
  | 'sfx_emergency_alert'
  | 'sfx_heart_lost'
  | 'sfx_game_over';

const SOUND_URLS: Record<SoundKey, string> = {
  bgm: '/assets/bgm/hospital_bgm.mp3',
  sfx_check: '/assets/sfx/sfx_check.mp3',
  sfx_patient_arrive: '/assets/sfx/sfx_patient_arrive.mp3',
  sfx_minigame_success: '/assets/sfx/sfx_minigame_success.mp3',
  sfx_minigame_fail: '/assets/sfx/sfx_minigame_fail.mp3',
  sfx_report_submit: '/assets/sfx/sfx_report_submit.mp3',
  sfx_heart_earn: '/assets/sfx/sfx_heart_earn.mp3',
  sfx_doctor_notify: '/assets/sfx/sfx_doctor_notify.mp3',
  sfx_emergency_alert: '/assets/sfx/sfx_emergency_alert.mp3',
  sfx_heart_lost: '/assets/sfx/sfx_heart_lost.mp3',
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
      // html5: true 避免 iOS Web Audio API 的 autoplay 限制
      html5: true,
      // 预加载音频，确保 iOS 上声音就绪
      preload: true,
    }));
  }
  return soundMap.get(key)!;
}

// Sync playSFX - can be used in non-React context (store, etc)
export function playSFX(key: SoundKey) {
  getSound(key).play();
}

// Play BGM directly (must be called inside a user gesture on iOS)
export function playBGM() {
  getSound('bgm').play();
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

// iOS Safari requires a user gesture to unlock the audio context.
// Since Howl already uses html5: true (which handles unlock natively), we just
// set a flag. No sound file is needed.
const _audioUnlocked = { value: false };

/**
 * Call this once on first user interaction (e.g. onClick on a start button).
 * On iOS/Android it marks the audio context as unlocked so subsequent
 * sounds can play without further gesture requirements.
 */
export function unlockAudio() {
  if (_audioUnlocked.value) return;
  _audioUnlocked.value = true;
}

/**
 * React hook that listens for the first touch/click and unlocks audio.
 * Add this to your root component (e.g. App or Game) once:
 *   const unlockAudioOnGesture = useUnlockAudioOnGesture();
 */
export function useUnlockAudioOnGesture() {
  const [unlocked, setUnlocked] = useState(_audioUnlocked.value);

  useEffect(() => {
    if (unlocked) return;

    const handler = () => {
      unlockAudio();
      setUnlocked(true);
    };

    // Listen for the first user gesture on the document
    document.addEventListener('touchstart', handler, { once: true });
    document.addEventListener('click', handler, { once: true });

    return () => {
      document.removeEventListener('touchstart', handler);
      document.removeEventListener('click', handler);
    };
  }, [unlocked]);

  return unlocked;
}