"use client";

// app/(protected)/layout.tsx

import AppShell from "./app-shell";
import { EmployeeInitializer } from "./employee-initializer";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      <EmployeeInitializer />
      {children}
    </AppShell>
  );
}
