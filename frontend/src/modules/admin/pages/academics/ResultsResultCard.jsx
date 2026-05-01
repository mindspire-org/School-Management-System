import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Global } from '@emotion/react';
import {
  Box,
  Flex,
  Heading,
  Text,
  HStack,
  Button,
  Select,
  Input,
  Textarea,
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
  NumberInput,
  NumberInputField,
  Divider,
} from '@chakra-ui/react';
import { useLocation } from 'react-router-dom';
import Card from 'components/card/Card';
import { MdPrint, MdRefresh, MdSave } from 'react-icons/md';

import * as examsApi from '../../../../services/api/exams';
import * as studentsApi from '../../../../services/api/students';
import * as classesApi from '../../../../services/api/classes';
import * as marksApi from '../../../../services/api/marks';

const safeNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const computeGradeFallback = (percent) => {
  const p = Number(percent || 0);
  if (p >= 85) return 'A';
  if (p >= 70) return 'B';
  if (p >= 55) return 'C';
  if (p >= 33) return 'D';
  return 'F';
};

const escapeHtml = (value) => {
  const s = String(value ?? '');
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const toDateLabel = (raw) => {
  if (!raw) return '';
  const dt = new Date(raw);
  if (Number.isNaN(dt.getTime())) return '';
  return dt.toLocaleDateString();
};

const buildPrintHtml = ({
  resultCard,
  rows,
  totals,
  remarks,
  signatureTeacher,
  signaturePrincipal,
}) => {
  const campusName = resultCard?.campus?.name || resultCard?.campusName || '';
  const schoolName = resultCard?.schoolName || resultCard?.instituteName || '';
  const titleName = campusName || schoolName || 'Academia Pro';
  const studentName = resultCard?.student?.name || '';
  const roll = resultCard?.student?.rollNumber || '';
  const className = resultCard?.student?.className || '';
  const section = resultCard?.student?.section || '';
  const examTitle = resultCard?.exam?.title || '';

  const generatedOn = new Date().toLocaleDateString();
  const examDate = toDateLabel(resultCard?.exam?.examDate) || generatedOn;
  const passLabel = totals?.percentage >= 33 ? 'PASS' : 'FAIL';

  const lines = (rows || []).map((r) => {
    const subject = escapeHtml(r?.subject || '');
    const full = Number.isFinite(r?.fullMarks) ? Number(r.fullMarks) : null;
    const obt = Number.isFinite(r?.obtainedMarks) ? Number(r.obtainedMarks) : null;
    const pct = full && obt != null ? (obt / full) * 100 : null;
    const grade = escapeHtml(r?.grade || (pct != null ? computeGradeFallback(pct) : '—'));

    return `
      <tr>
        <td class="subject">${subject}</td>
        <td class="num">${full ?? '—'}</td>
        <td class="num">${obt ?? '—'}</td>
        <td class="num">${pct == null ? '—' : `${Math.round(pct)}%`}</td>
        <td class="grade">${grade}</td>
      </tr>
    `;
  });

  const remarksSafe = escapeHtml(remarks || '');

  return `
  <!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Result Card</title>
      <style>
        @page { size: A4; margin: 10mm; }
        * { box-sizing: border-box; }
        html, body { background: #fff; }
        body {
          margin: 0;
          color: #0f172a;
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, Helvetica, sans-serif;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .page { width: 100%; margin: 0 auto; padding: 0; }
        .sheet {
          min-height: calc(297mm - 20mm);
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          overflow: hidden;
        }
        .header {
          padding: 16px 18px;
          background: linear-gradient(135deg, #1d4ed8 0%, #7c3aed 55%, #db2777 100%);
          color: #fff;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
        }
        .brand { display: flex; gap: 12px; align-items: flex-start; }
        .logo {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: rgba(255,255,255,0.18);
          border: 1px solid rgba(255,255,255,0.30);
        }
        .title { font-size: 20px; font-weight: 900; line-height: 1.15; letter-spacing: .2px; }
        .sub { font-size: 12px; opacity: 0.92; margin-top: 2px; }
        .pill { display: inline-block; font-size: 12px; font-weight: 800; padding: 7px 11px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.35); background: rgba(255,255,255,0.16); }
        .meta { font-size: 11px; opacity: 0.92; margin-top: 6px; }

        .content { padding: 16px 18px 14px; background: #fff; }
        .divider { height: 1px; background: #e2e8f0; margin: 12px 0; }
        .info { display: flex; gap: 12px; flex-wrap: wrap; }
        .info .block { flex: 1; min-width: 190px; padding: 10px 12px; border: 1px solid #e2e8f0; border-radius: 12px; background: #f8fafc; }
        .label { font-size: 11px; color: #475569; }
        .value { font-size: 13px; font-weight: 800; margin-top: 3px; color: #0f172a; }

        table { width: 100%; border-collapse: separate; border-spacing: 0; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
        thead th { background: #0b1220; color: #fff; font-size: 11px; letter-spacing: .3px; text-transform: uppercase; text-align: left; padding: 10px 10px; }
        tbody td { font-size: 12px; padding: 10px 10px; border-bottom: 1px solid #eef2f7; }
        tbody tr:nth-child(even) td { background: #fbfdff; }
        tbody tr:last-child td { border-bottom: none; }
        td.num, th.num { text-align: right; }
        td.subject { font-weight: 800; }
        td.grade { font-weight: 900; }
        .total-row td {
          background: linear-gradient(90deg, rgba(29,78,216,0.08), rgba(124,58,237,0.08), rgba(219,39,119,0.08));
          font-weight: 900;
          border-top: 1px solid #e2e8f0;
        }

        .bottom { display: flex; gap: 12px; margin-top: 14px; flex-wrap: wrap; }
        .remarks { flex: 1; min-width: 260px; }
        .remarks-box { min-height: 72px; border: 1px solid #e2e8f0; border-radius: 12px; padding: 10px 12px; background: #fff; white-space: pre-wrap; }
        .sigs { flex: 1; min-width: 260px; }
        .sig-row { display: flex; gap: 14px; margin-top: 10px; }
        .sig { flex: 1; text-align: center; }
        .sig-line { border-bottom: 2px solid #0f172a; height: 28px; }
        .sig-name { font-size: 11px; font-weight: 900; margin-top: 6px; min-height: 14px; }
        .sig-role { font-size: 11px; color: #475569; margin-top: 2px; }
        .foot { margin-top: 12px; font-size: 10px; color: #64748b; }
        tr, td, th { page-break-inside: avoid; }
      </style>
    </head>
    <body>
      <div class="page">
        <div class="sheet">
          <div class="header">
            <div class="brand">
              <div class="logo"></div>
              <div>
                <div class="title">${escapeHtml(titleName)}</div>
                <div class="sub">Performance &amp; Marks — Result Card</div>
              </div>
            </div>
            <div style="text-align:right">
              <span class="pill">${escapeHtml(String(Math.round(totals?.percentage ?? 0)))}% • ${passLabel} • ${escapeHtml(String(totals?.grade ?? ''))}</span>
              <div class="meta">Generated: ${escapeHtml(generatedOn)}</div>
            </div>
          </div>

          <div class="content">
            <div class="info">
              <div class="block">
                <div class="label">Student</div>
                <div class="value">${escapeHtml(studentName || '—')}</div>
                <div class="meta">Roll No: ${escapeHtml(roll || '—')}</div>
              </div>
              <div class="block">
                <div class="label">Class</div>
                <div class="value">${escapeHtml(className || '—')}-${escapeHtml(section || '—')}</div>
              </div>
              <div class="block">
                <div class="label">Exam</div>
                <div class="value">${escapeHtml(examTitle || '—')}</div>
                <div class="meta">Date: ${escapeHtml(examDate)}</div>
              </div>
            </div>

            <div class="divider"></div>

            <table>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th class="num">Full</th>
                  <th class="num">Obtained</th>
                  <th class="num">%</th>
                  <th>Grade</th>
                </tr>
              </thead>
              <tbody>
                ${lines.join('')}
                <tr class="total-row">
                  <td>Total</td>
                  <td class="num">${escapeHtml(String(totals?.totalMarks ?? 0))}</td>
                  <td class="num">${escapeHtml(String(totals?.obtainedMarks ?? 0))}</td>
                  <td class="num">${escapeHtml(String(Math.round(totals?.percentage ?? 0)))}%</td>
                  <td>${escapeHtml(String(totals?.grade ?? ''))}</td>
                </tr>
              </tbody>
            </table>

            <div class="bottom">
              <div class="remarks">
                <div class="label">Remarks</div>
                <div class="remarks-box">${remarksSafe}</div>
              </div>
              <div class="sigs">
                <div class="label">Signatures</div>
                <div class="sig-row">
                  <div class="sig">
                    <div class="sig-line"></div>
                    <div class="sig-name">${escapeHtml(signatureTeacher || '')}</div>
                    <div class="sig-role">Class Teacher</div>
                  </div>
                  <div class="sig">
                    <div class="sig-line"></div>
                    <div class="sig-name">${escapeHtml(signaturePrincipal || '')}</div>
                    <div class="sig-role">Principal</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="foot">This is a system generated document.</div>
          </div>
        </div>
      </div>

      <script>
        window.focus();
        setTimeout(() => { window.print(); }, 250);
        window.onafterprint = () => { window.close(); };
      </script>
    </body>
  </html>
  `;
};

function ResultCardDocument({ resultCard, rows, totals, remarks, signatures }) {
  const schoolName =
    resultCard?.campus?.name ||
    resultCard?.campusName ||
    resultCard?.schoolName ||
    resultCard?.instituteName ||
    'Academia Pro';

  const generatedOn = useMemo(() => new Date().toLocaleDateString(), []);
  const examDateLabel = useMemo(() => {
    const raw = resultCard?.exam?.examDate;
    if (!raw) return generatedOn;
    const dt = new Date(raw);
    return Number.isNaN(dt.getTime()) ? generatedOn : dt.toLocaleDateString();
  }, [resultCard?.exam?.examDate, generatedOn]);

  const passLabel = totals.percentage >= 33 ? 'PASS' : 'FAIL';

  return (
    <Box bg='white' color='black'>
      <Flex justify='space-between' align='flex-start' gap={6}>
        <Box>
          <Text fontSize='22px' fontWeight='800' letterSpacing='0.3px'>
            {schoolName}
          </Text>
          <Text fontSize='12px' color='gray.600'>Student Result Card</Text>
        </Box>
        <Box textAlign='right'>
          <Badge
            colorScheme={totals.percentage >= 33 ? 'green' : 'red'}
            fontSize='12px'
            px={3}
            py={1}
            borderRadius='999px'
          >
            {Math.round(totals.percentage)}% • {passLabel}
          </Badge>
          <Text mt={2} fontSize='12px' color='gray.600'>Generated: {generatedOn}</Text>
        </Box>
      </Flex>

      <Divider my='12px' borderColor='gray.300' />

      <Flex justify='space-between' gap={6} flexWrap='wrap'>
        <Box flex='1' minW='220px'>
          <Text fontSize='12px' color='gray.600'>Student</Text>
          <Text fontSize='14px' fontWeight='700'>{resultCard?.student?.name || '—'}</Text>
          <Text fontSize='12px' color='gray.700'>Roll No: {resultCard?.student?.rollNumber || '—'}</Text>
        </Box>
        <Box flex='1' minW='220px'>
          <Text fontSize='12px' color='gray.600'>Class</Text>
          <Text fontSize='14px' fontWeight='700'>
            {resultCard?.student?.className || '—'}-{resultCard?.student?.section || '—'}
          </Text>
        </Box>
        <Box flex='1' minW='220px'>
          <Text fontSize='12px' color='gray.600'>Exam</Text>
          <Text fontSize='14px' fontWeight='700'>{resultCard?.exam?.title || '—'}</Text>
          <Text fontSize='12px' color='gray.700'>Date: {examDateLabel}</Text>
        </Box>
      </Flex>

      <Divider my='12px' borderColor='gray.300' />

      <Box overflow='hidden' border='1px solid' borderColor='gray.300' borderRadius='10px'>
        <Table variant='simple' size='sm'>
          <Thead bg='gray.100'>
            <Tr>
              <Th color='gray.700' fontSize='11px'>Subject</Th>
              <Th color='gray.700' fontSize='11px' isNumeric>Full</Th>
              <Th color='gray.700' fontSize='11px' isNumeric>Obtained</Th>
              <Th color='gray.700' fontSize='11px' isNumeric>%</Th>
              <Th color='gray.700' fontSize='11px'>Grade</Th>
            </Tr>
          </Thead>
          <Tbody>
            {rows.map((r) => {
              const full = Number.isFinite(r.fullMarks) ? r.fullMarks : null;
              const obt = Number.isFinite(r.obtainedMarks) ? r.obtainedMarks : null;
              const pct = full && obt != null ? (obt / full) * 100 : null;
              const grade = r.grade || (pct != null ? computeGradeFallback(pct) : '—');
              return (
                <Tr key={`doc-${r.subject}`}>
                  <Td fontSize='12px' fontWeight='600'>{r.subject}</Td>
                  <Td fontSize='12px' isNumeric>{full ?? '—'}</Td>
                  <Td fontSize='12px' isNumeric>{obt ?? '—'}</Td>
                  <Td fontSize='12px' isNumeric>{pct == null ? '—' : `${Math.round(pct)}%`}</Td>
                  <Td fontSize='12px' fontWeight='700'>{grade}</Td>
                </Tr>
              );
            })}
            <Tr bg='gray.50'>
              <Td fontSize='12px' fontWeight='800'>Total</Td>
              <Td fontSize='12px' isNumeric fontWeight='800'>{totals.totalMarks}</Td>
              <Td fontSize='12px' isNumeric fontWeight='800'>{totals.obtainedMarks}</Td>
              <Td fontSize='12px' isNumeric fontWeight='800'>{Math.round(totals.percentage)}%</Td>
              <Td fontSize='12px' fontWeight='800'>{totals.grade}</Td>
            </Tr>
          </Tbody>
        </Table>
      </Box>

      <Flex mt='14px' justify='space-between' gap={6} flexWrap='wrap'>
        <Box flex='1' minW='260px'>
          <Text fontSize='12px' color='gray.600'>Remarks</Text>
          <Box mt={2} border='1px solid' borderColor='gray.300' borderRadius='10px' minH='70px' px={3} py={2}>
            <Text fontSize='12px' whiteSpace='pre-wrap'>
              {remarks || ''}
            </Text>
          </Box>
        </Box>
        <Box flex='1' minW='260px'>
          <Text fontSize='12px' color='gray.600'>Signatures</Text>
          <Flex mt={4} justify='space-between' gap={6} flexWrap='wrap'>
            <Box flex='1' minW='200px' textAlign='center'>
              <Box borderBottom='1px solid #111' h='28px' />
              <Text fontSize='11px' fontWeight='700' mt={2} minH='16px'>
                {signatures?.teacher || ''}
              </Text>
              <Text fontSize='11px' color='gray.700'>Class Teacher</Text>
            </Box>
            <Box flex='1' minW='200px' textAlign='center'>
              <Box borderBottom='1px solid #111' h='28px' />
              <Text fontSize='11px' fontWeight='700' mt={2} minH='16px'>
                {signatures?.principal || ''}
              </Text>
              <Text fontSize='11px' color='gray.700'>Principal</Text>
            </Box>
          </Flex>
        </Box>
      </Flex>

      <Text mt='12px' fontSize='10px' color='gray.600'>This is a system generated document.</Text>
    </Box>
  );
}

export default function ResultsResultCard() {
  const toast = useToast();
  const location = useLocation();
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  const printRef = useRef(null);

  const [remarks, setRemarks] = useState('');
  const [signatureTeacher, setSignatureTeacher] = useState('');
  const [signaturePrincipal, setSignaturePrincipal] = useState('');

  const [classRows, setClassRows] = useState([]);
  const [selectedClassKey, setSelectedClassKey] = useState('');

  const selectedClass = useMemo(() => {
    if (!selectedClassKey) return null;
    const [className, section] = selectedClassKey.split('::');
    return { className, section };
  }, [selectedClassKey]);

  const deepLink = useMemo(() => {
    try {
      const sp = new URLSearchParams(location?.search || '');
      const className = sp.get('className') || '';
      const section = sp.get('section') || '';
      const studentId = sp.get('studentId') || '';
      const examId = sp.get('examId') || '';
      return {
        className: String(className || ''),
        section: String(section || ''),
        studentId: String(studentId || ''),
        examId: String(examId || ''),
      };
    } catch {
      return { className: '', section: '', studentId: '', examId: '' };
    }
  }, [location?.search]);

  const [exams, setExams] = useState([]);
  const [examId, setExamId] = useState('');
  const [loadingExams, setLoadingExams] = useState(false);

  const [studentsInClass, setStudentsInClass] = useState([]);
  const [studentId, setStudentId] = useState('');
  const [loadingStudents, setLoadingStudents] = useState(false);

  const [resultCard, setResultCard] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadClasses = useCallback(async () => {
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
        const c = String(a.className).localeCompare(String(b.className), undefined, { numeric: true });
        if (c !== 0) return c;
        return String(a.section).localeCompare(String(b.section));
      });

      setClassRows(list);
      if (!selectedClassKey && list.length) setSelectedClassKey(`${list[0].className}::${list[0].section}`);
    } catch (_) {
      setClassRows([]);
    }
  }, [selectedClassKey]);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  useEffect(() => {
    if (!deepLink?.className || !deepLink?.section) return;
    setSelectedClassKey(`${deepLink.className}::${deepLink.section}`);
  }, [deepLink?.className, deepLink?.section]);

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
        const res = await examsApi.list({ pageSize: 200, className: selectedClass.className, section: selectedClass.section });
        const items = Array.isArray(res?.items) ? res.items : Array.isArray(res) ? res : [];
        if (!mounted) return;
        setExams(items);
        if (deepLink?.examId && items.some((x) => String(x?.id) === String(deepLink.examId))) {
          setExamId(String(deepLink.examId));
        } else if (!examId && items.length) {
          setExamId(String(items[0].id));
        }
      } catch (_) {
        if (!mounted) return;
        setExams([]);
        setExamId('');
      } finally {
        if (mounted) setLoadingExams(false);
      }
    })();
    return () => { mounted = false; };
  }, [selectedClass, examId, deepLink?.examId]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!selectedClass?.className || !selectedClass?.section) {
        setStudentsInClass([]);
        setStudentId('');
        return;
      }
      setLoadingStudents(true);
      try {
        const res = await studentsApi.list({ page: 1, pageSize: 200, class: selectedClass.className, section: selectedClass.section });
        const list = Array.isArray(res?.rows) ? res.rows : Array.isArray(res) ? res : [];
        if (!mounted) return;
        setStudentsInClass(list);
        if (deepLink?.studentId && list.some((x) => String(x?.id) === String(deepLink.studentId))) {
          setStudentId(String(deepLink.studentId));
        } else if (!studentId && list.length) {
          setStudentId(String(list[0].id));
        }
      } catch (_) {
        if (!mounted) return;
        setStudentsInClass([]);
        setStudentId('');
      } finally {
        if (mounted) setLoadingStudents(false);
      }
    })();
    return () => { mounted = false; };
  }, [selectedClass, studentId, deepLink?.studentId]);

  const loadResultCard = useCallback(async () => {
    if (!studentId || !examId) {
      setResultCard(null);
      setRows([]);
      return;
    }
    setLoading(true);
    try {
      const data = await marksApi.getResultCard({ studentId: Number(studentId), examId: Number(examId) });
      setResultCard(data);
      const r = Array.isArray(data?.subjects) ? data.subjects : [];
      setRows(
        r.map((x) => ({
          subject: x.subject,
          fullMarks: safeNum(x.fullMarks),
          obtainedMarks: safeNum(x.obtainedMarks),
          grade: x.grade || null,
        }))
      );
    } catch (e) {
      setResultCard(null);
      setRows([]);
      toast({ title: 'Failed to load result card', description: e?.message, status: 'error', duration: 4000 });
    } finally {
      setLoading(false);
    }
  }, [studentId, examId, toast]);

  useEffect(() => {
    loadResultCard();
  }, [loadResultCard]);

  useEffect(() => {
    setRemarks('');
    setSignatureTeacher('');
    setSignaturePrincipal('');
  }, [studentId, examId]);

  const totals = useMemo(() => {
    const totalMarks = rows.reduce((acc, r) => acc + (Number.isFinite(r.fullMarks) ? r.fullMarks : 0), 0);
    const obtainedMarks = rows.reduce((acc, r) => acc + (Number.isFinite(r.obtainedMarks) ? r.obtainedMarks : 0), 0);
    const percent = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0;
    return { totalMarks, obtainedMarks, percentage: percent, grade: computeGradeFallback(percent) };
  }, [rows]);

  const handleSave = async () => {
    if (!examId || !studentId) return;
    setSaving(true);
    try {
      const items = rows
        .filter((r) => r.subject)
        .map((r) => ({
          studentId: Number(studentId),
          subject: r.subject,
          marks: r.obtainedMarks === null ? null : Number(r.obtainedMarks),
          grade: r.grade || null,
        }));

      await marksApi.bulkUpsert({ examId: Number(examId), items });
      toast({ title: 'Saved', status: 'success', duration: 2500 });
      loadResultCard();
    } catch (e) {
      toast({ title: 'Save failed', description: e?.message, status: 'error', duration: 4000 });
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    if (!resultCard) {
      toast({ title: 'No result card to print', status: 'info', duration: 2500 });
      return;
    }
    let iframe;
    try {
      iframe = document.createElement('iframe');
      iframe.setAttribute('aria-hidden', 'true');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);

      const html = buildPrintHtml({
        resultCard,
        rows,
        totals,
        remarks,
        signatureTeacher,
        signaturePrincipal,
      });

      const doc = iframe.contentWindow?.document;
      if (!doc) throw new Error('Print frame not available.');
      doc.open();
      doc.write(html);
      doc.close();

      const cleanup = () => {
        try {
          iframe?.parentNode?.removeChild(iframe);
        } catch (_) { }
      };

      const w = iframe.contentWindow;
      if (w) w.onafterprint = cleanup;

      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          setTimeout(cleanup, 2000);
        } catch (_) {
          cleanup();
        }
      }, 250);
    } catch (e) {
      try {
        iframe?.parentNode?.removeChild(iframe);
      } catch (_) { }
      toast({ title: 'Print failed', description: e?.message || 'Could not render print document.', status: 'error', duration: 5000 });
    }
  };

  const reset = () => {
    setExamId('');
    setStudentId('');
    setResultCard(null);
    setRows([]);
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Global
        styles={{
          '.print-only': {
            display: 'none',
          },
          '@page': {
            size: 'A4',
            margin: '12mm',
          },
          '@media print': {
            body: {
              background: '#ffffff',
              WebkitPrintColorAdjust: 'exact',
              printColorAdjust: 'exact',
            },
            '.no-print': {
              display: 'none !important',
            },
            '.print-only': {
              display: 'block !important',
            },
            '#print-result-card': {
              display: 'block !important',
            },
            '#print-result-card': {
              width: '210mm',
              margin: '0 auto',
            },
          },
        }}
      />

      <Flex justify='space-between' align='center' mb='12px' wrap='wrap' gap={3}>
        <Box className='no-print'>
          <Heading size='lg' color={textColor}>Result Card</Heading>
          <Text color={textColorSecondary}>Select class, exam and student to generate and update the result card.</Text>
        </Box>
        <HStack className='no-print'>
          <Button leftIcon={<MdRefresh />} variant='outline' onClick={reset}>Reset</Button>
          <Button leftIcon={<MdPrint />} variant='outline' onClick={handlePrint} isDisabled={!resultCard}>Print</Button>
          <Button leftIcon={<MdSave />} colorScheme='blue' onClick={handleSave} isLoading={saving} loadingText='Saving'>Save</Button>
        </HStack>
      </Flex>

      <Card p='16px' mb='16px' className='no-print'>
        <Flex gap={3} wrap='wrap'>
          <Select
            value={selectedClassKey}
            onChange={(e) => setSelectedClassKey(e.target.value)}
            maxW='260px'
          >
            {classRows.map((c) => (
              <option key={`${c.className}::${c.section}`} value={`${c.className}::${c.section}`}>
                {c.className}-{c.section}
              </option>
            ))}
          </Select>

          <Select
            placeholder={loadingExams ? 'Loading exams...' : 'Select exam'}
            value={examId}
            onChange={(e) => setExamId(e.target.value)}
            isDisabled={loadingExams}
            maxW='260px'
          >
            {exams.map((e) => (
              <option key={e.id} value={e.id}>{e.title}</option>
            ))}
          </Select>

          <Select
            placeholder={loadingStudents ? 'Loading students...' : 'Select student'}
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            isDisabled={loadingStudents}
            maxW='320px'
          >
            {studentsInClass.map((s) => (
              <option key={s.id} value={s.id}>{s.name} {s.rollNumber ? `(${s.rollNumber})` : ''}</option>
            ))}
          </Select>
        </Flex>
      </Card>

      <Card p='16px' className='no-print'>
        {loading ? (
          <Flex justify='center' py='24px'><Spinner /></Flex>
        ) : !resultCard ? (
          <Text color={textColorSecondary}>No result card loaded.</Text>
        ) : (
          <>
            <Flex justify='space-between' align='center' mb='12px' wrap='wrap' gap={3}>
              <Heading size='md' color={textColor}>Preview</Heading>
              <HStack spacing={2} flexWrap='wrap'>
                <Badge colorScheme='purple'>Total: {totals.totalMarks}</Badge>
                <Badge colorScheme='blue'>Obtained: {totals.obtainedMarks}</Badge>
                <Badge colorScheme={totals.percentage >= 33 ? 'green' : 'red'}>
                  {Math.round(totals.percentage)}% ({totals.grade})
                </Badge>
              </HStack>
            </Flex>

            <Box border='1px solid' borderColor={borderColor} borderRadius='12px' p='18px' bg='white' color='black'>
              <ResultCardDocument
                resultCard={resultCard}
                rows={rows}
                totals={totals}
                remarks={remarks}
                signatures={{ teacher: signatureTeacher, principal: signaturePrincipal }}
              />
            </Box>

            <Divider my='16px' borderColor={borderColor} />

            <Heading size='sm' color={textColor} mb='10px'>Remarks & Signatures</Heading>
            <Flex gap={4} wrap='wrap' mb='16px'>
              <Box flex='2' minW='280px'>
                <Text fontSize='sm' color={textColorSecondary} mb='6px'>Remarks (optional)</Text>
                <Textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder='Write remarks...'
                  minH='90px'
                  bg='white'
                />
              </Box>
              <Box flex='1' minW='240px'>
                <Text fontSize='sm' color={textColorSecondary} mb='6px'>Signature names (optional)</Text>
                <Flex direction='column' gap={2}>
                  <Input
                    value={signatureTeacher}
                    onChange={(e) => setSignatureTeacher(e.target.value)}
                    placeholder='Class Teacher name'
                    bg='white'
                  />
                  <Input
                    value={signaturePrincipal}
                    onChange={(e) => setSignaturePrincipal(e.target.value)}
                    placeholder='Principal name'
                    bg='white'
                  />
                </Flex>
              </Box>
            </Flex>

            <Heading size='sm' color={textColor} mb='10px'>Edit Marks</Heading>
            <Box overflowX='auto'>
              <Table variant='simple' sx={{ tableLayout: 'fixed' }}>
                <Thead>
                  <Tr>
                    <Th w='42%'>Subject</Th>
                    <Th isNumeric w='14%'>Full</Th>
                    <Th isNumeric w='24%'>Obtained</Th>
                    <Th w='20%'>Grade</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {rows.map((r) => (
                    <Tr key={r.subject} borderBottom='1px solid' borderColor={borderColor}>
                      <Td fontWeight='600'>{r.subject}</Td>
                      <Td isNumeric>{r.fullMarks ?? '—'}</Td>
                      <Td isNumeric>
                        <Flex justify='flex-end'>
                          <NumberInput
                            size='sm'
                            maxW='120px'
                            value={r.obtainedMarks ?? ''}
                            onChange={(val) => {
                              const n = val === '' ? null : Number(val);
                              setRows((prev) => prev.map((x) => x.subject === r.subject ? ({ ...x, obtainedMarks: Number.isFinite(n) ? n : null }) : x));
                            }}
                            min={0}
                            max={r.fullMarks ?? 999}
                          >
                            <NumberInputField />
                          </NumberInput>
                        </Flex>
                      </Td>
                      <Td>
                        <Input
                          size='sm'
                          value={r.grade ?? ''}
                          onChange={(e) => setRows((prev) => prev.map((x) => x.subject === r.subject ? ({ ...x, grade: e.target.value }) : x))}
                          placeholder='Auto'
                          maxW='100px'
                        />
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </>
        )}
      </Card>

      <Box
        id='print-result-card'
        ref={printRef}
        className='print-only'
        bg='white'
        color='black'
        p='0'
      >
        {!resultCard ? (
          <Text>No result card</Text>
        ) : (
          <Box p='18px'>
            <ResultCardDocument
              resultCard={resultCard}
              rows={rows}
              totals={totals}
              remarks={remarks}
              signatures={{ teacher: signatureTeacher, principal: signaturePrincipal }}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
}
