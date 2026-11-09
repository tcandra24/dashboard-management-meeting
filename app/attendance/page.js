'use client';
import { useRouter } from 'next/navigation';
import Attendance from '../../components/Attendance';
import { useApp } from '../../components/AppProvider';
import { employeeHref } from '../../lib/routes';

export default function AttendancePage() {
  const router = useRouter();
  const { data, load, attRange, setAttRange } = useApp();
  return (
    <Attendance meetings={data.meetings} participants={data.participants} employees={data.employees}
      range={attRange} onRangeChange={setAttRange}
      onOpenEmployee={(name) => router.push(employeeHref(name))} onRefresh={() => load()} />
  );
}
