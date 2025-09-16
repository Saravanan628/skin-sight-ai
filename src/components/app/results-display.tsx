'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { AnalysisResult } from '@/lib/types';
import { Lightbulb, Leaf, RefreshCw } from 'lucide-react';

interface ResultsDisplayProps {
  imagePreview: string;
  result: AnalysisResult;
  onClear: () => void;
}

export function ResultsDisplay({ imagePreview, result, onClear }: ResultsDisplayProps) {
  return (
    <div className="space-y-8 animate-in fade-in-0 duration-500">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center capitalize text-primary font-headline">
            Analysis Complete: {result.disease}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row items-center justify-center gap-8">
            <div className="relative w-full max-w-xs aspect-square rounded-lg overflow-hidden shadow-lg">
                <Image src={imagePreview} alt="Analyzed skin condition" layout="fill" objectFit="cover" />
            </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-6 h-6 text-primary" />
              About the Condition
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{result.explanation}</p>
          </CardContent>
        </Card>

        <Card className="bg-accent/30 dark:bg-accent/20 border-accent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-accent-foreground/80">
              <Leaf className="w-6 h-6 text-accent-foreground/80" />
              Natural Remedies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {result.cures.map((cure, index) => (
                <li key={index} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent-foreground/70 mt-2 shrink-0"></div>
                    <span className="text-accent-foreground/90">{cure}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
      
      <div className="text-center">
        <Button onClick={onClear} size="lg">
          <RefreshCw className="mr-2 h-5 w-5" />
          Start New Scan
        </Button>
      </div>
    </div>
  );
}
