'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
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
  const { id } = useParams();
  const { toast } = useToast();
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedData = localStorage.getItem('currentAnalysis');
      if (storedData) {
        const data = JSON.parse(storedData);
        if (data.id === id) {
          setAnalysis(data);
          fetchAnalysisDetails(data.disease);
        } else {
          showError();
        }
      } else {
        showError();
      }
    }
  }, [id]);

  const fetchAnalysisDetails = async (diseaseName: string) => {
    setIsLoading(true);
    try {
      const { explanation, cures } = await getFullAnalysis(diseaseName);
      setAnalysis((prev) => {
        const updatedAnalysis = { ...prev!, explanation, cures };
        localStorage.setItem('currentAnalysis', JSON.stringify(updatedAnalysis));
        return updatedAnalysis;
      });
    } catch (error) {
      console.error('Failed to get analysis details', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not load the analysis details. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const showError = () => {
    toast({
      variant: 'destructive',
      title: 'Analysis not found',
      description: 'Please start a new analysis from the home page.',
    });
    // Consider redirecting to home page
  };
  
  const renderLoadingSkeleton = () => (
    <div className="space-y-8">
      <Card>
        <CardHeader>
           <Skeleton className="h-8 w-3/4 mx-auto" />
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <Skeleton className="w-full max-w-xs aspect-square rounded-lg" />
          <div className="flex gap-4">
             <Skeleton className="h-6 w-24" />
             <Skeleton className="h-6 w-24" />
          </div>
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

  return (
     <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
           {analysis && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-3xl font-bold text-center capitalize text-primary font-headline">
                    Analysis Result: {analysis.disease}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center gap-8">
                    <div className="relative w-full max-w-xs aspect-square rounded-lg overflow-hidden shadow-lg">
                        <Image src={analysis.image} alt="Analyzed skin condition" layout="fill" objectFit="cover" />
                    </div>
                </CardContent>
              </Card>
           )}

          {isLoading && !analysis?.explanation ? (
            renderLoadingSkeleton()
          ) : analysis?.explanation ? (
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
            !isLoading && (
              <Card>
                <CardContent>
                  <p>Could not load analysis details.</p>
                </CardContent>
              </Card>
            )
          )}
        </div>
      </main>
    </div>
  );
}
