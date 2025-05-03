
import { CalculatorCard } from './calculator-card';

export function CircularMotionCalculators() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Centripetal Force Calculator */}
      <CalculatorCard
        title="Centripetal Force"
        description="Calculate the centripetal force (F) required for circular motion."
        inputFields={[
          { name: 'm', label: 'Mass (m)', unit: 'kg' }, // Mass cannot be negative
          { name: 'v', label: 'Tangential Velocity (v)', unit: 'm/s', allowNegative: true }, // Velocity can be negative, but F uses v^2
          { name: 'r', label: 'Radius (r)', unit: 'm' }, // Radius cannot be negative
        ]}
        formula="F = mv² / r"
        calculate={({ m, v, r }) => {
          if (r === 0) return null; // Avoid division by zero
          if (r < 0 || m < 0) return null; // Validate radius and mass
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
          { name: 'theta', label: 'Angle (θ)', unit: 'radians', allowNegative: true }, // Angle can be negative
          { name: 't', label: 'Time (t)', unit: 's' }, // Time cannot be negative
        ]}
        formula="ω = θ / t"
        calculate={({ theta, t }) => {
          if (t === 0) return null; // Avoid division by zero
          if (t < 0) return null; // Validate time
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
          { name: 'r', label: 'Radius (r)', unit: 'm' }, // Radius cannot be negative
          { name: 'omega', label: 'Angular Velocity (ω)', unit: 'rad/s', allowNegative: true }, // Angular velocity can be negative
        ]}
        formula="v = rω"
        calculate={({ r, omega }) => {
            if (r < 0) return null; // Validate radius
            return r * omega;
        }}
        resultLabel="Tangential Velocity (v)"
        resultUnit="m/s"
      />
    </div>
  );
}
