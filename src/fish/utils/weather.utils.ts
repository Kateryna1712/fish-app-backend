export const normalizePressure = (pressure: number): number => {
  if (Math.abs(pressure - 1013) <= 2) return 1;
  if (Math.abs(pressure - 1013) <= 5) return 0.7;
  return 0;
};

export const normalizeWindSpeed = (speed: number): number => {
  return speed >= 3 && speed <= 5 ? 1 : 0.5;
};

export const normalizeWindDirection = (windDeg: number): number => {
  if (windDeg >= 225 && windDeg < 315) return 1.0; // Південно-західний
  if (windDeg >= 270 && windDeg < 360) return 0.8; // Західний
  if (windDeg >= 135 && windDeg < 225) return 0.6; // Південний
  if (windDeg >= 45 && windDeg < 135) return 0.4; // Східний
  return 0; // Північний та інші
};

export const normalizeTemperature = (temp: number): number => {
  return temp >= 12 && temp <= 18 ? 1 : 0.5;
};

export const normalizeMoonPhase = (phase: number): number => {
  return phase === 1 || phase === 0 || phase === 0.5 ? 1 : 0.5;
};

export const normalizeTimeOfDay = (
  time: Date,
  sunrise: Date,
  sunset: Date,
): number => {
  const hour = time.getHours();

  if (time >= sunrise && time <= sunset) {
    return (hour >= 6 && hour < 9) || (hour >= 17 && hour < 20) ? 1 : 0.5;
  } else {
    return 0.4;
  }
};
