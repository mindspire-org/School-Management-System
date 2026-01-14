import React, { useMemo, useState } from 'react';
import {
  Box,
  Text,
  Flex,
  HStack,
  VStack,
  SimpleGrid,
  Select,
  Input,
  Button,
  Avatar,
  Badge,
  useColorModeValue,
  Tooltip,
  Icon,
} from '@chakra-ui/react';
import { MdRefresh, MdEdit, MdMessage, MdPhone, MdEmail, MdPerson } from 'react-icons/md';
import Card from '../../../components/card/Card';
import MiniStatistics from '../../../components/card/MiniStatistics';
import IconBox from '../../../components/icons/IconBox';
import LineChart from '../../../components/charts/LineChart';
import PieChart from '../../../components/charts/PieChart';
import { mockStudents, mockAttendanceStats } from '../../../utils/mockData';

export default function StudentProfile() {
  const textSecondary = useColorModeValue('gray.600', 'gray.400');
  const gridColor = useColorModeValue('#EDF2F7','#2D3748');
  const [cls, setCls] = useState('');
  const [section, setSection] = useState('');
  const [q, setQ] = useState('');
  const [id, setId] = useState('');

  const classes = useMemo(() => Array.from(new Set(mockStudents.map(s => s.class))).sort(), []);
  const sections = useMemo(() => Array.from(new Set(mockStudents.map(s => s.section))).sort(), []);
  const candidates = useMemo(() => mockStudents.filter(s =>
    (!cls || s.class === cls) && (!section || s.section === section) && (!q || s.name.toLowerCase().includes(q.toLowerCase()) || s.rollNumber.toLowerCase().includes(q.toLowerCase()))
  ), [cls, section, q]);

  const selected = useMemo(() => {
    if (id) return mockStudents.find(s => String(s.id) === String(id));
    return candidates[0] || mockStudents[0];
  }, [id, candidates]);

  const chartData = useMemo(() => ([{ name: 'Attendance %', data: mockAttendanceStats.map(x => x.percentage) }]), []);
  const chartOptions = useMemo(() => ({
    chart: { toolbar: { show: false } },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 3 },
    xaxis: { categories: mockAttendanceStats.map(x => x.day) },
    colors: ['#3182CE'],
    grid: { borderColor: gridColor },
  }), [gridColor]);

  const attendanceBuckets = useMemo(() => {
    const buckets = { '≥90%': 0, '80-89%': 0, '<80%': 0 };
    mockAttendanceStats.forEach(x => {
      if (x.percentage >= 90) buckets['≥90%'] += 1;
      else if (x.percentage >= 80) buckets['80-89%'] += 1;
      else buckets['<80%'] += 1;
    });
    return { labels: Object.keys(buckets), values: Object.values(buckets) };
  }, []);

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Text fontSize='2xl' fontWeight='bold' mb='6px'>Student Profile</Text>
      <Text fontSize='md' color={textSecondary} mb='16px'>View and act on student details</Text>

      <Card p='16px' mb='16px'>
        <Flex gap={3} flexWrap='wrap' justify='space-between' align='center'>
          <HStack spacing={3} flexWrap='wrap' rowGap={3}>
            <Select placeholder='Class' value={cls} onChange={e=>setCls(e.target.value)} size='sm' maxW='160px'>{classes.map(c=> <option key={c}>{c}</option>)}</Select>
            <Select placeholder='Section' value={section} onChange={e=>setSection(e.target.value)} size='sm' maxW='160px'>{sections.map(s=> <option key={s}>{s}</option>)}</Select>
            <Input placeholder='Search name or roll' value={q} onChange={e=>setQ(e.target.value)} size='sm' maxW='220px' />
            <Select placeholder='Select student' value={id} onChange={e=>setId(e.target.value)} size='sm' maxW='220px'>
              {candidates.map(s => <option key={s.id} value={s.id}>{s.name} ({s.rollNumber})</option>)}
            </Select>
          </HStack>
          <HStack>
            <Button size='sm' variant='outline' leftIcon={<Icon as={MdRefresh}/>} onClick={()=>{setCls('');setSection('');setQ('');setId('');}}>Reset</Button>
            <Button size='sm' colorScheme='blue' leftIcon={<Icon as={MdEdit}/>}>Edit</Button>
          </HStack>
        </Flex>
      </Card>

      {selected && (
        <>
          <Card p='20px' mb='16px'>
            <Flex gap={4} align='center' flexWrap='wrap'>
              <Avatar name={selected.name} src={selected.avatar} size='lg' />
              <Box>
                <Tooltip label={selected.name}><Text fontSize='xl' fontWeight='800' isTruncated maxW='320px'>{selected.name}</Text></Tooltip>
                <Text fontSize='sm' color={textSecondary}>{selected.rollNumber} • Class {selected.class}-{selected.section}</Text>
                <HStack mt={2} spacing={2} flexWrap='wrap'>
                  <Badge colorScheme='purple'>RFID: {selected.rfidTag}</Badge>
                  <Badge colorScheme='blue'>Bus: {selected.busNumber}</Badge>
                  <Badge colorScheme={selected.attendance>=90?'green':selected.attendance>=80?'yellow':'red'}>Attendance {selected.attendance}%</Badge>
                </HStack>
              </Box>
              <Flex gap={2} ml='auto' wrap='wrap'>
                <Button size='sm' leftIcon={<Icon as={MdMessage}/>} variant='outline'>Message Parent</Button>
                <Button size='sm' leftIcon={<Icon as={MdPhone}/>} variant='outline'>Call</Button>
                <Button size='sm' leftIcon={<Icon as={MdEmail}/>} colorScheme='blue'>Email</Button>
              </Flex>
            </Flex>
          </Card>

          <Box mb='16px'>
            <Flex gap='16px' w='100%' wrap='nowrap'>
              <MiniStatistics compact startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#4481EB 0%,#04BEFE 100%)' icon={<MdPerson color='white' />} />} name='Parent' value={String(selected.parentName)} trendData={[1,1,1,1,1,1]} trendColor='#4481EB' />
              <MiniStatistics compact startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#01B574 0%,#51CB97 100%)' icon={<MdPhone color='white' />} />} name='Phone' value={String(selected.parentPhone)} trendData={[1,1,1,1,1,1]} trendColor='#01B574' />
              <MiniStatistics compact startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#B721FF 0%,#21D4FD 100%)' icon={<MdEmail color='white' />} />} name='Email' value={String(selected.email)} trendData={[1,1,1,1,1,1]} trendColor='#B721FF' />
            </Flex>
          </Box>
        </>
      )}

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
        <Card p='16px'>
          <Text fontWeight='700' mb='8px'>Attendance Trend</Text>
          <LineChart chartData={chartData} chartOptions={chartOptions} height={220} />
        </Card>
        <Card p='16px'>
          <Text fontWeight='700' mb='8px'>Attendance Buckets</Text>
          <PieChart height={240} chartData={attendanceBuckets.values} chartOptions={{ labels: attendanceBuckets.labels, legend:{ position:'right' } }} />
        </Card>
      </SimpleGrid>
    </Box>
  );
}
