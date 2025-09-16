'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { SkinAnalysisOutput } from '@/ai/flows/skin-analysis-flow';

function AnalysisDisplay() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [analysis, setAnalysis] = useState<SkinAnalysisOutput | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = searchParams.get('data');
    if (data) {
      try {
        const decodedData = atob(data);
        setAnalysis(JSON.parse(decodedData));
      } catch (error) {
        console.error("Failed to parse analysis data:", error);
      }
    }
    setLoading(false);
  }, [searchParams]);

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8">
        <p>Loading analysis...</p>
      </main>
    );
  }
  
  if (!analysis) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
         <Card className="w-full max-w-lg">
            <CardHeader>
                <CardTitle>Analysis Not Found</CardTitle>
                <CardDescription>The analysis you are looking for does not exist or has expired.</CardDescription>
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
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl text-center">
            Analysis Result
          </h1>
        </header>

        <Card className="w-full shadow-lg mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">{analysis.condition}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <p className="text-gray-700">{analysis.explanation}</p>
            <div className="flex items-center gap-4">
              <div>
                <h3 className="font-semibold text-gray-800">Severity</h3>
                <Badge variant={analysis.severity === 'Severe' ? 'destructive' : 'secondary'}>
                  {analysis.severity}
                </Badge>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Stage</h3>
                <Badge variant="secondary">{analysis.stage}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="text-center">
            <Button onClick={() => router.push('/')}>Analyze Another Image</Button>
        </div>

        <footer className="mt-8 text-center text-sm text-gray-500">
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
