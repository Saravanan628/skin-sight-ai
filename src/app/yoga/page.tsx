
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, HeartPulse, Leaf, ImageOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { type JournalEntry } from '../analysis/page';
import { recommendYoga, type YogaRecommendation, type YogaRecommendationOutput } from '@/ai/flows/yoga-recommendation-flow';
import { generateImage } from '@/ai/flows/image-generation-flow';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';

function YogaPose({ pose }: { pose: YogaRecommendation }) {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        const generatePoseImage = async () => {
            if (pose.imageHint) {
                setIsGenerating(true);
                try {
                    const result = await generateImage({
                        prompt: `A clear, simple illustration of a person doing the ${pose.poseName} (yoga pose), on a plain background.`,
                    });
                    if (result.imageUrl) {
                        setImageUrl(result.imageUrl);
                    }
                } catch (error) {
                    console.error('Image generation failed for pose:', pose.poseName, error);
                    // Set imageUrl to null or a specific state to indicate failure
                    setImageUrl(null);
                } finally {
                    setIsGenerating(false);
                }
            }
        };
        generatePoseImage();
    }, [pose.imageHint, pose.poseName]);

    return (
        <AccordionItem value={pose.poseName}>
            <AccordionTrigger className="text-lg hover:no-underline">
                <div className="flex items-center gap-3">
                    <HeartPulse className="h-5 w-5 text-primary" />
                    {pose.poseName}
                </div>
            </AccordionTrigger>
            <AccordionContent className="grid md:grid-cols-2 gap-6 pt-2">
                <div className="relative w-full aspect-video rounded-md overflow-hidden border flex items-center justify-center bg-muted/50">
                    {isGenerating && <Skeleton className="h-full w-full" />}
                    {!isGenerating && imageUrl && (
                        <Image
                            src={imageUrl}
                            alt={`Yoga pose: ${pose.poseName}`}
                            fill
                            className="object-cover"
                            data-ai-hint={pose.imageHint}
                        />
                    )}
                    {!isGenerating && !imageUrl && (
                         <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <ImageOff className="h-8 w-8 mb-2" />
                            <p className="text-sm">Image not available</p>
                        </div>
                    )}
                </div>
                <div className="grid gap-4">
                    <div>
                        <h4 className="font-semibold mb-2">How to do it:</h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-line">{pose.description}</p>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2"><Leaf className="h-4 w-4 text-green-500" /> Benefits for your skin:</h4>
                        <p className="text-sm text-muted-foreground">{pose.benefits}</p>
                    </div>
                </div>
            </AccordionContent>
        </AccordionItem>
    )
}


export default function YogaFinderPage() {
    const [journal, setJournal] = useState<JournalEntry[]>([]);
    const [selectedJournalId, setSelectedJournalId] = useState<string | null>(null);
    const [isFinding, setIsFinding] = useState(false);
    const [recommendations, setRecommendations] = useState<YogaRecommendationOutput | null>(null);

    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        const storedJournal = JSON.parse(localStorage.getItem('skinJournal') || '[]');
        if (storedJournal.length === 0) {
            toast({
                title: "Journal is Empty",
                description: "You must have at least one journal entry to find yoga poses.",
                variant: "destructive"
            });
            router.push('/journal');
        } else {
            setJournal(storedJournal);
            setSelectedJournalId(storedJournal[0].id); // Default to the latest entry
        }
    }, [router, toast]);

    const handleFindPosesClick = async () => {
        if (!selectedJournalId) {
            toast({
                title: "Missing Information",
                description: "Please select a journal entry.",
                variant: "destructive",
            });
            return;
        }

        const selectedEntry = journal.find(entry => entry.id === selectedJournalId);
        if (!selectedEntry) return;

        setIsFinding(true);
        setRecommendations(null);
        try {
            const result = await recommendYoga({
                skinCondition: selectedEntry.analysis.condition,
            });
            setRecommendations(result);
        } catch (error) {
            console.error("Yoga recommendation failed:", error);
            toast({
                title: "Recommendation Failed",
                description: "Could not get yoga recommendations. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsFinding(false);
        }
    };

    return (
        <main className="flex flex-1 flex-col p-4 sm:p-8">
            <div className="w-full max-w-3xl mx-auto">
                <header className="mb-8 flex items-center gap-4">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        Yoga for Skin Health
                    </h1>
                </header>

                <Card className="w-full shadow-lg">
                    <CardHeader>
                        <CardTitle>Find Healing Yoga Poses</CardTitle>
                        <CardDescription>
                            Select a diagnosed condition from your journal to get AI-powered yoga recommendations.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="journal-entry">Select a condition to focus on</Label>
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
                    </CardContent>
                    <CardFooter>
                         <Button
                            onClick={handleFindPosesClick}
                            disabled={!selectedJournalId || isFinding}
                            className="w-full"
                            size="lg"
                        >
                            {isFinding ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Finding Poses...</>
                            ) : <><HeartPulse className="mr-2 h-4 w-4" />Find Yoga Poses</> }
                        </Button>
                    </CardFooter>
                </Card>

                {recommendations && (
                    <Card className="w-full shadow-lg mt-6">
                        <CardHeader>
                            <CardTitle>Recommended Yoga Practice</CardTitle>
                            <CardDescription>
                                Here are some yoga poses that may help with {' '}
                                <span className="font-bold text-primary">{journal.find(j => j.id === selectedJournalId)?.analysis.condition}</span>.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                           <Accordion type="single" collapsible className="w-full">
                                {recommendations.recommendations.map((rec, index) => (
                                    <YogaPose key={index} pose={rec} />
                                ))}
                            </Accordion>
                        </CardContent>
                         <CardFooter>
                            <p className="text-xs text-muted-foreground text-center w-full">Disclaimer: These AI-generated recommendations are for informational purposes. Consult with a qualified yoga instructor and healthcare provider before starting a new practice.</p>
                         </CardFooter>
                    </Card>
                )}
            </div>
        </main>
    );
}
