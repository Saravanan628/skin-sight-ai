'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Leaf } from 'lucide-react';
import type { SkinAnalysisOutput } from '@/ai/flows/skin-analysis-flow';

function RemediesDisplay() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [analysis, setAnalysis] = useState<SkinAnalysisOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const data = searchParams.get('data');
    if (data) {
      try {
        const decodedData = atob(data);
        const parsedData: SkinAnalysisOutput = JSON.parse(decodedData);
        if (!parsedData.naturalRemedies) {
          setError("Natural remedies are not available in the analysis data.");
        }
        setAnalysis(parsedData);
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
                <CardTitle>Could Not Load Remedies</CardTitle>
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
    <main className="flex min-h-screen flex-col items-center bg-gray-50 p-4 sm:p-8">
      <div className="w-full max-w-2xl">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Natural Remedies for {analysis.condition}
          </h1>
        </header>

        <Card className="w-full shadow-lg mb-6">
          <CardHeader>
            <CardTitle>Suggested Natural Remedies</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-4">
              {analysis.naturalRemedies.map((remedy, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Leaf className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <p className="text-gray-700">{remedy}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        
        <div className="text-center">
            <Button onClick={() => router.back()}>Back to Analysis</Button>
        </div>

        <footer className="mt-8 text-center text-sm text-gray-500">
            <p><strong>Disclaimer:</strong> This is an AI-generated analysis and not a substitute for professional medical advice. Please consult a qualified healthcare provider for any health concerns.</p>
        </footer>
      </div>
    </main>
  );
}


export default function RemediesPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen flex-col items-center justify-center p-8">Loading remedies...</div>}>
      <RemediesDisplay />
    </Suspense>
  );
}
