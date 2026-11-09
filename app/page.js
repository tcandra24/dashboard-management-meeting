'use client';
import { useRouter } from 'next/navigation';
import Dashboard from '../components/Dashboard';
import { useApp } from '../components/AppProvider';
import { PATHS, meetingHref } from '../lib/routes';

export default function DashboardPage() {
  const router = useRouter();
  const { data, load } = useApp();
  return (
    <Dashboard meetings={data.meetings} onOpen={(id) => router.push(meetingHref(id))}
      onNavigate={(p) => router.push(PATHS[p])} onRefresh={() => load()} />
  );
}
