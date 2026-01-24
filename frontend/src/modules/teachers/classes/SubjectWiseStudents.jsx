import React, { useMemo, useState } from 'react';
import { Box, Text, useColorModeValue, Flex, HStack, Select, Input, SimpleGrid, Badge, Avatar, VStack, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Button, Divider, Tooltip } from '@chakra-ui/react';
import Card from '../../../components/card/Card';
import MiniStatistics from '../../../components/card/MiniStatistics';
import IconBox from '../../../components/icons/IconBox';
import { MdSubject, MdPeople, MdLabel } from 'react-icons/md';
import BarChart from '../../../components/charts/BarChart';
import PieChart from '../../../components/charts/PieChart';

const sampleData = [
  { subject: 'Algebra', students: [
    { id: 'STU101', name: 'Mahnoor Khan', className: '7', section: 'A' },
    { id: 'STU102', name: 'Ali Raza', className: '7', section: 'B' },
    { id: 'STU103', name: 'Hassan Javed', className: '8', section: 'A' },
  ]},
  { subject: 'Physics', students: [
    { id: 'STU104', name: 'Ayesha Tariq', className: '8', section: 'B' },
    { id: 'STU105', name: 'Usman Akbar', className: '7', section: 'A' },
  ]},
  { subject: 'English', students: [
    { id: 'STU106', name: 'Hamza Khan', className: '9', section: 'A' },
    { id: 'STU107', name: 'Sara Ahmed', className: '9', section: 'B' },
  ]},
];

export default function SubjectWiseStudents() {
  const textSecondary = useColorModeValue('gray.600', 'gray.400');
  const headerBg = useColorModeValue('white', 'gray.800');
  const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.100');
  const gridColor = useColorModeValue('#EDF2F7','#2D3748');
  const hoverShadow = useColorModeValue('lg', 'dark-lg');
  const [q, setQ] = useState('');
  const [grade, setGrade] = useState('');
  const [subject, setSubject] = useState('');
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);

  const subjects = sampleData.map(s => s.subject);

  const filtered = useMemo(() => {
    const list = subject ? sampleData.filter(s => s.subject === subject) : sampleData;
    return list.map(group => ({
      ...group,
      students: group.students.filter(st =>
        (!grade || st.className === grade) &&
        (q === '' || `${st.name}${st.id}${st.className}${st.section}`.toLowerCase().includes(q.toLowerCase()))
      )
    }));
  }, [q, grade, subject]);

  const stats = useMemo(() => {
    const subjectCount = filtered.filter(g => g.students.length > 0).length;
    const totalStudents = filtered.reduce((a,g)=> a + g.students.length, 0);
    return { subjectCount, totalStudents };
  }, [filtered]);

  const chartData = useMemo(() => ([
    { name: 'Students', data: filtered.map(g => g.students.length) }
  ]), [filtered]);

  const chartOptions = useMemo(() => ({
    chart: { toolbar: { show: false } },
    xaxis: { categories: filtered.map(g => g.subject) },
    dataLabels: { enabled: false },
    grid: { borderColor: gridColor },
    colors: ['#3182CE']
  }), [filtered, gridColor]);

  const classDistribution = useMemo(() => {
    const map = {};
    filtered.forEach(group => {
      group.students.forEach(st => {
        const key = `${st.className}-${st.section}`;
        map[key] = (map[key] || 0) + 1;
      });
    });
    const labels = Object.keys(map);
    const values = labels.map(l => map[l]);
    return { labels, values };
  }, [filtered]);

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}
      sx={{ '.responsive-card': { transition: 'transform .15s ease, box-shadow .15s ease' }, '.responsive-card:hover': { transform: 'translateY(-4px)', boxShadow: hoverShadow } }}
    >
      <Text fontSize='2xl' fontWeight='bold' mb='6px'>Subject-wise Students</Text>
      <Text fontSize='md' color={textSecondary} mb='18px'>Students grouped by subject</Text>

      <Box mb='16px'>
        <Flex gap='16px' w='100%' wrap='nowrap'>
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#4481EB 0%,#04BEFE 100%)' icon={<MdSubject color='white' />} />}
            name='Subjects'
            value={String(stats.subjectCount)}
            trendData={[1,1,2,2,3,3]}
            trendColor='#4481EB'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#01B574 0%,#51CB97 100%)' icon={<MdPeople color='white' />} />}
            name='Total Students'
            value={String(stats.totalStudents)}
            trendData={[20,22,24,26,28,30]}
            trendColor='#01B574'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#B721FF 0%,#21D4FD 100%)' icon={<MdLabel color='white' />} />}
            name='Selected Subject'
            value={String(subject || 'All')}
            trendData={[1,1,1,1,1,1]}
            trendColor='#B721FF'
          />
        </Flex>
      </Box>

      <Card p='16px' mb='16px'>
        <Flex gap={3} flexWrap='wrap'>
          <Select value={subject} onChange={(e)=>setSubject(e.target.value)} w={{ base: '100%', md: '200px' }} size='sm'>
            <option value=''>All Subjects</option>
            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
          </Select>
          <Select value={grade} onChange={(e) => setGrade(e.target.value)} w={{ base: '100%', md: '200px' }} size='sm'>
            <option value=''>All Grades</option>
            <option value='7'>Grade 7</option>
            <option value='8'>Grade 8</option>
            <option value='9'>Grade 9</option>
          </Select>
          <Input placeholder='Search student/roll' value={q} onChange={(e)=>setQ(e.target.value)} w={{ base: '100%', md: '260px' }} size='sm' />
        </Flex>
      </Card>

      <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={5} mb='16px'>
        <Card p='16px'>
          <Box>
            <Text fontWeight='700' mb='8px'>Students by Subject</Text>
            <BarChart chartData={chartData} chartOptions={chartOptions} height={220} />
          </Box>
        </Card>
        <Card p='16px'>
          <Box>
            <Text fontWeight='700' mb='8px'>Class-Section Distribution</Text>
            <PieChart height={240} chartData={classDistribution.values} chartOptions={{ labels: classDistribution.labels, legend:{ position:'right' } }} />
          </Box>
        </Card>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing='16px'>
        {filtered.map(group => (
          <Card key={group.subject} p='16px'>
            <Flex justify='space-between' align='center' mb='10px' gap={3} flexWrap='wrap'>
              <Text fontWeight='700'>{group.subject}</Text>
              <Badge colorScheme='blue'>{group.students.length} students</Badge>
            </Flex>
            <Box overflowX='auto'>
              <Box minW='520px'>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing='8px'>
                  {group.students.map(st => (
                    <Flex key={st.id} p='10px' borderWidth='1px' borderRadius='10px' align='center' gap={3} bg={useColorModeValue('white','gray.700')}
                      _hover={{ boxShadow: 'md', bg: hoverBg }} cursor='pointer' onClick={()=>{ setSelected(st); setOpen(true); }}>
                      <Avatar name={st.name} size='sm' />
                      <VStack align='start' spacing={0} minW={0}>
                        <Tooltip label={st.name}><Text fontWeight='600' isTruncated maxW='220px'>{st.name}</Text></Tooltip>
                        <HStack spacing={2}>
                          <Badge>{st.id}</Badge>
                          <Badge colorScheme='purple'>Class {st.className}-{st.section}</Badge>
                        </HStack>
                      </VStack>
                    </Flex>
                  ))}
                </SimpleGrid>
              </Box>
            </Box>
          </Card>
        ))}
      </SimpleGrid>

      <Modal isOpen={open} onClose={()=>setOpen(false)} size={{ base: 'sm', md: 'md' }} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Student Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selected ? (
              <VStack align='stretch' spacing={3}>
                <Flex align='center' gap={3}>
                  <Avatar name={selected.name} />
                  <Box>
                    <Text fontWeight='700'>{selected.name}</Text>
                    <Text fontSize='sm' color={textSecondary}>{selected.id}</Text>
                  </Box>
                </Flex>
                <Divider />
                <HStack spacing={3} flexWrap='wrap'>
                  <Badge colorScheme='purple'>Class {selected.className}-{selected.section}</Badge>
                  <Badge>RFID: N/A</Badge>
                  <Badge colorScheme='green'>Attendance: N/A</Badge>
                </HStack>
                <Box>
                  <Text fontSize='sm' color={textSecondary}>Parent: N/A</Text>
                  <Text fontSize='sm' color={textSecondary}>Contact: N/A</Text>
                </Box>
              </VStack>
            ) : null}
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={()=>setOpen(false)}>Close</Button>
            <Button colorScheme='blue'>Open Profile</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
