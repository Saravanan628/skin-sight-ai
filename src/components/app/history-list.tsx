'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { HistoryItem } from '@/lib/types';
import { History, Trash2, Eye } from 'lucide-react';

interface HistoryListProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
}

export function HistoryList({ history, onSelect, onClear }: HistoryListProps) {
  return (
    <Card className="w-full sticky top-24">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <History className="w-6 h-6 text-primary" />
            Analysis History
          </CardTitle>
          {history.length > 0 && (
            <Button variant="ghost" size="icon" onClick={onClear} aria-label="Clear history">
              <Trash2 className="w-5 h-5 text-muted-foreground" />
            </Button>
          )}
        </div>
        <CardDescription>Review your past skin analyses.</CardDescription>
      </CardHeader>
      <CardContent>
        {history.length > 0 ? (
          <Accordion type="single" collapsible className="w-full">
            {history.map((item) => (
              <AccordionItem value={item.id} key={item.id}>
                <AccordionTrigger>
                  <div className="flex items-center gap-4">
                    <div className="relative w-12 h-12 rounded-md overflow-hidden shrink-0">
                      <Image src={item.image} alt="History item" layout="fill" objectFit="cover" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold capitalize">{item.result.disease}</p>
                      <p className="text-sm text-muted-foreground">{item.date}</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="flex justify-end pr-4">
                  <Button variant="outline" onClick={() => onSelect(item)}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Button>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            <p>No history yet.</p>
            <p className="text-sm">Your analyses will appear here.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
