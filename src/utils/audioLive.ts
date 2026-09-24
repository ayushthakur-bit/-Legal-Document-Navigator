// Audio processing utilities for Gemini Live API (gemini-3.1-flash-live-preview)

/**
 * Converts a Float32Array (from Web Audio API mic input) to 16-bit PCM little-endian Base64
 * Expected input: 16kHz mono Float32Array
 */
export function float32ToPCM16Base64(float32Array: Float32Array): string {
  const buffer = new ArrayBuffer(float32Array.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true); // true = little-endian
  }
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Converts 24kHz 16-bit PCM Base64 chunk from Gemini Live API to an AudioBuffer for playback
 */
export function base64PCM16ToAudioBuffer(
  base64: string,
  audioCtx: AudioContext
): AudioBuffer {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const int16 = new Int16Array(bytes.buffer);
  const float32 = new Float32Array(int16.length);
  for (let i = 0; i < int16.length; i++) {
    float32[i] = int16[i] / 32768.0;
  }
  const audioBuffer = audioCtx.createBuffer(1, float32.length, 24000);
  audioBuffer.getChannelData(0).set(float32);
  return audioBuffer;
}

/**
 * Computes root-mean-square (RMS) volume level between 0 and 1
 */
export function calculateRMSVolume(float32Array: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < float32Array.length; i++) {
    sum += float32Array[i] * float32Array[i];
  }
  const rms = Math.sqrt(sum / float32Array.length);
  return Math.min(1, rms * 5); // Scale for visualizer sensitivity
}
