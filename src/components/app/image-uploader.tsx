'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Loader2, Scan, Upload } from 'lucide-react';
import Image from 'next/image';
import { ChangeEvent, DragEvent, useRef, useState } from 'react';

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  onDiagnose: () => void;
  imagePreview: string | null;
  isLoading: boolean;
}

export function ImageUploader({ onImageSelect, onDiagnose, imagePreview, isLoading }: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageSelect(e.target.files[0]);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onImageSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragEvents = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>AI Skin Analysis</CardTitle>
        <CardDescription>Upload an image of a skin condition to get an AI-powered analysis.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
            'hover:border-primary hover:bg-primary/10',
            isDragging ? 'border-primary bg-primary/10' : 'border-border'
          )}
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragEnter={handleDragEvents}
          onDragOver={handleDragEvents}
          onDragLeave={handleDragEvents}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
          />
          {imagePreview ? (
            <div className="relative w-full max-w-sm mx-auto aspect-square">
              <Image src={imagePreview} alt="Skin condition preview" fill className="object-contain rounded-md" />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Upload className="w-10 h-10" />
              <p className="font-semibold">Click to upload or drag & drop</p>
              <p className="text-sm">PNG, JPG, or JPEG</p>
            </div>
          )}
        </div>

        <Button
          onClick={onDiagnose}
          disabled={!imagePreview || isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Scan className="mr-2 h-5 w-5" />
              Diagnose Condition
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
