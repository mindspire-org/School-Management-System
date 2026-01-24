import React, { useMemo, useState } from 'react';
import { Box, Text, useColorModeValue, Flex, Select, Input, Table, Thead, Tbody, Tr, Th, Td, Badge, HStack, Tooltip, IconButton, Icon, Button, SimpleGrid, VStack } from '@chakra-ui/react';
import { MdVisibility, MdEdit, MdClass, MdMenuBook, MdAccessTime } from 'react-icons/md';
import Card from '../../../components/card/Card';
import MiniStatistics from '../../../components/card/MiniStatistics';
import IconBox from '../../../components/icons/IconBox';
import BarChart from '../../../components/charts/BarChart';
import PieChart from '../../../components/charts/PieChart';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const periods = ['8:00', '9:00', '10:00', '11:00', '12:00', '2:00'];

const sampleTT = {
  '7A': {
    Mon: ['Math', 'Eng', 'Sci', 'Break', 'Geo', 'Sports'],
    Tue: ['Math', 'Bio', 'Chem', 'Break', 'CS', 'Sports'],
    Wed: ['CS', 'Eng', 'Math', 'Break', 'Phys', 'Arts'],
    Thu: ['Math', 'Eng', 'Sci', 'Break', 'Geo', 'Sports'],
    Fri: ['Math', 'Bio', 'Chem', 'Break', 'CS', 'Sports'],
  },
  '7B': {
    Mon: ['Eng', 'Math', 'Sci', 'Break', 'Hist', 'Sports'],
    Tue: ['Eng', 'Math', 'Chem', 'Break', 'CS', 'Sports'],
    Wed: ['CS', 'Eng', 'Math', 'Break', 'Phys', 'Arts'],
    Thu: ['Math', 'Eng', 'Sci', 'Break', 'Geo', 'Sports'],
    Fri: ['Math', 'Bio', 'Chem', 'Break', 'CS', 'Sports'],
  },
};

export default function ClassTimetable() {
  const textSecondary = useColorModeValue('gray.600', 'gray.400');
  const headerBg = useColorModeValue('white', 'gray.800');
  const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.100');
  const gridColor = useColorModeValue('#EDF2F7','#2D3748');
  const hoverShadow = useColorModeValue('lg', 'dark-lg');
  const [cls, setCls] = useState('7A');
  const [q, setQ] = useState('');

  const data = useMemo(() => sampleTT[cls] || {}, [cls]);

  const stats = useMemo(() => {
    const all = Object.values(data).flat();
    const periods = all.filter(s => s && s !== 'Break').length;
    const subjects = new Set(all.filter(s => s && s !== 'Break'));
    const breaks = all.filter(s => s === 'Break').length;
    return { periods, subjects: subjects.size, breaks };
  }, [data]);

  const chart = useMemo(() => {
    const counts = {};
    Object.values(data).forEach(arr => {
      (arr || []).forEach(s => {
        if (!s || s === 'Break') return;
        counts[s] = (counts[s] || 0) + 1;
      });
    });
    const subjects = Object.keys(counts);
    return {
      options: {
        chart: { toolbar: { show: false } },
        xaxis: { categories: subjects },
        dataLabels: { enabled: false },
        grid: { borderColor: gridColor },
        colors: ['#3182CE'],
      },
      series: [{ name: 'Periods', data: subjects.map(s => counts[s]) }],
    };
  }, [data, gridColor]);

  const subjectShare = useMemo(() => {
    const counts = {};
    Object.values(data).forEach(arr => {
      (arr || []).forEach(s => { if (s && s !== 'Break') counts[s] = (counts[s] || 0) + 1; });
    });
    const labels = Object.keys(counts);
    const values = labels.map(l => counts[l]);
    return { labels, values };
  }, [data]);

  const periodsByDay = useMemo(() => {
    const labels = days;
    const values = labels.map(d => (data[d] || []).filter(s => s && s !== 'Break').length);
    return { labels, values };
  }, [data]);

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}
      sx={{ '.responsive-card': { transition: 'transform .15s ease, box-shadow .15s ease' }, '.responsive-card:hover': { transform: 'translateY(-4px)', boxShadow: hoverShadow } }}
    >
      <Text fontSize='2xl' fontWeight='bold' mb='6px'>Class Timetable</Text>
      <Text fontSize='md' color={textSecondary} mb='18px'>Daily and weekly schedule</Text>

      <Box mb='16px'>
        <Flex gap='16px' w='100%' wrap='nowrap'>
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#01B574 0%,#51CB97 100%)' icon={<MdClass color='white' />} />}
            name='Periods'
            value={String(stats.periods)}
            trendData={[2,3,2,3,3,4]}
            trendColor='#01B574'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#4481EB 0%,#04BEFE 100%)' icon={<MdMenuBook color='white' />} />}
            name='Subjects'
            value={String(stats.subjects)}
            trendData={[1,1,2,2,3,3]}
            trendColor='#4481EB'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#FFB36D 0%,#FD7853 100%)' icon={<MdAccessTime color='white' />} />}
            name='Breaks'
            value={String(stats.breaks)}
            trendData={[0,1,1,1,0,1]}
            trendColor='#FD7853'
          />
        </Flex>
      </Box>

      <Card p='16px' mb='16px'>
        <Flex gap={3} flexWrap='wrap'>
          <Select value={cls} onChange={(e)=>setCls(e.target.value)} w={{ base: '100%', md: '200px' }} size='sm'>
            <option value='7A'>Class 7A</option>
            <option value='7B'>Class 7B</option>
          </Select>
          <Input placeholder='Search subject' value={q} onChange={(e)=>setQ(e.target.value)} w={{ base: '100%', md: '260px' }} size='sm' />
        </Flex>
      </Card>

      <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={5} mb='16px'>
        <Card p='16px'>
          <Box>
            <Text fontWeight='700' mb='8px'>Subject Distribution</Text>
            <PieChart height={240} chartData={subjectShare.values} chartOptions={{ labels: subjectShare.labels, legend:{ position:'right' } }} />
          </Box>
        </Card>
        <Card p='16px'>
          <Box>
            <Text fontWeight='700' mb='8px'>Periods by Day</Text>
            <BarChart chartData={[{ name: 'Periods', data: periodsByDay.values }]} chartOptions={{ ...chart.options, xaxis:{ categories: periodsByDay.labels } }} height={220} />
          </Box>
        </Card>
      </SimpleGrid>

      <Card p='0'>
        <Box overflowX='auto'>
          <Box minW='880px'>
            <Table size='sm' variant='simple'>
              <Thead bg={headerBg} position='sticky' top={0} zIndex={1}>
                <Tr>
                  <Th>Day / Period</Th>
                  {periods.map(p => <Th key={p}>{p}</Th>)}
                  <Th textAlign='right'>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {days.map(d => (
                  <Tr key={d} _hover={{ bg: hoverBg }}>
                    <Td fontWeight='700'>{d}</Td>
                    {periods.map((p, idx) => {
                      const subj = (data[d] || [])[idx] || '-';
                      const visible = q ? subj.toLowerCase().includes(q.toLowerCase()) : true;
                      const isBreak = subj === 'Break';
                      return (
                        <Td key={`${d}-${p}`} py={2}>
                          <Text fontSize='sm' color={isBreak ? textSecondary : undefined} fontWeight={isBreak ? 'normal' : '600'}>
                            {visible ? (isBreak ? '-' : subj) : '-'}
                          </Text>
                        </Td>
                      );
                    })}
                    <Td textAlign='right' py={2}>
                      <HStack justify='flex-end' spacing={3}>
                        <Button variant='link' size='sm'>View</Button>
                        <Button variant='link' size='sm' colorScheme='blue'>Edit</Button>
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Box>
      </Card>
    </Box>
  );
}
