import React, { useMemo, useState } from 'react';
import { Box, Text, Flex, HStack, SimpleGrid, Select, Input, Button, useColorModeValue, Table, Thead, Tbody, Tr, Th, Td, Tooltip, Badge, Icon, IconButton } from '@chakra-ui/react';
import { MdRefresh, MdFileDownload, MdPhone, MdEmail, MdMessage } from 'react-icons/md';
import Card from '../../../components/card/Card';
import BarChart from '../../../components/charts/BarChart';
import PieChart from '../../../components/charts/PieChart';
import { mockStudents } from '../../../utils/mockData';

export default function ParentContacts() {
  const textSecondary = useColorModeValue('gray.600', 'gray.400');
  const headerBg = useColorModeValue('white', 'gray.800');
  const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.100');
  const gridColor = useColorModeValue('#EDF2F7','#2D3748');

  const [cls, setCls] = useState('');
  const [section, setSection] = useState('');
  const [q, setQ] = useState('');

  const classes = useMemo(() => Array.from(new Set(mockStudents.map(s => s.class))).sort(), []);
  const sections = useMemo(() => Array.from(new Set(mockStudents.map(s => s.section))).sort(), []);

  const rows = useMemo(() => mockStudents.map(s => ({
    id: s.id,
    parent: s.parentName,
    student: s.name,
    cls: s.class,
    section: s.section,
    phone: s.parentPhone,
    email: s.email,
    tag: s.rfidTag,
  })), []);

  const filtered = useMemo(() => rows.filter(r =>
    (!cls || r.cls === cls) && (!section || r.section === section) && (!q || `${r.parent}${r.student}${r.phone}${r.email}`.toLowerCase().includes(q.toLowerCase()))
  ), [rows, cls, section, q]);

  const chartData = useMemo(() => ([{
    name: 'Contacts',
    data: Object.values(filtered.reduce((acc, r) => { const key = `${r.cls}-${r.section}`; acc[key] = (acc[key] || 0) + 1; return acc; }, {}))
  }]), [filtered]);
  const chartOptions = useMemo(() => ({
    chart: { toolbar: { show: false } },
    xaxis: { categories: Object.keys(filtered.reduce((acc, r) => { const key = `${r.cls}-${r.section}`; acc[key] = (acc[key] || 0) + 1; return acc; }, {})) },
    dataLabels: { enabled: false },
    colors: ['#3182CE'],
    grid: { borderColor: gridColor },
  }), [filtered, gridColor]);

  const methodDistribution = useMemo(() => {
    const phone = filtered.filter(r => !!r.phone).length;
    const email = filtered.filter(r => !!r.email).length;
    return { labels: ['Phone','Email'], values: [phone, email] };
  }, [filtered]);

  const exportCSV = () => {
    const header = ['Parent','Student','Class','Section','Phone','Email','Tag'];
    const data = filtered.map(r => [r.parent, r.student, r.cls, r.section, r.phone, r.email, r.tag]);
    const csv = [header, ...data].map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'parent_contacts.csv'; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Text fontSize='2xl' fontWeight='bold' mb='6px'>Parent Contacts</Text>
      <Text fontSize='md' color={textSecondary} mb='16px'>Quick access to parent details</Text>

      <Card p='16px' mb='16px'>
        <Flex gap={3} flexWrap='wrap' justify='space-between' align='center'>
          <HStack spacing={3} flexWrap='wrap' rowGap={3}>
            <Select placeholder='Class' value={cls} onChange={e=>setCls(e.target.value)} size='sm' maxW='160px'>{classes.map(c=> <option key={c}>{c}</option>)}</Select>
            <Select placeholder='Section' value={section} onChange={e=>setSection(e.target.value)} size='sm' maxW='160px'>{sections.map(s=> <option key={s}>{s}</option>)}</Select>
            <Input placeholder='Search parent/student/phone' value={q} onChange={e=>setQ(e.target.value)} size='sm' maxW='260px' />
          </HStack>
          <HStack>
            <Button size='sm' variant='outline' leftIcon={<Icon as={MdRefresh}/>} onClick={()=>{setCls('');setSection('');setQ('');}}>Reset</Button>
            <Button size='sm' colorScheme='blue' leftIcon={<Icon as={MdFileDownload}/>} onClick={exportCSV}>Export CSV</Button>
          </HStack>
        </Flex>
      </Card>

      <Card p='0' mb='16px'>
        <Box overflowX='auto'>
          <Box minW='880px'>
            <Table size='sm' variant='striped' colorScheme='gray'>
              <Thead position='sticky' top={0} bg={headerBg} zIndex={1} boxShadow='sm'>
                <Tr>
                  <Th>Parent</Th>
                  <Th>Student</Th>
                  <Th>Class</Th>
                  <Th>Phone</Th>
                  <Th>Email</Th>
                  <Th textAlign='right'>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filtered.map(r => (
                  <Tr key={r.id} _hover={{ bg: hoverBg }}>
                    <Td><Tooltip label={r.parent}><Box isTruncated maxW='220px'>{r.parent}</Box></Tooltip></Td>
                    <Td><Tooltip label={r.student}><Box isTruncated maxW='220px'>{r.student}</Box></Tooltip></Td>
                    <Td>{r.cls}-{r.section}</Td>
                    <Td>{r.phone}</Td>
                    <Td>{r.email}</Td>
                    <Td>
                      <HStack justify='flex-end' spacing={2}>
                        <Tooltip label='Message'><IconButton aria-label='Message' icon={<MdMessage/>} size='sm' variant='ghost' /></Tooltip>
                        <Tooltip label='Call'><IconButton aria-label='Call' icon={<MdPhone/>} size='sm' variant='ghost' /></Tooltip>
                        <Tooltip label='Email'><IconButton aria-label='Email' icon={<MdEmail/>} size='sm' variant='ghost' /></Tooltip>
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Box>
      </Card>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
        <Card p='16px'>
          <Text fontWeight='700' mb='8px'>Contacts by Class-Section</Text>
          <BarChart chartData={chartData} chartOptions={chartOptions} height={220} />
        </Card>
        <Card p='16px'>
          <Text fontWeight='700' mb='8px'>Contact Methods</Text>
          <PieChart height={240} chartData={methodDistribution.values} chartOptions={{ labels: methodDistribution.labels, legend:{ position:'right' } }} />
        </Card>
      </SimpleGrid>
    </Box>
  );
}
