
import { CalculatorCard } from './calculator-card';

const G = 6.67430e-11; // Gravitational constant (m³ kg⁻¹ s⁻²)

export function GravitationCalculators() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Gravitational Force Calculator */}
      <CalculatorCard
        title="Gravitational Force"
        description="Calculate the gravitational force (F) between two masses."
        inputFields={[
          // Use dangerouslySetInnerHTML compatible string for label
          { name: 'm1', label: 'Mass 1 (m<sub class="text-[0.6em] align-baseline">1</sub>)', unit: 'kg' }, // Mass cannot be negative
          { name: 'm2', label: 'Mass 2 (m<sub class="text-[0.6em] align-baseline">2</sub>)', unit: 'kg' }, // Mass cannot be negative
          { name: 'r', label: 'Distance (r)', unit: 'm' }, // Distance cannot be negative or zero
        ]}
        // Use dangerouslySetInnerHTML compatible string for formula
        formula="F = G * (m<sub class='text-[0.6em] align-baseline'>1</sub> * m<sub class='text-[0.6em] align-baseline'>2</sub>) / r²"
        calculate={({ m1, m2, r }) => {
          if (r <= 0) return "Distance must be positive."; // Avoid division by zero and non-physical distance
          if (m1 < 0 || m2 < 0) return "Mass cannot be negative."; // Validate inputs
          return (G * m1 * m2) / (r * r);
        }}
        resultLabel="Gravitational Force (F)"
        resultUnit="N"
        children={
          <p className="text-xs text-muted-foreground mt-2">
            Uses G ≈ 6.674 × 10⁻¹¹ m³ kg⁻¹ s⁻². Masses must be non-negative, distance must be positive.
          </p>
        }
      />

       {/* Gravitational Potential Energy Calculator */}
      <CalculatorCard
        title="Gravitational Potential Energy"
        description="Calculate the gravitational potential energy (U) between two masses."
        inputFields={[
          // Use dangerouslySetInnerHTML compatible string for label
          { name: 'm1', label: 'Mass 1 (m<sub class="text-[0.6em] align-baseline">1</sub>)', unit: 'kg' }, // Mass cannot be negative
          { name: 'm2', label: 'Mass 2 (m<sub class="text-[0.6em] align-baseline">2</sub>)', unit: 'kg' }, // Mass cannot be negative
          { name: 'r', label: 'Distance (r)', unit: 'm' }, // Distance cannot be negative or zero
        ]}
        // Use dangerouslySetInnerHTML compatible string for formula
        formula="U = -G * (m<sub class='text-[0.6em] align-baseline'>1</sub> * m<sub class='text-[0.6em] align-baseline'>2</sub>) / r"
        calculate={({ m1, m2, r }) => {
           if (r <= 0) return "Distance must be positive."; // Avoid division by zero and non-physical distance
           if (m1 < 0 || m2 < 0) return "Mass cannot be negative."; // Validate inputs
           return (-G * m1 * m2) / r;
        }}
        resultLabel="Gravitational Potential Energy (U)"
        resultUnit="J"
         children={
          <p className="text-xs text-muted-foreground mt-2">
             Note: Potential energy is typically negative, relative to infinite separation. Uses G ≈ 6.674 × 10⁻¹¹ m³ kg⁻¹ s⁻². Masses must be non-negative, distance must be positive.
          </p>
        }
      />

      {/* Acceleration due to Gravity Calculator */}
      <CalculatorCard
        title="Acceleration due to Gravity (g)"
        description="Calculate the gravitational acceleration (g) caused by a large mass (M)."
        inputFields={[
          { name: 'M', label: 'Central Mass (M)', unit: 'kg', defaultValue: '5.972e24' }, // Mass cannot be negative
          { name: 'r', label: 'Distance from center (r)', unit: 'm', defaultValue: '6.371e6' }, // Distance cannot be negative or zero
        ]}
        formula="g = G * M / r²"
        calculate={({ M, r }) => {
          if (r <= 0) return "Distance must be positive."; // Avoid division by zero and non-physical distance
          if (M < 0) return "Mass cannot be negative."; // Validate inputs
          return (G * M) / (r * r);
        }}
        resultLabel="Gravitational Acceleration (g)"
        resultUnit="m/s²"
         children={
           <p className="text-xs text-muted-foreground mt-2">
             Defaults are for Earth's surface. Uses G ≈ 6.674 × 10⁻¹¹ m³ kg⁻¹ s⁻². Mass must be non-negative, distance must be positive.
           </p>
         }
      />
    </div>
  );
}

