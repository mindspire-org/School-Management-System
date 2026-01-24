import React, { useMemo, useState } from 'react';
import { Box, Text, useColorModeValue, Flex, HStack, Select, Input, SimpleGrid, Badge, Table, Thead, Tbody, Tr, Th, Td, Button, Icon, Tag, TagLabel, TagCloseButton, Tooltip, IconButton } from '@chakra-ui/react';
import Card from '../../../components/card/Card';
import MiniStatistics from '../../../components/card/MiniStatistics';
import IconBox from '../../../components/icons/IconBox';
import BarChart from '../../../components/charts/BarChart';
import PieChart from '../../../components/charts/PieChart';
import { MdDownload, MdRefresh, MdOpenInNew, MdVisibility, MdEdit, MdClass, MdPeople, MdSchedule } from 'react-icons/md';

const sampleClasses = [
  { id: '7A', className: '7', section: 'A', subject: 'Mathematics', strength: 32, next: '10:30 AM' },
  { id: '7B', className: '7', section: 'B', subject: 'Mathematics', strength: 30, next: '11:30 AM' },
  { id: '8A', className: '8', section: 'A', subject: 'Mathematics', strength: 28, next: '12:30 PM' },
  { id: '9A', className: '9', section: 'A', subject: 'Mathematics', strength: 35, next: '02:00 PM' },
];

export default function ClassList() {
  const textSecondary = useColorModeValue('gray.600', 'gray.400');
  const headerBg = useColorModeValue('white', 'gray.800');
  const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.100');
  const gridColor = useColorModeValue('#EDF2F7','#2D3748');
  const hoverShadow = useColorModeValue('lg', 'dark-lg');
  const [q, setQ] = useState('');
  const [grade, setGrade] = useState('');

  const filtered = useMemo(() => {
    return sampleClasses.filter((c) =>
      (!grade || c.className === grade) &&
      (q === '' || `${c.className}${c.section}${c.subject}`.toLowerCase().includes(q.toLowerCase()))
    );
  }, [q, grade]);

  const kpis = useMemo(() => {
    const totalStudents = filtered.reduce((acc, c) => acc + c.strength, 0);
    const next = filtered[0]?.next || '-';
    return {
      totalClasses: filtered.length,
      totalStudents,
      nextPeriod: next,
    };
  }, [filtered]);

  const chartData = useMemo(() => ([
    { name: 'Students', data: filtered.map(c => c.strength) }
  ]), [filtered]);

  const chartOptions = useMemo(() => ({
    chart: { toolbar: { show: false } },
    xaxis: { categories: filtered.map(c => `${c.className}${c.section}`) },
    dataLabels: { enabled: false },
    grid: { borderColor: gridColor },
    colors: ['#3182CE']
  }), [filtered, gridColor]);

  const sectionShare = useMemo(() => {
    const map = {};
    filtered.forEach(c => { map[c.section] = (map[c.section] || 0) + c.strength; });
    const labels = Object.keys(map);
    const values = labels.map(l => map[l]);
    return { labels, values };
  }, [filtered]);

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}
      sx={{ '.responsive-card': { transition: 'transform .15s ease, box-shadow .15s ease' }, '.responsive-card:hover': { transform: 'translateY(-4px)', boxShadow: hoverShadow } }}
    >
      <Text fontSize='2xl' fontWeight='bold' mb='6px'>Class List</Text>
      <Text fontSize='md' color={textSecondary} mb='18px'>Your assigned classes</Text>

      <Box mb='16px'>
        <Flex gap='16px' w='100%' wrap='nowrap'>
          <Box flex='1 1 0' minW={0}>
            <MiniStatistics
              compact
              startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#4481EB 0%,#04BEFE 100%)' icon={<MdClass color='white' />} />}
              name='Total Classes'
              value={String(kpis.totalClasses)}
              trendData={[1,2,2,3,2,3]}
              trendColor='#4481EB'
            />
          </Box>
          <Box flex='1 1 0' minW={0}>
            <MiniStatistics
              compact
              startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#01B574 0%,#51CB97 100%)' icon={<MdPeople color='white' />} />}
              name='Total Students'
              value={String(kpis.totalStudents)}
              trendData={[20,22,21,24,23,25]}
              trendColor='#01B574'
            />
          </Box>
          <Box flex='1 1 0' minW={0}>
            <MiniStatistics
              compact
              startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#B721FF 0%,#21D4FD 100%)' icon={<MdSchedule color='white' />} />}
              name='Next Period'
              value={String(kpis.nextPeriod)}
              trendData={[0,1,0,1,0,1]}
              trendColor='#B721FF'
            />
          </Box>
        </Flex>
      </Box>

      <Card p='16px' mb='16px'>
        <Flex gap={3} flexWrap='wrap' align='center' justify='space-between'>
          <HStack spacing={3} flexWrap='wrap'>
            <Select value={grade} onChange={(e) => setGrade(e.target.value)} w={{ base: '100%', md: '200px' }} size='sm'>
              <option value=''>All Grades</option>
              <option value='7'>Grade 7</option>
              <option value='8'>Grade 8</option>
              <option value='9'>Grade 9</option>
            </Select>
            <Input placeholder='Search class/section/subject' value={q} onChange={(e)=>setQ(e.target.value)} w={{ base: '100%', md: '260px' }} size='sm' />
          </HStack>
          <HStack spacing={2} flexWrap='wrap'>
            <Button size='sm' leftIcon={<Icon as={MdRefresh} />} variant='outline' onClick={()=>{ setQ(''); setGrade(''); }}>Reset</Button>
            <Button size='sm' colorScheme='blue' leftIcon={<Icon as={MdDownload} />} onClick={()=>{
              const rows = filtered.map(c=>({Class:c.className, Section:c.section, Subject:c.subject, Students:c.strength, Next:c.next}));
              const csv = ['Class,Section,Subject,Students,Next', ...rows.map(r=>`${r.Class},${r.Section},${r.Subject},${r.Students},${r.Next}`)].join('\n');
              const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url; a.download = 'classes.csv'; a.click(); URL.revokeObjectURL(url);
            }}>Export CSV</Button>
          </HStack>
        </Flex>
        <HStack spacing={2} mt={3} flexWrap='wrap'>
          {grade && (
            <Tag size='sm' colorScheme='blue' borderRadius='full'>
              <TagLabel>Grade {grade}</TagLabel>
              <TagCloseButton onClick={()=>setGrade('')} />
            </Tag>
          )}
          {q && (
            <Tag size='sm' colorScheme='purple' borderRadius='full'>
              <TagLabel>Search: {q}</TagLabel>
              <TagCloseButton onClick={()=>setQ('')} />
            </Tag>
          )}
        </HStack>
      </Card>

      <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={5} mb='16px'>
        <Card p='16px'>
          <Box>
            <Text fontWeight='700' mb='8px'>Students by Class</Text>
            <BarChart chartData={chartData} chartOptions={chartOptions} height={220} />
          </Box>
        </Card>
        <Card p='16px'>
          <Box>
            <Text fontWeight='700' mb='8px'>Section Share</Text>
            <PieChart height={240} chartData={sectionShare.values} chartOptions={{ labels: sectionShare.labels, legend: { position: 'right' } }} />
          </Box>
        </Card>
      </SimpleGrid>

      <Card p='0'>
        <Box overflowX='auto'>
          <Box minW='720px'>
            <Table size='sm' variant='striped' colorScheme='gray'>
              <Thead bg={headerBg} position='sticky' top={0} zIndex={1} boxShadow='sm'>
                <Tr>
                  <Th>Class</Th>
                  <Th>Section</Th>
                  <Th>Subject</Th>
                  <Th isNumeric>Students</Th>
                  <Th>Next Period</Th>
                  <Th></Th>
                </Tr>
              </Thead>
              <Tbody>
                {filtered.map((c, idx) => (
                  <Tr key={c.id} _hover={{ bg: hoverBg, transform: 'translateY(-1px)' }} transition='all .15s ease'>
                    <Td>{c.className}</Td>
                    <Td>{c.section}</Td>
                    <Td maxW='240px'>
                      <Tooltip label={c.subject} hasArrow>
                        <Box isTruncated>{c.subject}</Box>
                      </Tooltip>
                    </Td>
                    <Td isNumeric>{c.strength}</Td>
                    <Td><Badge colorScheme='blue'>{c.next}</Badge></Td>
                    <Td textAlign='right'>
                      <HStack justify='flex-end' spacing={1}>
                        <Tooltip label='View class'>
                          <IconButton aria-label='View' icon={<Icon as={MdVisibility} />} size='xs' variant='outline' />
                        </Tooltip>
                        <Tooltip label='Edit class'>
                          <IconButton aria-label='Edit' icon={<Icon as={MdEdit} />} size='xs' colorScheme='blue' variant='solid' />
                        </Tooltip>
                      </HStack>
                    </Td>
                  </Tr>
                ))}
                {filtered.length === 0 && (
                  <Tr>
                    <Td colSpan={6} textAlign='center' py={8} color={textSecondary}>No classes found.</Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </Box>
        </Box>
      </Card>
    </Box>
  );
}
