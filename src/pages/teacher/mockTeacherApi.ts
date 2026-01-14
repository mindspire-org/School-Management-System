import type { DateRangePreset } from '../../hooks/useChartData';
import type { HeatmapSeries } from '../../components/charts/v2/HeatmapActivity';
import type { SortDirection } from '../../components/DataTable';

export type TeacherDashboardResponse = {
  performancePerClass: {
    categories: string[];
    series: Array<{ name: string; data: number[] }>;
  };
  weeklyEngagement: {
    series: HeatmapSeries[];
  };
  attendance: {
    trend: number[];
    average: number;
  };
};

export type TeacherListRow = {
  id: number;
  name: string;
  email: string;
  subject: string;
  department: string;
  status: 'active' | 'on leave' | 'resigned';
  attendanceLast10: number[];
  avgAttendance: number;
  avgPerformance: number;
};

export type TeacherListQuery = {
  pageIndex: number;
  pageSize: number;
  search: string;
  sortId?: keyof TeacherListRow;
  sortDir?: SortDirection;
  filters?: Record<string, string>;
};

export type TeacherListResponse = {
  rows: TeacherListRow[];
  total: number;
};

export type TeacherProfileResponse = {
  id: number;
  name: string;
  email: string;
  department: string;
  subject: string;
  mixedChart: {
    categories: string[];
    series: Array<{ name: string; type: 'column' | 'line'; data: number[] }>;
  };
};

function clampPct(v: number) {
  return Math.max(0, Math.min(100, Math.round(v)));
}

function buildRangeLabels(range: DateRangePreset) {
  if (range === '7') return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  if (range === '30') return ['W1', 'W2', 'W3', 'W4'];
  return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
}

function makeHeatmapSeries(): HeatmapSeries[] {
  const hours = ['8 AM', '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM'];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map((d, di) => ({
    name: d,
    data: hours.map((h, hi) => ({
      x: h,
      y: clampPct(12 + di * 6 + ((hi % 3) * 18) + (di === 5 || di === 6 ? -12 : 0)),
    })),
  }));
}

function seededSeries(seed: number, len: number, base: number, step: number) {
  return Array.from({ length: len }).map((_, i) => base + ((seed + i * step) % 23) * 1.7);
}

export async function mockFetchTeacherDashboard(range: DateRangePreset): Promise<TeacherDashboardResponse> {
  const classCats = ['7-A', '7-B', '8-A', '8-B', '9-A', '9-B'];
  const math = classCats.map((_, i) => clampPct(68 + i * 3 + (range === '365' ? 2 : 0)));
  const english = classCats.map((_, i) => clampPct(62 + i * 4 + (range === '30' ? 2 : 0)));
  const science = classCats.map((_, i) => clampPct(65 + i * 2 + (range === '7' ? 3 : 0)));

  const attendanceTrend = buildRangeLabels(range).map((_, i) => clampPct((range === '365' ? 90 : range === '30' ? 92 : 94) - (i % 3) + (i % 2 === 0 ? 1 : 0)));
  const avgAttendance = Math.round(attendanceTrend.reduce((a, b) => a + b, 0) / Math.max(1, attendanceTrend.length));

  await new Promise((r) => setTimeout(r, 250));
  return {
    performancePerClass: {
      categories: classCats,
      series: [
        { name: 'Math', data: math },
        { name: 'English', data: english },
        { name: 'Science', data: science },
      ],
    },
    weeklyEngagement: {
      series: makeHeatmapSeries(),
    },
    attendance: {
      trend: attendanceTrend,
      average: avgAttendance,
    },
  };
}

function allTeachers(): TeacherListRow[] {
  const subjects = ['Math', 'English', 'Science', 'Computer'];
  const depts = ['Primary', 'Middle', 'Secondary'];
  const statuses: Array<TeacherListRow['status']> = ['active', 'on leave', 'resigned'];

  return Array.from({ length: 83 }).map((_, i) => {
    const subject = subjects[i % subjects.length];
    const department = depts[i % depts.length];
    const status = statuses[i % statuses.length];
    const attendanceLast10 = seededSeries(i + 3, 10, 86, 5).map((v) => clampPct(v));
    const avgAttendance = Math.round(attendanceLast10.reduce((a, b) => a + b, 0) / attendanceLast10.length);
    const avgPerformance = clampPct(64 + (i % 11) * 3 + (subject === 'Computer' ? 6 : 0));

    return {
      id: i + 1,
      name: `Teacher ${i + 1}`,
      email: `teacher${i + 1}@school.com`,
      subject,
      department,
      status,
      attendanceLast10,
      avgAttendance,
      avgPerformance,
    };
  });
}

export async function mockFetchTeacherList(query: TeacherListQuery): Promise<TeacherListResponse> {
  const { pageIndex, pageSize, search, sortId, sortDir, filters } = query;

  const term = (search || '').trim().toLowerCase();
  let rows = allTeachers();

  if (filters?.subject) rows = rows.filter((r) => r.subject === filters.subject);
  if (filters?.department) rows = rows.filter((r) => r.department === filters.department);
  if (filters?.status) rows = rows.filter((r) => r.status === filters.status);

  if (term) {
    rows = rows.filter((r) => r.name.toLowerCase().includes(term) || r.email.toLowerCase().includes(term));
  }

  if (sortId) {
    rows = [...rows].sort((a: any, b: any) => {
      const av = a[sortId];
      const bv = b[sortId];
      if (av === bv) return 0;
      const dir = sortDir === 'desc' ? -1 : 1;
      return av > bv ? dir : -dir;
    });
  }

  const total = rows.length;
  const start = pageIndex * pageSize;
  const paged = rows.slice(start, start + pageSize);

  await new Promise((r) => setTimeout(r, 280));
  return { rows: paged, total };
}

export async function mockFetchTeacherProfile(id: number, range: DateRangePreset): Promise<TeacherProfileResponse> {
  const base = allTeachers().find((t) => t.id === id) || allTeachers()[0];
  const categories = buildRangeLabels(range);

  const assignments = categories.map((_, i) => Math.round((range === '365' ? 18 : range === '30' ? 7 : 4) + (i % 3) * 2));
  const quizzes = categories.map((_, i) => Math.round((range === '365' ? 12 : range === '30' ? 5 : 3) + (i % 2) * 2));
  const avgScore = categories.map((_, i) => clampPct(70 + (i % 4) * 4 + (base.subject === 'Computer' ? 4 : 0)));

  await new Promise((r) => setTimeout(r, 220));
  return {
    id: base.id,
    name: base.name,
    email: base.email,
    department: base.department,
    subject: base.subject,
    mixedChart: {
      categories,
      series: [
        { name: 'Assignments', type: 'column', data: assignments },
        { name: 'Quizzes', type: 'column', data: quizzes },
        { name: 'Avg Score', type: 'line', data: avgScore },
      ],
    },
  };
}
