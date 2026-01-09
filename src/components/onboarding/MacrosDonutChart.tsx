
import React from 'react';

interface MacrosDonutChartProps {
  protein: number;
  carbs: number;
  fats: number;
}

const MacrosDonutChart: React.FC<MacrosDonutChartProps> = ({ protein, carbs, fats }) => {
  const proteinCals = protein * 4;
  const carbsCals = carbs * 4;
  const fatsCals = fats * 9;
  const totalCals = proteinCals + carbsCals + fatsCals;

  const proteinPercentage = (proteinCals / totalCals) * 100;
  const carbsPercentage = (carbsCals / totalCals) * 100;
  const fatsPercentage = (fatsCals / totalCals) * 100;

  const circumference = 2 * Math.PI * 40;
  const proteinDash = circumference * (proteinPercentage / 100);
  const carbsDash = circumference * (carbsPercentage / 100);
  const fatsDash = circumference * (fatsPercentage / 100);

  return (
    <svg width="100%" height="100%" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#334155" strokeWidth="12" />

      {/* Proteins segment */}
      <circle
        cx="50"
        cy="50"
        r="40"
        fill="transparent"
        stroke="#dd6969"
        strokeWidth="12"
        strokeDasharray={`${proteinDash} ${circumference}`}
        transform="rotate(-90 50 50)"
      />

      {/* Carbs segment */}
      <circle
        cx="50"
        cy="50"
        r="40"
        fill="transparent"
        stroke="#EB9F6D"
        strokeWidth="12"
        strokeDasharray={`${carbsDash} ${circumference}`}
        strokeDashoffset={-proteinDash}
        transform="rotate(-90 50 50)"
      />

      {/* Fats segment */}
      <circle
        cx="50"
        cy="50"
        r="40"
        fill="transparent"
        stroke="#6C95DC"
        strokeWidth="12"
        strokeDasharray={`${fatsDash} ${circumference}`}
        strokeDashoffset={-(proteinDash + carbsDash)}
        transform="rotate(-90 50 50)"
      />
    </svg>
  );
};

export default MacrosDonutChart;
