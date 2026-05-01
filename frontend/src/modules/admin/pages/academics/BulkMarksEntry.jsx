import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card as ChakraCard,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  Select,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import {
  MdFileDownload,
  MdSave,
  MdRefresh,
  MdInfo,
  MdCheckCircle,
  MdError,
  MdSchool,
  MdEdit,
} from 'react-icons/md';
import Card from 'components/card/Card';
import { useAuth } from '../../../../contexts/AuthContext';
import StatCard from '../../../../components/card/StatCard';
import * as classesApi from '../../../../services/api/classes';
import * as examsApi from '../../../../services/api/exams';
import * as studentsApi from '../../../../services/api/students';
import * as resultsApi from '../../../../services/api/results';
import { masterDataApi } from '../../../../services/api';

const fmt = (n) => (n === null || n === undefined || Number.isNaN(Number(n)) ? '' : String(n));

export default function BulkMarksEntry() {
  const { campusId } = useAuth();
  const toast = useToast();

  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const brandColor = useColorModeValue('brand.500', 'brand.400');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');
  const headerBg = useColorModeValue('gray.50', 'gray.800');
  const rowHoverBg = useColorModeValue('gray.50', 'whiteAlpha.100');

  const [classRows, setClassRows] = useState([]);
  const [selectedClassKey, setSelectedClassKey] = useState('');
  const selectedClass = useMemo(() => {
    if (!selectedClassKey) return null;
    const [className, section] = selectedClassKey.split('::');
    return { className, section };
  }, [selectedClassKey]);

  const [exams, setExams] = useState([]);
  const [examId, setExamId] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [subject, setSubject] = useState('');

  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingExams, setLoadingExams] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  const [marksMap, setMarksMap] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingClasses(true);
      try {
        const res = await classesApi.list({ page: 1, pageSize: 200 });
        const dataset = Array.isArray(res?.rows) ? res.rows : Array.isArray(res) ? res : [];
        const normalized = dataset
          .map((r) => ({
            className: r.className || r.name || r.title || '',
            section: r.section || r.sectionName || '',
          }))
          .filter((r) => r.className && r.section);

        const unique = new Map();
        normalized.forEach((r) => unique.set(`${r.className}::${r.section}`, r));
        const list = Array.from(unique.values()).sort((a, b) => {
          const c = String(a.className).localeCompare(String(b.className));
          if (c !== 0) return c;
          return String(a.section).localeCompare(String(b.section));
        });

        if (!mounted) return;
        setClassRows(list);
        if (!selectedClassKey && list.length) {
          setSelectedClassKey(`${list[0].className}::${list[0].section}`);
        }
      } catch (_) {
        if (!mounted) return;
        setClassRows([]);
      } finally {
        if (mounted) setLoadingClasses(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [selectedClassKey]);

  const loadExams = useCallback(async () => {
    if (!selectedClass?.className || !selectedClass?.section) {
      setExams([]);
      setExamId('');
      return;
    }
    setLoadingExams(true);
    try {
      const res = await examsApi.list({
        pageSize: 200,
        className: selectedClass.className,
        section: selectedClass.section,
      });
      const items = Array.isArray(res?.items) ? res.items : Array.isArray(res) ? res : [];
      setExams(items);
      setExamId((prev) => (prev ? prev : items?.[0]?.id ? String(items[0].id) : ''));
    } catch (_) {
      setExams([]);
      setExamId('');
    } finally {
      setLoadingExams(false);
    }
  }, [selectedClass]);

  useEffect(() => {
    loadExams();
  }, [loadExams]);

  const loadSubjects = useCallback(async () => {
    setLoadingSubjects(true);
    try {
      const res = await masterDataApi.getSubjects();
      const list = Array.isArray(res) ? res : [];
      setSubjects(list);
      setSubject((prev) => {
        if (prev) return prev;
        const first = list?.[0]?.name || '';
        return first;
      });
    } catch (_) {
      setSubjects([]);
    } finally {
      setLoadingSubjects(false);
    }
  }, []);

  useEffect(() => {
    loadSubjects();
  }, [loadSubjects]);

  const loadStudents = useCallback(async () => {
    if (!selectedClass?.className || !selectedClass?.section) {
      setStudents([]);
      setMarksMap({});
      return;
    }
    setLoadingStudents(true);
    try {
      // Fetch students for the class
      const res = await studentsApi.list({
        page: 1,
        pageSize: 500, // Load more for bulk entry
        class: selectedClass.className,
        section: selectedClass.section,
        campusId, // Use active campus context
      });
      const list = Array.isArray(res?.rows) ? res.rows : Array.isArray(res) ? res : [];
      
      // Fetch existing results to pre-fill
      let existingResults = [];
      if (examId && subject) {
        const resultsRes = await resultsApi.list({
          examId,
          subject,
          className: selectedClass.className,
          section: selectedClass.section,
          campusId,
          pageSize: 500
        });
        existingResults = Array.isArray(resultsRes?.rows) ? resultsRes.rows : Array.isArray(resultsRes) ? resultsRes : [];
      }

      setStudents(list);
      
      // Map existing marks
      const resultsMap = {};
      existingResults.forEach(r => {
        if (r.studentId) resultsMap[r.studentId] = r.marks;
      });

      setMarksMap((prev) => {
        const next = { ...prev };
        list.forEach((st) => {
          // Priority: existing from DB > current state > empty
          if (resultsMap[st.id] !== undefined) {
            next[st.id] = resultsMap[st.id];
          } else if (next[st.id] === undefined) {
            next[st.id] = '';
          }
        });
        return next;
      });
    } catch (e) {
      setStudents([]);
      setMarksMap({});
      toast({ title: 'Failed to load data', description: e?.message || 'Request failed', status: 'error' });
    } finally {
      setLoadingStudents(false);
    }
  }, [selectedClass, examId, subject, campusId, toast]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const canSubmit = useMemo(() => {
    return !!(selectedClass?.className && selectedClass?.section && examId && subject && students.length);
  }, [selectedClass, examId, subject, students.length]);

  const handleSave = async () => {
    if (!canSubmit) return;
    const eid = Number(examId);
    if (!eid) {
      toast({ title: 'Select exam', status: 'warning' });
      return;
    }

    const items = students
      .map((st) => {
        const raw = marksMap[st.id];
        const marks = raw === '' || raw === null || raw === undefined ? null : Number(raw);
        if (marks === null) return null;
        return {
          examId: eid,
          studentId: Number(st.id),
          subject: String(subject).trim(),
          marks,
        };
      })
      .filter(Boolean);

    if (!items.length) {
      toast({ title: 'No marks entered', description: 'Enter marks for at least one student.', status: 'info' });
      return;
    }

    setSaving(true);
    try {
      await resultsApi.bulkCreate(items.map(it => ({ ...it, campusId })));
      toast({
        title: 'Marks saved',
        description: `${items.length} result${items.length > 1 ? 's' : ''} submitted successfully.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      // Optionally reload to confirm what's in DB
      loadStudents();
    } catch (e) {
      toast({ title: 'Failed to save marks', description: e?.message || 'Request failed', status: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleExportCSV = () => {
    if (!students.length) return;
    const header = ['StudentId', 'Student', 'Roll', 'Marks'];
    const data = students.map((st) => [
      st.id,
      st.name,
      st.rollNumber || '',
      marksMap[st.id] ?? '',
    ]);
    const csv = [header, ...data]
      .map((row) => row.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bulk_marks_${selectedClass?.className || 'class'}_${selectedClass?.section || 'section'}_${String(subject || 'subject').replace(/\s+/g, '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const stats = useMemo(() => {
    const total = students.length;
    const entered = Object.values(marksMap).filter(v => v !== '' && v !== null).length;
    const avg = entered > 0 
      ? (Object.values(marksMap).reduce((s, v) => s + (Number(v) || 0), 0) / entered).toFixed(1)
      : 0;
    return { total, entered, avg };
  }, [students, marksMap]);

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Flex mb={5} justifyContent="space-between" alignItems="center" gap={3} flexWrap="wrap">
        <Box>
          <Heading as="h3" size="lg" mb={1} color={textColor}>Bulk Marks Entry</Heading>
          <Text color={textColorSecondary}>Efficiently manage subject results for an entire class.</Text>
        </Box>
        <HStack spacing={3}>
          <Button 
            leftIcon={<MdRefresh />} 
            variant="outline" 
            onClick={loadStudents} 
            isLoading={loadingStudents}
            size="md"
          >
            Refresh
          </Button>
          <Button 
            leftIcon={<MdFileDownload />} 
            variant="outline" 
            colorScheme="green"
            onClick={handleExportCSV} 
            isDisabled={!students.length}
            size="md"
          >
            Export CSV
          </Button>
          <Button 
            leftIcon={<MdSave />} 
            colorScheme="brand" 
            onClick={handleSave} 
            isLoading={saving} 
            isDisabled={!canSubmit}
            size="md"
            boxShadow="0px 4px 12px rgba(0, 0, 0, 0.1)"
          >
            Save All Marks
          </Button>
        </HStack>
      </Flex>

      {/* Statistics Cards */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={6}>
        <StatCard
          title="Total Students"
          value={String(stats.total)}
          icon={MdPeople}
          colorScheme="blue"
        />
        <StatCard
          title="Marks Entered"
          value={`${stats.entered} / ${stats.total}`}
          icon={MdCheckCircle}
          colorScheme="green"
          trend={stats.entered === stats.total ? 'up' : 'neutral'}
        />
        <StatCard
          title="Average Score"
          value={String(stats.avg)}
          icon={MdSchool}
          colorScheme="purple"
        />
      </SimpleGrid>

      <Card p={6} mb={6} border="1px solid" borderColor={borderColor}>
        <Flex gap={6} direction={{ base: 'column', lg: 'row' }} align={{ lg: 'flex-end' }}>
          <FormControl flex={1}>
            <FormLabel fontWeight="600" color={textColor}>Select Class</FormLabel>
            <Select
              value={selectedClassKey}
              onChange={(e) => {
                setSelectedClassKey(e.target.value);
                setMarksMap({});
              }}
              placeholder="Choose a class"
              size="md"
              focusBorderColor="brand.400"
            >
              {classRows.map((c) => (
                <option key={`${c.className}::${c.section}`} value={`${c.className}::${c.section}`}>
                  Class {c.className} - Section {c.section}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl flex={1} isDisabled={!selectedClass}>
            <FormLabel fontWeight="600" color={textColor}>Select Exam</FormLabel>
            <Select 
              value={examId} 
              onChange={(e) => setExamId(e.target.value)} 
              placeholder="Choose an exam" 
              size="md"
              focusBorderColor="brand.400"
            >
              {exams.map((ex) => (
                <option key={ex.id} value={ex.id}>{ex.title}</option>
              ))}
            </Select>
          </FormControl>

          <FormControl flex={1} isDisabled={!selectedClass}>
            <FormLabel fontWeight="600" color={textColor}>Select Subject</FormLabel>
            <Select 
              value={subject} 
              onChange={(e) => setSubject(e.target.value)} 
              placeholder="Choose a subject" 
              size="md"
              focusBorderColor="brand.400"
            >
              {subjects.map((s) => {
                const label = (s?.name || '').trim();
                if (!label) return null;
                return <option key={s.id ?? label} value={label}>{label}</option>;
              })}
            </Select>
          </FormControl>

          <FormControl maxW={{ base: '100%', lg: '240px' }} borderLeft={{ lg: "2px solid" }} borderColor={{ lg: borderColor }} pl={{ lg: 6 }}>
            <FormLabel fontWeight="600" color={textColor}>Bulk Assign Marks</FormLabel>
            <InputGroup size="md">
              <Input
                placeholder="Score for all"
                type="number"
                onKeyDown={(e) => {
                  if (e.key !== 'Enter') return;
                  const val = e.currentTarget.value;
                  if (val === '') return;
                  setMarksMap((prev) => {
                    const next = { ...prev };
                    students.forEach((st) => { next[st.id] = val; });
                    return next;
                  });
                  e.currentTarget.value = '';
                  toast({ title: 'Marks applied to all', status: 'info', duration: 2000 });
                }}
                focusBorderColor="brand.400"
              />
            </InputGroup>
            <Text fontSize="xs" color={textColorSecondary} mt={2} fontStyle="italic">
              Type score & press <strong>Enter</strong> to apply to all students.
            </Text>
          </FormControl>
        </Flex>
      </Card>

      <Card p={0} overflow="hidden" border="1px solid" borderColor={borderColor} boxShadow="sm">
        <Flex p={5} justify="space-between" align="center" bg={headerBg} borderBottom="1px solid" borderColor={borderColor}>
          <HStack spacing={2}>
            <Icon as={MdEdit} color="brand.500" />
            <Text fontWeight="700" color={textColor} fontSize="lg">Enter Scores</Text>
          </HStack>
          <Badge variant="subtle" colorScheme="brand" px={3} py={1} borderRadius="full">
            {students.length} Students List
          </Badge>
        </Flex>
        
        <Box overflowX="auto">
          <Table variant="simple" size="md">
            <Thead bg={useColorModeValue('gray.50', 'whiteAlpha.50')}>
              <Tr>
                <Th color="gray.500" py={4}>Student Info</Th>
                <Th color="gray.500" py={4}>Roll Number</Th>
                < Th color="gray.500" py={4} isNumeric>Obtained Marks</Th>
              </Tr>
            </Thead>
            <Tbody>
              {loadingStudents ? (
                <Tr><Td colSpan={3} py={20} textAlign="center">
                  <VStack spacing={4}>
                    <Spinner size="xl" color="brand.500" thickness="4px" />
                    <Text color={textColorSecondary} fontWeight="medium">Fetching student records...</Text>
                  </VStack>
                </Td></Tr>
              ) : students.length === 0 ? (
                <Tr><Td colSpan={3} py={20} textAlign="center">
                  <VStack spacing={3}>
                    <Icon as={MdError} w={10} h={10} color="gray.300" />
                    <Text color={textColorSecondary} fontSize="lg">No students found in this class/branch.</Text>
                  </VStack>
                </Td></Tr>
              ) : (
                students
                  .slice()
                  .sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')))
                  .map((st) => (
                    <Tr key={st.id} _hover={{ bg: rowHoverBg }} transition="all 0.2s">
                      <Td py={4}>
                        <HStack spacing={3}>
                          <Avatar size="sm" name={st.name} src={st.photo} />
                          <Box>
                            <Text fontWeight="700" color={textColor}>{st.name}</Text>
                            <Text fontSize="xs" color={textColorSecondary}>ID: {st.id}</Text>
                          </Box>
                        </HStack>
                      </Td>
                      <Td py={4}>
                        <Badge variant="outline" colorScheme="gray">{st.rollNumber || 'N/A'}</Badge>
                      </Td>
                      <Td py={4} isNumeric>
                        <Input
                          size="md"
                          variant="filled"
                          value={fmt(marksMap[st.id])}
                          onChange={(e) => {
                            const v = e.target.value.replace(/[^0-9.]/g, '');
                            setMarksMap((prev) => ({ ...prev, [st.id]: v }));
                          }}
                          placeholder="—"
                          textAlign="center"
                          maxW="100px"
                          fontWeight="600"
                          bg={useColorModeValue('gray.50', 'whiteAlpha.50')}
                          _focus={{ bg: useColorModeValue('white', 'whiteAlpha.200'), borderColor: 'brand.400' }}
                        />
                      </Td>
                    </Tr>
                  ))
              )}
            </Tbody>
          </Table>
        </Box>
        <Flex p={4} justify="flex-end" borderTop="1px solid" borderColor={borderColor}>
           <Button 
            leftIcon={<MdSave />} 
            colorScheme="brand" 
            onClick={handleSave} 
            isLoading={saving} 
            isDisabled={!canSubmit}
          >
            Submit All Results
          </Button>
        </Flex>
      </Card>
    </Box>
  );
}
