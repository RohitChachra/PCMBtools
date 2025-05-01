'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Script from 'next/script';

declare global {
  interface Window {
    Desmos: any;
  }
}

export default function MathPage() {
  const calculatorRef = useRef<HTMLDivElement>(null);
  const desmosInstanceRef = useRef<any>(null);
  const [expression, setExpression] = useState<string>('y = x^2');
  const [expressions, setExpressions] = useState<{ id: string; latex: string }[]>([]);
  const [isDesmosLoaded, setIsDesmosLoaded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isDesmosLoaded && calculatorRef.current && !desmosInstanceRef.current) {
      try {
        desmosInstanceRef.current = window.Desmos.GraphingCalculator(calculatorRef.current, {
           keypad: true,
           expressions: true,
        });
        // Set initial expression
        const initialId = `expr-${Date.now()}`;
        desmosInstanceRef.current.setExpression({ id: initialId, latex: expression });
        setExpressions([{ id: initialId, latex: expression }]);
      } catch (error) {
        console.error("Failed to initialize Desmos:", error);
        toast({
          title: "Error",
          description: "Failed to load the graphing calculator. Please refresh the page.",
          variant: "destructive",
        });
      }
    }

    // Cleanup function
    return () => {
      if (desmosInstanceRef.current) {
        // Check if destroy method exists before calling
        if (typeof desmosInstanceRef.current.destroy === 'function') {
           desmosInstanceRef.current.destroy();
        }
        desmosInstanceRef.current = null;
      }
    };
  }, [isDesmosLoaded, expression, toast]); // Add expression to dependency array to reset graph on initial load


  const handleAddExpression = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desmosInstanceRef.current) {
        toast({ title: "Error", description: "Calculator not loaded.", variant: "destructive" });
        return;
    }
     if (!expression.trim()) {
        toast({ title: "Input Error", description: "Please enter a valid mathematical expression.", variant: "destructive" });
        return;
    }
    try {
        const newId = `expr-${Date.now()}`;
        desmosInstanceRef.current.setExpression({ id: newId, latex: expression });
        setExpressions(prev => [...prev, { id: newId, latex: expression }]);
        setExpression(''); // Clear input after adding
    } catch (error) {
        console.error("Invalid expression:", error);
        toast({ title: "Invalid Expression", description: "Please enter a valid mathematical expression (e.g., y = sin(x), f(x) = x^3 - x).", variant: "destructive" });
    }
  };

   const handleRemoveExpression = (idToRemove: string) => {
    if (!desmosInstanceRef.current) return;
    try {
        desmosInstanceRef.current.removeExpression({ id: idToRemove });
        setExpressions(prev => prev.filter(expr => expr.id !== idToRemove));
    } catch (error) {
        console.error("Failed to remove expression:", error);
        toast({ title: "Error", description: "Could not remove the expression.", variant: "destructive" });
    }
  };

  return (
    <>
      <Script
        src="https://www.desmos.com/api/v1.8/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6"
        strategy="lazyOnload"
        onLoad={() => {
            console.log("Desmos API script loaded.");
            setIsDesmosLoaded(true);
        }}
        onError={(e) => {
            console.error("Failed to load Desmos API script:", e);
             toast({
                title: "Error",
                description: "Failed to load the Desmos graphing calculator script. Please check your internet connection or try again later.",
                variant: "destructive",
                duration: 9000, // Show longer for critical errors
            });
        }}
      />
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Interactive Graphing Calculator</h1>
        <p className="text-muted-foreground">
          Powered by the Desmos API. Enter mathematical functions below and see them plotted in real-time.
          You can add multiple expressions to compare graphs. Examples: <code>y = sin(x)</code>, <code>f(x) = x^3 - x</code>, <code>r = cos(3θ)</code>.
        </p>

        <Card>
          <CardHeader>
            <CardTitle>Graphing Area</CardTitle>
             <CardDescription>Input functions to visualize them.</CardDescription>
          </CardHeader>
          <CardContent>
             <form onSubmit={handleAddExpression} className="flex flex-col sm:flex-row gap-2 mb-4">
                 <Input
                    type="text"
                    value={expression}
                    onChange={(e) => setExpression(e.target.value)}
                    placeholder="Enter a function (e.g., y = x^2 + 1)"
                    className="flex-grow"
                    aria-label="Enter mathematical function"
                 />
                 <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                   Add Graph
                 </Button>
             </form>

             {expressions.length > 0 && (
                <div className="mb-4 space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Current Expressions:</h3>
                    <ul className="list-none p-0 m-0 space-y-1">
                        {expressions.map((expr) => (
                            <li key={expr.id} className="flex items-center justify-between bg-secondary p-2 rounded-md text-sm">
                                <span><code>{expr.latex}</code></span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveExpression(expr.id)}
                                    aria-label={`Remove expression ${expr.latex}`}
                                >
                                    Remove
                                </Button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

             <div ref={calculatorRef} style={{ width: '100%', height: '500px' }} className="border rounded-md shadow-inner bg-muted/20">
                {!isDesmosLoaded && <div className="flex items-center justify-center h-full text-muted-foreground">Loading Calculator...</div>}
             </div>

          </CardContent>
        </Card>
      </div>
    </>
  );
}
