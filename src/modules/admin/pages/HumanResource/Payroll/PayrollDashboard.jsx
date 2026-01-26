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
            const date = new Date();
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
                    <Button
                        leftIcon={<Icon as={MdAttachMoney} />}
                        variant='brand'
                        onClick={handleGeneratePayroll}
                    >
                        Generate Monthly Payroll
                    </Button>
                </Flex>

                <SimpleGrid columns={{ base: 1, md: 3 }} gap='20px' mb='20px'>
                    <Card p='20px' align='center' direction='column' w='100%'>
                        <Flex direction='column' align='center'>
                            <Text fontSize='lg' color='gray.500' fontWeight='bold' mb='10px'>Total Salary Paid</Text>
                            <Text fontSize='3xl' color={textColor} fontWeight='700'>
                                ${payrolls.reduce((sum, p) => sum + Number(p.netSalary), 0).toLocaleString()}
                            </Text>
                        </Flex>
                    </Card>
                    <Card p='20px' align='center' direction='column' w='100%'>
                        <Flex direction='column' align='center'>
                            <Text fontSize='lg' color='gray.500' fontWeight='bold' mb='10px'>Paid Employees</Text>
                            <Text fontSize='3xl' color={textColor} fontWeight='700'>
                                {payrolls.filter(p => p.status === 'Paid').length}
                            </Text>
                        </Flex>
                    </Card>
                    <Card p='20px' align='center' direction='column' w='100%'>
                        <Flex direction='column' align='center'>
                            <Text fontSize='lg' color='gray.500' fontWeight='bold' mb='10px'>Pending Payments</Text>
                            <Text fontSize='3xl' color={textColor} fontWeight='700'>
                                {payrolls.filter(p => p.status === 'Pending').length}
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
                            ) : payrolls.length === 0 ? (
                                <Tr><Td colSpan={7} textAlign="center">No payroll records found</Td></Tr>
                            ) : (
                                payrolls.map((payroll) => (
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
