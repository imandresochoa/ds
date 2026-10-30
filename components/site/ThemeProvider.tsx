'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';

/** Tema claro u oscuro (clase .dark en <html>), tooltips y avisos para toda la interfaz. */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <TooltipProvider delayDuration={0}>
        {children}
        <Toaster position="top-center" />
      </TooltipProvider>
    </NextThemesProvider>
  );
}
