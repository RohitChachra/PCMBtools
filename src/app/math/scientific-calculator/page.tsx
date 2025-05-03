
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input'; // Using Input as display for consistency, but read-only
import { Calculator as CalculatorIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Type for calculator operations
type Operator = '+' | '-' | '*' | '/';
type UnaryOperator = 'sqrt' | 'sqr' | 'inv' | 'sin' | 'cos' | 'tan' | 'log' | 'ln' | 'fact' | 'neg' | '%';

const ScientificCalculatorPage: React.FC = () => {
    const [display, setDisplay] = useState<string>('0');
    const [operand, setOperand] = useState<number | null>(null);
    const [operator, setOperator] = useState<Operator | null>(null);
    const [waitingForOperand, setWaitingForOperand] = useState<boolean>(true);
    const [isRadians, setIsRadians] = useState<boolean>(true); // Default to Radians
    const { toast } = useToast();

    const formatNumber = (num: number): string => {
        // Handle very large or small numbers with exponential notation
        if (Math.abs(num) > 1e15 || (Math.abs(num) < 1e-6 && num !== 0)) {
            return num.toExponential(6);
        }
        // Limit decimal places for display, avoiding trailing zeros
        return String(parseFloat(num.toFixed(10)));
    };

    const inputDigit = (digit: string) => {
        if (display.length >= 16 && !waitingForOperand) return; // Limit display length

        if (waitingForOperand) {
            setDisplay(digit);
            setWaitingForOperand(false);
        } else {
            setDisplay(display === '0' ? digit : display + digit);
        }
    };

    const inputDecimal = () => {
        if (waitingForOperand) {
            setDisplay('0.');
            setWaitingForOperand(false);
        } else if (!display.includes('.')) {
            setDisplay(display + '.');
        }
    };

    const performOperation = (nextOperator: Operator) => {
        const inputValue = parseFloat(display);

        if (operand === null) {
            setOperand(inputValue);
        } else if (operator) {
            try {
                const result = calculate(operand, inputValue, operator);
                if (result === null || !isFinite(result)) {
                   toast({ title: "Error", description: "Calculation resulted in an invalid value (e.g., division by zero).", variant: "destructive" });
                   clearAll();
                   return;
                }
                setDisplay(formatNumber(result));
                setOperand(result);
            } catch (error: any) {
                 toast({ title: "Error", description: error.message || "Calculation error", variant: "destructive" });
                 clearAll();
                 return;
            }
        }

        setWaitingForOperand(true);
        setOperator(nextOperator);
    };

    const performUnaryOperation = (unaryOp: UnaryOperator) => {
        let inputValue = parseFloat(display);
        let result: number | null = null;

        try {
             switch (unaryOp) {
                case 'sqrt':
                    if (inputValue < 0) throw new Error("Cannot calculate square root of a negative number.");
                    result = Math.sqrt(inputValue);
                    break;
                case 'sqr':
                    result = inputValue * inputValue;
                    break;
                case 'inv': // 1/x
                    if (inputValue === 0) throw new Error("Cannot divide by zero.");
                    result = 1 / inputValue;
                    break;
                case 'sin':
                    result = isRadians ? Math.sin(inputValue) : Math.sin(inputValue * (Math.PI / 180));
                    break;
                case 'cos':
                    result = isRadians ? Math.cos(inputValue) : Math.cos(inputValue * (Math.PI / 180));
                    break;
                case 'tan':
                     const angleRad = isRadians ? inputValue : inputValue * (Math.PI / 180);
                    // Avoid tangent of 90 degrees (or pi/2 radians) multiples - results in Infinity
                     if (Math.abs(Math.cos(angleRad)) < 1e-15) throw new Error("Tangent is undefined for this angle.");
                    result = Math.tan(angleRad);
                    break;
                case 'log': // Base 10 log
                    if (inputValue <= 0) throw new Error("Logarithm requires a positive input.");
                    result = Math.log10(inputValue);
                    break;
                case 'ln': // Natural log
                    if (inputValue <= 0) throw new Error("Natural logarithm requires a positive input.");
                    result = Math.log(inputValue);
                    break;
                case 'fact': // Factorial
                    if (inputValue < 0 || !Number.isInteger(inputValue)) throw new Error("Factorial requires a non-negative integer.");
                    if (inputValue > 170) throw new Error("Factorial result too large."); // Approx limit for JS numbers
                    result = factorial(inputValue);
                    break;
                 case 'neg': // Negate (+/-)
                    result = -inputValue;
                    break;
                case '%': // Percentage
                    if (operand !== null && operator !== null) {
                         // Calculate percentage based on the current operand
                         result = operand * (inputValue / 100);
                    } else {
                         // If no operation pending, calculate percentage of the displayed value itself (e.g., 50% = 0.5)
                         result = inputValue / 100;
                    }
                    break;
                default:
                    break; // Should not happen
            }

            if (result === null || !isFinite(result)) {
                 toast({ title: "Error", description: "Calculation resulted in an invalid value.", variant: "destructive" });
                 clearAll();
                 return;
            }
            setDisplay(formatNumber(result));
            // Update operand if calculation was based on it, otherwise keep waiting
            if (unaryOp !== 'neg' && unaryOp !== '%' ) { // Don't finalize for +/- or simple %
                 setOperand(result);
                 setWaitingForOperand(true); // Prepare for next number or operation
            } else {
                // For +/- and simple %, just update display, allow further input
                setWaitingForOperand(false);
            }

        } catch (error: any) {
            toast({ title: "Error", description: error.message || "Invalid operation", variant: "destructive" });
            clearAll();
        }
    };


    const calculate = (left: number, right: number, op: Operator): number | null => {
        switch (op) {
            case '+': return left + right;
            case '-': return left - right;
            case '*': return left * right;
            case '/':
                if (right === 0) return null; // Division by zero
                return left / right;
            default: return null; // Should not happen
        }
    };

    // Factorial function
    const factorial = (n: number): number => {
        if (n === 0 || n === 1) return 1;
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    };

    const handleEquals = () => {
        const inputValue = parseFloat(display);

        if (operand !== null && operator !== null) {
             try {
                const result = calculate(operand, inputValue, operator);
                 if (result === null || !isFinite(result)) {
                    toast({ title: "Error", description: "Calculation resulted in an invalid value (e.g., division by zero).", variant: "destructive" });
                    clearAll();
                    return;
                 }
                setDisplay(formatNumber(result));
                setOperand(null); // Reset for next independent calculation
                setOperator(null);
                setWaitingForOperand(true);
             } catch (error: any) {
                 toast({ title: "Error", description: error.message || "Calculation error", variant: "destructive" });
                 clearAll();
             }
        }
         // If equals is pressed without a pending operation, do nothing or finalize current number
         // Current behavior: finalize the current number state
         setWaitingForOperand(true);
    };

    const clearAll = () => {
        setDisplay('0');
        setOperand(null);
        setOperator(null);
        setWaitingForOperand(true);
    };

    const clearEntry = () => {
        setDisplay('0');
        setWaitingForOperand(true); // Ready to input new number, but keep pending operation
    };

     const toggleRadDeg = () => {
        setIsRadians(!isRadians);
         toast({ title: "Mode Changed", description: `Calculator set to ${!isRadians ? 'Radians' : 'Degrees'}` });
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        const { key } = event;
        if (/\d/.test(key)) {
            inputDigit(key);
        } else if (key === '.') {
            inputDecimal();
        } else if (key === '+' || key === '-' || key === '*' || key === '/') {
            performOperation(key as Operator);
        } else if (key === 'Enter' || key === '=') {
            event.preventDefault(); // Prevent form submission if inside one
            handleEquals();
        } else if (key === 'Backspace') {
            // Basic backspace: clear last digit or reset to 0
             if (display.length > 1) {
                 setDisplay(display.slice(0, -1));
             } else {
                 setDisplay('0');
                 setWaitingForOperand(true);
             }
        } else if (key === 'Escape') {
            clearAll();
        }
        // Add more key bindings if needed (e.g., 's' for sin, 'c' for cos, etc.)
    };


    // Button Layout Configuration
    const buttonRows = [
        // Row 1: Scientific functions
        [
            { label: isRadians ? 'Deg' : 'Rad', action: toggleRadDeg, className: 'bg-muted hover:bg-muted/80', width: 'w-16' },
            { label: 'sin', action: () => performUnaryOperation('sin'), className: 'bg-muted hover:bg-muted/80', width: 'w-16'},
            { label: 'cos', action: () => performUnaryOperation('cos'), className: 'bg-muted hover:bg-muted/80', width: 'w-16'},
            { label: 'tan', action: () => performUnaryOperation('tan'), className: 'bg-muted hover:bg-muted/80', width: 'w-16'},
            { label: 'log', action: () => performUnaryOperation('log'), className: 'bg-muted hover:bg-muted/80', width: 'w-16'}, // base 10
            { label: 'ln', action: () => performUnaryOperation('ln'), className: 'bg-muted hover:bg-muted/80', width: 'w-16'}, // natural log
        ],
        // Row 2: More scientific functions
        [
            { label: '√', action: () => performUnaryOperation('sqrt'), className: 'bg-muted hover:bg-muted/80', width: 'w-16'},
            { label: 'x²', action: () => performUnaryOperation('sqr'), className: 'bg-muted hover:bg-muted/80', width: 'w-16'},
            { label: '1/x', action: () => performUnaryOperation('inv'), className: 'bg-muted hover:bg-muted/80', width: 'w-16'},
            { label: 'n!', action: () => performUnaryOperation('fact'), className: 'bg-muted hover:bg-muted/80', width: 'w-16'},
            { label: 'π', action: () => { setDisplay(String(Math.PI)); setWaitingForOperand(false); }, className: 'bg-muted hover:bg-muted/80', width: 'w-16'},
             { label: 'e', action: () => { setDisplay(String(Math.E)); setWaitingForOperand(false); }, className: 'bg-muted hover:bg-muted/80', width: 'w-16'},
        ],
         // Row 3: Standard operations and clear
        [
            { label: 'AC', action: clearAll, className: 'bg-destructive/80 hover:bg-destructive text-destructive-foreground', width: 'w-16'},
            { label: 'CE', action: clearEntry, className: 'bg-destructive/60 hover:bg-destructive/80 text-destructive-foreground', width: 'w-16'},
            { label: '%', action: () => performUnaryOperation('%'), className: 'bg-secondary hover:bg-secondary/80', width: 'w-16'},
             { label: '+/-', action: () => performUnaryOperation('neg'), className: 'bg-secondary hover:bg-secondary/80', width: 'w-16'},
            { label: '÷', action: () => performOperation('/'), className: 'bg-secondary hover:bg-secondary/80', width: 'w-16'},
             { label: '×', action: () => performOperation('*'), className: 'bg-secondary hover:bg-secondary/80', width: 'w-16'},
        ],
        // Row 4: Digits 7-9 and Minus
        [
            { label: '7', action: () => inputDigit('7'), width: 'w-16' },
            { label: '8', action: () => inputDigit('8'), width: 'w-16' },
            { label: '9', action: () => inputDigit('9'), width: 'w-16' },
            { label: '(', action: () => {}, className: 'bg-muted hover:bg-muted/80', width: 'w-16', disabled: true }, // Placeholder
            { label: ')', action: () => {}, className: 'bg-muted hover:bg-muted/80', width: 'w-16', disabled: true }, // Placeholder
            { label: '-', action: () => performOperation('-'), className: 'bg-secondary hover:bg-secondary/80', width: 'w-16'},
        ],
        // Row 5: Digits 4-6 and Plus
        [
            { label: '4', action: () => inputDigit('4'), width: 'w-16' },
            { label: '5', action: () => inputDigit('5'), width: 'w-16' },
            { label: '6', action: () => inputDigit('6'), width: 'w-16' },
            { label: 'mc', action: () => {}, className: 'bg-muted hover:bg-muted/80', width: 'w-16', disabled: true }, // Placeholder Memory Clear
            { label: 'mr', action: () => {}, className: 'bg-muted hover:bg-muted/80', width: 'w-16', disabled: true }, // Placeholder Memory Recall
            { label: '+', action: () => performOperation('+'), className: 'bg-secondary hover:bg-secondary/80', width: 'w-16'},
        ],
         // Row 6 & 7 combined: Digits 1-3, 0, ., =
        [
            { label: '1', action: () => inputDigit('1'), width: 'w-16' },
            { label: '2', action: () => inputDigit('2'), width: 'w-16' },
            { label: '3', action: () => inputDigit('3'), width: 'w-16' },
            { label: 'm+', action: () => {}, className: 'bg-muted hover:bg-muted/80', width: 'w-16', disabled: true }, // Placeholder Memory Plus
            { label: 'm-', action: () => {}, className: 'bg-muted hover:bg-muted/80', width: 'w-16', disabled: true }, // Placeholder Memory Minus
            { label: '=', action: handleEquals, className: 'bg-primary hover:bg-primary/90 text-primary-foreground row-span-2 h-full', width: 'w-16' }, // Spans 2 rows vertically
        ],
         [
            { label: '0', action: () => inputDigit('0'), className: 'col-span-2 w-full', width: 'w-auto' }, // Span 2 columns
            { label: '.', action: inputDecimal, width: 'w-16' },
            { label: 'EXP', action: () => {}, className: 'bg-muted hover:bg-muted/80', width: 'w-16', disabled: true }, // Placeholder Exponent
            { label: 'Ans', action: () => {}, className: 'bg-muted hover:bg-muted/80', width: 'w-16', disabled: true }, // Placeholder Answer
            // Equals button is in the row above, spanning this row's space
        ],

    ];


    return (
        <div className="flex justify-center items-start py-12 px-4 min-h-screen">
            <Card className="w-full max-w-lg shadow-2xl rounded-xl overflow-hidden">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl flex items-center justify-center gap-2">
                         <CalculatorIcon className="h-6 w-6 text-primary" />
                        Scientific Calculator
                    </CardTitle>
                    <CardDescription>Perform standard and scientific calculations.</CardDescription>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                     {/* Display */}
                     <Input
                         type="text"
                         value={display}
                         readOnly
                         className="text-right text-3xl h-16 mb-4 bg-muted border-border text-foreground font-mono px-4"
                         aria-live="polite"
                         onKeyDown={handleKeyDown} // Add keyboard listener
                         tabIndex={0} // Make it focusable
                     />

                     {/* Buttons Grid */}
                    <div className="grid grid-cols-6 gap-2">
                       {buttonRows.flat().map((btn, index) => (
                            <Button
                                key={`${btn.label}-${index}`}
                                onClick={btn.action}
                                variant={btn.className?.includes('bg-primary') || btn.className?.includes('bg-destructive') ? 'default' : 'outline'} // Adjust variant based on class
                                className={`text-lg h-14 ${btn.width || 'w-full'} ${btn.className || ''} ${btn.disabled ? 'opacity-50 cursor-not-allowed' : ''} ${btn.label === '=' ? 'row-span-2 h-full' : ''} ${btn.label === '0' ? 'col-span-2 w-full' : ''}`}
                                disabled={btn.disabled}
                                // Special handling for multi-slot buttons in CSS grid needed if 'w-auto' or spans are complex
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

