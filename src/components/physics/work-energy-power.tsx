import { CalculatorCard } from './calculator-card';

export function WorkEnergyPowerCalculators() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Work Calculator */}
      <CalculatorCard
        title="Work Done"
        description="Calculate the work (W) done by a constant force."
        inputFields={[
          { name: 'F', label: 'Force (F)', unit: 'N' },
          { name: 'd', label: 'Distance (d)', unit: 'm' },
          // Optional: Angle, default to 0 degrees (cos(0)=1)
        ]}
        formula="W = F × d"
        calculate={({ F, d }) => F * d}
        resultLabel="Work Done (W)"
        resultUnit="J"
         children={
             <p className="text-xs text-muted-foreground mt-2">
               Note: This formula assumes the force is applied parallel to the direction of motion. For force at an angle θ, use W = F × d × cos(θ).
             </p>
         }
      />

      {/* Power Calculator */}
      <CalculatorCard
        title="Power"
        description="Calculate the power (P) expended."
        inputFields={[
          { name: 'W', label: 'Work Done (W)', unit: 'J' },
          { name: 't', label: 'Time (t)', unit: 's' },
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
          { name: 'm', label: 'Mass (m)', unit: 'kg' },
          { name: 'v', label: 'Velocity (v)', unit: 'm/s' },
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
          { name: 'm', label: 'Mass (m)', unit: 'kg' },
          { name: 'g', label: 'Gravitational Acceleration (g)', unit: 'm/s²', defaultValue: '9.81' },
          { name: 'h', label: 'Height (h)', unit: 'm' },
        ]}
        formula="PE = mgh"
        calculate={({ m, g, h }) => m * g * h}
        resultLabel="Potential Energy (PE)"
        resultUnit="J"
         children={
             <p className="text-xs text-muted-foreground mt-2">
                Uses g ≈ 9.81 m/s² by default. Adjust if needed for different locations.
             </p>
         }
      />
    </div>
  );
}
