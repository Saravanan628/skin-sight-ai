import { Stethoscope } from 'lucide-react';

export function Header() {
  return (
    <header className="py-4 px-6 flex items-center bg-card shadow-sm sticky top-0 z-10">
      <Stethoscope className="h-8 w-8 text-primary" />
      <h1 className="ml-3 text-2xl font-bold text-foreground font-headline">
        SkinMind
      </h1>
    </header>
  );
}
