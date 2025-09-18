
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft, Lightbulb, ShoppingBag, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { type JournalEntry } from '../analysis/page';
import { recommendProducts, type ProductRecommendationOutput } from '@/ai/flows/product-recommendation-flow';

export default function ProductFinderPage() {
    const [journal, setJournal] = useState<JournalEntry[]>([]);
    const [selectedJournalId, setSelectedJournalId] = useState<string | null>(null);
    const [productDescription, setProductDescription] = useState('');
    const [isFinding, setIsFinding] = useState(false);
    const [recommendations, setRecommendations] = useState<ProductRecommendationOutput | null>(null);

    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        const storedJournal = JSON.parse(localStorage.getItem('skinJournal') || '[]');
        if (storedJournal.length === 0) {
            toast({
                title: "Journal is Empty",
                description: "You must have at least one journal entry to use the product finder.",
                variant: "destructive"
            });
            router.push('/journal');
        } else {
            setJournal(storedJournal);
            setSelectedJournalId(storedJournal[0].id); // Default to the latest entry
        }
    }, [router, toast]);

    const handleFindProductsClick = async () => {
        if (!productDescription.trim() || !selectedJournalId) {
            toast({
                title: "Missing Information",
                description: "Please select a journal entry and describe the product you're looking for.",
                variant: "destructive",
            });
            return;
        }

        const selectedEntry = journal.find(entry => entry.id === selectedJournalId);
        if (!selectedEntry) return;

        setIsFinding(true);
        setRecommendations(null);
        try {
            const result = await recommendProducts({
                productDescription: productDescription,
                skinCondition: selectedEntry.analysis.condition,
            });
            setRecommendations(result);
        } catch (error) {
            console.error("Product recommendation failed:", error);
            toast({
                title: "Recommendation Failed",
                description: "Could not get product recommendations. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsFinding(false);
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
                        AI Product Finder
                    </h1>
                </header>

                <Card className="w-full shadow-lg">
                    <CardHeader>
                        <CardTitle>Find Skincare Products</CardTitle>
                        <CardDescription>
                            Describe the type of product you need, and our AI will suggest options suitable for your condition.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="journal-entry">Base recommendation on which condition?</Label>
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
                        
                         <div className="grid gap-2">
                            <Label htmlFor="notes">What are you looking for?</Label>
                            <Textarea 
                                id="notes"
                                placeholder="e.g., A gentle, non-foaming daily cleanser for sensitive skin."
                                value={productDescription}
                                onChange={(e) => setProductDescription(e.target.value)}
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                         <Button
                            onClick={handleFindProductsClick}
                            disabled={!productDescription.trim() || !selectedJournalId || isFinding}
                            className="w-full"
                            size="lg"
                        >
                            {isFinding ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Finding...</>
                            ) : <><ShoppingBag className="mr-2 h-4 w-4" />'Find Products'</> }
                        </Button>
                    </CardFooter>
                </Card>

                {recommendations && (
                    <Card className="w-full shadow-lg mt-6">
                        <CardHeader>
                            <CardTitle>AI Recommendations</CardTitle>
                            <CardDescription>
                                Here are a few products that might work for you based on your request.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                           {recommendations.recommendations.map((rec, index) => (
                             <Card key={index} className="bg-muted/50">
                               <CardHeader className="flex flex-row justify-between items-start">
                                 <CardTitle className="text-lg flex items-center gap-3">
                                   <ShoppingBag className="h-5 w-5 text-primary" />
                                   {rec.productName}
                                  </CardTitle>
                                    <Button asChild variant="outline" size="sm">
                                      <Link href={rec.purchaseLink} target="_blank">
                                        View Product
                                        <ExternalLink className="ml-2 h-4 w-4" />
                                      </Link>
                                    </Button>
                               </CardHeader>
                               <CardContent>
                                  <p className="text-sm text-muted-foreground flex items-start gap-3">
                                    <Lightbulb className="h-4 w-4 mt-1 flex-shrink-0 text-amber-500" />
                                    <span className="flex-1"><span className="font-semibold text-foreground/90">Reason:</span> {rec.reason}</span>
                                  </p>
                               </CardContent>
                             </Card>
                           ))}
                        </CardContent>
                         <CardFooter>
                            <p className="text-xs text-muted-foreground text-center w-full">Disclaimer: These AI-generated recommendations are for informational purposes. Always patch-test new products and verify information with the seller.</p>
                         </CardFooter>
                    </Card>
                )}
            </div>
        </main>
    );
}
