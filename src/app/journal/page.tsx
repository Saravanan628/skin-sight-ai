
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Home, Trash2 } from 'lucide-react';
import { type JournalEntry } from '../analysis/page';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


export default function JournalPage() {
    const [journal, setJournal] = useState<JournalEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        try {
            const storedJournal = JSON.parse(localStorage.getItem('skinJournal') || '[]');
            setJournal(storedJournal);
        } catch (error) {
            console.error("Failed to parse journal from localStorage", error);
            setJournal([]);
        }
        setIsLoading(false);
    }, []);

    const handleDelete = (id: string) => {
        const updatedJournal = journal.filter(entry => entry.id !== id);
        localStorage.setItem('skinJournal', JSON.stringify(updatedJournal));
        setJournal(updatedJournal);
    };
    
    const handleDeleteAll = () => {
        localStorage.removeItem('skinJournal');
        setJournal([]);
    };

    if (isLoading) {
        return <div className="flex flex-1 items-center justify-center p-8 bg-background">Loading journal...</div>
    }

    return (
        <main className="flex flex-1 flex-col p-4 sm:p-8">
            <div className="w-full max-w-4xl mx-auto">
                 <header className="mb-8 flex justify-between items-center gap-4">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-left flex-1">
                        My Skin Journal
                    </h1>
                     <div className="flex items-center gap-2">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" disabled={journal.length === 0}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete All
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete all your journal entries.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteAll}>Continue</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>

                </header>

                {journal.length === 0 ? (
                    <Card className="text-center shadow-lg">
                        <CardHeader>
                            <CardTitle>Your Journal is Empty</CardTitle>
                            <CardDescription>You haven't saved any skin analyses yet. Scan your skin to get started.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button onClick={() => router.push('/')}>
                                <Home className="mr-2 h-4 w-4" />
                                Go to Home
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6">
                        {journal.map((entry) => (
                            <Card key={entry.id} className="shadow-lg overflow-hidden">
                               <CardHeader className="flex flex-row justify-between items-start bg-muted/50 p-4">
                                    <div className="grid gap-1">
                                        <CardTitle className="text-xl">{entry.analysis.condition}</CardTitle>
                                        <CardDescription>
                                            {format(new Date(entry.date), "MMMM d, yyyy 'at' h:mm a")}
                                        </CardDescription>
                                    </div>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                             <Button variant="ghost" size="icon">
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                            <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This will permanently delete this journal entry from {format(new Date(entry.date), "MMMM d")}.
                                            </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDelete(entry.id)}>Delete</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>

                                </CardHeader>
                                <CardContent className="p-4 grid md:grid-cols-3 gap-6">
                                     <div className="md:col-span-1">
                                        <div className="relative w-full aspect-square rounded-md overflow-hidden border mb-4">
                                            <Image src={entry.photoDataUri} alt={`Analysis from ${entry.date}`} fill className="object-cover" />
                                        </div>
                                     </div>
                                     <div className="md:col-span-2 grid gap-4">
                                        <div>
                                            <h4 className="font-semibold mb-2">Symptom Severity</h4>
                                            <div className="flex items-center gap-2">
                                                <div className="w-full bg-muted rounded-full h-2.5">
                                                    <div className="bg-primary h-2.5 rounded-full" style={{ width: `${entry.symptomSeverity * 10}%` }}></div>
                                                </div>
                                                <Badge variant="outline">{entry.symptomSeverity}/10</Badge>
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold mb-1">Notes</h4>
                                            <p className="text-sm text-muted-foreground p-3 bg-muted/30 rounded-md border">
                                                {entry.notes || "No notes added."}
                                            </p>
                                        </div>
                                         <div>
                                            <h4 className="font-semibold mb-1">AI Diagnosis</h4>
                                            <p className="text-sm text-muted-foreground">{entry.analysis.explanation}</p>
                                        </div>
                                     </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </main>
    )
}
