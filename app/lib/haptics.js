// lib/haptics.js
// A tiny buzz on supported phones; silently does nothing elsewhere.
export function haptic(pattern = 10) {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(pattern);
  } catch {
    // ignore
  }
}
