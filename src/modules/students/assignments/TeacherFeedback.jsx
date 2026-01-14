import React, { useMemo, useState } from 'react';
import { Box, Text, SimpleGrid, VStack, HStack, Table, Thead, Tbody, Tr, Th, Td, Badge, Button, Icon, useColorModeValue, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, useDisclosure, Flex } from '@chakra-ui/react';
import { MdVisibility, MdCheckCircle, MdSchedule, MdAssessment, MdLibraryBooks } from 'react-icons/md';
import Card from '../../../components/card/Card';
import BarChart from '../../../components/charts/BarChart';
import LineChart from '../../../components/charts/LineChart';
import MiniStatistics from '../../../components/card/MiniStatistics';
import IconBox from '../../../components/icons/IconBox';
import { mockAssignments, mockTeachers, mockStudents } from '../../../utils/mockData';
import { useAuth } from '../../../contexts/AuthContext';

export default function TeacherFeedback() {
  const textSecondary = useColorModeValue('gray.600', 'gray.400');
  const { user } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selected, setSelected] = useState(null);

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
  const subjects = useMemo(() => Array.from(new Set(mockTeachers.filter(t => t.classes?.includes(classSection)).map(t => t.subject))), [classSection]);

  const baseItems = useMemo(() => mockAssignments
    .filter(a => (subjects.length === 0 || subjects.includes(a.subject)))
    .filter(a => a.status === 'graded' || a.status === 'submitted')
    .map(a => ({
      ...a,
      teacherComment: a.status === 'graded' ? (a.teacherComment || 'Well done. Keep up the good work.') : 'Submitted. Awaiting review.',
      rubric: a.rubric || 'Accuracy, Completeness, Presentation',
    })), [subjects]);

  const demoGraded = useMemo(() => ([
    { id: 'D-G1', title: 'Computer Science Project - Sorting Report', subject: 'Computer Science', teacher: 'Mr. Usman Tariq', status: 'graded', score: 89, rubric: 'Correctness, Time Complexity, Code Style', teacherComment: 'Good analysis and code style. Mentioned edge cases clearly.' },
    { id: 'D-G2', title: 'Urdu Essay Review', subject: 'Urdu', teacher: 'Ms. Noor Fatima', status: 'graded', score: 78, rubric: 'Content, Grammar, Structure', teacherComment: 'Strong content. Improve grammar and structure in 2nd paragraph.' },
  ]), []);

  const demoSubmitted = useMemo(() => ([
    { id: 'D-S2', title: 'Islamiat Unit 3 Answers', subject: 'Islamiat', teacher: 'Mr. Saad Ali', status: 'submitted', rubric: 'Completeness, References, Clarity', teacherComment: 'Submitted. Awaiting review.' },
  ]), []);

  const items = useMemo(() => [...baseItems, ...demoGraded, ...demoSubmitted], [baseItems, demoGraded, demoSubmitted]);

  const graded = items.filter(i => i.status === 'graded');
  const submitted = items.filter(i => i.status === 'submitted');
  const avgScore = useMemo(() => {
    const scores = graded.map(g => (typeof g.score === 'number' ? g.score : null)).filter(s => s !== null);
    if (!scores.length) return '-';
    return Math.round(scores.reduce((a,b)=>a+b,0) / scores.length);
  }, [graded]);

  const lineData = useMemo(() => ([{ name: 'Score', data: graded.map(g => (typeof g.score === 'number' ? g.score : 0)) }]), [graded]);
  const lineOptions = useMemo(() => ({ xaxis: { categories: graded.map(g => g.title) }, colors: ['#01B574'], dataLabels: { enabled: false }, stroke: { curve: 'smooth', width: 3 } }), [graded]);

  const barData = useMemo(() => ([{ name: 'Count', data: [graded.length, submitted.length] }]), [graded, submitted]);
  const barOptions = useMemo(() => ({ xaxis: { categories: ['Graded','Submitted'] }, colors: ['#667eea'], dataLabels: { enabled: false } }), []);

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Text fontSize='2xl' fontWeight='bold' mb='6px'>Teacher Feedback</Text>
      <Text fontSize='md' color={textSecondary} mb='16px'>{student.name} • Roll {student.rollNumber} • Class {classSection}</Text>

      <Box mb='16px'>
        <Flex gap='16px' w='100%' wrap='nowrap'>
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#805AD5 0%,#D53F8C 100%)' icon={<Icon as={MdCheckCircle} w='22px' h='22px' color='white' />} />}
            name='Total with Feedback'
            value={String(graded.length)}
            trendData={[1,2,2,3,graded.length]}
            trendColor='#805AD5'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#4481EB 0%,#04BEFE 100%)' icon={<Icon as={MdSchedule} w='22px' h='22px' color='white' />} />}
            name='Awaiting Review'
            value={String(submitted.length)}
            trendData={[0,1,1,2,submitted.length]}
            trendColor='#4481EB'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#01B574 0%,#51CB97 100%)' icon={<Icon as={MdAssessment} w='22px' h='22px' color='white' />} />}
            name='Avg Score'
            value={`${avgScore}${avgScore==='-'?'':'/100'}`}
            trendData={[60,70,75,80,avgScore==='-'?0:avgScore]}
            trendColor='#01B574'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#667eea 0%,#764ba2 100%)' icon={<Icon as={MdLibraryBooks} w='22px' h='22px' color='white' />} />}
            name='Subjects'
            value={String(subjects.length)}
            trendData={[1,1,2,2,subjects.length]}
            trendColor='#667eea'
          />
        </Flex>
      </Box>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing='16px' mb='16px'>
        <Card p='16px'>
          <Text fontWeight='bold' mb='8px'>Scores</Text>
          <LineChart chartData={lineData} chartOptions={lineOptions} height={220} />
        </Card>
        <Card p='16px'>
          <Text fontWeight='bold' mb='8px'>Status Counts</Text>
          <BarChart chartData={barData} chartOptions={barOptions} height={220} />
        </Card>
      </SimpleGrid>

      <Card p='0'>
        <Table size='sm' variant='striped' colorScheme='gray'>
          <Thead><Tr><Th>Title</Th><Th>Subject</Th><Th>Teacher</Th><Th>Status</Th><Th>Score</Th><Th>Actions</Th></Tr></Thead>
          <Tbody>
            {items.map(a => (
              <Tr key={a.id}>
                <Td>
                  <HStack spacing={2}>
                    <Text>{a.title}</Text>
                    {String(a.id).toString().startsWith('D-') && <Badge variant='outline' colorScheme='purple'>Demo</Badge>}
                  </HStack>
                </Td>
                <Td>{a.subject}</Td>
                <Td>{a.teacher}</Td>
                <Td><Badge colorScheme={a.status==='graded'?'green':'blue'}>{a.status}</Badge></Td>
                <Td>{typeof a.score === 'number' ? a.score : '-'}</Td>
                <Td>
                  <Button size='xs' leftIcon={<Icon as={MdVisibility} />} onClick={()=>{ setSelected(a); onOpen(); }}>View</Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Card>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Feedback: {selected?.title}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selected ? (
              <VStack align='start' spacing={2}>
                <Text><b>Subject:</b> {selected.subject}</Text>
                <Text><b>Teacher:</b> {selected.teacher}</Text>
                <Text><b>Status:</b> {selected.status}</Text>
                <Text><b>Score:</b> {typeof selected.score === 'number' ? `${selected.score}/100` : '-'}</Text>
                <Text><b>Rubric:</b> {selected.rubric}</Text>
                <Text><b>Comments:</b> {selected.teacherComment}</Text>
              </VStack>
            ) : null}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
