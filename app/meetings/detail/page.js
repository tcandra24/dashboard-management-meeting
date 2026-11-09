'use client';
import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import MeetingDetail from '../../../components/MeetingDetail';
import { useApp } from '../../../components/AppProvider';
import { useLang } from '../../../components/LanguageProvider';
import { PATHS, employeeHref, meetingHref, safeFrom } from '../../../lib/routes';

// /meetings/detail?id=MT/26/ZHZI01   (optional &from=<page to return to>)
function DetailView() {
  const { t } = useLang();
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get('id');
  const from = safeFrom(params.get('from'));
  const { data, load, notify } = useApp();
  const meeting = data.meetings.find((m) => m['Meeting ID'] === id);

  // the meeting was deleted (or the link is wrong)
  useEffect(() => { if (!meeting) router.replace(PATHS.meetings); }, [meeting, router]);
  if (!meeting) return null;

  return (
    <MeetingDetail key={id} meeting={meeting} participants={data.participants} employees={data.employees}
      rooms={data.rooms} notify={notify} reload={load}
      onOpenEmployee={(name) => router.push(employeeHref(name, meetingHref(id)))}
      onBack={() => router.push(from || PATHS.meetings)}
      backLabel={from?.startsWith('/attendance/employee') ? t('det.backEmployee') : undefined}
      onDeleted={async () => { await load(); router.replace(PATHS.meetings); }} />
  );
}

export default function Page() {
  return <Suspense fallback={null}><DetailView /></Suspense>;
}
