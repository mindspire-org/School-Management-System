import React, { useState, useEffect } from 'react';
import {
    Box,
    SimpleGrid,
    useColorModeValue,
    Button,
    useToast,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Badge,
    Text,
    Flex,
    Heading,
    Icon,
    Select,
    Input,
    HStack,
} from '@chakra-ui/react';
import { MdAdd, MdAttachMoney, MdDateRange, MdDownload } from 'react-icons/md';
import jsPDF from 'jspdf';
import Card from '../../../../../components/card/Card';
import { payrollApi } from '../../../../../services/moduleApis';
import { settingsApi } from '../../../../../services/api';
import { useAuth } from '../../../../../contexts/AuthContext';

export default function PayrollDashboard() {
    const { user, campusId } = useAuth();
    const toast = useToast();
    const [payrolls, setPayrolls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [slipLoadingId, setSlipLoadingId] = useState(null);
    const [monthFilter, setMonthFilter] = useState(() => {
        const d = new Date();
        return d.toISOString().slice(0, 7);
    });
    const [statusFilter, setStatusFilter] = useState('all');

    // Colors
    const textColor = useColorModeValue('secondaryGray.900', 'white');
    const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');

    useEffect(() => {
        fetchPayrolls();
    }, [campusId]);

    const fetchPayrolls = async () => {
        setLoading(true);
        try {
            const data = await payrollApi.list({ campusId });
            setPayrolls(data);
        } catch (error) {
            toast({
                title: 'Error fetching payrolls',
                description: error.response?.data?.error || 'Something went wrong',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleGeneratePayroll = async () => {
        try {
            const date = monthFilter ? new Date(`${monthFilter}-01T00:00:00`) : new Date();
            await payrollApi.generatePayroll(date.toLocaleString('default', { month: 'long' }), date.getFullYear(), campusId);
            toast({
                title: 'Payroll Generated',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            fetchPayrolls();
        } catch (error) {
            toast({
                title: 'Error generating payroll',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const formatMoney = (value) => {
        const n = Number(value ?? 0);
        return Number.isFinite(n) ? n.toLocaleString() : '0';
    };

    const formatDate = (d) => {
        if (!d) return '—';
        const dt = new Date(d);
        if (Number.isNaN(dt.getTime())) return String(d);
        return dt.toLocaleDateString();
    };

    const safeFilePart = (v) => String(v || '').replace(/[^a-z0-9\-_. ]/gi, '').trim().replace(/\s+/g, '_');

    const filteredPayrolls = payrolls.filter((p) => {
        if (statusFilter !== 'all' && String(p.status || '').toLowerCase() !== String(statusFilter).toLowerCase()) return false;
        if (!monthFilter) return true;
        const period = `${String(p.year).padStart(4, '0')}-${String(parseMonthToNumber(p.month) || '').padStart(2, '0')}`;
        return period === monthFilter;
    });

    const sumNet = filteredPayrolls.reduce((sum, p) => sum + Number(p.netSalary || 0), 0);
    const paidCount = filteredPayrolls.filter((p) => String(p.status || '').toLowerCase() === 'paid').length;
    const pendingCount = filteredPayrolls.filter((p) => String(p.status || '').toLowerCase() === 'pending').length;

    const buildReportPdf = async () => {
        const doc = new jsPDF({ unit: 'pt', format: 'a4' });
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 40;
        const rowH = 18;
        const now = new Date();

        let profile = null;
        try {
            profile = await settingsApi.getSchoolProfile();
        } catch (_) {
            profile = null;
        }

        const title = 'Payroll Report';
        const schoolName = profile?.name || 'School';
        const periodLabel = monthFilter || 'All Months';
        const statusLabel = statusFilter === 'all' ? 'All' : statusFilter;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text(schoolName, margin, 52);
        doc.setFontSize(13);
        doc.text(title, margin, 74);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(`Campus ID: ${campusId ?? '—'}`, margin, 94);
        doc.text(`Period: ${periodLabel}   |   Status: ${String(statusLabel).toUpperCase()}`, margin, 110);
        doc.text(`Generated: ${now.toLocaleString()}`, margin, 126);

        doc.setDrawColor(226, 232, 240);
        doc.line(margin, 140, pageWidth - margin, 140);

        doc.setFont('helvetica', 'bold');
        doc.text(`Total Net: ${Number(sumNet || 0).toLocaleString()}`, margin, 162);
        doc.text(`Paid: ${paidCount}`, margin + 200, 162);
        doc.text(`Pending: ${pendingCount}`, margin + 280, 162);
        doc.line(margin, 172, pageWidth - margin, 172);

        const cols = [
            { label: 'Employee', w: 170 },
            { label: 'Month', w: 70 },
            { label: 'Basic', w: 70 },
            { label: 'Allow', w: 60 },
            { label: 'Ded', w: 60 },
            { label: 'Net', w: 70 },
            { label: 'Status', w: 60 },
        ];

        const startX = margin;
        let y = 198;

        const drawHeader = () => {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            let x = startX;
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

        const rows = filteredPayrolls.slice().sort((a, b) => {
            const aKey = `${a.year}-${parseMonthToNumber(a.month) || 0}-${a.employeeName || ''}`;
            const bKey = `${b.year}-${parseMonthToNumber(b.month) || 0}-${b.employeeName || ''}`;
            return aKey < bKey ? 1 : -1;
        });

        for (const r of rows) {
            if (y > pageHeight - margin) {
                doc.addPage();
                y = 56;
                drawHeader();
            }
            let x = startX;
            const cells = [
                String(r.employeeName || '—').slice(0, 22),
                `${String(r.year || '').padStart(4, '0')}-${String(parseMonthToNumber(r.month) || '').padStart(2, '0')}`,
                String(Number(r.basicSalary || 0).toLocaleString()),
                String(Number(r.allowances || 0).toLocaleString()),
                String(Number(r.deductions || 0).toLocaleString()),
                String(Number(r.netSalary || 0).toLocaleString()),
                String(r.status || '').toUpperCase(),
            ];
            doc.setFontSize(9);
            cells.forEach((val, idx) => {
                doc.text(String(val), x, y);
                x += cols[idx].w;
            });
            y += rowH;
        }

        const filename = `Payroll_Report_${safeFilePart(periodLabel)}_${safeFilePart(statusLabel)}.pdf`;
        doc.save(filename);
    };

    function parseMonthToNumber(month) {
        const m = String(month || '').trim().toLowerCase();
        const map = {
            january: 1,
            february: 2,
            march: 3,
            april: 4,
            may: 5,
            june: 6,
            july: 7,
            august: 8,
            september: 9,
            october: 10,
            november: 11,
            december: 12,
        };
        return map[m] || null;
    }

    const buildPayslipPdf = ({ payroll, profile }) => {
        const doc = new jsPDF({ unit: 'pt', format: 'a4' });
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 40;
        const headerH = 78;
        const top = 32;

        const schoolName = profile?.name || 'School';
        const branch = profile?.branch || '';
        const session = profile?.session || '';
        const address = profile?.address || '';
        const phone = profile?.phone || '';
        const email = profile?.email || '';

        doc.setFillColor(22, 41, 74);
        doc.roundedRect(margin, top, pageWidth - margin * 2, headerH, 10, 10, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.text(schoolName, margin + 18, top + 30);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        const metaLine = [branch, session].filter(Boolean).join('  •  ');
        if (metaLine) doc.text(metaLine, margin + 18, top + 48);

        const rightX = pageWidth - margin - 18;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text('PAYSLIP', rightX, top + 30, { align: 'right' });
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(`${payroll?.month || ''} ${payroll?.year || ''}`.trim() || '—', rightX, top + 48, { align: 'right' });

        doc.setTextColor(30, 41, 59);
        let y = top + headerH + 26;

        const sectionW = pageWidth - margin * 2;
        doc.setDrawColor(226, 232, 240);
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(margin, y, sectionW, 110, 10, 10, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text('Employee Details', margin + 16, y + 22);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        const leftColX = margin + 16;
        const midColX = margin + sectionW / 2 + 10;

        doc.text(`Employee: ${payroll?.employeeName || '—'}`, leftColX, y + 44);
        doc.text(`Employee ID: ${payroll?.employeeId ?? '—'}`, leftColX, y + 62);
        doc.text(`Campus ID: ${payroll?.campusId ?? campusId ?? '—'}`, leftColX, y + 80);

        doc.text(`Status: ${payroll?.status || 'Pending'}`, midColX, y + 44);
        doc.text(`Payment Date: ${formatDate(payroll?.paymentDate)}`, midColX, y + 62);
        doc.text(`Generated On: ${formatDate(new Date())}`, midColX, y + 80);

        y = y + 110 + 18;

        doc.setFillColor(255, 255, 255);
        doc.roundedRect(margin, y, sectionW, 110, 10, 10, 'FD');
        doc.setDrawColor(226, 232, 240);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text('Payment Details', margin + 16, y + 22);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        const pm = payroll?.paymentMethod ? String(payroll.paymentMethod).toUpperCase() : '—';
        doc.text(`Method: ${pm}`, margin + 16, y + 44);
        doc.text(`Transaction Ref: ${payroll?.transactionReference || '—'}`, margin + 16, y + 62);
        const bankLine = [
            payroll?.bankName ? `Bank: ${payroll.bankName}` : null,
            payroll?.accountTitle ? `Title: ${payroll.accountTitle}` : null,
            payroll?.accountNumber ? `A/C: ${payroll.accountNumber}` : null,
            payroll?.iban ? `IBAN: ${payroll.iban}` : null,
            payroll?.chequeNumber ? `Cheque: ${payroll.chequeNumber}` : null,
        ].filter(Boolean).join('  •  ');
        doc.text(bankLine || '—', margin + 16, y + 80, { maxWidth: sectionW - 32 });

        y = y + 110 + 18;

        doc.setFillColor(255, 255, 255);
        doc.roundedRect(margin, y, sectionW, 160, 10, 10, 'FD');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text('Salary Breakdown', margin + 16, y + 22);

        const rowY = y + 44;
        const labelX = margin + 16;
        const valueX = margin + sectionW - 16;

        const line = (label, value, yy, bold = false) => {
            doc.setFont('helvetica', bold ? 'bold' : 'normal');
            doc.setFontSize(10);
            doc.text(label, labelX, yy);
            doc.text(String(value), valueX, yy, { align: 'right' });
        };

        line('Basic Salary', formatMoney(payroll?.basicSalary), rowY);
        line('Allowances', formatMoney(payroll?.allowances), rowY + 22);
        line('Deductions', formatMoney(payroll?.deductions), rowY + 44);

        doc.setDrawColor(226, 232, 240);
        doc.line(margin + 16, rowY + 58, margin + sectionW - 16, rowY + 58);
        line('Net Salary', formatMoney(payroll?.netSalary), rowY + 82, true);

        y = y + 160 + 18;

        doc.setFillColor(248, 250, 252);
        doc.roundedRect(margin, y, sectionW, 84, 10, 10, 'FD');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        const contact = [address, phone ? `Phone: ${phone}` : null, email ? `Email: ${email}` : null].filter(Boolean).join('  •  ');
        doc.text(contact || '—', margin + 16, y + 26, { maxWidth: sectionW - 32 });
        doc.text('This is a system-generated payslip.', margin + 16, y + 46);

        doc.setDrawColor(148, 163, 184);
        doc.line(margin + 16, y + 72, margin + 200, y + 72);
        doc.setFontSize(9);
        doc.text('Authorized Signature', margin + 16, y + 82);

        return doc;
    };

    const handleOpenSlip = async (id) => {
        setSlipLoadingId(id);
        try {
            const [payroll, profile] = await Promise.all([
                payrollApi.get(id),
                settingsApi.getSchoolProfile().catch(() => null),
            ]);

            const doc = buildPayslipPdf({ payroll, profile });
            const filename = `Payslip_${safeFilePart(payroll?.employeeName)}_${safeFilePart(payroll?.month)}_${safeFilePart(payroll?.year)}.pdf`;
            doc.save(filename);
        } catch (error) {
            toast({
                title: 'Error fetching salary slip',
                description: error.response?.data?.error || 'Something went wrong',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setSlipLoadingId(null);
        }
    };

    return (
        <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
            <Flex direction='column'>
                <Flex
                    mt='45px'
                    mb='20px'
                    justifyContent='space-between'
                    direction={{ base: 'column', md: 'row' }}
                    align={{ base: 'start', md: 'center' }}
                >
                    <Heading color={textColor} fontSize='2xl' mb={{ base: '10px', md: '0px' }}>
                        Payroll Management
                    </Heading>
                    <HStack spacing={3} mt={{ base: 3, md: 0 }}>
                        <Input
                            type='month'
                            value={monthFilter}
                            onChange={(e) => setMonthFilter(e.target.value)}
                            maxW='180px'
                        />
                        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} maxW='140px'>
                            <option value='all'>All</option>
                            <option value='Paid'>Paid</option>
                            <option value='Pending'>Pending</option>
                        </Select>
                        <Button
                            leftIcon={<Icon as={MdAttachMoney} />}
                            variant='brand'
                            onClick={handleGeneratePayroll}
                        >
                            Generate Payroll
                        </Button>
                        <Button
                            leftIcon={<Icon as={MdDownload} />}
                            variant='outline'
                            onClick={buildReportPdf}
                        >
                            Report (PDF)
                        </Button>
                    </HStack>
                </Flex>

                <SimpleGrid columns={{ base: 1, md: 3 }} gap='20px' mb='20px'>
                    <Card p='20px' align='center' direction='column' w='100%'>
                        <Flex direction='column' align='center'>
                            <Text fontSize='lg' color='gray.500' fontWeight='bold' mb='10px'>Total Salary Paid</Text>
                            <Text fontSize='3xl' color={textColor} fontWeight='700'>
                                ${sumNet.toLocaleString()}
                            </Text>
                        </Flex>
                    </Card>
                    <Card p='20px' align='center' direction='column' w='100%'>
                        <Flex direction='column' align='center'>
                            <Text fontSize='lg' color='gray.500' fontWeight='bold' mb='10px'>Paid Employees</Text>
                            <Text fontSize='3xl' color={textColor} fontWeight='700'>
                                {paidCount}
                            </Text>
                        </Flex>
                    </Card>
                    <Card p='20px' align='center' direction='column' w='100%'>
                        <Flex direction='column' align='center'>
                            <Text fontSize='lg' color='gray.500' fontWeight='bold' mb='10px'>Pending Payments</Text>
                            <Text fontSize='3xl' color={textColor} fontWeight='700'>
                                {pendingCount}
                            </Text>
                        </Flex>
                    </Card>
                </SimpleGrid>

                <Card p='20px' mb='20px'>
                    <Table variant='simple'>
                        <Thead>
                            <Tr>
                                <Th>ID</Th>
                                <Th>Employee</Th>
                                <Th>Month/Year</Th>
                                <Th>Basic</Th>
                                <Th>Net Salary</Th>
                                <Th>Status</Th>
                                <Th>Actions</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {loading ? (
                                <Tr><Td colSpan={7} textAlign="center">Loading...</Td></Tr>
                            ) : filteredPayrolls.length === 0 ? (
                                <Tr><Td colSpan={7} textAlign="center">No payroll records found</Td></Tr>
                            ) : (
                                filteredPayrolls.map((payroll) => (
                                    <Tr key={payroll.id}>
                                        <Td>{payroll.id}</Td>
                                        <Td>{payroll.employeeName}</Td>
                                        <Td>{payroll.month} {payroll.year}</Td>
                                        <Td>${Number(payroll.basicSalary).toLocaleString()}</Td>
                                        <Td fontWeight='bold'>${Number(payroll.netSalary).toLocaleString()}</Td>
                                        <Td>
                                            <Badge colorScheme={payroll.status === 'Paid' ? 'green' : 'orange'}>
                                                {payroll.status}
                                            </Badge>
                                        </Td>
                                        <Td>
                                            <Button
                                                size='sm'
                                                leftIcon={<MdDownload />}
                                                variant='ghost'
                                                isLoading={slipLoadingId === payroll.id}
                                                loadingText='Generating'
                                                onClick={() => handleOpenSlip(payroll.id)}
                                            >
                                                Slip
                                            </Button>
                                        </Td>
                                    </Tr>
                                ))
                            )}
                        </Tbody>
                    </Table>
                </Card>
            </Flex>
        </Box>
    );
}
