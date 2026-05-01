import React, { useCallback, useMemo, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Flex,
  GridItem,
  HStack,
  Icon,
  Select,
  SimpleGrid,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { MdDashboard, MdDirectionsBus, MdPeople, MdSchool, MdTrendingUp } from 'react-icons/md';
import DashboardShell from '../../components/DashboardShell';
import ChartCard from '../../components/ChartCard';
import DataTable, { type DataTableColumn, type SortDirection } from '../../components/DataTable';
import StatsCard from '../../components/StatsCard';
import AreaChart from '../../components/charts/v2/AreaChart';
import BarChart from '../../components/charts/v2/BarChart';
import DonutChart from '../../components/charts/v2/DonutChart';
import MixedChart from '../../components/charts/v2/MixedChart';
import RadialAttendance from '../../components/charts/v2/RadialAttendance';
import useChartData, { type DateRangePreset } from '../../hooks/useChartData';

type DashboardSeries = {
  monthly: {
    categories: string[];
    series: any;
  };
  classCounts: {
    categories: string[];
    series: any;
  };
  attendanceToday: {
    value: number;
  };
  busTrips: {
    categories: string[];
    series: any;
    donut: { labels: string[]; series: number[] };
  };
  visitorInsights: {
    categories: string[];
    series: any;
  };
};

type StudentRow = {
  id: number;
  name: string;
  cls: string;
  grade: number;
};

function buildLabels(range: DateRangePreset) {
  if (range === '7') return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  if (range === '30') return ['W1', 'W2', 'W3', 'W4'];
  return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
}

function generateDashboardData(range: DateRangePreset): DashboardSeries {
  const cats = buildLabels(range);

  const online = cats.map((_, i) => (range === '365' ? 120 + i * 8 : range === '30' ? 70 + i * 9 : 14 + i * 3));
  const offline = cats.map((_, i) => (range === '365' ? 80 + i * 6 : range === '30' ? 55 + i * 6 : 9 + i * 2));
  const cumulative = online.map((v, idx) => v + offline[idx]);

  const monthlySeries = [
    { name: 'Online', type: 'column', data: online },
    { name: 'Offline', type: 'column', data: offline },
    { name: 'Total', type: 'line', data: cumulative },
  ];

  const classCats = ['1-A', '1-B', '2-A', '2-B', '3-A', '3-B'];
  const boys = [24, 21, 28, 25, 26, 22];
  const girls = [20, 18, 26, 23, 24, 20];

  const busCats = buildLabels('7');
  const trips = busCats.map((_, i) => 8 + (i % 3) * 3);

  const visitorCats = cats;
  const web = visitorCats.map((_, i) => (range === '365' ? 1200 + i * 120 : range === '30' ? 420 + i * 60 : 160 + i * 20));
  const mobile = visitorCats.map((_, i) => (range === '365' ? 900 + i * 95 : range === '30' ? 330 + i * 50 : 120 + i * 16));
  const kiosk = visitorCats.map((_, i) => (range === '365' ? 400 + i * 40 : range === '30' ? 170 + i * 25 : 60 + i * 10));

  return {
    monthly: { categories: cats, series: monthlySeries },
    classCounts: { categories: classCats, series: [{ name: 'Boys', data: boys }, { name: 'Girls', data: girls }] },
    attendanceToday: { value: range === '7' ? 96 : range === '30' ? 93 : 91 },
    busTrips: {
      categories: busCats,
      series: [{ name: 'Trips', data: trips }],
      donut: { labels: ['Operational', 'Maintenance'], series: [18, 2] },
    },
    visitorInsights: {
      categories: visitorCats,
      series: [
        { name: 'Web', data: web },
        { name: 'Mobile', data: mobile },
        { name: 'Kiosk', data: kiosk },
      ],
    },
  };
}

function exportSeriesToCSV(filename: string, categories: string[], series: Array<{ name: string; data: number[] }>) {
  const header = ['Category', ...series.map((s) => s.name)];
  const rows = categories.map((c, idx) => [c, ...series.map((s) => String(s.data?.[idx] ?? ''))]);
  const csv = [header, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function ChartActions({
  range,
  onRange,
  onExport,
}: {
  range: DateRangePreset;
  onRange: (r: DateRangePreset) => void;
  onExport: () => void;
}) {
  return (
    <HStack spacing={2}>
      <Select size="sm" value={range} onChange={(e) => onRange(e.target.value as DateRangePreset)} w="120px" aria-label="Date range">
        <option value="7">Last 7</option>
        <option value="30">Last 30</option>
        <option value="365">Last 365</option>
      </Select>
      <Button size="sm" variant="outline" onClick={onExport} aria-label="Export CSV">
        Export CSV
      </Button>
    </HStack>
  );
}

async function mockFetchStudents(
  pageIndex: number,
  pageSize: number,
  search: string,
  sortId?: string,
  sortDir?: SortDirection
): Promise<{ rows: StudentRow[]; total: number }> {
  const all: StudentRow[] = Array.from({ length: 137 }).map((_, i) => ({
    id: i + 1,
    name: `Student ${i + 1}`,
    cls: ['1-A', '1-B', '2-A', '2-B', '3-A'][i % 5],
    grade: 55 + ((i * 7) % 46),
  }));

  const filtered = all.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()) || r.cls.toLowerCase().includes(search.toLowerCase()));

  const sorted = [...filtered].sort((a: any, b: any) => {
    if (!sortId) return 0;
    const av = a[sortId];
    const bv = b[sortId];
    if (av === bv) return 0;
    const dir = sortDir === 'desc' ? -1 : 1;
    return av > bv ? dir : -dir;
  });

  const start = pageIndex * pageSize;
  const page = sorted.slice(start, start + pageSize);

  await new Promise((r) => setTimeout(r, 300));
  return { rows: page, total: sorted.length };
}

export default function AdminDashboardPage() {
  const cardBg = useColorModeValue('white', 'gray.900');
  const subtle = useColorModeValue('gray.600', 'gray.400');

  const {
    data: chartData,
    loading: chartLoading,
    range,
    setRange,
  } = useChartData<DashboardSeries>(async (r) => {
    await new Promise((res) => setTimeout(res, 250));
    return generateDashboardData(r);
  }, '30');

  const kpis = useMemo(() => {
    return [
      { title: 'Total Students', value: 1240, delta: '+5% vs last period', icon: MdPeople, sparkline: [900, 940, 980, 1030, 1100, 1170, 1240] },
      { title: 'Total Teachers', value: 82, delta: '+2% vs last period', icon: MdSchool, sparkline: [70, 72, 75, 78, 80, 81, 82] },
      { title: 'Active Buses', value: 18, delta: 'All operational', icon: MdDirectionsBus, sparkline: [16, 17, 17, 18, 18, 18, 18] },
      { title: "Today's Attendance", value: `${chartData?.attendanceToday.value ?? 0}%`, delta: '+1% vs yesterday', icon: MdTrendingUp, sparkline: [88, 90, 91, 92, 93, 94, chartData?.attendanceToday.value ?? 0] },
    ];
  }, [chartData?.attendanceToday.value]);

  const navItems = useMemo(
    () => [
      { label: 'Dashboard', icon: MdDashboard, href: '#/admin/dashboard' },
      { label: 'Students', icon: MdPeople, href: '#/admin/students' },
      { label: 'Teachers', icon: MdSchool, href: '#/admin/teachers' },
      { label: 'Transport', icon: MdDirectionsBus, href: '#/admin/transport' },
    ],
    []
  );

  const [studentPage, setStudentPage] = useState(0);
  const [studentSize, setStudentSize] = useState(10);
  const [studentSearch, setStudentSearch] = useState('');
  const [studentSortId, setStudentSortId] = useState<string | undefined>('grade');
  const [studentSortDir, setStudentSortDir] = useState<SortDirection>('desc');
  const [studentLoading, setStudentLoading] = useState(false);
  const [studentTotal, setStudentTotal] = useState(0);
  const [studentRows, setStudentRows] = useState<StudentRow[]>([]);

  const loadStudents = useCallback(async () => {
    setStudentLoading(true);
    try {
      const res = await mockFetchStudents(studentPage, studentSize, studentSearch, studentSortId, studentSortDir);
      setStudentRows(res.rows);
      setStudentTotal(res.total);
    } finally {
      setStudentLoading(false);
    }
  }, [studentPage, studentSearch, studentSize, studentSortDir, studentSortId]);

  React.useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const studentColumns: Array<DataTableColumn<StudentRow>> = useMemo(
    () => [
      { id: 'name', header: 'Student', sortable: true },
      { id: 'cls', header: 'Class', sortable: true },
      {
        id: 'grade',
        header: 'Grade',
        sortable: true,
        isNumeric: true,
        cell: (r) => (
          <HStack justify="flex-end">
            <Text fontWeight={800}>{r.grade}%</Text>
            <Badge colorScheme={r.grade >= 85 ? 'green' : r.grade >= 70 ? 'orange' : 'red'}>{r.grade >= 85 ? 'A' : r.grade >= 70 ? 'B' : 'C'}</Badge>
          </HStack>
        ),
      },
    ],
    []
  );

  const mixedOptions = useMemo(
    () => ({
      chart: { stacked: true },
      stroke: { width: [0, 0, 3] },
      plotOptions: { bar: { borderRadius: 6, columnWidth: '46%' } },
      legend: { position: 'top' },
      tooltip: { shared: true, intersect: false },
    }),
    []
  );

  return (
    <DashboardShell title="Admin Dashboard" navItems={navItems} user={{ name: 'Admin', email: 'admin@school.com' }}>
      <Text fontSize="sm" color={subtle} mb={4}>
        Welcome back! Here’s an overview of your school management system.
      </Text>

      <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing={4} mb={6}>
        {kpis.map((k) => (
          <StatsCard key={k.title} title={k.title} subtitle="" value={k.value} delta={k.delta} icon={k.icon as any} sparkline={k.sparkline} ariaLabel={`${k.title} sparkline`} />
        ))}
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={5}>
        <GridItem colSpan={{ base: 1, lg: 2 }}>
          <ChartCard
            title="Monthly Summary"
            subtitle="Online vs offline admissions with total trend"
            right={
              <ChartActions
                range={range}
                onRange={setRange}
                onExport={() => {
                  const cats = chartData?.monthly.categories || [];
                  const s = (chartData?.monthly.series || []).filter((x: any) => x.type !== 'line');
                  exportSeriesToCSV('monthly_summary.csv', cats, s);
                }}
              />
            }
            ariaLabel="Monthly Summary chart"
          >
            <Box bg={cardBg}>
              <MixedChart
                ariaLabel="Monthly Summary mixed chart"
                categories={chartData?.monthly.categories || []}
                series={chartData?.monthly.series || []}
                height={340}
                options={mixedOptions as any}
              />
              {chartLoading ? <Text fontSize="xs">Loading...</Text> : null}
            </Box>
          </ChartCard>
        </GridItem>

        <GridItem colSpan={{ base: 1, lg: 1 }}>
          <ChartCard
            title="Today's Attendance"
            subtitle="Attendance % for today"
            right={<ChartActions range={range} onRange={setRange} onExport={() => exportSeriesToCSV('attendance_today.csv', ['Today'], [{ name: 'Attendance', data: [chartData?.attendanceToday.value || 0] }])} />}
            ariaLabel="Today's Attendance"
          >
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} alignItems="center">
              <RadialAttendance ariaLabel="Attendance radial" value={chartData?.attendanceToday.value || 0} height={260} label="Attendance" />
              <Box>
                <HStack spacing={2} mb={2}>
                  <Badge colorScheme="green">Present</Badge>
                  <Text fontSize="sm">{chartData?.attendanceToday.value || 0}%</Text>
                </HStack>
                <HStack spacing={2} mb={2}>
                  <Badge colorScheme="red">Absent</Badge>
                  <Text fontSize="sm">{100 - (chartData?.attendanceToday.value || 0)}%</Text>
                </HStack>
                <Text fontSize="xs" color={subtle}>
                  Range selector updates the attendance index.
                </Text>
              </Box>
            </SimpleGrid>
          </ChartCard>
        </GridItem>

        <GridItem colSpan={{ base: 1, lg: 1 }}>
          <ChartCard
            title="Student Growth"
            subtitle="Class-wise student counts"
            right={<ChartActions range={range} onRange={setRange} onExport={() => exportSeriesToCSV('class_counts.csv', chartData?.classCounts.categories || [], chartData?.classCounts.series || [])} />}
            ariaLabel="Student Growth"
          >
            <BarChart
              ariaLabel="Class-wise student counts"
              categories={chartData?.classCounts.categories || []}
              series={chartData?.classCounts.series || []}
              height={280}
              stacked={false}
              options={{ legend: { position: 'top' } } as any}
            />
          </ChartCard>
        </GridItem>

        <GridItem colSpan={{ base: 1, lg: 1 }}>
          <ChartCard
            title="Bus Status"
            subtitle="Trips per day + operational breakdown"
            right={<ChartActions range={range} onRange={setRange} onExport={() => exportSeriesToCSV('bus_trips.csv', chartData?.busTrips.categories || [], chartData?.busTrips.series || [])} />}
            ariaLabel="Bus Status"
          >
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <BarChart ariaLabel="Daily bus trips" categories={chartData?.busTrips.categories || []} series={chartData?.busTrips.series || []} height={220} options={{ legend: { show: false } } as any} />
              <DonutChart
                ariaLabel="Operational vs maintenance"
                labels={chartData?.busTrips.donut.labels || []}
                series={chartData?.busTrips.donut.series || []}
                height={220}
              />
            </SimpleGrid>
          </ChartCard>
        </GridItem>

        <GridItem colSpan={{ base: 1, lg: 1 }}>
          <ChartCard
            title="Visitor Insights"
            subtitle="Web, mobile and kiosk usage"
            right={<ChartActions range={range} onRange={setRange} onExport={() => exportSeriesToCSV('visitor_insights.csv', chartData?.visitorInsights.categories || [], chartData?.visitorInsights.series || [])} />}
            ariaLabel="Visitor Insights"
          >
            <AreaChart ariaLabel="Visitor insights area chart" categories={chartData?.visitorInsights.categories || []} series={chartData?.visitorInsights.series || []} height={280} />
          </ChartCard>
        </GridItem>

        <GridItem colSpan={{ base: 1, lg: 3 }}>
          <ChartCard
            title="Students"
            subtitle="Server-side pagination, search and sorting (mock API)"
            right={
              <Button
                size="sm"
                variant="outline"
                onClick={() => exportSeriesToCSV('students_export.csv', studentRows.map((r) => String(r.id)), [{ name: 'grade', data: studentRows.map((r) => r.grade) }])}
              >
                Export CSV
              </Button>
            }
            ariaLabel="Students table"
          >
            <DataTable<StudentRow>
              ariaLabel="Students data table"
              columns={studentColumns}
              data={studentRows}
              loading={studentLoading}
              search={{ value: studentSearch, onChange: (v) => { setStudentSearch(v); setStudentPage(0); } }}
              sort={{
                columnId: studentSortId,
                direction: studentSortDir,
                onChange: (id, dir) => {
                  setStudentSortId(id);
                  setStudentSortDir(dir);
                  setStudentPage(0);
                },
              }}
              pagination={{
                pageIndex: studentPage,
                pageSize: studentSize,
                total: studentTotal,
                onPageChange: setStudentPage,
                onPageSizeChange: (s) => { setStudentSize(s); setStudentPage(0); },
              }}
              emptyText="No students found."
            />
          </ChartCard>
        </GridItem>
      </SimpleGrid>
    </DashboardShell>
  );
}
