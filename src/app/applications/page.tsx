'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import KanbanBoard from '@/components/KanbanBoard';

export default function ApplicationsPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <KanbanBoard />
      </main>
    </div>
  );
}

