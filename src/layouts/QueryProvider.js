"use client";

import { queryClient } from '@/lib/queryClient';
import { QueryClientProvider } from '@tanstack/react-query';

export default function QueryProvider({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
