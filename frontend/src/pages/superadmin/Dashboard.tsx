import React, { useMemo } from 'react';
import { Box, Button, GridItem, HStack, Select, SimpleGrid, Text, useColorModeValue } from '@chakra-ui/react';
import { MdAdminPanelSettings, MdDashboard, MdPeople, MdSchool, MdTrendingUp } from 'react-icons/md';
import DashboardShell from '../../components/DashboardShell';
import ChartCard from '../../components/ChartCard';
import StatsCard from '../../components/StatsCard';
import AreaChart from '../../components/charts/v2/AreaChart';
import BarChart from '../../components/charts/v2/BarChart';
import DonutChart from '../../components/charts/v2/DonutChart';
import MixedChart from '../../components/charts/v2/MixedChart';
import RadialAttendance from '../../components/charts/v2/RadialAttendance';
import useChartData, { type DateRangePreset } from '../../hooks/useChartData';

type SuperSeries = {
  categories: string[];
  monthly: any;
  visitors: any;
  classCounts: { categories: string[]; series: any };
  buses: { categories: string[]; series: any; donut: { labels: string[]; series: number[] } };
  attendance: number;
};

function buildLabels(range: DateRangePreset) {
  if (range === '7') return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  if (range === '30') return ['W1', 'W2', 'W3', 'W4'];
  return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
}

function generate(range: DateRangePreset): SuperSeries {
  const categories = buildLabels(range);
  const online = categories.map((_, i) => (range === '365' ? 220 + i * 12 : range === '30' ? 90 + i * 12 : 22 + i * 4));
  const offline = categories.map((_, i) => (range === '365' ? 140 + i * 9 : range === '30' ? 70 + i * 8 : 14 + i * 3));
  const total = online.map((v, idx) => v + offline[idx]);

  const monthly = [
    { name: 'Online', type: 'column', data: online },
    { name: 'Offline', type: 'column', data: offline },
    { name: 'Total', type: 'line', data: total },
  ];

  const visitors = [
    { name: 'Web', data: categories.map((_, i) => (range === '365' ? 3200 + i * 220 : range === '30' ? 980 + i * 90 : 280 + i * 35)) },
    { name: 'Mobile', data: categories.map((_, i) => (range === '365' ? 2600 + i * 180 : range === '30' ? 820 + i * 80 : 240 + i * 30)) },
    { name: 'Partner', data: categories.map((_, i) => (range === '365' ? 1100 + i * 90 : range === '30' ? 380 + i * 45 : 140 + i * 18)) },
  ];

  return {
    categories,
    monthly,
    visitors,
    classCounts: { categories: ['1-A', '1-B', '2-A', '2-B', '3-A', '3-B'], series: [{ name: 'Students', data: [55, 49, 62, 58, 64, 51] }] },
    buses: {
      categories: buildLabels('7'),
      series: [{ name: 'Trips', data: [12, 15, 13, 18, 16, 14, 11] }],
      donut: { labels: ['Operational', 'Maintenance'], series: [42, 6] },
    },
    attendance: range === '7' ? 97 : range === '30' ? 95 : 93,
  };
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

export default function SuperAdminDashboardPage() {
  const subtle = useColorModeValue('gray.600', 'gray.400');

  const { data, range, setRange } = useChartData<SuperSeries>(async (r) => {
    await new Promise((res) => setTimeout(res, 220));
    return generate(r);
  }, '30');

  const navItems = useMemo(
    () => [
      { label: 'SuperAdmin', icon: MdAdminPanelSettings, href: '#/superadmin' },
      { label: 'Dashboard', icon: MdDashboard, href: '#/superadmin/dashboard' },
      { label: 'Institutions', icon: MdSchool, href: '#/superadmin/institutions' },
      { label: 'Users', icon: MdPeople, href: '#/superadmin/users' },
    ],
    []
  );

  const kpis = useMemo(
    () => [
      { title: 'Institutions', value: 12, delta: '+1 this period', icon: MdSchool, sparkline: [9, 9, 10, 10, 11, 11, 12] },
      { title: 'Total Students', value: 8420, delta: '+6% vs last period', icon: MdPeople, sparkline: [7000, 7300, 7600, 7900, 8100, 8300, 8420] },
      { title: 'Active Admins', value: 38, delta: '+2% vs last period', icon: MdAdminPanelSettings, sparkline: [30, 31, 33, 34, 36, 37, 38] },
      { title: "Today's Attendance", value: `${data?.attendance ?? 0}%`, delta: '+1% vs yesterday', icon: MdTrendingUp, sparkline: [92, 93, 93, 94, 94, 95, data?.attendance ?? 0] },
    ],
    [data?.attendance]
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
    <DashboardShell title="SuperAdmin Dashboard" navItems={navItems} user={{ name: 'SuperAdmin', email: 'superadmin@school.com' }}>
      <Text fontSize="sm" color={subtle} mb={4}>
        Global overview across all institutions.
      </Text>

      <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing={4} mb={6}>
        {kpis.map((k) => (
          <StatsCard key={k.title} title={k.title} value={k.value} delta={k.delta} icon={k.icon as any} sparkline={k.sparkline} ariaLabel={`${k.title} sparkline`} />
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
                onExport={() => exportSeriesToCSV('superadmin_monthly.csv', data?.categories || [], (data?.monthly || []).filter((x: any) => x.type !== 'line'))}
              />
            }
            ariaLabel="Monthly Summary"
          >
            <MixedChart ariaLabel="Monthly Summary mixed" categories={data?.categories || []} series={data?.monthly || []} height={340} options={mixedOptions as any} />
          </ChartCard>
        </GridItem>

        <GridItem colSpan={{ base: 1, lg: 1 }}>
          <ChartCard
            title="Today's Attendance"
            subtitle="Attendance % today"
            right={<ChartActions range={range} onRange={setRange} onExport={() => exportSeriesToCSV('superadmin_attendance.csv', ['Today'], [{ name: 'Attendance', data: [data?.attendance || 0] }])} />}
            ariaLabel="Attendance"
          >
            <RadialAttendance ariaLabel="Attendance radial" value={data?.attendance || 0} height={280} label="Attendance" />
          </ChartCard>
        </GridItem>

        <GridItem colSpan={{ base: 1, lg: 1 }}>
          <ChartCard
            title="Student Growth"
            subtitle="Class-wise student distribution"
            right={<ChartActions range={range} onRange={setRange} onExport={() => exportSeriesToCSV('superadmin_class_counts.csv', data?.classCounts.categories || [], data?.classCounts.series || [])} />}
            ariaLabel="Class Counts"
          >
            <BarChart ariaLabel="Class-wise students" categories={data?.classCounts.categories || []} series={data?.classCounts.series || []} height={280} />
          </ChartCard>
        </GridItem>

        <GridItem colSpan={{ base: 1, lg: 1 }}>
          <ChartCard
            title="Bus Status"
            subtitle="Daily trips + operational breakdown"
            right={<ChartActions range={range} onRange={setRange} onExport={() => exportSeriesToCSV('superadmin_bus_trips.csv', data?.buses.categories || [], data?.buses.series || [])} />}
            ariaLabel="Bus Status"
          >
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <BarChart ariaLabel="Daily bus trips" categories={data?.buses.categories || []} series={data?.buses.series || []} height={220} options={{ legend: { show: false } } as any} />
              <DonutChart ariaLabel="Operational vs maintenance" labels={data?.buses.donut.labels || []} series={data?.buses.donut.series || []} height={220} />
            </SimpleGrid>
          </ChartCard>
        </GridItem>

        <GridItem colSpan={{ base: 1, lg: 1 }}>
          <ChartCard
            title="Visitor Insights"
            subtitle="Legend toggles enabled by ApexCharts"
            right={<ChartActions range={range} onRange={setRange} onExport={() => exportSeriesToCSV('superadmin_visitors.csv', data?.categories || [], data?.visitors || [])} />}
            ariaLabel="Visitor Insights"
          >
            <Box>
              <AreaChart ariaLabel="Visitor insights" categories={data?.categories || []} series={data?.visitors || []} height={280} />
            </Box>
          </ChartCard>
        </GridItem>

        <GridItem colSpan={{ base: 1, lg: 3 }}>
          <ChartCard title="API Wiring" subtitle="Example: useChartData + range selector already wired above" ariaLabel="API wiring">
            <Text fontSize="sm" color={subtle}>
              This dashboard loads all chart series through a mocked fetcher inside <Box as="span" fontFamily="mono">useChartData</Box>. Replace that fetcher with your real API endpoint and map response → chart series.
            </Text>
          </ChartCard>
        </GridItem>
      </SimpleGrid>
    </DashboardShell>
  );
}
