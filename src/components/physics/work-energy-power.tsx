
import { CalculatorCard } from './calculator-card';

export function WorkEnergyPowerCalculators() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Work Calculator */}
      <CalculatorCard
        title="Work Done"
        description="Calculate the work (W) done by a constant force."
        inputFields={[
          { name: 'F', label: 'Force (F)', unit: 'N', allowNegative: true }, // Force can be negative (opposing motion)
          { name: 'd', label: 'Distance (d)', unit: 'm' }, // Distance usually positive, but displacement can be negative
          // Optional: Angle, default to 0 degrees (cos(0)=1)
        ]}
        formula="W = F × d"
        calculate={({ F, d }) => F * d}
        resultLabel="Work Done (W)"
        resultUnit="J"
         children={
             <p className="text-xs text-muted-foreground mt-2">
               Note: This formula assumes the force is applied parallel to the direction of motion. Distance 'd' is treated as displacement magnitude. Work can be negative if force opposes displacement. For force at an angle θ, use W = F × d × cos(θ).
             </p>
         }
      />

      {/* Power Calculator */}
      <CalculatorCard
        title="Power"
        description="Calculate the power (P) expended."
        inputFields={[
          { name: 'W', label: 'Work Done (W)', unit: 'J', allowNegative: true }, // Work can be negative
          { name: 't', label: 'Time (t)', unit: 's' }, // Time cannot be negative
        ]}
        formula="P = W / t"
        calculate={({ W, t }) => {
          if (t === 0) return null; // Avoid division by zero
          return W / t;
        }}
        resultLabel="Power (P)"
        resultUnit="W"
      />

      {/* Kinetic Energy Calculator */}
      <CalculatorCard
        title="Kinetic Energy"
        description="Calculate the kinetic energy (KE) of a moving object."
        inputFields={[
          { name: 'm', label: 'Mass (m)', unit: 'kg' }, // Mass cannot be negative
          { name: 'v', label: 'Velocity (v)', unit: 'm/s', allowNegative: true }, // Velocity can be negative, but KE uses v^2
        ]}
        formula="KE = ½mv²"
        calculate={({ m, v }) => 0.5 * m * v * v}
        resultLabel="Kinetic Energy (KE)"
        resultUnit="J"
      />

       {/* Potential Energy Calculator */}
       <CalculatorCard
        title="Gravitational Potential Energy"
        description="Calculate the potential energy (PE) due to gravity near Earth's surface."
        inputFields={[
          { name: 'm', label: 'Mass (m)', unit: 'kg' }, // Mass cannot be negative
          { name: 'g', label: 'Gravitational Acceleration (g)', unit: 'm/s²', defaultValue: '9.81', allowNegative: false }, // g is usually positive contextually
          { name: 'h', label: 'Height (h)', unit: 'm', allowNegative: true }, // Height can be negative relative to a reference point
        ]}
        formula="PE = mgh"
        calculate={({ m, g, h }) => m * g * h}
        resultLabel="Potential Energy (PE)"
        resultUnit="J"
         children={
             <p className="text-xs text-muted-foreground mt-2">
                Uses g ≈ 9.81 m/s² by default. Adjust if needed for different locations. Height 'h' is relative to a chosen zero level.
             </p>
         }
      />
    </div>
  );
}
