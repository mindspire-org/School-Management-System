import React, { useEffect, useState } from 'react';
import {
  Box, Text, Flex, Button, ButtonGroup, SimpleGrid, Badge, Table,
  Thead, Tbody, Tr, Th, Td, TableContainer,
  Select, useToast,
  Modal, ModalOverlay, ModalContent,
  ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  FormControl, FormLabel, Input,
  useDisclosure, IconButton, Menu, MenuButton, MenuList, MenuItem, HStack, Portal
} from '@chakra-ui/react';

import { useNavigate } from 'react-router-dom';
// Custom components
import Card from '../../../../components/card/Card';
import MiniStatistics from '../../../../components/card/MiniStatistics';
import IconBox from '../../../../components/icons/IconBox';
// Icons
import {
  MdAttachMoney, MdCheckCircle, MdAccessTime,
  MdWarning, MdPayment, MdPrint, MdEmail,
  MdFileDownload, MdLocalOffer, MdCalendarMonth,
  MdDirectionsBus, MdReceipt, MdVisibility, MdSearch,
  MdFilterList, MdRemoveRedEye, MdMoreVert, MdEdit, MdUpdate
} from 'react-icons/md';

// API
import * as studentsApi from '../../../../services/api/students';
import { getStatusColor } from '../../../../utils/helpers';

export default function FeeRecordsPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const addModal = useDisclosure();
  const [students, setStudents] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [fees, setFees] = useState({ invoices: [], totals: { totalInvoiced: 0, totalPaid: 0, totalOutstanding: 0 } });
  const [loading, setLoading] = useState(false);
  const [payment, setPayment] = useState({ invoiceId: '', amount: '', method: 'Cash' });
  const [newInvoice, setNewInvoice] = useState({ amount: '', dueDate: '', status: 'pending' });
  const [busy, setBusy] = useState(false);
  const [viewInv, setViewInv] = useState(null);
  const [editInv, setEditInv] = useState(null);
  const [statusInv, setStatusInv] = useState(null);
  const [statusVal, setStatusVal] = useState('pending');

  // Load students
  useEffect(() => {
    const load = async () => {
      try {
        const payload = await studentsApi.list({ pageSize: 200 });
        const rows = Array.isArray(payload?.rows) ? payload.rows : (Array.isArray(payload) ? payload : []);
        setStudents(rows || []);
        if ((rows || []).length) setSelectedId(String(rows[0].id));
      } catch (e) {
        toast({ title: 'Failed to load students', status: 'error' });
      }
    };
    load();
  }, []);

  // Load fees for selected student
  useEffect(() => {
    if (!selectedId) return;
    const loadFees = async () => {
      try {
        setLoading(true);
        const payload = await studentsApi.getFees(selectedId);
        setFees(payload || { invoices: [], totals: { totalInvoiced: 0, totalPaid: 0, totalOutstanding: 0 } });
      } catch (e) {
        toast({ title: 'Failed to load fee records', status: 'error' });
      } finally {
        setLoading(false);
      }
    };
    loadFees();
  }, [selectedId]);

  const submitEdit = async () => {
    try {
      setBusy(true);
      await studentsApi.updateInvoice(selectedId, editInv.id, {
        amount: Number(editInv.amount),
        dueDate: editInv.dueDate || null,
      });
      setEditInv(null);
      const payload = await studentsApi.getFees(selectedId);
      setFees(payload || { invoices: [], totals: { totalInvoiced: 0, totalPaid: 0, totalOutstanding: 0 } });
      toast({ title: 'Invoice updated', status: 'success' });
    } catch (e) {
      toast({ title: 'Failed to update invoice', status: 'error' });
    } finally { setBusy(false); }
  };

  const submitStatus = async () => {
    try {
      setBusy(true);
      await studentsApi.updateInvoice(selectedId, statusInv.id, { status: statusVal });
      setStatusInv(null);
      const payload = await studentsApi.getFees(selectedId);
      setFees(payload || { invoices: [], totals: { totalInvoiced: 0, totalPaid: 0, totalOutstanding: 0 } });
      toast({ title: 'Status changed', status: 'success' });
    } catch (e) {
      toast({ title: 'Failed to change status', status: 'error' });
    } finally { setBusy(false); }
  };

  const openPayment = (invoiceId, outstanding) => {
    setPayment({ invoiceId, amount: String(outstanding || ''), method: 'Cash' });
    onOpen();
  };
  const openView = (invoice) => setViewInv(invoice);
  const openEdit = (invoice) => setEditInv({ id: invoice.id, amount: String(invoice.amount), dueDate: invoice.dueDate ? String(invoice.dueDate).slice(0,10) : '' });
  const openChangeStatus = (invoice) => { setStatusInv(invoice); setStatusVal(invoice.status || 'pending'); };

  const submitPayment = async () => {
    try {
      await studentsApi.recordPayment(selectedId, { invoiceId: Number(payment.invoiceId), amount: Number(payment.amount), method: payment.method });
      toast({ title: 'Payment recorded', status: 'success' });
      onClose();
      // refresh fees
      const payload = await studentsApi.getFees(selectedId);
      setFees(payload || { invoices: [], totals: { totalInvoiced: 0, totalPaid: 0, totalOutstanding: 0 } });
    } catch (e) {
      const message = e?.response?.data?.message || 'Failed to record payment';
      toast({ title: 'Error', description: message, status: 'error' });
    }
  };

  const submitInvoice = async () => {
    try {
      setBusy(true);
      await studentsApi.createInvoice(selectedId, {
        amount: Number(newInvoice.amount),
        dueDate: newInvoice.dueDate || null,
        status: newInvoice.status,
      });
      toast({ title: 'Invoice created', status: 'success' });
      addModal.onClose();
      const payload = await studentsApi.getFees(selectedId);
      setFees(payload || { invoices: [], totals: { totalInvoiced: 0, totalPaid: 0, totalOutstanding: 0 } });
      setNewInvoice({ amount: '', dueDate: '', status: 'pending' });
    } catch (e) {
      toast({ title: 'Failed to create invoice', status: 'error' });
    } finally {
      setBusy(false);
    }
  };

  const refresh = async () => {
    if (!selectedId) return;
    setBusy(true);
    try {
      const payload = await studentsApi.getFees(selectedId);
      setFees(payload || { invoices: [], totals: { totalInvoiced: 0, totalPaid: 0, totalOutstanding: 0 } });
    } catch (e) {
      toast({ title: 'Refresh failed', status: 'error' });
    } finally {
      setBusy(false);
    }
  };

  const exportCSV = () => {
    const header = ['Invoice ID','Amount','Paid','Outstanding','Status','Due Date','Issued'];
    const rows = (fees.invoices || []).map(inv => [
      `INV-${inv.id}`,
      Math.round(inv.amount),
      Math.round(inv.paid),
      Math.round(inv.outstanding || 0),
      inv.status,
      inv.dueDate || '',
      inv.issuedAt || ''
    ]);
    const csv = [header, ...rows].map(r => r.map(v => '"' + String(v).replace(/"/g,'""') + '"').join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'fee_invoices.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => window.print();

  const totals = fees.totals || { totalInvoiced: 0, totalPaid: 0, totalOutstanding: 0 };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      {/* Page Header */}
      <Flex justify='space-between' align='center' mb='20px'>
        <Box>
          <Text fontSize='2xl' fontWeight='bold'>
            Fee Records
          </Text>
          <Text fontSize='md' color='gray.500'>
            Manage student fee invoices and payments
          </Text>
        </Box>
        <Flex gap={3} align='center'>
          <Select maxW='280px' value={selectedId} onChange={(e)=>setSelectedId(e.target.value)}>
            {students.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.class}-{s.section})</option>
            ))}
          </Select>
          <ButtonGroup>
            <Button onClick={addModal.onOpen} colorScheme='blue'>Add Invoice</Button>
            <Button variant='outline' onClick={refresh} isLoading={busy}>Refresh</Button>
            <Button variant='outline' onClick={exportCSV}>Export</Button>
            <Button variant='outline' onClick={handlePrint}>Print</Button>
          </ButtonGroup>
        </Flex>
      </Flex>

      {/* Statistics Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap='20px' mb='20px'>
        <MiniStatistics
          startContent={
            <IconBox
              w='56px'
              h='56px'
              bg='linear-gradient(90deg, #4481EB 0%, #04BEFE 100%)'
              icon={<MdAttachMoney w='28px' h='28px' color='white' />}
            />
          }
          name='Total Invoiced'
          value={`PKR ${Math.round(totals.totalInvoiced).toLocaleString()}`}
        />
        
        <MiniStatistics
          startContent={
            <IconBox
              w='56px'
              h='56px'
              bg='linear-gradient(90deg, #01B574 0%, #51CB97 100%)'
              icon={<MdCheckCircle w='28px' h='28px' color='white' />}
            />
          }
          name='Total Paid'
          value={`PKR ${Math.round(totals.totalPaid).toLocaleString()}`}
        />
        
        <MiniStatistics
          startContent={
            <IconBox
              w='56px'
              h='56px'
              bg='linear-gradient(90deg, #FFB36D 0%, #FD7853 100%)'
              icon={<MdAccessTime w='28px' h='28px' color='white' />}
            />
          }
          name='Outstanding'
          value={`PKR ${Math.round(totals.totalOutstanding).toLocaleString()}`}
        />
        
        <MiniStatistics
          startContent={
            <IconBox
              w='56px'
              h='56px'
              bg='linear-gradient(90deg, #E31A1A 0%, #FF8080 100%)'
              icon={<MdWarning w='28px' h='28px' color='white' />}
            />
          }
          name='Overdue'
          value={`PKR ${Math.round((fees.totals?.overdueOutstanding || 0)).toLocaleString()}`}
        />
      </SimpleGrid>

      {/* Invoices Table */}
      <Card p='20px'>
        <TableContainer>
          <Table variant='simple'>
            <Thead>
              <Tr>
                <Th>Invoice ID</Th>
                <Th isNumeric>Amount</Th>
                <Th isNumeric>Paid</Th>
                <Th isNumeric>Outstanding</Th>
                <Th>Status</Th>
                <Th>Due Date</Th>
                <Th>Issued</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {fees.invoices.map((inv) => (
                <Tr key={inv.id}>
                  <Td>INV-{inv.id}</Td>
                  <Td isNumeric>PKR {Math.round(inv.amount).toLocaleString()}</Td>
                  <Td isNumeric>PKR {Math.round(inv.paid).toLocaleString()}</Td>
                  <Td isNumeric>PKR {Math.round(inv.outstanding).toLocaleString()}</Td>
                  <Td>
                    <Badge colorScheme={getStatusColor(inv.status)}>
                      {String(inv.status || '').replace(/_/g,' ').toUpperCase()}
                    </Badge>
                  </Td>
                  <Td>{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '-'}</Td>
                  <Td>{inv.issuedAt ? new Date(inv.issuedAt).toLocaleDateString() : '-'}</Td>
                  <Td>
                    <Menu placement='bottom-end' isLazy>
                      <MenuButton as={Button} size='sm' variant='outline' leftIcon={<MdMoreVert />}>Actions</MenuButton>
                      <Portal>
                        <MenuList zIndex={1500}>
                          <MenuItem icon={<MdVisibility />} onClick={()=>openView(inv)}>View</MenuItem>
                          <MenuItem icon={<MdEdit />} onClick={()=>openEdit(inv)}>Edit</MenuItem>
                          <MenuItem icon={<MdUpdate />} onClick={()=>openChangeStatus(inv)}>Change Status</MenuItem>
                          <MenuItem icon={<MdPayment />} onClick={()=>openPayment(inv.id, inv.outstanding)} isDisabled={(inv.outstanding||0)<=0}>Record Payment</MenuItem>
                        </MenuList>
                      </Portal>
                    </Menu>
                  </Td>
                </Tr>
              ))}
              {!fees.invoices.length && (
                <Tr><Td colSpan={8}>No invoices</Td></Tr>
              )}
            </Tbody>
          </Table>
        </TableContainer>
      </Card>

      {/* Payment Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Record Payment</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={3}>
              <FormLabel>Invoice</FormLabel>
              <Select value={payment.invoiceId} onChange={(e)=>setPayment(p=>({ ...p, invoiceId: e.target.value }))}>
                {fees.invoices.map(inv => (
                  <option key={inv.id} value={inv.id}>INV-{inv.id} (Outstanding PKR {Math.round(inv.outstanding).toLocaleString()})</option>
                ))}
              </Select>
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Amount</FormLabel>
              <Input type='number' value={payment.amount} onChange={(e)=>setPayment(p=>({ ...p, amount: e.target.value }))} />
            </FormControl>
            <FormControl>
              <FormLabel>Method</FormLabel>
              <Select value={payment.method} onChange={(e)=>setPayment(p=>({ ...p, method: e.target.value }))}>
                <option>Cash</option>
                <option>Card</option>
                <option>Bank Transfer</option>
              </Select>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' onClick={onClose}>Cancel</Button>
            <Button colorScheme='blue' onClick={submitPayment} isDisabled={!payment.invoiceId || !payment.amount}>Record</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* View Invoice Modal */}
      <Modal isOpen={!!viewInv} onClose={()=>setViewInv(null)} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Invoice Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {viewInv && (
              <Box>
                <HStack justify='space-between' mb={2}><Text fontWeight='600'>Invoice</Text><Text>INV-{viewInv.id}</Text></HStack>
                <HStack justify='space-between' mb={2}><Text fontWeight='600'>Amount</Text><Text>PKR {Math.round(viewInv.amount).toLocaleString()}</Text></HStack>
                <HStack justify='space-between' mb={2}><Text fontWeight='600'>Paid</Text><Text>PKR {Math.round(viewInv.paid).toLocaleString()}</Text></HStack>
                <HStack justify='space-between' mb={2}><Text fontWeight='600'>Outstanding</Text><Text>PKR {Math.round(viewInv.outstanding||0).toLocaleString()}</Text></HStack>
                <HStack justify='space-between' mb={2}><Text fontWeight='600'>Status</Text><Badge colorScheme={getStatusColor(viewInv.status)}>{String(viewInv.status||'').replace(/_/g,' ').toUpperCase()}</Badge></HStack>
                <HStack justify='space-between' mb={2}><Text fontWeight='600'>Due Date</Text><Text>{viewInv.dueDate ? new Date(viewInv.dueDate).toLocaleDateString() : '-'}</Text></HStack>
                <HStack justify='space-between'><Text fontWeight='600'>Issued</Text><Text>{viewInv.issuedAt ? new Date(viewInv.issuedAt).toLocaleDateString() : '-'}</Text></HStack>
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={()=>setViewInv(null)}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Invoice Modal */}
      <Modal isOpen={!!editInv} onClose={()=>setEditInv(null)} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Invoice</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {editInv && (
              <>
                <FormControl mb={3} isRequired>
                  <FormLabel>Amount</FormLabel>
                  <Input type='number' value={editInv.amount} onChange={(e)=>setEditInv(v=>({ ...v, amount: e.target.value }))} />
                </FormControl>
                <FormControl>
                  <FormLabel>Due Date</FormLabel>
                  <Input type='date' value={editInv.dueDate||''} onChange={(e)=>setEditInv(v=>({ ...v, dueDate: e.target.value }))} />
                </FormControl>
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' onClick={()=>setEditInv(null)}>Cancel</Button>
            <Button colorScheme='blue' onClick={submitEdit} isLoading={busy} isDisabled={!editInv || !editInv.amount}>Save</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Change Status Modal */}
      <Modal isOpen={!!statusInv} onClose={()=>setStatusInv(null)} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Change Status</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Status</FormLabel>
              <Select value={statusVal} onChange={(e)=>setStatusVal(e.target.value)}>
                <option value='pending'>Pending</option>
                <option value='in_progress'>In Progress</option>
                <option value='paid'>Paid</option>
                <option value='overdue'>Overdue</option>
              </Select>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' onClick={()=>setStatusInv(null)}>Cancel</Button>
            <Button colorScheme='blue' onClick={submitStatus} isLoading={busy}>Update</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Add Invoice Modal */}
      <Modal isOpen={addModal.isOpen} onClose={addModal.onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>New Invoice</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={3} isRequired>
              <FormLabel>Amount</FormLabel>
              <Input type='number' value={newInvoice.amount} onChange={(e)=>setNewInvoice(v=>({ ...v, amount: e.target.value }))} />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Due Date</FormLabel>
              <Input type='date' value={newInvoice.dueDate} onChange={(e)=>setNewInvoice(v=>({ ...v, dueDate: e.target.value }))} />
            </FormControl>
            <FormControl>
              <FormLabel>Status</FormLabel>
              <Select value={newInvoice.status} onChange={(e)=>setNewInvoice(v=>({ ...v, status: e.target.value }))}>
                <option value='pending'>Pending</option>
                <option value='in_progress'>In Progress</option>
                <option value='paid'>Paid</option>
                <option value='overdue'>Overdue</option>
              </Select>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' onClick={addModal.onClose}>Cancel</Button>
            <Button colorScheme='blue' onClick={submitInvoice} isLoading={busy} isDisabled={!newInvoice.amount}>Create</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}