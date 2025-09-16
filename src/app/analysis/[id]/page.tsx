'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { getFullAnalysis } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Header } from '@/components/app/header';
import type { AnalysisResult } from '@/lib/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function AnalysisPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { toast } = useToast();
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This effect runs once on mount to fetch all necessary data.
    const loadAnalysis = async () => {
      setIsLoading(true);
      const storedData = localStorage.getItem('currentAnalysis');
      
      if (storedData) {
        const data: AnalysisResult = JSON.parse(storedData);
        // Ensure we are on the correct analysis page
        if (data.id === id) {
          // Set initial data without explanation/cures
          setAnalysis(data);

          try {
            // Fetch the detailed analysis
            const { explanation, cures } = await getFullAnalysis(data.disease);
            // Combine and update the state and localStorage
            setAnalysis(prev => {
              const updated = { ...prev!, explanation, cures };
              localStorage.setItem('currentAnalysis', JSON.stringify(updated));
              return updated;
            });
          } catch (error) {
            console.error('Failed to get analysis details', error);
            toast({
              variant: 'destructive',
              title: 'Error',
              description: 'Could not load the analysis details. Please try again.',
            });
          }
        } else {
          // Mismatch between URL and stored data
          showErrorAndRedirect();
        }
      } else {
        // No data in localStorage
        showErrorAndRedirect();
      }
      
      setIsLoading(false);
    };
    
    const showErrorAndRedirect = () => {
        toast({
          variant: 'destructive',
          title: 'Analysis not found',
          description: 'Please start a new analysis from the home page.',
        });
        router.push('/');
    }

    if (id) {
       loadAnalysis();
    }
  }, [id, router, toast]);

  const renderLoadingSkeleton = () => (
    <div className="space-y-8">
      <Card>
         <CardHeader>
           <Skeleton className="h-8 w-3/4 mx-auto" />
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <Skeleton className="w-full max-w-xs aspect-square rounded-lg" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
        </CardContent>
      </Card>
    </div>
  );
  
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-grow p-4 md:p-8">
          <div className="max-w-4xl mx-auto space-y-8">
            {renderLoadingSkeleton()}
          </div>
        </main>
      </div>
    );
  }

  if (!analysis) {
    // This state is hit if loading is false but there's no analysis
    // This can happen if an error occurred during loading.
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-grow p-4 md:p-8 flex items-center justify-center">
            <Card>
              <CardContent className="p-6">
                <p>Could not load analysis. Please return to the home page.</p>
                <Button asChild className="mt-4">
                  <Link href="/">Home</Link>
                </Button>
              </CardContent>
            </Card>
        </main>
      </div>
    )
  }

  return (
     <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-center capitalize text-primary font-headline">
                  Analysis Result: {analysis.disease}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center gap-8">
                  <div className="relative w-full max-w-xs aspect-square rounded-lg overflow-hidden shadow-lg">
                      <Image src={analysis.image} alt="Analyzed skin condition" fill style={{ objectFit: 'cover' }} />
                  </div>
              </CardContent>
            </Card>

            {analysis.explanation ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Overview</CardTitle>
                  <CardDescription>
                    A summary of the identified condition based on the image provided.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-4 items-center">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Severity</h3>
                      <Badge variant="outline" className="text-lg">{analysis.explanation.severity}</Badge>
                    </div>
                     <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Stage</h3>
                      <Badge variant="outline" className="text-lg">{analysis.explanation.stage}</Badge>
                    </div>
                  </div>
                   <p className="text-muted-foreground">{analysis.explanation.explanation}</p>
                </CardContent>
              </Card>
              <div className="flex justify-end">
                <Button asChild>
                  <Link href={`/analysis/${id}/causes`}>
                    Next: Possible Causes <ArrowRight className="ml-2" />
                  </Link>
                </Button>
              </div>
            </>
          ) : (
            // This case handles when the initial analysis is loaded but details are still fetching
            // It's covered by the main isLoading flag now, but as a fallback.
            renderLoadingSkeleton()
          )}
        </div>
      </main>
    </div>
  );
}
