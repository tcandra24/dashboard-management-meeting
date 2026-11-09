// Attendance rules used by the Attendance and Employee pages:
//  - only COMPLETED meetings count (planned/ongoing/canceled ones can't be judged yet)
//  - one record per invited participant; "attended" = the participant's "Hadir" status (set by a tap at the door, editable in the dashboard)
//  - employees are matched by name (the participant table stores "Nama Peserta")
export function inRange(date, r) {
  if (r.mode === 'all') return true;
  if (r.mode === 'month') {
    const n = new Date();
    return date.startsWith(`${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}`);
  }
  return (!r.from || date >= r.from) && (!r.to || date <= r.to);
}

export function attendanceRecords(meetings, participants, range) {
  const ok = new Map(meetings.filter((m) => m.Status === 'Completed' && inRange(m.Tanggal, range)).map((m) => [m['Meeting ID'], m]));
  return participants.filter((p) => ok.has(p['Meeting ID']))
    .map((p) => ({ name: p['Nama Peserta'], meeting: ok.get(p['Meeting ID']), taps: p['Jumlah Tap'] || 0, attended: !!p.Hadir }));
}

export function summarize(records) {
  const invited = records.length;
  const attended = records.filter((r) => r.attended).length;
  const taps = records.reduce((a, r) => a + r.taps, 0);
  return { invited, attended, taps, rate: invited ? (attended / invited) * 100 : 0 };
}

export function employeeStats(records) {
  const map = new Map();
  for (const r of records) {
    const e = map.get(r.name) || { name: r.name, invited: 0, attended: 0, taps: 0 };
    e.invited++; if (r.attended) e.attended++; e.taps += r.taps;
    map.set(r.name, e);
  }
  return [...map.values()].map((e) => ({ ...e, rate: e.invited ? (e.attended / e.invited) * 100 : 0 }));
}
