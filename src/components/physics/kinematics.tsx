import { CalculatorCard } from './calculator-card';

export function KinematicsCalculators() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Final Velocity Calculator */}
      <CalculatorCard
        title="Final Velocity"
        description="Calculate the final velocity (v) of an object."
        inputFields={[
          { name: 'u', label: 'Initial Velocity (u)', unit: 'm/s' },
          { name: 'a', label: 'Acceleration (a)', unit: 'm/s²' },
          { name: 't', label: 'Time (t)', unit: 's' },
        ]}
        formula="v = u + at"
        calculate={({ u, a, t }) => u + a * t}
        resultLabel="Final Velocity (v)"
        resultUnit="m/s"
      />

      {/* Displacement Calculator */}
      <CalculatorCard
        title="Displacement"
        description="Calculate the displacement (s) of an object."
        inputFields={[
          { name: 'u', label: 'Initial Velocity (u)', unit: 'm/s' },
          { name: 't', label: 'Time (t)', unit: 's' },
          { name: 'a', label: 'Acceleration (a)', unit: 'm/s²' },
        ]}
        formula="s = ut + ½at²"
        calculate={({ u, t, a }) => u * t + 0.5 * a * t * t}
        resultLabel="Displacement (s)"
        resultUnit="m"
      />

      {/* Time Calculator */}
      <CalculatorCard
        title="Time"
        description="Calculate the time (t) taken for a velocity change."
        inputFields={[
          { name: 'v', label: 'Final Velocity (v)', unit: 'm/s' },
          { name: 'u', label: 'Initial Velocity (u)', unit: 'm/s' },
          { name: 'a', label: 'Acceleration (a)', unit: 'm/s²' },
        ]}
        formula="t = (v - u) / a"
        calculate={({ v, u, a }) => {
          if (a === 0) {
             if (v === u) return "Infinite solutions (constant velocity)";
             return null; // Or throw new Error("Acceleration cannot be zero if velocity changes");
          }
          return (v - u) / a;
        }}
        resultLabel="Time (t)"
        resultUnit="s"
      />
    </div>
  );
}
