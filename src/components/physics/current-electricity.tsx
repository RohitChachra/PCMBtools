
import { CalculatorCard } from './calculator-card';

export function CurrentElectricityCalculators() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Ohm's Law (Voltage) */}
      <CalculatorCard
        title="Ohm's Law (Voltage)"
        description="Calculate voltage (V) using current and resistance."
        inputFields={[
          { name: 'I', label: 'Current (I)', unit: 'A' },
          { name: 'R', label: 'Resistance (R)', unit: 'Ω' },
        ]}
        formula="V = IR"
        calculate={({ I, R }) => I * R}
        resultLabel="Voltage (V)"
        resultUnit="V"
      />

      {/* Ohm's Law (Current) */}
      <CalculatorCard
        title="Ohm's Law (Current)"
        description="Calculate current (I) using voltage and resistance."
        inputFields={[
          { name: 'V', label: 'Voltage (V)', unit: 'V' },
          { name: 'R', label: 'Resistance (R)', unit: 'Ω' },
        ]}
        formula="I = V / R"
        calculate={({ V, R }) => {
          if (R === 0) return null; // Avoid division by zero
          return V / R;
        }}
        resultLabel="Current (I)"
        resultUnit="A"
      />

      {/* Ohm's Law (Resistance) */}
      <CalculatorCard
        title="Ohm's Law (Resistance)"
        description="Calculate resistance (R) using voltage and current."
        inputFields={[
          { name: 'V', label: 'Voltage (V)', unit: 'V' },
          { name: 'I', label: 'Current (I)', unit: 'A' },
        ]}
        formula="R = V / I"
        calculate={({ V, I }) => {
          if (I === 0) return null; // Avoid division by zero
          return V / I;
        }}
        resultLabel="Resistance (R)"
        resultUnit="Ω"
      />

      {/* Power (from VI) */}
      <CalculatorCard
        title="Electrical Power (P = VI)"
        description="Calculate power (P) using voltage and current."
        inputFields={[
          { name: 'V', label: 'Voltage (V)', unit: 'V' },
          { name: 'I', label: 'Current (I)', unit: 'A' },
        ]}
        formula="P = VI"
        calculate={({ V, I }) => V * I}
        resultLabel="Power (P)"
        resultUnit="W"
      />

      {/* Power (from I²R) */}
      <CalculatorCard
        title="Electrical Power (P = I²R)"
        description="Calculate power (P) using current and resistance."
        inputFields={[
          { name: 'I', label: 'Current (I)', unit: 'A' },
          { name: 'R', label: 'Resistance (R)', unit: 'Ω' },
        ]}
        formula="P = I²R"
        calculate={({ I, R }) => I * I * R}
        resultLabel="Power (P)"
        resultUnit="W"
      />

       {/* Power (from V²/R) */}
      <CalculatorCard
        title="Electrical Power (P = V²/R)"
        description="Calculate power (P) using voltage and resistance."
        inputFields={[
          { name: 'V', label: 'Voltage (V)', unit: 'V' },
          { name: 'R', label: 'Resistance (R)', unit: 'Ω' },
        ]}
        formula="P = V² / R"
        calculate={({ V, R }) => {
           if (R === 0) return null; // Avoid division by zero
           return (V * V) / R;
        }}
        resultLabel="Power (P)"
        resultUnit="W"
      />

      {/* Add Resistors in Series/Parallel if needed later */}

    </div>
  );
}
