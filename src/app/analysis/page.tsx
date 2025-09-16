'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CheckCircle, Leaf, Pill } from 'lucide-react';
import type { SkinAnalysisOutput } from '@/ai/flows/skin-analysis-flow';

function AnalysisDisplay() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [analysis, setAnalysis] = useState<SkinAnalysisOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const data = searchParams.get('data');
    if (data) {
      try {
        const decodedData = atob(data);
        setAnalysis(JSON.parse(decodedData));
      } catch (e) {
        console.error("Failed to parse analysis data:", e);
        setError("Could not read analysis data. It might be corrupted.");
      }
    } else {
        setError("Analysis data not found in URL.");
    }
  }, [searchParams]);

  if (error || !analysis) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
         <Card className="w-full max-w-lg">
            <CardHeader>
                <CardTitle>Analysis Not Found</CardTitle>
                <CardDescription>{error || "The analysis you are looking for does not exist or has expired."}</CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={() => router.push('/')}>Return to Home</Button>
            </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-background p-4 sm:p-8">
      <div className="w-full max-w-2xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-center">
            Analysis Result
          </h1>
        </header>

        <Card className="w-full shadow-lg mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">{analysis.condition}</CardTitle>
            <CardDescription>{analysis.explanation}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center gap-4">
              <div>
                <h3 className="font-semibold text-foreground">Severity</h3>
                <Badge variant={analysis.severity === 'Severe' ? 'destructive' : 'secondary'}>
                  {analysis.severity}
                </Badge>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Stage</h3>
                <Badge variant="secondary">{analysis.stage}</Badge>
              </div>
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="causes">
                <AccordionTrigger>Possible Causes</AccordionTrigger>
                <AccordionContent>
                  <ul className="grid gap-3 pl-2">
                    {analysis.possibleCauses.map((cause, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                        <p className="text-muted-foreground">{cause}</p>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="vitamins">
                <AccordionTrigger>Potential Vitamin Deficiencies</AccordionTrigger>
                <AccordionContent>
                    <ul className="grid gap-3 pl-2">
                        {analysis.vitaminDeficiencies.map((vitamin, index) => (
                        <li key={index} className="flex items-start gap-3">
                            <Pill className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                            <p className="text-muted-foreground">{vitamin}</p>
                        </li>
                        ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="remedies">
                <AccordionTrigger>Natural Remedies</AccordionTrigger>
                <AccordionContent>
                  <ul className="grid gap-3 pl-2">
                    {analysis.naturalRemedies.map((remedy, index) => (
                        <li key={index} className="flex items-start gap-3">
                            <Leaf className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                            <p className="text-muted-foreground">{remedy}</p>
                        </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push('/')} variant="outline" className="w-full">Analyze Another Image</Button>
          </CardFooter>
        </Card>
        
        <footer className="mt-8 text-center text-sm text-muted-foreground">
            <p><strong>Disclaimer:</strong> This is an AI-generated analysis and not a substitute for professional medical advice. Please consult a qualified healthcare provider for any health concerns.</p>
        </footer>
      </div>
    </main>
  );
}

export default function AnalysisPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen flex-col items-center justify-center p-8">Loading analysis...</div>}>
      <AnalysisDisplay />
    </Suspense>
  );
}
