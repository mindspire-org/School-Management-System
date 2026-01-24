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
  Textarea,
  Button,
  IconButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tooltip,
  Badge,
  useColorModeValue,
  Icon,
  useToast,
} from '@chakra-ui/react';
import { MdRefresh, MdFileDownload, MdVisibility, MdEdit, MdSearch, MdUpload, MdSave, MdInsertDriveFile, MdPictureAsPdf, MdLibraryBooks } from 'react-icons/md';
import Card from '../../../components/card/Card';
import MiniStatistics from '../../../components/card/MiniStatistics';
import IconBox from '../../../components/icons/IconBox';
import BarChart from '../../../components/charts/BarChart';
import PieChart from '../../../components/charts/PieChart';

const sampleNotes = [
  { id: 1, title: 'Algebra Basics.pdf', subject: 'Mathematics', cls: '10', section: 'A', size: '1.2 MB', type: 'PDF', uploaded: '2024-03-01' },
  { id: 2, title: 'Physics Laws.docx', subject: 'Physics', cls: '10', section: 'A', size: '850 KB', type: 'DOCX', uploaded: '2024-03-02' },
  { id: 3, title: 'Chemical Bonds.pptx', subject: 'Chemistry', cls: '10', section: 'B', size: '2.1 MB', type: 'PPTX', uploaded: '2024-03-03' },
  { id: 4, title: 'Grammar Unit 5.pdf', subject: 'English', cls: '9', section: 'A', size: '1.0 MB', type: 'PDF', uploaded: '2024-03-04' },
];

export default function UploadNotes() {
  const textSecondary = useColorModeValue('gray.600', 'gray.400');
  const headerBg = useColorModeValue('white', 'gray.800');
  const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.100');
  const toast = useToast();

  const [subject, setSubject] = useState('');
  const [cls, setCls] = useState('');
  const [section, setSection] = useState('');
  const [q, setQ] = useState('');
  const [form, setForm] = useState({ title: '', subject: '', cls: '', section: '', tags: '', file: null });

  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'English'];

  const filtered = useMemo(() => sampleNotes.filter(n =>
    (!subject || n.subject === subject) && (!cls || n.cls === cls) && (!section || n.section === section) && (!q || n.title.toLowerCase().includes(q.toLowerCase()))
  ), [subject, cls, section, q]);

  const kpis = useMemo(() => ({
    total: filtered.length,
    pdf: filtered.filter(n => n.type === 'PDF').length,
    subjects: new Set(filtered.map(n => n.subject)).size,
  }), [filtered]);

  const chartData = useMemo(() => ([{
    name: 'Files', data: Object.values(filtered.reduce((acc, n) => { acc[n.subject] = (acc[n.subject] || 0) + 1; return acc; }, {}))
  }]), [filtered]);
  const chartOptions = useMemo(() => ({
    chart: { toolbar: { show: false } },
    xaxis: { categories: Object.keys(filtered.reduce((acc, n) => { acc[n.subject] = (acc[n.subject] || 0) + 1; return acc; }, {})) },
    dataLabels: { enabled: false },
    colors: ['#3182CE'],
  }), [filtered]);

  const subjectDistribution = useMemo(() => {
    const map = {};
    filtered.forEach(n => { map[n.subject] = (map[n.subject] || 0) + 1; });
    const labels = Object.keys(map);
    const values = labels.map(l => map[l]);
    return { labels, values };
  }, [filtered]);

  const exportCSV = () => {
    const header = ['Title','Subject','Class','Section','Type','Size','Uploaded'];
    const rows = filtered.map(n => [n.title, n.subject, n.cls, n.section, n.type, n.size, n.uploaded]);
    const csv = [header, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'notes.csv'; a.click(); URL.revokeObjectURL(url);
  };

  const save = () => {
    if (!form.title || !form.subject || !form.cls || !form.section || !form.file) {
      toast({ title: 'Please fill required fields and attach a file', status: 'warning' });
      return;
    }
    toast({ title: 'Note uploaded (demo)', description: form.title, status: 'success' });
    setForm({ title: '', subject: '', cls: '', section: '', tags: '', file: null });
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Text fontSize='2xl' fontWeight='bold' mb='6px'>Upload Notes</Text>
      <Text fontSize='md' color={textSecondary} mb='16px'>Share documents with your class</Text>

      <Box mb='16px'>
        <Flex gap='16px' w='100%' wrap='nowrap'>
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#4481EB 0%,#04BEFE 100%)' icon={<MdInsertDriveFile color='white' />} />}
            name='Total Files'
            value={String(kpis.total)}
            trendData={[1,2,2,3,3,4]}
            trendColor='#4481EB'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#E83E8C 0%,#FF6CAB 100%)' icon={<MdPictureAsPdf color='white' />} />}
            name='PDFs'
            value={String(kpis.pdf)}
            trendData={[0,1,1,1,2,2]}
            trendColor='#E83E8C'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#01B574 0%,#51CB97 100%)' icon={<MdLibraryBooks color='white' />} />}
            name='Subjects'
            value={String(kpis.subjects)}
            trendData={[1,1,2,2,3,3]}
            trendColor='#01B574'
          />
        </Flex>
      </Box>

      <Card p='16px' mb='16px'>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing='12px' mb='12px'>
          <Input size='sm' placeholder='Title*' value={form.title} onChange={e=>setForm(f=>({...f, title: e.target.value}))} />
          <Select size='sm' placeholder='Subject*' value={form.subject} onChange={e=>setForm(f=>({...f, subject: e.target.value}))}>{subjects.map(s=> <option key={s}>{s}</option>)}</Select>
          <HStack>
            <Select size='sm' placeholder='Class*' value={form.cls} onChange={e=>setForm(f=>({...f, cls: e.target.value}))}><option>9</option><option>10</option></Select>
            <Select size='sm' placeholder='Section*' value={form.section} onChange={e=>setForm(f=>({...f, section: e.target.value}))}><option>A</option><option>B</option></Select>
          </HStack>
        </SimpleGrid>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing='12px'>
          <Textarea size='sm' placeholder='Tags (comma separated)' value={form.tags} onChange={e=>setForm(f=>({...f, tags: e.target.value}))} />
          <HStack>
            <Input size='sm' type='file' onChange={e=>setForm(f=>({...f, file: e.target.files?.[0]||null}))} />
            <Button size='sm' leftIcon={<Icon as={MdUpload}/>} onClick={save} colorScheme='blue'>Upload</Button>
          </HStack>
        </SimpleGrid>
      </Card>

      <Card p='16px' mb='16px'>
        <Flex gap={3} flexWrap='wrap' justify='space-between' align='center'>
          <HStack spacing={3} flexWrap='wrap' rowGap={3}>
            <Select placeholder='Subject' value={subject} onChange={e=>setSubject(e.target.value)} size='sm' maxW='160px'>{subjects.map(s=> <option key={s}>{s}</option>)}</Select>
            <Select placeholder='Class' value={cls} onChange={e=>setCls(e.target.value)} size='sm' maxW='140px'><option>9</option><option>10</option></Select>
            <Select placeholder='Section' value={section} onChange={e=>setSection(e.target.value)} size='sm' maxW='140px'><option>A</option><option>B</option></Select>
            <HStack>
              <Input placeholder='Search title' value={q} onChange={e=>setQ(e.target.value)} size='sm' maxW='240px' />
              <IconButton aria-label='Search' icon={<MdSearch />} size='sm' />
            </HStack>
          </HStack>
          <HStack>
            <Button size='sm' variant='outline' leftIcon={<Icon as={MdRefresh}/>} onClick={()=>{setSubject('');setCls('');setSection('');setQ('');}}>Reset</Button>
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
                  <Th>Title</Th>
                  <Th>Subject</Th>
                  <Th>Class</Th>
                  <Th>Type</Th>
                  <Th>Size</Th>
                  <Th>Uploaded</Th>
                  <Th textAlign='right'>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filtered.map(n => (
                  <Tr key={n.id} _hover={{ bg: hoverBg }}>
                    <Td><Tooltip label={n.title}><Box isTruncated maxW='280px'>{n.title}</Box></Tooltip></Td>
                    <Td>{n.subject}</Td>
                    <Td>{n.cls}-{n.section}</Td>
                    <Td><Badge>{n.type}</Badge></Td>
                    <Td>{n.size}</Td>
                    <Td>{n.uploaded}</Td>
                    <Td>
                      <HStack justify='flex-end'>
                        <Tooltip label='View'>
                          <IconButton aria-label='View' icon={<MdVisibility/>} size='sm' variant='ghost' />
                        </Tooltip>
                        <Tooltip label='Edit'>
                          <IconButton aria-label='Edit' icon={<MdEdit/>} size='sm' variant='ghost' />
                        </Tooltip>
                      </HStack>
                    </Td>
                  </Tr>
                ))}
                {filtered.length===0 && (
                  <Tr><Td colSpan={7}><Box p='12px' textAlign='center' color={textSecondary}>No notes found.</Box></Td></Tr>
                )}
              </Tbody>
            </Table>
          </Box>
        </Box>
      </Card>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
        <Card p='16px'>
          <Box>
            <Text fontWeight='700' mb='8px'>Files by Subject</Text>
            <BarChart chartData={chartData} chartOptions={chartOptions} height={220} />
          </Box>
        </Card>
        <Card p='16px'>
          <Box>
            <Text fontWeight='700' mb='8px'>Subject Distribution</Text>
            <PieChart height={240} chartData={subjectDistribution.values} chartOptions={{ labels: subjectDistribution.labels, legend:{ position:'right' } }} />
          </Box>
        </Card>
      </SimpleGrid>
    </Box>
  );
}
