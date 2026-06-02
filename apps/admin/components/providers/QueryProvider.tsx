// components/providers/QueryProvider.tsx

"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  // useState ensures a new QueryClient is created per user session
  // not shared across requests like a module-level variable would be
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Treat fetched data as fresh for 60s so navigating back to a screen
            // shows cached data INSTANTLY instead of a spinner + refetch.
            staleTime: 60_000,
            // Keep cached data around for 5 min after a screen unmounts.
            gcTime: 5 * 60_000,
            // Admin sits in a background tab a lot; don't refetch on every focus.
            refetchOnWindowFocus: false,
            // Fail fast rather than retrying 3× (the default) on a dead endpoint.
            retry: 1,
          },
          mutations: {
            retry: 0,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}