import React from 'react';
import { Box, Flex, SimpleGrid, Text, Button, HStack, VStack, Icon, Badge, useColorModeValue } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/card/Card';
import MiniStatistics from '../../components/card/MiniStatistics';
import IconBox from '../../components/icons/IconBox';
import { MdClass, MdPeople, MdCheckCircle, MdAssignment, MdWarningAmber, MdAdd, MdEvent, MdUploadFile, MdMessage, MdLogin } from 'react-icons/md';
import LineChart from '../../components/charts/LineChart';
import BarChart from '../../components/charts/BarChart';

export default function TeacherDashboard() {
  const textSecondary = useColorModeValue('gray.600', 'gray.400');
  const navigate = useNavigate();
  const hoverShadow = useColorModeValue('lg', 'dark-lg');

  // Mock quick stats
  const stats = {
    todaysClasses: 3,
    students: 96,
    attendancePending: 2,
    homeworkDue: 5,
    alerts: 1,
  };

  const homeworkBarSeries = [
    { name: 'Submitted', data: [22, 18, 25, 28, 20] },
    { name: 'Pending', data: [8, 12, 5, 2, 10] },
  ];

  const homeworkBarOptions = {
    chart: { stacked: true, toolbar: { show: false } },
    plotOptions: { bar: { columnWidth: '45%', borderRadius: 4 } },
    dataLabels: { enabled: false },
    xaxis: { categories: ['7A', '7B', '8A', '8B', '9A'] },
    grid: { strokeDashArray: 4 },
    colors: ['#38A169', '#E53E3E'],
    legend: { show: true },
  };

  const attendanceTrendSeries = [
    {
      name: 'Attendance %',
      data: [92, 95, 90, 96, 94, 88, 93],
    },
  ];

  const attendanceTrendOptions = {
    chart: { toolbar: { show: false }, sparkline: { enabled: false } },
    stroke: { curve: 'smooth', width: 3 },
    dataLabels: { enabled: false },
    xaxis: { categories: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] },
    yaxis: { labels: { formatter: (v) => `${v}%` }, min: 0, max: 100 },
    grid: { strokeDashArray: 4 },
    colors: ['#3182CE'],
    tooltip: { y: { formatter: (v) => `${v}%` } },
    legend: { show: false },
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }} overflowX='hidden'
      sx={{
        '.responsive-card': { transition: 'transform .15s ease, box-shadow .15s ease' },
        '.responsive-card:hover': { transform: 'translateY(-4px)', boxShadow: hoverShadow },
      }}
    >
      <Flex align='center' justify='space-between' mb='20px'>
        <Box>
          <Text fontSize='2xl' fontWeight='bold' mb='4px'>Teacher Dashboard</Text>
          <Text fontSize='md' color={textSecondary}>Your teaching overview and quick actions</Text>
        </Box>
        <Button size='sm' colorScheme='blue' leftIcon={<MdLogin />} onClick={()=>navigate('/auth/sign-in')}>Sign In</Button>
      </Flex>

      {/* Overview KPIs - single row with horizontal scroll */}
      <Box mb='20px'>
        <Flex gap='16px' w='100%' flexWrap='nowrap'>
          <Box flex='1 1 0' minW='0'>
            <MiniStatistics
              compact
              startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#4481EB 0%,#04BEFE 100%)' icon={<Icon as={MdClass} w='22px' h='22px' color='white' />} />}
              name="Today's Classes"
              value={String(stats.todaysClasses)}
              trendData={[1,2,2,3,3]}
              trendColor='#4481EB'
            />
          </Box>
          <Box flex='1 1 0' minW='0'>
            <MiniStatistics
              compact
              startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#7F7FD5 0%,#86A8E7 100%)' icon={<Icon as={MdPeople} w='22px' h='22px' color='white' />} />}
              name='Students'
              value={String(stats.students)}
              trendData={[70,80,90,95,96]}
              trendColor='#7F7FD5'
            />
          </Box>
          <Box flex='1 1 0' minW='0'>
            <MiniStatistics
              compact
              startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#01B574 0%,#51CB97 100%)' icon={<Icon as={MdCheckCircle} w='22px' h='22px' color='white' />} />}
              name='Attendance Pending'
              value={String(stats.attendancePending)}
              trendData={[3,2,2,1,2]}
              trendColor='#01B574'
            />
          </Box>
          <Box flex='1 1 0' minW='0'>
            <MiniStatistics
              compact
              startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#FFB36D 0%,#FD7853 100%)' icon={<Icon as={MdAssignment} w='22px' h='22px' color='white' />} />}
              name='Homework Due'
              value={String(stats.homeworkDue)}
              trendData={[2,3,4,5,5]}
              trendColor='#FD7853'
            />
          </Box>
          <Box flex='1 1 0' minW='0'>
            <MiniStatistics
              compact
              startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#f5576c 0%,#f093fb 100%)' icon={<Icon as={MdWarningAmber} w='22px' h='22px' color='white' />} />}
              name='Alerts'
              value={String(stats.alerts)}
              trendData={[0,1,0,1,1]}
              trendColor='#f5576c'
            />
          </Box>
        </Flex>
      </Box>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing='20px'>
        {/* Upcoming Class */}
        <Card p='20px'>
          <Text fontSize='lg' fontWeight='bold' mb='16px'>Upcoming Class</Text>
          <Flex justify='space-between' align='center' mb='10px'>
            <VStack align='start' spacing={1}>
              <Text fontWeight='600'>Class 7B - Mathematics</Text>
              <Text fontSize='sm' color={textSecondary}>Topic: Fractions and Decimals</Text>
            </VStack>
            <HStack>
              <Badge colorScheme='blue'>10:30 AM</Badge>
              <Badge>Room 204</Badge>
            </HStack>
          </Flex>
          <SimpleGrid minChildWidth='150px' spacing='6px' mt='12px'>
            <Button leftIcon={<Icon as={MdCheckCircle} boxSize={{ base: 3.5, md: 4 }} />} colorScheme='green' size='sm' variant='outline' w='100%'
              px={{ base: 2, md: 2.5 }} py={{ base: 1, md: 1.5 }} justifyContent='flex-start' whiteSpace='normal' lineHeight='short' wordBreak='break-word' iconSpacing={2} fontSize={{ base: 'xs', md: 'sm' }}>
              <Box as='span' noOfLines={1} title='Take Attendance' sx={{ hyphens: 'auto' }} textAlign='left'>
                Take Attendance
              </Box>
            </Button>
            <Button leftIcon={<Icon as={MdAssignment} boxSize={{ base: 3.5, md: 4 }} />} colorScheme='purple' size='sm' variant='outline' w='100%'
              px={{ base: 2, md: 2.5 }} py={{ base: 1, md: 1.5 }} justifyContent='flex-start' whiteSpace='normal' lineHeight='short' wordBreak='break-word' iconSpacing={2} fontSize={{ base: 'xs', md: 'sm' }}>
              <Box as='span' noOfLines={1} title='Assign Homework' sx={{ hyphens: 'auto' }} textAlign='left'>
                Assign Homework
              </Box>
            </Button>
            <Button leftIcon={<Icon as={MdEvent} boxSize={{ base: 3.5, md: 4 }} />} colorScheme='blue' size='sm' variant='outline' w='100%'
              px={{ base: 2, md: 2.5 }} py={{ base: 1, md: 1.5 }} justifyContent='flex-start' whiteSpace='normal' lineHeight='short' wordBreak='break-word' iconSpacing={2} fontSize={{ base: 'xs', md: 'sm' }}>
              <Box as='span' noOfLines={1} title='View Timetable' sx={{ hyphens: 'auto' }} textAlign='left'>
                View Timetable
              </Box>
            </Button>
          </SimpleGrid>
        </Card>

        {/* Quick Actions */}
        <Card p='20px'>
          <Text fontSize='lg' fontWeight='bold' mb='16px'>Quick Actions</Text>
          <SimpleGrid minChildWidth='150px' spacing='6px'>
            <Button leftIcon={<Icon as={MdCheckCircle} boxSize={{ base: 3.5, md: 4 }} />} colorScheme='green' variant='solid' size='sm' w='100%'
              px={{ base: 2, md: 2.5 }} py={{ base: 1, md: 1.5 }} justifyContent='flex-start' whiteSpace='normal' lineHeight='short' wordBreak='break-word' iconSpacing={2} fontSize={{ base: 'xs', md: 'sm' }} minW={0} overflowWrap='anywhere'>
              <Box as='span' noOfLines={1} title='Mark Attendance' sx={{ hyphens: 'auto' }} textAlign='left'>
                Mark Attendance
              </Box>
            </Button>
            <Button leftIcon={<Icon as={MdAssignment} boxSize={{ base: 3.5, md: 4 }} />} colorScheme='purple' variant='outline' size='sm' w='100%'
              px={{ base: 2, md: 2.5 }} py={{ base: 1, md: 1.5 }} justifyContent='flex-start' whiteSpace='normal' lineHeight='short' wordBreak='break-word' iconSpacing={2} fontSize={{ base: 'xs', md: 'sm' }} minW={0} overflowWrap='anywhere'>
              <Box as='span' noOfLines={1} title='Create Assignment' sx={{ hyphens: 'auto' }} textAlign='left'>
                Create Assignment
              </Box>
            </Button>
            <Button leftIcon={<Icon as={MdUploadFile} boxSize={{ base: 3.5, md: 4 }} />} colorScheme='blue' variant='outline' size='sm' w='100%'
              px={{ base: 2, md: 2.5 }} py={{ base: 1, md: 1.5 }} justifyContent='flex-start' whiteSpace='normal' lineHeight='short' wordBreak='break-word' iconSpacing={2} fontSize={{ base: 'xs', md: 'sm' }} minW={0} overflowWrap='anywhere'>
              <Box as='span' noOfLines={1} title='Upload Material' sx={{ hyphens: 'auto' }} textAlign='left'>
                Upload Material
              </Box>
            </Button>
            <Button leftIcon={<Icon as={MdMessage} boxSize={{ base: 3.5, md: 4 }} />} colorScheme='gray' variant='outline' size='sm' w='100%'
              px={{ base: 2, md: 2.5 }} py={{ base: 1, md: 1.5 }} justifyContent='flex-start' whiteSpace='normal' lineHeight='short' wordBreak='break-word' iconSpacing={2} fontSize={{ base: 'xs', md: 'sm' }} minW={0} overflowWrap='anywhere'>
              <Box as='span' noOfLines={1} title='Message Parents' sx={{ hyphens: 'auto' }} textAlign='left'>
                Message Parents
              </Box>
            </Button>
            <Button leftIcon={<Icon as={MdEvent} boxSize={{ base: 3.5, md: 4 }} />} colorScheme='blue' variant='outline' size='sm' w='100%'
              px={{ base: 2, md: 2.5 }} py={{ base: 1, md: 1.5 }} justifyContent='flex-start' whiteSpace='normal' lineHeight='short' wordBreak='break-word' iconSpacing={2} fontSize={{ base: 'xs', md: 'sm' }} minW={0} overflowWrap='anywhere'>
              <Box as='span' noOfLines={1} title='Weekly Schedule' sx={{ hyphens: 'auto' }} textAlign='left'>
                Weekly Schedule
              </Box>
            </Button>
            <Button leftIcon={<Icon as={MdAdd} boxSize={{ base: 3.5, md: 4 }} />} colorScheme='teal' variant='outline' size='sm' w='100%'
              px={{ base: 2, md: 2.5 }} py={{ base: 1, md: 1.5 }} justifyContent='flex-start' whiteSpace='normal' lineHeight='short' wordBreak='break-word' iconSpacing={2} fontSize={{ base: 'xs', md: 'sm' }} minW={0} overflowWrap='anywhere'>
              <Box as='span' noOfLines={1} title='Add Note' sx={{ hyphens: 'auto' }} textAlign='left'>
                Add Note
              </Box>
            </Button>
          </SimpleGrid>
        </Card>
      </SimpleGrid>

      {/* Teaching Analytics */}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing='20px' mt='20px'>
        <Card p='20px'>
          <Text fontSize='lg' fontWeight='bold' mb='12px'>Attendance Trend (Last 7 days)</Text>
          <Box h={{ base: '240px', md: '280px' }}>
            <LineChart chartData={attendanceTrendSeries} chartOptions={attendanceTrendOptions} />
          </Box>
        </Card>
        <Card p='20px'>
          <Text fontSize='lg' fontWeight='bold' mb='12px'>Homework Submissions</Text>
          <Box h={{ base: '240px', md: '280px' }}>
            <BarChart chartData={homeworkBarSeries} chartOptions={homeworkBarOptions} />
          </Box>
        </Card>
      </SimpleGrid>
    </Box>
  );
}
