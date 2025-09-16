'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/app/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { AnalysisResult } from '@/lib/types';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

const PillIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-primary">
        <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/>
    </svg>
);


export default function VitaminsPage() {
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
                    <CardTitle className="flex items-center gap-3 text-2xl">
                       <PillIcon />
                        Vitamin Deficiencies & {analysis.diseaseName}
                    </CardTitle>
                    <CardDescription>
                       How nutritional balance may play a role in your skin's health.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">{analysis.explanation.vitaminDeficiency}</p>
                </CardContent>
            </Card>

            <div className="flex justify-between">
                <Button variant="outline" asChild>
                  <Link href={`/analysis/${id}/causes`}>
                    <ArrowLeft className="mr-2" /> Back to Causes
                  </Link>
                </Button>
                <Button asChild>
                  <Link href={`/analysis/${id}/remedies`}>
                    Next: Remedies & Diet <ArrowRight className="ml-2" />
                  </Link>
                </Button>
             </div>
        </div>
      </main>
    </div>
  );
}
