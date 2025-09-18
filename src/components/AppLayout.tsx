
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Scan, BookOpen, ScanLine, ShoppingBag, Bot, PanelLeft } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

const menuItems = [
  { href: '/', label: 'New Analysis', icon: Scan },
  { href: '/journal', label: 'My Skin Journal', icon: BookOpen },
  { href: '/scanner', label: 'Ingredient Scanner', icon: ScanLine },
  { href: '/product-finder', label: 'Product Finder', icon: ShoppingBag },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Avatar className="size-8">
              <AvatarFallback>
                <Bot />
              </AvatarFallback>
            </Avatar>
            <h1 className="text-lg font-semibold tracking-tight">Skin-sight AI</h1>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={{ children: item.label }}
                >
                  <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
            {/* Can add footer content here if needed */}
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-12 items-center justify-between border-b bg-background px-4 md:hidden">
            <div className="flex items-center gap-2">
                <Avatar className="size-7">
                  <AvatarFallback>
                    <Bot />
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-md font-semibold tracking-tight">Skin-sight AI</h2>
            </div>
            <SidebarTrigger asChild>
                <Button variant="ghost" size="icon">
                    <PanelLeft />
                </Button>
            </SidebarTrigger>
        </header>
        {children}
    </SidebarInset>
    </SidebarProvider>
  );
}
