
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
        // The standard lens formula is 1/f = 1/v - 1/u. Rearranged for 1/v: 1/v = 1/f + 1/u
        // Solving for v: v = (u*f) / (u+f)
        formula="1/v = 1/f + 1/u"
        calculate={({ f, u }) => {
          const denominator = u + f;
          if (denominator === 0) return null; // Avoid division by zero (object at -f)
          return (u * f) / denominator;
        }}
        resultLabel="Image Distance (v)"
        resultUnit="m"
        children={
          <p className="text-xs text-muted-foreground mt-2">
            Lens Convention: +f converging, -f diverging. +u real object (usually left), -v virtual image (left), +v real image (right). Formula assumes object distance u is measured from the lens (+ if left).
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
        // The standard mirror formula is 1/f = 1/u + 1/v. Rearranged for 1/v: 1/v = 1/f - 1/u
        // Solving for v: v = (u*f) / (u-f)
        formula="1/v = 1/f - 1/u"
        calculate={({ f, u }) => {
          const denominator = u - f;
          if (denominator === 0) return null; // Avoid division by zero (object at f)
          return (u * f) / denominator;
        }}
        resultLabel="Image Distance (v)"
        resultUnit="m"
        children={
          <p className="text-xs text-muted-foreground mt-2">
            Mirror Convention: +f concave, -f convex. +u real object (usually left), +v real image (left), -v virtual image (right). Formula assumes object distance u is measured from the mirror (+ if left).
          </p>
        }
      />

        {/* Lens/Mirror Formula (Focal Length) */}
      <CalculatorCard
        title="Lens/Mirror Formula (Focal Length)"
        description="Calculate the focal length (f) using object and image distances."
        inputFields={[
          { name: 'u', label: 'Object Distance (u)', unit: 'm' },
          { name: 'v', label: 'Image Distance (v)', unit: 'm' },
        ]}
        // Combined formula: 1/f = 1/u + 1/v -> f = (u*v)/(u+v)
        // This works for both if sign conventions are applied correctly to u and v.
        formula="1/f = 1/u + 1/v"
        calculate={({ u, v }) => {
          const sum = u + v;
          if (sum === 0) return null; // Avoid division by zero
          return (u * v) / sum;
        }}
        resultLabel="Focal Length (f)"
        resultUnit="m"
        children={
          <p className="text-xs text-muted-foreground mt-2">
            Enter object (u) and image (v) distances with correct signs based on lens/mirror conventions. Result +f indicates converging, -f indicates diverging.
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
          return -v / u; // Standard magnification formula
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
          if (v_medium <= 0) return null; // Speed must be positive
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
