import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Text,
  VStack,
  SimpleGrid,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  useColorModeValue,
  Icon,
  HStack,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Flex,
} from '@chakra-ui/react';
import Card from '../../../components/card/Card';
import { MdSchool, MdLibraryBooks, MdClass, MdDateRange } from 'react-icons/md';
import BarChart from '../../../components/charts/BarChart';
import LineChart from '../../../components/charts/LineChart';
import MiniStatistics from '../../../components/card/MiniStatistics';
import IconBox from '../../../components/icons/IconBox';
import { useAuth } from '../../../contexts/AuthContext';
import * as studentsApi from '../../../services/api/students';

export default function ClassList() {
  const textSecondary = useColorModeValue('gray.600', 'gray.400');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selected, setSelected] = useState(null);

  const { user } = useAuth();
  const [student, setStudent] = useState(null);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        if (user?.role !== 'student') return;
        const payload = await studentsApi.list({ pageSize: 1 });
        const me = Array.isArray(payload?.rows) && payload.rows.length ? payload.rows[0] : null;
        setStudent(me);
      } catch {
        setStudent(null);
      }

      try {
        if (user?.role !== 'student') return;
        const payload = await studentsApi.listMySubjectTeachers();
        setRows(Array.isArray(payload?.items) ? payload.items : []);
      } catch {
        setRows([]);
      }
    };
    load();
  }, [user?.role]);

  const myClass = useMemo(() => {
    const c = student?.class;
    const s = student?.section;
    if (!c) return '—';
    return `${c}${s || ''}`;
  }, [student?.class, student?.section]);

  const subjects = useMemo(() => {
    const bySubject = new Map();
    (rows || []).forEach((r) => {
      const key = r.subjectName || '—';
      const existing = bySubject.get(key);
      const candidate = { subject: key, teacher: r.teacherName || '—', isPrimary: !!r.isPrimary };
      if (!existing) {
        bySubject.set(key, candidate);
        return;
      }
      if (!existing.isPrimary && candidate.isPrimary) {
        bySubject.set(key, candidate);
      }
    });
    return Array.from(bySubject.values());
  }, [rows]);

  const chartData = useMemo(() => ([{
    name: 'Weekly Periods',
    data: subjects.map((_, i) => 3 + (i % 4)),
  }]), [subjects]);
  const chartOptions = useMemo(() => ({
    xaxis: { categories: subjects.map(s => s.subject) },
    colors: ['#3182CE'],
    dataLabels: { enabled: false },
  }), [subjects]);

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Text fontSize='2xl' fontWeight='bold' mb='6px'>My Class ({myClass})</Text>
      <Text fontSize='md' color={textSecondary} mb='16px'>Subjects you have this term with assigned teachers</Text>

      <Box mb='16px'>
        <Flex gap='16px' w='100%' wrap='nowrap'>
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#4481EB 0%,#04BEFE 100%)' icon={<Icon as={MdLibraryBooks} w='22px' h='22px' color='white' />} />}
            name='Subjects'
            value={String(subjects.length)}
            trendData={[1,2,2,3,subjects.length]}
            trendColor='#4481EB'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#805AD5 0%,#D53F8C 100%)' icon={<Icon as={MdClass} w='22px' h='22px' color='white' />} />}
            name='Class'
            value={myClass}
            trendData={[1,1,1,1,1]}
            trendColor='#805AD5'
          />
        </Flex>
      </Box>

      <Card p='0'>
        <Table size='sm' variant='striped' colorScheme='gray'>
          <Thead position='sticky' top={0} bg={useColorModeValue('white','gray.800')} zIndex={1} boxShadow='sm'>
            <Tr>
              <Th>Subject</Th>
              <Th>Teacher</Th>
              <Th>Tags</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {subjects.map((s, idx) => (
              <Tr key={idx}>
                <Td>
                  <HStack><Icon as={MdSchool} /><Text>{s.subject}</Text></HStack>
                </Td>
                <Td>{s.teacher}</Td>
                <Td><Badge colorScheme='blue'>Core</Badge></Td>
                <Td>
                  <Button size='xs' colorScheme='purple' onClick={() => { setSelected({ ...s, className: myClass }); onOpen(); }}>View</Button>
                </Td>
              </Tr>
            ))}
            {subjects.length===0 && (
              <Tr><Td colSpan={4}><Box p='12px' textAlign='center' color={textSecondary}>No subjects found for {myClass}.</Box></Td></Tr>
            )}
          </Tbody>
        </Table>
      </Card>

      <SimpleGrid columns={{ base:1, lg:2 }} spacing='16px' mt='16px'>
        <Card p='16px'>
          <Text fontSize='md' fontWeight='bold' mb='8px'>Weekly Periods by Subject</Text>
          <BarChart chartData={chartData} chartOptions={{ ...chartOptions, tooltip:{ enabled:true } }} height={240} />
        </Card>
        <Card p='16px'>
          <Text fontSize='md' fontWeight='bold' mb='8px'>Subjects Trend</Text>
          <LineChart chartData={[{ name:'Lessons', data: subjects.map((_, i) => 3 + (i % 4)) }]} chartOptions={{ xaxis:{ categories: subjects.map(s=>s.subject) }, colors:['#01B574'], dataLabels:{ enabled:false }, stroke:{ curve:'smooth', width:3 }, tooltip:{ enabled:true } }} height={240} />
        </Card>
      </SimpleGrid>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Subject Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selected ? (
              <VStack align='start' spacing={2}>
                <Text><b>Subject:</b> {selected.subject}</Text>
                <Text><b>Teacher:</b> {selected.teacher}</Text>
                <Text><b>Class:</b> {selected.className}</Text>
                <Text><b>Room:</b> Room 201</Text>
                <Text><b>Timing:</b> 09:00 - 10:00</Text>
                <Badge colorScheme='green'>Hardcoded Demo</Badge>
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
