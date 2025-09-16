'use client';

import { useState, useRef, ChangeEvent, DragEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { identifyDisease } from '@/app/actions';
import { Header } from '@/components/app/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Loader2, Upload, Camera, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Helper function to convert file to base64
const toBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

export default function Home() {
  const router = useRouter();
  const { toast } = useToast();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (showCamera) {
      const getCameraPermission = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          setHasCameraPermission(true);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
          toast({
            variant: 'destructive',
            title: 'Camera Access Denied',
            description: 'Please enable camera permissions in your browser settings to use this feature.',
          });
          setShowCamera(false);
        }
      };
      getCameraPermission();
    } else {
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach((track) => track.stop());
    }
  }, [showCamera, toast]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
       setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
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
  
  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setImagePreview(dataUrl);

      // Convert data URL to File object
      fetch(dataUrl)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
          setImageFile(file);
        });

      setShowCamera(false);
    }
  };


  const handleStartAnalysis = async () => {
    if (!imageFile || !imagePreview) return;

    setIsLoading(true);

    try {
      const imageData = await toBase64(imageFile);
      // We are just identifying the disease here. The detailed analysis will happen on the results page.
      const { disease } = await identifyDisease(imageData);

      // Store image and identified disease in localStorage to be picked up by the analysis page
      const analysisData = {
        id: new Date().toISOString(),
        image: imagePreview,
        disease,
      };
      localStorage.setItem('currentAnalysis', JSON.stringify(analysisData));

      router.push(`/analysis/${analysisData.id}`);
    } catch (error) {
      console.error('Analysis failed:', error);
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: 'Something went wrong. Please try again.',
      });
      setIsLoading(false);
    }
  };

  const reset = () => {
    setImageFile(null);
    setImagePreview(null);
    setShowCamera(false);
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow p-4 md:p-8 flex items-center justify-center">
        <div className="w-full max-w-2xl mx-auto">
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-center">AI Skin Analysis</CardTitle>
              <CardDescription className="text-center text-lg">
                Concerned about a skin condition? Let's take a closer look.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {imagePreview ? (
                 <div className="space-y-4 text-center">
                   <div className="relative w-full max-w-sm mx-auto aspect-square">
                     <Image src={imagePreview} alt="Skin condition preview" fill className="object-contain rounded-md" />
                   </div>
                   <Button onClick={handleStartAnalysis} disabled={isLoading} size="lg">
                     {isLoading ? (
                       <>
                         <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                         Analyzing...
                       </>
                     ) : (
                       <>
                         Start Analysis
                         <ArrowRight className="ml-2 h-5 w-5" />
                       </>
                     )}
                   </Button>
                   <Button variant="outline" onClick={reset}>Try Again</Button>
                 </div>
              ) : showCamera ? (
                <div className="space-y-4">
                  <video ref={videoRef} className="w-full aspect-video rounded-md" autoPlay muted playsInline />
                   {!(hasCameraPermission) && (
                      <Alert variant="destructive">
                        <AlertTitle>Camera Access Required</AlertTitle>
                        <AlertDescription>
                          Please allow camera access to use this feature.
                        </AlertDescription>
                      </Alert>
                    )}
                  <div className="flex justify-center gap-4">
                    <Button onClick={handleCapture} disabled={!hasCameraPermission}>Capture Image</Button>
                    <Button variant="outline" onClick={() => setShowCamera(false)}>Cancel</Button>
                  </div>
                  <canvas ref={canvasRef} className="hidden" />
                </div>
              ) : (
                <div className="space-y-4">
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
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Upload className="w-10 h-10" />
                      <p className="font-semibold">Click to upload or drag & drop</p>
                      <p className="text-sm">PNG, JPG, or JPEG</p>
                    </div>
                  </div>
                  <div className="relative flex items-center">
                    <div className="flex-grow border-t border-muted-foreground"></div>
                    <span className="flex-shrink mx-4 text-muted-foreground">OR</span>
                    <div className="flex-grow border-t border-muted-foreground"></div>
                  </div>
                  <Button onClick={() => setShowCamera(true)} className="w-full" size="lg" variant="outline">
                    <Camera className="mr-2 h-5 w-5" />
                    Use Camera
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
