
'use client';

import React, { useState } from 'react';
// Remove Image import as Wikipedia card is removed
// import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BookMarked, Search, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils'; // Import cn for conditional styling

// --- API Types ---

interface DictionaryApiResponse {
  word: string;
  phonetic?: string;
  phonetics: { text?: string; audio?: string; sourceUrl?: string }[];
  meanings: {
    partOfSpeech: string;
    definitions: {
      definition: string;
      example?: string;
      synonyms?: string[];
      antonyms?: string[];
    }[];
    synonyms?: string[];
    antonyms?: string[];
  }[];
  license: { name: string; url: string };
  sourceUrls: string[];
}

// Removed WikipediaSummary interface

// --- API Fetching Functions ---

async function getDictionaryDefinition(word: string): Promise<DictionaryApiResponse[] | null> {
  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
    if (!response.ok) {
      if (response.status === 404) return null; // Word not found
      throw new Error(`Dictionary API Error: ${response.status}`);
    }
    const data = await response.json();
    return data as DictionaryApiResponse[];
  } catch (error) {
    console.error('Error fetching dictionary definition:', error);
    return null;
  }
}

// Removed getWikipediaSummary function

// --- Component ---

export default function DictionaryPage() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // State for dictionary result only
  const [dictionaryData, setDictionaryData] = useState<DictionaryApiResponse[] | null>(null);
  // Removed wikipediaData state

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedSearch = searchTerm.trim();
    if (!trimmedSearch) {
      setError("Please enter a word to search.");
      toast({ title: "Input Error", description: "Please enter a word.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setError(null);
    setDictionaryData(null);
    // Removed setting wikipediaData state to null

    try {
      // Fetch only dictionary definition
      const dictRes = await getDictionaryDefinition(trimmedSearch);

      if (dictRes) {
        setDictionaryData(dictRes);
        toast({ title: "Search Complete", description: `Found definition for "${trimmedSearch}".` });
      } else {
        setError(`No definition found for "${trimmedSearch}".`);
        toast({ title: "Not Found", description: `No definition found for "${trimmedSearch}".`, variant: "destructive" });
      }

    } catch (err) { // Catch unexpected errors during fetch
      console.error('Dictionary search failed:', err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during search.";
      setError(`An error occurred: ${errorMessage}`);
      toast({ title: "Search Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

   // Find first available audio source
  const audioSource = dictionaryData?.[0]?.phonetics?.find(p => p.audio)?.audio;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Dictionary</h1>
      <p className="text-muted-foreground">
        Enter a word to find its definition.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Word Search</CardTitle>
          <CardDescription>Enter any English word.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="e.g., Serendipity, Algorithm"
              className="flex-grow"
              aria-label="Search for a word"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Search className="mr-2 h-4 w-4" /> {isLoading ? 'Searching...' : 'Search'}
            </Button>
          </form>
        </CardContent>
      </Card>

       {isLoading && (
         <div className="grid grid-cols-1 md:grid-cols-1 gap-6"> {/* Adjusted for single card */}
            <Skeleton className="h-80 w-full" /> {/* Increased height */}
         </div>
       )}

       {error && !isLoading && (
           <Alert variant="destructive">
                <BookMarked className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
       )}

       {/* Results Area */}
       <div className="grid grid-cols-1 md:grid-cols-1 gap-6"> {/* Adjusted for single card */}

         {/* Dictionary Definition Card - Enhanced Styling */}
         {!isLoading && dictionaryData && (
            <Card className={cn(
              "shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden",
              "bg-gradient-to-br from-card via-card to-primary/10 dark:from-card dark:via-card dark:to-primary/20", // Subtle gradient
              "border-primary/50 dark:border-primary/40", // Vibrant border
              "ring-2 ring-primary/30 ring-offset-2 ring-offset-background dark:ring-primary/40 dark:ring-offset-card", // Glow effect
              "hover:ring-primary/50 dark:hover:ring-primary/60" // Enhanced glow on hover
            )}>
               <CardHeader className="border-b border-primary/20 dark:border-primary/30 bg-primary/5 dark:bg-primary/10">
                  <CardTitle className="flex items-center gap-2 text-primary dark:text-primary-foreground">
                     {dictionaryData[0].word}
                     {dictionaryData[0].phonetic && <span className="text-muted-foreground text-lg dark:text-primary-foreground/80">({dictionaryData[0].phonetic})</span>}
                      {audioSource && (
                        <Button variant="ghost" size="icon" onClick={() => new Audio(audioSource).play()} aria-label="Play pronunciation" className="text-primary dark:text-primary-foreground hover:bg-primary/10 dark:hover:bg-primary/20">
                            <Volume2 className="h-5 w-5" />
                         </Button>
                      )}
                  </CardTitle>
                  {/* Removed CardDescription "Definition" */}
               </CardHeader>
               <CardContent className="space-y-4 pt-6 max-h-[60vh] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-muted scrollbar-track-background">
                  {dictionaryData[0].meanings.map((meaning, index) => (
                    <div key={index} className="space-y-2 border-l-4 border-accent pl-4 py-2 bg-background/50 dark:bg-background/70 rounded-r-md">
                      <h3 className="font-semibold text-accent-foreground dark:text-accent">{meaning.partOfSpeech}</h3>
                      <ul className="list-decimal pl-5 space-y-1">
                        {meaning.definitions.map((def, defIndex) => (
                          <li key={defIndex}>
                            <p>{def.definition}</p>
                            {def.example && <p className="text-sm text-muted-foreground italic">e.g., "{def.example}"</p>}
                          </li>
                        ))}
                      </ul>
                       {/* Synonyms/Antonyms from Dictionary API */}
                       {meaning.synonyms && meaning.synonyms.length > 0 && (
                            <div className="mt-2">
                                <span className="text-sm font-medium text-muted-foreground">Synonyms: </span>
                                <span className="text-sm">{meaning.synonyms.slice(0, 5).join(', ')}{meaning.synonyms.length > 5 ? '...' : ''}</span>
                            </div>
                        )}
                         {meaning.antonyms && meaning.antonyms.length > 0 && (
                             <div className="mt-1">
                                <span className="text-sm font-medium text-muted-foreground">Antonyms: </span>
                                <span className="text-sm">{meaning.antonyms.slice(0, 5).join(', ')}{meaning.antonyms.length > 5 ? '...' : ''}</span>
                             </div>
                         )}
                    </div>
                  ))}
               </CardContent>
               {/* CardFooter is removed */}
            </Card>
         )}

          {/* Removed Wikipedia Summary Card */}

       </div> {/* End Results Grid */}

       {/* Placeholder when no search has been performed */}
       {/* Adjusted check to exclude related words and wikipedia */}
       {!isLoading && !error && !dictionaryData && searchTerm && (
          <div className="text-center text-muted-foreground mt-8">
            No definition found for "{searchTerm}". Try a different word.
          </div>
       )}
       {!isLoading && !searchTerm && (
          <div className="text-center text-muted-foreground mt-8">
             Enter a word above to start exploring.
          </div>
       )}

    </div>
  );
}

