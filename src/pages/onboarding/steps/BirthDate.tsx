
import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import OnboardingNavigation from "@/components/onboarding/OnboardingNavigation";
import { OnboardingContext } from "../OnboardingFlow";
import DateSelectors from "@/components/onboarding/birth-date/DateSelectors";
import DateDisplay from "@/components/onboarding/birth-date/DateDisplay";
import {
  calculateAge,
  generateDaysValues,
  generateMonthsValues,
  generateYearsValues
} from "@/components/onboarding/birth-date/DateUtils";

const BirthDate: React.FC = () => {
  const navigate = useNavigate();
  const context = useContext(OnboardingContext);

  if (!context) {
    throw new Error("BirthDate must be used within OnboardingContext");
  }

  const { data, updateData } = context;

  // Calculate min/max dates (16-100 years old range)
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() - 16);

  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 100);

  // Initialize with current date or existing data
  // Ensure we always have a Date object
  const getInitialDate = () => {
    if (data.dateOfBirth) {
      // If dateOfBirth exists, ensure it's a Date object
      return data.dateOfBirth instanceof Date ? data.dateOfBirth : new Date(data.dateOfBirth);
    }
    // Default fallback date
    return new Date(maxDate.getFullYear() - 9, 5, 15);
  };

  const initialDate = getInitialDate();

  const [day, setDay] = useState(initialDate.getDate());
  const [month, setMonth] = useState(initialDate.getMonth());
  const [year, setYear] = useState(initialDate.getFullYear());

  // Generate selector values
  const daysValues = generateDaysValues();
  const monthsValues = generateMonthsValues();
  const yearsValues = generateYearsValues(minDate, maxDate);

  // Update context when date values change
  useEffect(() => {
    try {
      // Validate day based on month/year
      let adjustedDay = day;
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      if (day > daysInMonth) {
        adjustedDay = daysInMonth;
      }

      const birthDate = new Date(year, month, adjustedDay);

      // Validate date is within range
      if (birthDate > maxDate) {
        return; // Too young
      }

      if (birthDate < minDate) {
        return; // Too old
      }

      updateData({ dateOfBirth: birthDate });
    } catch (e) {
      console.error("Invalid date:", e);
    }
  }, [day, month, year]);

  const handleNext = () => {
    navigate("/onboarding/main-goal");
  };

  return (
    <OnboardingLayout currentStep={7} totalSteps={20}>
      <h1 className="text-2xl font-bold mb-8">¿Cuál es tu fecha de nacimiento?</h1>

      <div className="w-full max-w-sm mx-auto">
        <DateSelectors
          day={day}
          month={month}
          year={year}
          setDay={setDay}
          setMonth={setMonth}
          setYear={setYear}
          daysValues={daysValues}
          monthsValues={monthsValues}
          yearsValues={yearsValues}
        />

        {data.dateOfBirth && (
          <DateDisplay
            date={data.dateOfBirth instanceof Date ? data.dateOfBirth : new Date(data.dateOfBirth)}
            age={calculateAge(data.dateOfBirth instanceof Date ? data.dateOfBirth : new Date(data.dateOfBirth))}
          />
        )}
      </div>

      <OnboardingNavigation
        onNext={handleNext}
        nextDisabled={!data.dateOfBirth}
      />
    </OnboardingLayout>
  );
};

export default BirthDate;
