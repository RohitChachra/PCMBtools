import { CalculatorCard } from './calculator-card';

export function CircularMotionCalculators() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Centripetal Force Calculator */}
      <CalculatorCard
        title="Centripetal Force"
        description="Calculate the centripetal force (F) required for circular motion."
        inputFields={[
          { name: 'm', label: 'Mass (m)', unit: 'kg' },
          { name: 'v', label: 'Tangential Velocity (v)', unit: 'm/s' },
          { name: 'r', label: 'Radius (r)', unit: 'm' },
        ]}
        formula="F = mv² / r"
        calculate={({ m, v, r }) => {
          if (r === 0) return null; // Avoid division by zero
          return (m * v * v) / r;
        }}
        resultLabel="Centripetal Force (F)"
        resultUnit="N"
      />

      {/* Angular Velocity Calculator */}
      <CalculatorCard
        title="Angular Velocity"
        description="Calculate the angular velocity (ω) from angle and time."
        inputFields={[
          { name: 'theta', label: 'Angle (θ)', unit: 'radians' },
          { name: 't', label: 'Time (t)', unit: 's' },
        ]}
        formula="ω = θ / t"
        calculate={({ theta, t }) => {
          if (t === 0) return null; // Avoid division by zero
          return theta / t;
        }}
        resultLabel="Angular Velocity (ω)"
        resultUnit="rad/s"
        children={
             <p className="text-xs text-muted-foreground mt-2">
               Ensure the angle is provided in radians. (1 revolution = 2π radians)
             </p>
         }
      />

      {/* Tangential Velocity Calculator */}
      <CalculatorCard
        title="Tangential Velocity"
        description="Calculate the tangential velocity (v) from angular velocity and radius."
        inputFields={[
          { name: 'r', label: 'Radius (r)', unit: 'm' },
          { name: 'omega', label: 'Angular Velocity (ω)', unit: 'rad/s' },
        ]}
        formula="v = rω"
        calculate={({ r, omega }) => r * omega}
        resultLabel="Tangential Velocity (v)"
        resultUnit="m/s"
      />
    </div>
  );
}
