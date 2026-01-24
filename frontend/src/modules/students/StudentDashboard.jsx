import React from 'react';
import { Box, Flex, SimpleGrid, Text, Button, HStack, VStack, Badge, Icon, useColorModeValue } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/card/Card';
import MiniStatistics from '../../components/card/MiniStatistics';
import IconBox from '../../components/icons/IconBox';
import { MdClass, MdCheckCircle, MdAssignment, MdOutlineEvent, MdNotificationsActive, MdLogin } from 'react-icons/md';
import BarChart from '../../components/charts/BarChart';
import LineAreaChart from '../../components/charts/LineAreaChart';
import { mockTodayClasses } from '../../utils/mockData';

export default function StudentDashboard() {
  const textSecondary = useColorModeValue('gray.600', 'gray.400');
  const navigate = useNavigate();

  const stats = {
    todaysClasses: mockTodayClasses.length,
    attendance: 92,
    pendingAssignments: 2,
    upcomingExams: 1,
    notifications: 3,
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Flex align='center' justify='space-between' mb='20px'>
        <Box>
          <Text fontSize='2xl' fontWeight='bold' mb='4px'>Student Dashboard</Text>
          <Text fontSize='md' color={textSecondary}>Your classes, assignments and updates</Text>
        </Box>
        <Button size='sm' colorScheme='blue' leftIcon={<MdLogin />} onClick={()=>navigate('/auth/sign-in')}>Sign In</Button>
      </Flex>

      <Box mb='20px'>
        <Flex gap='16px' w='100%' wrap='nowrap'>
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#4481EB 0%,#04BEFE 100%)' icon={<Icon as={MdClass} w='22px' h='22px' color='white' />} />}
            name="Today's Classes"
            value={String(stats.todaysClasses)}
            trendData={[2,3,4,5,5]}
            trendColor='#4481EB'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#01B574 0%,#51CB97 100%)' icon={<Icon as={MdCheckCircle} w='22px' h='22px' color='white' />} />}
            name='Attendance %'
            value={`${stats.attendance}%`}
            trendData={[88,90,91,92,92]}
            trendColor='#01B574'
            trendFormatter={(v)=>`${v}%`}
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#FFB36D 0%,#FD7853 100%)' icon={<Icon as={MdAssignment} w='22px' h='22px' color='white' />} />}
            name='Pending Assignments'
            value={String(stats.pendingAssignments)}
            trendData={[1,2,2,2,2]}
            trendColor='#FD7853'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#667eea 0%,#764ba2 100%)' icon={<Icon as={MdOutlineEvent} w='22px' h='22px' color='white' />} />}
            name='Upcoming Exams'
            value={String(stats.upcomingExams)}
            trendData={[0,1,1,1,1]}
            trendColor='#667eea'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#f5576c 0%,#f093fb 100%)' icon={<Icon as={MdNotificationsActive} w='22px' h='22px' color='white' />} />}
            name='Notifications'
            value={String(stats.notifications)}
            trendData={[1,2,2,3,3]}
            trendColor='#f5576c'
          />
        </Flex>
      </Box>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing='20px'>
        <Card p='20px'>
          <Text fontSize='lg' fontWeight='bold' mb='16px'>Today’s Schedule</Text>
          <VStack align='stretch' spacing={3}>
            {mockTodayClasses.map((c) => (
              <Flex key={c.id} justify='space-between' p='10px' bg={useColorModeValue('gray.50','gray.700')} borderRadius='8px'>
                <Text fontWeight='600' isTruncated maxW='60%'>
                  {c.subject} - {c.topic || c.className}
                </Text>
                <HStack>
                  <Badge colorScheme='blue'>{c.time}</Badge>
                  <Badge>{c.room}</Badge>
                </HStack>
              </Flex>
            ))}
          </VStack>
        </Card>

        <Card p='20px'>
          <Text fontSize='lg' fontWeight='bold' mb='16px'>Quick Actions</Text>
          <SimpleGrid minChildWidth='200px' spacing='12px' minW='0'>
            <Button w='100%' justifyContent='flex-start' flexWrap='wrap' size='sm' leftIcon={<MdAssignment />} colorScheme='purple' variant='outline' whiteSpace='normal' wordBreak='break-word' lineHeight='1.2' h='auto' px={4} sx={{ overflowWrap: 'anywhere' }}>View Assignments</Button>
            <Button w='100%' justifyContent='flex-start' flexWrap='wrap' size='sm' leftIcon={<MdCheckCircle />} colorScheme='green' variant='outline' whiteSpace='normal' wordBreak='break-word' lineHeight='1.2' h='auto' px={4} sx={{ overflowWrap: 'anywhere' }}>Attendance</Button>
            <Button w='100%' justifyContent='flex-start' flexWrap='wrap' size='sm' leftIcon={<MdOutlineEvent />} colorScheme='blue' variant='outline' whiteSpace='normal' wordBreak='break-word' lineHeight='1.2' h='auto' px={4} sx={{ overflowWrap: 'anywhere' }}>Exam Timetable</Button>
            <Button w='100%' justifyContent='flex-start' flexWrap='wrap' size='sm' leftIcon={<MdNotificationsActive />} colorScheme='gray' variant='outline' whiteSpace='normal' wordBreak='break-word' lineHeight='1.2' h='auto' px={4} sx={{ overflowWrap: 'anywhere' }}>Announcements</Button>
            <Button w='100%' justifyContent='flex-start' flexWrap='wrap' size='sm' leftIcon={<MdClass />} colorScheme='teal' variant='outline' whiteSpace='normal' wordBreak='break-word' lineHeight='1.2' h='auto' px={4} sx={{ overflowWrap: 'anywhere' }}>My Classes</Button>
          </SimpleGrid>
        </Card>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing='20px' mt='20px'>
        <Card p='16px'>
          <Text fontSize='lg' fontWeight='bold' mb='12px'>Attendance Trend</Text>
          <LineAreaChart
            chartData={[{ name: 'Attendance %', data: [88, 90, 91, 92, 92] }]}
            chartOptions={{
              chart: { toolbar: { show: false } },
              stroke: { curve: 'smooth', width: 3 },
              fill: { type: 'gradient', gradient: { shadeIntensity: 0.2, opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 90, 100] } },
              xaxis: { categories: ['W1','W2','W3','W4','W5'] },
              colors: ['#01B574'],
              dataLabels: { enabled: false },
              grid: { padding: { left: 12, right: 12 } },
              tooltip: { enabled: true, shared: true, intersect: false, y: { formatter: (v)=>`${v}%` } },
            }}
          />
        </Card>
        <Card p='16px'>
          <Text fontSize='lg' fontWeight='bold' mb='12px'>Study Overview</Text>
          <BarChart
            chartData={[{ name: 'Assignments Completed', data: [3, 4, 5, 6, 7] }, { name: 'Exams Attempted', data: [1, 1, 2, 2, 3] }]}
            chartOptions={{ xaxis: { categories: ['Jan','Feb','Mar','Apr','May'] }, colors: ['#4481EB', '#667eea'], dataLabels: { enabled: false }, legend: { position: 'top' } }}
            height={220}
          />
        </Card>
      </SimpleGrid>
    </Box>
  );
}
