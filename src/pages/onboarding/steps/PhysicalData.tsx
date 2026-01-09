
import React, { useContext, useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import OnboardingNavigation from "@/components/onboarding/OnboardingNavigation";
import { OnboardingContext } from "../OnboardingFlow";
import PhysicalDataContent from "./physical-data/PhysicalDataContent";
import {
  generateHeightValues,
  generateInchesValues,
  generateWeightValues,
  generateFatValues,
  convertImperialToMetricHeight,
  convertMetricToImperialHeight,
  convertImperialToMetricWeight,
  convertMetricToImperialWeight
} from "./physical-data/utils";

const PhysicalData: React.FC = () => {
  const navigate = useNavigate();
  const context = useContext(OnboardingContext);

  if (!context) {
    throw new Error("PhysicalData must be used within OnboardingContext");
  }

  const { data, updateData } = context;

  // Default to metric system
  const [isMetric, setIsMetric] = useState(true);
  const [heightValues, setHeightValues] = useState(generateHeightValues(true));
  const inchesValues = useMemo(() => generateInchesValues(), []);
  const [weightValues, setWeightValues] = useState(generateWeightValues(true));
  const fatValues = useMemo(() => generateFatValues(), []);

  const [heightFt, setHeightFt] = useState<number>(5);
  const [heightIn, setHeightIn] = useState<number>(7);
  const [heightCm, setHeightCm] = useState<number>(data.height || 170);
  const [weight, setWeight] = useState<number>(data.weight || 70); // Default to 70 kg
  const [bodyFat, setBodyFat] = useState<number>(data.bodyFatPercentage || 20);

  // Update context when values change
  useEffect(() => {
    if (isMetric) {
      // Store height in cm
      updateData({
        height: heightCm,
        heightUnit: "cm",
        weight: weight,
        weightUnit: "kg",
        bodyFatPercentage: bodyFat,
        unit_system_preference: "metric"
      });
    } else {
      // Convert ft/in to cm for storage
      const heightInCm = convertImperialToMetricHeight(heightFt, heightIn);
      // Convert lbs to kg for storage
      const weightInKg = convertImperialToMetricWeight(weight);

      updateData({
        height: heightInCm,
        heightUnit: "ft-in",
        weight: weightInKg,
        weightUnit: "lbs",
        bodyFatPercentage: bodyFat,
        unit_system_preference: "imperial"
      });
    }
  }, [heightCm, heightFt, heightIn, weight, bodyFat, isMetric, updateData]);

  // Handle unit system change - memoized callback
  const handleUnitChange = useCallback((checked: boolean) => {
    const newIsMetric = checked;
    setIsMetric(newIsMetric);

    // Update selectors with new values
    setHeightValues(generateHeightValues(newIsMetric));
    setWeightValues(generateWeightValues(newIsMetric));

    // Convert values when switching systems
    if (newIsMetric) {
      // Convert from imperial to metric
      const cmValue = convertImperialToMetricHeight(heightFt, heightIn);
      setHeightCm(cmValue);

      const kgValue = convertImperialToMetricWeight(weight);
      setWeight(kgValue);
    } else {
      // Convert from metric to imperial
      const { feet, inches } = convertMetricToImperialHeight(heightCm);
      setHeightFt(feet);
      setHeightIn(inches);

      const lbsValue = convertMetricToImperialWeight(weight);
      setWeight(lbsValue);
    }
  }, [heightFt, heightIn, heightCm, weight]);

  const handleNext = useCallback(() => {
    navigate("/onboarding/birth-date");
  }, [navigate]);

  return (
    <OnboardingLayout currentStep={6} totalSteps={20} className="pb-4">
      <PhysicalDataContent
        isMetric={isMetric}
        onUnitChange={handleUnitChange}
        heightValues={heightValues}
        inchesValues={inchesValues}
        weightValues={weightValues}
        fatValues={fatValues}
        heightCm={heightCm}
        heightFt={heightFt}
        heightIn={heightIn}
        weight={weight}
        bodyFat={bodyFat}
        setHeightCm={setHeightCm}
        setHeightFt={setHeightFt}
        setHeightIn={setHeightIn}
        setWeight={setWeight}
        setBodyFat={setBodyFat}
      />

      <OnboardingNavigation
        onNext={handleNext}
        nextDisabled={!data.height || !data.weight}
      />
    </OnboardingLayout>
  );
};

export default PhysicalData;
