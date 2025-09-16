'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/app/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Lightbulb } from 'lucide-react';
import type { AnalysisResult } from '@/lib/types';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

export default function CausesPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedData = localStorage.getItem('currentAnalysis');
      if (storedData) {
        const data = JSON.parse(storedData);
        if (data.id === id && data.explanation) {
          setAnalysis(data);
        } else {
          router.push(`/analysis/${id}`);
        }
      } else {
        router.push('/');
      }
    }
  }, [id, router]);

  if (!analysis?.explanation) {
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
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                        <Lightbulb className="w-8 h-8 text-primary" />
                        Possible Causes of {analysis.diseaseName}
                    </CardTitle>
                    <CardDescription>
                        Understanding what might be contributing to this condition.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-3 list-disc pl-5 text-muted-foreground">
                        {analysis.explanation.possibleCauses.map((cause, index) => (
                            <li key={index}>{cause}</li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

            <div className="flex justify-between">
                <Button variant="outline" asChild>
                  <Link href={`/analysis/${id}`}>
                    <ArrowLeft className="mr-2" /> Back to Overview
                  </Link>
                </Button>
                <Button asChild>
                  <Link href={`/analysis/${id}/vitamins`}>
                    Next: Vitamin Deficiencies <ArrowRight className="ml-2" />
                  </Link>
                </Button>
             </div>
        </div>
      </main>
    </div>
  );
}
