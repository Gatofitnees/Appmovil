
// Generate height values
export const generateHeightValues = (isMetric: boolean) => {
  if (isMetric) {
    // Centimeters (100-250 cm)
    return Array.from({ length: 151 }, (_, i) => ({
      label: `${i + 100} cm`,
      value: i + 100
    }));
  } else {
    // Feet (3-8)
    return Array.from({ length: 6 }, (_, i) => ({
      label: `${i + 3} ft`,
      value: i + 3
    }));
  }
};

// Generate inches values (0-11)
export const generateInchesValues = () => {
  return Array.from({ length: 12 }, (_, i) => ({
    label: `${i} in`,
    value: i
  }));
};

// Generate weight values
export const generateWeightValues = (isMetric: boolean) => {
  if (isMetric) {
    // Kilograms (40-150 kg, increments of 1) - Simplified for UI
    // Original was 30-200 with 0.5 increments? That's a lot of items.
    // Let's stick to existing logic but ensure formatting is nice.
    return Array.from({ length: 341 }, (_, i) => ({
      label: `${(i * 0.5) + 30} kg`,
      value: (i * 0.5) + 30
    }));
  } else {
    // Pounds (60-440 lbs)
    return Array.from({ length: 381 }, (_, i) => ({
      label: `${i + 60} lb`,
      value: i + 60
    }));
  }
};

// Generate body fat percentage values (5-50%, increments of 0.5)
export const generateFatValues = () => {
  return Array.from({ length: 91 }, (_, i) => ({
    label: `${(i * 0.5) + 5}%`,
    value: (i * 0.5) + 5
  }));
};

// Conversion functions
export const convertImperialToMetricHeight = (feet: number, inches: number): number => {
  return Math.round((feet * 30.48) + (inches * 2.54));
};

export const convertMetricToImperialHeight = (cm: number): { feet: number; inches: number } => {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { feet, inches };
};

export const convertImperialToMetricWeight = (lbs: number): number => {
  return parseFloat((lbs / 2.20462).toFixed(1));
};

export const convertMetricToImperialWeight = (kg: number): number => {
  return Math.round(kg * 2.20462);
};
