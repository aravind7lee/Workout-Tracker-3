import React from 'react';
import { History } from 'lucide-react';
import AuthGuard from '../components/AuthGuard';
import WorkoutTimeline from '../components/WorkoutTimeline';

export default function WorkoutTimelinePage() { return <AuthGuard><main className="min-h-screen bg-black px-4 pb-28 pt-8 text-white"><header className="mx-auto mb-10 max-w-5xl"><p className="flex items-center gap-2 text-xs font-black uppercase tracking-[.18em] text-red-400"><History size={16} />Training history</p><h1 className="mt-2 text-4xl font-black">Workout timeline</h1><p className="mt-2 text-sm text-neutral-400">Every completed session, in chronological order.</p></header><WorkoutTimeline /></main></AuthGuard>; }
