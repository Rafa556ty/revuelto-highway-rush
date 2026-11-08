// Pure rules for the traffic Ferrari SF90's real acceleration recording.
// The engine reports nearby Ferraris; the audio module decides what plays.

/** Beyond this distance (metres) a traffic Ferrari is not heard. */
export const SF90_HEAR_RANGE = 110;
/** At most this many Ferrari acceleration sounds play at once. */
export const SF90_MAX_VOICES = 2;

export type Sf90Report = {
  key: object;
  /** metres ahead (+) or behind (-) of the player */
  dz: number;
  /** metres to the right (+) or left (-) of the player */
  dx: number;
  /** pushing / overtaking right now */
  racing: boolean;
};

export const sf90Distance = (dz: number, dx: number) => Math.hypot(dz, dx * 1.5);

/** Loudness 0..1: full right beside the player, fading to silence at the hear range. */
export function sf90Level(dz: number, dx: number): number {
  const d = sf90Distance(dz, dx);
  if (d >= SF90_HEAR_RANGE) return 0;
  return Math.min(1, 8 / (d + 4)) * (1 - d / SF90_HEAR_RANGE);
}

/** Stereo position -1..1 from the car's side offset. */
export function sf90Pan(dz: number, dx: number): number {
  return Math.max(-0.85, Math.min(0.85, dx / (Math.abs(dz) * 0.35 + 3)));
}

/**
 * Start the accelerating sound when a Ferrari begins racing (calm -> push or
 * overtake) within earshot, if it isn't already playing and a voice is free.
 */
export function shouldStartSf90(
  wasRacing: boolean,
  racing: boolean,
  dz: number,
  dx: number,
  alreadyPlaying: boolean,
  activeVoices: number,
): boolean {
  return (
    racing &&
    !wasRacing &&
    !alreadyPlaying &&
    activeVoices < SF90_MAX_VOICES &&
    sf90Distance(dz, dx) < SF90_HEAR_RANGE
  );
}
