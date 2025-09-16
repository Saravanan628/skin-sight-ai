
'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { CheckCircle, Leaf, Pill, Send, Bot, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

import type { SkinAnalysisOutput } from '@/ai/flows/skin-analysis-flow';
import { askFollowUp, type FollowUpInput } from '@/ai/flows/follow-up-flow';

type Message = {
    role: 'user' | 'bot';
    text: string;
};

function AnalysisDisplay() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [analysis, setAnalysis] = useState<SkinAnalysisOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const data = searchParams.get('data');
    if (data) {
      try {
        const decodedData = atob(data);
        const parsedData = JSON.parse(decodedData);
        setAnalysis(parsedData);
        setMessages([
          {
            role: 'bot',
            text: `Hello! I have analyzed your image and provided the details above. Do you have any follow-up questions about the "${parsedData.condition}"?`,
          }
        ]);
      } catch (e) {
        console.error("Failed to parse analysis data:", e);
        setError("Could not read analysis data. It might be corrupted.");
      }
    } else {
        setError("Analysis data not found in URL.");
    }
  }, [searchParams]);

  useEffect(() => {
    // Scroll to the bottom of the chat container when new messages are added
    if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);


  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || !analysis) return;

    const newUserMessage: Message = { role: 'user', text: userInput };
    setMessages(prev => [...prev, newUserMessage]);
    setUserInput('');
    setIsReplying(true);

    try {
        const followUpInput: FollowUpInput = {
            analysis,
            question: userInput,
            chatHistory: messages.map(m => `${m.role}: ${m.text}`).join('\n')
        };
        const response = await askFollowUp(followUpInput);
        const botMessage: Message = { role: 'bot', text: response.answer };
        setMessages(prev => [...prev, botMessage]);
    } catch (error) {
        console.error("Follow-up failed:", error);
        const errorMessage: Message = { role: 'bot', text: "I'm sorry, I encountered an error trying to answer your question. Please try again." };
        setMessages(prev => [...prev, errorMessage]);
    } finally {
        setIsReplying(false);
    }
  };

  if (error || !analysis) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center bg-background">
         <Card className="w-full max-w-lg">
            <CardHeader>
                <CardTitle>Analysis Not Found</CardTitle>
                <CardDescription>{error || "The analysis you are looking for does not exist or has expired."}</CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={() => router.push('/')}>Return to Home</Button>
            </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-background p-4 sm:p-8">
      <div className="w-full max-w-3xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-center">
            Analysis Result
          </h1>
        </header>

        <Card className="w-full shadow-lg mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">{analysis.condition}</CardTitle>
            <CardDescription>{analysis.explanation}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center gap-4">
              <div>
                <h3 className="font-semibold text-foreground">Severity</h3>
                <Badge variant={analysis.severity === 'Severe' ? 'destructive' : 'secondary'}>
                  {analysis.severity}
                </Badge>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Stage</h3>
                <Badge variant="secondary">{analysis.stage}</Badge>
              </div>
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="causes">
                <AccordionTrigger>Possible Causes</AccordionTrigger>
                <AccordionContent>
                  <ul className="grid gap-3 pl-2">
                    {analysis.possibleCauses.map((cause, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                        <p className="text-muted-foreground">{cause}</p>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="vitamins">
                <AccordionTrigger>Potential Vitamin Deficiencies</AccordionTrigger>
                <AccordionContent>
                    <ul className="grid gap-3 pl-2">
                        {analysis.vitaminDeficiencies.map((vitamin, index) => (
                        <li key={index} className="flex items-start gap-3">
                            <Pill className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                            <p className="text-muted-foreground">{vitamin}</p>
                        </li>
                        ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="remedies">
                <AccordionTrigger>Natural Remedies</AccordionTrigger>
                <AccordionContent>
                  <ul className="grid gap-3 pl-2">
                    {analysis.naturalRemedies.map((remedy, index) => (
                        <li key={index} className="flex items-start gap-3">
                            <Leaf className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                            <p className="text-muted-foreground">{remedy}</p>
                        </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push('/')} variant="outline" className="w-full">Analyze Another Image</Button>
          </CardFooter>
        </Card>
        
        <Card className="w-full shadow-lg">
          <CardHeader>
            <CardTitle>Ask a Follow-up</CardTitle>
            <CardDescription>Have questions about your analysis? Ask the AI.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col h-[400px]">
              <div ref={chatContainerRef} className="flex-1 space-y-4 p-4 overflow-y-auto rounded-md bg-muted/50">
                {messages.map((message, index) => (
                  <div key={index} className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                    {message.role === 'bot' && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback><Bot /></AvatarFallback>
                      </Avatar>
                    )}
                    <div className={`rounded-lg px-4 py-2 text-sm max-w-[80%] ${
                        message.role === 'bot'
                          ? 'bg-background text-foreground'
                          : 'bg-primary text-primary-foreground'
                      }`}
                    >
                      {message.text}
                    </div>
                    {message.role === 'user' && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback><User /></AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                 {isReplying && (
                    <div className="flex items-start gap-3">
                        <Avatar className="h-8 w-8">
                            <AvatarFallback><Bot /></AvatarFallback>
                        </Avatar>
                        <div className="rounded-lg px-4 py-2 text-sm bg-background text-foreground">
                            <div className="flex items-center space-x-1">
                                <span className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                                <span className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                                <span className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse"></span>
                            </div>
                        </div>
                    </div>
                )}
              </div>
              <Separator className="my-4" />
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <Input
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="e.g. Is this condition contagious?"
                  className="flex-1"
                  disabled={isReplying}
                />
                <Button type="submit" disabled={!userInput.trim() || isReplying}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>

        <footer className="mt-8 text-center text-sm text-muted-foreground">
            <p><strong>Disclaimer:</strong> This is an AI-generated analysis and not a substitute for professional medical advice. Please consult a qualified healthcare provider for any health concerns.</p>
        </footer>
      </div>
    </main>
  );
}

export default function AnalysisPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen flex-col items-center justify-center p-8 bg-background">Loading analysis...</div>}>
      <AnalysisDisplay />
    </Suspense>
  );
}

