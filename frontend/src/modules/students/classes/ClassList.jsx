import React, { useMemo, useState } from 'react';
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
import { mockTeachers, mockTodayClasses } from '../../../utils/mockData';
import BarChart from '../../../components/charts/BarChart';
import LineChart from '../../../components/charts/LineChart';
import MiniStatistics from '../../../components/card/MiniStatistics';
import IconBox from '../../../components/icons/IconBox';

export default function ClassList() {
  const textSecondary = useColorModeValue('gray.600', 'gray.400');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selected, setSelected] = useState(null);

  // Derive student's primary class from today's classes mock
  const myClass = useMemo(() => {
    const counts = {};
    (mockTodayClasses||[]).forEach(c=>{ counts[c.className] = (counts[c.className]||0)+1; });
    const entry = Object.entries(counts).sort((a,b)=>b[1]-a[1])[0];
    return entry ? entry[0] : '10A';
  }, []);

  const subjects = useMemo(() => {
    // Derive subjects taught to this class from mock teachers
    const list = mockTeachers
      .filter(t => Array.isArray(t.classes) && t.classes.includes(myClass))
      .map(t => ({ subject: t.subject, teacher: t.name }));
    // Ensure uniqueness by subject
    const map = new Map();
    list.forEach(it => { if (!map.has(it.subject)) map.set(it.subject, it); });
    return Array.from(map.values());
  }, [myClass]);

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
