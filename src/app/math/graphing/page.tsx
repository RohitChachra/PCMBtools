

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Script from 'next/script';
import { Skeleton } from '@/components/ui/skeleton';
import { Calculator as CalculatorIcon } from 'lucide-react'; // Renamed Calculator to avoid conflict

declare global {
  interface Window {
    Desmos: any;
  }
}

// --- Component ---

export default function GraphingPage() {
  const calculatorRef = useRef<HTMLDivElement>(null);
  const desmosInstanceRef = useRef<any>(null);
  const [expression, setExpression] = useState<string>('y = x^2');
  const [expressions, setExpressions] = useState<{ id: string; latex: string }[]>([]);
  const [isDesmosLoaded, setIsDesmosLoaded] = useState(false);
  const [isDesmosInitialized, setIsDesmosInitialized] = useState(false); // New state for initialization status
  const { toast } = useToast();


  // --- Desmos Logic ---

  // Effect to initialize Desmos when the script is loaded and the ref is available
  useEffect(() => {
    // Ensure this runs only on the client
    if (typeof window === 'undefined' || !isDesmosLoaded || !calculatorRef.current) {
      return;
    }

    // Check if an instance already exists to prevent re-initialization on fast refreshes/remounts
    if (desmosInstanceRef.current) {
      console.log("Desmos already initialized.");
      if (!isDesmosInitialized) setIsDesmosInitialized(true); // Ensure state consistency
      return;
    }


    console.log("Attempting to initialize Desmos...");
    let instance: any = null;
    try {
      instance = window.Desmos.GraphingCalculator(calculatorRef.current, {
        keypad: true,
        expressions: true,
        settingsMenu: true,
      });
      desmosInstanceRef.current = instance; // Assign to ref
      instance.setBlank(); // Start with a blank graph
      // Load initial/saved expressions if any
      expressions.forEach(expr => {
        try {
             instance.setExpression({ id: expr.id, latex: expr.latex });
        } catch (exprError) {
            console.error(`Error setting expression ${expr.id} on init:`, exprError);
        }
      });
      setIsDesmosInitialized(true); // Set initialization flag
      console.log("Desmos Initialized Successfully.");
    } catch (error) {
      console.error("Failed to initialize Desmos:", error);
      toast({
        title: "Error",
        description: "Failed to load the graphing calculator. Please refresh the page.",
        variant: "destructive",
      });
      setIsDesmosInitialized(false); // Ensure state reflects failure
    }

    // Cleanup function to destroy Desmos instance on component unmount
    return () => {
      // Important: Check the REF, not the local `instance` variable which might be stale.
      if (desmosInstanceRef.current) {
        console.log("Destroying Desmos instance.");
        try {
           desmosInstanceRef.current.destroy();
           desmosInstanceRef.current = null; // Clear the ref
           setIsDesmosInitialized(false); // Reset initialization state for next mount/navigation
           setIsDesmosLoaded(false); // Also reset loaded state to allow re-init if script needs to reload
        } catch (error) {
           console.error("Error destroying Desmos instance:", error);
        }
      }
    };
  // Rerun effect if script loads or container ref becomes available.
  // **Crucially**, DO NOT include `expressions` or `isDesmosInitialized` here,
  // as it can cause infinite loops or redundant re-initializations.
  // Initialization should only depend on script load and DOM element availability.
  }, [isDesmosLoaded, calculatorRef, toast, expressions]); // Added toast and expressions as dependencies

  // Effect to handle expressions update (sync with Desmos instance)
  useEffect(() => {
    if (desmosInstanceRef.current && isDesmosInitialized) {
      // Get current expressions from Desmos
      const currentDesmosExprs = desmosInstanceRef.current.getExpressions().map((e: any) => e.id);
      const stateExprsIds = expressions.map(expr => expr.id);

      // Add expressions from state that are not in Desmos
      expressions.forEach(expr => {
        if (!currentDesmosExprs.includes(expr.id)) {
          try {
            desmosInstanceRef.current.setExpression({ id: expr.id, latex: expr.latex });
          } catch (error) {
            console.error(`Error setting expression ${expr.id}:`, error);
          }
        }
      });

      // Remove expressions from Desmos that are no longer in state
      currentDesmosExprs.forEach((desmosId: string) => {
        if (!stateExprsIds.includes(desmosId)) {
          try {
            desmosInstanceRef.current.removeExpression({ id: desmosId });
          } catch (error) {
            console.error(`Error removing expression ${desmosId}:`, error);
          }
        }
      });
    }
  }, [expressions, isDesmosInitialized]); // Rerun when expressions array or initialization status changes


  const handleAddExpression = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDesmosInitialized || !desmosInstanceRef.current) {
        toast({ title: "Error", description: "Calculator is not ready. Please wait.", variant: "destructive" });
        return;
    }
     if (!expression.trim()) {
        toast({ title: "Input Error", description: "Please enter a valid mathematical expression.", variant: "destructive" });
        return;
    }
    try {
        const newId = `expr-${Date.now()}`;
        // Update state, useEffect will sync with Desmos
        setExpressions(prev => [...prev, { id: newId, latex: expression }]);
        setExpression(''); // Clear input after adding
    } catch (error) {
        console.error("Error adding expression:", error);
        // Attempt to let Desmos validate the expression to provide better feedback
        try {
           desmosInstanceRef.current.setExpression({id: 'temp-validation', latex: expression});
           desmosInstanceRef.current.removeExpression({id: 'temp-validation'});
        } catch(validationError: any) {
            toast({ title: "Invalid Expression", description: validationError?.message || "Please check the expression format (e.g., y = sin(x)).", variant: "destructive" });
            return; // Don't add if invalid
        }
         // If Desmos validation passes but still error somehow, show generic error
        toast({ title: "Error", description: "Could not add expression.", variant: "destructive" });
    }
  };

   const handleRemoveExpression = (idToRemove: string) => {
     // Update state first, useEffect will handle removal from Desmos instance
     setExpressions(prev => prev.filter(expr => expr.id !== idToRemove));
     // Optional: Show feedback immediately
     toast({ title: "Expression Removed", description: "Expression removed from the graph." });
  };



  return (
    <>
      <Script
        id="desmos-api-script" // Add an ID for clarity
        src="https://www.desmos.com/api/v1.8/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6"
        strategy="lazyOnload" // Use lazyOnload or beforeInteractive
        onLoad={() => {
            console.log("Desmos API script loaded successfully.");
            // Don't immediately initialize here, let useEffect handle it based on state
            setIsDesmosLoaded(true);
        }}
        onError={(e) => {
            console.error("Failed to load Desmos API script:", e);
             toast({
                title: "Error Loading Graph Script",
                description: "Could not load the Desmos graphing script. Graphing functionality may be unavailable. Try refreshing.",
                variant: "destructive",
                duration: 9000,
            });
             setIsDesmosLoaded(false); // Ensure state reflects failure
        }}
      />
      <div className="space-y-12">
         <h1 className="text-3xl font-bold text-center">Interactive Graphing Calculator</h1>
         <p className="text-muted-foreground text-center">
            Powered by Desmos API. Enter functions below and see them plotted.
         </p>


        {/* Graphing Calculator Section */}
        <Card className="shadow-lg rounded-lg mx-auto"> {/* Removed max-w-4xl */}
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-accent">
                <CalculatorIcon className="h-6 w-6" />
               Graphing Interface
            </CardTitle>
            <CardDescription className="dark:text-muted-foreground">
                Enter functions below and see them plotted in the interactive graph.
            </CardDescription>
          </CardHeader>

            <CardContent>
              <form onSubmit={handleAddExpression} className="flex flex-col sm:flex-row gap-2 mb-4">
                 <Input
                    type="text"
                    value={expression}
                    onChange={(e) => setExpression(e.target.value)}
                    placeholder="e.g., y = x^2 + 1, r = cos(3θ)"
                    className="flex-grow"
                    aria-label="Enter mathematical function"
                    disabled={!isDesmosInitialized} // Disable input if not initialized
                 />
                 <Button
                   type="submit"
                   className="bg-accent hover:bg-accent/90 text-accent-foreground"
                   disabled={!isDesmosInitialized} // Disable button if not initialized
                 >
                   Add Graph
                 </Button>
              </form>

              {expressions.length > 0 && (
                <div className="mb-4 space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Current Expressions:</h3>
                    <ul className="list-none p-0 m-0 space-y-1 max-h-40 overflow-y-auto border rounded-md p-2 bg-muted/20">
                        {expressions.map((expr) => (
                            <li key={expr.id} className="flex items-center justify-between bg-background dark:bg-muted/50 p-2 rounded-md text-sm shadow-sm">
                                <code className="font-mono">{expr.latex}</code>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveExpression(expr.id)}
                                    aria-label={`Remove expression ${expr.latex}`}
                                    className="text-destructive hover:bg-destructive/10 px-2 py-1 h-auto"
                                    disabled={!isDesmosInitialized} // Disable remove if not initialized
                                >
                                    Remove
                                </Button>
                            </li>
                        ))}
                    </ul>
                </div>
              )}

              {/* Desmos Container with Loading/Error States */}
              <div
                id="desmos-calculator-container" // Added ID for potential debugging
                ref={calculatorRef}
                style={{ width: '100%', height: '500px', position: 'relative' }} // Ensure relative positioning for overlay
                className="border rounded-md shadow-inner bg-background dark:bg-card overflow-hidden" // Added overflow-hidden
              >
                {/* Loading/Error Overlay */}
                {!isDesmosInitialized && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80 dark:bg-card/80 z-10 pointer-events-none"> {/* Added pointer-events-none */}
                    <div className="text-center p-4">
                      {!isDesmosLoaded ? (
                        <>
                          <Skeleton className="h-8 w-48 mx-auto mb-2" />
                          <p className="text-muted-foreground">Loading Calculator Script...</p>
                           {/* Optionally show an error message if script loading failed */}
                           {!isDesmosLoaded && typeof window !== 'undefined' && !window.Desmos && (
                              <p className="text-destructive text-sm mt-2">Script failed to load. Please refresh.</p>
                           )}
                        </>
                      ) : (
                        <>
                          <Skeleton className="h-8 w-48 mx-auto mb-2" />
                          <p className="text-muted-foreground">Initializing Graph... Please wait.</p>
                        </>
                      )}
                    </div>
                  </div>
                )}
                 {/* The actual Desmos graph will render here, potentially under the overlay if not initialized */}
              </div>

            </CardContent>
            <CardFooter className="text-xs text-muted-foreground pt-4">
                Graphing Examples: <code className="bg-muted dark:bg-muted/40 p-1 rounded-md">y = sin(x)</code>, <code className="bg-muted dark:bg-muted/40 p-1 rounded-md">f(x) = x^3 - x</code>, <code className="bg-muted dark:bg-muted/40 p-1 rounded-md">r = cos(3θ)</code>. Use the keypad or type directly.
            </CardFooter>
        </Card>


      </div>
    </>
  );
}

