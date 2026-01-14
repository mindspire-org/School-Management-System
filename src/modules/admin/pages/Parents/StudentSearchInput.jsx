import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Box,
    Input,
    InputGroup,
    InputLeftElement,
    Icon,
    List,
    ListItem,
    Text,
    Spinner,
    Tag,
    TagLabel,
    TagCloseButton,
    Wrap,
    WrapItem,
    useOutsideClick,
} from '@chakra-ui/react';
import { MdSearch, MdSchool } from 'react-icons/md';
import { studentsApi } from '../../../../services/api';

export default function StudentSearchInput({ selectedRollNumbers, onChange }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef();
    const debounceTimer = useRef(null);

    useOutsideClick({
        ref: ref,
        handler: () => setIsOpen(false),
    });

    const performSearch = async (searchQuery) => {
        if (!searchQuery.trim()) {
            setResults([]);
            setIsOpen(false);
            return;
        }
        setLoading(true);
        try {
            const data = await studentsApi.list({ q: searchQuery, pageSize: 5 });
            setResults(data?.rows || data?.items || []);
            setIsOpen(true);
        } catch (error) {
            console.error('Error searching students:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);

        if (query) {
            debounceTimer.current = setTimeout(() => {
                performSearch(query);
            }, 400);
        } else {
            setResults([]);
            setIsOpen(false);
        }

        return () => {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
        };
    }, [query]);

    const handleSelect = (student) => {
        const roll = student.rollNumber;
        const currentRolls = selectedRollNumbers ? selectedRollNumbers.split(',').map(s => s.trim()).filter(Boolean) : [];

        if (!currentRolls.includes(roll)) {
            const newList = [...currentRolls, roll];
            onChange(newList.join(', '), student);
        }
        setQuery('');
        setResults([]);
        setIsOpen(false);
    };

    const handleRemove = (roll) => {
        const currentRolls = selectedRollNumbers.split(',').map(s => s.trim()).filter(Boolean);
        const newList = currentRolls.filter(r => r !== roll);
        onChange(newList.join(', '));
    };

    const displayRolls = selectedRollNumbers ? selectedRollNumbers.split(',').map(s => s.trim()).filter(Boolean) : [];

    return (
        <Box ref={ref} position="relative" width="100%">
            <Wrap mb={displayRolls.length > 0 ? 3 : 0} spacing={2}>
                {displayRolls.map((roll) => (
                    <WrapItem key={roll}>
                        <Tag size="md" borderRadius="full" variant="subtle" colorScheme="blue">
                            <TagLabel>{roll}</TagLabel>
                            <TagCloseButton onClick={() => handleRemove(roll)} />
                        </Tag>
                    </WrapItem>
                ))}
            </Wrap>
            <InputGroup>
                <InputLeftElement pointerEvents="none">
                    {loading ? <Spinner size="xs" color="blue.400" /> : <Icon as={MdSearch} color="gray.400" />}
                </InputLeftElement>
                <Input
                    placeholder="Type student name or roll number..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query && results.length > 0 && setIsOpen(true)}
                    borderRadius="10px"
                />
            </InputGroup>

            {isOpen && results.length > 0 && (
                <List
                    position="absolute"
                    top="100%"
                    left={0}
                    right={0}
                    bg="white"
                    _dark={{ bg: "gray.700", borderColor: "gray.600" }}
                    boxShadow="xl"
                    borderRadius="12px"
                    mt={2}
                    zIndex={100}
                    borderWidth="1px"
                    overflow="hidden"
                    borderColor="gray.100"
                >
                    {results.map((student) => (
                        <ListItem
                            key={student.id}
                            p={3}
                            cursor="pointer"
                            _hover={{ bg: "blue.50", _dark: { bg: "gray.600" } }}
                            onClick={() => handleSelect(student)}
                            borderBottomWidth="1px"
                            _last={{ borderBottomWidth: 0 }}
                            borderColor="gray.50"
                            _dark={{ borderColor: "gray.600" }}
                        >
                            <Box>
                                <Text fontWeight="bold" fontSize="sm">{student.name}</Text>
                                <Text fontSize="xs" color="gray.500">Roll: {student.rollNumber} · {student.class}-{student.section}</Text>
                            </Box>
                        </ListItem>
                    ))}
                </List>
            )}
            {isOpen && query && results.length === 0 && !loading && (
                <Box
                    position="absolute"
                    top="100%"
                    left={0}
                    right={0}
                    bg="white"
                    _dark={{ bg: "gray.700", borderColor: "gray.600" }}
                    p={4}
                    boxShadow="xl"
                    borderRadius="12px"
                    mt={2}
                    zIndex={100}
                    borderWidth="1px"
                    textAlign="center"
                    borderColor="gray.100"
                >
                    <Text fontSize="sm" color="gray.500">No students found matching "{query}"</Text>
                </Box>
            )}
        </Box>
    );
}
