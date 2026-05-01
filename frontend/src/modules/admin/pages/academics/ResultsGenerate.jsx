import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Heading,
  Text,
  HStack,
  VStack,
  Button,
  ButtonGroup,
  Icon,
  Input,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Flex,
  useToast,
  useColorModeValue,
  Badge,
  Tooltip,
  Divider,
} from '@chakra-ui/react';
import { MdArrowBack, MdCloudUpload, MdFileDownload, MdRefresh } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import Card from 'components/card/Card';
import useClassOptions from '../../../../hooks/useClassOptions';
import * as examsApi from '../../../../services/api/exams';
import * as resultsApi from '../../../../services/api/results';
import * as studentsApi from '../../../../services/api/students';
import * as teachersApi from '../../../../services/api/teachers';
import * as classesApi from '../../../../services/api/classes';
import * as gradingApi from '../../../../services/api/grading';

function parseCSV(text) {
  const rows = [];
  let i = 0, field = '', row = [], inQuotes = false;
  while (i < text.length) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else { inQuotes = false; }
      } else {
        field += char;
      }
    } else {
      if (char === '"') { inQuotes = true; }
      else if (char === ',') { row.push(field); field = ''; }
      else if (char === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
      else if (char === '\r') { /* ignore */ }
      else { field += char; }
    }
    i++;
  }
  if (field.length > 0 || row.length) { row.push(field); rows.push(row); }
  return rows;
}

export default function ResultsGenerate() {
  const navigate = useNavigate();
  const toast = useToast();
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.300');

  const { classOptions, sectionsByClass } = useClassOptions();
  const [mode, setMode] = useState('classCsv'); // classCsv | studentCsv | studentManual
  const [cls, setCls] = useState('');
  const [section, setSection] = useState('');
  const [examId, setExamId] = useState('');
  const [subject, setSubject] = useState('');
  const [singleStudentId, setSingleStudentId] = useState('');
  const [studentQuery, setStudentQuery] = useState('');
  const [studentOptions, setStudentOptions] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentSubjects, setStudentSubjects] = useState([]);
  const [manualRows, setManualRows] = useState([]); // {subject, marks, grade}
  const [gradingBands, setGradingBands] = useState(null);

  const [exams, setExams] = useState([]);
  const [loadingExams, setLoadingExams] = useState(false);

  const [fileName, setFileName] = useState('');
  const [dataRows, setDataRows] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [uploading, setUploading] = useState(false);

  const fileRef = useRef(null);

  const requiredHeaders = useMemo(() => (
    mode === 'studentCsv' ? ['examId','subject','marks','grade'] : ['examId','studentId','subject','marks','grade']
  ), [mode]);

  const loadExams = useCallback(async () => {
    try {
      setLoadingExams(true);
      const res = await examsApi.list({ pageSize: 200 });
      const items = Array.isArray(res?.items) ? res.items : Array.isArray(res) ? res : [];
      setExams(items);
    } catch (e) { console.error(e); }
    finally { setLoadingExams(false); }
  }, []);

  useEffect(() => { loadExams(); }, [loadExams]);

  const onPickFile = () => fileRef.current?.click();

  // Search students by name / roll / id
  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      const q = studentQuery.trim();
      if (!q) { setStudentOptions([]); return; }
      setLoadingStudents(true);
      try {
        let results = [];
        if (/^\d+$/.test(q)) {
          // try by ID first
          try {
            const st = await studentsApi.getById(Number(q));
            if (st && st.id) results = [st];
          } catch (_) {}
        }
        if (!results.length) {
          const res = await studentsApi.list({ q, pageSize: 10 });
          const items = Array.isArray(res?.rows) ? res.rows : (res?.items || res || []);
          results = items;
        }
        if (active) setStudentOptions(results);
      } catch (e) { if (active) setStudentOptions([]); }
      finally { if (active) setLoadingStudents(false); }
    }, 300);
    return () => { active = false; clearTimeout(timer); };
  }, [studentQuery]);

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
    return () => { mounted = false; };
  }, []);

  const computeGradeLocal = useCallback((bands, percent) => {
    const entries = Object.entries(bands || {}).map(([k, v]) => [k, Number(v) || 0]).sort((a, b) => b[1] - a[1]);
    for (const [g, min] of entries) { if (percent >= min) return g; }
    return 'F';
  }, []);

  const selectStudent = useCallback(async (s) => {
    setSelectedStudent(s);
    setSingleStudentId(String(s.id));
    if (s.class) setCls(s.class);
    if (s.section) setSection(s.section);
    try {
      const resp = await classesApi.listSubjectsByClass({ className: s.class, section: s.section });
      const items = Array.isArray(resp?.items) ? resp.items : Array.isArray(resp) ? resp : [];
      const subjectNames = items.map(x => x.subjectName);
      setStudentSubjects(subjectNames);
      setManualRows(items.map(x => ({ subject: x.subjectName, fullMarks: x.fullMarks ?? '', gradeScheme: x.gradeScheme || '', marks: '', grade: '' })));
    } catch (e) {
      setStudentSubjects([]);
      setManualRows([]);
    }
  }, []);

  const onFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    if (ext !== 'csv') {
      toast({ title: 'Please upload CSV file', description: 'Excel files are supported by saving as CSV format.', status: 'warning' });
      return;
    }
    setFileName(file.name);
    const text = await file.text();
    const matrix = parseCSV(text).filter(r => r.length && r.some(c => String(c).trim() !== ''));
    if (!matrix.length) { setHeaders([]); setDataRows([]); return; }
    const hdrs = matrix[0].map(h => String(h).trim());
    const rows = matrix.slice(1).map(cols => Object.fromEntries(hdrs.map((h, idx) => [h, cols[idx] !== undefined ? String(cols[idx]).trim() : ''])));
    setHeaders(hdrs);
    setDataRows(rows);
  };

  const valid = useMemo(() => requiredHeaders.every(h => headers.includes(h)) && dataRows.length > 0, [headers, dataRows, requiredHeaders]);

  const sampleCSV = useMemo(() => {
    return 'examId,studentId,subject,marks,grade\n101,2001,Mathematics,85,A\n101,2002,Mathematics,67,B\n';
  }, []);

  const downloadTemplate = () => {
    const blob = new Blob([sampleCSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'results_template.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const onUpload = async () => {
    if (!valid) { toast({ title: 'CSV not valid', description: 'Make sure headers match the template.', status: 'error' }); return; }
    const items = dataRows.map(r => ({
      examId: Number(r.examId || examId) || undefined,
      studentId: r.studentId ? Number(r.studentId) : (singleStudentId ? Number(singleStudentId) : undefined),
      subject: r.subject || subject || undefined,
      marks: r.marks === '' ? null : Number(r.marks),
      grade: r.grade || null,
    })).filter(x => x.examId && x.studentId && x.subject);
    if (!items.length) { toast({ title: 'No valid rows', status: 'warning' }); return; }
    try {
      setUploading(true);
      await resultsApi.bulkCreate(items);
      toast({ title: `Uploaded ${items.length} result(s)`, status: 'success' });
      setDataRows([]); setHeaders([]); setFileName('');
      // Optionally navigate back
      navigate('/admin/academics/results');
    } catch (e) {
      console.error(e);
      toast({ title: 'Upload failed', status: 'error' });
    } finally { setUploading(false); }
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Flex mb={5} justifyContent="space-between" alignItems="center">
        <HStack>
          <Button leftIcon={<Icon as={MdArrowBack} />} onClick={()=> navigate(-1)} variant='outline'>Back</Button>
          <Box>
            <Heading as='h3' size='lg' mb={1} color={textColor}>Generate Results</Heading>
            <Text color={textColorSecondary}>Upload CSV for class or student, or generate manually for a specific student</Text>
          </Box>
        </HStack>
        <ButtonGroup>
          <Button leftIcon={<Icon as={MdFileDownload} />} variant='outline' colorScheme='blue' onClick={downloadTemplate}>Download Template</Button>
          <Button leftIcon={<Icon as={MdRefresh} />} variant='outline' onClick={()=>{ setCls(''); setSection(''); setExamId(''); setSubject(''); setDataRows([]); setHeaders([]); setFileName(''); }}>Reset</Button>
        </ButtonGroup>
      </Flex>

      <Card p={4} mb={5}>
        <HStack spacing={3} flexWrap='wrap' rowGap={3}>
          <HStack spacing={1}>
            <Button size='sm' variant={mode==='classCsv'?'solid':'outline'} colorScheme='blue' onClick={()=> setMode('classCsv')}>Class CSV</Button>
            <Button size='sm' variant={mode==='studentCsv'?'solid':'outline'} colorScheme='blue' onClick={()=> setMode('studentCsv')}>Student CSV</Button>
            <Button size='sm' variant={mode==='studentManual'?'solid':'outline'} colorScheme='blue' onClick={()=> setMode('studentManual')}>Student Manual</Button>
          </HStack>
          <Select placeholder='Class' value={cls} onChange={(e)=>{ setCls(e.target.value); setSection(''); }} w='160px' size='sm'>
            {classOptions.map(c => <option key={c} value={c}>{c}</option>)}
          </Select>
          <Select placeholder='Section' value={section} onChange={(e)=> setSection(e.target.value)} w='140px' size='sm' isDisabled={!cls}>
            {(sectionsByClass[cls] || []).map(s => <option key={s} value={s}>{s}</option>)}
          </Select>
          <Select placeholder='Exam' value={examId} onChange={(e)=> setExamId(e.target.value)} w='220px' size='sm' isLoading={loadingExams}>
            {exams.map(ex => <option key={ex.id} value={ex.id}>{ex.title || `Exam #${ex.id}`}</option>)}
          </Select>
          <Input placeholder='Subject (optional)' value={subject} onChange={(e)=> setSubject(e.target.value)} w='220px' size='sm' />
          {(mode!=='classCsv') && (
            <>
              <Input placeholder='Student ID (optional)' value={singleStudentId} onChange={(e)=> setSingleStudentId(e.target.value.replace(/[^0-9]/g,''))} w='160px' size='sm' />
              <Box position='relative'>
                <Input placeholder='Search student by name / ID / roll'
                       value={studentQuery}
                       onChange={(e)=> setStudentQuery(e.target.value)}
                       w='260px' size='sm' />
                {!!studentOptions.length && (
                  <Box position='absolute' zIndex={10} bg={useColorModeValue('white','gray.700')} borderWidth='1px' borderColor={borderColor} borderRadius='8px' mt={1} w='100%' maxH='220px' overflowY='auto'>
                    {studentOptions.map(st => (
                      <Box key={st.id} px={3} py={2} _hover={{ bg: useColorModeValue('gray.50','whiteAlpha.200'), cursor:'pointer' }}
                           onClick={()=>{ selectStudent(st); setStudentQuery(`${st.name} (${st.id})`); setStudentOptions([]); }}>
                        <Text fontSize='sm' fontWeight='600'>{st.name}</Text>
                        <Text fontSize='xs' color={textColorSecondary}>ID: {st.id} • {st.class}{st.section?`-${st.section}`:''} • Roll: {st.rollNumber || '-'}</Text>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </>
          )}
          {mode!=='studentManual' && (
            <>
              <Button leftIcon={<Icon as={MdCloudUpload} />} onClick={onPickFile} colorScheme='blue' size='sm'>Upload CSV</Button>
              <input ref={fileRef} type='file' accept='.csv' style={{ display: 'none' }} onChange={onFileChange} />
              {fileName ? <Badge colorScheme='purple' variant='subtle'>{fileName}</Badge> : null}
            </>
          )}
        </HStack>
        <Divider my={4} borderColor={borderColor} />
        <VStack align='stretch' spacing={2}>
          {mode==='classCsv' && (
            <>
              <Text fontWeight='600'>CSV schema (Class upload)</Text>
              <Box borderWidth='1px' borderColor={borderColor} borderRadius='8px' p={3} bg={useColorModeValue('gray.50','whiteAlpha.100')}>
                <Text fontFamily='mono' fontSize='sm'>examId, studentId, subject, marks, grade</Text>
                <Text fontFamily='mono' fontSize='sm'>101, 2001, Mathematics, 85, A</Text>
                <Text fontFamily='mono' fontSize='sm'>101, 2002, Mathematics, 67, B</Text>
                <Text mt={2} color={textColorSecondary}>Note: You can leave marks or grade blank. Save Excel as CSV before uploading.</Text>
              </Box>
            </>
          )}
          {mode==='studentCsv' && (
            <>
              <Text fontWeight='600'>CSV schema (Single student)</Text>
              <Box borderWidth='1px' borderColor={borderColor} borderRadius='8px' p={3} bg={useColorModeValue('gray.50','whiteAlpha.100')}>
                <Text fontFamily='mono' fontSize='sm'>examId, subject, marks, grade</Text>
                <Text fontFamily='mono' fontSize='sm'>101, Mathematics, 85, A</Text>
                <Text fontFamily='mono' fontSize='sm'>101, Science, 67, B</Text>
                <Text mt={2} color={textColorSecondary}>Tip: Select Exam and Student above to avoid repeating values.</Text>
              </Box>
            </>
          )}
        </VStack>
      </Card>

      {mode!=='studentManual' && (
        <Card p={0} overflow='hidden'>
          <Heading size='sm' p={4} borderBottomWidth='1px' borderColor={borderColor}>Preview</Heading>
          <Box overflowX='auto'>
            <Table size='sm' variant='simple'>
              <Thead bg={useColorModeValue('gray.50', 'gray.800')}>
                <Tr>
                  {headers.length ? headers.map(h => <Th key={h}>{h}</Th>) : <Th>No data</Th>}
                </Tr>
              </Thead>
              <Tbody>
                {dataRows.slice(0,50).map((r, idx) => (
                  <Tr key={idx}>
                    {headers.map(h => <Td key={h}>{r[h]}</Td>)}
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
          <Flex justify='space-between' align='center' p={4} borderTopWidth='1px' borderColor={borderColor}>
            <Text color={textColorSecondary}>{dataRows.length ? `${dataRows.length} row(s) parsed` : 'Upload a CSV to preview rows'}</Text>
            <Tooltip label={!valid ? 'Upload a valid CSV with required headers' : ''}>
              <Button colorScheme='blue' onClick={onUpload} isDisabled={!valid || uploading} isLoading={uploading}>Create Results</Button>
            </Tooltip>
          </Flex>
        </Card>
      )}

      {mode==='studentManual' && (
        <Card p={0} overflow='hidden'>
          <Heading size='sm' p={4} borderBottomWidth='1px' borderColor={borderColor}>Manual Entry for {selectedStudent ? `${selectedStudent.name} (ID: ${selectedStudent.id})` : 'Student'}</Heading>
          <Box px={4} pt={2} pb={4}>
            {!selectedStudent && (
              <Text color={textColorSecondary} mb={3}>Search and select a student above to load subjects automatically.</Text>
            )}
            {selectedStudent && (
              <>
                <Text color={textColorSecondary} mb={3}>Class: {selectedStudent.class}{selectedStudent.section?`-${selectedStudent.section}`:''} • Subjects: {studentSubjects.length || 0}</Text>
                <Box overflowX='auto'>
                  <Table size='sm' variant='simple'>
                    <Thead bg={useColorModeValue('gray.50', 'gray.800')}>
                      <Tr>
                        <Th>Subject</Th>
                        <Th isNumeric>Full Marks</Th>
                        <Th isNumeric>Marks</Th>
                        <Th>Grade</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {manualRows.map((row, idx) => (
                        <Tr key={idx}>
                          <Td>{row.subject}</Td>
                          <Td isNumeric>{row.fullMarks ?? ''}</Td>
                          <Td isNumeric>
                            <Input size='sm' type='number' value={row.marks}
                                   onChange={(e)=> {
                                     const val = e.target.value;
                                     setManualRows(rs=> rs.map((x,i)=> {
                                       if (i!==idx) return x;
                                       const marksNum = val === '' ? '' : Number(val);
                                       let nextGrade = x.grade;
                                       if (gradingBands && val !== '') {
                                         const full = Number(x.fullMarks);
                                         const pct = full && full > 0 ? (Number(marksNum)/full)*100 : Number(marksNum);
                                         nextGrade = computeGradeLocal(gradingBands, pct);
                                       }
                                       return { ...x, marks: val, grade: nextGrade };
                                     }));
                                   }} />
                          </Td>
                          <Td>
                            <Input size='sm' value={row.grade}
                                   onChange={(e)=> setManualRows(rs=> rs.map((x,i)=> i===idx?{...x, grade: e.target.value}:x))} />
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
                <Flex justify='flex-end' mt={4}>
                  <Button colorScheme='blue' onClick={async ()=>{
                    if (!examId) { toast({ title:'Select Exam', status:'warning' }); return; }
                    if (!selectedStudent) { toast({ title:'Select Student', status:'warning' }); return; }
                    const items = manualRows
                      .filter(r => r.subject && (r.marks!=='' || r.grade!==''))
                      .map(r => {
                        const marksVal = r.marks===''? null : Number(r.marks);
                        let gradeVal = r.grade || null;
                        if (!gradeVal && gradingBands && marksVal!=null) {
                          const full = Number(r.fullMarks);
                          const pct = full && full > 0 ? (marksVal/full)*100 : marksVal;
                          gradeVal = computeGradeLocal(gradingBands, pct);
                        }
                        return ({ examId: Number(examId), studentId: Number(selectedStudent.id), subject: r.subject, marks: marksVal, grade: gradeVal });
                      });
                    if (!items.length) { toast({ title:'Enter at least one subject score', status:'warning' }); return; }
                    try {
                      await resultsApi.bulkCreate(items);
                      toast({ title: 'Results saved', status:'success' });
                      navigate('/admin/academics/results');
                    } catch (e) { toast({ title: 'Save failed', status:'error' }); }
                  }}>Save Results</Button>
                </Flex>
              </>
            )}
          </Box>
        </Card>
      )}
    </Box>
  );
}
