import React, { useMemo } from 'react';
import {
  Box,
  GridItem,
  HStack,
  Select,
  SimpleGrid,
  Text,
  useColorModeValue,
  Button,
} from '@chakra-ui/react';
import { MdDashboard, MdGroup, MdSchool, MdTrendingUp } from 'react-icons/md';
import DashboardShell from '../../components/DashboardShell';
import ChartCard from '../../components/ChartCard';
import BarChart from '../../components/charts/v2/BarChart';
import HeatmapActivity from '../../components/charts/v2/HeatmapActivity';
import RadialAttendance from '../../components/charts/v2/RadialAttendance';
import Sparkline from '../../components/charts/v2/Sparkline';
import MixedChart from '../../components/charts/v2/MixedChart';
import useChartData, { type DateRangePreset } from '../../hooks/useChartData';
import { mockFetchTeacherDashboard } from './mockTeacherApi';

type TeacherDashboardVM = Awaited<ReturnType<typeof mockFetchTeacherDashboard>>;

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

export default function TeacherDashboardPage() {
  const subtle = useColorModeValue('gray.600', 'gray.400');

  const { data, loading, range, setRange } = useChartData<TeacherDashboardVM>(mockFetchTeacherDashboard, '30');

  const navItems = useMemo(
    () => [
      { label: 'Dashboard', icon: MdDashboard, href: '#/teacher/dashboard' },
      { label: 'Classes', icon: MdSchool, href: '#/teacher/classes' },
      { label: 'Students', icon: MdGroup, href: '#/teacher/students' },
      { label: 'Analytics', icon: MdTrendingUp, href: '#/teacher/analytics' },
    ],
    []
  );

  const performanceOptions = useMemo(
    () => ({
      plotOptions: { bar: { columnWidth: '48%', borderRadius: 6 } },
      legend: { position: 'top' },
      yaxis: { min: 0, max: 100, labels: { formatter: (v: number) => `${Math.round(v)}%` } },
      tooltip: { y: { formatter: (v: number) => `${Math.round(v)}%` } },
    }),
    []
  );

  const sparklineFormatter = useMemo(() => (v: number) => `${Math.round(v)}%`, []);

  const mixedSeries = useMemo(() => {
    if (!data) return [];
    const cats = data.performancePerClass.categories;
    const avg = cats.map((_, idx) => {
      const vals = data.performancePerClass.series.map((s) => s.data[idx] ?? 0);
      const sum = vals.reduce((a, b) => a + b, 0);
      return Math.round(sum / Math.max(1, vals.length));
    });
    return [
      ...data.performancePerClass.series.map((s) => ({ name: s.name, type: 'column', data: s.data })),
      { name: 'Average', type: 'line', data: avg },
    ];
  }, [data]);

  return (
    <DashboardShell title="Teacher Dashboard" navItems={navItems} user={{ name: 'Teacher', email: 'teacher@school.com' }}>
      <Text fontSize="sm" color={subtle} mb={4}>
        Performance, engagement and attendance insights for your assigned classes.
      </Text>

      <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={5}>
        <GridItem colSpan={{ base: 1, lg: 2 }}>
          <ChartCard
            title="Student Performance per Class"
            subtitle="Grouped by subject (compare class averages)"
            right={
              <ChartActions
                range={range}
                onRange={setRange}
                onExport={() => exportSeriesToCSV('teacher_performance_per_class.csv', data?.performancePerClass.categories || [], data?.performancePerClass.series || [])}
              />
            }
            ariaLabel="Student performance per class"
          >
            <BarChart
              ariaLabel="Performance bar chart"
              categories={data?.performancePerClass.categories || []}
              series={data?.performancePerClass.series || []}
              height={320}
              stacked={false}
              options={performanceOptions as any}
            />
            {loading ? <Text fontSize="xs">Loading...</Text> : null}
          </ChartCard>
        </GridItem>

        <GridItem colSpan={{ base: 1, lg: 1 }}>
          <ChartCard
            title="Attendance"
            subtitle="Trend + average across classes"
            right={
              <ChartActions
                range={range}
                onRange={setRange}
                onExport={() => exportSeriesToCSV('teacher_attendance_trend.csv', Array.from({ length: (data?.attendance.trend || []).length }).map((_, i) => String(i + 1)), [{ name: 'Attendance', data: data?.attendance.trend || [] }])}
              />
            }
            ariaLabel="Attendance trend"
          >
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} alignItems="center">
              <Box>
                <Text fontSize="sm" fontWeight={800} mb={2}>
                  Trend
                </Text>
                <Sparkline ariaLabel="Attendance sparkline" data={data?.attendance.trend || []} height={64} valueFormatter={sparklineFormatter} />
                <Text fontSize="xs" color={subtle} mt={2}>
                  Hover to see daily/period values.
                </Text>
              </Box>
              <Box>
                <Text fontSize="sm" fontWeight={800} mb={2}>
                  Average
                </Text>
                <RadialAttendance ariaLabel="Average attendance" value={data?.attendance.average || 0} height={220} label="Avg Attendance" />
              </Box>
            </SimpleGrid>
          </ChartCard>
        </GridItem>

        <GridItem colSpan={{ base: 1, lg: 2 }}>
          <ChartCard
            title="Weekly Engagement"
            subtitle="Heatmap: days × hours (activity index)"
            right={
              <ChartActions
                range={range}
                onRange={setRange}
                onExport={() => {
                  const s = data?.weeklyEngagement.series || [];
                  const categories = s[0]?.data?.map((p) => p.x) || [];
                  const series = s.map((day) => ({ name: day.name, data: day.data.map((p) => p.y) }));
                  exportSeriesToCSV('teacher_weekly_engagement.csv', categories, series);
                }}
              />
            }
            ariaLabel="Weekly engagement heatmap"
          >
            <HeatmapActivity ariaLabel="Engagement heatmap" series={data?.weeklyEngagement.series || []} height={320} />
          </ChartCard>
        </GridItem>

        <GridItem colSpan={{ base: 1, lg: 1 }}>
          <ChartCard
            title="Performance Mix"
            subtitle="Subjects + average trend"
            right={
              <ChartActions
                range={range}
                onRange={setRange}
                onExport={() => {
                  const cats = data?.performancePerClass.categories || [];
                  const onlyColumns = (mixedSeries as any[]).filter((x) => x.type !== 'line');
                  exportSeriesToCSV('teacher_performance_mix.csv', cats, onlyColumns);
                }}
              />
            }
            ariaLabel="Performance mix"
          >
            <MixedChart ariaLabel="Performance mixed chart" categories={data?.performancePerClass.categories || []} series={mixedSeries as any} height={320} />
          </ChartCard>
        </GridItem>
      </SimpleGrid>
    </DashboardShell>
  );
}
