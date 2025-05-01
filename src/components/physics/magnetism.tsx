
import { CalculatorCard } from './calculator-card';

export function MagnetismCalculators() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Magnetic Force on a Moving Charge */}
      <CalculatorCard
        title="Force on Moving Charge (F = qvB)"
        description="Calculate the magnitude of the magnetic force (F) on a charge (q) moving with velocity (v) perpendicular to a magnetic field (B)."
        inputFields={[
          { name: 'q', label: 'Charge (q)', unit: 'C' },
          { name: 'v', label: 'Velocity (v)', unit: 'm/s' },
          { name: 'B', label: 'Magnetic Field Strength (B)', unit: 'T' },
        ]}
        formula="F = |q|vB" // Simplified for perpendicular case
        calculate={({ q, v, B }) => Math.abs(q) * v * B}
        resultLabel="Magnetic Force (F)"
        resultUnit="N"
        children={
          <p className="text-xs text-muted-foreground mt-2">
            This formula calculates the maximum force when velocity and magnetic field are perpendicular. For other angles θ, use F = |q|vB sin(θ). Direction requires the right-hand rule.
          </p>
        }
      />

      {/* Magnetic Force on a Current-Carrying Wire */}
      <CalculatorCard
        title="Force on Current Wire (F = ILB)"
        description="Calculate the magnitude of the magnetic force (F) on a wire of length (L) carrying current (I) perpendicular to a magnetic field (B)."
        inputFields={[
          { name: 'I', label: 'Current (I)', unit: 'A' },
          { name: 'L', label: 'Length of Wire (L)', unit: 'm' },
          { name: 'B', label: 'Magnetic Field Strength (B)', unit: 'T' },
        ]}
        formula="F = ILB" // Simplified for perpendicular case
        calculate={({ I, L, B }) => I * L * B}
        resultLabel="Magnetic Force (F)"
        resultUnit="N"
        children={
          <p className="text-xs text-muted-foreground mt-2">
            This formula calculates the maximum force when the wire and magnetic field are perpendicular. For other angles θ, use F = ILB sin(θ). Direction requires the right-hand rule.
          </p>
        }
      />

      {/* Magnetic Field from a Long Straight Wire - Optional */}
      {/* <CalculatorCard
        title="Magnetic Field (Long Straight Wire)"
        description="Calculate the magnetic field (B) at a distance (r) from a long straight wire carrying current (I)."
        inputFields={[
          { name: 'I', label: 'Current (I)', unit: 'A' },
          { name: 'r', label: 'Distance from wire (r)', unit: 'm' },
        ]}
        formula="B = (μ₀ * I) / (2πr)" // μ₀ = 4π × 10⁻⁷ T·m/A
        calculate={({ I, r }) => {
          if (r === 0) return null;
          const mu0 = 4 * Math.PI * 1e-7;
          return (mu0 * I) / (2 * Math.PI * r);
        }}
        resultLabel="Magnetic Field Strength (B)"
        resultUnit="T"
        children={
          <p className="text-xs text-muted-foreground mt-2">
            Uses the permeability of free space μ₀ = 4π × 10⁻⁷ T·m/A.
          </p>
        }
      /> */}
    </div>
  );
}
