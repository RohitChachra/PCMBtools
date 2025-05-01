/**
 * Represents basic information about a chemical compound fetched from PubChem.
 */
export interface Compound {
  /**
   * The IUPAC name of the compound. May be N/A if not found.
   */
  iupacName: string;
  /**
   * The molecular formula of the compound. May be N/A if not found.
   */
  molecularFormula: string;
  /**
   * The molecular weight of the compound in g/mol. May be 0 if not found.
   */
  molecularWeight: number;
  /**
   * A brief description of the compound, often sourced from Wikipedia via PubChem.
   */
  description: string;
  /**
   * URL for a PNG image of the molecular structure from PubChem.
   */
  imageUrl: string;
}

/**
 * Asynchronously retrieves compound information from PubChem by compound name or formula.
 * This function is implemented client-side using the Fetch API.
 *
 * @param query The compound name or formula to search for.
 * @returns A promise that resolves to a Compound object or null if not found or an error occurs.
 */
export async function getCompound(query: string): Promise<Compound | null> {
   // Implementation is handled directly within the ChemistryPage component
   // using the Fetch API to call the PubChem PUG REST endpoints.
   // This function signature serves as a definition for the expected structure.
   console.warn("getCompound function in src/services/pubchem.ts is a placeholder. Actual implementation is in ChemistryPage.");
   return null; // Placeholder return
}
