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
  IconButton,
} from '@chakra-ui/react';
import { MdArrowBack, MdDownload, MdFileDownload, MdRefresh, MdPictureAsPdf } from 'react-icons/md';
import { useLocation, useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import Card from 'components/card/Card';
import useClassOptions from '../../../../hooks/useClassOptions';
import * as resultsApi from '../../../../services/api/results';
import * as examsApi from '../../../../services/api/exams';
import * as gradingApi from '../../../../services/api/grading';

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

export default function ResultsMeritList() {
  const navigate = useNavigate();
  const toast = useToast();
  const { search } = useLocation();

  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');

  const qs = useMemo(() => new URLSearchParams(search), [search]);
  const initialClass = qs.get('class') || '';
  const initialSection = qs.get('section') || '';
  const initialExamId = qs.get('examId') || '';

  const { classOptions, sectionsByClass } = useClassOptions();

  const [cls, setCls] = useState(initialClass);
  const [section, setSection] = useState(initialSection);
  const [examId, setExamId] = useState(initialExamId);
  const [q, setQ] = useState('');

  const [exams, setExams] = useState([]);
  const [loadingExams, setLoadingExams] = useState(false);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const [gradingBands, setGradingBands] = useState(null);

  const loadExams = useCallback(async () => {
    try {
      setLoadingExams(true);
      const res = await examsApi.list({ pageSize: 200 });
      const items = Array.isArray(res?.items) ? res.items : Array.isArray(res) ? res : [];
      setExams(items);
    } catch (_) {
      setExams([]);
    } finally {
      setLoadingExams(false);
    }
  }, []);

  useEffect(() => {
    loadExams();
  }, [loadExams]);

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

  const fetchRows = useCallback(async () => {
    if (!examId) {
      setRows([]);
      return;
    }
    try {
      setLoading(true);
      const out = [];
      let page = 1;
      const pageSize = 200;
      for (;;) {
        const res = await resultsApi.list({
          examId: Number(examId),
          className: cls || undefined,
          section: section || undefined,
          page,
          pageSize,
        });
        const items = Array.isArray(res?.items) ? res.items : Array.isArray(res) ? res : [];
        out.push(...items);
        if (items.length < pageSize) break;
        page += 1;
        if (page > 50) break;
      }
      setRows(out);
    } catch (e) {
      setRows([]);
      toast({ title: 'Failed to load results', description: e?.message || 'Request failed', status: 'error' });
    } finally {
      setLoading(false);
    }
  }, [examId, cls, section, toast]);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  const examTitle = useMemo(() => {
    const found = exams.find((x) => String(x.id) === String(examId));
    return found?.title || (examId ? `Exam ${examId}` : '');
  }, [exams, examId]);

  const aggregated = useMemo(() => {
    const map = new Map();
    for (const r of rows) {
      const sid = r?.studentId;
      if (!sid) continue;
      const existing = map.get(String(sid)) || {
        studentId: sid,
        studentName: r?.studentName || '',
        class: r?.class || '',
        section: r?.section || '',
        subjects: 0,
        totalMarks: 0,
      };
      existing.subjects += 1;
      existing.totalMarks += Number(r?.marks) || 0;
      if (!existing.studentName && r?.studentName) existing.studentName = r.studentName;
      map.set(String(sid), existing);
    }
    const list = Array.from(map.values()).map((x) => {
      const percent = x.subjects ? x.totalMarks / x.subjects : 0;
      const grade = gradingBands ? computeGradeByBands(gradingBands, percent) : computeGradeFallback(percent);
      return {
        ...x,
        percent,
        grade,
      };
    });
    list.sort((a, b) => {
      if (b.percent !== a.percent) return b.percent - a.percent;
      if (b.totalMarks !== a.totalMarks) return b.totalMarks - a.totalMarks;
      return String(a.studentName || '').localeCompare(String(b.studentName || ''));
    });
    return list.map((x, idx) => ({ ...x, rank: idx + 1 }));
  }, [rows, gradingBands]);

  const visible = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return aggregated;
    return aggregated.filter((r) => {
      const name = String(r.studentName || '').toLowerCase();
      const sid = r.studentId != null ? String(r.studentId) : '';
      return name.includes(s) || sid.includes(s);
    });
  }, [aggregated, q]);

  const exportCSV = () => {
    const header = ['Rank', 'Student ID', 'Student', 'Class', 'Section', 'Subjects', 'Total Marks', 'Percentage', 'Grade', 'Exam'];
    const lines = [
      header,
      ...visible.map((r) => [
        r.rank,
        r.studentId,
        r.studentName,
        r.class,
        r.section,
        r.subjects,
        Math.round(r.totalMarks),
        Math.round(r.percent),
        r.grade,
        examTitle,
      ]),
    ]
      .map((row) => row.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([lines], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `merit_list_${safeFilePart(examTitle)}_${safeFilePart(cls || 'all')}${section ? '_' + safeFilePart(section) : ''}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 40;

    const now = new Date();
    const subtitle = `Exam: ${examTitle}   |   Class: ${cls || 'All'}${section ? '-' + section : ''}`;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Result Sheet / Merit List', margin, 52);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(subtitle, margin, 70);
    doc.text(`Generated: ${now.toLocaleString()}`, margin, 86);
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, 98, pageWidth - margin, 98);

    const cols = [
      { label: 'Rank', w: 40 },
      { label: 'ID', w: 48 },
      { label: 'Student', w: 170 },
      { label: 'Subjects', w: 56 },
      { label: 'Total', w: 52 },
      { label: '%', w: 40 },
      { label: 'Grade', w: 50 },
    ];

    let y = 122;

    const drawHeader = () => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      let x = margin;
      cols.forEach((c) => {
        doc.text(c.label, x, y);
        x += c.w;
      });
      doc.setFont('helvetica', 'normal');
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, y + 6, pageWidth - margin, y + 6);
      y += 18;
    };

    drawHeader();

    for (const r of visible) {
      if (y > pageHeight - margin) {
        doc.addPage();
        y = 56;
        drawHeader();
      }

      const cells = [
        String(r.rank),
        String(r.studentId),
        String(r.studentName || '').slice(0, 28),
        String(r.subjects || 0),
        String(Math.round(r.totalMarks)),
        String(Math.round(r.percent)),
        String(r.grade || ''),
      ];

      doc.setFontSize(8);
      let x = margin;
      cells.forEach((val, idx) => {
        doc.text(String(val || ''), x, y);
        x += cols[idx].w;
      });
      y += 16;
    }

    doc.save(`merit_list_${safeFilePart(examTitle)}_${safeFilePart(cls || 'all')}${section ? '_' + safeFilePart(section) : ''}.pdf`);
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Flex mb={5} justifyContent="space-between" alignItems="center" gap={3} flexWrap="wrap">
        <HStack>
          <Button leftIcon={<MdArrowBack />} variant="outline" onClick={() => navigate(-1)}>Back</Button>
          <Box>
            <Heading as="h3" size="lg" mb={1} color={textColor}>Merit List / Result Sheet</Heading>
            <Text color={textColorSecondary}>Generate class-wise result list with totals and ranking</Text>
          </Box>
        </HStack>
        <ButtonGroup>
          <Button leftIcon={<MdRefresh />} variant="outline" onClick={fetchRows} isLoading={loading}>Refresh</Button>
          <Button leftIcon={<MdFileDownload />} variant="outline" onClick={exportCSV} isDisabled={!visible.length}>Export CSV</Button>
          <Button leftIcon={<MdDownload />} colorScheme="blue" onClick={exportPDF} isDisabled={!visible.length}>Export PDF</Button>
        </ButtonGroup>
      </Flex>

      <Card p={4} mb={5}>
        <Flex gap={3} direction={{ base: 'column', md: 'row' }} align={{ md: 'center' }}>
          <Select placeholder="Exam" value={examId} onChange={(e) => setExamId(e.target.value)} maxW="260px" size="sm" isLoading={loadingExams}>
            {exams.map((ex) => (
              <option key={ex.id} value={ex.id}>{ex.title || `Exam #${ex.id}`}</option>
            ))}
          </Select>
          <Select placeholder="Class" value={cls} onChange={(e) => { setCls(e.target.value); setSection(''); }} maxW="180px" size="sm">
            {classOptions.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
          <Select placeholder="Section" value={section} onChange={(e) => setSection(e.target.value)} maxW="160px" size="sm" isDisabled={!cls}>
            {(sectionsByClass[cls] || []).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
          <Input placeholder="Search student name / ID" value={q} onChange={(e) => setQ(e.target.value)} maxW={{ base: '100%', md: '260px' }} size="sm" />
        </Flex>
        {!examId ? (
          <Text mt={3} color={textColorSecondary}>Select an exam to generate the merit list.</Text>
        ) : null}
      </Card>

      <Card p={0} overflow="hidden">
        <Heading size="sm" p={4} borderBottomWidth="1px" borderColor={borderColor}>Merit List</Heading>
        <Box overflowX="auto">
          <Table variant="simple" size="sm">
            <Thead bg={useColorModeValue('gray.50', 'gray.800')}>
              <Tr>
                <Th>Rank</Th>
                <Th>Student</Th>
                <Th>Student ID</Th>
                <Th>Class</Th>
                <Th isNumeric>Subjects</Th>
                <Th isNumeric>Total</Th>
                <Th isNumeric>%</Th>
                <Th>Grade</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {loading ? (
                <Tr>
                  <Td colSpan={9} textAlign="center" py={10}><Spinner /></Td>
                </Tr>
              ) : visible.length === 0 ? (
                <Tr>
                  <Td colSpan={9} textAlign="center" py={10} color={textColorSecondary}>No data</Td>
                </Tr>
              ) : (
                visible.map((r) => (
                  <Tr key={r.studentId}>
                    <Td>{r.rank}</Td>
                    <Td>{r.studentName}</Td>
                    <Td>{r.studentId}</Td>
                    <Td>{r.class}{r.section ? `-${r.section}` : ''}</Td>
                    <Td isNumeric>{r.subjects}</Td>
                    <Td isNumeric>{Math.round(r.totalMarks)}</Td>
                    <Td isNumeric>{Math.round(r.percent)}</Td>
                    <Td>
                      <Badge colorScheme={String(r.grade).toUpperCase() === 'A' ? 'green' : String(r.grade).toUpperCase() === 'F' ? 'red' : 'purple'}>
                        {String(r.grade || '').toUpperCase()}
                      </Badge>
                    </Td>
                    <Td>
                      <HStack spacing={1}>
                        <IconButton
                          aria-label="Marksheet"
                          icon={<MdPictureAsPdf />}
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            const params = new URLSearchParams();
                            if (examId) params.set('examId', String(examId));
                            params.set('studentId', String(r.studentId));
                            navigate(`/admin/academics/results/marksheet?${params.toString()}`);
                          }}
                        />
                      </HStack>
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
