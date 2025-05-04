/**
 * Calculates the molar mass of a chemical formula.
 * Handles simple formulas, parentheses, and element counts.
 * Returns null if the formula is invalid or contains unsupported elements.
 */

// Common atomic weights (can be expanded)
const atomicWeights: { [key: string]: number } = {
    'H': 1.008, 'He': 4.0026, 'Li': 6.94, 'Be': 9.0122, 'B': 10.81, 'C': 12.011,
    'N': 14.007, 'O': 15.999, 'F': 18.998, 'Ne': 20.180, 'Na': 22.990, 'Mg': 24.305,
    'Al': 26.982, 'Si': 28.085, 'P': 30.974, 'S': 32.06, 'Cl': 35.45, 'Ar': 39.948,
    'K': 39.098, 'Ca': 40.078, 'Sc': 44.956, 'Ti': 47.867, 'V': 50.942, 'Cr': 51.996,
    'Mn': 54.938, 'Fe': 55.845, 'Co': 58.933, 'Ni': 58.693, 'Cu': 63.546, 'Zn': 65.38,
    'Ga': 69.723, 'Ge': 72.63, 'As': 74.922, 'Se': 78.971, 'Br': 79.904, 'Kr': 83.798,
    'Rb': 85.468, 'Sr': 87.62, 'Y': 88.906, 'Zr': 91.224, 'Nb': 92.906, 'Mo': 95.96,
    'Tc': 98, 'Ru': 101.07, 'Rh': 102.91, 'Pd': 106.42, 'Ag': 107.87, 'Cd': 112.41,
    'In': 114.82, 'Sn': 118.71, 'Sb': 121.76, 'Te': 127.60, 'I': 126.90, 'Xe': 131.29,
    // Add more elements as needed
};

// Type for parsed formula components
type FormulaPart = { [element: string]: number };

// Parses a chemical formula string into an object representing element counts.
// This is a simplified parser and might not handle all complex cases perfectly.
function parseFormula(formula: string): FormulaPart | null {
    const elementCounts: FormulaPart = {};
    const formulaStack: FormulaPart[] = [{}]; // Stack to handle parentheses
    let currentElement = '';
    let currentCountStr = '';

    function applyCountToLastElementOrGroup(count: number) {
        if (currentElement) {
            const currentGroup = formulaStack[formulaStack.length - 1];
            currentGroup[currentElement] = (currentGroup[currentElement] || 0) + count;
            currentElement = '';
        } else {
            // Apply count to the entire last group from stack
            const lastGroup = formulaStack.pop();
            if (lastGroup) {
                const currentTopGroup = formulaStack[formulaStack.length - 1];
                for (const el in lastGroup) {
                    currentTopGroup[el] = (currentTopGroup[el] || 0) + lastGroup[el] * count;
                }
            } else {
                 throw new Error("Mismatched parentheses or invalid structure applying count.");
            }
        }
    }

    try {
        for (let i = 0; i < formula.length; i++) {
            const char = formula[i];

            if (char >= 'A' && char <= 'Z') {
                // Start of a new element
                if (currentCountStr) {
                    applyCountToLastElementOrGroup(parseInt(currentCountStr, 10) || 1);
                    currentCountStr = '';
                } else if (currentElement) {
                     applyCountToLastElementOrGroup(1); // Apply count of 1 to previous element
                }
                currentElement = char;
            } else if (char >= 'a' && char <= 'z') {
                // Continuation of an element symbol
                if (!currentElement) throw new Error(`Lowercase letter '${char}' without preceding uppercase letter.`);
                currentElement += char;
            } else if (char >= '0' && char <= '9') {
                // Digit for count
                 if (!currentElement && formulaStack.length <= 1 && formula[i-1] !== ')') {
                     // Number appearing without preceding element or closing parenthesis
                     throw new Error(`Number '${char}' appears unexpectedly.`);
                 }
                currentCountStr += char;
            } else if (char === '(') {
                 if (currentCountStr) {
                    applyCountToLastElementOrGroup(parseInt(currentCountStr, 10) || 1);
                    currentCountStr = '';
                 } else if (currentElement) {
                    applyCountToLastElementOrGroup(1);
                 }
                formulaStack.push({}); // Start a new group for parentheses
            } else if (char === ')') {
                if (currentCountStr) {
                    applyCountToLastElementOrGroup(parseInt(currentCountStr, 10) || 1);
                    currentCountStr = '';
                 } else if (currentElement) {
                     applyCountToLastElementOrGroup(1);
                 }

                if (formulaStack.length <= 1) {
                    throw new Error("Mismatched closing parenthesis.");
                }
                // Handled by applyCountToLastElementOrGroup when number follows ')'
            } else {
                 throw new Error(`Invalid character '${char}' in formula.`);
            }
        }

        // Handle any trailing element or count
        if (currentCountStr) {
            applyCountToLastElementOrGroup(parseInt(currentCountStr, 10) || 1);
        } else if (currentElement) {
             applyCountToLastElementOrGroup(1);
        }

         if (formulaStack.length !== 1) {
             throw new Error("Mismatched opening parenthesis.");
         }


        return formulaStack[0];

    } catch (error) {
        console.error("Formula parsing error:", error);
        return null; // Indicate parsing failure
    }
}

export function calculateMolarMass(formula: string): number | null {
    if (!formula || typeof formula !== 'string' || formula.trim() === '') {
        return null;
    }

    const parsed = parseFormula(formula.trim());
    if (!parsed) {
        return null; // Parsing failed
    }

    let totalMass = 0;
    for (const element in parsed) {
        if (atomicWeights[element]) {
            totalMass += atomicWeights[element] * parsed[element];
        } else {
            console.error(`Atomic weight for element '${element}' not found.`);
            return null; // Element not supported
        }
    }

    return totalMass > 0 ? totalMass : null; // Return null if mass is zero or negative (shouldn't happen with valid inputs)
}
