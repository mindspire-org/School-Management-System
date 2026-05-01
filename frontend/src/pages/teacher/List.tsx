import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  HStack,
  Select,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Text,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react';
import { MdDashboard, MdGroup, MdPeople, MdSchool } from 'react-icons/md';
import DashboardShell from '../../components/DashboardShell';
import ChartCard from '../../components/ChartCard';
import DataTable, { type DataTableColumn, type SortDirection } from '../../components/DataTable';
import MixedChart from '../../components/charts/v2/MixedChart';
import RadialAttendance from '../../components/charts/v2/RadialAttendance';
import Sparkline from '../../components/charts/Sparkline';
import useChartData, { type DateRangePreset } from '../../hooks/useChartData';
import {
  mockFetchTeacherList,
  mockFetchTeacherProfile,
  type TeacherListRow,
  type TeacherProfileResponse,
} from './mockTeacherApi';

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

function statusColor(status: TeacherListRow['status']) {
  if (status === 'active') return 'green';
  if (status === 'on leave') return 'orange';
  if (status === 'resigned') return 'red';
  return 'gray';
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

export default function TeacherListPage() {
  const subtle = useColorModeValue('gray.600', 'gray.400');
  const navItems = useMemo(
    () => [
      { label: 'Dashboard', icon: MdDashboard, href: '#/teacher/dashboard' },
      { label: 'Teachers', icon: MdPeople, href: '#/teacher/teachers' },
      { label: 'Students', icon: MdGroup, href: '#/teacher/students' },
      { label: 'Classes', icon: MdSchool, href: '#/teacher/classes' },
    ],
    []
  );

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [sortId, setSortId] = useState<keyof TeacherListRow | undefined>('avgPerformance');
  const [sortDir, setSortDir] = useState<SortDirection>('desc');
  const [filters, setFilters] = useState<Record<string, string>>({ subject: '', department: '', status: '' });

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<TeacherListRow[]>([]);
  const [total, setTotal] = useState(0);

  const [selected, setSelected] = useState<TeacherListRow | null>(null);
  const modal = useDisclosure();

  const {
    data: profile,
    range: profileRange,
    setRange: setProfileRange,
    loading: profileLoading,
  } = useChartData<TeacherProfileResponse>(async (r) => {
    if (!selected) {
      return {
        id: 0,
        name: '',
        email: '',
        department: '',
        subject: '',
        mixedChart: { categories: [], series: [] },
      };
    }
    return mockFetchTeacherProfile(selected.id, r);
  }, '30');

  const fetchPage = useCallback(async () => {
    setLoading(true);
    try {
      const res = await mockFetchTeacherList({ pageIndex, pageSize, search, sortId, sortDir, filters });
      setRows(res.rows);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  }, [filters, pageIndex, pageSize, search, sortDir, sortId]);

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  const subjectOptions = useMemo(
    () => [
      { label: 'Math', value: 'Math' },
      { label: 'English', value: 'English' },
      { label: 'Science', value: 'Science' },
      { label: 'Computer', value: 'Computer' },
    ],
    []
  );

  const departmentOptions = useMemo(
    () => [
      { label: 'Primary', value: 'Primary' },
      { label: 'Middle', value: 'Middle' },
      { label: 'Secondary', value: 'Secondary' },
    ],
    []
  );

  const statusOptions = useMemo(
    () => [
      { label: 'Active', value: 'active' },
      { label: 'On Leave', value: 'on leave' },
      { label: 'Resigned', value: 'resigned' },
    ],
    []
  );

  const columns: Array<DataTableColumn<TeacherListRow>> = useMemo(
    () => [
      {
        id: 'name',
        header: 'Teacher',
        sortable: true,
        cell: (r) => (
          <Box>
            <Text fontWeight={800}>{r.name}</Text>
            <Text fontSize="xs" color={subtle}>
              {r.email}
            </Text>
          </Box>
        ),
      },
      {
        id: 'subject',
        header: 'Subject',
        sortable: true,
        filter: { type: 'select', placeholder: 'All', options: subjectOptions },
        cell: (r) => <Badge colorScheme="blue">{r.subject}</Badge>,
      },
      {
        id: 'department',
        header: 'Department',
        sortable: true,
        filter: { type: 'select', placeholder: 'All', options: departmentOptions },
        cell: (r) => <Text fontSize="sm">{r.department}</Text>,
      },
      {
        id: 'status',
        header: 'Status',
        sortable: true,
        filter: { type: 'select', placeholder: 'All', options: statusOptions },
        cell: (r) => (
          <Badge colorScheme={statusColor(r.status)} variant="subtle">
            {r.status}
          </Badge>
        ),
      },
      {
        id: 'attendanceLast10',
        header: 'Attendance (10d)',
        sortable: false,
        cell: (r) => (
          <Box w="140px">
            <Sparkline ariaLabel={`${r.name} attendance trend`} data={(r as any).attendanceLast10} height={40} />
          </Box>
        ),
      },
      {
        id: 'avgPerformance',
        header: 'Avg Performance',
        sortable: true,
        isNumeric: true,
        cell: (r) => (
          <Box w="150px">
            <RadialAttendance ariaLabel={`${r.name} performance`} value={r.avgPerformance} height={120} label="Perf" />
          </Box>
        ),
      },
    ],
    [departmentOptions, statusOptions, subjectOptions, subtle]
  );

  const openProfile = useCallback(
    (row: TeacherListRow) => {
      setSelected(row);
      modal.onOpen();
    },
    [modal]
  );

  useEffect(() => {
    if (modal.isOpen) {
      setProfileRange('30');
    }
  }, [modal.isOpen, setProfileRange]);

  return (
    <DashboardShell title="Teachers" navItems={navItems} user={{ name: 'Teacher', email: 'teacher@school.com' }}>
      <Text fontSize="sm" color={subtle} mb={4}>
        Teacher list analytics with server-side search, sorting, and column filters. Click a row to open the profile.
      </Text>

      <ChartCard
        title="Teacher List"
        subtitle="Mini charts: attendance trend + radial performance"
        right={
          <Button
            size="sm"
            variant="outline"
            onClick={() => exportSeriesToCSV('teachers_export.csv', rows.map((r) => r.name), [{ name: 'avgPerformance', data: rows.map((r) => r.avgPerformance) }])}
          >
            Export CSV
          </Button>
        }
        ariaLabel="Teacher list"
      >
        <DataTable<TeacherListRow>
          ariaLabel="Teacher list table"
          columns={columns}
          data={rows}
          loading={loading}
          getRowId={(r) => r.id}
          onRowClick={openProfile}
          search={{
            value: search,
            onChange: (v) => {
              setSearch(v);
              setPageIndex(0);
            },
            placeholder: 'Search teachers...',
          }}
          sort={{
            columnId: sortId as string | undefined,
            direction: sortDir,
            onChange: (id, dir) => {
              setSortId(id as keyof TeacherListRow);
              setSortDir(dir);
              setPageIndex(0);
            },
          }}
          filters={{
            values: filters,
            onChange: (columnId, value) => {
              setFilters((p) => ({ ...p, [columnId]: value }));
              setPageIndex(0);
            },
          }}
          pagination={{
            pageIndex,
            pageSize,
            total,
            onPageChange: setPageIndex,
            onPageSizeChange: (s) => {
              setPageSize(s);
              setPageIndex(0);
            },
          }}
          emptyText="No teachers found."
        />
      </ChartCard>

      <Modal isOpen={modal.isOpen} onClose={modal.onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{selected?.name || 'Teacher Profile'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
              <Box>
                <Text fontSize="xs" color={subtle}>
                  Email
                </Text>
                <Text fontWeight={800}>{selected?.email || '—'}</Text>
              </Box>
              <Box>
                <Text fontSize="xs" color={subtle}>
                  Department / Subject
                </Text>
                <Text fontWeight={800}>
                  {selected?.department || '—'} · {selected?.subject || '—'}
                </Text>
              </Box>
            </SimpleGrid>

            <ChartCard
              title="Class Insights"
              subtitle="Assignments + quizzes with average score trend"
              right={
                <ChartActions
                  range={profileRange}
                  onRange={setProfileRange}
                  onExport={() => {
                    const cats = profile?.mixedChart.categories || [];
                    const columnsOnly = (profile?.mixedChart.series || []).filter((s) => s.type !== 'line').map((s) => ({ name: s.name, data: s.data }));
                    exportSeriesToCSV('teacher_profile_class_insights.csv', cats, columnsOnly);
                  }}
                />
              }
              ariaLabel="Teacher profile mixed chart"
            >
              <MixedChart
                ariaLabel="Teacher profile class mixed chart"
                categories={profile?.mixedChart.categories || []}
                series={profile?.mixedChart.series || []}
                height={320}
                options={{ chart: { stacked: true }, stroke: { width: [0, 0, 3] } } as any}
              />
              {profileLoading ? <Text fontSize="xs">Loading...</Text> : null}
            </ChartCard>
          </ModalBody>
        </ModalContent>
      </Modal>
    </DashboardShell>
  );
}
