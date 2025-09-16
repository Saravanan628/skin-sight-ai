'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/app/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Leaf, Apple } from 'lucide-react';
import type { AnalysisResult } from '@/lib/types';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

export default function RemediesPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedData = localStorage.getItem('currentAnalysis');
      if (storedData) {
        const data = JSON.parse(storedData);
        if (data.id === id && data.cures) {
          setAnalysis(data);
        } else {
          router.push(`/analysis/${id}`);
        }
      } else {
        router.push('/');
      }
    }
  }, [id, router]);

  if (!analysis?.cures) {
     return (
       <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-grow p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                 <Skeleton className="h-64 w-full" />
                 <Skeleton className="h-10 w-48 ml-auto" />
            </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="bg-accent/30 dark:bg-accent/20 border-accent">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-accent-foreground/80">
                    <Leaf className="w-6 h-6" />
                    Natural Remedies
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {analysis.cures.naturalRemedies.map((cure, index) => (
                      <li key={index} className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-accent-foreground/70 mt-2 shrink-0"></div>
                          <span className="text-accent-foreground/90">{cure}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Apple className="w-6 h-6 text-primary" />
                    Recommended Foods
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {analysis.cures.recommendedFoods.map((food, index) => (
                       <li key={index} className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary/80 mt-2 shrink-0"></div>
                          <span className="text-muted-foreground">{food}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>


            <div className="flex justify-between">
                <Button variant="outline" asChild>
                  <Link href={`/analysis/${id}/vitamins`}>
                    <ArrowLeft className="mr-2" /> Back to Vitamins
                  </Link>
                </Button>
                <Button asChild>
                    <Link href="/">
                        Start New Analysis
                    </Link>
                </Button>
             </div>
        </div>
      </main>
    </div>
  );
}
