"use client";

import { useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { analyzeSkin, SkinAnalysisOutput } from '@/ai/flows/skin-analysis-flow';

export default function Home() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyzeClick = async () => {
    if (!imageFile || !previewUrl) {
      toast({
        title: "Error",
        description: "Please select an image first.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const analysisResult = await analyzeSkin({ photoDataUri: previewUrl });
      
      const analysisId = new Date().toISOString();
      localStorage.setItem(analysisId, JSON.stringify(analysisResult));

      router.push(`/analysis/${analysisId}`);

    } catch (error) {
      console.error("Analysis failed:", error);
      toast({
        title: "Analysis Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-2xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Skin-sight AI
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Upload an image of a skin condition to get an AI-powered analysis.
          </p>
        </header>

        <Card className="w-full shadow-lg">
          <CardHeader>
            <CardTitle>Upload Your Image</CardTitle>
            <CardDescription>
              Choose a clear, well-lit photo of the skin area you are concerned about.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <div
                className="relative flex flex-col items-center justify-center w-full p-10 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-10 h-10 text-gray-400 mb-4" />
                <p className="text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">PNG, JPG, or WEBP</p>
                <Input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleFileChange}
                />
              </div>

              {previewUrl && (
                <div className="mt-4">
                  <h3 className="font-semibold text-lg mb-2">Image Preview:</h3>
                  <div className="relative w-full aspect-video rounded-md overflow-hidden border">
                    <Image
                      src={previewUrl}
                      alt="Image preview"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              )}

              <Button
                onClick={handleAnalyzeClick}
                disabled={!imageFile || isAnalyzing}
                className="w-full"
                size="lg"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Analyze Skin'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
