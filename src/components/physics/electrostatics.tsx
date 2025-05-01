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
          { name: 'q1', label: 'Charge 1 (q₁)', unit: 'C' },
          { name: 'q2', label: 'Charge 2 (q₂)', unit: 'C' },
          { name: 'r', label: 'Distance (r)', unit: 'm' },
        ]}
        formula="F = k * |q₁ * q₂| / r²"
        calculate={({ q1, q2, r }) => {
          if (r === 0) return null; // Avoid division by zero
          return (k * Math.abs(q1 * q2)) / (r * r); // Returns magnitude
        }}
        resultLabel="Electrostatic Force (F)"
        resultUnit="N"
        children={
          <p className="text-xs text-muted-foreground mt-2">
            Calculates the magnitude of the force. Uses k ≈ 8.99 × 10⁹ N m² C⁻².
          </p>
        }
      />

      {/* Electric Field Calculator */}
      <CalculatorCard
        title="Electric Field (from Force)"
        description="Calculate the electric field (E) experienced by a test charge."
        inputFields={[
          { name: 'F', label: 'Force (F)', unit: 'N' },
          { name: 'q', label: 'Test Charge (q)', unit: 'C' },
        ]}
        formula="E = F / q"
        calculate={({ F, q }) => {
          if (q === 0) return null; // Avoid division by zero
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
          { name: 'q', label: 'Source Charge (q)', unit: 'C' },
          { name: 'r', label: 'Distance (r)', unit: 'm' },
        ]}
        formula="V = k * q / r"
        calculate={({ q, r }) => {
          if (r === 0) return null; // Avoid division by zero
          return (k * q) / r;
        }}
        resultLabel="Electric Potential (V)"
        resultUnit="V"
         children={
          <p className="text-xs text-muted-foreground mt-2">
            Uses k ≈ 8.99 × 10⁹ N m² C⁻².
          </p>
        }
      />
    </div>
  );
}
