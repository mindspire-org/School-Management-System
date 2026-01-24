
import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Flex,
  SimpleGrid,
  Text,
  VStack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Badge,
  HStack,
  Icon,
  useColorModeValue,
  useToast,
  Avatar,
  Spacer
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

// Icons
import {
  MdPerson,
  MdDirectionsBus,
  MdCheckCircle,
  MdAdd,
  MdBarChart,
  MdTimer,
  MdSearch,
  MdMoreVert,
} from 'react-icons/md';
import { FaUserGraduate, FaChalkboardTeacher, FaBus } from 'react-icons/fa';

// Custom Components
import Card from '../../../components/card/Card';
import MiniStatistics from '../../../components/card/MiniStatistics';
import IconBox from '../../../components/icons/IconBox';
import BarChart from '../../../components/charts/BarChart';
import RadialAttendance from '../../../components/charts/RadialAttendance';
import Sparkline from '../../../components/charts/Sparkline';
import PieChart from '../../../components/charts/PieChart';
import ApexCharts from 'react-apexcharts'; // Imported for custom charts
import StatCard from '../../../components/card/StatCard';

// Helpers
import { formatNumber, formatCurrency, getStatusColor, formatDate, formatTime } from '../../../utils/helpers';
// API
import * as dashboardApi from '../../../services/api/dashboard';
import * as transportApi from '../../../services/api/transport';

// --- Custom Components ---

// 2. Line Chart Card (Premium Area Chart)
const LineChartCard = ({ title, categories, series, height = 250, activeRange, onRangeChange }) => {
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.100', 'gray.700');
  const mainColor = useColorModeValue('#4318FF', '#7551FF');

  // Chart options (same as before)
  const chartOptions = {
    chart: {
      toolbar: { show: false },
      type: 'area',
      zoom: { enabled: false },
      animations: { enabled: true, easing: 'easeinout', speed: 800 },
      background: 'transparent'
    },
    colors: [mainColor],
    stroke: { curve: 'smooth', width: 3 },
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 100] } },
    xaxis: {
      categories: categories,
      labels: { style: { colors: '#A3AED0', fontSize: '12px', fontWeight: 600, fontFamily: 'Inter' } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { show: true, labels: { style: { colors: '#A3AED0', fontSize: '12px', fontWeight: 600, fontFamily: 'Inter' } } },
    grid: { strokeDashArray: 5, borderColor: useColorModeValue('rgba(163, 174, 208, 0.1)', 'rgba(255, 255, 255, 0.05)'), yaxis: { lines: { show: true } }, xaxis: { lines: { show: false } } },
    dataLabels: { enabled: false },
    tooltip: { theme: 'light', style: { fontSize: '12px', fontFamily: 'Inter' }, x: { show: true }, marker: { show: false } }
  };

  return (
    <Box
      bg={bg}
      p='24px'
      borderRadius='20px'
      border='1px solid'
      borderColor={borderColor}
      boxShadow='0px 4px 12px rgba(0, 0, 0, 0.05)'
      h='100%'
      transition='all 0.3s'
      _hover={{ boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.1)' }}
    >
      <Flex justify='space-between' align='center' mb='20px'>
        <Text fontSize='lg' fontWeight='800' color={useColorModeValue('gray.800', 'white')} letterSpacing="-0.5px">
          {title}
        </Text>

        <HStack spacing='6px' bg={useColorModeValue('gray.100', 'whiteAlpha.100')} p='4px' borderRadius='12px'>
          {['7d', '1m', '1y'].map((range) => (
            <Button
              key={range}
              size='xs'
              variant={activeRange === range ? 'solid' : 'ghost'}
              bg={activeRange === range ? useColorModeValue('white', 'gray.700') : 'transparent'}
              color={activeRange === range ? mainColor : 'gray.500'}
              shadow={activeRange === range ? 'sm' : 'none'}
              borderRadius='8px'
              fontSize='10px'
              fontWeight='700'
              onClick={() => onRangeChange(range)}
              textTransform="uppercase"
            >
              {range}
            </Button>
          ))}
        </HStack>
      </Flex>

      <Box h={height}>
        <ApexCharts options={chartOptions} series={series} type="area" height="100%" />
      </Box>
    </Box>
  );
};


export default function AdminDashboard() {
  const navigate = useNavigate();
  const toast = useToast();

  const busCardBg = useColorModeValue('gray.50', 'whiteAlpha.50');
  const busCardHoverBg = useColorModeValue('blue.50', 'blue.900');
  const busIconBg = useColorModeValue('white', 'navy.700');

  // -- State --
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    activeBuses: 0,
    todayAttendance: 0, // Fallback
    studentStats: { total: 0, present: 0, absent: 0, late: 0, leave: 0 },
    teacherStats: { total: 0, present: 0, absent: 0, late: 0, leave: 0 },
    recentAlerts: []
  });
  const [buses, setBuses] = useState([]);
  const [attendanceWeekly, setAttendanceWeekly] = useState([]);
  const [feesMonthly, setFeesMonthly] = useState([]);
  const [attRange, setAttRange] = useState('7d');
  const [feeRange, setFeeRange] = useState('1y');

  // -- Effects --
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [overviewRes, busesRes, attRes, feesRes] = await Promise.all([
          dashboardApi.getOverview(),
          transportApi.listBuses(),
          dashboardApi.getAttendanceWeekly({ range: attRange }),
          dashboardApi.getFeesMonthly({ range: feeRange }),
        ]);

        const ovData = overviewRes?.data || {};
        setOverview({
          totalStudents: Number(ovData.totalStudents) || 0,
          totalTeachers: Number(ovData.totalTeachers) || 0,
          activeBuses: Number(ovData.activeBuses) || 0,
          todayAttendance: Number(ovData.todayAttendance) || 0,
          studentStats: ovData.studentStats || { total: 0, present: 0, absent: 0, late: 0, leave: 0 },
          teacherStats: ovData.teacherStats || { total: 0, present: 0, absent: 0, late: 0, leave: 0 },
          recentAlerts: Array.isArray(ovData.recentAlerts) ? ovData.recentAlerts : [],
        });

        // Buses
        const busItems = Array.isArray(busesRes?.items) ? busesRes.items : (Array.isArray(busesRes) ? busesRes : []);
        setBuses(busItems);

        // Attendance
        const attItems = Array.isArray(attRes?.data) ? attRes.data : (Array.isArray(attRes) ? attRes : []);
        setAttendanceWeekly(attItems);

        // Fees
        const feeItems = Array.isArray(feesRes?.data) ? feesRes.data : (Array.isArray(feesRes) ? feesRes : []);
        setFeesMonthly(feeItems);

      } catch (e) {
        console.error("Dashboard load failed", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [attRange, feeRange]); // Reload when ranges change

  // -- Data Processing for Charts --
  const studentStats = overview.studentStats || { total: 0, present: 0, absent: 0, late: 0, leave: 0 };
  const teacherStats = overview.teacherStats || { total: 0, present: 0, absent: 0, late: 0, leave: 0 };

  // Calculate percentages
  const calcPct = (present, total) => total > 0 ? Math.round((present / total) * 100) : 0;

  const studentAttPct = calcPct(studentStats.present + studentStats.late, studentStats.total); // Late counts as present-ish for overview
  const teacherAttPct = calcPct(teacherStats.present + teacherStats.late, teacherStats.total);

  const studentPie = {
    series: [studentStats.present, studentStats.absent, studentStats.late, studentStats.leave],
    labels: ['Present', 'Absent', 'Late', 'Leave'],
    colors: ['#01B574', '#EE5D50', '#FFB547', '#A3AED0']
  };

  const teacherPie = {
    series: [teacherStats.present, teacherStats.absent, teacherStats.late, teacherStats.leave],
    labels: ['Present', 'Absent', 'Late', 'Leave'],
    colors: ['#01B574', '#EE5D50', '#FFB547', '#A3AED0']
  };

  const attendanceBars = useMemo(() => {
    return (attendanceWeekly || []).map((d) => {
      const pct = (Number(d.present) || 0);
      const dateObj = new Date(d.day);
      let dayLabel = dateObj.toLocaleDateString(undefined, { weekday: 'short' });
      // If range is large (1y), showing full date might be better, or month name
      if (attRange === '1y') {
        dayLabel = dateObj.toLocaleDateString(undefined, { month: 'short' });
      } else if (attRange === '1m') {
        dayLabel = dateObj.getDate(); // Just day number for 30 days
      }
      return { day: dayLabel, value: pct };
    });
  }, [attendanceWeekly, attRange]);

  const activitySeries = useMemo(() => {
    return attendanceBars.map(d => d.value);
  }, [attendanceBars]);

  const feeMonths = useMemo(() => {
    return (feesMonthly || []).map((m) => {
      const dt = new Date(m.month);
      const label = dt.toLocaleDateString(undefined, { month: 'short' });
      return { month: label, collected: Number(m.collected) || 0 };
    });
  }, [feesMonthly]);

  const feeDonut = useMemo(() => {
    const totalCollected = (feesMonthly || []).reduce((sum, m) => sum + Number(m.collected || 0), 0);
    const totalPending = (feesMonthly || []).reduce((sum, m) => sum + Number(m.pending || 0), 0);
    const total = totalCollected + totalPending;
    const rate = total > 0 ? Math.round((totalCollected / total) * 100) : 0;
    return {
      series: [totalCollected, totalPending],
      labels: ['Collected', 'Pending'],
      rate,
    };
  }, [feesMonthly]);

  // Professional Vibrant Background
  const bgMain = useColorModeValue('gray.50', 'gray.900');
  const subtleText = useColorModeValue('gray.500', 'gray.400');

  // Subtle Mesh Gradient for Top Section
  const meshBg = useColorModeValue(
    'radial-gradient(at 0% 0%, hsla(210, 100%, 96%, 1) 0, transparent 50%), radial-gradient(at 100% 0%, hsla(220, 100%, 96%, 1) 0, transparent 50%)',
    'radial-gradient(at 0% 0%, hsla(210, 30%, 20%, 1) 0, transparent 50%), radial-gradient(at 100% 0%, hsla(220, 30%, 20%, 1) 0, transparent 50%)'
  );

  const recentAlerts = overview.recentAlerts || [];

  return (
    <Box
      pt={{ base: '130px', md: '80px', xl: '80px' }}
      bg={bgMain}
      minH='100vh'
      position="relative"
      fontFamily="'Inter', sans-serif" // Clean professional font
    >
      {/* Background Accent */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        h="300px" // Only top section has gradient
        bg={meshBg}
        zIndex="0"
      />

      <Box position="relative" zIndex="1">
        {/* Header */}
        <Flex justify='space-between' align='center' mb='45px' px='20px'>
          <VStack align='start' spacing='4px'>
            <Text
              fontSize='4xl'
              fontWeight='900'
              letterSpacing='-1px'
              bgGradient="linear(to-r, blue.600, blue.400)"
              bgClip="text"
              display='inline-flex'
              alignItems='center'
            >
              Good Morning, Super Admin <Text as="span" bgClip="initial" ml="2">👋</Text>
            </Text>
            <Text fontSize='lg' color='gray.500' fontWeight='600' opacity={0.8}>
              Your school is performing exceptionally today.
            </Text>
          </VStack>
          <HStack spacing='25px'>
            <Box textAlign='right' display={{ base: 'none', md: 'block' }}>
              <Text fontSize='sm' fontWeight='800' color='blue.600'>{formatDate(new Date())}</Text>
              <Text fontSize='xs' color='gray.400' fontWeight='700' textTransform="uppercase">Term II • 2024-25</Text>
            </Box>
            <Avatar
              size='lg'
              name='Admin User'
              src=''
              border='4px solid'
              borderColor='white'
              boxShadow="xl"
              p='2px'
              bg='blue.500'
            />
          </HStack>
        </Flex>

        {/* --- Section 1: Top Stats Cards (Premium) --- */}
        <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing='24px' mb='30px' px='10px'>
          <StatCard
            title="Total Students"
            value={formatNumber(overview.totalStudents)}
            subValue="+42"
            note="Active this academic year"
            icon={FaUserGraduate}
            colorScheme="blue"
            trend="up"
            trendValue={5}
          />
          <StatCard
            title="Total Teachers"
            value={formatNumber(overview.totalTeachers)}
            subValue="82"
            note="Staff currently on duty"
            icon={FaChalkboardTeacher}
            colorScheme="purple"
            trend="up"
            trendValue={2}
          />
          <StatCard
            title="Active Buses"
            value={overview.activeBuses}
            note="Vehicles currently in transit"
            icon={FaBus}
            colorScheme="cyan"
            trend="up"
            trendValue={0}
          />
          <StatCard
            title="Avg Student Attendance"
            value={`${studentAttPct}%`}
            note="Across all classes today"
            icon={MdCheckCircle}
            colorScheme="green"
            trend="up"
            trendValue={3}
          />
        </SimpleGrid>

        {/* --- Section 2: Trend Charts (NEW - Upper Section) --- */}
        <SimpleGrid columns={{ base: 1, md: 2 }} gap='20px' mb='20px'>
          <LineChartCard
            title="Attendance Trend"
            categories={attendanceBars.map(d => d.day)}
            series={[{ name: 'Attendance', data: attendanceBars.map(d => d.value) }]}
            height={280}
            activeRange={attRange}
            onRangeChange={setAttRange}
          />
          <LineChartCard
            title="Fee Collection"
            categories={feeMonths.map(d => d.month)}
            series={[{ name: 'Collections', data: feeMonths.map(d => d.collected) }]}
            height={280}
            activeRange={feeRange}
            onRangeChange={setFeeRange}
          />
        </SimpleGrid>

        {/* --- Section 3: Charts & Graphs --- */}
        <SimpleGrid columns={{ base: 1, md: 3 }} gap='24px' mb='30px' px='10px'>
          {/* Card 1: Student Attendance */}
          <Card p='20px'>
            <Text fontSize='lg' fontWeight='800' mb='4'>Student Attendance</Text>
            <Flex align='center' justify='center' mb='4'>
              <PieChart
                chartData={studentPie.series}
                chartOptions={{
                  labels: studentPie.labels,
                  colors: studentPie.colors,
                  legend: { position: 'bottom' },
                  dataLabels: { enabled: false }
                }}
                type='donut'
                height={220}
              />
            </Flex>
            <SimpleGrid columns={2} spacing={2} textAlign='center'>
              <Box><Text fontSize='xs' color='gray.400'>Present</Text><Text fontWeight='bold' color='green.500'>{studentStats.present}</Text></Box>
              <Box><Text fontSize='xs' color='gray.400'>Absent</Text><Text fontWeight='bold' color='red.500'>{studentStats.absent}</Text></Box>
              <Box><Text fontSize='xs' color='gray.400'>Late</Text><Text fontWeight='bold' color='orange.400'>{studentStats.late}</Text></Box>
              <Box><Text fontSize='xs' color='gray.400'>Total</Text><Text fontWeight='bold'>{studentStats.total}</Text></Box>
            </SimpleGrid>
          </Card>

          {/* Card 2: Teacher Attendance */}
          <Card p='20px'>
            <Text fontSize='lg' fontWeight='800' mb='4'>Teacher Attendance</Text>
            <Flex align='center' justify='center' mb='4'>
              <PieChart
                chartData={teacherPie.series}
                chartOptions={{
                  labels: teacherPie.labels,
                  colors: teacherPie.colors,
                  legend: { position: 'bottom' },
                  dataLabels: { enabled: false }
                }}
                type='donut'
                height={220}
              />
            </Flex>
            <SimpleGrid columns={2} spacing={2} textAlign='center'>
              <Box><Text fontSize='xs' color='gray.400'>Present</Text><Text fontWeight='bold' color='green.500'>{teacherStats.present}</Text></Box>
              <Box><Text fontSize='xs' color='gray.400'>Absent</Text><Text fontWeight='bold' color='red.500'>{teacherStats.absent}</Text></Box>
              {/* Assuming teacherStats has late/leave for symmetry, if not 0 */}
              <Box><Text fontSize='xs' color='gray.400'>On Leave</Text><Text fontWeight='bold' color='blue.400'>{teacherStats.leave}</Text></Box>
              <Box><Text fontSize='xs' color='gray.400'>Total</Text><Text fontWeight='bold'>{teacherStats.total}</Text></Box>
            </SimpleGrid>
          </Card>

          {/* Card 2: Fee Collection Donut */}
          <Card p='24px'>
            <Flex justify='space-between' align='center' mb='16px'>
              <Text fontSize='lg' fontWeight='800'>Fee Split</Text>
              <Badge colorScheme={feeDonut.rate >= 80 ? 'green' : 'orange'} borderRadius='8px' px='2'>
                {feeDonut.rate}%
              </Badge>
            </Flex>
            <Text fontSize='sm' color={subtleText} mb='20px'>
              Collected vs Pending breakdown.
            </Text>
            <PieChart
              type="donut"
              height={240}
              chartData={feeDonut.series}
              chartOptions={{
                labels: feeDonut.labels,
                legend: { position: 'bottom', fontSize: '12px', fontWeight: 600 },
                colors: ['#4318FF', '#FFAE1F'],
                plotOptions: { pie: { donut: { size: '75%' } } }
              }}
            />
          </Card>

          {/* Card 3: Weekly Activity Sparkline */}
          <Card p='24px'>
            <Flex justify='space-between' align='center' mb='16px'>
              <Text fontSize='lg' fontWeight='800'>Activity</Text>
              <Badge colorScheme='blue' borderRadius='8px' px='2'>TRENDING</Badge>
            </Flex>
            <Text fontSize='sm' color={subtleText} mb='20px'>
              Engagement trend for the past week.
            </Text>
            <Sparkline ariaLabel="Weekly activity trend" data={activitySeries} height={140} type="area" />
            <Flex mt={6} justify='space-between' align='center'>
              <VStack align='start' spacing='0'>
                <Text fontSize='10px' color='gray.400' fontWeight='700' textTransform='uppercase'>Minimum</Text>
                <Text fontSize='sm' fontWeight='800'>{Math.min(...activitySeries)}%</Text>
              </VStack>
              <VStack align='end' spacing='0'>
                <Text fontSize='10px' color='gray.400' fontWeight='700' textTransform='uppercase'>Maximum</Text>
                <Text fontSize='sm' fontWeight='800' color='blue.500'>{Math.max(...activitySeries)}%</Text>
              </VStack>
            </Flex>
          </Card>
        </SimpleGrid>

        {/* --- Section 4: Detailed Stats & Lists --- */}
        <SimpleGrid columns={{ base: 1, xl: 2 }} gap='24px' mb='30px' px='10px'>

          {/* Left: Bus Overview */}
          <Card p='24px'>
            <Flex justify='space-between' align='center' mb='24px'>
              <Box>
                <Text fontSize='lg' fontWeight='800'>Transport Status</Text>
                <Text fontSize='xs' color='gray.400'>Live bus tracking overview</Text>
              </Box>
              <Button size='xs' variant='light' colorScheme='blue' borderRadius='8px' onClick={() => navigate('/admin/transport/buses')}>Manage</Button>
            </Flex>

            <VStack align='stretch' spacing='16px'>
              {buses.length === 0 && <Text fontSize='sm' color='gray.400'>No active buses found.</Text>}
              {buses.slice(0, 3).map((bus) => (
                <Flex
                  key={bus.id}
                  p='16px'
                  bg={busCardBg}
                  borderRadius='16px'
                  justify='space-between'
                  align='center'
                  transition='all 0.2s'
                  _hover={{ bg: busCardHoverBg }}
                >
                  <HStack spacing='16px'>
                    <IconBox
                      w='40px'
                      h='40px'
                      bg={busIconBg}
                      icon={<Icon as={MdDirectionsBus} color='blue.500' w='20px' h='20px' />}
                    />
                    <Box>
                      <Text fontWeight='800' fontSize='sm'>
                        {bus.number || bus.busNumber}
                      </Text>
                      {bus.driverName && (
                        <Text fontSize='xs' color='gray.500' fontWeight='500'>
                          {bus.driverName} • Driver
                        </Text>
                      )}
                    </Box>
                  </HStack>
                  <Badge
                    variant='subtle'
                    colorScheme={getStatusColor(bus.status)}
                    borderRadius='10px'
                    px='3'
                    py='1'
                    fontSize='10px'
                    fontWeight='800'
                    textTransform='uppercase'
                  >
                    {bus.status}
                  </Badge>
                </Flex>
              ))}
            </VStack>
          </Card>

          {/* Right: Alerts & Actions */}
          <Flex direction='column' gap='24px'>
            <Card p='24px'>
              <Text fontSize='lg' fontWeight='800' mb='20px'>System Alerts</Text>
              <VStack align='stretch' spacing='12px'>
                {recentAlerts.length === 0 && (
                  <Text fontSize='sm' color='gray.500'>System status normal. No alerts.</Text>
                )}
                {recentAlerts.slice(0, 3).map((alert) => (
                  <Alert key={alert.id} status={alert.severity === 'error' ? 'error' : 'info'} borderRadius='12px' fontSize='sm' variant='subtle'>
                    <AlertIcon />
                    <Box flex='1'>
                      <AlertTitle fontSize='sm' fontWeight='700'>{alert.title}</AlertTitle>
                      <AlertDescription fontSize='xs' opacity={0.8}>{alert.message}</AlertDescription>
                    </Box>
                  </Alert>
                ))}
              </VStack>
            </Card>

            <Card p='24px'>
              <Text fontSize='lg' fontWeight='800' mb='20px'>Administrative Shortcuts</Text>
              <SimpleGrid columns={2} spacing={4}>
                <Button
                  leftIcon={<Icon as={MdAdd} />}
                  bgGradient="linear(to-r, blue.400, blue.600)"
                  color='white'
                  _hover={{ bgGradient: 'linear(to-r, blue.500, blue.700)', transform: 'translateY(-2px)' }}
                  _active={{ transform: 'translateY(0)' }}
                  size='md'
                  borderRadius='14px'
                  fontSize='sm'
                  boxShadow="0px 10px 20px rgba(66, 153, 225, 0.3)"
                  onClick={() => navigate('/admin/students/add')}
                >
                  Add Student
                </Button>
                <Button
                  leftIcon={<Icon as={MdCheckCircle} />}
                  variant='outline'
                  colorScheme='green'
                  size='md'
                  borderRadius='14px'
                  fontSize='sm'
                  _hover={{ bg: 'green.50', transform: 'translateY(-2px)' }}
                  onClick={() => navigate('/admin/attendance/daily')}
                >
                  Attendance
                </Button>
                <Button
                  leftIcon={<Icon as={MdBarChart} />}
                  variant='outline'
                  colorScheme='purple'
                  size='md'
                  borderRadius='14px'
                  fontSize='sm'
                  _hover={{ bg: 'purple.50', transform: 'translateY(-2px)' }}
                  onClick={() => navigate('/admin/finance/reports')}
                >
                  Reports
                </Button>
                <Button
                  leftIcon={<Icon as={MdTimer} />}
                  variant='outline'
                  colorScheme='orange'
                  size='md'
                  borderRadius='14px'
                  fontSize='sm'
                  _hover={{ bg: 'orange.50', transform: 'translateY(-2px)' }}
                  onClick={() => navigate('/admin/academics/exams')}
                >
                  Examination
                </Button>
              </SimpleGrid>
            </Card>
          </Flex>
        </SimpleGrid>
      </Box>
    </Box>
  );
}
