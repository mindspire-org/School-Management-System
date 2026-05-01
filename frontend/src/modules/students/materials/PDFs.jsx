import React, { useMemo, useState } from 'react';
import { Box, Text, SimpleGrid, VStack, HStack, Select, Input, Table, Thead, Tbody, Tr, Th, Td, Badge, Button, Icon, useColorModeValue, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, useDisclosure, Flex } from '@chakra-ui/react';
import { MdFileDownload, MdVisibility, MdOpenInNew, MdPrint, MdPictureAsPdf, MdLibraryBooks, MdAccessTime, MdInsertDriveFile } from 'react-icons/md';
import Card from '../../../components/card/Card';
import MiniStatistics from '../../../components/card/MiniStatistics';
import IconBox from '../../../components/icons/IconBox';
import BarChart from '../../../components/charts/BarChart';
import { mockTeachers, mockStudents } from '../../../utils/mockData';
import { useAuth } from '../../../contexts/AuthContext';

function formatDate(d){ return d.toLocaleDateString(undefined, { day:'2-digit', month:'short', year:'numeric' }); }
function formatSize(kb){ if (kb>1024) return `${(kb/1024).toFixed(1)} MB`; return `${kb} KB`; }

export default function PDFs(){
  const textSecondary = useColorModeValue('gray.600','gray.400');
  const { user } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selected, setSelected] = useState(null);

  const student = useMemo(()=>{
    if (user?.role==='student'){
      const byEmail = mockStudents.find(s=>s.email?.toLowerCase()===user.email?.toLowerCase());
      if (byEmail) return byEmail;
      const byName = mockStudents.find(s=>s.name?.toLowerCase()===user.name?.toLowerCase());
      if (byName) return byName;
      return { id:999, name:user.name, rollNumber:'STU999', class:'10', section:'A', email:user.email };
    }
    return mockStudents[0];
  },[user]);
  const classSection = `${student.class}${student.section}`;
  const subjects = useMemo(() => Array.from(new Set(mockTeachers.filter(t => t.classes?.includes(classSection)).map(t => t.subject))), [classSection]);

  const demoPDFs = useMemo(() => {
    const teachersBySubject = new Map();
    mockTeachers.forEach(t => (t.classes||[]).includes(classSection) && teachersBySubject.set(t.subject, t.name));
    const today = new Date();
    return [
      { id:'P1', title:'Quadratic Equations Guide', subject: subjects[0] || 'Mathematics', teacher: teachersBySubject.get(subjects[0]) || 'Dr. Sarah Wilson', pages: 18, sizeKB: 850, date: new Date(today.getFullYear(), today.getMonth(), today.getDate()-2), tags:['algebra','guide'], url:'#' },
      { id:'P2', title:'Cell Structure Notes', subject: subjects[1] || 'Biology', teacher: teachersBySubject.get(subjects[1]) || 'Ms. Aisha Khan', pages: 12, sizeKB: 640, date: new Date(today.getFullYear(), today.getMonth(), today.getDate()-5), tags:['biology','cells'], url:'#' },
      { id:'P3', title:'Urdu Grammar Handbook', subject: subjects[2] || 'Urdu', teacher: teachersBySubject.get(subjects[2]) || 'Ms. Noor Fatima', pages: 22, sizeKB: 1200, date: new Date(today.getFullYear(), today.getMonth(), today.getDate()-9), tags:['urdu','grammar'], url:'#' },
      { id:'P4', title:'Sorting Algorithms Explained', subject: subjects[3] || 'Computer Science', teacher: teachersBySubject.get(subjects[3]) || 'Mr. Usman Tariq', pages: 16, sizeKB: 980, date: new Date(today.getFullYear(), today.getMonth(), today.getDate()-12), tags:['sorting','cs'], url:'#' },
    ];
  }, [subjects, classSection]);

  const [subject, setSubject] = useState('all');
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => demoPDFs.filter(n => (
    (subject==='all' || n.subject===subject) &&
    (!query || n.title.toLowerCase().includes(query.toLowerCase()) || n.tags.join(',').toLowerCase().includes(query.toLowerCase()))
  )), [demoPDFs, subject, query]);

  const kpis = useMemo(()=>({ total: demoPDFs.length, subjects: new Set(demoPDFs.map(n=>n.subject)).size, recent: demoPDFs.filter(n => (Date.now()-n.date.getTime())/(1000*60*60*24) <= 7).length, pages: demoPDFs.reduce((a,b)=>a+b.pages,0)}), [demoPDFs]);
  const chartData = useMemo(()=> ([{ name:'PDFs', data: subjects.map(s => demoPDFs.filter(n=>n.subject===s).length) }]), [demoPDFs, subjects]);
  const chartOptions = useMemo(()=> ({ xaxis:{ categories: subjects }, colors:['#3182CE'], dataLabels:{ enabled:false } }), [subjects]);

  const downloadPDF = (n) => {
    const content = `${n.title}\nPDF size: ${formatSize(n.sizeKB)}\nPages: ${n.pages}\n${n.tags.join(', ')}`;
    const blob = new Blob([content], { type:'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`${n.title.replace(/\s+/g,'_')}.pdf.txt`; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <Box pt={{ base:'130px', md:'80px', xl:'80px' }}>
      <Text fontSize='2xl' fontWeight='bold' mb='6px'>PDFs</Text>
      <Text fontSize='md' color={textSecondary} mb='16px'>{student.name} • Roll {student.rollNumber} • Class {classSection}</Text>

      <Box mb='16px'>
        <Flex gap='16px' w='100%' wrap='nowrap'>
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#B721FF 0%,#21D4FD 100%)' icon={<Icon as={MdPictureAsPdf} w='22px' h='22px' color='white' />} />}
            name='Total PDFs'
            value={String(kpis.total)}
            trendData={[1,2,2,3,4]}
            trendColor='#B721FF'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#01B574 0%,#51CB97 100%)' icon={<Icon as={MdLibraryBooks} w='22px' h='22px' color='white' />} />}
            name='Subjects'
            value={String(kpis.subjects)}
            trendData={[1,1,2,2,2]}
            trendColor='#01B574'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#4481EB 0%,#04BEFE 100%)' icon={<Icon as={MdAccessTime} w='22px' h='22px' color='white' />} />}
            name='Recent (7d)'
            value={String(kpis.recent)}
            trendData={[0,1,1,2,2]}
            trendColor='#4481EB'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#FFB36D 0%,#FD7853 100%)' icon={<Icon as={MdInsertDriveFile} w='22px' h='22px' color='white' />} />}
            name='Total Pages'
            value={String(kpis.pages)}
            trendData={[50,60,70,80,90]}
            trendColor='#FD7853'
          />
        </Flex>
      </Box>

      <Card p='16px' mb='16px'>
        <HStack spacing={3} flexWrap='wrap' rowGap={3}>
          <Select size='sm' value={subject} onChange={e=>setSubject(e.target.value)} maxW='220px'>
            <option value='all'>All Subjects</option>
            {subjects.map(s => <option key={s}>{s}</option>)}
          </Select>
          <Input size='sm' placeholder='Search title or tags...' value={query} onChange={e=>setQuery(e.target.value)} maxW='260px' />
          <HStack ml='auto'>
            <Button size='sm' variant='outline' leftIcon={<Icon as={MdPrint} />} onClick={()=>window.print()}>Print</Button>
            <Button size='sm' colorScheme='purple' leftIcon={<Icon as={MdFileDownload} />} onClick={()=>filtered.forEach(downloadPDF)}>Download All</Button>
          </HStack>
        </HStack>
      </Card>

      <Card p='0' mb='16px'>
        <Table size='sm' variant='striped' colorScheme='gray'>
          <Thead><Tr><Th>Title</Th><Th>Subject</Th><Th>Teacher</Th><Th>Pages</Th><Th>Size</Th><Th>Date</Th><Th>Tags</Th><Th>Actions</Th></Tr></Thead>
          <Tbody>
            {filtered.map(n => (
              <Tr key={n.id}>
                <Td>{n.title}</Td>
                <Td>{n.subject}</Td>
                <Td>{n.teacher}</Td>
                <Td>{n.pages}</Td>
                <Td>{formatSize(n.sizeKB)}</Td>
                <Td>{formatDate(n.date)}</Td>
                <Td><HStack spacing={1} wrap='wrap'>{n.tags.map(t => <Badge key={t}>{t}</Badge>)}</HStack></Td>
                <Td>
                  <HStack>
                    <Button size='xs' leftIcon={<Icon as={MdVisibility} />} onClick={()=>{ setSelected(n); onOpen(); }}>Preview</Button>
                    <Button size='xs' colorScheme='purple' leftIcon={<Icon as={MdFileDownload} />} onClick={()=>downloadPDF(n)}>Download</Button>
                    <Button size='xs' variant='outline' leftIcon={<Icon as={MdOpenInNew} />} onClick={()=>window.open(n.url || '#','_blank')}>Open</Button>
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Card>

      <Card p='16px'>
        <Text fontSize='md' fontWeight='bold' mb='8px'>PDFs by Subject</Text>
        <BarChart chartData={chartData} chartOptions={chartOptions} height={220} />
      </Card>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Preview: {selected?.title}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selected ? (
              <VStack align='start' spacing={2}>
                <Text fontWeight='600'>{selected.subject} • {selected.teacher}</Text>
                <Text color={textSecondary}>Pages: {selected.pages} • Size: {formatSize(selected.sizeKB)}</Text>
                <HStack spacing={2}>{selected.tags.map(t => <Badge key={t}>{t}</Badge>)}</HStack>
              </VStack>
            ) : null}
          </ModalBody>
          <ModalFooter><Button onClick={onClose}>Close</Button></ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
