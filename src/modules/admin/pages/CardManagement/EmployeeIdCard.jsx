import React, { useState, useEffect } from 'react';
import {
    Box, Flex, Heading, Text, Button, useColorModeValue, SimpleGrid, Select, Checkbox, Table, Thead, Tbody, Tr, Th, Td,
    useToast, Spinner, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, useDisclosure, Badge
} from '@chakra-ui/react';
import { IconButton } from '@chakra-ui/react';
import { MdAdd, MdPrint, MdDownload, MdVisibility, MdEdit, MdDelete } from 'react-icons/md';
import Card from '../../../../components/card/Card';
import StatCard from '../../../../components/card/StatCard';
import { employeeApi, idCardTemplateApi, generatedIdCardApi } from '../../../../services/moduleApis';
import { useAuth } from '../../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function EmployeeIdCard() {
    const { campusId } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [generatedCards, setGeneratedCards] = useState([]);
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const { isOpen, onOpen, onClose } = useDisclosure();

    const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
    const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
    const [activeCard, setActiveCard] = useState(null);
    const [editStatus, setEditStatus] = useState('Generated');

    const textColorSecondary = useColorModeValue('gray.600', 'gray.400');

    useEffect(() => {
        fetchData();
    }, [campusId]);

    const asArray = (data) => {
        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.items)) return data.items;
        if (Array.isArray(data?.rows)) return data.rows;
        return [];
    };

    const formatDate = (d) => {
        if (!d) return '';
        const dt = new Date(d);
        if (Number.isNaN(dt.getTime())) return String(d);
        return dt.toISOString().slice(0, 10);
    };

    const buildPrintableHtml = ({ title, cards }) => {
        const safe = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
        const isLikelyImageUrl = (v) => {
            const s = String(v || '').trim();
            if (!s) return false;
            if (/^data:image\//i.test(s)) return true;
            if (/^https?:\/\//i.test(s)) return true;
            return false;
        };
        const toRgb = (hex) => {
            const h = String(hex || '').trim();
            const m = /^#?([0-9a-f]{6})$/i.exec(h);
            if (!m) return null;
            const n = parseInt(m[1], 16);
            return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
        };
        const rgba = (rgb, a) => (rgb ? `rgba(${rgb.r},${rgb.g},${rgb.b},${a})` : `rgba(128,90,213,${a})`);
        const initials = (name) => {
            const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
            const a = parts[0]?.[0] || '';
            const b = parts.length > 1 ? parts[parts.length - 1]?.[0] : '';

            return (a + b).toUpperCase();
        };

        const cardHtml = (c) => {
            const tpl = templates.find((t) => String(t.id) === String(c.templateId));
            const person = employees.find((e) => String(e.id) === String(c.employeeId));
            const fields = String(tpl?.fields || 'Photo, Name, ID, Designation, Department').split(',').map((f) => f.trim()).filter(Boolean);
            const bg = tpl?.bgColor || '#805AD5';
            const rgb = toRgb(bg);
            const accentSoft = rgba(rgb, 0.12);
            const accentMid = rgba(rgb, 0.88);
            const logo = isLikelyImageUrl(tpl?.logoUrl) ? tpl.logoUrl : '';
            const layoutClass = String(tpl?.layout || 'Horizontal').toLowerCase() === 'vertical' ? 'layout-vertical' : 'layout-horizontal';
            const photoUrl = person?.avatar || person?.photoUrl || person?.photo || person?.avatarUrl || '';
            const displayName = person?.name || c.personName || 'Unknown';

            const wantsPhoto = fields.some((f) => {
                const k = String(f).toLowerCase();
                return k.includes('photo') || k.includes('image') || k.includes('picture');
            });
            const wantsName = fields.some((f) => {
                const k = String(f).toLowerCase();
                return k === 'name' || k.includes('full name') || k.includes('employee name') || k.includes('staff name');
            });

            const maxFields = wantsPhoto ? 4 : 6;
            const displayFields = fields
                .filter((f) => {
                    const k = String(f).toLowerCase();
                    return !(k.includes('photo') || k.includes('image') || k.includes('picture') || k === 'name' || k.includes('full name') || k.includes('employee name') || k.includes('staff name'));
                })
                .slice(0, maxFields);

            const resolveValue = (label) => {
                const key = String(label || '').toLowerCase();
                if (key.includes('name')) return displayName;
                if (key === 'id' || key.includes('employee id') || key.includes('emp id') || key.includes('staff id') || key.includes('teacher id')) {
                    return person?.id ?? c.employeeId ?? '';
                }
                if (key.includes('designation') || key.includes('position') || key.includes('role')) {
                    return person?.designation || person?.position || person?.role || '';
                }
                if (key.includes('department')) return person?.department || '';
                if (key.includes('email')) return person?.email || '';
                if (key.includes('phone') || key.includes('mobile')) return person?.phone || person?.mobile || person?.contact || '';
                return '';
            };

            const rows = displayFields
                .map((f) => {
                    const value = resolveValue(f);
                    if (String(value || '').trim() === '') return '';
                    return `<div class="kv"><div class="k">${safe(f)}</div><div class="v">${safe(value)}</div></div>`;
                })
                .filter(Boolean)
                .join('');

            const noPhotoClass = wantsPhoto ? '' : ' no-photo';

            return `
                <div class="idcard ${layoutClass}${noPhotoClass}" style="--accent:${safe(bg)};--accentSoft:${safe(accentSoft)};--accentMid:${safe(accentMid)}">
                    <div class="top">
                        <div class="brand">
                            ${logo ? `<img class="logo" src="${safe(logo)}" />` : `<div class="logoPlaceholder"></div>`}
                            <div class="brandText">
                                <div class="brandName">${safe(tpl?.name || 'Employee ID Card')}</div>
                                <div class="brandSub">Staff Identification</div>
                            </div>
                        </div>
                        <div class="chip"></div>
                    </div>
                    <div class="mid">
                        ${wantsPhoto ? `
                        <div class="photoWrap">
                            ${photoUrl ? `<img class="photo" src="${safe(photoUrl)}" />` : `<div class="photoFallback">${safe(initials(displayName) || 'E')}</div>`}
                            <div class="rolePill">EMPLOYEE</div>
                        </div>
                        ` : ''}
                        <div class="details">
                            ${wantsName ? `<div class="name">${safe(displayName)}</div>` : ''}
                            <div class="grid">${rows}</div>
                        </div>
                    </div>
                    <div class="bottom">
                        <div class="meta">ID: <span class="mono">${safe(person?.id ?? c.employeeId ?? '')}</span></div>
                        <div class="meta">Generated: <span class="mono">${safe(formatDate(c.generatedDate))}</span></div>
                        <div class="status ${String(c.status || '').toLowerCase() === 'printed' ? 'ok' : 'pending'}">${safe(c.status || 'Generated')}</div>
                    </div>
                </div>
            `;
        };

        return `
            <html>
            <head>
                <meta charset="utf-8" />
                <title>${safe(title)}</title>
                <style>
                    *{box-sizing:border-box;font-family:Inter,Arial,Helvetica,sans-serif}
                    body{margin:0;padding:14px;background:#fff}
                    .sheet{display:flex;flex-wrap:wrap;gap:14px;align-items:flex-start}
                    .idcard{width:340px;height:215px;border-radius:14px;overflow:hidden;position:relative;background:#fff;box-shadow:0 10px 30px rgba(17,24,39,.12);border:1px solid rgba(17,24,39,.08)}
                    .idcard:before{content:'';position:absolute;inset:-40% -40% auto auto;width:240px;height:240px;background:var(--accentSoft);transform:rotate(25deg)}
                    .top{position:relative;display:flex;justify-content:space-between;align-items:center;padding:14px 14px 10px;background:linear-gradient(135deg,var(--accentMid),#111827)}
                    .brand{display:flex;align-items:center;gap:10px;color:#fff}
                    .logo{width:38px;height:38px;object-fit:contain;border-radius:10px;background:rgba(255,255,255,.92);padding:5px}
                    .logoPlaceholder{width:38px;height:38px;border-radius:10px;background:rgba(255,255,255,.22);border:1px solid rgba(255,255,255,.25)}
                    .brandName{font-weight:800;font-size:13px;letter-spacing:.2px;line-height:1.1}
                    .brandSub{font-size:11px;opacity:.9}
                    .chip{width:34px;height:26px;border-radius:6px;background:rgba(255,255,255,.22);border:1px solid rgba(255,255,255,.25)}
                    .mid{position:relative;display:flex;gap:12px;padding:12px 14px}
                    .photoWrap{width:92px;display:flex;flex-direction:column;align-items:center;gap:8px}
                    .photo,.photoFallback{width:86px;height:86px;border-radius:14px;object-fit:cover;border:2px solid var(--accent);background:#f3f4f6}
                    .photoFallback{display:flex;align-items:center;justify-content:center;font-weight:800;color:#111827}
                    .rolePill{font-size:10px;font-weight:700;padding:4px 10px;border-radius:999px;background:var(--accentSoft);color:#111827;border:1px solid rgba(17,24,39,.08)}
                    .details{flex:1;min-width:0}
                    .name{font-weight:900;font-size:14px;color:#111827;margin-bottom:8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
                    .grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:8px 10px}
                    .kv{padding:8px 10px;border-radius:10px;background:rgba(17,24,39,.03);border:1px solid rgba(17,24,39,.06);min-width:0}
                    .k{font-size:10px;color:#6b7280;font-weight:700;text-transform:uppercase;letter-spacing:.4px;margin-bottom:2px}
                    .v{font-size:12px;color:#111827;font-weight:700;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
                    .bottom{position:absolute;left:0;right:0;bottom:0;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 14px;background:linear-gradient(180deg,rgba(255,255,255,0),rgba(255,255,255,.96) 40%,#fff)}
                    .meta{font-size:10.5px;color:#374151}
                    .mono{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace}
                    .status{font-size:10px;font-weight:800;padding:5px 10px;border-radius:999px;border:1px solid rgba(17,24,39,.08);background:#fef3c7;color:#92400e}
                    .status.ok{background:#dcfce7;color:#166534}
                    .status.pending{background:#fef3c7;color:#92400e}

                    .idcard.layout-vertical .mid{flex-direction:column;gap:10px;padding:10px 14px}
                    .idcard.layout-vertical .photoWrap{width:100%;flex-direction:row;justify-content:flex-start;align-items:center;gap:10px}
                    .idcard.layout-vertical .photo,.idcard.layout-vertical .photoFallback{width:64px;height:64px;border-radius:12px}
                    .idcard.layout-vertical .rolePill{margin-left:auto}
                    .idcard.layout-vertical .name{font-size:13px;margin-bottom:6px}
                    .idcard.layout-vertical .grid{gap:6px 8px}
                    .idcard.layout-vertical .kv{padding:7px 9px;border-radius:9px}
                    .idcard.layout-vertical .v{font-size:11.5px}

                    .idcard.no-photo .mid{gap:0}

                    @page { size: A4; margin: 12mm; }
                    @media print{
                        body{padding:0}
                        .idcard{page-break-inside:avoid;break-inside:avoid}
                        *{-webkit-print-color-adjust:exact;print-color-adjust:exact}
                    }
                </style>
            </head>
            <body>
                <div class="sheet">${(cards || []).map(cardHtml).join('')}</div>
            </body>
            </html>
        `;
    };

    const printCards = async ({ cards, title }) => {
        const html = buildPrintableHtml({ title, cards });
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
            document.body.removeChild(iframe);
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

        iframe.onload = doPrint;
        setTimeout(doPrint, 500);

        try {
            await Promise.all((cards || []).map((c) => generatedIdCardApi.update(c.id, { status: 'Printed', campusId })));
            fetchData();
        } catch (_) {}
    };

    const handlePrintAll = async () => {
        if (!generatedCards.length) {
            toast({ title: 'No cards to print', status: 'info' });
            return;
        }
        await printCards({ cards: generatedCards, title: 'Employee ID Cards' });
    };

    const handleView = (card) => {
        setActiveCard(card);
        onViewOpen();
    };

    const handleEdit = (card) => {
        setActiveCard(card);
        setEditStatus(card?.status || 'Generated');
        onEditOpen();
    };

    const saveEdit = async () => {
        if (!activeCard) return;
        try {
            await generatedIdCardApi.update(activeCard.id, { status: editStatus, campusId });
            toast({ title: 'Card updated', status: 'success' });
            onEditClose();
            fetchData();
        } catch (e) {
            const msg = e?.response?.data?.error || e?.response?.data?.message || e?.message || 'Error updating card';
            toast({ title: 'Error updating card', description: msg, status: 'error' });
        }
    };

    const handleDelete = async (card) => {
        if (!card) return;
        if (!window.confirm('Delete this generated ID card?')) return;
        try {
            await generatedIdCardApi.delete(card.id);
            toast({ title: 'Card deleted', status: 'success' });
            fetchData();
        } catch (e) {
            const msg = e?.response?.data?.error || e?.response?.data?.message || e?.message || 'Error deleting card';
            toast({ title: 'Error deleting card', description: msg, status: 'error' });
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const errors = [];

            let employeesData = [];
            let templatesData = [];
            let cardsData = [];

            const formatErr = (e) => {
                const status = e?.response?.status;
                const msg =
                    e?.response?.data?.error ||
                    e?.response?.data?.message ||
                    e?.message ||
                    'Request failed';
                return status ? `${status}: ${msg}` : msg;
            };

            try {
                employeesData = await employeeApi.list({ campusId });
            } catch (e) {
                errors.push(`employees -> ${formatErr(e)}`);
            }

            try {
                templatesData = await idCardTemplateApi.list({ campusId, type: 'Employee' });
            } catch (e) {
                errors.push(`templates -> ${formatErr(e)}`);
            }

            try {
                cardsData = await generatedIdCardApi.list({ campusId, type: 'Employee' });
            } catch (e) {
                errors.push(`generated-cards -> ${formatErr(e)}`);
            }

            setEmployees(asArray(employeesData));
            setTemplates(asArray(templatesData));
            setGeneratedCards(asArray(cardsData));

            if (errors.length) {
                toast({
                    title: 'Error fetching data',
                    description: errors.join(' | '),
                    status: 'error',
                    duration: 9000,
                    isClosable: true,
                });
            }
        } catch (error) {
            const msg =
                error?.response?.data?.error ||
                error?.response?.data?.message ||
                error?.message ||
                'Error fetching data';
            toast({ title: 'Error fetching data', description: msg, status: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        if (!selectedTemplate || selectedEmployees.length === 0) {
            toast({ title: 'Please select a template and at least one employee', status: 'warning' });
            return;
        }

        try {
            const promises = selectedEmployees.map(employeeId =>
                generatedIdCardApi.create({
                    campusId,
                    employeeId,
                    templateId: selectedTemplate,
                    status: 'Generated',
                    generatedDate: new Date().toISOString().slice(0, 10),
                    type: 'Employee'
                })
            );
            await Promise.all(promises);
            toast({ title: 'ID Cards generated successfully', status: 'success' });
            fetchData();
            onClose();
            setSelectedEmployees([]);
            setSelectedTemplate('');
        } catch (error) {
            toast({ title: 'Error generating ID cards', status: 'error' });
        }
    };

    const toggleEmployee = (id) => {
        setSelectedEmployees(prev => prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]);
    };

    const stats = {
        total: generatedCards.length,
        printed: generatedCards.filter(c => c.status === 'Printed').length,
        pending: generatedCards.filter(c => c.status === 'Generated').length,
    };

    return (
        <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
            <Flex mb={5} justify="space-between" align="center" gap={3} flexWrap="wrap">
                <Box>
                    <Heading as="h3" size="lg" mb={1}>Employee ID Cards</Heading>
                    <Text color={textColorSecondary}>Generate and print employee ID cards</Text>
                </Box>
                <Flex gap={2}>
                    <Button leftIcon={<MdAdd />} colorScheme="blue" onClick={onOpen}>Generate Cards</Button>
                    <Button leftIcon={<MdPrint />} variant="outline" onClick={handlePrintAll}>Print All</Button>
                </Flex>
            </Flex>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={5} mb={5}>
                <StatCard title="Total Cards" value={stats.total} icon={MdAdd} colorScheme="purple" />
                <StatCard title="Printed" value={stats.printed} icon={MdPrint} colorScheme="green" />
                <StatCard title="Pending" value={stats.pending} icon={MdAdd} colorScheme="orange" />
            </SimpleGrid>

            <Card>
                <Heading size="md" mb={4} p={4}>Generated ID Cards</Heading>
                <Box overflowX="auto">
                    <Table variant="simple" size="sm">
                        <Thead>
                            <Tr>
                                <Th>ID Card #</Th>
                                <Th>Employee Name</Th>
                                <Th>Generated Date</Th>
                                <Th>Status</Th>
                                <Th>Actions</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {loading ? (
                                <Tr><Td colSpan={5} textAlign="center"><Spinner size="lg" my={5} /></Td></Tr>
                            ) : generatedCards.length === 0 ? (
                                <Tr><Td colSpan={5} textAlign="center">No ID cards generated yet</Td></Tr>
                            ) : generatedCards.map((card) => {
                                const employee = employees.find(e => e.id === card.employeeId);
                                return (
                                    <Tr key={card.id}>
                                        <Td>{card.id}</Td>
                                        <Td>{employee ? employee.name : 'Unknown Employee'}</Td>
                                        <Td>{card.generatedDate}</Td>
                                        <Td><Badge colorScheme={card.status === 'Printed' ? 'green' : 'orange'}>{card.status}</Badge></Td>
                                        <Td>
                                            <IconButton aria-label="View" icon={<MdVisibility />} size="sm" variant="ghost" onClick={() => handleView(card)} />
                                            <IconButton aria-label="Edit" icon={<MdEdit />} size="sm" variant="ghost" onClick={() => handleEdit(card)} />
                                            <IconButton aria-label="Print" icon={<MdPrint />} size="sm" variant="ghost" onClick={() => printCards({ cards: [card], title: `Employee ID Card #${card.id}` })} />
                                            <IconButton aria-label="Delete" icon={<MdDelete />} size="sm" variant="ghost" colorScheme="red" onClick={() => handleDelete(card)} />
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
                    <ModalHeader>Generate Employee ID Cards</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Select placeholder="Select Template" mb={4} value={selectedTemplate} onChange={(e) => setSelectedTemplate(e.target.value)}>
                            {templates.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </Select>
                        {templates.length === 0 && (
                            <Flex justify="space-between" align="center" mb={4}>
                                <Text fontSize="sm" color={textColorSecondary}>No templates found for this campus.</Text>
                                <Button size="sm" variant="outline" onClick={() => { onClose(); navigate('/admin/card-management/id-card-template'); }}>Create Template</Button>
                            </Flex>
                        )}
                        <Box maxHeight="300px" overflowY="auto">
                            <Table size="sm">
                                <Thead>
                                    <Tr>
                                        <Th><Checkbox isChecked={selectedEmployees.length === employees.length && employees.length > 0} onChange={(e) => setSelectedEmployees(e.target.checked ? employees.map(emp => emp.id) : [])} /></Th>
                                        <Th>Name</Th>
                                        <Th>Designation</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {employees.map(employee => (
                                        <Tr key={employee.id}>
                                            <Td><Checkbox isChecked={selectedEmployees.includes(employee.id)} onChange={() => toggleEmployee(employee.id)} /></Td>
                                            <Td>{employee.name}</Td>
                                            <Td>{employee.designation}</Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                        </Box>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
                        <Button colorScheme="blue" onClick={handleGenerate} isDisabled={!selectedTemplate || selectedEmployees.length === 0}>Generate</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Modal isOpen={isViewOpen} onClose={onViewClose} size="lg">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>View ID Card</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Box borderWidth="1px" borderRadius="md" p={4}>
                            <Text fontWeight="700">Card #{activeCard?.id}</Text>
                            <Text>Name: {employees.find(e => String(e.id) === String(activeCard?.employeeId))?.name || activeCard?.personName || 'Unknown'}</Text>
                            <Text>Designation: {employees.find(e => String(e.id) === String(activeCard?.employeeId))?.designation || ''}</Text>
                            <Text>Status: {activeCard?.status}</Text>
                            <Text>Generated: {formatDate(activeCard?.generatedDate)}</Text>
                        </Box>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onViewClose}>Close</Button>
                        <Button leftIcon={<MdPrint />} onClick={() => activeCard && printCards({ cards: [activeCard], title: `Employee ID Card #${activeCard.id}` })}>Print</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Modal isOpen={isEditOpen} onClose={onEditClose} size="md">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Edit Card</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Select value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
                            <option value="Generated">Generated</option>
                            <option value="Printed">Printed</option>
                            <option value="Issued">Issued</option>
                        </Select>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onEditClose}>Cancel</Button>
                        <Button colorScheme="blue" onClick={saveEdit}>Save</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
}
