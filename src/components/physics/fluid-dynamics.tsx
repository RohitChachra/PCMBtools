
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
          { name: 'F', label: 'Force (F)', unit: 'N', allowNegative: true }, // Force can be negative (e.g., tension causing negative pressure)
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
        title="Buoyant Force"
        description="Calculate the buoyant force (F<sub class='text-[0.6em] align-baseline'>B</sub>) on a submerged object."
        inputFields={[
          { name: 'rho_fluid', label: 'Fluid Density (ρ<sub class=\"text-[0.6em] align-baseline\">fluid</sub>)', unit: 'kg/m³' }, // Density must be non-negative
          { name: 'V_submerged', label: 'Submerged Volume (V<sub class=\"text-[0.6em] align-baseline\">sub</sub>)', unit: 'm³' }, // Volume must be positive
        ]}
        formula="F<sub>B</sub> = ρ<sub>fluid</sub> * V<sub>sub</sub> * g"
        calculate={({ rho_fluid, V_submerged }) => {
          if (rho_fluid < 0) return "Fluid density cannot be negative.";
          if (V_submerged <= 0) return "Submerged volume must be positive.";
          return rho_fluid * V_submerged * g;
        }}
        resultLabel="Buoyant Force (F<sub class='text-[0.6em] align-baseline'>B</sub>)"
        resultUnit="N"
        children={
          <p className="text-xs text-muted-foreground mt-2">
            Uses g ≈ 9.81 m/s². Ensure fluid density and volume are non-negative, volume positive.
          </p>
        }
      />

      {/* Add Continuity Equation (A1v1 = A2v2) and Bernoulli's Principle calculators if desired later */}
    </div>
  );
}
