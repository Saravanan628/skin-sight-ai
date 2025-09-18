
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Upload, Loader2, ArrowLeft, ThumbsUp, ThumbsDown, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { type JournalEntry } from '../analysis/page';
import { analyzeIngredients, type IngredientAnalysisOutput } from '@/ai/flows/ingredient-analysis-flow';


export default function ScannerPage() {
    const [journal, setJournal] = useState<JournalEntry[]>([]);
    const [selectedJournalId, setSelectedJournalId] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<IngredientAnalysisOutput | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        const storedJournal = JSON.parse(localStorage.getItem('skinJournal') || '[]');
        if (storedJournal.length === 0) {
            toast({
                title: "Journal is Empty",
                description: "You must have at least one journal entry to use the scanner.",
                variant: "destructive"
            });
            router.push('/journal');
        } else {
            setJournal(storedJournal);
            setSelectedJournalId(storedJournal[0].id); // Default to the latest entry
        }
    }, [router, toast]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            processFile(file);
        }
    };
    
    const processFile = (file: File) => {
        setAnalysisResult(null); // Reset previous results
        setImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleAnalyzeClick = async () => {
        if (!imageFile || !previewUrl || !selectedJournalId) {
            toast({
                title: "Missing Information",
                description: "Please select a journal entry and an image.",
                variant: "destructive",
            });
            return;
        }

        const selectedEntry = journal.find(entry => entry.id === selectedJournalId);
        if (!selectedEntry) return;

        setIsAnalyzing(true);
        try {
            const result = await analyzeIngredients({
                photoDataUri: previewUrl,
                skinCondition: selectedEntry.analysis.condition,
            });
            setAnalysisResult(result);
        } catch (error) {
            console.error("Ingredient analysis failed:", error);
            toast({
                title: "Analysis Failed",
                description: "Could not analyze the ingredients. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <main className="flex min-h-screen flex-col items-center bg-background p-4 sm:p-8">
            <div className="w-full max-w-3xl">
                <header className="mb-8 flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => router.push('/journal')}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        Ingredient Scanner
                    </h1>
                </header>

                <Card className="w-full shadow-lg">
                    <CardHeader>
                        <CardTitle>Analyze a Product</CardTitle>
                        <CardDescription>
                            Select a journal entry and upload a clear photo of the product's ingredient list.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="journal-entry">Check ingredients for which condition?</Label>
                            <Select
                                value={selectedJournalId || ''}
                                onValueChange={setSelectedJournalId}
                            >
                                <SelectTrigger id="journal-entry">
                                    <SelectValue placeholder="Select a journal entry..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {journal.map(entry => (
                                        <SelectItem key={entry.id} value={entry.id}>
                                            {entry.analysis.condition} (from {new Date(entry.date).toLocaleDateString()})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <div
                            className="relative flex flex-col items-center justify-center w-full p-10 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload className="w-10 h-10 text-muted-foreground mb-4" />
                            <p className="text-sm text-muted-foreground">
                                <span className="font-semibold">Click to upload</span> ingredient list
                            </p>
                            <Input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                accept="image/png, image/jpeg, image/webp"
                                onChange={handleFileChange}
                            />
                        </div>

                         {previewUrl && (
                            <div className="relative w-full aspect-video rounded-md overflow-hidden border">
                                <Image src={previewUrl} alt="Ingredient list preview" fill className="object-contain" />
                            </div>
                         )}
                    </CardContent>
                    <CardFooter>
                         <Button
                            onClick={handleAnalyzeClick}
                            disabled={!imageFile || !selectedJournalId || isAnalyzing}
                            className="w-full"
                            size="lg"
                        >
                            {isAnalyzing ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</>
                            ) : 'Analyze Ingredients'}
                        </Button>
                    </CardFooter>
                </Card>

                {analysisResult && (
                    <Card className="w-full shadow-lg mt-6">
                        <CardHeader>
                            <CardTitle>Analysis Complete</CardTitle>
                            <CardDescription>
                                Here is a breakdown of the ingredients for {' '}
                                <span className="font-bold text-primary">
                                    {journal.find(j => j.id === selectedJournalId)?.analysis.condition}
                                </span>.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                            <div>
                                <h3 className="font-semibold text-lg mb-3 flex items-center"><Sparkles className="h-5 w-5 mr-2 text-primary" /> AI Summary</h3>
                                <p className="text-muted-foreground bg-muted/50 p-4 rounded-md border">{analysisResult.summary}</p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="font-semibold text-lg mb-3 flex items-center"><ThumbsUp className="h-5 w-5 mr-2 text-green-500" /> Good for You</h3>
                                    <ul className="space-y-2">
                                        {analysisResult.beneficialIngredients.length > 0 ? (
                                            analysisResult.beneficialIngredients.map((ing, i) => (
                                                <li key={i} className="text-sm text-muted-foreground">{ing}</li>
                                            ))
                                        ) : (
                                            <li className="text-sm text-muted-foreground">No specifically beneficial ingredients found.</li>
                                        )}
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg mb-3 flex items-center"><ThumbsDown className="h-5 w-5 mr-2 text-red-500" /> Be Cautious</h3>
                                     <ul className="space-y-2">
                                        {analysisResult.harmfulIngredients.length > 0 ? (
                                            analysisResult.harmfulIngredients.map((ing, i) => (
                                                <li key={i} className="text-sm text-muted-foreground">{ing}</li>
                                            ))
                                        ) : (
                                            <li className="text-sm text-muted-foreground">No common irritants found.</li>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                         <CardFooter>
                            <p className="text-xs text-muted-foreground text-center w-full">Disclaimer: This AI analysis is for informational purposes only and is not a substitute for professional medical or dermatological advice.</p>
                         </CardFooter>
                    </Card>
                )}
            </div>
        </main>
    );
}
