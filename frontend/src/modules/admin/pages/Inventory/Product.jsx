import React, { useEffect, useState } from 'react';
import {
    Box,
    Flex,
    Heading,
    Text,
    Button,
    IconButton,
    useColorModeValue,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Select,
    Input,
    InputGroup,
    InputLeftElement,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    FormControl,
    FormLabel,
    NumberInput,
    NumberInputField,
    Textarea,
    useToast,
    Spinner,
    Badge,
} from '@chakra-ui/react';
import {
    MdAdd,
    MdSearch,
    MdEdit,
    MdDelete,
    MdRemoveRedEye,
    MdInventory,
    MdCategory,
    MdStore,
} from 'react-icons/md';
import Card from '../../../../components/card/Card';
import StatCard from '../../../../components/card/StatCard';
import { productApi, categoryApi, storeApi } from '../../../../services/moduleApis';
import { useAuth } from '../../../../contexts/AuthContext';

export default function Product() {
    const { campusId } = useAuth();
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [storeFilter, setStoreFilter] = useState('all');
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [stores, setStores] = useState([]);

    const { isOpen, onOpen, onClose } = useDisclosure();
    const viewDisc = useDisclosure();

    const [form, setForm] = useState({
        id: '',
        name: '',
        code: '',
        category: '',
        unit: 'pcs',
        quantity: 0,
        minStock: 0,
        price: 0,
        store: '',
        description: '',
    });

    const [selectedProduct, setSelectedProduct] = useState(null);
    const textColorSecondary = useColorModeValue('gray.600', 'gray.400');

    useEffect(() => {
        fetchData();
    }, [campusId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [productsData, categoriesData, storesData] = await Promise.all([
                productApi.list({ campusId }),
                categoryApi.list({ campusId }),
                storeApi.list({ campusId })
            ]);
            setProducts(productsData || []);
            setCategories(categoriesData || []);
            setStores(storesData || []);
        } catch (error) {
            toast({
                title: 'Error fetching data',
                description: error.response?.data?.error || 'Something went wrong',
                status: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            if (form.id) {
                await productApi.update(form.id, { ...form, campusId });
                toast({ title: 'Product updated', status: 'success' });
            } else {
                await productApi.create({ ...form, campusId });
                toast({ title: 'Product added', status: 'success' });
            }
            fetchData();
            onClose();
        } catch (error) {
            toast({
                title: 'Error saving product',
                description: error.response?.data?.error || 'Something went wrong',
                status: 'error',
            });
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await productApi.delete(id);
                toast({ title: 'Product deleted', status: 'success' });
                fetchData();
            } catch (error) {
                toast({
                    title: 'Error deleting product',
                    status: 'error',
                });
            }
        }
    };

    const stats = {
        total: products.length,
        lowStock: products.filter(p => Number(p.quantity) <= Number(p.minStock)).length,
        outOfStock: products.filter(p => Number(p.quantity) === 0).length,
        totalValue: products.reduce((sum, p) => sum + (Number(p.quantity) * Number(p.price)), 0),
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name?.toLowerCase().includes(search.toLowerCase()) ||
            p.code?.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
        const matchesStore = storeFilter === 'all' || p.store === storeFilter;
        return matchesSearch && matchesCategory && matchesStore;
    });

    return (
        <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
            <Flex mb={5} justify="space-between" align="center" gap={3} flexWrap="wrap">
                <Box>
                    <Heading as="h3" size="lg" mb={1}>Product Management</Heading>
                    <Text color={textColorSecondary}>Manage inventory products, stock levels, and pricing</Text>
                </Box>
                <Button
                    leftIcon={<MdAdd />}
                    colorScheme="blue"
                    onClick={() => {
                        setForm({
                            id: '',
                            name: '',
                            code: '',
                            category: categories[0]?.name || '',
                            unit: 'pcs',
                            quantity: 0,
                            minStock: 10,
                            price: 0,
                            store: stores[0]?.name || '',
                            description: '',
                        });
                        onOpen();
                    }}
                >
                    Add Product
                </Button>
            </Flex>

            <Box overflowX="auto" mb={5} pb={1}>
                <Flex gap={5} wrap="nowrap" minW="100%">
                    <Box minW="240px" flex={1}>
                        <StatCard title="Total Products" value={stats.total} icon={MdInventory} colorScheme="blue" />
                    </Box>
                    <Box minW="240px" flex={1}>
                        <StatCard title="Low Stock" value={stats.lowStock} icon={MdCategory} colorScheme="orange" />
                    </Box>
                    <Box minW="240px" flex={1}>
                        <StatCard title="Out of Stock" value={stats.outOfStock} icon={MdStore} colorScheme="red" />
                    </Box>
                    <Box minW="240px" flex={1}>
                        <StatCard title="Total Value" value={`Rs. ${stats.totalValue.toLocaleString()}`} icon={MdInventory} colorScheme="green" />
                    </Box>
                </Flex>
            </Box>

            <Card p={4} mb={5}>
                <Flex gap={3} direction={{ base: 'column', md: 'row' }} align={{ md: 'center' }}>
                    <InputGroup maxW="280px">
                        <InputLeftElement pointerEvents="none">
                            <MdSearch color="gray.400" />
                        </InputLeftElement>
                        <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} />
                    </InputGroup>
                    <Select maxW="200px" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                        <option value="all">All Categories</option>
                        {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </Select>
                    <Select maxW="200px" value={storeFilter} onChange={(e) => setStoreFilter(e.target.value)}>
                        <option value="all">All Stores</option>
                        {stores.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                    </Select>
                </Flex>
            </Card>

            <Card>
                <Box overflowX="auto">
                    <Box maxH="500px" overflowY="auto">
                        <Table variant="simple" size="sm">
                            <Thead position="sticky" top={0} zIndex={1} bg={useColorModeValue('gray.50', 'gray.800')}>
                                <Tr>
                                    <Th>Code</Th>
                                    <Th>Name</Th>
                                    <Th>Category</Th>
                                    <Th>Store</Th>
                                    <Th isNumeric>Quantity</Th>
                                    <Th isNumeric>Min Stock</Th>
                                    <Th isNumeric>Price</Th>
                                    <Th>Status</Th>
                                    <Th>Actions</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {loading ? (
                                    <Tr><Td colSpan={9} textAlign="center"><Spinner size="lg" my={10} /></Td></Tr>
                                ) : filteredProducts.length === 0 ? (
                                    <Tr><Td colSpan={9} textAlign="center"><Text my={5}>No products found</Text></Td></Tr>
                                ) : filteredProducts.map((product) => (
                                    <Tr key={product.id} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                                        <Td><Text fontWeight="600">{product.code}</Text></Td>
                                        <Td>{product.name}</Td>
                                        <Td>{product.category}</Td>
                                        <Td>{product.store}</Td>
                                        <Td isNumeric>{product.quantity}</Td>
                                        <Td isNumeric>{product.minStock}</Td>
                                        <Td isNumeric>Rs. {product.price}</Td>
                                        <Td>
                                            <Badge colorScheme={Number(product.quantity) === 0 ? 'red' : Number(product.quantity) <= Number(product.minStock) ? 'orange' : 'green'}>
                                                {Number(product.quantity) === 0 ? 'Out of Stock' : Number(product.quantity) <= Number(product.minStock) ? 'Low Stock' : 'In Stock'}
                                            </Badge>
                                        </Td>
                                        <Td>
                                            <IconButton
                                                aria-label="View"
                                                icon={<MdRemoveRedEye />}
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => { setSelectedProduct(product); viewDisc.onOpen(); }}
                                            />
                                            <IconButton
                                                aria-label="Edit"
                                                icon={<MdEdit />}
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => { setForm(product); onOpen(); }}
                                            />
                                            <IconButton
                                                aria-label="Delete"
                                                icon={<MdDelete />}
                                                size="sm"
                                                variant="ghost"
                                                colorScheme="red"
                                                onClick={() => handleDelete(product.id)}
                                            />
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    </Box>
                </Box>
            </Card>

            {/* Add/Edit Modal */}
            <Modal isOpen={isOpen} onClose={onClose} size="lg">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{form.id ? 'Edit Product' : 'Add Product'}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <FormControl mb={3}>
                            <FormLabel>Product Code</FormLabel>
                            <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Product Name</FormLabel>
                            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Category</FormLabel>
                            <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                                <option value="">Select Category</option>
                                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                            </Select>
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Store</FormLabel>
                            <Select value={form.store} onChange={(e) => setForm({ ...form, store: e.target.value })}>
                                <option value="">Select Store</option>
                                {stores.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                            </Select>
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Unit</FormLabel>
                            <Select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
                                <option value="pcs">Pieces</option>
                                <option value="kg">Kilogram</option>
                                <option value="ltr">Liter</option>
                                <option value="box">Box</option>
                            </Select>
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Quantity</FormLabel>
                            <NumberInput value={form.quantity} min={0} onChange={(v) => setForm({ ...form, quantity: Number(v) || 0 })}>
                                <NumberInputField />
                            </NumberInput>
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Minimum Stock Level</FormLabel>
                            <NumberInput value={form.minStock} min={0} onChange={(v) => setForm({ ...form, minStock: Number(v) || 0 })}>
                                <NumberInputField />
                            </NumberInput>
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Price</FormLabel>
                            <NumberInput value={form.price} min={0} onChange={(v) => setForm({ ...form, price: Number(v) || 0 })}>
                                <NumberInputField />
                            </NumberInput>
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Description</FormLabel>
                            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
                        </FormControl>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
                        <Button colorScheme="blue" onClick={handleSave}>Save</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* View Modal */}
            <Modal isOpen={viewDisc.isOpen} onClose={viewDisc.onClose} size="md">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Product Details</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        {selectedProduct && (
                            <Box>
                                <Text mb={2}><strong>Code:</strong> {selectedProduct.code}</Text>
                                <Text mb={2}><strong>Name:</strong> {selectedProduct.name}</Text>
                                <Text mb={2}><strong>Category:</strong> {selectedProduct.category}</Text>
                                <Text mb={2}><strong>Store:</strong> {selectedProduct.store}</Text>
                                <Text mb={2}><strong>Unit:</strong> {selectedProduct.unit}</Text>
                                <Text mb={2}><strong>Quantity:</strong> {selectedProduct.quantity}</Text>
                                <Text mb={2}><strong>Min Stock:</strong> {selectedProduct.minStock}</Text>
                                <Text mb={2}><strong>Price:</strong> Rs. {selectedProduct.price}</Text>
                                <Text mb={2}><strong>Description:</strong> {selectedProduct.description}</Text>
                            </Box>
                        )}
                    </ModalBody>
                </ModalContent>
            </Modal>
        </Box>
    );
}
