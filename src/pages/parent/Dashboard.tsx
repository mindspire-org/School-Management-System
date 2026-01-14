import React, { useMemo } from 'react';
import { Box, GridItem, HStack, Select, SimpleGrid, Text, useColorModeValue, Button } from '@chakra-ui/react';
import { MdDashboard, MdMessage, MdPeople } from 'react-icons/md';
import DashboardShell from '../../components/DashboardShell';
import ChartCard from '../../components/ChartCard';
import AreaChart from '../../components/charts/v2/AreaChart';
import BarChart from '../../components/charts/v2/BarChart';
import DonutChart from '../../components/charts/v2/DonutChart';
import RadialAttendance from '../../components/charts/v2/RadialAttendance';
import useChartData, { type DateRangePreset } from '../../hooks/useChartData';

type ParentDashboardData = {
  attendance: number;
  performance: { categories: string[]; series: Array<{ name: string; data: number[] }> };
  fees: { categories: string[]; series: Array<{ name: string; data: number[] }> };
  messages: { labels: string[]; series: number[] };
};

function buildMonths(range: DateRangePreset) {
  if (range === '7') return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  if (range === '30') return ['W1', 'W2', 'W3', 'W4'];
  return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
}

function generateParentDashboard(range: DateRangePreset): ParentDashboardData {
  const cats = buildMonths(range);

  const perf = cats.map((_, i) => {
    const base = range === '365' ? 72 : range === '30' ? 75 : 78;
    return Math.max(0, Math.min(100, Math.round(base + (i % 3) * 4 - (i % 2) * 2)));
  });

  const feePaid = cats.map((_, i) => {
    const base = range === '365' ? 9000 : range === '30' ? 12000 : 3000;
    return Math.round(base + (i % 4) * (range === '365' ? 1200 : range === '30' ? 1800 : 450));
  });

  const attendance = range === '7' ? 96 : range === '30' ? 94 : 92;

  const unread = range === '7' ? 3 : range === '30' ? 7 : 18;
  const read = range === '7' ? 14 : range === '30' ? 46 : 160;

  return {
    attendance,
    performance: {
      categories: cats,
      series: [{ name: 'Performance', data: perf }],
    },
    fees: {
      categories: cats,
      series: [{ name: 'Fee Paid', data: feePaid }],
    },
    messages: {
      labels: ['Unread', 'Read'],
      series: [unread, read],
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

function exportPairsToCSV(filename: string, labels: string[], values: number[]) {
  const header = ['Label', 'Value'];
  const rows = labels.map((l, idx) => [l, String(values[idx] ?? 0)]);
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

export default function ParentDashboardPage() {
  const subtle = useColorModeValue('gray.600', 'gray.400');

  const { data, range, setRange, loading } = useChartData<ParentDashboardData>(async (r) => {
    await new Promise((res) => setTimeout(res, 180));
    return generateParentDashboard(r);
  }, '30');

  const navItems = useMemo(
    () => [
      { label: 'Dashboard', icon: MdDashboard, href: '#/parent/dashboard' },
      { label: 'Children', icon: MdPeople, href: '#/parent/children' },
      { label: 'Messages', icon: MdMessage, href: '#/parent/messages' },
    ],
    []
  );

  return (
    <DashboardShell title="Parent Dashboard" navItems={navItems} user={{ name: 'Parent', email: 'parent@school.com' }}>
      <Text fontSize="sm" color={subtle} mb={4}>
        Quick overview for your child — attendance, performance, fees, and messages.
      </Text>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        <GridItem colSpan={{ base: 1, md: 1 }}>
          <ChartCard
            title="Child Attendance"
            subtitle="Attendance percentage (today/period average)"
            right={<ChartActions range={range} onRange={setRange} onExport={() => exportSeriesToCSV('parent_child_attendance.csv', ['Attendance'], [{ name: 'Attendance', data: [data?.attendance || 0] }])} />}
            ariaLabel="Child attendance"
          >
            <RadialAttendance ariaLabel="Child attendance radial" value={data?.attendance || 0} height={260} label="Attendance" />
            {loading ? <Text fontSize="xs">Loading...</Text> : null}
          </ChartCard>
        </GridItem>

        <GridItem colSpan={{ base: 1, md: 1 }}>
          <ChartCard
            title="Messages"
            subtitle="Unread vs read messages"
            right={<ChartActions range={range} onRange={setRange} onExport={() => exportPairsToCSV('parent_messages.csv', data?.messages.labels || [], data?.messages.series || [])} />}
            ariaLabel="Messages donut"
          >
            <DonutChart ariaLabel="Unread vs read" labels={data?.messages.labels || []} series={data?.messages.series || []} height={260} />
          </ChartCard>
        </GridItem>

        <GridItem colSpan={{ base: 1, md: 2 }}>
          <ChartCard
            title="Monthly Performance"
            subtitle="Simple trend line (mobile-friendly)"
            right={<ChartActions range={range} onRange={setRange} onExport={() => exportSeriesToCSV('parent_monthly_performance.csv', data?.performance.categories || [], data?.performance.series || [])} />}
            ariaLabel="Monthly performance"
          >
            <AreaChart
              ariaLabel="Monthly performance line"
              categories={data?.performance.categories || []}
              series={data?.performance.series || []}
              height={260}
              options={{
                stroke: { curve: 'smooth', width: 3 },
                yaxis: { min: 0, max: 100, labels: { formatter: (v: number) => `${Math.round(v)}%` } },
                tooltip: { y: { formatter: (v: number) => `${Math.round(v)}%` } },
                legend: { show: false },
              } as any}
            />
          </ChartCard>
        </GridItem>

        <GridItem colSpan={{ base: 1, md: 2 }}>
          <ChartCard
            title="Fee Payment History"
            subtitle="Paid amount by month/week"
            right={<ChartActions range={range} onRange={setRange} onExport={() => exportSeriesToCSV('parent_fee_history.csv', data?.fees.categories || [], data?.fees.series || [])} />}
            ariaLabel="Fee history"
          >
            <BarChart
              ariaLabel="Fee payment history bar"
              categories={data?.fees.categories || []}
              series={data?.fees.series || []}
              height={260}
              options={{
                plotOptions: { bar: { columnWidth: '52%', borderRadius: 6 } },
                legend: { show: false },
                tooltip: { y: { formatter: (v: number) => `${Math.round(v).toLocaleString()}` } },
              } as any}
            />
          </ChartCard>
        </GridItem>
      </SimpleGrid>
    </DashboardShell>
  );
}
