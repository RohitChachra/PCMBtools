
'use client';

import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { KinematicsCalculators } from '@/components/physics/kinematics';
import { DynamicsCalculators } from '@/components/physics/dynamics';
import { WorkEnergyPowerCalculators } from '@/components/physics/work-energy-power';
import { GravitationCalculators } from '@/components/physics/gravitation';
import { CircularMotionCalculators } from '@/components/physics/circular-motion';
import { ElectrostaticsCalculators } from '@/components/physics/electrostatics';
import { ThermodynamicsCalculators } from '@/components/physics/thermodynamics';
import { WavesSoundCalculators } from '@/components/physics/waves-sound';
import { CurrentElectricityCalculators } from '@/components/physics/current-electricity';
import { OpticsCalculators } from '@/components/physics/optics';
import { MagnetismCalculators } from '@/components/physics/magnetism';
import { FluidDynamicsCalculators } from '@/components/physics/fluid-dynamics';
import { Atom, Waves, Gauge, Droplet, TrendingUp, Zap, Sigma, Thermometer } from 'lucide-react'; // Import relevant icons

interface CalculatorCategory {
  id: string;
  title: string;
  description: string;
  component: React.FC;
  icon?: React.ElementType; // Optional icon
}

// Exclude Unit Converter from this hub
const calculatorCategories: CalculatorCategory[] = [
  {
    id: 'kinematics',
    title: 'Kinematics',
    description: 'Calculate velocity, displacement, and time for objects in motion.',
    component: KinematicsCalculators,
    icon: TrendingUp, // Example icon
  },
  {
    id: 'dynamics',
    title: 'Dynamics',
    description: 'Calculate force, acceleration, and momentum.',
    component: DynamicsCalculators,
    icon: Atom, // Example icon
  },
  {
    id: 'work_energy_power',
    title: 'Work, Energy, and Power',
    description: 'Calculate work done, power output, kinetic and potential energy.',
    component: WorkEnergyPowerCalculators,
    icon: Zap, // Example icon
  },
   {
    id: 'gravitation',
    title: 'Gravitation',
    description: 'Calculate gravitational force, potential energy, and acceleration.',
    component: GravitationCalculators,
     icon: Atom, // Reusing Atom
  },
   {
    id: 'circular_motion',
    title: 'Circular Motion',
    description: 'Calculate centripetal force, angular and tangential velocity.',
    component: CircularMotionCalculators,
     icon: TrendingUp, // Reusing TrendingUp
  },
    {
    id: 'electrostatics',
    title: 'Electrostatics',
    description: "Calculate Coulomb's force, electric field, and electric potential.",
    component: ElectrostaticsCalculators,
     icon: Zap, // Reusing Zap
  },
   {
    id: 'thermodynamics',
    title: 'Thermodynamics',
    description: 'Calculate heat transfer, ideal gas properties, and efficiency.',
    component: ThermodynamicsCalculators,
     icon: Thermometer, // Example icon
  },
  {
    id: 'fluid_dynamics',
    title: 'Fluid Dynamics',
    description: 'Calculate density, pressure, buoyant force, and flow rate.',
    component: FluidDynamicsCalculators,
    icon: Droplet, // Example icon
  },
   {
    id: 'waves_sound',
    title: 'Waves and Sound',
    description: 'Calculate wave speed, frequency, and wavelength.',
    component: WavesSoundCalculators,
     icon: Waves, // Example icon
  },
   {
    id: 'current_electricity',
    title: 'Current Electricity',
    description: "Calculate voltage, current, resistance (Ohm's Law), and power.",
    component: CurrentElectricityCalculators,
     icon: Zap, // Reusing Zap
  },
  {
    id: 'optics',
    title: 'Optics',
    description: 'Calculate properties using lens/mirror formulas and refractive index.',
    component: OpticsCalculators,
     icon: Sigma, // Example icon (could use Eye or Aperture too)
  },
  {
    id: 'magnetism',
    title: 'Magnetism',
    description: 'Calculate magnetic forces on moving charges and current-carrying wires.',
    component: MagnetismCalculators,
     icon: Atom, // Reusing Atom
  },
];

export default function PhysicsCalculatorHubPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Physics Calculator Hub</h1>
      <p className="text-muted-foreground">
        Explore various physics concepts and solve problems using the tools below. Select a topic to view the available calculators.
      </p>

      <Accordion type="single" collapsible className="w-full space-y-4">
        {calculatorCategories.map((category) => (
          <AccordionItem value={category.id} key={category.id} className="border rounded-lg bg-card shadow-sm">
            <AccordionTrigger className="px-6 py-4 text-lg font-semibold hover:no-underline">
              <div className="flex items-center gap-2">
                 {category.icon && <category.icon className="h-5 w-5 text-primary" />}
                 {category.title}
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 pt-0">
              <p className="text-muted-foreground mb-6">{category.description}</p>
              <category.component />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
