'use client';
import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import EmployeeDetail from '../../../components/EmployeeDetail';
import { useApp } from '../../../components/AppProvider';
import { useLang } from '../../../components/LanguageProvider';
import { PATHS, employeeHref, meetingHref, safeFrom } from '../../../lib/routes';

// /attendance/employee?name=Andi Pratama   (optional &from=<page to return to>)
function EmployeeView() {
  const { t } = useLang();
  const router = useRouter();
  const params = useSearchParams();
  const name = params.get('name');
  const from = safeFrom(params.get('from'));
  const { data, attRange } = useApp();
  useEffect(() => { if (!name) router.replace(PATHS.attendance); }, [name, router]);
  if (!name) return null;

  return (
    <EmployeeDetail key={name} name={name} meetings={data.meetings} participants={data.participants}
      employees={data.employees} initialRange={attRange}
      onBack={() => router.push(from || PATHS.attendance)}
      backLabel={from?.startsWith('/meetings/detail') ? t('emp.backMeeting') : undefined}
      onOpenMeeting={(id) => router.push(meetingHref(id, employeeHref(name)))} />
  );
}

export default function Page() {
  return <Suspense fallback={null}><EmployeeView /></Suspense>;
}
