'use client';
import { useRouter } from 'next/navigation';
import MeetingList from '../../components/MeetingList';
import { useApp } from '../../components/AppProvider';
import { PATHS, meetingHref } from '../../lib/routes';

export default function MeetingsPage() {
  const router = useRouter();
  const { data, load } = useApp();
  return (
    <MeetingList meetings={data.meetings} onOpen={(id) => router.push(meetingHref(id))}
      onNavigate={(p) => router.push(PATHS[p])} onRefresh={() => load()} />
  );
}
