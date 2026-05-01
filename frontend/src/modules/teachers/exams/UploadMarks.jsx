import React, { useEffect, useMemo, useState } from 'react';
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
  Tooltip,
  Badge,
  useColorModeValue,
  Icon,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  NumberInput,
  NumberInputField,
  Spinner,
  useToast,
} from '@chakra-ui/react';
import { MdRefresh, MdFileDownload, MdVisibility, MdEdit, MdSearch, MdSave, MdPeople, MdTrendingUp, MdBook, MdPrint, MdAnalytics } from 'react-icons/md';
import Card from '../../../components/card/Card';
import MiniStatistics from '../../../components/card/MiniStatistics';
import IconBox from '../../../components/icons/IconBox';
import BarChart from '../../../components/charts/BarChart';
import PieChart from '../../../components/charts/PieChart';
import * as teachersApi from '../../../services/api/teachers';
import * as studentsApi from '../../../services/api/students';
import * as examsApi from '../../../services/api/exams';
import * as marksApi from '../../../services/api/marks';
import * as classesApi from '../../../services/api/classes';
import * as gradingApi from '../../../services/api/grading';

export default function UploadMarks() {
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const textColorSecondary = 'secondaryGray.600';
  const brandColor = useColorModeValue('brand.500', 'brand.400');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const headerBg = useColorModeValue('white', 'navy.800');
  const hoverBg = useColorModeValue('secondaryGray.300', 'whiteAlpha.100');
  const toast = useToast();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [row, setRow] = useState(null);

  const [selectedClassKey, setSelectedClassKey] = useState('');
  const selectedClass = useMemo(() => {
    if (!selectedClassKey) return null;
    const [className, section] = selectedClassKey.split('::');
    return { className, section };
  }, [selectedClassKey]);

  const [subject, setSubject] = useState('');
  const [q, setQ] = useState('');

  const [gradingBands, setGradingBands] = useState(null);
  const [assignmentRows, setAssignmentRows] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);

  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const [exams, setExams] = useState([]);
  const [examId, setExamId] = useState('');
  const [loadingExams, setLoadingExams] = useState(false);

  const [entries, setEntries] = useState([]);
  const [loadingEntries, setLoadingEntries] = useState(false);

  const [saving, setSaving] = useState(false);

  const [classSubjects, setClassSubjects] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const def = await gradingApi.getDefault();
        const bands = def?.bands || (Array.isArray(def?.items) ? (def.items[0]?.bands || {}) : {});
        if (mounted && bands && Object.keys(bands).length) setGradingBands(bands);
      } catch (_) {}
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingAssignments(true);
      try {
        const res = await teachersApi.listSubjectAssignments({});
        const rows = Array.isArray(res) ? res : Array.isArray(res?.rows) ? res.rows : [];
        if (!mounted) return;
        setAssignmentRows(rows);

        const classSet = new Set();
        rows.forEach((r) => {
          const classes = Array.isArray(r?.classes) ? r.classes : [];
          classes.forEach((c) => {
            if (typeof c !== 'string') return;
            const parsed = c.includes('::') ? c : (c.includes('-') ? c.replace('-', '::') : null);
            if (parsed && parsed.includes('::')) classSet.add(parsed);
          });
        });
        const classList = Array.from(classSet);
        // Do not auto-select the first class if it's already set or if it's empty
        if (!selectedClassKey && classList.length) {
           // setSelectedClassKey(classList[0]); // Disabled auto-select to avoid unexpected data loading
        }
      } catch (e) {
        if (!mounted) return;
        setAssignmentRows([]);
      } finally {
        if (mounted) setLoadingAssignments(false);
      }
    })();
    return () => { mounted = false; };
  }, []); // Only run once on mount or when relevant deps change, but NOT on selectedClassKey itself to avoid loops

  const classOptions = useMemo(() => {
    const set = new Set();
    assignmentRows.forEach((r) => {
      const classes = Array.isArray(r?.classes) ? r.classes : [];
      classes.forEach((c) => {
        if (typeof c !== 'string') return;
        if (c.includes('::')) set.add(c);
        else if (/^\d+[A-Za-z]+$/.test(c)) {
          const match = c.match(/^(\d+)([A-Za-z]+)$/);
          if (match) set.add(`${match[1]}::${match[2]}`);
        } else if (c.includes('-')) {
          const parts = c.split('-').map((p) => p.trim()).filter(Boolean);
          if (parts.length >= 2) set.add(`${parts[0]}::${parts.slice(1).join('-')}`);
        }
      });
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [assignmentRows]);

  const subjectOptions = useMemo(() => {
    if (!selectedClassKey) return [];
    const set = new Set();
    assignmentRows.forEach((r) => {
      const subj = String(r?.subjectName || '').trim();
      if (!subj) return;
      const classes = Array.isArray(r?.classes) ? r.classes : [];
      const ok = classes.some((c) => {
        if (typeof c !== 'string') return false;
        if (c === selectedClassKey) return true;
        if (/^\d+[A-Za-z]+$/.test(c)) {
          const match = c.match(/^(\d+)([A-Za-z]+)$/);
          return match ? `${match[1]}::${match[2]}` === selectedClassKey : false;
        }
        if (c.includes('-')) {
          const parts = c.split('-').map((p) => p.trim()).filter(Boolean);
          if (parts.length >= 2) return `${parts[0]}::${parts.slice(1).join('-')}` === selectedClassKey;
        }
        return false;
      });
      if (ok) set.add(subj);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [assignmentRows, selectedClassKey]);

  useEffect(() => {
    if (!subject && subjectOptions.length) setSubject(subjectOptions[0]);
    if (subject && subjectOptions.length && !subjectOptions.includes(subject)) setSubject(subjectOptions[0] || '');
  }, [subjectOptions, subject]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!selectedClass?.className || !selectedClass?.section) {
        setStudents([]);
        return;
      }
      setLoadingStudents(true);
      try {
        const res = await studentsApi.list({ page: 1, pageSize: 200, class: selectedClass.className, section: selectedClass.section });
        const list = Array.isArray(res?.rows) ? res.rows : Array.isArray(res) ? res : [];
        if (mounted) setStudents(list);
      } catch (_) {
        if (mounted) setStudents([]);
      } finally {
        if (mounted) setLoadingStudents(false);
      }
    })();
    return () => { mounted = false; };
  }, [selectedClass]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!selectedClass?.className || !selectedClass?.section) {
        setExams([]);
        setExamId('');
        return;
      }
      setLoadingExams(true);
      try {
        const res = await examsApi.list({ page: 1, pageSize: 200, className: selectedClass.className, section: selectedClass.section });
        const items = Array.isArray(res?.items) ? res.items : Array.isArray(res) ? res : [];
        if (!mounted) return;
        setExams(items);
        if (!examId && items.length) setExamId(String(items[0].id));
      } catch (_) {
        if (!mounted) return;
        setExams([]);
        setExamId('');
      } finally {
        if (mounted) setLoadingExams(false);
      }
    })();
    return () => { mounted = false; };
  }, [selectedClass, examId]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!selectedClass?.className || !selectedClass?.section) {
        setClassSubjects([]);
        return;
      }
      try {
        const res = await classesApi.listSubjectsByClass({ className: selectedClass.className, section: selectedClass.section });
        const items = Array.isArray(res?.items) ? res.items : Array.isArray(res) ? res : [];
        if (mounted) setClassSubjects(items);
      } catch (_) {
        if (mounted) setClassSubjects([]);
      }
    })();
    return () => { mounted = false; };
  }, [selectedClass]);

  const fullMarks = useMemo(() => {
    const found = (classSubjects || []).find((s) => String(s?.subjectName || '').trim().toLowerCase() === String(subject || '').trim().toLowerCase());
    const n = found?.fullMarks;
    const v = Number(n);
    return Number.isFinite(v) ? v : null;
  }, [classSubjects, subject]);

  const computeGradeByBands = (bands, percent) => {
    const entries = Object.entries(bands || {})
      .map(([k, v]) => [k, Number(v) || 0])
      .sort((a, b) => b[1] - a[1]);
    for (const [g, min] of entries) {
      if (Number(percent) >= min) return String(g);
    }
    return 'F';
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!examId || !selectedClass?.className || !selectedClass?.section || !subject) {
        setEntries([]);
        return;
      }
      setLoadingEntries(true);
      try {
        const res = await marksApi.entries({ examId: Number(examId), className: selectedClass.className, section: selectedClass.section, subject });
        const list = Array.isArray(res?.rows) ? res.rows : [];
        if (!mounted) return;
        const mapped = list.map((r) => {
          const marks = r.marks === undefined || r.marks === null || r.marks === '' ? null : Number(r.marks);
          return {
            studentId: r.studentId,
            name: r.studentName,
            roll: r.rollNumber,
            cls: r.className,
            section: r.section,
            marks: Number.isFinite(marks) ? marks : null,
            grade: r.grade || '',
          };
        });
        setEntries(mapped);
      } catch (e) {
        if (!mounted) return;
        setEntries([]);
        toast({ title: 'Failed to load marks', description: e?.message, status: 'error', duration: 4000 });
      } finally {
        if (mounted) setLoadingEntries(false);
      }
    })();
    return () => { mounted = false; };
  }, [examId, selectedClass, subject, toast]);

  const filtered = useMemo(() => entries.filter(r =>
    (!q || String(r.name || '').toLowerCase().includes(q.toLowerCase()) || String(r.roll || '').toLowerCase().includes(q.toLowerCase()))
  ), [entries, q]);

  const totals = useMemo(() => ({
    count: filtered.length,
    avg: filtered.length ? Math.round(filtered.reduce((a,r)=>a+r.marks,0)/filtered.length) : 0,
  }), [filtered]);

  const chartData = useMemo(() => ([{ name: 'Marks', data: filtered.slice(0,8).map(r=>Number(r.marks || 0)) }]), [filtered]);
  const chartOptions = useMemo(() => ({
    chart: { toolbar: { show: false } },
    xaxis: { categories: filtered.slice(0,8).map(r=> r.name.split(' ')[0]) },
    dataLabels: { enabled: false },
    colors: ['#3182CE'],
  }), [filtered]);

  const gradeBuckets = useMemo(() => {
    const buckets = { '≥85': 0, '70-84': 0, '<70': 0 };
    filtered.forEach(r => {
      if (r.marks >= 85) buckets['≥85'] += 1;
      else if (r.marks >= 70) buckets['70-84'] += 1;
      else buckets['<70'] += 1;
    });
    return { labels: Object.keys(buckets), values: Object.values(buckets) };
  }, [filtered]);

  const exportCSV = () => {
    const header = ['Student','Roll','Class','Section','Subject','Marks'];
    const data = filtered.map(r => [r.name, r.roll, r.cls, r.section, subject, r.marks ?? '']);
    const csv = [header, ...data].map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'upload_marks.csv'; a.click(); URL.revokeObjectURL(url);
  };

  const printPage = () => {
    if (!selectedClass?.className || !selectedClass?.section || !subject || !examId) {
      toast({ title: 'Select class, subject and exam first', status: 'warning', duration: 3000 });
      return;
    }

    const safe = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const examTitle = exams.find((e) => String(e.id) === String(examId))?.title || '';
    const title = `Marks Sheet - ${selectedClass.className}-${selectedClass.section} - ${subject}`;

    const html = `
      <html>
      <head>
        <meta charset="utf-8" />
        <title>${safe(title)}</title>
        <style>
          *{box-sizing:border-box;font-family:Inter,Arial,Helvetica,sans-serif}
          body{margin:0;padding:18px;color:#111827;background:#fff}
          .top{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:14px}
          .h1{font-size:18px;font-weight:900;margin:0 0 4px}
          .meta{font-size:12px;color:#374151;line-height:1.4}
          table{width:100%;border-collapse:collapse}
          thead th{font-size:12px;text-transform:uppercase;letter-spacing:.3px;text-align:left;color:#111827;background:#f3f4f6;border:1px solid #e5e7eb;padding:10px}
          tbody td{border:1px solid #e5e7eb;padding:9px;font-size:12.5px;vertical-align:top}
          .num{text-align:right;font-variant-numeric:tabular-nums}
          .muted{color:#6b7280}
          @page{size:A4;margin:12mm}
          @media print{body{padding:0} .top{margin-bottom:10px}}
        </style>
      </head>
      <body>
        <div class="top">
          <div>
            <div class="h1">${safe(title)}</div>
            <div class="meta">
              <div><span class="muted">Class:</span> ${safe(`${selectedClass.className}-${selectedClass.section}`)}</div>
              <div><span class="muted">Subject:</span> ${safe(subject)}</div>
              <div><span class="muted">Exam:</span> ${safe(examTitle || String(examId))}</div>
            </div>
          </div>
          <div class="meta" style="text-align:right">
            <div><span class="muted">Printed:</span> ${safe(new Date().toISOString().slice(0,10))}</div>
            <div><span class="muted">Students:</span> ${safe(filtered.length)}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width:44px">#</th>
              <th>Student</th>
              <th style="width:90px">Roll</th>
              <th style="width:100px">Class</th>
              <th style="width:110px" class="num">Marks</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map((r, idx) => `
              <tr>
                <td class="num">${safe(idx + 1)}</td>
                <td>${safe(r.name || '')}</td>
                <td>${safe(r.roll || '')}</td>
                <td>${safe(`${r.cls || ''}-${r.section || ''}`)}</td>
                <td class="num">${safe(r.marks ?? '')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.visibility = 'hidden';
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) {
      try { document.body.removeChild(iframe); } catch (_) {}
      toast({ title: 'Unable to print', status: 'error' });
      return;
    }

    doc.open();
    doc.write(html);
    doc.close();

    let printed = false;
    const doPrint = () => {
      if (printed) return;
      printed = true;
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } finally {
        setTimeout(() => {
          try { document.body.removeChild(iframe); } catch (_) {}
        }, 250);
      }
    };

    iframe.onload = () => { doPrint(); };
    setTimeout(() => { doPrint(); }, 500);
  };

  const handleSaveAll = async () => {
    if (!examId || !subject) {
      toast({ title: 'Missing Information', description: 'Please select an exam and subject first.', status: 'warning', duration: 3000 });
      return;
    }
    setSaving(true);
    try {
      const items = filtered.map((r) => {
        const marks = r.marks === '' || r.marks === undefined ? null : (r.marks === null ? null : Number(r.marks));
        let grade = r.grade || null;
        if (!grade && marks != null && Number.isFinite(marks) && fullMarks && gradingBands) {
          const pct = (marks / fullMarks) * 100;
          grade = computeGradeByBands(gradingBands, pct);
        }
        return { studentId: Number(r.studentId), subject, marks: marks == null ? null : Number(marks), grade };
      });

      const res = await marksApi.bulkUpsert({ examId: Number(examId), items });
      const rejected = Array.isArray(res?.rejected) ? res.rejected : [];
      if (rejected.length) {
        toast({ title: 'Partial Success', description: `${items.length - rejected.length} saved, ${rejected.length} rejected.`, status: 'warning', duration: 5000 });
      } else {
        toast({ title: 'Success', description: 'All marks saved successfully.', status: 'success', duration: 2500 });
      }
    } catch (e) {
      toast({ title: 'Save failed', description: e?.message || 'An error occurred while saving marks.', status: 'error', duration: 4000 });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }} px='20px'>
      <Flex direction='column' mb='25px'>
        <Text color={textColor} fontSize='32px' fontWeight='800' letterSpacing='-1px'>
          Upload Marks
        </Text>
        <Text color={textColorSecondary} fontSize='md' fontWeight='500'>
          Enter and update student marks for examinations.
        </Text>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing='20px' mb='20px'>
        <MiniStatistics
          startContent={<IconBox w='56px' h='56px' bg='brand.100' icon={<Icon as={MdPeople} color='brand.500' w='32px' h='32px' />} />}
          name='Total Students'
          value={String(totals.count)}
        />
        <MiniStatistics
          startContent={<IconBox w='56px' h='56px' bg='green.100' icon={<Icon as={MdTrendingUp} color='green.500' w='32px' h='32px' />} />}
          name='Class Average'
          value={`${totals.avg}%`}
        />
        <MiniStatistics
          startContent={<IconBox w='56px' h='56px' bg='purple.100' icon={<Icon as={MdBook} color='purple.500' w='32px' h='32px' />} />}
          name='Active Subject'
          value={subject || 'Select Subject'}
        />
      </SimpleGrid>

      <Card p='20px' mb='20px' borderRadius='20px' boxShadow='0px 4px 12px rgba(0, 0, 0, 0.05)'>
        <Flex direction={{ base: 'column', lg: 'row' }} gap='15px' justify='space-between' align={{ base: 'stretch', lg: 'center' }}>
          <HStack spacing='15px' flexWrap='wrap'>
            <Select
              variant='main'
              placeholder={loadingAssignments ? 'Loading classes...' : 'Class'}
              value={selectedClassKey}
              onChange={(e) => setSelectedClassKey(e.target.value)}
              minW='160px'
              isDisabled={loadingAssignments}
              borderRadius='12px'
            >
              {classOptions.map((c) => {
                const [cn, sec] = c.split('::');
                return <option key={c} value={c}>{cn}-{sec}</option>;
              })}
            </Select>
            <Select
              variant='main'
              placeholder='Subject'
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              minW='180px'
              isDisabled={!selectedClassKey}
              borderRadius='12px'
            >
              {subjectOptions.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
            <Select
              variant='main'
              placeholder={loadingExams ? 'Loading exams...' : 'Exam'}
              value={examId}
              onChange={(e) => setExamId(e.target.value)}
              minW='180px'
              isDisabled={loadingExams || !selectedClassKey}
              borderRadius='12px'
            >
              {exams.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
            </Select>
            <HStack bg={useColorModeValue('secondaryGray.300', 'whiteAlpha.50')} borderRadius='12px' px='12px' py='2px'>
              <Icon as={MdSearch} color='gray.400' />
              <Input
                variant='unstyled'
                placeholder='Search student...'
                value={q}
                onChange={e=>setQ(e.target.value)}
                fontSize='sm'
                py='8px'
              />
            </HStack>
          </HStack>

          <HStack spacing='10px' flexWrap='wrap'>
            <IconButton
              variant='action'
              aria-label='Reset'
              icon={<MdRefresh />}
              onClick={()=>{setSelectedClassKey('');setSubject('');setExamId('');setQ('');setEntries([]);}}
              borderRadius='12px'
            />
            <Button
              variant='setup'
              leftIcon={<MdFileDownload />}
              onClick={exportCSV}
              borderRadius='12px'
              fontSize='sm'
              fontWeight='700'
            >
              Export CSV
            </Button>
            <Button
              variant='action'
              leftIcon={<MdPrint />}
              onClick={printPage}
              borderRadius='12px'
              fontSize='sm'
              fontWeight='700'
            >
              Print
            </Button>
            <Button
              variant='brand'
              leftIcon={<MdSave />}
              onClick={handleSaveAll}
              isLoading={saving}
              loadingText='Saving'
              borderRadius='12px'
              fontSize='sm'
              fontWeight='700'
              px='25px'
            >
              Save All
            </Button>
          </HStack>
        </Flex>
      </Card>

      <Card p='0px' mb='20px' borderRadius='20px' overflow='hidden' boxShadow='0px 4px 12px rgba(0, 0, 0, 0.05)'>
        <Box overflowX='auto'>
          <Table variant='simple' color='gray.500' mb='24px'>
            <Thead bg={useColorModeValue('secondaryGray.300', 'whiteAlpha.50')}>
              <Tr>
                <Th color='gray.400' fontSize='12px' fontWeight='700' letterSpacing='1px'>STUDENT</Th>
                <Th color='gray.400' fontSize='12px' fontWeight='700' letterSpacing='1px'>ROLL</Th>
                <Th color='gray.400' fontSize='12px' fontWeight='700' letterSpacing='1px'>CLASS</Th>
                <Th color='gray.400' fontSize='12px' fontWeight='700' letterSpacing='1px' textAlign='center'>MARKS</Th>
                <Th color='gray.400' fontSize='12px' fontWeight='700' letterSpacing='1px' textAlign='right'>ACTIONS</Th>
              </Tr>
            </Thead>
            <Tbody>
              {loadingEntries ? (
                <Tr>
                  <Td colSpan={5}>
                    <Flex align='center' justify='center' py='40px'>
                      <Spinner thickness='4px' speed='0.65s' emptyColor='gray.200' color='brand.500' size='xl' />
                    </Flex>
                  </Td>
                </Tr>
              ) : filtered.length === 0 ? (
                <Tr>
                  <Td colSpan={5}>
                    <Flex align='center' justify='center' py='40px' direction='column'>
                      <Icon as={MdAnalytics} w='40px' h='40px' color='gray.300' mb='10px' />
                      <Text color='gray.400' fontWeight='600'>No student data found for the selected criteria.</Text>
                    </Flex>
                  </Td>
                </Tr>
              ) : (
                filtered.map(r => (
                  <Tr key={r.studentId} _hover={{ bg: hoverBg }} transition='0.2s'>
                    <Td>
                      <Text color={textColor} fontSize='sm' fontWeight='700'>{r.name}</Text>
                    </Td>
                    <Td>
                      <Text color='secondaryGray.600' fontSize='sm' fontWeight='600'>{r.roll}</Text>
                    </Td>
                    <Td>
                      <Badge variant='subtle' colorScheme='blue' borderRadius='6px' px='8px'>
                        {r.cls}-{r.section}
                      </Badge>
                    </Td>
                    <Td>
                      <Flex justify='center'>
                        <NumberInput
                          variant='main'
                          size='sm'
                          maxW='100px'
                          value={r.marks ?? ''}
                          min={0}
                          max={fullMarks ?? 999}
                          onChange={(val) => {
                            const next = val === '' ? null : Number(val);
                            setEntries((prev) => prev.map((x) => x.studentId === r.studentId ? ({ ...x, marks: Number.isFinite(next) ? next : null }) : x));
                          }}
                        >
                          <NumberInputField borderRadius='8px' textAlign='center' fontWeight='700' />
                        </NumberInput>
                      </Flex>
                    </Td>
                    <Td>
                      <HStack justify='flex-end' spacing='5px'>
                        <IconButton
                          variant='action'
                          aria-label='View'
                          icon={<MdVisibility />}
                          size='sm'
                          onClick={()=>{setRow(r); onOpen();}}
                        />
                        <IconButton
                          variant='action'
                          aria-label='Edit'
                          icon={<MdEdit />}
                          size='sm'
                          onClick={()=>{setRow(r); onOpen();}}
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

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing='20px'>
        <Card p='20px' borderRadius='20px'>
          <Text color={textColor} fontSize='lg' fontWeight='700' mb='20px'>
            Marks Distribution (Top 8)
          </Text>
          <Box h='240px' w='100%'>
            <BarChart chartData={chartData} chartOptions={chartOptions} />
          </Box>
        </Card>
        <Card p='20px' borderRadius='20px'>
          <Text color={textColor} fontSize='lg' fontWeight='700' mb='20px'>
            Grade Summary
          </Text>
          <Box h='240px' w='100%'>
            <PieChart chartData={gradeBuckets.values} chartOptions={{
              labels: gradeBuckets.labels,
              colors: ['#01B574', '#4318FF', '#FFB547'],
              legend: { position: 'bottom', labels: { colors: textColor } }
            }} />
          </Box>
        </Card>
      </SimpleGrid>

      <Modal isOpen={isOpen} onClose={onClose} size='md' isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Marks</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {row && (
              <VStack align='start' spacing={3} fontSize='sm'>
                <HStack><Text fontWeight='600'>Student:</Text><Text>{row.name} ({row.roll})</Text></HStack>
                <HStack><Text fontWeight='600'>Class:</Text><Text>{row.cls}-{row.section}</Text></HStack>
                <HStack>
                  <Text fontWeight='600'>Marks:</Text>
                  <NumberInput
                    size='sm'
                    maxW='120px'
                    value={row.marks ?? ''}
                    min={0}
                    max={fullMarks ?? 999}
                    onChange={(val) => {
                      const next = val === '' ? null : Number(val);
                      setEntries((prev) => prev.map((x) => x.studentId === row.studentId ? ({ ...x, marks: Number.isFinite(next) ? next : null }) : x));
                      setRow((prev) => prev ? ({ ...prev, marks: Number.isFinite(next) ? next : null }) : prev);
                    }}
                  >
                    <NumberInputField />
                  </NumberInput>
                </HStack>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={onClose}>Close</Button>
            <Button colorScheme='blue' leftIcon={<MdSave/>} onClick={onClose}>Done</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
