import React, { useState, useEffect } from 'react';
import {
    Box, Flex, Heading, Text, Button, useColorModeValue, SimpleGrid, Select, Checkbox, Table, Thead, Tbody, Tr, Th, Td,
    useToast, Spinner, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, useDisclosure, Badge
} from '@chakra-ui/react';
import { MdAdd, MdPrint, MdVisibility, MdEdit, MdDelete } from 'react-icons/md';
import Card from '../../../../components/card/Card';
import StatCard from '../../../../components/card/StatCard';
import { studentApi, certificateTemplateApi, studentCertificateApi } from '../../../../services/moduleApis';
import { useAuth } from '../../../../contexts/AuthContext';

export default function StudentCertificate() {
    const { campusId } = useAuth();
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [students, setStudents] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [certificates, setCertificates] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const { isOpen, onOpen, onClose } = useDisclosure();

    const viewDisc = useDisclosure();
    const editDisc = useDisclosure();
    const [active, setActive] = useState(null);
    const [editForm, setEditForm] = useState({ id: '', templateId: '', status: 'Issued', issueDate: '' });

    const textColorSecondary = useColorModeValue('gray.600', 'gray.400');

    const asArray = (data) => {
        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.items)) return data.items;
        if (Array.isArray(data?.rows)) return data.rows;
        return [];
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this certificate?')) return;
        try {
            await studentCertificateApi.delete(id);
            toast({ title: 'Certificate deleted', status: 'success' });
            fetchData();
        } catch (error) {
            toast({ title: 'Error deleting certificate', status: 'error' });
        }
    };

    const openView = (cert) => {
        setActive(cert);
        viewDisc.onOpen();
    };

    const openEdit = (cert) => {
        setActive(cert);
        setEditForm({
            id: cert?.id,
            templateId: cert?.templateId || '',
            status: cert?.status || 'Issued',
            issueDate: cert?.issueDate || new Date().toISOString().slice(0, 10),
        });
        editDisc.onOpen();
    };

    const handleUpdate = async () => {
        if (!active?.id) return;
        try {
            const payload = {
                campusId,
                templateId: editForm.templateId,
                status: editForm.status,
                issueDate: editForm.issueDate,
            };
            await studentCertificateApi.update(active.id, payload);
            toast({ title: 'Certificate updated', status: 'success' });
            editDisc.onClose();
            fetchData();
        } catch (error) {
            toast({ title: 'Error updating certificate', status: 'error' });
        }
    };

    const escapeHtml = (s) => String(s ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    const buildPrintableHtml = ({ cert, student, template }) => {
        const layout = String(template?.layout || 'Landscape').toLowerCase();
        const pageSize = layout === 'portrait' ? 'A4 portrait' : 'A4 landscape';
        const bg = template?.bgColor || '#ffffff';
        const logoUrl = template?.logoUrl || '';
        const title = template?.title || 'Certificate';
        const footer = template?.footerText || '';
        const issueDate = cert?.issueDate || '';

        const showBorder = template?.showBorder !== false;
        const borderColor = template?.borderColor || '#111111';
        const borderWidth = Number(template?.borderWidth ?? 2) || 2;
        const borderStyle = template?.borderStyle || 'solid';
        const borderRadius = Number(template?.borderRadius ?? 14) || 14;

        const backgroundImageUrl = template?.backgroundImageUrl || '';
        const backgroundImageOpacity = Number(template?.backgroundImageOpacity ?? 0.2);
        const watermarkText = template?.watermarkText || '';
        const watermarkImageUrl = template?.watermarkImageUrl || '';
        const watermarkOpacity = Number(template?.watermarkOpacity ?? 0.08);
        const watermarkRotate = Number(template?.watermarkRotate ?? -25);

        const fontFamily = template?.fontFamily || 'Georgia, serif';
        const titleFontFamily = template?.titleFontFamily || fontFamily;
        const titleFontSize = Number(template?.titleFontSize ?? 34) || 34;
        const bodyFontSize = Number(template?.bodyFontSize ?? 18) || 18;
        const footerFontSize = Number(template?.footerFontSize ?? 14) || 14;

        const signature1Name = template?.signature1Name || '';
        const signature1Title = template?.signature1Title || '';
        const signature1ImageUrl = template?.signature1ImageUrl || '';
        const signature2Name = template?.signature2Name || '';
        const signature2Title = template?.signature2Title || '';
        const signature2ImageUrl = template?.signature2ImageUrl || '';

        const showSerial = template?.showSerial !== false;
        const serialPrefix = template?.serialPrefix || 'CERT-';
        const serialPadding = Number(template?.serialPadding ?? 6) || 6;
        const serialNo = showSerial
            ? `${serialPrefix}${String(cert?.id ?? '').padStart(serialPadding, '0')}`
            : '';

        const placeholders = {
            name: student?.name || cert?.personName || 'Student',
            class: student?.class || '',
            section: student?.section || '',
            date: issueDate,
            serial: serialNo,
        };

        const rawBody = template?.bodyText || '';
        const body = Object.keys(placeholders).reduce((acc, key) => {
            return acc.replace(new RegExp(`\\{${key}\\}`, 'g'), String(placeholders[key] ?? ''));
        }, rawBody);

        return `<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>${escapeHtml(title)}</title>
  <style>
    @page { size: ${pageSize}; margin: 0; }
    html, body { width: 100%; height: 100%; margin: 0; }
    body { font-family: ${escapeHtml(fontFamily)}; }
    .page { width: 100%; height: 100%; display:flex; align-items:center; justify-content:center; background: ${escapeHtml(bg)}; }
    .card {
      position: relative;
      width: 92%;
      height: 86%;
      border: ${showBorder ? `${borderWidth}px ${escapeHtml(borderStyle)} ${escapeHtml(borderColor)}` : 'none'};
      border-radius: ${borderRadius}px;
      padding: 36px;
      box-sizing: border-box;
      background: rgba(255,255,255,0.88);
      overflow: hidden;
    }
    .bgImg {
      position:absolute;
      inset:0;
      background-image: url('${escapeHtml(backgroundImageUrl)}');
      background-size: cover;
      background-position: center;
      opacity: ${Number.isFinite(backgroundImageOpacity) ? backgroundImageOpacity : 0.2};
      z-index:0;
      pointer-events:none;
    }
    .wmText {
      position:absolute;
      inset:0;
      display:flex;
      align-items:center;
      justify-content:center;
      font-size: 64px;
      font-weight: 700;
      letter-spacing: 3px;
      opacity: ${Number.isFinite(watermarkOpacity) ? watermarkOpacity : 0.08};
      transform: rotate(${Number.isFinite(watermarkRotate) ? watermarkRotate : -25}deg);
      z-index: 1;
      pointer-events:none;
      color: #111;
      text-transform: uppercase;
    }
    .wmImg {
      position:absolute;
      inset:0;
      display:flex;
      align-items:center;
      justify-content:center;
      opacity: ${Number.isFinite(watermarkOpacity) ? watermarkOpacity : 0.08};
      transform: rotate(${Number.isFinite(watermarkRotate) ? watermarkRotate : -25}deg);
      z-index: 1;
      pointer-events:none;
    }
    .wmImg img { max-width: 520px; max-height: 520px; object-fit: contain; }
    .content { position: relative; z-index: 2; height: 100%; display:flex; flex-direction:column; }
    .top { display:flex; align-items:center; justify-content:space-between; gap: 16px; }
    .logo { width: 90px; height: 90px; object-fit: contain; }
    .title { text-align:center; font-family: ${escapeHtml(titleFontFamily)}; font-size: ${titleFontSize}px; font-weight: 800; margin: 8px 0 18px; }
    .body { font-size: ${bodyFontSize}px; line-height: 1.6; white-space: pre-wrap; margin-top: 8px; }
    .meta { margin-top: 18px; font-size: 14px; color:#333; display:flex; justify-content:space-between; }
    .signRow { margin-top: auto; display:flex; justify-content:space-between; gap: 24px; padding-top: 26px; }
    .sig { width: 40%; text-align:center; }
    .sigImg { height: 48px; object-fit: contain; display:block; margin: 0 auto 6px; }
    .sigLine { border-top: 1px solid #333; margin-top: 8px; padding-top: 8px; font-size: 13px; }
    .sigName { font-weight: 700; }
    .sigTitle { font-size: 12px; color: #333; }
    .footer { margin-top: 10px; text-align:center; font-size: ${footerFontSize}px; color:#333; white-space: pre-wrap; }
  </style>
</head>
<body>
  <div class="page">
    <div class="card">
      ${backgroundImageUrl ? `<div class="bgImg"></div>` : ''}
      ${watermarkImageUrl ? `<div class="wmImg"><img src="${escapeHtml(watermarkImageUrl)}" alt="watermark"/></div>` : ''}
      ${!watermarkImageUrl && watermarkText ? `<div class="wmText">${escapeHtml(watermarkText)}</div>` : ''}

      <div class="content">
        <div class="top">
          ${logoUrl ? `<img class="logo" src="${escapeHtml(logoUrl)}" alt="logo"/>` : '<div></div>'}
          <div style="flex:1"></div>
          <div style="text-align:right; font-size: 14px; color:#333;">
            ${showSerial && serialNo ? `Serial: ${escapeHtml(serialNo)}<br/>` : ''}
            Issued: ${escapeHtml(issueDate)}
          </div>
        </div>
        <div class="title">${escapeHtml(title)}</div>
        <div class="body">${escapeHtml(body)}</div>
        <div class="meta">
          <div>Student: <strong>${escapeHtml(placeholders.name)}</strong></div>
          <div>${escapeHtml(placeholders.class ? `Class: ${placeholders.class}` : '')} ${escapeHtml(placeholders.section ? `Section: ${placeholders.section}` : '')}</div>
        </div>

        ${(signature1Name || signature1Title || signature1ImageUrl || signature2Name || signature2Title || signature2ImageUrl) ? `
          <div class="signRow">
            <div class="sig">
              ${signature1ImageUrl ? `<img class="sigImg" src="${escapeHtml(signature1ImageUrl)}" alt="signature1"/>` : ''}
              <div class="sigLine">
                ${signature1Name ? `<div class="sigName">${escapeHtml(signature1Name)}</div>` : ''}
                ${signature1Title ? `<div class="sigTitle">${escapeHtml(signature1Title)}</div>` : ''}
              </div>
            </div>
            <div class="sig">
              ${signature2ImageUrl ? `<img class="sigImg" src="${escapeHtml(signature2ImageUrl)}" alt="signature2"/>` : ''}
              <div class="sigLine">
                ${signature2Name ? `<div class="sigName">${escapeHtml(signature2Name)}</div>` : ''}
                ${signature2Title ? `<div class="sigTitle">${escapeHtml(signature2Title)}</div>` : ''}
              </div>
            </div>
          </div>
        ` : ''}

        ${footer ? `<div class="footer">${escapeHtml(footer)}</div>` : ''}
      </div>
    </div>
  </div>
  <script>
    window.onload = () => { window.print(); };
  </script>
</body>
</html>`;
    };

    const printCertificate = (cert) => {
        const student = students.find((s) => String(s.id) === String(cert.studentId));
        const template = templates.find((t) => String(t.id) === String(cert.templateId));
        if (!template) {
            toast({ title: 'Template not found for this certificate', status: 'error' });
            return;
        }
        const html = buildPrintableHtml({ cert, student, template });
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        document.body.appendChild(iframe);
        const doc = iframe.contentWindow?.document;
        if (!doc) return;
        doc.open();
        doc.write(html);
        doc.close();
        setTimeout(() => {
            try { document.body.removeChild(iframe); } catch (_) { }
        }, 4000);
    };

    useEffect(() => {
        fetchData();
    }, [campusId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [studentsData, templatesData, certsData] = await Promise.all([
                studentApi.list({ campusId }),
                certificateTemplateApi.list({ campusId, type: 'Student' }),
                studentCertificateApi.list({ campusId })
            ]);
            setStudents(asArray(studentsData));
            setTemplates(asArray(templatesData));
            setCertificates(asArray(certsData));
        } catch (error) {
            toast({ title: 'Error fetching data', status: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        if (!selectedTemplate || selectedStudents.length === 0) {
            toast({ title: 'Please select a template and at least one student', status: 'warning' });
            return;
        }

        try {
            const promises = selectedStudents.map(studentId =>
                studentCertificateApi.create({
                    campusId,
                    studentId,
                    templateId: selectedTemplate,
                    status: 'Issued',
                    issueDate: new Date().toISOString().slice(0, 10),
                })
            );
            await Promise.all(promises);
            toast({ title: 'Certificates generated successfully', status: 'success' });
            fetchData();
            onClose();
            setSelectedStudents([]);
            setSelectedTemplate('');
        } catch (error) {
            toast({ title: 'Error generating certificates', status: 'error' });
        }
    };

    const toggleStudent = (id) => {
        setSelectedStudents(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
    };

    const stats = {
        total: certificates.length,
        thisMonth: certificates.filter(c => new Date(c.issueDate).getMonth() === new Date().getMonth()).length,
        pending: 0, // Assuming issued immediately for now
    };

    return (
        <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
            <Flex mb={5} justify="space-between" align="center" gap={3} flexWrap="wrap">
                <Box>
                    <Heading as="h3" size="lg" mb={1}>Student Certificates</Heading>
                    <Text color={textColorSecondary}>Generate certificates for students</Text>
                </Box>
                <Flex gap={2}>
                    <Button leftIcon={<MdAdd />} colorScheme="blue" onClick={onOpen}>Generate Certificate</Button>
                    <Button leftIcon={<MdPrint />} variant="outline" onClick={() => { if (certificates[0]) printCertificate(certificates[0]); }}>Print</Button>
                </Flex>
            </Flex>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={5} mb={5}>
                <StatCard title="Total Issued" value={stats.total} icon={MdAdd} colorScheme="blue" />
                <StatCard title="This Month" value={stats.thisMonth} icon={MdAdd} colorScheme="green" />
                <StatCard title="Pending" value={stats.pending} icon={MdAdd} colorScheme="orange" />
            </SimpleGrid>

            <Card>
                <Heading size="md" mb={4} p={4}>Issued Certificates</Heading>
                <Box overflowX="auto">
                    <Table variant="simple" size="sm">
                        <Thead>
                            <Tr>
                                <Th>Certificate ID</Th>
                                <Th>Student Name</Th>
                                <Th>Certificate Type</Th>
                                <Th>Issue Date</Th>
                                <Th>Status</Th>
                                <Th>Actions</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {loading ? (
                                <Tr><Td colSpan={6} textAlign="center"><Spinner size="lg" my={5} /></Td></Tr>
                            ) : certificates.length === 0 ? (
                                <Tr><Td colSpan={6} textAlign="center">No certificates issued yet</Td></Tr>
                            ) : certificates.map((cert) => {
                                const student = students.find(s => String(s.id) === String(cert.studentId));
                                const template = templates.find(t => String(t.id) === String(cert.templateId));
                                return (
                                    <Tr key={cert.id}>
                                        <Td>{cert.id}</Td>
                                        <Td>{student ? student.name : 'Unknown Student'}</Td>
                                        <Td>{template ? template.name : 'Unknown Template'}</Td>
                                        <Td>{cert.issueDate}</Td>
                                        <Td><Badge colorScheme="green">{cert.status}</Badge></Td>
                                        <Td>
                                            <Button size="sm" leftIcon={<MdVisibility />} mr={2} onClick={() => openView(cert)}>View</Button>
                                            <Button size="sm" leftIcon={<MdEdit />} mr={2} variant="outline" onClick={() => openEdit(cert)}>Edit</Button>
                                            <Button size="sm" leftIcon={<MdPrint />} mr={2} variant="outline" onClick={() => printCertificate(cert)}>Print</Button>
                                            <Button size="sm" leftIcon={<MdDelete />} colorScheme="red" variant="outline" onClick={() => handleDelete(cert.id)}>Delete</Button>
                                        </Td>
                                    </Tr>
                                );
                            })}
                        </Tbody>
                    </Table>
                </Box>
            </Card>

            <Modal isOpen={isOpen} onClose={onClose} size="xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Generate Student Certificates</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Select placeholder="Select Template" mb={4} value={selectedTemplate} onChange={(e) => setSelectedTemplate(e.target.value)}>
                            {templates.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </Select>
                        <Box maxHeight="300px" overflowY="auto">
                            <Table size="sm">
                                <Thead>
                                    <Tr>
                                        <Th><Checkbox isChecked={selectedStudents.length === students.length && students.length > 0} onChange={(e) => setSelectedStudents(e.target.checked ? students.map(s => s.id) : [])} /></Th>
                                        <Th>Name</Th>
                                        <Th>Class</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {students.map(student => (
                                        <Tr key={student.id}>
                                            <Td><Checkbox isChecked={selectedStudents.includes(student.id)} onChange={() => toggleStudent(student.id)} /></Td>
                                            <Td>{student.name}</Td>
                                            <Td>{student.class}</Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                        </Box>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
                        <Button colorScheme="blue" onClick={handleGenerate} isDisabled={!selectedTemplate || selectedStudents.length === 0}>Generate</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Modal isOpen={viewDisc.isOpen} onClose={viewDisc.onClose} size="xl" isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Certificate</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {active ? (
                            <Box>
                                <Text><strong>ID:</strong> {active.id}</Text>
                                <Text><strong>Student:</strong> {students.find((s) => String(s.id) === String(active.studentId))?.name || active.personName || 'Student'}</Text>
                                <Text><strong>Template:</strong> {templates.find((t) => String(t.id) === String(active.templateId))?.name || 'Template'}</Text>
                                <Text><strong>Status:</strong> {active.status}</Text>
                                <Text><strong>Issue Date:</strong> {active.issueDate}</Text>
                            </Box>
                        ) : null}
                    </ModalBody>
                    <ModalFooter>
                        <Button mr={3} onClick={viewDisc.onClose}>Close</Button>
                        {active ? (
                            <Button leftIcon={<MdPrint />} colorScheme="blue" onClick={() => printCertificate(active)}>Print</Button>
                        ) : null}
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Modal isOpen={editDisc.isOpen} onClose={editDisc.onClose} size="xl" isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Edit Certificate</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Select placeholder="Select Template" mb={4} value={editForm.templateId} onChange={(e) => setEditForm((p) => ({ ...p, templateId: e.target.value }))}>
                            {templates.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </Select>
                        <Select mb={4} value={editForm.status} onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value }))}>
                            <option value="Issued">Issued</option>
                            <option value="Printed">Printed</option>
                        </Select>
                        <Box>
                            <Text fontSize="sm" mb={1}>Issue Date</Text>
                            <input
                                type="date"
                                value={editForm.issueDate || ''}
                                onChange={(e) => setEditForm((p) => ({ ...p, issueDate: e.target.value }))}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E0' }}
                            />
                        </Box>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={editDisc.onClose}>Cancel</Button>
                        <Button colorScheme="blue" onClick={handleUpdate} isDisabled={!editForm.templateId}>Update</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
}
