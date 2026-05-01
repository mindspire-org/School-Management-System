import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Heading,
  Text,
  HStack,
  Button,
  ButtonGroup,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Flex,
  IconButton,
  useColorModeValue,
  useToast,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
} from '@chakra-ui/react';
import { MdArrowBack, MdAssignment, MdEdit, MdDelete } from 'react-icons/md';
import { useLocation, useNavigate } from 'react-router-dom';
import * as resultsApi from '../../../../services/api/results';
import Card from 'components/card/Card';

const fmt = (n) => (n===null||n===undefined||Number.isNaN(Number(n)) ? '' : String(n));

export default function ResultsClassView() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const cls = params.get('class') || '';
  const section = params.get('section') || '';
  const examId = params.get('examId') || '';
  const subject = params.get('subject') || '';

  const toast = useToast();
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const editDiscRef = React.useRef();
  const [isEditOpen, setEditOpen] = useState(false);

  const printRef = useRef(null);

  const fetchRows = useCallback(async () => {
    try {
      setLoading(true);
      const query = {};
      if (cls) query.className = cls;
      if (section) query.section = section;
      if (subject) query.subject = subject;
      if (examId) query.examId = Number(examId);
      const res = await resultsApi.list(query);
      const items = Array.isArray(res?.items) ? res.items : Array.isArray(res) ? res : [];
      setRows(items);
    } catch (e) {
      console.error(e);
      toast({ title: 'Failed to load class results', status: 'error' });
      setRows([]);
    } finally { setLoading(false); }
  }, [cls, section, subject, examId, toast]);

  useEffect(() => { fetchRows(); }, [fetchRows]);

  const avg = useMemo(() => {
    const total = rows.length || 1; const sum = rows.reduce((a,b)=> a + (Number(b.marks)||0), 0); return Math.round(sum/total);
  }, [rows]);
  const pass = useMemo(() => {
    const total = rows.length || 1; const passed = rows.filter(r => (Number(r.marks)||0) >= 33).length; return Math.round((passed/total)*100);
  }, [rows]);

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Flex mb={5} justifyContent="space-between" alignItems="center">
        <HStack>
          <Button leftIcon={<MdArrowBack />} onClick={() => navigate(-1)}>Back</Button>
          <Box>
            <Heading as="h3" size="lg" mb={1} color={textColor}>Class Results</Heading>
            <Text color={textColorSecondary}>{`Class: ${cls}${section ? '-' + section : ''}${subject ? ' | Subject: ' + subject : ''}${examId ? ' | Exam ID: ' + examId : ''}`}</Text>
          </Box>
        </HStack>
        <ButtonGroup>
          <Button leftIcon={<MdAssignment />} colorScheme='blue' onClick={() => window.print()}>Export PDF</Button>
        </ButtonGroup>
      </Flex>

      <Card p={4} mb={4} ref={printRef}>
        <HStack justify='space-between' mb={3}>
          <Text fontWeight='600'>Average Marks: {avg}%</Text>
          <Text fontWeight='600'>Pass Rate: {pass}%</Text>
        </HStack>
        <Box overflowX='auto'>
          <Table size='sm' variant='simple'>
            <Thead bg={useColorModeValue('gray.50', 'gray.800')}>
              <Tr>
                <Th>Student</Th>
                <Th>Student ID</Th>
                <Th>Exam</Th>
                <Th>Subject</Th>
                <Th isNumeric>Marks</Th>
                <Th>Grade</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {loading ? (
                <Tr><Td colSpan={7}><Flex align='center' justify='center' py={6}>Loading...</Flex></Td></Tr>
              ) : rows.map((r) => (
                <Tr key={r.id}>
                  <Td>{r.studentName}</Td>
                  <Td>{r.studentId}</Td>
                  <Td>{r.examTitle}</Td>
                  <Td>{r.subject}</Td>
                  <Td isNumeric>{fmt(r.marks)}</Td>
                  <Td>{fmt(r.grade)}</Td>
                  <Td>
                    <HStack spacing={1}>
                      <IconButton aria-label='Edit' icon={<MdEdit />} size='sm' variant='ghost' onClick={()=>{ setEditItem({ ...r }); setEditOpen(true); }} />
                      <IconButton aria-label='Delete' icon={<MdDelete />} size='sm' variant='ghost' colorScheme='red' onClick={async ()=>{
                        if(!window.confirm('Delete this result entry?')) return; try { await resultsApi.remove(r.id); toast({ title:'Deleted', status:'success', duration:1200 }); fetchRows(); } catch { toast({ title:'Delete failed', status:'error' }); }
                      }} />
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Card>

      <Modal isOpen={isEditOpen} onClose={()=> setEditOpen(false)} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Result</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {editItem && (
              <Box>
                <HStack justify='space-between' mb={2}><Text fontWeight='600'>Student</Text><Text>{editItem.studentName} (ID: {editItem.studentId})</Text></HStack>
                <HStack justify='space-between' mb={2}><Text fontWeight='600'>Exam</Text><Text>{editItem.examTitle}</Text></HStack>
                <HStack justify='space-between' mb={2}><Text fontWeight='600'>Subject</Text><Text>{editItem.subject}</Text></HStack>
                <HStack>
                  <Box flex='1'>
                    <Text mb={1}>Marks</Text>
                    <Input type='number' value={fmt(editItem.marks)} onChange={(e)=> setEditItem(it=>({ ...it, marks: e.target.value }))} />
                  </Box>
                  <Box flex='1'>
                    <Text mb={1}>Grade</Text>
                    <Input value={fmt(editItem.grade)} onChange={(e)=> setEditItem(it=>({ ...it, grade: e.target.value }))} />
                  </Box>
                </HStack>
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={()=> setEditOpen(false)}>Cancel</Button>
            <Button colorScheme='blue' onClick={async ()=>{
              if(!editItem) return; try { await resultsApi.update(editItem.id, { marks: editItem.marks===''? null : Number(editItem.marks), grade: editItem.grade || null }); toast({ title:'Result updated', status:'success', duration:1500 }); setEditOpen(false); fetchRows(); } catch { toast({ title:'Update failed', status:'error' }); }
            }}>Save</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
