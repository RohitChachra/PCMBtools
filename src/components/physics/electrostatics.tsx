import { CalculatorCard } from './calculator-card';

const k = 8.9875517923e9; // Coulomb's constant (N m² C⁻²)

export function ElectrostaticsCalculators() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Coulomb's Law Calculator */}
      <CalculatorCard
        title="Coulomb's Law (Force)"
        description="Calculate the electrostatic force (F) between two point charges."
        inputFields={[
          // Use dangerouslySetInnerHTML compatible string for label
          { name: 'q1', label: 'Charge 1 (q<sub class="text-[0.6em] align-baseline">1</sub>)', unit: 'C', allowNegative: true },
          { name: 'q2', label: 'Charge 2 (q<sub class="text-[0.6em] align-baseline">2</sub>)', unit: 'C', allowNegative: true },
          { name: 'r', label: 'Distance (r)', unit: 'm' },
        ]}
        // Use dangerouslySetInnerHTML compatible string for formula
        formula="F = k * |q<sub class='text-[0.6em] align-baseline'>1</sub> * q<sub class='text-[0.6em] align-baseline'>2</sub>| / r²"
        calculate={({ q1, q2, r }) => {
          if (r <= 0) return "Distance must be positive."; // Distance must be positive
          return (k * Math.abs(q1 * q2)) / (r * r); // Returns magnitude
        }}
        resultLabel="Electrostatic Force (F)"
        resultUnit="N"
        children={
          <p className="text-xs text-muted-foreground mt-2">
            Calculates the magnitude of the force. Uses k ≈ 8.99 × 10⁹ N m² C⁻². Distance must be positive.
          </p>
        }
      />

      {/* Electric Field Calculator */}
      <CalculatorCard
        title="Electric Field (from Force)"
        description="Calculate the electric field (E) experienced by a test charge."
        inputFields={[
          { name: 'F', label: 'Force (F)', unit: 'N', allowNegative: true },
          { name: 'q', label: 'Test Charge (q)', unit: 'C', allowNegative: true },
        ]}
        formula="E = F / q"
        calculate={({ F, q }) => {
          if (q === 0) return "Test charge cannot be zero."; // Avoid division by zero
          return F / q;
        }}
        resultLabel="Electric Field (E)"
        resultUnit="N/C"
      />

      {/* Electric Potential Calculator (Point Charge) */}
      <CalculatorCard
        title="Electric Potential (Point Charge)"
        description="Calculate the electric potential (V) at a distance from a point charge."
        inputFields={[
          { name: 'q', label: 'Source Charge (q)', unit: 'C', allowNegative: true },
          { name: 'r', label: 'Distance (r)', unit: 'm' },
        ]}
        formula="V = k * q / r"
        calculate={({ q, r }) => {
          if (r <= 0) return "Distance must be positive."; // Avoid division by zero and non-physical distance
          return (k * q) / r;
        }}
        resultLabel="Electric Potential (V)"
        resultUnit="V"
         children={
          <p className="text-xs text-muted-foreground mt-2">
            Uses k ≈ 8.99 × 10⁹ N m² C⁻². Distance must be positive.
          </p>
        }
      />
    </div>
  );
}

