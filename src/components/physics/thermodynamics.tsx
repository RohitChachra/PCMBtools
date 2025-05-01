
import { CalculatorCard } from './calculator-card';

const R = 8.314; // Ideal gas constant (J K⁻¹ mol⁻¹)

export function ThermodynamicsCalculators() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Heat Transfer Calculator */}
      <CalculatorCard
        title="Heat Transfer (Specific Heat)"
        description="Calculate the heat (Q) required to change the temperature of a substance."
        inputFields={[
          { name: 'm', label: 'Mass (m)', unit: 'kg' },
          { name: 'c', label: 'Specific Heat Capacity (c)', unit: 'J/(kg·K)' },
          { name: 'deltaT', label: 'Temperature Change (ΔT)', unit: 'K or °C' },
        ]}
        formula="Q = mcΔT"
        calculate={({ m, c, deltaT }) => m * c * deltaT}
        resultLabel="Heat Transferred (Q)"
        resultUnit="J"
        children={
             <p className="text-xs text-muted-foreground mt-2">
               Ensure specific heat capacity units match mass and temperature units. ΔT can be in Kelvin or Celsius as it's a change.
             </p>
         }
      />

      {/* Ideal Gas Law Calculator (Solve for Pressure) */}
      <CalculatorCard
        title="Ideal Gas Law (Pressure)"
        description="Calculate the pressure (P) of an ideal gas."
        inputFields={[
          { name: 'n', label: 'Amount of Substance (n)', unit: 'mol' },
          { name: 'T', label: 'Absolute Temperature (T)', unit: 'K' },
          { name: 'V', label: 'Volume (V)', unit: 'm³' },
        ]}
        formula="PV = nRT  =&gt;  P = nRT / V" // Use HTML entity for '>' if needed, though should be fine in code block
        calculate={({ n, T, V }) => {
          if (V === 0) return null; // Avoid division by zero
          if (T < 0) return null; // Temperature must be absolute (Kelvin)
          return (n * R * T) / V;
        }}
        resultLabel="Pressure (P)"
        resultUnit="Pa"
         children={
             <p className="text-xs text-muted-foreground mt-2">
               Uses R ≈ 8.314 J K⁻¹ mol⁻¹. Ensure temperature is in Kelvin (K = °C + 273.15) and volume in cubic meters.
             </p>
         }
      />

      {/* Efficiency Calculator */}
      <CalculatorCard
        title="Thermal Efficiency"
        description="Calculate the efficiency (η) of a heat engine."
        inputFields={[
          { name: 'W', label: 'Work Output (W)', unit: 'J' },
          // Use HTML entity or keep sub tag for dangerouslySetInnerHTML
          { name: 'QH', label: 'Heat Input (Q<sub class="text-[0.6em] align-baseline">H</sub>)', unit: 'J' },
        ]}
        // Ensure the formula string uses standard HTML <sub> tags
        formula="η = (W / Q<sub>H</sub>) * 100"
        calculate={({ W, QH }) => {
          if (QH === 0) return null; // Avoid division by zero
          if (W < 0 || QH < 0) return null; // Work and Heat Input should be positive for standard efficiency calc
          if (W > QH) return null; // Work output cannot exceed heat input
          return (W / QH) * 100;
        }}
        resultLabel="Efficiency (η)"
        resultUnit="%"
         children={
             <p className="text-xs text-muted-foreground mt-2">
                Efficiency is expressed as a percentage. Ensure Work Output and Heat Input have the same units.
             </p>
         }
      />
    </div>
  );
}
