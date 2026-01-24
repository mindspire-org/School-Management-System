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
  IconButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Tooltip,
  useColorModeValue,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Avatar,
  useToast,
} from '@chakra-ui/react';
import { MdSearch, MdRefresh, MdFileDownload, MdVisibility, MdEdit, MdSave, MdCheckCircle, MdClose, MdAccessTime, MdPeople } from 'react-icons/md';
import Card from '../../../components/card/Card';
import MiniStatistics from '../../../components/card/MiniStatistics';
import IconBox from '../../../components/icons/IconBox';
import BarChart from '../../../components/charts/BarChart';
import PieChart from '../../../components/charts/PieChart';
import { mockStudents } from '../../../utils/mockData';

export default function DailyAttendance() {
  const textSecondary = useColorModeValue('gray.600', 'gray.400');
  const headerBg = useColorModeValue('white', 'gray.800');
  const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.100');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [cls, setCls] = useState('');
  const [section, setSection] = useState('');
  const [q, setQ] = useState('');
  const [statuses, setStatuses] = useState(() => Object.fromEntries(mockStudents.map(s => [s.id, 'Present'])));
  const [selected, setSelected] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const classes = useMemo(() => Array.from(new Set(mockStudents.map(s => s.class))), []);
  const sections = useMemo(() => Array.from(new Set(mockStudents.map(s => s.section))), []);

  const filtered = useMemo(() =>
    mockStudents.filter(s =>
      (!cls || s.class === cls) &&
      (!section || s.section === section) &&
      (!q || s.name.toLowerCase().includes(q.toLowerCase()) || s.rollNumber.toLowerCase().includes(q.toLowerCase()))
    ), [cls, section, q]
  );

  const kpis = useMemo(() => {
    const subset = filtered.map(s => ({ id: s.id, st: statuses[s.id] }));
    const present = subset.filter(x => x.st === 'Present').length;
    const absent = subset.filter(x => x.st === 'Absent').length;
    const late = subset.filter(x => x.st === 'Late').length;
    return { present, absent, late, total: subset.length };
  }, [filtered, statuses]);

  const exportCSV = () => {
    const header = ['Date','Name','Roll','Class','Section','Status'];
    const rows = filtered.map(s => [date, s.name, s.rollNumber, s.class, s.section, statuses[s.id] || '-']);
    const csv = [header, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${date}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const saveAttendance = () => {
    toast({ title: 'Attendance saved', description: `${kpis.present} present, ${kpis.absent} absent, ${kpis.late} late`, status: 'success', duration: 2000 });
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Text fontSize='2xl' fontWeight='bold' mb='6px'>Daily Attendance</Text>
      <Text fontSize='md' color={textSecondary} mb='16px'>Mark attendance quickly with filters and responsive table.</Text>

      <Box mb='16px'>
        <Flex gap='16px' w='100%' wrap='nowrap'>
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#01B574 0%,#51CB97 100%)' icon={<MdCheckCircle color='white' />} />}
            name='Present'
            value={String(kpis.present)}
            trendData={[2,3,2,4,3,4]}
            trendColor='#01B574'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#FF6A88 0%,#FF99AC 100%)' icon={<MdClose color='white' />} />}
            name='Absent'
            value={String(kpis.absent)}
            trendData={[1,2,1,1,2,1]}
            trendColor='#FF6A88'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#FFB36D 0%,#FD7853 100%)' icon={<MdAccessTime color='white' />} />}
            name='Late'
            value={String(kpis.late)}
            trendData={[0,1,1,1,0,1]}
            trendColor='#FD7853'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#4481EB 0%,#04BEFE 100%)' icon={<MdPeople color='white' />} />}
            name='Total'
            value={String(kpis.total)}
            trendData={[3,4,3,5,4,5]}
            trendColor='#4481EB'
          />
        </Flex>
      </Box>

      <Card p='16px' mb='16px'>
        <Flex gap={3} flexWrap='wrap' justify='space-between' align='center'>
          <HStack spacing={3} flexWrap='wrap' rowGap={3}>
            <Input type='date' value={date} onChange={e=>setDate(e.target.value)} size='sm' maxW='180px' />
            <Select placeholder='Class' value={cls} onChange={e=>setCls(e.target.value)} size='sm' maxW='160px'>
              {classes.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
            <Select placeholder='Section' value={section} onChange={e=>setSection(e.target.value)} size='sm' maxW='160px'>
              {sections.map(s => <option key={s} value={s}>{s}</option>)}
            </Select>
            <HStack>
              <Input placeholder='Search student' value={q} onChange={e=>setQ(e.target.value)} size='sm' maxW='220px' />
              <IconButton aria-label='Search' icon={<MdSearch />} size='sm' />
            </HStack>
          </HStack>
          <HStack>
            <Button leftIcon={<MdRefresh />} size='sm' variant='outline' onClick={()=>{setCls('');setSection('');setQ('');}}>Reset</Button>
            <Button leftIcon={<MdFileDownload />} size='sm' colorScheme='blue' onClick={exportCSV}>Export CSV</Button>
          </HStack>
        </Flex>
      </Card>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5} mb='16px'>
        <Card p='16px'>
          <Text fontWeight='700' mb='8px'>Status Counts</Text>
          <BarChart chartData={[{ name: 'Count', data: [kpis.present, kpis.absent, kpis.late] }]} chartOptions={{ xaxis:{ categories:['Present','Absent','Late'] }, dataLabels:{ enabled:false }, colors:['#2B6CB0','#E53E3E','#ED8936'] }} height={220} />
        </Card>
        <Card p='16px'>
          <Text fontWeight='700' mb='8px'>Distribution</Text>
          <PieChart height={240} chartData={[kpis.present, kpis.absent, kpis.late]} chartOptions={{ labels:['Present','Absent','Late'], legend:{ position:'right' }, colors:['#2B6CB0','#E53E3E','#ED8936'] }} />
        </Card>
      </SimpleGrid>

      <Card p='0'>
        <Flex justify='space-between' align='center' p='12px' borderBottom='1px solid' borderColor='gray.100'>
          <Text fontWeight='600'>Students</Text>
          <Button size='sm' leftIcon={<MdSave />} colorScheme='green' onClick={saveAttendance}>Save Attendance</Button>
        </Flex>
        <Box overflowX='auto'>
          <Box minW='880px'>
            <Table size='sm' variant='striped' colorScheme='gray'>
              <Thead position='sticky' top={0} bg={headerBg} zIndex={1} boxShadow='sm'>
                <Tr>
                  <Th>Student</Th>
                  <Th>Roll</Th>
                  <Th>Class</Th>
                  <Th>Status</Th>
                  <Th isNumeric>Attendance %</Th>
                  <Th textAlign='right'>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filtered.map(s => (
                  <Tr key={s.id} _hover={{ bg: hoverBg }}>
                    <Td>
                      <HStack spacing={3} maxW='280px'>
                        <Avatar name={s.name} src={s.avatar} size='sm' />
                        <Box>
                          <Tooltip label={s.name}><Text fontWeight='600' isTruncated maxW='200px'>{s.name}</Text></Tooltip>
                          <Text fontSize='xs' color={textSecondary}>{s.email}</Text>
                        </Box>
                      </HStack>
                    </Td>
                    <Td>{s.rollNumber}</Td>
                    <Td>{s.class}-{s.section}</Td>
                    <Td>
                      <Select size='sm' value={statuses[s.id]} onChange={e=>setStatuses(prev=>({...prev, [s.id]: e.target.value}))} maxW='140px'>
                        <option>Present</option>
                        <option>Absent</option>
                        <option>Late</option>
                      </Select>
                    </Td>
                    <Td isNumeric>
                      <Badge colorScheme={s.attendance >= 90 ? 'green' : s.attendance >= 80 ? 'yellow' : 'red'}>{s.attendance}%</Badge>
                    </Td>
                    <Td>
                      <HStack justify='flex-end'>
                        <Tooltip label='View'>
                          <IconButton aria-label='View' icon={<MdVisibility />} size='sm' variant='ghost' onClick={()=>{setSelected(s); onOpen();}} />
                        </Tooltip>
                        <Tooltip label='Edit'>
                          <IconButton aria-label='Edit' icon={<MdEdit />} size='sm' variant='ghost' onClick={()=>{setSelected(s); onOpen();}} />
                        </Tooltip>
                      </HStack>
                    </Td>
                  </Tr>
                ))}
                {filtered.length === 0 && (
                  <Tr>
                    <Td colSpan={6}>
                      <Box p='12px' textAlign='center' color={textSecondary}>No students found.</Box>
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </Box>
        </Box>
      </Card>

      <Modal isOpen={isOpen} onClose={onClose} size='md' isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Student Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selected && (
              <VStack align='start' spacing={3}>
                <HStack>
                  <Avatar name={selected.name} src={selected.avatar} />
                  <Box>
                    <Text fontWeight='700'>{selected.name}</Text>
                    <Text fontSize='sm' color={textSecondary}>{selected.rollNumber} • {selected.class}-{selected.section}</Text>
                  </Box>
                </HStack>
                <HStack>
                  <Badge colorScheme='purple'>{selected.rfidTag}</Badge>
                  <Badge colorScheme='blue'>{selected.busNumber}</Badge>
                </HStack>
                <Box>
                  <Text fontSize='sm' color={textSecondary} mb={1}>Status</Text>
                  <Select size='sm' value={statuses[selected.id]} onChange={e=>setStatuses(prev=>({...prev, [selected.id]: e.target.value}))} maxW='180px'>
                    <option>Present</option>
                    <option>Absent</option>
                    <option>Late</option>
                  </Select>
                </Box>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={onClose}>Close</Button>
            <Button colorScheme='green' leftIcon={<MdSave />} onClick={()=>{saveAttendance(); onClose();}}>Save</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
