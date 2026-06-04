"use client";

import { useApiSync } from "@/hooks/use-api-sync";

export function ApiSyncProvider({ children }: { children: React.ReactNode }) {
  useApiSync();
  return <>{children}</>;
}
