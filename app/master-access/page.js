'use client';
import MasterAccess from '../../components/MasterAccess';
import { useApp } from '../../components/AppProvider';

export default function MasterAccessPage() {
  const { data, load, notify } = useApp();
  return <MasterAccess access={data.access} employees={data.employees} notify={notify} reload={() => load()} />;
}
