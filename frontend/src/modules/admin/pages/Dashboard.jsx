import React from 'react';
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
} from '@chakra-ui/react';
// Custom components
import Card from '../../../components/card/Card';
import MiniStatistics from '../../../components/card/MiniStatistics';
import IconBox from '../../../components/icons/IconBox';
// Icons
import {
  MdPerson,
  MdPeople,
  MdDirectionsBus,
  MdCheckCircle,
  MdAdd,
  MdBarChart,
  MdTimer,
  MdLocationOn,
  MdCircle,
} from 'react-icons/md';
// Mock data
import {
  mockStats,
  mockBuses,
  mockAlerts,
  mockAttendanceStats,
  mockFeeData,
} from '../../../utils/mockData';
// Helpers
import { formatNumber, formatCurrency, getStatusColor } from '../../../utils/helpers';

export default function AdminDashboard() {
  // Brand color
  const brandColor = 'blue.500';

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      {/* Welcome Message */}
      <Text fontSize='2xl' fontWeight='bold' mb='10px'>
        Admin Dashboard
      </Text>
      <Text fontSize='md' color='gray.500' mb='20px'>
        Welcome back! Here's an overview of your school management system.
      </Text>

      {/* KPI Cards */}
      <Box overflowX='auto' mb='20px'>
        <SimpleGrid minChildWidth='240px' spacing='16px'>
          <MiniStatistics
            startContent={
              <IconBox
                w='48px'
                h='48px'
                bg='linear-gradient(90deg, #4481EB 0%, #04BEFE 100%)'
                icon={<Icon w='24px' h='24px' as={MdPerson} color='white' />}
              />
            }
            name='Total Students'
            value={formatNumber(mockStats.totalStudents)}
            growth='+5%'
            trendData={[900, 1000, 1100, 1150, 1200, 1225, mockStats.totalStudents]}
            trendColor='#4481EB'
            compact
            endContent={
              <Flex me='16px' mt='10px'>
                <Text color='green.500' fontSize='sm' fontWeight='700' me='5px'>
                  +5%
                </Text>
                <Text color='secondaryGray.600' fontSize='sm' fontWeight='500'>
                  since last month
                </Text>
              </Flex>
            }
          />
          
          <MiniStatistics
            startContent={
              <IconBox
                w='48px'
                h='48px'
                bg='linear-gradient(90deg, #868CFF 0%, #4318FF 100%)'
                icon={<Icon w='24px' h='24px' as={MdPeople} color='white' />}
              />
            }
            name='Total Teachers'
            value={formatNumber(mockStats.totalTeachers)}
            growth='+2%'
            trendData={[60, 65, 70, 72, 78, 82, mockStats.totalTeachers]}
            trendColor='#868CFF'
            compact
            endContent={
              <Flex me='16px' mt='10px'>
                <Text color='green.500' fontSize='sm' fontWeight='700' me='5px'>
                  +2%
                </Text>
                <Text color='secondaryGray.600' fontSize='sm' fontWeight='500'>
                  since last month
                </Text>
              </Flex>
            }
          />
          
          <MiniStatistics
            startContent={
              <IconBox
                w='48px'
                h='48px'
                bg='linear-gradient(90deg, #00C6FB 0%, #005BEA 100%)'
                icon={<Icon w='24px' h='24px' as={MdDirectionsBus} color='white' />}
              />
            }
            name='Active Buses'
            value={formatNumber(mockStats.activeBuses)}
            trendData={[8, 9, 10, 11, 12, 11, mockStats.activeBuses]}
            trendColor='#00C6FB'
            compact
            endContent={
              <Box mt='10px' px='10px' py='6px' borderRadius='full' bg='green.50' border='1px solid' borderColor='green.300' boxShadow='sm' fontSize='xs' fontWeight='800' color='green.600' letterSpacing='0.4px' whiteSpace='nowrap'>
                ALL OPERATIONAL
              </Box>
            }
          />
          
          <MiniStatistics
            startContent={
              <IconBox
                w='48px'
                h='48px'
                bg='linear-gradient(90deg, #00F260 0%, #0575E6 100%)'
                icon={<Icon w='24px' h='24px' as={MdCheckCircle} color='white' />}
              />
            }
            name="Today's Attendance"
            value={`${mockStats.todayAttendance}%`}
            growth='+3%'
            trendData={[80, 85, 88, 90, 91, 92, mockStats.todayAttendance]}
            trendColor='#00F260'
            compact
            endContent={
              <Flex me='16px' mt='10px'>
                <Text color='green.500' fontSize='sm' fontWeight='700' me='5px'>
                  +3%
                </Text>
                <Text color='secondaryGray.600' fontSize='sm' fontWeight='500'>
                  from yesterday
                </Text>
              </Flex>
            }
          />
        </SimpleGrid>
      </Box>

      {/* Main Content Row */}
      <SimpleGrid columns={{ base: 1, xl: 2 }} gap='20px' mb='20px'>
        {/* Left: Bus Tracking */}
        <Card p='20px'>
          <Flex justify='space-between' align='center' mb='20px'>
            <Text fontSize='lg' fontWeight='bold'>
              Live Bus Tracking
            </Text>
            <Badge colorScheme='green' fontSize='sm'>
              <Icon as={MdCircle} mr='5px' color='green.500' />
              Live
            </Badge>
          </Flex>
          
          {/* Map Placeholder */}
          <Box h='300px' bg='gray.100' borderRadius='15px' mb='20px'>
            <Flex justify='center' align='center' h='100%'>
              <VStack>
                <Icon as={MdLocationOn} w='50px' h='50px' color='gray.400' />
                <Text color='gray.500'>Interactive Map will be displayed here</Text>
              </VStack>
            </Flex>
          </Box>
          
          {/* Bus List */}
          <VStack align='stretch' spacing='12px'>
            {mockBuses.slice(0, 3).map(bus => (
              <Flex
                key={bus.id}
                p='12px'
                bg='gray.50'
                borderRadius='8px'
                justify='space-between'
                align='center'
              >
                <HStack>
                  <Icon as={MdDirectionsBus} color={bus.status === 'active' ? 'green.500' : 'gray.500'} />
                  <Box>
                    <Text fontWeight='bold' fontSize='sm'>{bus.busNumber}</Text>
                    <Text fontSize='xs' color='gray.500'>{bus.route}</Text>
                  </Box>
                </HStack>
                <Box textAlign='right'>
                  <Badge colorScheme={getStatusColor(bus.status)}>
                    {bus.status}
                  </Badge>
                  <Text fontSize='xs' color='gray.500'>
                    {bus.studentCount}/{bus.maxCapacity} students
                  </Text>
                </Box>
              </Flex>
            ))}
          </VStack>
          
          <Button mt='12px' w='100%' variant='outline' colorScheme='blue'>
            View All Buses
          </Button>
        </Card>

        {/* Right: Alerts & Actions */}
        <Flex direction='column' gap='20px'>
          {/* Recent Alerts */}
          <Card p='20px'>
            <Text fontSize='lg' fontWeight='bold' mb='20px'>
              Recent Alerts
            </Text>
            <VStack align='stretch' spacing='12px'>
              {mockAlerts.map(alert => (
                <Alert
                  key={alert.id}
                  status={alert.type}
                  borderRadius='8px'
                  fontSize='sm'
                >
                  <AlertIcon />
                  <Box flex='1'>
                    <AlertTitle fontSize='sm'>{alert.title}</AlertTitle>
                    <AlertDescription fontSize='xs'>{alert.message}</AlertDescription>
                  </Box>
                  <Text fontSize='xs' color='gray.500'>
                    {alert.time}
                  </Text>
                </Alert>
              ))}
            </VStack>
          </Card>

          {/* Quick Actions */}
          <Card p='20px'>
            <Text fontSize='lg' fontWeight='bold' mb='20px'>
              Quick Actions
            </Text>
            <VStack spacing='12px'>
              <Button
                leftIcon={<MdAdd />}
                w='100%'
                colorScheme='blue'
                variant='solid'
              >
                Add New Student
              </Button>
              <Button
                leftIcon={<MdCheckCircle />}
                w='100%'
                colorScheme='green'
                variant='outline'
              >
                Take Attendance
              </Button>
              <Button
                leftIcon={<MdBarChart />}
                w='100%'
                colorScheme='purple'
                variant='outline'
              >
                Generate Report
              </Button>
              <Button
                leftIcon={<MdTimer />}
                w='100%'
                colorScheme='orange'
                variant='outline'
              >
                Schedule Exam
              </Button>
            </VStack>
          </Card>
        </Flex>
      </SimpleGrid>

      {/* Statistics Row */}
      <SimpleGrid columns={{ base: 1, md: 2 }} gap='20px'>
        {/* Attendance Trend */}
        <Card p='20px'>
          <Text fontSize='lg' fontWeight='bold' mb='20px'>
            Weekly Attendance Trend
          </Text>
          <Box overflowX='auto'>
            <Box display='grid' gridTemplateColumns='repeat(7, minmax(48px, 1fr))' gap='12px' alignItems='end'>
              {mockAttendanceStats.slice(0, 7).map((day) => {
                const barH = Math.round((day.percentage / 100) * 120);
                const color = day.percentage >= 90 ? 'green.400' : day.percentage >= 75 ? 'orange.400' : 'red.400';
                return (
                  <VStack key={day.day} spacing={2} align='center'>
                    <Box h='120px' w='22px' bg='gray.200' borderRadius='6px' position='relative' overflow='hidden'>
                      <Box position='absolute' bottom='0' left='0' right='0' m='auto' w='100%' h={`${barH}px`} bg={color} borderRadius='6px' />
                    </Box>
                    <Text fontSize='xs' color='gray.600'>{day.day}</Text>
                    <Text fontSize='xs' color='gray.500'>{day.percentage}%</Text>
                  </VStack>
                );
              })}
            </Box>
          </Box>
        </Card>

        {/* Fee Collection */}
        <Card p='20px'>
          <Text fontSize='lg' fontWeight='bold' mb='20px'>
            Monthly Fee Collection
          </Text>
          <VStack align='stretch' spacing='12px'>
            {mockFeeData.slice(0, 4).map(month => {
              const total = month.collected + month.pending;
              const percentage = (month.collected / total) * 100;
              
              return (
                <Box key={month.month}>
                  <Flex justify='space-between' mb='4px'>
                    <Text fontSize='sm' fontWeight='500'>{month.month}</Text>
                    <Text fontSize='sm' color='gray.500'>
                      {formatCurrency(month.collected)}
                    </Text>
                  </Flex>
                  <Box h='8px' bg='gray.200' borderRadius='full'>
                    <Box
                      h='100%'
                      w={`${percentage}%`}
                      bg='green.400'
                      borderRadius='full'
                    />
                  </Box>
                </Box>
              );
            })}
          </VStack>
          <Button mt='12px' w='100%' variant='outline' colorScheme='blue'>
            View Detailed Report
          </Button>
        </Card>
      </SimpleGrid>
    </Box>
  );
}
