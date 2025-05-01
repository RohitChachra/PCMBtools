
'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import type { Compound } from '@/services/pubchem'; // Use type import

// Mock getCompound function for frontend-only implementation
async function getCompound(query: string): Promise<Compound | null> {
  console.log(`Fetching compound data for: ${query}`);
  // Basic input validation
  if (!query || query.trim().length === 0) {
    console.error("Search query cannot be empty.");
    return null;
  }

  const encodedQuery = encodeURIComponent(query);
  const baseUrl = 'https://pubchem.ncbi.nlm.nih.gov/rest/pug';

  try {
    // 1. Get CID from name/formula
    const identifierUrl = `${baseUrl}/compound/name/${encodedQuery}/cids/JSON`;
    let identifierResponse = await fetch(identifierUrl); // Changed const to let

    if (!identifierResponse.ok) {
      // Try searching by formula if name search fails
       const formulaUrl = `${baseUrl}/compound/formula/${encodedQuery}/cids/JSON`;
       const formulaResponse = await fetch(formulaUrl);
       if (!formulaResponse.ok) {
         console.error(`Failed to find CID for query: ${query}. Status: ${identifierResponse.status} (name), ${formulaResponse.status} (formula)`);
         return null; // Not found or error
       }
       identifierResponse = formulaResponse; // Use formula response if successful
    }


    const identifierData = await identifierResponse.json();
    const cid = identifierData?.IdentifierList?.CID?.[0];

    if (!cid) {
      console.log(`No CID found for query: ${query}`);
      return null; // No compound found
    }

    // 2. Get Compound Properties using CID
    const propertiesUrl = `${baseUrl}/compound/cid/${cid}/property/IUPACName,MolecularFormula,MolecularWeight/JSON`;
    const propertiesResponse = await fetch(propertiesUrl);
    if (!propertiesResponse.ok) {
      console.error(`Failed to fetch properties for CID ${cid}. Status: ${propertiesResponse.status}`);
      return null;
    }
    const propertiesData = await propertiesResponse.json();
    const props = propertiesData?.PropertyTable?.Properties?.[0];

    // 3. Get Compound Description (using Wikipedia summary if available)
    // PubChem descriptions can be complex, Wikipedia often provides a simpler overview.
    let description = 'No description available.';
    try {
        const descriptionUrl = `${baseUrl}/compound/cid/${cid}/description/JSON`;
        const descriptionResponse = await fetch(descriptionUrl);
        if (descriptionResponse.ok) {
            const descriptionData = await descriptionResponse.json();
            // Prefer Wikipedia summary if available
            const wikiDesc = descriptionData?.InformationList?.Information?.find(
              (info: any) => info.DescriptionSourceName === "Wikipedia"
            )?.Description;
             if (wikiDesc) {
               description = wikiDesc;
             } else if (descriptionData?.InformationList?.Information?.[0]?.Description) {
               // Fallback to the first available description
               description = descriptionData.InformationList.Information[0].Description;
             }
        }
    } catch (descError) {
        console.warn(`Could not fetch description for CID ${cid}:`, descError);
    }


    // 4. Get Compound Image URL
    const imageUrl = `${baseUrl}/compound/cid/${cid}/PNG`; // Direct link to PNG

    if (!props) {
        console.error(`Properties object is missing for CID ${cid}`);
        return null;
    }


    return {
      iupacName: props.IUPACName || 'N/A',
      molecularFormula: props.MolecularFormula || 'N/A',
      molecularWeight: props.MolecularWeight ? parseFloat(props.MolecularWeight) : 0,
      description: description,
      imageUrl: imageUrl, // Use the direct image URL
    };

  } catch (error) {
    console.error('Error fetching compound data from PubChem:', error);
    return null;
  }
}


export default function ChemistryPage() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [compoundData, setCompoundData] = useState<Compound | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      toast({ title: "Input Error", description: "Please enter a compound name or formula.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setCompoundData(null); // Clear previous results

    try {
      const data = await getCompound(searchTerm);
      if (data) {
        setCompoundData(data);
        toast({ title: "Success", description: `Found data for ${data.iupacName || searchTerm}.` });
      } else {
        toast({ title: "Not Found", description: `Could not find compound data for "${searchTerm}".`, variant: "destructive" });
      }
    } catch (error) {
      console.error('Search failed:', error);
      toast({ title: "Error", description: "An error occurred while fetching data. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Chemistry Compound Explorer</h1>
      <p className="text-muted-foreground">
        Search for chemical compounds by name (e.g., "Aspirin", "Water") or formula (e.g., "C9H8O4", "H2O") using the PubChem PUG REST API.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Compound Search</CardTitle>
          <CardDescription>Enter a compound name or formula.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="e.g., Caffeine or C8H10N4O2"
              className="flex-grow"
              aria-label="Search for chemical compound"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {isLoading ? 'Searching...' : 'Search'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {isLoading && (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
             <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
             <Skeleton className="h-48 w-full" />
             <Skeleton className="h-4 w-full" />
             <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
          </CardContent>
        </Card>
      )}

      {!isLoading && compoundData && (
        <Card className="overflow-hidden shadow-lg">
          <CardHeader>
            <CardTitle>{compoundData.iupacName}</CardTitle>
            <CardDescription>Data sourced from PubChem</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative w-full h-64 md:h-auto bg-muted rounded-md flex items-center justify-center overflow-hidden border">
              {compoundData.imageUrl ? (
                <Image
                  // Use a placeholder while loading or if image fails, but use the actual URL
                  src={compoundData.imageUrl}
                  alt={`Molecular structure of ${compoundData.iupacName}`}
                  width={300} // Specify width
                  height={300} // Specify height
                  style={{ objectFit: 'contain' }} // Use contain to ensure the whole image fits
                  data-ai-hint="chemical molecule structure" // Keep AI hint
                   onError={(e) => {
                       // Handle image loading errors, e.g., show a placeholder or message
                       e.currentTarget.src = 'https://via.placeholder.com/300?text=Image+Not+Found'; // Example placeholder
                       e.currentTarget.alt = `Image not found for ${compoundData.iupacName}`;
                    }}
                />
              ) : (
                 <div className="text-muted-foreground">No image available</div>
              )}
            </div>
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Molecular Formula</h3>
                <p className="font-mono text-lg">{compoundData.molecularFormula}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Molecular Weight</h3>
                <p className="text-lg">{compoundData.molecularWeight?.toFixed(2)} g/mol</p>
              </div>
               <div>
                <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                <p className="text-sm leading-relaxed">{compoundData.description}</p>
              </div>
            </div>
          </CardContent>
           <CardFooter>
             <a
                href={`https://pubchem.ncbi.nlm.nih.gov/compound/${encodeURIComponent(searchTerm)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                View full details on PubChem
              </a>
          </CardFooter>
        </Card>
      )}

       {!isLoading && !compoundData && !searchTerm && (
           <div className="text-center text-muted-foreground mt-8">
             Enter a compound name or formula to start exploring.
           </div>
       )}
    </div>
  );
}
