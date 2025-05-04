
import React from 'react'; // Explicitly import React
import { CalculatorCard } from './calculator-card';

const g = 9.81; // Standard gravity (m/s²)

export function FluidDynamicsCalculators(): JSX.Element { // Explicit return type
  return ( // Ensure JSX is explicitly returned
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Density Calculator */}
      <CalculatorCard
        title="Density"
        description="Calculate the density (ρ) of a substance."
        inputFields={[
          { name: 'm', label: 'Mass (m)', unit: 'kg' }, // Mass cannot be negative
          { name: 'V', label: 'Volume (V)', unit: 'm³' }, // Volume must be positive
        ]}
        formula="ρ = m / V"
        calculate={({ m, V }) => {
          if (V <= 0) return "Volume must be positive."; // Avoid division by zero or non-physical volume
          if (m < 0) return "Mass cannot be negative.";
          return m / V;
        }}
        resultLabel="Density (ρ)"
        resultUnit="kg/m³"
      />

      {/* Pressure Calculator (P = F/A) */}
      <CalculatorCard
        title="Pressure"
        description="Calculate the pressure (P) exerted by a force over an area."
        inputFields={[
          { name: 'F', label: 'Force (F)', unit: 'N', allowNegative: true }, // Force can be negative
          { name: 'A', label: 'Area (A)', unit: 'm²' }, // Area must be positive
        ]}
        formula="P = F / A"
        calculate={({ F, A }) => {
          if (A <= 0) return "Area must be positive."; // Avoid division by zero or non-physical area
          return F / A;
        }}
        resultLabel="Pressure (P)"
        resultUnit="Pa"
      />

      {/* Buoyant Force Calculator (Archimedes' Principle) */}
      <CalculatorCard
        // Pass title with HTML sub tag
        title="Buoyant Force"
        description="Calculate the buoyant force on a submerged object."
        inputFields={[
          // Pass label with HTML sub tag
          { name: 'rho_fluid', label: 'Fluid Density (ρ<sub class="text-[0.6em] align-baseline">fluid</sub>)', unit: 'kg/m³' }, // Density must be non-negative
          { name: 'V_submerged', label: 'Submerged Volume (V<sub class="text-[0.6em] align-baseline">sub</sub>)', unit: 'm³' }, // Volume must be positive
        ]}
        // Pass formula with HTML sub tag
        formula="F<sub class='text-[0.6em] align-baseline'>B</sub> = ρ<sub class='text-[0.6em] align-baseline'>fluid</sub> * V<sub class='text-[0.6em] align-baseline'>sub</sub> * g"
        calculate={({ rho_fluid, V_submerged }) => {
          if (rho_fluid < 0) return "Fluid density cannot be negative.";
          if (V_submerged <= 0) return "Submerged volume must be positive.";
          return rho_fluid * V_submerged * g;
        }}
        // Pass resultLabel with HTML sub tag
        resultLabel="Buoyant Force (F<sub class='text-[0.6em] align-baseline'>B</sub>)"
        resultUnit="N"
        children={
          <p className="text-xs text-muted-foreground mt-2">
            Uses g ≈ 9.81 m/s². Ensure fluid density and volume are non-negative, volume positive.
          </p>
        }
      />

       {/* Continuity Equation Calculator (A1v1 = A2v2) */}
       <CalculatorCard
        title="Continuity Equation"
        description="Calculate the velocity of a fluid in a pipe based on the continuity equation."
        inputFields={[
          { name: 'A1', label: 'Area 1 (A₁)', unit: 'm²' },
          { name: 'v1', label: 'Velocity 1 (v₁)', unit: 'm/s', allowNegative: true },
          { name: 'A2', label: 'Area 2 (A₂)', unit: 'm²' },
        ]}
        formula="A₁v₁ = A₂v₂"
        calculate={({ A1, v1, A2 }) => {
          if (A1 <= 0 || A2 <= 0) return "Areas must be positive.";
          return (A1 * v1) / A2;
        }}
        resultLabel="Velocity 2 (v₂)"
        resultUnit="m/s"
      />

      {/* Bernoulli's Principle Calculator */}
      <CalculatorCard
        title="Bernoulli's Principle"
        description="Calculate the velocity of a fluid based on Bernoulli's principle."
        inputFields={[
          { name: 'P1', label: 'Pressure 1 (P₁)', unit: 'Pa', allowNegative: true },
          { name: 'v1', label: 'Velocity 1 (v₁)', unit: 'm/s', allowNegative: true },
          { name: 'P2', label: 'Pressure 2 (P₂)', unit: 'Pa', allowNegative: true },
        ]}
        formula="P₁ + 0.5ρv₁² = P₂ + 0.5ρv₂² (where ρ=1000kg/m^3 for water)"
        calculate={({ P1, v1, P2 }) => {
          const rho = 1000; // Density of water (kg/m³)
          const term1 = P1 + 0.5 * rho * v1 * v1;
          const term2 = P2;
          const v2Squared = (2 * (term1 - term2)) / rho;
          if (v2Squared < 0) {
            return "Result is not a Real number, check your input values."; // Handle negative square root
          }

          return Math.sqrt(v2Squared);

        }}
        resultLabel="Velocity 2 (v₂)"
        resultUnit="m/s"
      />
    </div>
  );
}

