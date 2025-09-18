import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AppLayout } from '@/components/AppLayout';

export const metadata: Metadata = {
  title: 'Skin-sight AI',
  description: 'Your personal AI-powered skin health journal.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppLayout>{children}</AppLayout>
        <Toaster />
      </body>
    </html>
  );
}
