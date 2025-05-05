
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BookMarked, Search, Volume2, Link as LinkIcon } from 'lucide-react';

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

interface DatamuseRelatedWord {
  word: string;
  score: number;
}

interface WikipediaSummary {
  title: string;
  extract: string;
  thumbnail?: { source: string; width: number; height: number };
  originalimage?: { source: string; width: number; height: number };
  content_urls?: { desktop?: { page: string } };
}

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

async function getRelatedWords(word: string, type: 'syn' | 'ant' | 'rel_trg'): Promise<DatamuseRelatedWord[] | null> {
  try {
    const response = await fetch(`https://api.datamuse.com/words?rel_${type}=${encodeURIComponent(word)}&max=10`);
    if (!response.ok) throw new Error(`Datamuse API Error: ${response.status}`);
    const data = await response.json();
    return data as DatamuseRelatedWord[];
  } catch (error) {
    console.error(`Error fetching related words (${type}):`, error);
    return null;
  }
}

async function getWikipediaSummary(word: string): Promise<WikipediaSummary | null> {
    try {
        const encodedTerm = encodeURIComponent(word.trim());
        const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodedTerm}`;
        const response = await fetch(url, {
            headers: { 'User-Agent': 'PCMBtools/1.0 (contact@example.com)' } // Be polite with User-Agent
        });
        if (!response.ok) {
            if (response.status === 404) return null; // Page not found is expected
            throw new Error(`Wikipedia API Error: ${response.status}`);
        }
        const data = await response.json();
        return data as WikipediaSummary;
    } catch (error) {
        console.error('Error fetching Wikipedia summary:', error);
        return null;
    }
}

// --- Component ---

export default function DictionaryPage() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // State for each API result
  const [dictionaryData, setDictionaryData] = useState<DictionaryApiResponse[] | null>(null);
  const [synonyms, setSynonyms] = useState<DatamuseRelatedWord[] | null>(null);
  const [antonyms, setAntonyms] = useState<DatamuseRelatedWord[] | null>(null);
  const [triggers, setTriggers] = useState<DatamuseRelatedWord[] | null>(null); // Words triggered by search term
  const [wikipediaData, setWikipediaData] = useState<WikipediaSummary | null>(null);

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
    setSynonyms(null);
    setAntonyms(null);
    setTriggers(null);
    setWikipediaData(null);

    try {
      const [dictRes, synRes, antRes, trigRes, wikiRes] = await Promise.allSettled([
        getDictionaryDefinition(trimmedSearch),
        getRelatedWords(trimmedSearch, 'syn'),
        getRelatedWords(trimmedSearch, 'ant'),
        getRelatedWords(trimmedSearch, 'rel_trg'),
        getWikipediaSummary(trimmedSearch),
      ]);

      let foundSomething = false;

      if (dictRes.status === 'fulfilled' && dictRes.value) {
        setDictionaryData(dictRes.value);
        foundSomething = true;
      }
      if (synRes.status === 'fulfilled' && synRes.value) setSynonyms(synRes.value);
      if (antRes.status === 'fulfilled' && antRes.value) setAntonyms(antRes.value);
      if (trigRes.status === 'fulfilled' && trigRes.value) setTriggers(trigRes.value);
      if (wikiRes.status === 'fulfilled' && wikiRes.value) {
        setWikipediaData(wikiRes.value);
        foundSomething = true;
      }

      if (!foundSomething && dictRes.status !== 'fulfilled') {
         // If primary dictionary API failed, show its error
         setError(`Failed to fetch definition: ${dictRes.reason?.message || 'Unknown API error'}`);
         toast({ title: "Definition Error", description: "Could not fetch definition.", variant: "destructive" });
      } else if (!foundSomething) {
         // If dictionary API returned 404 and Wikipedia also 404'd
         setError(`No definition or summary found for "${trimmedSearch}".`);
         toast({ title: "Not Found", description: `No results for "${trimmedSearch}".`, variant: "destructive" });
      } else {
         toast({ title: "Search Complete", description: `Found results for "${trimmedSearch}".` });
      }

      // Log specific errors for related words if needed
      if (synRes.status === 'rejected') console.error("Synonym fetch error:", synRes.reason);
      if (antRes.status === 'rejected') console.error("Antonym fetch error:", antRes.reason);
      if (trigRes.status === 'rejected') console.error("Trigger fetch error:", trigRes.reason);
      if (wikiRes.status === 'rejected') console.error("Wikipedia fetch error:", wikiRes.reason);


    } catch (err) { // Catch unexpected errors during Promise.allSettled itself
      console.error('Overall search failed:', err);
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
      <h1 className="text-3xl font-bold">Dictionary & Word Explorer</h1>
      <p className="text-muted-foreground">
        Enter a word to find its definition, related terms, and a summary.
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
              placeholder="e.g., Photosynthesis, Serendipity, Algorithm"
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
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full md:col-span-2" />
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
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

         {/* Dictionary Definition Card */}
         {!isLoading && dictionaryData && (
            <Card className="shadow-md">
               <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                     {dictionaryData[0].word}
                     {dictionaryData[0].phonetic && <span className="text-muted-foreground text-lg">({dictionaryData[0].phonetic})</span>}
                      {audioSource && (
                        <Button variant="ghost" size="icon" onClick={() => new Audio(audioSource).play()} aria-label="Play pronunciation">
                            <Volume2 className="h-5 w-5" />
                         </Button>
                      )}
                  </CardTitle>
               </CardHeader>
               <CardContent className="space-y-4 max-h-[60vh] overflow-y-auto pr-4">
                  {dictionaryData[0].meanings.map((meaning, index) => (
                    <div key={index} className="space-y-2 border-l-2 border-primary pl-3">
                      <h3 className="font-semibold text-primary">{meaning.partOfSpeech}</h3>
                      <ul className="list-decimal pl-5 space-y-1">
                        {meaning.definitions.map((def, defIndex) => (
                          <li key={defIndex}>
                            <p>{def.definition}</p>
                            {def.example && <p className="text-sm text-muted-foreground italic">e.g., "{def.example}"</p>}
                          </li>
                        ))}
                      </ul>
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
                <CardFooter className="text-xs text-muted-foreground">
                  {dictionaryData[0].sourceUrls?.[0] && (
                     <a href={dictionaryData[0].sourceUrls[0]} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                         <LinkIcon className="h-3 w-3" /> Source
                     </a>
                  )}
               </CardFooter>
            </Card>
         )}

          {/* Related Words Card */}
          {!isLoading && (synonyms || antonyms || triggers) && (
             <Card className="shadow-md">
                <CardHeader>
                   <CardTitle>Related Words</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 max-h-[60vh] overflow-y-auto pr-4">
                   {synonyms && synonyms.length > 0 && (
                     <div>
                       <h3 className="font-semibold text-primary mb-1">Synonyms</h3>
                       <div className="flex flex-wrap gap-1">
                         {synonyms.map(word => <span key={word.word} className="bg-secondary text-secondary-foreground px-2 py-1 rounded-full text-xs">{word.word}</span>)}
                       </div>
                     </div>
                   )}
                   {antonyms && antonyms.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-primary mb-1">Antonyms</h3>
                         <div className="flex flex-wrap gap-1">
                            {antonyms.map(word => <span key={word.word} className="bg-secondary text-secondary-foreground px-2 py-1 rounded-full text-xs">{word.word}</span>)}
                         </div>
                      </div>
                   )}
                    {triggers && triggers.length > 0 && (
                       <div>
                         <h3 className="font-semibold text-primary mb-1">Words often used with "{searchTerm}"</h3>
                          <div className="flex flex-wrap gap-1">
                             {triggers.map(word => <span key={word.word} className="bg-secondary text-secondary-foreground px-2 py-1 rounded-full text-xs">{word.word}</span>)}
                          </div>
                       </div>
                    )}
                    {(!synonyms || synonyms.length === 0) && (!antonyms || antonyms.length === 0) && (!triggers || triggers.length === 0) && (
                        <p className="text-muted-foreground">No related words found via Datamuse.</p>
                    )}
                </CardContent>
                <CardFooter className="text-xs text-muted-foreground">
                    Related words sourced via Datamuse API.
                </CardFooter>
             </Card>
          )}

           {/* Wikipedia Summary Card (Spanning full width below others) */}
          {!isLoading && wikipediaData && (
            <Card className="shadow-md md:col-span-2"> {/* Spans 2 columns on medium+ screens */}
                <CardHeader>
                   <CardTitle>Summary for "{wikipediaData.title}"</CardTitle>
                   {/* <CardDescription>From Wikipedia</CardDescription> // Optional */}
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-1 relative min-h-[150px] bg-muted rounded-md flex items-center justify-center overflow-hidden border">
                       {wikipediaData.originalimage?.source ? (
                          <Image
                            src={wikipediaData.originalimage.source}
                            alt={`Image for ${wikipediaData.title}`}
                            width={wikipediaData.originalimage.width || 300}
                            height={wikipediaData.originalimage.height || 200}
                            style={{ objectFit: 'contain', maxHeight: '250px' }} // Limit height
                             data-ai-hint="encyclopedia image illustration"
                            onError={(e) => {
                                e.currentTarget.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
                                e.currentTarget.alt = `Image not found for ${wikipediaData.title}`;
                            }}
                          />
                       ) : wikipediaData.thumbnail?.source ? (
                           <Image
                            src={wikipediaData.thumbnail.source}
                            alt={`Thumbnail for ${wikipediaData.title}`}
                            width={wikipediaData.thumbnail.width}
                            height={wikipediaData.thumbnail.height}
                            style={{ objectFit: 'contain', maxHeight: '250px' }}
                             data-ai-hint="encyclopedia image illustration"
                            onError={(e) => {
                                e.currentTarget.src = 'https://via.placeholder.com/150x150?text=Image+Not+Found';
                                e.currentTarget.alt = `Thumbnail not found for ${wikipediaData.title}`;
                            }}
                          />
                       ) : (
                           <div className="text-muted-foreground text-center p-4">No image available</div>
                       )}
                    </div>
                    <div className="sm:col-span-2 space-y-2">
                       <p className="text-base leading-relaxed">{wikipediaData.extract}</p>
                    </div>
                </CardContent>
                <CardFooter>
                   {wikipediaData.content_urls?.desktop?.page && (
                      <a
                          href={wikipediaData.content_urls.desktop.page}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline flex items-center gap-1"
                       >
                          <LinkIcon className="h-4 w-4" /> Read more on Wikipedia
                      </a>
                   )}
                </CardFooter>
            </Card>
         )}

       </div> {/* End Results Grid */}

       {/* Placeholder when no search has been performed */}
       {!isLoading && !error && !dictionaryData && !synonyms && !antonyms && !triggers && !wikipediaData && searchTerm && (
          <div className="text-center text-muted-foreground mt-8">
            No results found for "{searchTerm}". Try a different word.
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
