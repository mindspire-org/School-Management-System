import React, { useMemo, useState } from 'react';
import {
  Box,
  Heading,
  Text,
  HStack,
  Select,
  Button,
  ButtonGroup,
  Input,
  InputGroup,
  InputLeftElement,
  Stat,
  StatLabel,
  StatNumber,
  SimpleGrid,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Flex,
  IconButton,
  Checkbox,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useToast,
  useColorModeValue,
} from '@chakra-ui/react';
import Card from 'components/card/Card.js';
import MiniStatistics from 'components/card/MiniStatistics';
import IconBox from 'components/icons/IconBox';
import { MdTrendingUp, MdDoneAll, MdBook, MdAssignment, MdFileDownload, MdPictureAsPdf, MdRefresh, MdSearch, MdRemoveRedEye, MdEmail } from 'react-icons/md';

const results = [
  { className: 'Class 1', subject: 'English', avg: 72, pass: 92 },
  { className: 'Class 1', subject: 'Math', avg: 68, pass: 88 },
  { className: 'Class 2', subject: 'Science', avg: 75, pass: 90 },
];

export default function Results() {
  const [cls, setCls] = useState('All');
  const [subj, setSubj] = useState('All');
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState('avg');
  const [sortDir, setSortDir] = useState('desc');
  const [selectedIds, setSelectedIds] = useState([]);
  const [active, setActive] = useState(null);
  const disc = useDisclosure();
  const toast = useToast();
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');

  const classes = useMemo(() => ['All', ...Array.from(new Set(results.map(r => r.className)))], []);
  const subjects = useMemo(() => ['All', ...Array.from(new Set(results.map(r => r.subject)))], []);
  const filtered = useMemo(() => {
    const base = results.filter(r => (cls==='All' || r.className===cls) && (subj==='All' || r.subject===subj));
    const q = query.trim().toLowerCase();
    const bySearch = q ? base.filter(r => `${r.className} ${r.subject}`.toLowerCase().includes(q)) : base;
    const sorted = [...bySearch].sort((a,b)=>{
      const k = sortKey;
      const d = sortDir==='asc' ? 1 : -1;
      return (a[k]-b[k]) * d;
    });
    return sorted;
  }, [cls, subj, query, sortKey, sortDir]);

  const avgOverall = useMemo(() => Math.round(filtered.reduce((a, b) => a + b.avg, 0) / filtered.length || 0), [filtered]);
  const passOverall = useMemo(() => Math.round(filtered.reduce((a, b) => a + b.pass, 0) / filtered.length || 0), [filtered]);
  const subjectsCount = useMemo(() => filtered.length, [filtered]);

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Flex mb={5} justifyContent="space-between" alignItems="center">
        <Box>
          <Heading as="h3" size="lg" mb={1} color={textColor}>Results</Heading>
          <Text color={textColorSecondary}>Summary and detailed results by subject</Text>
        </Box>
        <ButtonGroup>
          <Button leftIcon={<MdRefresh />} variant='outline' onClick={()=>window.location.reload()}>Refresh</Button>
          <Button leftIcon={<MdFileDownload />} variant='outline' colorScheme='blue'>Export CSV</Button>
          <Button leftIcon={<MdPictureAsPdf />} colorScheme='blue'>Export PDF</Button>
        </ButtonGroup>
      </Flex>

      <Card mb={5}>
        <Flex p={4} justifyContent="space-between" alignItems="center" direction={{ base: 'column', md: 'row' }} gap={4}>
          <HStack>
            <InputGroup maxW='260px'>
              <InputLeftElement pointerEvents='none'>
                <MdSearch color='gray.400' />
              </InputLeftElement>
              <Input placeholder='Search class or subject' value={query} onChange={(e)=>setQuery(e.target.value)} />
            </InputGroup>
            <Select w="180px" value={cls} onChange={(e) => setCls(e.target.value)}>
              {classes.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
            <Select w="180px" value={subj} onChange={(e) => setSubj(e.target.value)}>
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </Select>
            <Select w="160px" value={sortKey} onChange={(e)=>setSortKey(e.target.value)}>
              <option value='avg'>Sort: Average</option>
              <option value='pass'>Sort: Pass %</option>
            </Select>
            <Select w="120px" value={sortDir} onChange={(e)=>setSortDir(e.target.value)}>
              <option value='desc'>Desc</option>
              <option value='asc'>Asc</option>
            </Select>
          </HStack>
          <HStack>
            <Button leftIcon={<MdAssignment />} variant="outline" colorScheme="blue" onClick={()=> toast({ title: 'Report generated', status: 'success', duration: 2000 })}>Generate Report</Button>
          </HStack>
        </Flex>
      </Card>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="20px" mb={5}>
        <MiniStatistics
          startContent={<IconBox w="56px" h="56px" bg="linear-gradient(90deg,#4481EB 0%,#04BEFE 100%)" icon={<MdTrendingUp color="white" />} />}
          name="Average Score"
          value={`${avgOverall}%`}
        />
        <MiniStatistics
          startContent={<IconBox w="56px" h="56px" bg="linear-gradient(90deg,#01B574 0%,#51CB97 100%)" icon={<MdDoneAll color="white" />} />}
          name="Pass Rate"
          value={`${passOverall}%`}
        />
        <MiniStatistics
          startContent={<IconBox w="56px" h="56px" bg="linear-gradient(90deg,#8952FF 0%,#AA80FF 100%)" icon={<MdBook color="white" />} />}
          name="Subjects"
          value={String(subjectsCount)}
        />
      </SimpleGrid>

      <Card overflow="hidden">
        <Heading size="md" p={4} borderBottomWidth={1} borderColor={useColorModeValue('gray.200', 'gray.700')}>
          Results Table
        </Heading>
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead bg={useColorModeValue('gray.50', 'gray.800')}>
              <Tr>
                <Th>
                  <Checkbox isChecked={selectedIds.length===filtered.length && filtered.length>0} isIndeterminate={selectedIds.length>0 && selectedIds.length<filtered.length} onChange={(e)=> setSelectedIds(e.target.checked ? filtered.map((r, i)=> i) : [])} />
                </Th>
                <Th>Class</Th>
                <Th>Subject</Th>
                <Th isNumeric>Average</Th>
                <Th isNumeric>Pass %</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filtered.map((r, idx) => (
                <Tr key={`${r.className}-${r.subject}-${idx}`}>
                  <Td><Checkbox isChecked={selectedIds.includes(idx)} onChange={()=> setSelectedIds(prev => prev.includes(idx) ? prev.filter(i=>i!==idx) : [...prev, idx])} /></Td>
                  <Td>{r.className}</Td>
                  <Td>{r.subject}</Td>
                  <Td isNumeric>{r.avg}%</Td>
                  <Td isNumeric>{r.pass}%</Td>
                  <Td>
                    <HStack spacing={1}>
                      <IconButton aria-label='View' icon={<MdRemoveRedEye />} size='sm' variant='ghost' onClick={()=>{ setActive(r); disc.onOpen(); }} />
                      <IconButton aria-label='Notify' icon={<MdEmail />} size='sm' variant='ghost' onClick={()=> toast({ title:`Notified parents for ${r.className} - ${r.subject}`, status:'success', duration:2000 })} />
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Card>

      <Modal isOpen={disc.isOpen} onClose={disc.onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Result Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {active && (
              <Box>
                <HStack justify='space-between' mb={2}><Text fontWeight='600'>Class</Text><Text>{active.className}</Text></HStack>
                <HStack justify='space-between' mb={2}><Text fontWeight='600'>Subject</Text><Text>{active.subject}</Text></HStack>
                <HStack justify='space-between' mb={2}><Text fontWeight='600'>Average</Text><Text>{active.avg}%</Text></HStack>
                <HStack justify='space-between'><Text fontWeight='600'>Pass %</Text><Text>{active.pass}%</Text></HStack>
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' onClick={disc.onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
