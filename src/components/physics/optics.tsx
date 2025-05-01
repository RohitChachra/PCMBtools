
import { CalculatorCard } from './calculator-card';

const c = 299792458; // Speed of light in vacuum (m/s)

export function OpticsCalculators() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Lens Formula (Image Distance) */}
      <CalculatorCard
        title="Lens Formula (Image Distance)"
        description="Calculate the image distance (v) for a thin lens."
        inputFields={[
          { name: 'f', label: 'Focal Length (f)', unit: 'm' },
          { name: 'u', label: 'Object Distance (u)', unit: 'm' },
        ]}
        formula="1/v = 1/f + 1/u" // Note: Using 1/v = 1/f - 1/(-u) for typical u<0
        calculate={({ f, u }) => {
          // Using v = (u*f)/(u+f) derivation assuming u is entered with its sign
          const denominator = u + f;
          if (denominator === 0) return null; // Avoid division by zero (object at -f)
          return (u * f) / denominator;
        }}
        resultLabel="Image Distance (v)"
        resultUnit="m"
        children={
          <p className="text-xs text-muted-foreground mt-2">
            Use sign conventions: +f for converging lens, -f for diverging lens. Object distance u is usually negative for real objects. Result v > 0 for real image, v &lt; 0 for virtual image.
          </p>
        }
      />

      {/* Mirror Formula (Image Distance) */}
      <CalculatorCard
        title="Mirror Formula (Image Distance)"
        description="Calculate the image distance (v) for a spherical mirror."
        inputFields={[
          { name: 'f', label: 'Focal Length (f)', unit: 'm' },
          { name: 'u', label: 'Object Distance (u)', unit: 'm' },
        ]}
        formula="1/v = 1/f - 1/u"
        calculate={({ f, u }) => {
          // Using v = (u*f)/(u-f) derivation
          const denominator = u - f;
          if (denominator === 0) return null; // Avoid division by zero (object at f)
          return (u * f) / denominator;
        }}
        resultLabel="Image Distance (v)"
        resultUnit="m"
        children={
          <p className="text-xs text-muted-foreground mt-2">
            Use sign conventions: +f for concave mirror, -f for convex mirror. Object distance u is usually negative for real objects. Result v > 0 for real image, v &lt; 0 for virtual image.
          </p>
        }
      />

      {/* Magnification Calculator */}
      <CalculatorCard
        title="Magnification (Lens/Mirror)"
        description="Calculate the magnification (m) produced by a lens or mirror."
        inputFields={[
          { name: 'v', label: 'Image Distance (v)', unit: 'm' },
          { name: 'u', label: 'Object Distance (u)', unit: 'm' },
        ]}
        formula="m = -v / u"
        calculate={({ v, u }) => {
          if (u === 0) return null; // Avoid division by zero
          return -v / u;
        }}
        resultLabel="Magnification (m)"
        resultUnit="(dimensionless)"
        children={
          <p className="text-xs text-muted-foreground mt-2">
            Use image and object distances with their correct signs. |m| &gt; 1 enlarged, |m| &lt; 1 diminished. m &lt; 0 inverted, m &gt; 0 upright.
          </p>
        }
      />

      {/* Refractive Index (Snell's Law basic) */}
      <CalculatorCard
        title="Refractive Index"
        description="Calculate the refractive index (n) of a medium."
        inputFields={[
          { name: 'v_medium', label: 'Speed of light in medium (v)', unit: 'm/s' },
        ]}
        formula="n = c / v"
        calculate={({ v_medium }) => {
          if (v_medium === 0) return null; // Avoid division by zero
          if (v_medium > c) return "Speed cannot exceed c"; // Physical constraint
          return c / v_medium;
        }}
        resultLabel="Refractive Index (n)"
        resultUnit="(dimensionless)"
        children={
          <p className="text-xs text-muted-foreground mt-2">
            Uses c ≈ 3.00 × 10⁸ m/s (speed of light in vacuum). Result n ≥ 1.
          </p>
        }
      />

       {/* Snell's Law (Angle of Refraction) - Requires angle inputs */}
       {/* Consider adding this later if angle inputs are desired */}

    </div>
  );
}
