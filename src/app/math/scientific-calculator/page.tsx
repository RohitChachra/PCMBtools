
'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Calculator as CalculatorIcon, Delete } from 'lucide-react'; // Using Delete for Backspace
import { useToast } from '@/hooks/use-toast';
import { create, all, MathJsStatic, ConfigOptions } from 'mathjs'; // Import create, all, MathJsStatic type and ConfigOptions
import { cn } from '@/lib/utils'; // Import the cn utility function

// --- Component ---
const ScientificCalculatorPage: React.FC = () => {
    // Create a persistent mathjs instance using useRef
    const mathInstanceRef = useRef<MathJsStatic | null>(null);
    const [expression, setExpression] = useState<string>('');
    const [result, setResult] = useState<string>('');
    const [isRadians, setIsRadians] = useState<boolean>(true); // Default to Radians
    const { toast } = useToast();

    // Initialize the mathjs instance on mount
    useEffect(() => {
        if (!mathInstanceRef.current) {
            mathInstanceRef.current = create(all);
            console.log("Math.js instance created.");
             // Set initial angle mode on the instance
            mathInstanceRef.current.config({ angle: isRadians ? 'rad' : 'deg' } as ConfigOptions); // Explicit cast needed
        }
    }, [isRadians]); // Re-run if isRadians changes to ensure config is updated (though toggle handles it too)

    const formatResult = useCallback((value: any): string => {
         // Ensure mathInstanceRef.current exists before using it
         const math = mathInstanceRef.current;
         if (!math) return 'Error: Math engine not ready';
        try {
            // Use math.format for better formatting, handle potential Unit objects
            if (math.isUnit && math.isUnit(value)) { // Check if isUnit exists before calling
                return value.toString(); // Keep unit formatting
            }
            // Existing number formatting
            return math.format(value, { notation: 'fixed', precision: 10 }).replace(/(\.[0-9]*[1-9])0+$|\.0*$/, '$1'); // Remove trailing zeros
        } catch {
            return String(value); // Fallback
        }
    }, []); // No dependency on mathInstanceRef needed as ref changes don't trigger re-renders

    const handleButtonClick = (value: string) => {
        setResult(''); // Clear previous result on new input
        setExpression((prev) => prev + value);
    };

    const handleFunctionClick = (func: string) => {
        setResult('');
        // Appends function with opening parenthesis, ready for argument input
        setExpression((prev) => prev + `${func}(`);
    };

    const handleConstantClick = (constant: string) => {
         setResult('');
         // Append constant name (mathjs recognizes pi and e)
         setExpression((prev) => prev + constant);
    };

    const handleEquals = useCallback(() => {
        // Ensure mathInstanceRef.current exists before using it
        const math = mathInstanceRef.current;
        if (!math) {
            setResult('Error: Math engine not ready');
            toast({ title: "Error", description: "Calculator engine is initializing, please wait.", variant: "destructive" });
            return;
        }

        if (!expression.trim()) {
            setResult('');
            return;
        }

        // Set the angle mode on the *local* instance for this evaluation
        // (Though toggleRadDeg should keep it in sync)
        math.config({ angle: isRadians ? 'rad' : 'deg' } as ConfigOptions);
        console.log('Angle mode for eval:', math.config().angle);

        let evalResult: any;
        let formatted = '';

        try {
            // Evaluate the expression using the local instance
            evalResult = math.evaluate(expression);
            console.log('Raw result:', evalResult); // Log raw result

            // Handle potential complex results or units if needed in future
            if (typeof evalResult === 'function') {
                throw new Error("Invalid expression resulting in a function.");
            }
            // Check for undefined, null, or plain objects which are usually evaluation errors
            if (evalResult === undefined || evalResult === null || (typeof evalResult === 'object' && !math.isUnit?.(evalResult) && !Array.isArray(evalResult) && typeof evalResult.toString !== 'function')) {
                 throw new Error("Invalid expression or undefined result.");
            }

             // Format based on type
            if (math.isUnit?.(evalResult)) {
                formatted = evalResult.toString();
            } else {
                formatted = formatResult(evalResult);
            }

            setResult(formatted);
            // Optional: setExpression(formatted); // Replace expression with result after calculation

        } catch (error: any) {
            console.error("Calculation Error:", error);
            const errorMessage = error.message || "Invalid Expression";
            setResult(`Error: ${errorMessage}`);
             toast({
                title: "Calculation Error",
                description: errorMessage,
                variant: "destructive",
             });
        }
        // No finally block needed to restore config for local instance,
        // as toggleRadDeg manages the instance's config state.

    }, [expression, isRadians, toast, formatResult]); // Dependencies are correct

    const clearAll = () => {
        setExpression('');
        setResult('');
    };

    const backspace = () => {
        setResult(''); // Clear result when modifying expression
        setExpression((prev) => prev.slice(0, -1));
    };

     const toggleRadDeg = () => {
        const newIsRadians = !isRadians;
        setIsRadians(newIsRadians); // Use functional update

         // Ensure mathInstanceRef.current exists before configuring it
        const math = mathInstanceRef.current;
        if (math) {
            // Update the config on the local instance
            math.config({ angle: newIsRadians ? 'rad' : 'deg' } as ConfigOptions);
            console.log('Angle mode toggled to:', math.config().angle);
            toast({ title: "Mode Changed", description: `Calculator set to ${newIsRadians ? 'Radians' : 'Degrees'}` });
        } else {
             toast({ title: "Error", description: "Calculator engine not ready to change mode.", variant: "destructive" });
        }
    };


    // Handle keyboard input for better UX
    const handleKeyDown = (event: React.KeyboardEvent) => {
        // Allow default behavior for some keys like arrows, Tab, etc.
        if (!['0','1','2','3','4','5','6','7','8','9','.','+','-','*','/','^','(',')','Enter','=','Backspace','Escape','p','e','s','c','t','l','n','!','%','r','q'].includes(event.key.toLowerCase()) && !event.ctrlKey) {
             return; // Let the browser handle other keys
        }

        event.preventDefault(); // Prevent default for keys we handle
        const { key } = event;

        if (/\d/.test(key)) {
            handleButtonClick(key);
        } else if (key === '.') {
            handleButtonClick('.');
        } else if (key === '+' || key === '-' || key === '*' || key === '/' || key === '^') {
            handleButtonClick(key);
        } else if (key === '(' || key === ')') {
            handleButtonClick(key); // Corrected to handle both parentheses
        } else if (key === 'Enter' || key === '=') {
            handleEquals();
        } else if (key === 'Backspace') {
            backspace();
        } else if (key === 'Escape') {
            clearAll();
        } else if (key.toLowerCase() === 'p' && event.ctrlKey) { // Ctrl+P for Pi
             handleConstantClick('pi');
        } else if (key.toLowerCase() === 'e' && event.ctrlKey) { // Ctrl+E for Euler's number
            handleConstantClick('e');
        }
        // Add more complex bindings if desired (e.g., 's' for sin, 'sqrt' etc.)
         else if (key.toLowerCase() === 's') handleFunctionClick('sin');
         else if (key.toLowerCase() === 'c') handleFunctionClick('cos');
         else if (key.toLowerCase() === 't') handleFunctionClick('tan');
         else if (key.toLowerCase() === 'l') handleFunctionClick('log10'); // 'l' for log base 10
         else if (key.toLowerCase() === 'n') handleFunctionClick('log'); // 'n' for natural log (ln)
         else if (key === '!') handleButtonClick('!');
         else if (key === '%') handleButtonClick('%'); // Math.js supports % operator or mod function
         else if (key.toLowerCase() === 'r') toggleRadDeg(); // 'r' to toggle Rad/Deg
         else if (key.toLowerCase() === 'q') handleFunctionClick('sqrt'); // 'q' for sqrt
         // Need a key for x^2, maybe Shift+6 for ^ then 2?
    };

    // Button Layout Configuration - Adjusted for mathjs syntax
    // Removed memory and ANS/EXP buttons for simplicity
    const buttonRows = [
        // Row 1: Scientific functions
        [
            { label: isRadians ? 'Deg' : 'Rad', action: toggleRadDeg, className: 'bg-muted hover:bg-muted/80 text-xs', width: 'w-auto' },
            { label: 'sin', action: () => handleFunctionClick('sin'), className: 'bg-muted hover:bg-muted/80', width: 'w-auto'},
            { label: 'cos', action: () => handleFunctionClick('cos'), className: 'bg-muted hover:bg-muted/80', width: 'w-auto'},
            { label: 'tan', action: () => handleFunctionClick('tan'), className: 'bg-muted hover:bg-muted/80', width: 'w-auto'},
            { label: 'log', action: () => handleFunctionClick('log10'), className: 'bg-muted hover:bg-muted/80', width: 'w-auto'}, // base 10
            { label: 'ln', action: () => handleFunctionClick('log'), className: 'bg-muted hover:bg-muted/80', width: 'w-auto'}, // natural log (mathjs uses log)
        ],
        // Row 2: More scientific functions
        [
            { label: '√', action: () => handleFunctionClick('sqrt'), className: 'bg-muted hover:bg-muted/80', width: 'w-auto'},
            // Use ^ for power, user types the exponent
            { label: 'x^y', action: () => handleButtonClick('^'), className: 'bg-muted hover:bg-muted/80', width: 'w-auto'},
            { label: '(', action: () => handleButtonClick('('), className: 'bg-muted hover:bg-muted/80', width: 'w-auto'},
            { label: ')', action: () => handleButtonClick(')'), className: 'bg-muted hover:bg-muted/80', width: 'w-auto'},
            { label: 'π', action: () => handleConstantClick('pi'), className: 'bg-muted hover:bg-muted/80', width: 'w-auto'},
             { label: 'e', action: () => handleConstantClick('e'), className: 'bg-muted hover:bg-muted/80', width: 'w-auto'},
        ],
         // Row 3: Standard operations and clear
        [
            { label: 'AC', action: clearAll, className: 'bg-destructive/80 hover:bg-destructive text-destructive-foreground', width: 'w-auto'},
            { label: <Delete className="h-5 w-5" />, action: backspace, className: 'bg-secondary hover:bg-secondary/80', width: 'w-auto', title:"Backspace" }, // Backspace Icon
            { label: '%', action: () => handleButtonClick('%'), className: 'bg-secondary hover:bg-secondary/80', width: 'w-auto'}, // mathjs uses % operator
            { label: 'n!', action: () => handleButtonClick('!'), className: 'bg-secondary hover:bg-secondary/80', width: 'w-auto'}, // Factorial
            { label: '÷', action: () => handleButtonClick('/'), className: 'bg-secondary hover:bg-secondary/80', width: 'w-auto'},
             { label: '×', action: () => handleButtonClick('*'), className: 'bg-secondary hover:bg-secondary/80', width: 'w-auto'},
        ],
        // Row 4: Digits 7-9 and Minus
        [
            { label: '7', action: () => handleButtonClick('7'), width: 'w-auto' },
            { label: '8', action: () => handleButtonClick('8'), width: 'w-auto' },
            { label: '9', action: () => handleButtonClick('9'), width: 'w-auto' },
            { label: '-', action: () => handleButtonClick('-'), className: 'bg-secondary hover:bg-secondary/80 col-span-3', width: 'w-full'}, // Span 3 cols
        ],
        // Row 5: Digits 4-6 and Plus
        [
            { label: '4', action: () => handleButtonClick('4'), width: 'w-auto' },
            { label: '5', action: () => handleButtonClick('5'), width: 'w-auto' },
            { label: '6', action: () => handleButtonClick('6'), width: 'w-auto' },
            { label: '+', action: () => handleButtonClick('+'), className: 'bg-secondary hover:bg-secondary/80 col-span-3', width: 'w-full'}, // Span 3 cols
        ],
         // Row 6 & 7 combined: Digits 1-3, 0, ., =
        [
            { label: '1', action: () => handleButtonClick('1'), width: 'w-auto' },
            { label: '2', action: () => handleButtonClick('2'), width: 'w-auto' },
            { label: '3', action: () => handleButtonClick('3'), width: 'w-auto' },
             { label: '=', action: handleEquals, className: 'bg-primary hover:bg-primary/90 text-primary-foreground row-span-2 h-full col-span-3', width: 'w-full' }, // Spans 2 rows, 3 cols
        ],
         [ // Row 7 continued
            { label: '0', action: () => handleButtonClick('0'), className: 'col-span-2 w-full', width: 'w-auto' }, // Span 2 columns
            { label: '.', action: () => handleButtonClick('.'), width: 'w-auto' },
            // Equals button is in the row above, spanning this row's space
        ],
    ];


    return (
        <div className="flex justify-center items-start py-12 px-4 min-h-screen">
            <Card className="w-full max-w-md shadow-2xl rounded-xl overflow-hidden"> {/* Adjusted max-width */}
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl flex items-center justify-center gap-2">
                         <CalculatorIcon className="h-6 w-6 text-primary" />
                        Scientific Calculator
                    </CardTitle>
                    <CardDescription>Enter an expression and press '='.</CardDescription>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                     {/* Display Area */}
                     <div className="bg-muted rounded-md p-4 border border-input min-h-[8rem] text-right space-y-1 flex flex-col justify-end">
                         <Input
                             type="text"
                             value={expression}
                             readOnly // Display only, input via buttons/keyboard
                             placeholder="Enter expression"
                             className="text-xl md:text-2xl h-auto bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground font-mono w-full text-right p-0 mb-1" // Adjusted size
                             aria-label="Calculator expression display"
                             onKeyDown={handleKeyDown} // Attach keydown listener
                             tabIndex={0} // Make focusable
                         />
                         {/* Result Display */}
                          <Input
                             type="text"
                             value={result}
                             readOnly
                             placeholder="Result"
                             // Increased font size to text-3xl, and text-4xl on medium screens and up
                             className={cn(
                                 'text-3xl md:text-4xl h-auto bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 w-full text-right p-0 font-semibold',
                                 result.startsWith('Error') ? 'text-destructive' : 'text-primary'
                              )}
                             aria-label="Calculator result display"
                          />
                    </div>


                     {/* Buttons Grid - Adjusted columns */}
                    <div className="grid grid-cols-6 gap-2">
                        {buttonRows.flat().map((btn, index) => (
                            <Button
                                key={`${btn.label}-${index}`}
                                onClick={btn.action}
                                variant={btn.className?.includes('bg-primary') || btn.className?.includes('bg-destructive') ? 'default' : 'outline'} // Adjust variant based on class
                                className={cn(
                                    `text-base sm:text-lg h-14 flex items-center justify-center p-0`, // Base styles
                                    btn.width || 'w-full', // Width
                                    btn.className || '', // Custom classes
                                    (btn as any).disabled ? 'opacity-50 cursor-not-allowed' : '', // Use 'as any' to bypass potential type issues if disabled prop isn't strictly defined on type
                                     // Handle spans explicitly with grid column classes if needed
                                     btn.label === '=' ? 'row-span-2 h-full col-span-3' : '',
                                     btn.label === '0' ? 'col-span-2 w-full' : '',
                                     (btn.label === '+' || btn.label === '-') ? 'col-span-3 w-full' : '',
                                     (typeof btn.label !== 'string' && (btn as any).title === 'Backspace') ? 'col-span-1' : '', // Ensure backspace takes one col if others span
                                     // Default to col-span-1 if not specified otherwise
                                      !btn.className?.includes('col-span-') && !btn.className?.includes('row-span-') ? 'col-span-1' : ''
                                )}
                                disabled={(btn as any).disabled} // Use 'as any' here too
                                title={typeof btn.label === 'string' ? btn.label : (btn as any).title} // Use title for icon buttons
                            >
                                {btn.label}
                            </Button>
                        ))}
                    </div>
                 </CardContent>
            </Card>
        </div>
    );
};

export default ScientificCalculatorPage;

