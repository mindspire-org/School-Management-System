import React, { useMemo, useState } from 'react';
import { Box, Text, SimpleGrid, VStack, HStack, Select, Input, Table, Thead, Tbody, Tr, Th, Td, Badge, Button, Icon, useColorModeValue, Flex } from '@chakra-ui/react';
import { MdFileDownload, MdVisibility, MdAssignment, MdPendingActions, MdCheckCircle, MdVerified } from 'react-icons/md';
import Card from '../../../components/card/Card';
import MiniStatistics from '../../../components/card/MiniStatistics';
import IconBox from '../../../components/icons/IconBox';
import BarChart from '../../../components/charts/BarChart';
import { mockAssignments, mockTeachers, mockStudents } from '../../../utils/mockData';
import { useAuth } from '../../../contexts/AuthContext';

export default function ViewAssignments() {
  const textSecondary = useColorModeValue('gray.600', 'gray.400');
  const { user } = useAuth();
  const student = useMemo(() => {
    if (user?.role === 'student') {
      const byEmail = mockStudents.find(s => s.email?.toLowerCase() === user.email?.toLowerCase());
      if (byEmail) return byEmail;
      const byName = mockStudents.find(s => s.name?.toLowerCase() === user.name?.toLowerCase());
      if (byName) return byName;
      return { id: 999, name: user.name, rollNumber: 'STU999', class: '10', section: 'A', email: user.email };
    }
    return mockStudents[0];
  }, [user]);

  const classSection = `${student.class}${student.section}`;
  const subjects = useMemo(() => {
    const list = mockTeachers.filter(t => Array.isArray(t.classes) && t.classes.includes(classSection)).map(t => t.subject);
    return Array.from(new Set(list));
  }, [classSection]);

  const scopedAssignments = useMemo(() => mockAssignments.filter(a => !subjects.length || subjects.includes(a.subject)), [subjects]);

  const [subject, setSubject] = useState('all');
  const [status, setStatus] = useState('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => scopedAssignments.filter(a => (
    (subject === 'all' || a.subject === subject) &&
    (status === 'all' || a.status === status) &&
    (!query || a.title.toLowerCase().includes(query.toLowerCase()))
  )), [scopedAssignments, subject, status, query]);

  const kpis = useMemo(() => ({
    total: filtered.length,
    pending: filtered.filter(a => a.status === 'pending').length,
    submitted: filtered.filter(a => a.status === 'submitted').length,
    graded: filtered.filter(a => a.status === 'graded').length,
  }), [filtered]);

  const chartData = useMemo(() => ([{ name: 'Assignments', data: [kpis.pending, kpis.submitted, kpis.graded] }]), [kpis]);
  const chartOptions = useMemo(() => ({ xaxis: { categories: ['Pending','Submitted','Graded'] }, colors: ['#667eea'] }), []);

  const viewAssignment = (a) => {
    const text = `Title: ${a.title}\nSubject: ${a.subject}\nTeacher: ${a.teacher}\nDue: ${a.dueDate}\nStatus: ${a.status}\nDescription: ${a.description}`;
    alert(text);
  };

  const downloadAssignment = (a) => {
    const blob = new Blob([a.description || a.title], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const an = document.createElement('a'); an.href = url; an.download = `${a.title.replace(/\s+/g,'_')}.txt`; an.click(); URL.revokeObjectURL(url);
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Text fontSize='2xl' fontWeight='bold' mb='6px'>Assignments</Text>
      <Text fontSize='md' color={textSecondary} mb='16px'>{student.name} • Roll {student.rollNumber} • Class {classSection}</Text>

      <Box mb='16px'>
        <Flex gap='16px' w='100%' wrap='nowrap'>
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#B721FF 0%,#21D4FD 100%)' icon={<Icon as={MdAssignment} w='22px' h='22px' color='white' />} />}
            name='Total'
            value={String(kpis.total)}
            trendData={[1,2,2,3,4]}
            trendColor='#B721FF'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#FFB36D 0%,#FD7853 100%)' icon={<Icon as={MdPendingActions} w='22px' h='22px' color='white' />} />}
            name='Pending'
            value={String(kpis.pending)}
            trendData={[1,1,2,2,2]}
            trendColor='#FD7853'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#4481EB 0%,#04BEFE 100%)' icon={<Icon as={MdCheckCircle} w='22px' h='22px' color='white' />} />}
            name='Submitted'
            value={String(kpis.submitted)}
            trendData={[0,1,1,2,2]}
            trendColor='#4481EB'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#01B574 0%,#51CB97 100%)' icon={<Icon as={MdVerified} w='22px' h='22px' color='white' />} />}
            name='Graded'
            value={String(kpis.graded)}
            trendData={[0,0,1,1,2]}
            trendColor='#01B574'
          />
        </Flex>
      </Box>

      <Card p='16px' mb='16px'>
        <HStack spacing={3} flexWrap='wrap' rowGap={3}>
          <Select size='sm' value={subject} onChange={e=>setSubject(e.target.value)} maxW='200px'>
            <option value='all'>All Subjects</option>
            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
          </Select>
          <Select size='sm' value={status} onChange={e=>setStatus(e.target.value)} maxW='180px'>
            <option value='all'>All Statuses</option>
            <option value='pending'>Pending</option>
            <option value='submitted'>Submitted</option>
            <option value='graded'>Graded</option>
          </Select>
          <Input size='sm' placeholder='Search title...' value={query} onChange={e=>setQuery(e.target.value)} maxW='240px' />
        </HStack>
      </Card>

      <Card p='0' mb='16px'>
        <Table size='sm' variant='striped' colorScheme='gray'>
          <Thead><Tr><Th>Title</Th><Th>Subject</Th><Th>Teacher</Th><Th>Due</Th><Th>Status</Th><Th>Actions</Th></Tr></Thead>
          <Tbody>
            {filtered.map(a => (
              <Tr key={a.id}>
                <Td>{a.title}</Td>
                <Td>{a.subject}</Td>
                <Td>{a.teacher}</Td>
                <Td>{a.dueDate}</Td>
                <Td><Badge colorScheme={a.status==='pending'?'yellow':a.status==='submitted'?'blue':'green'}>{a.status}</Badge></Td>
                <Td>
                  <HStack>
                    <Button size='xs' leftIcon={<Icon as={MdVisibility} />} onClick={()=>viewAssignment(a)}>View</Button>
                    <Button size='xs' colorScheme='purple' leftIcon={<Icon as={MdFileDownload} />} onClick={()=>downloadAssignment(a)}>Download</Button>
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Card>

      <Card p='16px'>
        <Text fontSize='md' fontWeight='bold' mb='8px'>Summary</Text>
        <BarChart chartData={chartData} chartOptions={chartOptions} height={220} />
      </Card>
    </Box>
  );
}
