import React, { useMemo, useState } from 'react';
import {
  Box,
  Heading,
  Text,
  HStack,
  Select,
  Progress,
  Input,
  InputGroup,
  InputLeftElement,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Flex,
  SimpleGrid,
  Button,
  ButtonGroup,
  Badge,
  Checkbox,
  IconButton,
  Tooltip,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useColorModeValue,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
} from '@chakra-ui/react';
import Card from 'components/card/Card.js';
import MiniStatistics from 'components/card/MiniStatistics';
import IconBox from 'components/icons/IconBox';
import { MdTrendingUp, MdCheckCircle, MdWarning, MdUpdate, MdAssignment, MdSearch, MdFileDownload, MdPictureAsPdf, MdRefresh, MdEdit, MdRemoveRedEye, MdDoneAll } from 'react-icons/md';

const initialItems = [
  { id: 1, className: 'Class 1', subject: 'English', teacher: 'Ayesha Khan', chapters: 12, covered: 8, dueDate: '2025-12-10' },
  { id: 2, className: 'Class 1', subject: 'Math', teacher: 'Bilal Ahmed', chapters: 10, covered: 6, dueDate: '2025-12-05' },
  { id: 3, className: 'Class 2', subject: 'Science', teacher: 'Hina Raza', chapters: 14, covered: 9, dueDate: '2025-12-20' },
];

export default function Syllabus() {
  const [rows, setRows] = useState(initialItems);
  const [cls, setCls] = useState('All');
  const [subject, setSubject] = useState('All');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [coveredVal, setCoveredVal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedIds, setSelectedIds] = useState([]);
  const disc = useDisclosure();
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');

  const classes = useMemo(() => ['All', ...Array.from(new Set(rows.map(i => i.className)))], [rows]);
  const subjects = useMemo(() => ['All', ...Array.from(new Set(rows.map(i => i.subject)))], [rows]);
  const filteredByClass = useMemo(() => (cls === 'All' ? rows : rows.filter(i => i.className === cls)), [cls, rows]);
  const deriveStatus = (percent, dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const daysLeft = Math.ceil((due - today) / (1000*60*60*24));
    if (percent >= 80) return 'On Track';
    if (percent < 40 || daysLeft < 0) return 'Behind';
    return 'At Risk';
  };

  const data = useMemo(() => {
    const base = filteredByClass.filter(i => (subject==='All' || i.subject===subject) && (!search || `${i.className} ${i.subject} ${i.teacher}`.toLowerCase().includes(search.toLowerCase())));
    const withStatus = base.map(r => ({ ...r, percent: Math.round((r.covered/r.chapters)*100), status: deriveStatus(Math.round((r.covered/r.chapters)*100), r.dueDate) }));
    return statusFilter==='All' ? withStatus : withStatus.filter(r => r.status === statusFilter);
  }, [filteredByClass, subject, search, statusFilter]);

  const totalSubjects = data.length;
  const avgCoverage = useMemo(() => Math.round((data.reduce((a,b)=>a + (b.percent/100), 0) / (data.length || 1)) * 100), [data]);
  const completed = data.filter(r => r.percent >= 70).length;
  const behind = data.filter(r => r.percent < 40).length;

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Flex mb={5} justifyContent="space-between" alignItems="center">
        <Box>
          <Heading as="h3" size="lg" mb={1} color={textColor}>Syllabus</Heading>
          <Text color={textColorSecondary}>Track syllabus coverage by class and subject</Text>
        </Box>
        <ButtonGroup>
          <Button leftIcon={<MdRefresh />} variant='outline' onClick={()=>window.location.reload()}>Refresh</Button>
          <Button leftIcon={<MdFileDownload />} variant='outline' colorScheme='blue'>Export CSV</Button>
          <Button leftIcon={<MdPictureAsPdf />} colorScheme='blue'>Export PDF</Button>
        </ButtonGroup>
      </Flex>

      <Card mb={5}>
        <Flex
          p={4}
          justifyContent="space-between"
          alignItems="center"
          direction={{ base: 'column', md: 'row' }}
          gap={4}
          flexWrap={{ base: 'wrap', md: 'wrap' }}
          rowGap={3}
        >
          <HStack
            flex={{ base: '1 1 100%', md: '1 1 auto' }}
            flexWrap='wrap'
            spacing={3}
          >
            <InputGroup maxW={{ base: '100%', md: '260px' }} w={{ base: '100%', md: 'auto' }}>
              <InputLeftElement pointerEvents='none'>
                <MdSearch color='gray.400' />
              </InputLeftElement>
              <Input placeholder='Search class or subject' value={search} onChange={(e)=>setSearch(e.target.value)} />
            </InputGroup>
            <Select w="200px" value={cls} onChange={(e) => setCls(e.target.value)}>
              {classes.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
            <Select w="200px" value={subject} onChange={(e) => setSubject(e.target.value)}>
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </Select>
            <Select w="200px" value={statusFilter} onChange={(e)=>setStatusFilter(e.target.value)}>
              <option>All</option>
              <option>On Track</option>
              <option>At Risk</option>
              <option>Behind</option>
            </Select>
          </HStack>
          <HStack
            flexShrink={0}
            spacing={3}
            w={{ base: '100%', md: 'auto' }}
            justifyContent={{ base: 'flex-end', md: 'flex-start' }}
            flexWrap='wrap'
          >
            <Button leftIcon={<MdUpdate />} colorScheme="blue">Update Coverage</Button>
            <Button leftIcon={<MdAssignment />} variant="outline" colorScheme="blue">Generate Report</Button>
          </HStack>
        </Flex>
      </Card>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap="20px" mb={5}>
        <MiniStatistics
          startContent={<IconBox w="56px" h="56px" bg="linear-gradient(90deg,#4481EB 0%,#04BEFE 100%)" icon={<MdTrendingUp color="white" />} />}
          name="Avg Coverage"
          value={`${avgCoverage}%`}
        />
        <MiniStatistics
          startContent={<IconBox w="56px" h="56px" bg="linear-gradient(90deg,#01B574 0%,#51CB97 100%)" icon={<MdCheckCircle color="white" />} />}
          name=">= 70% Covered"
          value={String(completed)}
        />
        <MiniStatistics
          startContent={<IconBox w="56px" h="56px" bg="linear-gradient(90deg,#FFB36D 0%,#FD7853 100%)" icon={<MdWarning color="white" />} />}
          name="< 40% Covered"
          value={String(behind)}
        />
        <MiniStatistics
          startContent={<IconBox w="56px" h="56px" bg="linear-gradient(90deg,#8952FF 0%,#AA80FF 100%)" icon={<MdTrendingUp color="white" />} />}
          name="Subjects"
          value={String(totalSubjects)}
        />
      </SimpleGrid>

      <Card overflow="hidden">
        <Heading size="md" p={4} borderBottomWidth={1} borderColor={useColorModeValue('gray.200', 'gray.700')}>
          Syllabus Progress
        </Heading>
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead bg={useColorModeValue('gray.50', 'gray.800')}>
              <Tr>
                <Th>
                  <Checkbox isChecked={selectedIds.length===data.length && data.length>0} isIndeterminate={selectedIds.length>0 && selectedIds.length<data.length} onChange={(e)=> setSelectedIds(e.target.checked ? data.map(d=>d.id) : [])} />
                </Th>
                <Th>Class</Th>
                <Th>Subject</Th>
                <Th>Teacher</Th>
                <Th>Due Date</Th>
                <Th>Status</Th>
                <Th isNumeric>Covered</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {data.map((r) => {
                const percent = r.percent;
                return (
                  <Tr key={r.id}>
                    <Td>
                      <Checkbox isChecked={selectedIds.includes(r.id)} onChange={()=> setSelectedIds(prev => prev.includes(r.id) ? prev.filter(id=>id!==r.id) : [...prev, r.id])} />
                    </Td>
                    <Td><Badge colorScheme='blue'>{r.className}</Badge></Td>
                    <Td><Text fontWeight='600'>{r.subject}</Text></Td>
                    <Td>{r.teacher}</Td>
                    <Td>{r.dueDate}</Td>
                    <Td>
                      <Badge colorScheme={r.status==='On Track' ? 'green' : r.status==='At Risk' ? 'yellow' : 'red'}>{r.status}</Badge>
                    </Td>
                    <Td isNumeric>
                      <Box minW="220px">
                        <Tooltip label={`${percent}%`}>
                          <Progress value={percent} colorScheme={percent >= 70 ? 'green' : percent >= 40 ? 'orange' : 'red'} size="sm" borderRadius="md" />
                        </Tooltip>
                      </Box>
                    </Td>
                    <Td>
                      <HStack spacing={1}>
                        <IconButton aria-label='View' icon={<MdRemoveRedEye />} size='sm' variant='ghost' onClick={()=>{ setSelected(r); setCoveredVal(r.covered); disc.onOpen(); }} />
                        <IconButton aria-label='Edit' icon={<MdEdit />} size='sm' variant='ghost' onClick={()=>{ setSelected(r); setCoveredVal(r.covered); disc.onOpen(); }} />
                        <IconButton aria-label='Complete' icon={<MdDoneAll />} size='sm' variant='ghost' onClick={()=> setRows(prev=> prev.map(x => x.id===r.id ? { ...x, covered: x.chapters } : x))} />
                      </HStack>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </Box>
      </Card>

      <Modal isOpen={disc.isOpen} onClose={disc.onClose} size='lg'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Subject Details & Update</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selected && (
              <Box>
                <SimpleGrid columns={{ base: 1, md: 2 }} gap={3} mb={3}>
                  <Box><Text mb={1}><strong>Class:</strong> {selected.className}</Text></Box>
                  <Box><Text mb={1}><strong>Subject:</strong> {selected.subject}</Text></Box>
                  <Box><Text mb={1}><strong>Teacher:</strong> {selected.teacher}</Text></Box>
                  <Box><Text mb={1}><strong>Due:</strong> {selected.dueDate}</Text></Box>
                </SimpleGrid>
                <Text mb={2}><strong>Chapters:</strong> {coveredVal} / {selected.chapters}</Text>
                <Slider value={coveredVal} min={0} max={selected.chapters} onChange={setCoveredVal} colorScheme='blue'>
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb />
                </Slider>
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={disc.onClose}>Cancel</Button>
            <Button colorScheme='blue' onClick={()=>{
              if(!selected) return; 
              setRows(prev => prev.map(x => x.id===selected.id ? { ...x, covered: coveredVal } : x));
              disc.onClose();
            }}>Save</Button>
            <Button leftIcon={<MdDoneAll />} variant='outline' ml={2} onClick={()=>{ if(!selected) return; setRows(prev => prev.map(x => x.id===selected.id ? { ...x, covered: x.chapters } : x)); disc.onClose(); }}>Mark Complete</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
