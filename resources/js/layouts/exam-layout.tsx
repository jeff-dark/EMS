import { AppShell } from '@/components/app-shell';
import { type ReactNode } from 'react';

interface ExamLayoutProps {
  children: ReactNode;
}

// Minimal layout for exam session: no sidebar, no breadcrumbs/top nav
export default function ExamLayout({ children }: ExamLayoutProps) {
  return (
    <AppShell variant="header">
      <div className="min-h-screen w-full bg-background">
        {children}
      </div>
    </AppShell>
  );
}
