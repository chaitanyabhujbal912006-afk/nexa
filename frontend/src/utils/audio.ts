// Synthesized UI sound effects via Web Audio API (Disabled per user preference)

let isMuted = true;

export function toggleMute(): boolean {
  isMuted = !isMuted;
  return isMuted;
}

export function getMuteState(): boolean {
  return isMuted;
}

export function playTactileClick() {
  // Audio clicks disabled
  return;
}

export function playResolvedChime() {
  // Chime sound disabled
  return;
}

export function playAlertWarble() {
  // Alert sound disabled
  return;
}

