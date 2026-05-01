import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  InputGroup,
  InputLeftElement,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  useToast,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerCloseButton,
  HStack,
  Icon,
  Text,
  Spinner,
  Center,
  VStack,
  Divider,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { MdPeople, MdChevronRight, MdAdd, MdEdit, MdDelete, MdEmail } from 'react-icons/md';
import Card from '../../../../components/card/Card';
import { parentsApi } from '../../../../services/api';
import { useAuth } from '../../../../contexts/AuthContext';

export default function ParentsList() {
  const { campusId } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const refresh = async () => {
    try {
      setLoading(true);
      const data = await parentsApi.list({ q, pageSize: 100, campusId });
      setRows(data?.rows || data?.items || []);
      setTotal(data?.total ?? (data?.rows?.length || 0));
    } catch (e) {
      toast({ title: 'Failed to load parents', status: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, [q, campusId]);

  const openParent = async (id) => {
    try {
      const data = await parentsApi.getById(id);
      setSelected(data);
      setDrawerOpen(true);
    } catch (_) {
      toast({ title: 'Failed to load details', status: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this parent? This action cannot be undone.')) return;
    try {
      setLoading(true);
      await parentsApi.remove(id);
      toast({ title: 'Parent deleted successfully', status: 'success' });
      refresh();
    } catch (e) {
      toast({ title: 'Failed to delete parent', status: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const childrenCount = (p) => p?.childrenCount ?? p?.children?.length ?? 0;

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Flex mb={5} justify="space-between" align="center">
        <Box>
          <Heading as="h3" size="lg" mb={1}>Parents</Heading>
          <Text color="gray.500">Manage parents/guardians by family number and view their children</Text>
        </Box>
      </Flex>

      <Card p={4} mb={4}>
        <InputGroup maxW="360px">
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.300" />
          </InputLeftElement>
          <Input
            placeholder="Search by name, email or family number"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </InputGroup>
      </Card>

      <Card>
        <Box p={4}>
          <Flex justify="space-between" align="center" mb={3}>
            <Heading size="md">Parent List ({total})</Heading>
            <Button colorScheme="brand" leftIcon={<Icon as={MdAdd} />} onClick={() => navigate('/admin/parents/add')}>
              Add Parent
            </Button>
          </Flex>

          {loading && rows.length === 0 ? (
            <Center py={10}>
              <Spinner color="brand.500" />
            </Center>
          ) : (
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Family #</Th>
                    <Th>Primary Contact</Th>
                    <Th>Phone</Th>
                    <Th>Email</Th>
                    <Th isNumeric>Children</Th>
                    <Th textAlign="right">Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {rows.length === 0 ? (
                    <Tr>
                      <Td colSpan={6} textAlign="center" py={10} color="gray.500">
                        No parents found.
                      </Td>
                    </Tr>
                  ) : (
                    rows.map((p) => (
                      <Tr key={p.id} _hover={{ bg: 'gray.50' }}>
                        <Td><Badge colorScheme="purple">{p.familyNumber}</Badge></Td>
                        <Td fontWeight="600">{p.primaryName || p.fatherName || p.motherName || '—'}</Td>
                        <Td>{p.whatsappPhone || '—'}</Td>
                        <Td>{p.email || '—'}</Td>
                        <Td isNumeric>
                          <Badge borderRadius="full" px={2} colorScheme={childrenCount(p) > 0 ? 'green' : 'gray'}>
                            {childrenCount(p)}
                          </Badge>
                        </Td>
                        <Td>
                          <HStack spacing={2} justify="end">
                            <Button size="sm" variant="outline" colorScheme="brand" onClick={() => openParent(p.id)}>View</Button>
                            <Button size="sm" colorScheme="blue" variant="ghost" leftIcon={<Icon as={MdEdit} />}
                              onClick={() => navigate(`/admin/parents/edit/${p.id}`)}>
                              Edit
                            </Button>
                            <Button size="sm" colorScheme="red" variant="ghost" leftIcon={<Icon as={MdDelete} />}
                              onClick={() => handleDelete(p.id)}>
                              Delete
                            </Button>
                            <Button size="sm" colorScheme="teal" variant="ghost" as={Link} to={`/admin/parents/inform?parentId=${p.id}`} leftIcon={<Icon as={MdEmail} />}>
                              Inform
                            </Button>
                          </HStack>
                        </Td>
                      </Tr>
                    ))
                  )}
                </Tbody>
              </Table>
            </Box>
          )}
        </Box>
      </Card>

      <Drawer isOpen={drawerOpen} placement="right" onClose={() => setDrawerOpen(false)} size="md">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">Parent Details</DrawerHeader>
          <DrawerBody py={6}>
            {selected && (
              <Box>
                <VStack align="stretch" spacing={6}>
                  <Box>
                    <HStack mb={2}>
                      <Badge colorScheme="brand" fontSize="md" px={2}>{selected.familyNumber}</Badge>
                      <Text fontWeight="bold" color="gray.500">Family Number</Text>
                    </HStack>
                    <Heading size="md" mb={1}>{selected.primaryName || '—'}</Heading>
                    <Text color="gray.600">{selected.whatsappPhone || 'No Phone'} · {selected.email || 'No Email'}</Text>
                    <Text mt={2} fontSize="sm" color="gray.500">Address: {selected.address || '—'}</Text>
                  </Box>

                  <Divider />

                  <Box>
                    <Heading size="sm" mb={4} display="flex" alignItems="center">
                      <Icon as={MdPeople} mr={2} /> Children
                    </Heading>
                    {selected.children && selected.children.length > 0 ? (
                      <VStack align="stretch" spacing={3}>
                        {selected.children.map((c) => (
                          <Flex key={c.id} align="center" justify="space-between" p={3} borderRadius="lg" border="1px solid" borderColor="gray.100" _hover={{ bg: 'gray.50' }}>
                            <Box>
                              <Text fontWeight="600">{c.name}</Text>
                              <Text fontSize="xs" color="gray.500">{c.class}-{c.section} · Roll: {c.rollNumber || '—'}</Text>
                            </Box>
                            <Button size="xs" variant="ghost" colorScheme="brand" rightIcon={<Icon as={MdChevronRight} />}
                              onClick={() => navigate(`/admin/students/profile/${c.id}`)}
                            >View Student</Button>
                          </Flex>
                        ))}
                      </VStack>
                    ) : (
                      <Text color="gray.500" fontStyle="italic">No children linked to this parent.</Text>
                    )}
                  </Box>
                </VStack>
              </Box>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
}
