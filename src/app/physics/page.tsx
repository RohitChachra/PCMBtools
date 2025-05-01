'use client';

import React, { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { KinematicsCalculators } from '@/components/physics/kinematics';
import { DynamicsCalculators } from '@/components/physics/dynamics';
import { WorkEnergyPowerCalculators } from '@/components/physics/work-energy-power';
import { GravitationCalculators } from '@/components/physics/gravitation';
import { CircularMotionCalculators } from '@/components/physics/circular-motion';
import { ElectrostaticsCalculators } from '@/components/physics/electrostatics';
import { ThermodynamicsCalculators } from '@/components/physics/thermodynamics';
import { WavesSoundCalculators } from '@/components/physics/waves-sound'; // Optional

interface CalculatorCategory {
  id: string;
  title: string;
  description: string;
  component: React.FC;
}

const calculatorCategories: CalculatorCategory[] = [
  {
    id: 'kinematics',
    title: 'Kinematics',
    description: 'Calculate velocity, displacement, and time for objects in motion.',
    component: KinematicsCalculators,
  },
  {
    id: 'dynamics',
    title: 'Dynamics',
    description: 'Calculate force, acceleration, and momentum.',
    component: DynamicsCalculators,
  },
  {
    id: 'work_energy_power',
    title: 'Work, Energy, and Power',
    description: 'Calculate work done, power output, kinetic and potential energy.',
    component: WorkEnergyPowerCalculators,
  },
   {
    id: 'gravitation',
    title: 'Gravitation',
    description: 'Calculate gravitational force, potential energy, and acceleration.',
    component: GravitationCalculators,
  },
   {
    id: 'circular_motion',
    title: 'Circular Motion',
    description: 'Calculate centripetal force, angular and tangential velocity.',
    component: CircularMotionCalculators,
  },
    {
    id: 'electrostatics',
    title: 'Electrostatics',
    description: "Calculate Coulomb's force, electric field, and electric potential.",
    component: ElectrostaticsCalculators,
  },
   {
    id: 'thermodynamics',
    title: 'Thermodynamics',
    description: 'Calculate heat transfer, ideal gas properties, and efficiency.',
    component: ThermodynamicsCalculators,
  },
   {
    id: 'waves_sound',
    title: 'Waves and Sound (Optional)',
    description: 'Calculate wave speed and frequency.',
    component: WavesSoundCalculators,
  },
];

export default function PhysicsPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Physics Calculator Hub</h1>
      <p className="text-muted-foreground">
        Explore various physics concepts and solve problems using the calculators below. Select a topic to view the available calculators.
      </p>

      <Accordion type="single" collapsible className="w-full space-y-4">
        {calculatorCategories.map((category) => (
          <AccordionItem value={category.id} key={category.id} className="border rounded-lg bg-card shadow-sm">
            <AccordionTrigger className="px-6 py-4 text-lg font-semibold hover:no-underline">
              {category.title}
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
