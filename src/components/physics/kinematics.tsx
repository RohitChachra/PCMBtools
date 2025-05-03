
import { CalculatorCard } from './calculator-card';

export function KinematicsCalculators() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Final Velocity Calculator */}
      <CalculatorCard
        title="Final Velocity"
        description="Calculate the final velocity (v) of an object."
        inputFields={[
          { name: 'u', label: 'Initial Velocity (u)', unit: 'm/s', allowNegative: true }, // Velocity can be negative
          { name: 'a', label: 'Acceleration (a)', unit: 'm/s²', allowNegative: true }, // Acceleration can be negative
          { name: 't', label: 'Time (t)', unit: 's' }, // Time cannot be negative
        ]}
        formula="v = u + at"
        calculate={({ u, a, t }) => {
           if (t < 0) return "Time cannot be negative."; // Explicit check added here
           return u + a * t;
        }}
        resultLabel="Final Velocity (v)"
        resultUnit="m/s"
      />

      {/* Displacement Calculator */}
      <CalculatorCard
        title="Displacement"
        description="Calculate the displacement (s) of an object."
        inputFields={[
          { name: 'u', label: 'Initial Velocity (u)', unit: 'm/s', allowNegative: true }, // Velocity can be negative
          { name: 't', label: 'Time (t)', unit: 's' }, // Time cannot be negative
          { name: 'a', label: 'Acceleration (a)', unit: 'm/s²', allowNegative: true }, // Acceleration can be negative
        ]}
        formula="s = ut + ½at²"
        calculate={({ u, t, a }) => {
            if (t < 0) return "Time cannot be negative."; // Explicit check added here
            return u * t + 0.5 * a * t * t;
        }}
        resultLabel="Displacement (s)"
        resultUnit="m"
      />

      {/* Time Calculator */}
      <CalculatorCard
        title="Time"
        description="Calculate the time (t) taken for a velocity change."
        inputFields={[
          { name: 'v', label: 'Final Velocity (v)', unit: 'm/s', allowNegative: true }, // Velocity can be negative
          { name: 'u', label: 'Initial Velocity (u)', unit: 'm/s', allowNegative: true }, // Velocity can be negative
          { name: 'a', label: 'Acceleration (a)', unit: 'm/s²', allowNegative: true }, // Acceleration can be negative
        ]}
        formula="t = (v - u) / a"
        calculate={({ v, u, a }) => {
          if (a === 0) {
             if (v === u) return "Infinite solutions (constant velocity)";
             return null; // Indeterminate if velocity changes with zero acceleration
          }
          const time = (v - u) / a;
          // Basic check if result is negative, more robust check in CalculatorCard handles input validation
          if (time < 0) return "Time cannot be negative. Please check your inputs."; // Return specific error message for negative calculated time
          return time;
        }}
        resultLabel="Time (t)"
        resultUnit="s"
      />
    </div>
  );
}
