import React, { useMemo, useState } from 'react';
import { Box, Text, SimpleGrid, VStack, HStack, Select, Input, Textarea, Table, Thead, Tbody, Tr, Th, Td, Badge, Button, Icon, useColorModeValue, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, useDisclosure, Flex } from '@chakra-ui/react';
import { MdUpload, MdSend, MdVisibility, MdPendingActions, MdCheckCircle, MdClass } from 'react-icons/md';
import Card from '../../../components/card/Card';
import MiniStatistics from '../../../components/card/MiniStatistics';
import IconBox from '../../../components/icons/IconBox';
import { mockAssignments, mockTeachers, mockStudents } from '../../../utils/mockData';
import { useAuth } from '../../../contexts/AuthContext';

export default function SubmitWork() {
  const textSecondary = useColorModeValue('gray.600', 'gray.400');
  const { user } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selected, setSelected] = useState(null);
  const [file, setFile] = useState(null);
  const [comment, setComment] = useState('');

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

  const basePending = useMemo(() => mockAssignments.filter(a => a.status === 'pending' && (subjects.length === 0 || subjects.includes(a.subject))), [subjects]);
  const baseSubmitted = useMemo(() => mockAssignments.filter(a => a.status === 'submitted' && (subjects.length === 0 || subjects.includes(a.subject))), [subjects]);

  const demoPending = useMemo(() => ([
    { id: 'D-P1', title: 'Computer Science Lab 2', subject: subjects[0] || 'Computer Science', teacher: 'Mr. Usman Tariq', dueDate: '2025-03-22', status: 'pending', description: 'Implement and analyze sorting algorithms (Bubble vs. Insertion). Upload code and a short report.' },
    { id: 'D-P2', title: 'Urdu Essay: Safai Nisf Iman', subject: subjects[1] || 'Urdu', teacher: 'Ms. Noor Fatima', dueDate: '2025-03-20', status: 'pending', description: '500–700 words essay. Focus on structure and references.' },
    { id: 'D-P3', title: 'Islamiat Short Questions - Unit 3', subject: subjects[2] || 'Islamiat', teacher: 'Mr. Saad Ali', dueDate: '2025-03-24', status: 'pending', description: 'Answer all 10 questions briefly and clearly.' },
  ]), [subjects]);

  const demoSubmitted = useMemo(() => ([
    { id: 'D-S1', title: 'Pakistan Studies Timeline', subject: subjects[3] || 'Pakistan Studies', teacher: 'Ms. Hina Shah', dueDate: '2025-03-10', status: 'submitted', description: 'Create a timeline of major events 1930–1947.' },
  ]), [subjects]);

  const pending = useMemo(() => [...basePending, ...demoPending], [basePending, demoPending]);
  const submitted = useMemo(() => [...baseSubmitted, ...demoSubmitted], [baseSubmitted, demoSubmitted]);

  const [subject, setSubject] = useState('all');
  const filteredPending = useMemo(() => pending.filter(a => subject === 'all' || a.subject === subject), [pending, subject]);

  const beginSubmit = (a) => { setSelected(a); setFile(null); setComment(''); onOpen(); };
  const doSubmit = () => {
    onClose();
    alert(`Submitted: ${selected.title}\nFile: ${file?.name || 'none'}\nComment: ${comment || '—'}`);
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Text fontSize='2xl' fontWeight='bold' mb='6px'>Submit Work</Text>
      <Text fontSize='md' color={textSecondary} mb='16px'>{student.name} • Roll {student.rollNumber} • Class {classSection}</Text>

      <Box mb='16px'>
        <Flex gap='16px' w='100%' wrap='nowrap'>
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#FFB36D 0%,#FD7853 100%)' icon={<Icon as={MdPendingActions} w='22px' h='22px' color='white' />} />}
            name='Pending'
            value={String(pending.length)}
            trendData={[1,1,2,2,2]}
            trendColor='#FD7853'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#4481EB 0%,#04BEFE 100%)' icon={<Icon as={MdCheckCircle} w='22px' h='22px' color='white' />} />}
            name='Submitted'
            value={String(submitted.length)}
            trendData={[0,1,1,2,3]}
            trendColor='#4481EB'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#01B574 0%,#51CB97 100%)' icon={<Icon as={MdClass} w='22px' h='22px' color='white' />} />}
            name='Subjects'
            value={String(subjects.length)}
            trendData={[1,1,1,1,1]}
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
        </HStack>
      </Card>

      <Card p='0' mb='16px'>
        <Table size='sm' variant='striped' colorScheme='gray'>
          <Thead><Tr><Th>Title</Th><Th>Subject</Th><Th>Teacher</Th><Th>Due</Th><Th>Status</Th><Th>Actions</Th></Tr></Thead>
          <Tbody>
            {filteredPending.map(a => (
              <Tr key={a.id}>
                <Td>
                  <HStack spacing={2}>
                    <Text>{a.title}</Text>
                    {String(a.id).toString().startsWith('D-') && <Badge variant='outline' colorScheme='purple'>Demo</Badge>}
                  </HStack>
                </Td>
                <Td>{a.subject}</Td>
                <Td>{a.teacher}</Td>
                <Td>{a.dueDate}</Td>
                <Td><Badge colorScheme='yellow'>{a.status}</Badge></Td>
                <Td>
                  <HStack>
                    <Button size='xs' leftIcon={<Icon as={MdUpload} />} colorScheme='purple' onClick={()=>beginSubmit(a)}>Upload</Button>
                    <Button size='xs' leftIcon={<Icon as={MdVisibility} />} onClick={()=>alert(a.description)}>View</Button>
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Card>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Submit: {selected?.title}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align='stretch' spacing={3}>
              <Input type='file' onChange={e=>setFile(e.target.files?.[0])} />
              <Textarea placeholder='Add a comment (optional)...' value={comment} onChange={e=>setComment(e.target.value)} />
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={onClose}>Cancel</Button>
            <Button colorScheme='purple' leftIcon={<Icon as={MdSend} />} onClick={doSubmit}>Submit</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
