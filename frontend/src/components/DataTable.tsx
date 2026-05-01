import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Flex,
  HStack,
  IconButton,
  Input,
  Select,
  Skeleton,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
} from '@chakra-ui/react';
import { MdChevronLeft, MdChevronRight, MdSearch, MdSwapVert } from 'react-icons/md';

export type SortDirection = 'asc' | 'desc';

export type DataTableColumnFilter =
  | {
      type: 'text';
      placeholder?: string;
    }
  | {
      type: 'select';
      placeholder?: string;
      options: Array<{ label: string; value: string }>;
    };

export type DataTableColumn<T> = {
  id: string;
  header: string;
  accessor?: (row: T) => React.ReactNode;
  cell?: (row: T) => React.ReactNode;
  isNumeric?: boolean;
  sortable?: boolean;
  filter?: DataTableColumnFilter;
};

export type DataTablePagination = {
  pageIndex: number;
  pageSize: number;
  total: number;
  onPageChange: (pageIndex: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
};

export type DataTableProps<T> = {
  columns: Array<DataTableColumn<T>>;
  data: T[];
  loading?: boolean;
  search?: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  };
  filters?: {
    values: Record<string, string>;
    onChange: (columnId: string, value: string) => void;
  };
  sort?: {
    columnId?: string;
    direction?: SortDirection;
    onChange: (columnId: string, direction: SortDirection) => void;
  };
  pagination?: DataTablePagination;
  emptyText?: string;
  ariaLabel?: string;
  onRowClick?: (row: T) => void;
  getRowId?: (row: T, index: number) => string | number;
};

export default function DataTable<T>({
  columns,
  data,
  loading,
  search,
  filters,
  sort,
  pagination,
  emptyText,
  ariaLabel,
  onRowClick,
  getRowId,
}: DataTableProps<T>) {
  const bg = useColorModeValue('white', 'gray.900');
  const borderColor = useColorModeValue('gray.100', 'whiteAlpha.200');

  const showFilters = useMemo(() => {
    if (!filters) return false;
    return columns.some((c) => Boolean(c.filter));
  }, [columns, filters]);

  const totalPages = useMemo(() => {
    if (!pagination) return 1;
    return Math.max(1, Math.ceil(pagination.total / pagination.pageSize));
  }, [pagination]);

  const [localSearch, setLocalSearch] = useState(search?.value ?? '');
  useEffect(() => {
    if (search) setLocalSearch(search.value);
  }, [search?.value]);

  const toggleSort = (columnId: string) => {
    if (!sort) return;
    const dir: SortDirection = sort.columnId === columnId && sort.direction === 'asc' ? 'desc' : 'asc';
    sort.onChange(columnId, dir);
  };

  return (
    <Box bg={bg} borderWidth="1px" borderColor={borderColor} borderRadius="md" boxShadow="sm" overflow="hidden">
      {(search || pagination) ? (
        <Flex px={4} py={3} justify="space-between" align="center" gap={3} flexWrap="wrap">
          {search ? (
            <HStack spacing={2} minW={{ base: 'full', md: '320px' }}>
              <Box as={MdSearch} color={useColorModeValue('gray.400', 'gray.500')} />
              <Input
                aria-label="Search table"
                value={localSearch}
                onChange={(e) => {
                  const v = e.target.value;
                  setLocalSearch(v);
                  search.onChange(v);
                }}
                placeholder={search.placeholder || 'Search...'}
                size="sm"
                bg={useColorModeValue('gray.50', 'whiteAlpha.100')}
              />
            </HStack>
          ) : null}

          {pagination ? (
            <HStack spacing={2}>
              <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
                Page {pagination.pageIndex + 1} / {totalPages}
              </Text>
              {pagination.onPageSizeChange ? (
                <Select
                  aria-label="Rows per page"
                  size="sm"
                  value={pagination.pageSize}
                  onChange={(e) => pagination.onPageSizeChange?.(Number(e.target.value))}
                  w="92px"
                >
                  {[10, 20, 50, 100].map((s) => (
                    <option key={s} value={s}>
                      {s}/page
                    </option>
                  ))}
                </Select>
              ) : null}
              <IconButton
                aria-label="Previous page"
                size="sm"
                icon={<MdChevronLeft />}
                variant="outline"
                isDisabled={pagination.pageIndex <= 0}
                onClick={() => pagination.onPageChange(Math.max(0, pagination.pageIndex - 1))}
              />
              <IconButton
                aria-label="Next page"
                size="sm"
                icon={<MdChevronRight />}
                variant="outline"
                isDisabled={pagination.pageIndex >= totalPages - 1}
                onClick={() => pagination.onPageChange(Math.min(totalPages - 1, pagination.pageIndex + 1))}
              />
            </HStack>
          ) : null}
        </Flex>
      ) : null}

      <Box overflowX="auto">
        <Table aria-label={ariaLabel || 'Data table'} size="sm">
          <Thead bg={useColorModeValue('gray.50', 'whiteAlpha.100')}>
            <Tr>
              {columns.map((c) => {
                const isSorted = sort?.columnId === c.id;
                return (
                  <Th key={c.id} isNumeric={c.isNumeric}>
                    <HStack spacing={1}>
                      <Text fontSize="xs" fontWeight={800} color={useColorModeValue('gray.700', 'gray.200')}>
                        {c.header}
                      </Text>
                      {c.sortable && sort ? (
                        <IconButton
                          aria-label={`Sort by ${c.header}`}
                          size="xs"
                          variant="ghost"
                          icon={<MdSwapVert />}
                          onClick={() => toggleSort(c.id)}
                        />
                      ) : null}
                      {isSorted ? (
                        <Text fontSize="xs" color={useColorModeValue('gray.500', 'gray.400')}>
                          {sort?.direction === 'asc' ? '↑' : '↓'}
                        </Text>
                      ) : null}
                    </HStack>
                  </Th>
                );
              })}
            </Tr>
            {showFilters ? (
              <Tr>
                {columns.map((c) => {
                  const f = c.filter;
                  return (
                    <Th key={`${c.id}-filter`} isNumeric={c.isNumeric}>
                      {filters && f ? (
                        f.type === 'select' ? (
                          <Select
                            aria-label={`Filter ${c.header}`}
                            size="sm"
                            value={filters.values[c.id] ?? ''}
                            onChange={(e) => filters.onChange(c.id, e.target.value)}
                            bg={useColorModeValue('white', 'whiteAlpha.50')}
                          >
                            <option value="">{f.placeholder || 'All'}</option>
                            {f.options.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </Select>
                        ) : (
                          <Input
                            aria-label={`Filter ${c.header}`}
                            size="sm"
                            value={filters.values[c.id] ?? ''}
                            onChange={(e) => filters.onChange(c.id, e.target.value)}
                            placeholder={f.placeholder || 'Filter...'}
                            bg={useColorModeValue('white', 'whiteAlpha.50')}
                          />
                        )
                      ) : null}
                    </Th>
                  );
                })}
              </Tr>
            ) : null}
          </Thead>
          <Tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Tr key={i}>
                  {columns.map((c) => (
                    <Td key={c.id} isNumeric={c.isNumeric}>
                      <Skeleton h="12px" />
                    </Td>
                  ))}
                </Tr>
              ))
            ) : data.length === 0 ? (
              <Tr>
                <Td colSpan={columns.length}>
                  <Box py={8} textAlign="center">
                    <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
                      {emptyText || 'No records found.'}
                    </Text>
                  </Box>
                </Td>
              </Tr>
            ) : (
              data.map((row, idx) => (
                <Tr
                  key={String(getRowId ? getRowId(row, idx) : idx)}
                  _hover={{ bg: useColorModeValue('gray.50', 'whiteAlpha.100') }}
                  cursor={onRowClick ? 'pointer' : undefined}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  role={onRowClick ? 'button' : undefined}
                >
                  {columns.map((c) => {
                    const content = c.cell ? c.cell(row) : c.accessor ? c.accessor(row) : (row as any)[c.id];
                    return (
                      <Td key={c.id} isNumeric={c.isNumeric}>
                        {content}
                      </Td>
                    );
                  })}
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
        <noscript>
          <Text p={4} fontSize="sm">Table features require JavaScript.</Text>
        </noscript>
      </Box>
    </Box>
  );
}
