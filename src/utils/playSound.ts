let audio: HTMLAudioElement | null = null;

export function playSound(): void {
  if (!audio) {
    audio = new Audio('/sounds/success.mp3');
  }
  audio.currentTime = 0;
  audio.play().catch((e) => console.warn('Audio playback failed:', e));
}
