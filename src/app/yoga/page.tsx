
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, HeartPulse, Leaf } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { type JournalEntry } from '../analysis/page';
import { recommendYoga, type YogaRecommendationOutput } from '@/ai/flows/yoga-recommendation-flow';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

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
                           <Accordion type="single" collapsible className="w-full" defaultValue="pose-0">
                                {recommendations.recommendations.map((rec, index) => (
                                    <AccordionItem value={`pose-${index}`} key={index}>
                                        <AccordionTrigger className="text-lg hover:no-underline">
                                            <div className="flex items-center gap-3">
                                                <HeartPulse className="h-5 w-5 text-primary" />
                                                {rec.poseName}
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="grid md:grid-cols-2 gap-6 pt-2">
                                            <div className="relative w-full aspect-video rounded-md overflow-hidden border">
                                                <Image 
                                                    src={rec.imageUrl} 
                                                    alt={`Yoga pose: ${rec.poseName}`}
                                                    fill
                                                    className="object-cover"
                                                    data-ai-hint={rec.imageHint}
                                                />
                                            </div>
                                            <div className="grid gap-4">
                                                <div>
                                                    <h4 className="font-semibold mb-2">How to do it:</h4>
                                                    <p className="text-sm text-muted-foreground whitespace-pre-line">{rec.description}</p>
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold mb-2 flex items-center gap-2"><Leaf className="h-4 w-4 text-green-500" /> Benefits for your skin:</h4>
                                                    <p className="text-sm text-muted-foreground">{rec.benefits}</p>
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
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
