'use client';
import { useRouter } from 'next/navigation';
import Schedule from '../../components/Schedule';
import { useApp } from '../../components/AppProvider';
import { PATHS } from '../../lib/routes';

export default function SchedulePage() {
  const router = useRouter();
  const { data, load, notify } = useApp();
  return (
    <Schedule rooms={data.rooms} employees={data.employees} notify={notify}
      onCancel={() => router.push(PATHS.dashboard)}
      onCreated={async () => { await load(); router.push(PATHS.meetings); }} />
  );
}
