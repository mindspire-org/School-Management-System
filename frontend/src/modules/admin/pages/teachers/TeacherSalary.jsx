import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Flex,
  SimpleGrid,
  Badge,
  Icon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Input,
  Select,
  FormControl,
  FormLabel,
  InputGroup,
  InputLeftElement,
  HStack,
  useColorModeValue,
  useDisclosure,
  useToast,
  Spinner,
  useBreakpointValue,
  Textarea,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
} from '@chakra-ui/react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import Card from 'components/card/Card.js';
import MiniStatistics from 'components/card/MiniStatistics';
import IconBox from 'components/icons/IconBox';
import StatCard from '../../../../components/card/StatCard';
import BarChart from 'components/charts/BarChart.tsx';
import DonutChart from 'components/charts/v2/DonutChart.tsx';
import LineChart from 'components/charts/LineChart';
import {
  MdAttachMoney,
  MdCalendarToday,
  MdLocalPrintshop,
  MdFileDownload,
  MdMoreVert,
  MdSearch,
  MdCheckCircle,
} from 'react-icons/md';
import * as teacherApi from '../../../../services/api/teachers';
import * as settingsApi from '../../../../services/api/settings';
import { useAuth } from '../../../../contexts/AuthContext';

const statusColorMap = {
  paid: 'green',
  processing: 'blue',
  pending: 'orange',
  failed: 'red',
  cancelled: 'gray',
};

const shiftMonth = (yyyyMm, delta) => {
  const [y, m] = String(yyyyMm || '').split('-').map(Number);
  if (!y || !m) return '';
  const d = new Date(y, m - 1, 1);
  d.setMonth(d.getMonth() + delta);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${d.getFullYear()}-${mm}`;
};

const monthLabel = (yyyyMm) => {
  try {
    const [y, m] = String(yyyyMm || '').split('-').map(Number);
    if (!y || !m) return String(yyyyMm || '');
    return new Date(y, m - 1, 1).toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
  } catch {
    return String(yyyyMm || '');
  }
};

const TeacherSalary = () => {
  const { campusId } = useAuth();
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM format
  const [payrolls, setPayrolls] = useState([]);
  const [payrollLoading, setPayrollLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [monthHistory, setMonthHistory] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [teachersLoading, setTeachersLoading] = useState(false);
  const [processingMap, setProcessingMap] = useState({});
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editRow, setEditRow] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [payslipRow, setPayslipRow] = useState(null);
  const editDisclosure = useDisclosure();
  const payslipDisclosure = useDisclosure();
  const toast = useToast();

  // Colors
  const textColor = useColorModeValue('gray.800', 'white');
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const tableHeaderBg = useColorModeValue('gray.50', 'gray.800');

  const chartH = useBreakpointValue({ base: 240, md: 280, lg: 320 });

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat('en-PK', {
        style: 'currency',
        currency: 'PKR',
        maximumFractionDigits: 0,
      }),
    []
  );

  const formatAmount = useCallback((value) => currencyFormatter.format(Number(value || 0)), [currencyFormatter]);

  const fetchPayrolls = useCallback(async () => {
    if (!month) return;
    setPayrollLoading(true);
    try {
      const data = await teacherApi.getPayrolls({ month, campusId });
      setPayrolls(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setPayrolls([]);
      toast({
        title: 'Failed to load payrolls',
        description: error?.message || 'Please try again later.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setPayrollLoading(false);
    }
  }, [month, campusId, toast]);

  const fetchHistory = useCallback(async () => {
    if (!month) return;
    setHistoryLoading(true);
    try {
      const months = Array.from({ length: 6 }).map((_, i) => shiftMonth(month, -(5 - i)));
      const results = await Promise.all(months.map((m) => teacherApi.getPayrolls({ month: m })));
      const series = results.map((res, idx) => {
        const list = Array.isArray(res) ? res : [];
        const total = list.reduce((sum, r) => sum + Number(r.totalAmount || 0), 0);
        const paid = list.filter((r) => String(r.status || '').toLowerCase() === 'paid')
          .reduce((sum, r) => sum + Number(r.totalAmount || 0), 0);
        const pending = list.filter((r) => {
          const s = String(r.status || '').toLowerCase();
          return s === 'pending' || s === 'processing';
        }).reduce((sum, r) => sum + Number(r.totalAmount || 0), 0);
        return {
          month: months[idx],
          total,
          paid,
          pending,
        };
      });
      setMonthHistory(series);
    } catch (e) {
      console.error(e);
      setMonthHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }, [month]);

  useEffect(() => {
    fetchPayrolls();
  }, [fetchPayrolls]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const fetchTeachers = useCallback(async () => {
    setTeachersLoading(true);
    try {
      const response = await teacherApi.list({ page: 1, pageSize: 200, campusId });
      const rows = Array.isArray(response?.rows) ? response.rows : Array.isArray(response) ? response : [];
      setTeachers(rows);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Failed to load teachers',
        description: error?.message || 'Please try again later.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setTeachersLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  const payrollMap = useMemo(() => {
    return payrolls.reduce((acc, row) => {
      if (row?.teacherId) acc[row.teacherId] = row;
      return acc;
    }, {});
  }, [payrolls]);

  const computeTotalAmount = useCallback(({ baseSalary = 0, allowances = 0, deductions = 0, bonuses = 0 }) => {
    const total = Number(baseSalary || 0) + Number(allowances || 0) + Number(bonuses || 0) - Number(deductions || 0);
    return Math.max(0, Number(total.toFixed(0)));
  }, []);

  const teacherRows = useMemo(() => {
    const rows = teachers.map((teacher) => {
      const payroll = payrollMap[teacher.id];
      const baseSalary = Number(payroll?.baseSalary ?? teacher.baseSalary ?? 0);
      const allowances = Number(payroll?.allowances ?? teacher.allowances ?? 0);
      const deductions = Number(payroll?.deductions ?? teacher.deductions ?? 0);
      const bonuses = Number(payroll?.bonuses ?? 0);
      const totalAmount = Number(payroll?.totalAmount ?? computeTotalAmount({ baseSalary, allowances, deductions, bonuses }));
      return {
        key: payroll?.id ?? `teacher-${teacher.id}`,
        payrollId: payroll?.id,
        teacherId: teacher.id,
        teacherName: teacher.name,
        employeeId: teacher.employeeId,
        designation: teacher.designation,
        department: payroll?.department ?? teacher.department ?? teacher.dept ?? '—',
        baseSalary,
        allowances,
        deductions,
        bonuses,
        totalAmount,
        status: payroll?.status ?? 'pending',
        paidOn: payroll?.paidOn ?? null,
        paymentMethod: payroll?.paymentMethod ?? teacher.paymentMethod,
        transactionReference: payroll?.transactionReference ?? null,
        notes: payroll?.notes ?? null,
      };
    });

    const knownTeacherIds = new Set(teachers.map((teacher) => teacher.id));
    payrolls.forEach((payroll) => {
      if (!knownTeacherIds.has(payroll.teacherId)) {
        rows.push({
          key: payroll.id,
          payrollId: payroll.id,
          teacherId: payroll.teacherId,
          teacherName: payroll.teacherName || `Teacher #${payroll.teacherId}`,
          employeeId: payroll.employeeId,
          designation: payroll.designation,
          department: payroll.department || '—',
          baseSalary: Number(payroll.baseSalary || 0),
          allowances: Number(payroll.allowances || 0),
          deductions: Number(payroll.deductions || 0),
          bonuses: Number(payroll.bonuses || 0),
          totalAmount: Number(payroll.totalAmount || 0),
          status: payroll.status || 'pending',
          paidOn: payroll.paidOn || null,
          paymentMethod: payroll.paymentMethod,
          transactionReference: payroll.transactionReference || null,
          notes: payroll.notes || null,
        });
      }
    });

    return rows;
  }, [teachers, payrollMap, payrolls, computeTotalAmount]);

  const stats = useMemo(() => {
    const totalBudget = teacherRows.reduce((sum, row) => sum + Number(row.totalAmount || 0), 0);
    const processed = teacherRows.filter((row) => row.status === 'paid').length;
    const pending = teacherRows.filter((row) => row.status === 'pending' || row.status === 'processing').length;
    return { totalBudget, processed, pending };
  }, [teacherRows]);

  const statusDonut = useMemo(() => {
    const paid = teacherRows.filter((row) => row.status === 'paid').length;
    const pending = teacherRows.filter((row) => row.status === 'pending' || row.status === 'processing').length;
    const other = Math.max(0, teacherRows.length - paid - pending);
    const labels = other > 0 ? ['Paid', 'Pending', 'Other'] : ['Paid', 'Pending'];
    const series = other > 0 ? [paid, pending, other] : [paid, pending];
    return { labels, series };
  }, [teacherRows]);

  const trendChart = useMemo(() => {
    const hasAny = Array.isArray(monthHistory) && monthHistory.some((x) => Number(x.total || 0) > 0);
    const history = hasAny ? monthHistory : Array.from({ length: 6 }).map((_, i) => {
      const m = shiftMonth(month, -(5 - i));
      const base = Number(stats.totalBudget || 0);
      const bump = Math.round((Math.sin(i / 2) * 0.06 + 1) * base);
      return { month: m, total: bump, paid: Math.round(bump * 0.6), pending: Math.round(bump * 0.4) };
    });

    const categories = history.map((x) => monthLabel(x.month));
    const totalSeries = history.map((x) => Number(x.total || 0));
    const paidSeries = history.map((x) => Number(x.paid || 0));
    return {
      categories,
      series: [
        { name: 'Total', data: totalSeries },
        { name: 'Paid', data: paidSeries },
      ],
    };
  }, [month, monthHistory, stats.totalBudget]);

  const departmentBar = useMemo(() => {
    const m = new Map();
    teacherRows.forEach((row) => {
      const key = String(row.department || '—');
      m.set(key, (m.get(key) || 0) + Number(row.totalAmount || 0));
    });
    const rows = Array.from(m.entries())
      .map(([department, total]) => ({ department, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);
    return {
      categories: rows.map((r) => r.department),
      series: [{ name: 'Total Amount', data: rows.map((r) => Math.round(r.total)) }],
    };
  }, [teacherRows]);

  const filteredRows = useMemo(() => {
    if (!searchQuery) return teacherRows;
    const query = searchQuery.toLowerCase();
    return teacherRows.filter((row) => {
      const nameMatch = row.teacherName?.toLowerCase().includes(query);
      const idMatch = row.employeeId?.toLowerCase().includes(query);
      const teacherIdMatch = String(row.teacherId || '').toLowerCase().includes(query);
      return nameMatch || idMatch || teacherIdMatch;
    });
  }, [teacherRows, searchQuery]);

  const formatStatus = (status) =>
    (status || 'pending')
      .split('_')
      .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
      .join(' ');

  const replacePayrollInState = (updatedPayroll) => {
    if (!updatedPayroll) return;
    setPayrolls((prev) => {
      const exists = prev.some((row) => row.id === updatedPayroll.id);
      if (exists) {
        return prev.map((row) => (row.id === updatedPayroll.id ? updatedPayroll : row));
      }
      return [...prev, updatedPayroll];
    });
  };

  const createOrUpdatePayroll = async (row, payload) => {
    if (row.payrollId) {
      return teacherApi.updatePayroll(row.payrollId, payload);
    }
    return teacherApi.createPayroll({
      teacherId: row.teacherId,
      periodMonth: month,
      baseSalary: row.baseSalary,
      allowances: row.allowances,
      deductions: row.deductions,
      bonuses: row.bonuses,
      status: payload.status,
      paidOn: payload.paidOn,
      paymentMethod: payload.paymentMethod ?? row.paymentMethod,
      transactionReference: payload.transactionReference,
      notes: payload.notes,
    });
  };

  const handleProcessPayment = async (row) => {
    if (!row || row.status === 'paid') return;
    setProcessingMap((prev) => ({ ...prev, [row.teacherId]: true }));
    try {
      const payload = {
        status: 'paid',
        paidOn: new Date().toISOString().split('T')[0],
      };
      const updated = await createOrUpdatePayroll(row, payload);
      replacePayrollInState(updated);
      toast({
        title: 'Payment processed',
        description: `${row.teacherName} marked as paid.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Failed to process payment',
        description: error?.message || 'Please try again.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setProcessingMap((prev) => {
        const next = { ...prev };
        delete next[row.teacherId];
        return next;
      });
    }
  };

  const openEdit = (row) => {
    setEditRow(row);
    setEditForm({
      baseSalary: Number(row.baseSalary ?? 0),
      allowances: Number(row.allowances ?? 0),
      deductions: Number(row.deductions ?? 0),
      bonuses: Number(row.bonuses ?? 0),
      status: row.status || 'pending',
      paidOn: row.paidOn || '',
      paymentMethod: row.paymentMethod || '',
      transactionReference: row.transactionReference || '',
      notes: row.notes || '',
    });
    editDisclosure.onOpen();
  };

  const closeEdit = () => {
    editDisclosure.onClose();
    setEditRow(null);
    setEditForm(null);
  };

  const updateEditField = (field, value) => {
    setEditForm((prev) => ({ ...(prev || {}), [field]: value }));
  };

  const editableTotalAmount = useMemo(() => {
    if (!editForm) return 0;
    return computeTotalAmount({
      baseSalary: editForm.baseSalary,
      allowances: editForm.allowances,
      deductions: editForm.deductions,
      bonuses: editForm.bonuses,
    });
  }, [editForm, computeTotalAmount]);

  const handleEditSubmit = async (e) => {
    e?.preventDefault();
    if (!editRow || !editForm) return;
    setSavingEdit(true);
    try {
      const payload = {
        baseSalary: Number(editForm.baseSalary ?? 0),
        allowances: Number(editForm.allowances ?? 0),
        deductions: Number(editForm.deductions ?? 0),
        bonuses: Number(editForm.bonuses ?? 0),
        status: editForm.status,
        paidOn: editForm.paidOn || null,
        paymentMethod: editForm.paymentMethod || null,
        transactionReference: editForm.transactionReference || null,
        notes: editForm.notes || null,
      };
      const updated = await createOrUpdatePayroll(editRow, payload);
      replacePayrollInState(updated);
      toast({ title: 'Payroll updated', status: 'success', duration: 3000, isClosable: true });
      closeEdit();
    } catch (error) {
      console.error(error);
      toast({ title: 'Failed to update payroll', description: error?.message || 'Please try again.', status: 'error', duration: 4000, isClosable: true });
    } finally {
      setSavingEdit(false);
    }
  };

  const handleBulkProcess = async () => {
    const pendingRows = teacherRows.filter((row) => row.status === 'pending' || row.status === 'processing');
    if (!pendingRows.length) {
      toast({
        title: 'No pending payrolls',
        description: 'All payrolls are already marked as paid.',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setBulkProcessing(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const results = await Promise.all(
        pendingRows.map((row) =>
          createOrUpdatePayroll(row, {
            status: 'paid',
            paidOn: today,
          })
        )
      );
      setPayrolls((prev) => {
        const map = new Map(prev.map((row) => [row.id, row]));
        results.forEach((item) => {
          if (item?.id) {
            map.set(item.id, item);
          }
        });
        return Array.from(map.values());
      });
      toast({
        title: 'Bulk payment processed',
        description: `${pendingRows.length} payroll${pendingRows.length > 1 ? 's' : ''} updated successfully.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Bulk processing failed',
        description: error?.message || 'Please try again.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setBulkProcessing(false);
    }
  };

  const openPayslip = (row) => {
    setPayslipRow(row);
    payslipDisclosure.onOpen();
  };

  const handleDownloadPayslip = async (row) => {
    try {
      let schoolName = 'School Management System';
      let schoolAddress = '';
      let schoolPhone = '';
      try {
        const profile = await settingsApi.getSchoolProfile();
        if (profile) {
          schoolName = profile.schoolName || schoolName;
          schoolAddress = profile.address || '';
          schoolPhone = profile.phone || '';
        }
      } catch (_) {}

      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const margin = 20;
      const contentW = pageW - margin * 2;
      let yPos = margin;

      // ── Blue header bar ──
      doc.setFillColor(41, 98, 255);
      doc.rect(0, 0, pageW, 32, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(schoolName, margin, 13);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      if (schoolAddress) doc.text(schoolAddress, margin, 19);
      if (schoolPhone) doc.text(`Tel: ${schoolPhone}`, margin, 24);

      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('SALARY SLIP', pageW - margin, 18, { align: 'right' });

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(monthLabel(month), pageW - margin, 24, { align: 'right' });

      yPos = 38;

      // ── Employee Details ──
      doc.setFontSize(10);
      doc.setTextColor(41, 98, 255);
      doc.setFont('helvetica', 'bold');
      doc.text('EMPLOYEE DETAILS', margin, yPos);
      yPos += 2;

      doc.setDrawColor(41, 98, 255);
      doc.setLineWidth(0.5);
      doc.line(margin, yPos, margin + contentW, yPos);
      yPos += 4;

      const empDetails = [
        ['Employee Name', row.teacherName],
        ['Employee ID', row.employeeId || `#${row.teacherId}`],
        ['Designation', row.designation || '—'],
        ['Department', row.department],
        ['Pay Period', monthLabel(month)],
        ['Payment Method', row.paymentMethod || '—'],
        ['Status', formatStatus(row.status)],
      ];

      autoTable(doc, {
        startY: yPos,
        body: empDetails,
        theme: 'plain',
        styles: { cellPadding: 2.5, fontSize: 9.5, textColor: 50 },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 45, textColor: 100 },
          1: { cellWidth: contentW - 45 },
        },
        margin: { left: margin, right: margin },
      });

      yPos = doc.lastAutoTable.finalY + 8;

      // ── Earnings ──
      doc.setFontSize(10);
      doc.setTextColor(34, 197, 94);
      doc.setFont('helvetica', 'bold');
      doc.text('EARNINGS', margin, yPos);
      yPos += 2;
      doc.setDrawColor(34, 197, 94);
      doc.line(margin, yPos, margin + contentW / 2 - 5, yPos);
      yPos += 4;

      const earnings = [
        ['Basic Salary', formatAmount(row.baseSalary)],
        ['Allowances', formatAmount(row.allowances)],
        ['Bonuses', formatAmount(row.bonuses)],
        ['Total Earnings', formatAmount(Number(row.baseSalary) + Number(row.allowances) + Number(row.bonuses))],
      ];

      autoTable(doc, {
        startY: yPos,
        body: earnings,
        theme: 'plain',
        styles: { cellPadding: 2.5, fontSize: 9.5, textColor: 50 },
        columnStyles: {
          0: { cellWidth: 50, textColor: 100 },
          1: { halign: 'right', cellWidth: contentW / 2 - 55 },
        },
        margin: { left: margin },
      });

      const earningsEndY = doc.lastAutoTable.finalY;

      // ── Deductions (right column) ──
      const dedX = margin + contentW / 2 + 5;
      const dedW = contentW / 2 - 5;

      doc.setFontSize(10);
      doc.setTextColor(239, 68, 68);
      doc.setFont('helvetica', 'bold');
      doc.text('DEDUCTIONS', dedX, yPos - 6);
      doc.setDrawColor(239, 68, 68);
      doc.line(dedX, yPos - 4, dedX + dedW, yPos - 4);

      const deductions = [
        ['Total Deductions', formatAmount(row.deductions)],
      ];

      autoTable(doc, {
        startY: yPos,
        body: deductions,
        theme: 'plain',
        styles: { cellPadding: 2.5, fontSize: 9.5, textColor: 50 },
        columnStyles: {
          0: { cellWidth: 50, textColor: 100 },
          1: { halign: 'right', cellWidth: dedW - 55 },
        },
        margin: { left: dedX },
      });

      yPos = Math.max(earningsEndY, doc.lastAutoTable.finalY) + 8;

      // ── Net Pay Box ──
      doc.setFillColor(41, 98, 255);
      doc.roundedRect(margin, yPos, contentW, 16, 2, 2, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('NET PAY', margin + 8, yPos + 10);
      doc.text(formatAmount(row.totalAmount), margin + contentW - 8, yPos + 10, { align: 'right' });

      yPos += 22;

      if (row.paidOn) {
        doc.setTextColor(100);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(`Payment Date: ${new Date(row.paidOn).toLocaleDateString()}`, margin, yPos);
        if (row.transactionReference) {
          doc.text(`Transaction Ref: ${row.transactionReference}`, margin + 80, yPos);
        }
        yPos += 6;
      }

      // ── Signature Lines ──
      yPos = Math.max(yPos + 10, pageH - 50);
      doc.setDrawColor(180);
      doc.setLineWidth(0.3);

      const sigW = contentW / 3;
      const sigLabels = ['Prepared By', 'Approved By', 'Employee Signature'];
      sigLabels.forEach((label, i) => {
        const sx = margin + sigW * i + 10;
        doc.line(sx, yPos, sx + 50, yPos);
        doc.setFontSize(8);
        doc.setTextColor(130);
        doc.setFont('helvetica', 'normal');
        doc.text(label, sx + 25, yPos + 5, { align: 'center' });
      });

      // ── Footer ──
      doc.setFontSize(7);
      doc.setTextColor(160);
      doc.setFont('helvetica', 'italic');
      doc.text('This is a computer-generated payslip and does not require a physical signature unless specified.', pageW / 2, pageH - 12, { align: 'center' });
      doc.text(schoolName, pageW / 2, pageH - 8, { align: 'center' });

      doc.save(`payslip_${row.teacherName?.replace(/\s+/g, '_')}_${month}.pdf`);
      toast({ title: 'Payslip generated', status: 'success', duration: 2000, isClosable: true });
    } catch (error) {
      console.error('PDF Generation Error:', error);
      toast({ title: 'Failed to generate PDF', status: 'error', duration: 3000, isClosable: true });
    }
  };

  const handlePrintReport = async () => {
    try {
      let schoolName = 'School Management System';
      let schoolAddress = '';
      let schoolPhone = '';
      let schoolLogo = null;
      try {
        const profile = await settingsApi.getSchoolProfile();
        if (profile) {
          schoolName = profile.schoolName || schoolName;
          schoolAddress = profile.address || '';
          schoolPhone = profile.phone || '';
          schoolLogo = profile.logoUrl || null;
        }
      } catch (_) {}

      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const margin = 14;
      const contentW = pageW - margin * 2;

      // ── Header ──
      let yPos = margin;
      doc.setFillColor(41, 98, 255);
      doc.rect(0, 0, pageW, 28, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(schoolName, margin, 12);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      if (schoolAddress) doc.text(schoolAddress, margin, 18);
      if (schoolPhone) doc.text(`Tel: ${schoolPhone}`, margin, 23);

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`Salary Report — ${monthLabel(month)}`, pageW - margin, 16, { align: 'right' });

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, pageW - margin, 23, { align: 'right' });

      yPos = 34;

      // ── Summary Cards ──
      doc.setFillColor(245, 247, 250);
      doc.roundedRect(margin, yPos, contentW, 18, 2, 2, 'F');

      const cardW = contentW / 3;
      const summaryItems = [
        { label: 'Total Budget', value: formatAmount(stats.totalBudget) },
        { label: 'Processed', value: String(stats.processed) },
        { label: 'Pending', value: String(stats.pending) },
      ];
      summaryItems.forEach((item, i) => {
        const cx = margin + cardW * i + cardW / 2;
        doc.setFontSize(8);
        doc.setTextColor(120);
        doc.setFont('helvetica', 'normal');
        doc.text(item.label, cx, yPos + 6, { align: 'center' });
        doc.setFontSize(12);
        doc.setTextColor(30);
        doc.setFont('helvetica', 'bold');
        doc.text(item.value, cx, yPos + 13, { align: 'center' });
      });

      yPos += 24;

      // ── Table ──
      const tableHead = [['#', 'Teacher', 'Emp. ID', 'Designation', 'Department', 'Basic Salary', 'Allowances', 'Deductions', 'Bonuses', 'Total Amount', 'Status', 'Paid On']];
      const tableBody = filteredRows.map((r, idx) => [
        idx + 1,
        r.teacherName,
        r.employeeId || `#${r.teacherId}`,
        r.designation || '—',
        r.department,
        formatAmount(r.baseSalary),
        formatAmount(r.allowances),
        formatAmount(r.deductions),
        formatAmount(r.bonuses),
        formatAmount(r.totalAmount),
        formatStatus(r.status),
        r.paidOn ? new Date(r.paidOn).toLocaleDateString() : '—',
      ]);

      autoTable(doc, {
        startY: yPos,
        head: tableHead,
        body: tableBody,
        theme: 'striped',
        headStyles: {
          fillColor: [41, 98, 255],
          textColor: 255,
          fontSize: 8,
          fontStyle: 'bold',
          halign: 'center',
          cellPadding: 3,
        },
        bodyStyles: { fontSize: 7.5, cellPadding: 2.5 },
        columnStyles: {
          0: { halign: 'center', cellWidth: 10 },
          5: { halign: 'right' },
          6: { halign: 'right' },
          7: { halign: 'right' },
          8: { halign: 'right' },
          9: { halign: 'right', fontStyle: 'bold' },
          10: { halign: 'center' },
        },
        alternateRowStyles: { fillColor: [245, 247, 250] },
        margin: { left: margin, right: margin },
        didDrawPage: (data) => {
          // Footer on every page
          doc.setFontSize(7);
          doc.setTextColor(150);
          doc.setFont('helvetica', 'normal');
          doc.text('This is a computer-generated report and does not require a signature.', pageW / 2, pageH - 8, { align: 'center' });
          doc.text(`Page ${data.pageNumber}`, pageW - margin, pageH - 8, { align: 'right' });
          doc.text(schoolName, margin, pageH - 8);
        },
      });

      doc.save(`salary_report_${month}.pdf`);
      toast({ title: 'Report generated', status: 'success', duration: 2000, isClosable: true });
    } catch (error) {
      console.error('Report PDF Error:', error);
      toast({ title: 'Failed to generate report', status: 'error', duration: 3000, isClosable: true });
    }
  };

  const handleExportCSV = () => {
    const headers = ['Teacher', 'Employee ID', 'Designation', 'Department', 'Basic Salary', 'Allowances', 'Deductions', 'Bonuses', 'Total Amount', 'Status', 'Paid On'];
    const rows = filteredRows.map((r) => [
      r.teacherName,
      r.employeeId || '',
      r.designation || '',
      r.department,
      r.baseSalary,
      r.allowances,
      r.deductions,
      r.bonuses,
      r.totalAmount,
      formatStatus(r.status),
      r.paidOn || '',
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `salary_report_${month}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: 'CSV exported', status: 'success', duration: 2000, isClosable: true });
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      {/* Page Header */}
      <Flex mb={5} justifyContent="space-between" alignItems="center">
        <Box>
          <Heading as="h3" size="lg" mb={1}>Teacher Salary Management</Heading>
          <Text color={textColorSecondary}>Process and manage teacher salary payments</Text>
        </Box>
        <HStack>
          <Button
            leftIcon={<Icon as={MdLocalPrintshop} />}
            variant="outline"
            colorScheme="blue"
            size="md"
            onClick={handlePrintReport}
          >
            Print Report
          </Button>
          <Button
            leftIcon={<Icon as={MdFileDownload} />}
            colorScheme="blue"
            size="md"
            onClick={handleExportCSV}
          >
            Export Data
          </Button>
        </HStack>
      </Flex>

      {/* Month selector */}
      <Card mb={5}>
        <Flex p={4} direction={{ base: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ base: 'flex-start', md: 'center' }} gap={4}>
          <Box>
            <FormControl>
              <FormLabel>Select Month</FormLabel>
              <Input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                w={{ base: 'full', md: '240px' }}
              />
            </FormControl>
          </Box>

          <Button
            colorScheme="green"
            size="md"
            onClick={handleBulkProcess}
            leftIcon={<Icon as={MdCheckCircle} />}
            isLoading={bulkProcessing}
            loadingText="Processing"
          >
            Process All Pending Payments
          </Button>
        </Flex>
      </Card>

      {/* Stats - redesigned */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5} mb={5}>
        <StatCard
          title='Total Salary Budget'
          value={formatAmount(stats.totalBudget)}
          subValue='Current month'
          icon={MdAttachMoney}
          colorScheme='green'
        />
        <StatCard
          title='Processed Payments'
          value={String(stats.processed)}
          subValue='Marked as paid'
          icon={MdCheckCircle}
          colorScheme='blue'
        />
        <StatCard
          title='Pending Payments'
          value={String(stats.pending)}
          subValue='Awaiting processing'
          icon={MdCalendarToday}
          colorScheme='orange'
        />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={5} mb={5}>
        <Card p='20px' gridColumn={{ base: 'auto', lg: 'span 2' }}>
          <Flex justify='space-between' align='center' mb='12px'>
            <Box>
              <Text fontSize='lg' fontWeight='bold'>Monthly Payout Trend</Text>
              <Text fontSize='sm' color={textColorSecondary}>Last 6 months</Text>
            </Box>
            <Badge colorScheme='blue'>{historyLoading ? 'Loading' : '6 months'}</Badge>
          </Flex>
          <LineChart
            height={chartH || 280}
            chartData={trendChart.series}
            chartOptions={{
              stroke: { curve: 'smooth', width: 3 },
              colors: ['#4318FF', '#22c55e'],
              xaxis: { categories: trendChart.categories },
              responsive: [
                {
                  breakpoint: 640,
                  options: {
                    xaxis: { labels: { rotate: -45, hideOverlappingLabels: true } },
                    legend: { position: 'bottom' },
                  },
                },
              ],
              tooltip: {
                shared: true,
                intersect: false,
                y: { formatter: (v) => formatAmount(v) },
              },
            }}
          />
        </Card>

        <Card p='20px'>
          <Flex justify='space-between' align='center' mb='12px'>
            <Box>
              <Text fontSize='lg' fontWeight='bold'>Payment Status</Text>
              <Text fontSize='sm' color={textColorSecondary}>For selected month</Text>
            </Box>
            <Badge colorScheme='purple'>Donut</Badge>
          </Flex>
          <DonutChart
            ariaLabel='Payroll status donut'
            height={chartH || 280}
            labels={statusDonut.labels}
            series={statusDonut.series}
            options={{
              colors: statusDonut.labels.length === 3
                ? ['#22c55e', '#60a5fa', '#f59e0b']
                : ['#22c55e', '#60a5fa'],
              legend: { position: 'bottom' },
            }}
          />
        </Card>
      </SimpleGrid>

      <Card p='20px' mb={5}>
        <Flex justify='space-between' align='center' mb='12px'>
          <Box>
            <Text fontSize='lg' fontWeight='bold'>Department-wise Payroll</Text>
            <Text fontSize='sm' color={textColorSecondary}>Top departments by total amount</Text>
          </Box>
          <Badge colorScheme='green'>Top 8</Badge>
        </Flex>
        <BarChart
          ariaLabel='Department payroll totals'
          height={chartH || 280}
          categories={departmentBar.categories}
          series={departmentBar.series}
          options={{
            colors: ['#4318FF'],
            plotOptions: { bar: { borderRadius: 8, columnWidth: '45%' } },
            tooltip: { y: { formatter: (v) => formatAmount(v) } },
            responsive: [
              {
                breakpoint: 640,
                options: {
                  legend: { position: 'bottom' },
                  plotOptions: { bar: { columnWidth: '65%' } },
                  xaxis: { labels: { rotate: -45, hideOverlappingLabels: true } },
                },
              },
            ],
          }}
        />
      </Card>

      {/* Salary Table */}
      <Card overflow="hidden">
        <Flex p={4} justifyContent="space-between" alignItems="center" borderBottomWidth={1} borderColor={borderColor}>
          <Text fontSize="lg" fontWeight="medium">Salary Details</Text>
          <InputGroup maxW="300px">
            <InputLeftElement pointerEvents="none">
              <Icon as={MdSearch} color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search by name or ID"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </InputGroup>
        </Flex>

        <Box overflowX="auto">
          <Table variant="simple">
            <Thead bg={tableHeaderBg}>
              <Tr>
                <Th>Teacher</Th>
                <Th>Designation</Th>
                <Th isNumeric>Basic Salary</Th>
                <Th isNumeric>Allowances</Th>
                <Th isNumeric>Deductions</Th>
                <Th isNumeric>Bonuses</Th>
                <Th isNumeric>Total Amount</Th>
                <Th>Paid On</Th>
                <Th>Status</Th>
                <Th>Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {payrollLoading || teachersLoading ? (
                <Tr>
                  <Td colSpan={10}>
                    <Flex align="center" justify="center" py={8}>
                      <Spinner size="sm" mr={3} />
                      <Text>Loading payrolls...</Text>
                    </Flex>
                  </Td>
                </Tr>
              ) : filteredRows.length === 0 ? (
                <Tr>
                  <Td colSpan={10}>
                    <Text textAlign="center" py={6} color={textColorSecondary}>
                      No payroll records found for the selected month.
                    </Text>
                  </Td>
                </Tr>
              ) : (
                filteredRows.map((row) => (
                  <Tr key={row.key}>
                    <Td>
                      <Box>
                        <Text fontWeight="medium">{row.teacherName}</Text>
                        <Text fontSize="sm" color={textColorSecondary}>
                          {row.employeeId || `Teacher #${row.teacherId}`}
                        </Text>
                      </Box>
                    </Td>
                    <Td>{row.designation || '—'}</Td>
                    <Td isNumeric>{formatAmount(row.baseSalary)}</Td>
                    <Td isNumeric>{formatAmount(row.allowances)}</Td>
                    <Td isNumeric>{formatAmount(row.deductions)}</Td>
                    <Td isNumeric>{formatAmount(row.bonuses)}</Td>
                    <Td isNumeric fontWeight="bold">{formatAmount(row.totalAmount)}</Td>
                    <Td>{row.paidOn ? new Date(row.paidOn).toLocaleDateString() : '—'}</Td>
                    <Td>
                      <Badge
                        colorScheme={statusColorMap[row.status] || 'gray'}
                        variant="solid"
                        borderRadius="full"
                        px={2}
                        py={1}
                      >
                        {formatStatus(row.status)}
                      </Badge>
                    </Td>
                    <Td>
                      <Menu>
                        <MenuButton
                          as={Button}
                          variant="ghost"
                          size="sm"
                          rightIcon={<Icon as={MdMoreVert} />}
                        >
                          Actions
                        </MenuButton>
                        <MenuList>
                          <MenuItem onClick={() => openEdit(row)}>Edit Details</MenuItem>
                          <MenuItem
                            onClick={() => handleProcessPayment(row)}
                            isDisabled={row.status === 'paid' || processingMap[row.teacherId]}
                          >
                            {processingMap[row.teacherId] ? 'Processing...' : 'Process Payment'}
                          </MenuItem>
                          <MenuItem onClick={() => openPayslip(row)}>View Payslip</MenuItem>
                          <MenuItem onClick={() => handleDownloadPayslip(row)}>Download Slip</MenuItem>
                        </MenuList>
                      </Menu>
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </Box>
      </Card>

      {/* Edit Payroll Modal */}
      <Modal isOpen={editDisclosure.isOpen} onClose={closeEdit} size="xl">
        <ModalOverlay />
        <ModalContent as="form" onSubmit={handleEditSubmit}>
          <ModalHeader>Edit Payroll Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {editForm && (
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl>
                  <FormLabel>Base Salary</FormLabel>
                  <Input type="number" min={0} value={editForm.baseSalary} onChange={(e) => updateEditField('baseSalary', Number(e.target.value))} />
                </FormControl>
                <FormControl>
                  <FormLabel>Allowances</FormLabel>
                  <Input type="number" min={0} value={editForm.allowances} onChange={(e) => updateEditField('allowances', Number(e.target.value))} />
                </FormControl>
                <FormControl>
                  <FormLabel>Deductions</FormLabel>
                  <Input type="number" min={0} value={editForm.deductions} onChange={(e) => updateEditField('deductions', Number(e.target.value))} />
                </FormControl>
                <FormControl>
                  <FormLabel>Bonuses</FormLabel>
                  <Input type="number" min={0} value={editForm.bonuses} onChange={(e) => updateEditField('bonuses', Number(e.target.value))} />
                </FormControl>

                <FormControl>
                  <FormLabel>Status</FormLabel>
                  <Select value={editForm.status} onChange={(e) => updateEditField('status', e.target.value)}>
                    {['pending', 'processing', 'paid', 'failed', 'cancelled'].map((s) => (
                      <option key={s} value={s}>{formatStatus(s)}</option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Paid On</FormLabel>
                  <Input type="date" value={editForm.paidOn || ''} onChange={(e) => updateEditField('paidOn', e.target.value)} />
                </FormControl>
                <FormControl>
                  <FormLabel>Payment Method</FormLabel>
                  <Input value={editForm.paymentMethod || ''} onChange={(e) => updateEditField('paymentMethod', e.target.value)} placeholder="e.g. Bank Transfer, Cash" />
                </FormControl>
                <FormControl>
                  <FormLabel>Transaction Reference</FormLabel>
                  <Input value={editForm.transactionReference || ''} onChange={(e) => updateEditField('transactionReference', e.target.value)} placeholder="Ref / Cheque / Txn ID" />
                </FormControl>
                <FormControl gridColumn={{ base: 'auto', md: 'span 2' }}>
                  <FormLabel>Notes</FormLabel>
                  <Textarea rows={3} value={editForm.notes || ''} onChange={(e) => updateEditField('notes', e.target.value)} />
                </FormControl>
                <FormControl gridColumn={{ base: 'auto', md: 'span 2' }}>
                  <FormLabel>Total Amount</FormLabel>
                  <Input isReadOnly value={formatAmount(editableTotalAmount)} />
                </FormControl>
              </SimpleGrid>
            )}
          </ModalBody>
          <ModalFooter>
            <HStack spacing={3}>
              <Button onClick={closeEdit} variant="ghost">Cancel</Button>
              <Button colorScheme="blue" type="submit" isLoading={savingEdit} loadingText="Saving">Save</Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Payslip Modal */}
      <Modal isOpen={payslipDisclosure.isOpen} onClose={() => { payslipDisclosure.onClose(); setPayslipRow(null); }} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader bgGradient='linear(to-r, blue.500, purple.500)' color='white' py={4}>Payslip</ModalHeader>
          <ModalCloseButton color='white' />
          <ModalBody id='payslip-content' py={6}>
            {payslipRow && (
              <Box>
                <Flex justify='space-between' align='center' mb={4} pb={4} borderBottomWidth={1} borderColor={borderColor}>
                  <Box>
                    <Text fontSize='xl' fontWeight='bold' color='blue.600'>SCHOOL MANAGEMENT SYSTEM</Text>
                    <Text fontSize='sm' color={textColorSecondary}>Teacher Salary Slip</Text>
                  </Box>
                  <Badge colorScheme={statusColorMap[payslipRow.status] || 'gray'} variant='solid' borderRadius='full' px={3} py={1} fontSize='sm'>
                    {formatStatus(payslipRow.status)}
                  </Badge>
                </Flex>
                <SimpleGrid columns={2} spacing={3} mb={4} pb={4} borderBottomWidth={1} borderColor={borderColor}>
                  <Box><Text fontSize='xs' color={textColorSecondary}>Employee Name</Text><Text fontWeight='600'>{payslipRow.teacherName}</Text></Box>
                  <Box><Text fontSize='xs' color={textColorSecondary}>Employee ID</Text><Text fontWeight='600'>{payslipRow.employeeId || `#${payslipRow.teacherId}`}</Text></Box>
                  <Box><Text fontSize='xs' color={textColorSecondary}>Designation</Text><Text fontWeight='600'>{payslipRow.designation || '—'}</Text></Box>
                  <Box><Text fontSize='xs' color={textColorSecondary}>Department</Text><Text fontWeight='600'>{payslipRow.department}</Text></Box>
                  <Box><Text fontSize='xs' color={textColorSecondary}>Pay Period</Text><Text fontWeight='600'>{monthLabel(month)}</Text></Box>
                  <Box><Text fontSize='xs' color={textColorSecondary}>Payment Method</Text><Text fontWeight='600'>{payslipRow.paymentMethod || '—'}</Text></Box>
                </SimpleGrid>
                <Box mb={4}>
                  <Text fontWeight='600' mb={2} color='blue.600'>Earnings</Text>
                  <SimpleGrid columns={2} spacing={2}>
                    <Flex justify='space-between'><Text fontSize='sm'>Basic Salary</Text><Text fontSize='sm' fontWeight='600'>{formatAmount(payslipRow.baseSalary)}</Text></Flex>
                    <Flex justify='space-between'><Text fontSize='sm'>Allowances</Text><Text fontSize='sm' fontWeight='600'>{formatAmount(payslipRow.allowances)}</Text></Flex>
                    <Flex justify='space-between'><Text fontSize='sm'>Bonuses</Text><Text fontSize='sm' fontWeight='600'>{formatAmount(payslipRow.bonuses)}</Text></Flex>
                    <Box />
                  </SimpleGrid>
                </Box>
                <Box mb={4}>
                  <Text fontWeight='600' mb={2} color='red.500'>Deductions</Text>
                  <Flex justify='space-between'><Text fontSize='sm'>Total Deductions</Text><Text fontSize='sm' fontWeight='600' color='red.500'>-{formatAmount(payslipRow.deductions)}</Text></Flex>
                </Box>
                <Flex justify='space-between' py={3} px={4} bg='blue.50' borderRadius='md' borderWidth={1} borderColor='blue.200'>
                  <Text fontWeight='bold' fontSize='lg'>Net Pay</Text>
                  <Text fontWeight='bold' fontSize='lg' color='blue.600'>{formatAmount(payslipRow.totalAmount)}</Text>
                </Flex>
                {payslipRow.paidOn && (
                  <Text fontSize='xs' color={textColorSecondary} mt={3}>Paid on: {new Date(payslipRow.paidOn).toLocaleDateString()}</Text>
                )}
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <HStack spacing={3}>
              <Button variant='ghost' onClick={() => { payslipDisclosure.onClose(); setPayslipRow(null); }}>Close</Button>
              <Button leftIcon={<Icon as={MdLocalPrintshop} />} colorScheme='blue' onClick={() => window.print()}>Print</Button>
              <Button leftIcon={<Icon as={MdFileDownload} />} colorScheme='green' onClick={() => payslipRow && handleDownloadPayslip(payslipRow)}>Download</Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default TeacherSalary;
