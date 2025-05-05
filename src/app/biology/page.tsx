
'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BookOpenText, Microscope } from 'lucide-react';
import { BIOLOGY_TERMS } from '@/lib/biology-terms'; // Import the terms list

interface WikipediaSummary {
  title: string;
  extract: string;
  thumbnail?: {
    source: string;
    width: number;
    height: number;
  };
  originalimage?: {
      source: string;
      width: number;
      height: number;
  };
  content_urls?: {
      desktop?: {
          page: string;
      }
  };
}

// Function to check if a term is in the biology list (case-insensitive)
const isValidBiologyTerm = (term: string): boolean => {
  const lowerCaseTerm = term.toLowerCase().trim();
  return BIOLOGY_TERMS.some(bioTerm => bioTerm.toLowerCase() === lowerCaseTerm);
};

async function getWikipediaSummary(term: string): Promise<WikipediaSummary | null> {
  if (!term || term.trim().length === 0) {
    console.error("Search term cannot be empty.");
    return null;
  }

  // Validate against the known biology terms list
  if (!isValidBiologyTerm(term)) {
      console.log(`Term "${term}" is not in the recognized biology terms list.`);
      return null; // Indicate term not recognized, handle this in the component
  }


  const encodedTerm = encodeURIComponent(term.trim());
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodedTerm}`;

  try {
    const response = await fetch(url, {
        headers: {
            // Setting a user agent is good practice for APIs
            'User-Agent': 'PCMBtools/1.0 (https://your-app-url.com; your-email@example.com)'
        }
    });

    if (!response.ok) {
        if (response.status === 404) {
            console.log(`No Wikipedia page found for term: ${term}`);
            return null; // Specific handling for 404
        }
      throw new Error(`Wikipedia API request failed with status ${response.status}`);
    }

    const data = await response.json();

    // Basic validation of the response structure
    if (data && typeof data.title === 'string' && typeof data.extract === 'string') {
       return data as WikipediaSummary;
    } else {
       console.error("Unexpected Wikipedia API response structure:", data);
       return null;
    }

  } catch (error) {
    console.error('Error fetching Wikipedia summary:', error);
    return null;
  }
}

export default function BiologyPage() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [summaryData, setSummaryData] = useState<WikipediaSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Clear previous errors
    setSummaryData(null); // Clear previous results
    const trimmedSearchTerm = searchTerm.trim();

    if (!trimmedSearchTerm) {
      setError("Please enter a biology term.");
      toast({ title: "Input Error", description: "Please enter a biology term.", variant: "destructive" });
      return;
    }

     // Client-side validation before API call
    if (!isValidBiologyTerm(trimmedSearchTerm)) {
        setError(`"${trimmedSearchTerm}" is not recognized as a biology term in our list. Please enter a valid term.`);
        toast({ title: "Term Not Found", description: `"${trimmedSearchTerm}" is not recognized as a biology term.`, variant: "destructive" });
        return;
    }


    setIsLoading(true);

    try {
      const data = await getWikipediaSummary(trimmedSearchTerm);
      if (data) {
        setSummaryData(data);
        toast({ title: "Success", description: `Found summary for ${data.title}.` });
      } else {
          // If data is null AFTER validation, it means Wikipedia didn't find it or API error
          setError(`Could not find a Wikipedia summary for "${trimmedSearchTerm}". The page might not exist or there was an API issue.`);
          toast({ title: "Not Found", description: `Could not find Wikipedia summary for "${trimmedSearchTerm}".`, variant: "destructive" });
      }
    } catch (err) {
      console.error('Search failed:', err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(`An error occurred: ${errorMessage}`);
      toast({ title: "Error", description: "An error occurred while fetching data. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // Prefer original image if available, otherwise fallback to thumbnail
   const imageUrl = summaryData?.originalimage?.source || summaryData?.thumbnail?.source;
   // Basic check if the image might be SVG (though unreliable as API might still give PNG thumbnail)
   const isSvg = imageUrl?.toLowerCase().endsWith('.svg');

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Biology Term Explorer</h1>
      <p className="text-muted-foreground">
        Enter a biology term to get a quick summary flashcard.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Term Search</CardTitle>
          <CardDescription>Enter a term like "Mitosis", "DNA", "Photosynthesis".</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="e.g., Cell Membrane"
              className="flex-grow"
              aria-label="Search for biology term"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {isLoading ? 'Searching...' : 'Get Flashcard'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {isLoading && (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2 mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/3" />
          </CardContent>
        </Card>
      )}

       {error && !isLoading && (
           <Alert variant="destructive">
                <Microscope className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
       )}


      {!isLoading && !error && summaryData && (
        <Card className="overflow-hidden shadow-lg">
          <CardHeader>
            <CardTitle>{summaryData.title}</CardTitle>
            {/* <CardDescription>Summary from Wikipedia</CardDescription> // Removed this line */}
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="md:col-span-1 relative w-full h-48 md:h-auto bg-muted rounded-md flex items-center justify-center overflow-hidden border">
               {imageUrl ? (
                 // Use next/image for optimization, but be aware of potential SVG issues
                 <Image
                    src={imageUrl}
                    alt={`Image for ${summaryData.title}`}
                    width={summaryData.thumbnail?.width || 300} // Use provided width or default
                    height={summaryData.thumbnail?.height || 300} // Use provided height or default
                    style={{ objectFit: 'contain' }} // Use contain to ensure image fits well
                    data-ai-hint="biology illustration diagram" // AI hint
                    onError={(e) => {
                       e.currentTarget.src = 'https://via.placeholder.com/300?text=Image+Not+Found';
                       e.currentTarget.alt = `Image not found for ${summaryData.title}`;
                    }}
                    // If it was definitely SVG, might need <img src={imageUrl} /> instead for direct rendering
                 />
               ) : (
                  <div className="text-muted-foreground text-center p-4">No image available</div>
               )}
             </div>
            <div className="md:col-span-2 space-y-3">
               <p className="text-base leading-relaxed">{summaryData.extract}</p>
            </div>
          </CardContent>
          <CardFooter>
            {summaryData.content_urls?.desktop?.page && (
                <a
                    href={summaryData.content_urls.desktop.page}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                 >
                    <BookOpenText className="h-4 w-4" /> Read more on Wikipedia
                </a>
            )}
          </CardFooter>
        </Card>
      )}

      {!isLoading && !error && !summaryData && !searchTerm && (
        <div className="text-center text-muted-foreground mt-8">
          Enter a biology term above to see its flashcard summary.
        </div>
      )}
    </div>
  );
}

