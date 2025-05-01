import { CalculatorCard } from './calculator-card';

export function WavesSoundCalculators() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Wave Speed Calculator */}
      <CalculatorCard
        title="Wave Speed"
        description="Calculate the speed (v) of a wave."
        inputFields={[
          { name: 'f', label: 'Frequency (f)', unit: 'Hz' },
          { name: 'lambda', label: 'Wavelength (λ)', unit: 'm' },
        ]}
        formula="v = fλ"
        calculate={({ f, lambda }) => f * lambda}
        resultLabel="Wave Speed (v)"
        resultUnit="m/s"
      />

      {/* Frequency Calculator */}
      <CalculatorCard
        title="Frequency"
        description="Calculate the frequency (f) of a wave."
        inputFields={[
          { name: 'v', label: 'Wave Speed (v)', unit: 'm/s' },
          { name: 'lambda', label: 'Wavelength (λ)', unit: 'm' },
        ]}
        formula="f = v / λ"
        calculate={({ v, lambda }) => {
          if (lambda === 0) return null; // Avoid division by zero
          return v / lambda;
        }}
        resultLabel="Frequency (f)"
        resultUnit="Hz"
      />

       {/* Wavelength Calculator */}
       <CalculatorCard
        title="Wavelength"
        description="Calculate the wavelength (λ) of a wave."
        inputFields={[
          { name: 'v', label: 'Wave Speed (v)', unit: 'm/s' },
          { name: 'f', label: 'Frequency (f)', unit: 'Hz' },
        ]}
        formula="λ = v / f"
        calculate={({ v, f }) => {
           if (f === 0) return null; // Avoid division by zero
           return v / f;
        }}
        resultLabel="Wavelength (λ)"
        resultUnit="m"
      />
    </div>
  );
}
