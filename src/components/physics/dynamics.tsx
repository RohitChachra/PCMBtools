import { CalculatorCard } from './calculator-card';

export function DynamicsCalculators() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Force Calculator */}
      <CalculatorCard
        title="Force (Newton's Second Law)"
        description="Calculate the net force (F) acting on an object."
        inputFields={[
          { name: 'm', label: 'Mass (m)', unit: 'kg' },
          { name: 'a', label: 'Acceleration (a)', unit: 'm/s²' },
        ]}
        formula="F = ma"
        calculate={({ m, a }) => m * a}
        resultLabel="Force (F)"
        resultUnit="N"
      />

      {/* Acceleration Calculator (from velocity change) */}
       <CalculatorCard
        title="Acceleration"
        description="Calculate acceleration (a) from velocity change over time."
        inputFields={[
          { name: 'v', label: 'Final Velocity (v)', unit: 'm/s' },
          { name: 'u', label: 'Initial Velocity (u)', unit: 'm/s' },
          { name: 't', label: 'Time (t)', unit: 's' },
        ]}
        formula="a = (v - u) / t"
        calculate={({ v, u, t }) => {
           if (t === 0) {
             if (v === u) return 0; // No change, zero acceleration if time is zero (instantaneous)
             return null; // Or throw new Error("Time cannot be zero for a velocity change.");
           }
          return (v - u) / t;
        }}
        resultLabel="Acceleration (a)"
        resultUnit="m/s²"
      />


      {/* Momentum Calculator */}
      <CalculatorCard
        title="Momentum"
        description="Calculate the momentum (p) of an object."
        inputFields={[
          { name: 'm', label: 'Mass (m)', unit: 'kg' },
          { name: 'v', label: 'Velocity (v)', unit: 'm/s' },
        ]}
        formula="p = mv"
        calculate={({ m, v }) => m * v}
        resultLabel="Momentum (p)"
        resultUnit="kg·m/s"
      />
    </div>
  );
}
