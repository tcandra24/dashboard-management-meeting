// One place for every page link of the dashboard.
export const PATHS = {
  dashboard: '/',
  schedule: '/schedule',
  meetings: '/meetings',
  attendance: '/attendance',
  master: '/master-access',
};

// Meeting IDs contain "/" (e.g. MT/26/ZHZI01), so they travel in the query string.
const e = encodeURIComponent;
export const meetingHref = (id, from) => `/meetings/detail?id=${e(id)}${from ? `&from=${e(from)}` : ''}`;
export const employeeHref = (name, from) => `/attendance/employee?name=${e(name)}${from ? `&from=${e(from)}` : ''}`;

// "from" is where the Back button returns to. Only in-app paths are accepted.
export const safeFrom = (v) => (v && v.startsWith('/') && !v.startsWith('//') ? v : null);
