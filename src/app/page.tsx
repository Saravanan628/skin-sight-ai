'use client';

import { useState, useEffect, useCallback } from 'react';
import type { AnalysisResult, HistoryItem } from '@/lib/types';
import { getExplanation, getNaturalCures, identifyDisease } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/app/header';
import { ImageUploader } from '@/components/app/image-uploader';
import { ResultsDisplay } from '@/components/app/results-display';
import { HistoryList } from '@/components/app/history-list';

// Helper function to convert file to base64
const toBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

export default function Home() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('skinMindHistory');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error('Failed to parse history from localStorage', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not load analysis history.',
      });
    }
  }, [toast]);

  const handleImageSelect = useCallback((file: File) => {
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDiagnose = async () => {
    if (!imageFile || !imagePreview) return;

    setIsLoading(true);
    setAnalysisResult(null);

    try {
      const imageData = await toBase64(imageFile);
      const { disease } = await identifyDisease(imageData);

      const [explanation, cures] = await Promise.all([
        getExplanation(disease),
        getNaturalCures(disease),
      ]);

      const result: AnalysisResult = {
        disease,
        explanation: explanation.explanation,
        cures: cures.naturalCures,
      };

      setAnalysisResult(result);

      const newHistoryItem: HistoryItem = {
        id: new Date().toISOString(),
        image: imagePreview,
        date: new Date().toLocaleString(),
        result,
      };

      const updatedHistory = [newHistoryItem, ...history];
      setHistory(updatedHistory);
      localStorage.setItem('skinMindHistory', JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Diagnosis failed:', error);
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: 'Something went wrong. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setAnalysisResult(null);
    setImageFile(null);
    setImagePreview(null);
  };
  
  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('skinMindHistory');
    toast({
      title: 'History Cleared',
      description: 'Your analysis history has been removed.',
    });
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setImagePreview(item.image);
    setAnalysisResult(item.result);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow p-4 md:p-8">
        <div className="grid gap-8 lg:grid-cols-3 max-w-7xl mx-auto items-start">
          <div className="lg:col-span-2 space-y-8">
            {analysisResult && imagePreview ? (
              <ResultsDisplay
                imagePreview={imagePreview}
                result={analysisResult}
                onClear={handleClear}
              />
            ) : (
              <ImageUploader
                onImageSelect={handleImageSelect}
                onDiagnose={handleDiagnose}
                imagePreview={imagePreview}
                isLoading={isLoading}
              />
            )}
          </div>
          <div className="lg:col-span-1">
            <HistoryList
              history={history}
              onSelect={handleSelectHistoryItem}
              onClear={handleClearHistory}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
