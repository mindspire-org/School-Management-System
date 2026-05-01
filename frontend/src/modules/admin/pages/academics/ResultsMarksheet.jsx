import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  HStack,
  Button,
  ButtonGroup,
  Select,
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Spinner,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { MdArrowBack, MdDownload, MdFileDownload, MdRefresh } from 'react-icons/md';
import { useLocation, useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import Card from 'components/card/Card';
import * as resultsApi from '../../../../services/api/results';
import * as examsApi from '../../../../services/api/exams';
import * as studentsApi from '../../../../services/api/students';
import * as gradingApi from '../../../../services/api/grading';
import * as classesApi from '../../../../services/api/classes';

const safeFilePart = (v) => String(v || '').replace(/[^a-z0-9\-_. ]/gi, '').trim().replace(/\s+/g, '_');

const computeGradeFallback = (percent) => {
  const p = Number(percent || 0);
  if (p >= 85) return 'A';
  if (p >= 70) return 'B';
  if (p >= 55) return 'C';
  if (p >= 33) return 'D';
  return 'F';
};

const computeGradeByBands = (bands, percent) => {
  const entries = Object.entries(bands || {})
    .map(([k, v]) => [k, Number(v) || 0])
    .sort((a, b) => b[1] - a[1]);
  for (const [g, min] of entries) {
    if (Number(percent) >= min) return String(g);
  }
  return 'F';
};

const fmt = (n) => (n === null || n === undefined || Number.isNaN(Number(n)) ? '' : String(n));

export default function ResultsMarksheet() {
  const navigate = useNavigate();
  const toast = useToast();
  const { search } = useLocation();

  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');

  const qs = useMemo(() => new URLSearchParams(search), [search]);
  const initialStudentId = qs.get('studentId') || '';
  const initialExamId = qs.get('examId') || '';

  const [classRows, setClassRows] = useState([]);
  const [selectedClassKey, setSelectedClassKey] = useState('');

  const selectedClass = useMemo(() => {
    if (!selectedClassKey) return null;
    const [className, section] = selectedClassKey.split('::');
    return { className, section };
  }, [selectedClassKey]);

  const [examId, setExamId] = useState(initialExamId);
  const [studentId, setStudentId] = useState(initialStudentId);

  const [studentQuery, setStudentQuery] = useState('');
  const [studentOptions, setStudentOptions] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const [studentsInClass, setStudentsInClass] = useState([]);
  const [loadingClassStudents, setLoadingClassStudents] = useState(false);

  const [student, setStudent] = useState(null);

  const [exams, setExams] = useState([]);
  const [loadingExams, setLoadingExams] = useState(false);

  const [gradingBands, setGradingBands] = useState(null);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
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
      }
    })();
    return () => {
      mounted = false;
    };
  }, [selectedClassKey]);

  const loadExams = useCallback(async () => {
    try {
      setLoadingExams(true);
      const res = await examsApi.list({
        pageSize: 200,
        className: selectedClass?.className,
        section: selectedClass?.section,
      });
      const items = Array.isArray(res?.items) ? res.items : Array.isArray(res) ? res : [];
      setExams(items);
    } catch (_) {
      setExams([]);
    } finally {
      setLoadingExams(false);
    }
  }, [selectedClass]);

  useEffect(() => {
    loadExams();
  }, [loadExams]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!selectedClass?.className || !selectedClass?.section) {
        setStudentsInClass([]);
        return;
      }
      setLoadingClassStudents(true);
      try {
        const res = await studentsApi.list({
          page: 1,
          pageSize: 200,
          class: selectedClass.className,
          section: selectedClass.section,
        });
        const list = Array.isArray(res?.rows) ? res.rows : Array.isArray(res) ? res : [];
        if (!mounted) return;
        setStudentsInClass(list);
      } catch (_) {
        if (!mounted) return;
        setStudentsInClass([]);
      } finally {
        if (!mounted) return;
        setLoadingClassStudents(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [selectedClass]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const def = await gradingApi.getDefault();
        const bands = def?.bands || (Array.isArray(def?.items) ? (def.items[0]?.bands || {}) : {});
        if (mounted && bands && Object.keys(bands).length) setGradingBands(bands);
      } catch (_) {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const loadStudentById = useCallback(async (id) => {
    if (!id) {
      setStudent(null);
      return;
    }
    try {
      const st = await studentsApi.getById(Number(id));
      setStudent(st && st.id ? st : null);
    } catch (_) {
      setStudent(null);
    }
  }, []);

  useEffect(() => {
    if (studentId) loadStudentById(studentId);
  }, [studentId, loadStudentById]);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      const q = studentQuery.trim();
      if (!q) {
        setStudentOptions([]);
        return;
      }
      setLoadingStudents(true);
      try {
        let results = [];
        if (/^\d+$/.test(q)) {
          try {
            const st = await studentsApi.getById(Number(q));
            if (st && st.id) results = [st];
          } catch (_) {}
        }
        if (!results.length) {
          const res = await studentsApi.list({
            q,
            pageSize: 10,
            class: selectedClass?.className,
            section: selectedClass?.section,
          });
          const items = Array.isArray(res?.rows) ? res.rows : (res?.items || res || []);
          results = items;
        }
        if (active) setStudentOptions(results);
      } catch (_) {
        if (active) setStudentOptions([]);
      } finally {
        if (active) setLoadingStudents(false);
      }
    }, 300);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [studentQuery]);

  const examTitle = useMemo(() => {
    const found = exams.find((x) => String(x.id) === String(examId));
    return found?.title || (examId ? `Exam ${examId}` : '');
  }, [exams, examId]);

  const fetchRows = useCallback(async () => {
    if (!examId || !studentId) {
      setRows([]);
      return;
    }
    try {
      setLoading(true);
      const res = await resultsApi.list({
        examId: Number(examId),
        studentId: Number(studentId),
        page: 1,
        pageSize: 200,
      });
      const items = Array.isArray(res?.items) ? res.items : Array.isArray(res) ? res : [];
      setRows(items);
    } catch (e) {
      setRows([]);
      toast({ title: 'Failed to load marksheet', description: e?.message || 'Request failed', status: 'error' });
    } finally {
      setLoading(false);
    }
  }, [examId, studentId, toast]);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  const summary = useMemo(() => {
    const subjects = rows.length;
    const totalScore = rows.reduce((a, r) => a + (Number(r.marks) || 0), 0);
    const totalPossible = subjects * 100;
    const percent = totalPossible ? (totalScore / totalPossible) * 100 : 0;
    const grade = gradingBands ? computeGradeByBands(gradingBands, percent) : computeGradeFallback(percent);
    const passCount = rows.filter((r) => (Number(r.marks) || 0) >= 33).length;
    return {
      subjects,
      totalScore,
      totalPossible,
      percent,
      grade,
      passCount,
    };
  }, [rows, gradingBands]);

  const exportCSV = () => {
    if (!rows.length) return;
    const header = ['Student', 'StudentId', 'Class', 'Section', 'Exam', 'Subject', 'Marks', 'Grade'];
    const data = rows.map((r) => [
      student?.name || r.studentName || '',
      studentId,
      student?.class || r.class || '',
      student?.section || r.section || '',
      examTitle,
      r.subject,
      r.marks,
      r.grade,
    ]);
    const csv = [header, ...data]
      .map((row) => row.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `marksheet_${safeFilePart(student?.name || studentId)}_${safeFilePart(examTitle)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    if (!rows.length) return;

    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 40;

    const now = new Date();

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('Student Marksheet / Result Card', margin, 54);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    const name = student?.name || rows[0]?.studentName || '';
    const cls = student?.class || rows[0]?.class || '';
    const sec = student?.section || rows[0]?.section || '';

    doc.text(`Student: ${name}`, margin, 76);
    doc.text(`Student ID: ${studentId}`, margin, 92);
    doc.text(`Class: ${cls}${sec ? '-' + sec : ''}`, margin, 108);
    doc.text(`Exam: ${examTitle}`, margin, 124);
    doc.text(`Generated: ${now.toLocaleString()}`, margin, 140);

    doc.setDrawColor(226, 232, 240);
    doc.line(margin, 152, pageWidth - margin, 152);

    const cols = [
      { label: 'Subject', w: 220 },
      { label: 'Marks', w: 70 },
      { label: 'Grade', w: 70 },
    ];

    let y = 176;

    const drawHeader = () => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      let x = margin;
      cols.forEach((c) => {
        doc.text(c.label, x, y);
        x += c.w;
      });
      doc.setFont('helvetica', 'normal');
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, y + 6, pageWidth - margin, y + 6);
      y += 20;
    };

    drawHeader();

    const sorted = rows.slice().sort((a, b) => String(a.subject || '').localeCompare(String(b.subject || '')));

    for (const r of sorted) {
      if (y > pageHeight - margin - 120) {
        doc.addPage();
        y = 56;
        drawHeader();
      }

      doc.setFontSize(9);
      doc.text(String(r.subject || ''), margin, y);
      doc.text(String(fmt(r.marks) || ''), margin + cols[0].w, y);
      doc.text(String((r.grade || '').toUpperCase()), margin + cols[0].w + cols[1].w, y);
      y += 16;
    }

    y += 10;
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y, pageWidth - margin, y);

    y += 18;
    doc.setFont('helvetica', 'bold');
    doc.text(`Subjects: ${summary.subjects}`, margin, y);
    doc.text(`Total: ${Math.round(summary.totalScore)}/${Math.round(summary.totalPossible)}`, margin + 140, y);
    doc.text(`%: ${Math.round(summary.percent)}`, margin + 300, y);
    doc.text(`Grade: ${String(summary.grade || '').toUpperCase()}`, margin + 360, y);

    doc.save(`marksheet_${safeFilePart(name || studentId)}_${safeFilePart(examTitle)}.pdf`);
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Flex mb={5} justifyContent="space-between" alignItems="center" gap={3} flexWrap="wrap">
        <HStack>
          <Button leftIcon={<MdArrowBack />} variant="outline" onClick={() => navigate(-1)}>Back</Button>
          <Box>
            <Heading as="h3" size="lg" mb={1} color={textColor}>Marksheet / Result Card</Heading>
            <Text color={textColorSecondary}>Generate student-wise marksheet for a selected exam</Text>
          </Box>
        </HStack>
        <ButtonGroup>
          <Button leftIcon={<MdRefresh />} variant="outline" onClick={fetchRows} isLoading={loading}>Refresh</Button>
          <Button leftIcon={<MdFileDownload />} variant="outline" onClick={exportCSV} isDisabled={!rows.length}>Export CSV</Button>
          <Button leftIcon={<MdDownload />} colorScheme="blue" onClick={exportPDF} isDisabled={!rows.length}>Export PDF</Button>
        </ButtonGroup>
      </Flex>

      <Card p={4} mb={5}>
        <Flex gap={3} direction={{ base: 'column', md: 'row' }} align={{ md: 'center' }}>
          <Select
            placeholder="Class"
            value={selectedClassKey}
            onChange={(e) => {
              setSelectedClassKey(e.target.value);
              setExamId('');
              setStudentId('');
              setStudentQuery('');
              setStudentOptions([]);
              setRows([]);
            }}
            maxW="260px"
            size="sm"
            isDisabled={!classRows.length}
          >
            {classRows.map((c) => (
              <option key={`${c.className}::${c.section}`} value={`${c.className}::${c.section}`}>
                {c.className}-{c.section}
              </option>
            ))}
          </Select>

          <Select placeholder="Exam" value={examId} onChange={(e) => setExamId(e.target.value)} maxW="260px" size="sm" isDisabled={loadingExams}>
            {exams.map((ex) => (
              <option key={ex.id} value={ex.id}>{ex.title || `Exam #${ex.id}`}</option>
            ))}
          </Select>

          <Select
            placeholder="Student"
            value={studentId}
            onChange={(e) => {
              setStudentId(e.target.value.replace(/[^0-9]/g, ''));
            }}
            maxW="320px"
            size="sm"
            isDisabled={loadingClassStudents || (!studentsInClass.length && !loadingClassStudents)}
          >
            {studentsInClass.map((st) => (
              <option key={st.id} value={st.id}>
                {st.name}{st.rollNumber ? ` (${st.rollNumber})` : ''}
              </option>
            ))}
          </Select>

          <Input
            placeholder="Student ID"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value.replace(/[^0-9]/g, ''))}
            maxW={{ base: '100%', md: '160px' }}
            size="sm"
          />

          <Box position="relative" w={{ base: '100%', md: '280px' }}>
            <Input
              placeholder="Search student by name / ID / roll"
              value={studentQuery}
              onChange={(e) => setStudentQuery(e.target.value)}
              size="sm"
            />
            {!!studentOptions.length && (
              <Box
                position="absolute"
                zIndex={10}
                bg={useColorModeValue('white', 'gray.700')}
                borderWidth="1px"
                borderColor={borderColor}
                borderRadius="8px"
                mt={1}
                w="100%"
                maxH="220px"
                overflowY="auto"
              >
                {studentOptions.map((st) => (
                  <Box
                    key={st.id}
                    px={3}
                    py={2}
                    _hover={{ bg: useColorModeValue('gray.50', 'whiteAlpha.200'), cursor: 'pointer' }}
                    onClick={() => {
                      setStudent(st);
                      setStudentId(String(st.id));
                      setStudentQuery(`${st.name} (${st.id})`);
                      setStudentOptions([]);
                    }}
                  >
                    <Text fontSize="sm" fontWeight="600">{st.name}</Text>
                    <Text fontSize="xs" color={textColorSecondary}>ID: {st.id} • {st.class}{st.section ? `-${st.section}` : ''} • Roll: {st.rollNumber || '-'}</Text>
                  </Box>
                ))}
                {loadingStudents ? (
                  <Box px={3} py={2}><Text fontSize="xs" color={textColorSecondary}>Searching...</Text></Box>
                ) : null}
              </Box>
            )}
          </Box>
        </Flex>

        {student ? (
          <Text mt={3} color={textColorSecondary}>Selected: {student.name} • Class {student.class}{student.section ? `-${student.section}` : ''}</Text>
        ) : null}
      </Card>

      <Card p={4} mb={5}>
        <HStack justify="space-between" flexWrap="wrap" rowGap={2}>
          <Text fontWeight="600">Summary</Text>
          {rows.length ? (
            <HStack spacing={2} flexWrap="wrap">
              <Badge colorScheme="blue">Subjects: {summary.subjects}</Badge>
              <Badge colorScheme="purple">Total: {Math.round(summary.totalScore)}/{Math.round(summary.totalPossible)}</Badge>
              <Badge colorScheme="green">%: {Math.round(summary.percent)}</Badge>
              <Badge colorScheme={String(summary.grade).toUpperCase() === 'A' ? 'green' : String(summary.grade).toUpperCase() === 'F' ? 'red' : 'purple'}>
                Grade: {String(summary.grade || '').toUpperCase()}
              </Badge>
            </HStack>
          ) : (
            <Text color={textColorSecondary}>Select exam & student to load marksheet</Text>
          )}
        </HStack>
      </Card>

      <Card p={0} overflow="hidden">
        <Heading size="sm" p={4} borderBottomWidth="1px" borderColor={borderColor}>Subjects</Heading>
        <Box overflowX="auto">
          <Table variant="simple" size="sm">
            <Thead bg={useColorModeValue('gray.50', 'gray.800')}>
              <Tr>
                <Th>Subject</Th>
                <Th isNumeric>Marks</Th>
                <Th>Grade</Th>
              </Tr>
            </Thead>
            <Tbody>
              {loading ? (
                <Tr>
                  <Td colSpan={3} textAlign="center" py={10}><Spinner /></Td>
                </Tr>
              ) : rows.length === 0 ? (
                <Tr>
                  <Td colSpan={3} textAlign="center" py={10} color={textColorSecondary}>No data</Td>
                </Tr>
              ) : (
                rows
                  .slice()
                  .sort((a, b) => String(a.subject || '').localeCompare(String(b.subject || '')))
                  .map((r) => (
                    <Tr key={r.id}>
                      <Td>{r.subject}</Td>
                      <Td isNumeric>{fmt(r.marks)}</Td>
                      <Td>
                        <Badge colorScheme={String(r.grade || '').toUpperCase() === 'A' ? 'green' : String(r.grade || '').toUpperCase() === 'F' ? 'red' : 'purple'}>
                          {String(r.grade || '-').toUpperCase()}
                        </Badge>
                      </Td>
                    </Tr>
                  ))
              )}
            </Tbody>
          </Table>
        </Box>
      </Card>
    </Box>
  );
}
