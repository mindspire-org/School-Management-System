import React, { useMemo } from 'react';
import {
  Avatar,
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Text,
  Wrap,
  WrapItem,
  Tag,
  TagLabel,
  useColorModeValue,
} from '@chakra-ui/react';

const formatClassLabel = (cls) => {
  if (cls === undefined || cls === null) return '—';
  if (typeof cls === 'string' || typeof cls === 'number') return String(cls);
  if (typeof cls === 'object') {
    const section = cls.section ?? cls.sectionName;
    const className = cls.className ?? cls.class ?? cls.grade ?? cls.name;
    const year = cls.academicYear ?? cls.year;
    const base = [className, section].filter(Boolean).join('-') || cls.id || cls.code || '—';
    return year ? `${base} (${year})` : String(base);
  }
  return String(cls);
};

const classKey = (cls, idx) => {
  if (cls === undefined || cls === null) return `cls-${idx}`;
  if (typeof cls === 'string' || typeof cls === 'number') return String(cls);
  if (typeof cls === 'object') {
    return String(cls.id || cls.classId || cls.code || `${cls.className || cls.class || ''}-${cls.section || ''}-${cls.academicYear || ''}-${idx}`);
  }
  return `cls-${idx}`;
};

const InfoItem = ({ label, value, textColor, textColorSecondary }) => (
  <Box>
    <Text fontSize="xs" color={textColorSecondary} textTransform="uppercase" letterSpacing="0.08em">
      {label}
    </Text>
    <Text fontWeight="600" color={textColor} mt={1} fontSize="sm">
      {value || '-'}
    </Text>
  </Box>
);

const TeacherDetailsModal = ({ isOpen, onClose, teacher, formatCurrency, statusColor }) => {
  const textColor = useColorModeValue('gray.800', 'white');
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');

  const subjects = useMemo(() => teacher?.subjects || [], [teacher]);
  const classes = useMemo(() => teacher?.classes || [], [teacher]);
  const employmentStatus = teacher?.employmentStatus || teacher?.status;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size='3xl' scrollBehavior='inside'>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Teacher Details</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {teacher && (
            <Box>
              <Flex direction={{ base: 'column', md: 'row' }} align={{ base: 'flex-start', md: 'center' }} gap={6}>
                <Avatar size='xl' name={teacher.name} src={teacher.avatar || teacher.photo || undefined} />
                <Box>
                  <Heading size='md'>{teacher.name}</Heading>
                  <Text color={textColorSecondary}>{teacher.designation || teacher.subject || teacher.department || 'Teacher'}</Text>
                  <HStack mt={3} spacing={3} flexWrap='wrap'>
                    {teacher.employeeId && <Badge colorScheme='purple'>ID: {teacher.employeeId}</Badge>}
                    {teacher.department && <Badge colorScheme='blue'>{teacher.department}</Badge>}
                    {employmentStatus && (
                      <Badge colorScheme={statusColor ? statusColor(employmentStatus) : 'gray'}>
                        {employmentStatus}
                      </Badge>
                    )}
                  </HStack>
                </Box>
              </Flex>

              <Divider my={6} />

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <InfoItem label='Email' value={teacher.email} textColor={textColor} textColorSecondary={textColorSecondary} />
                <InfoItem label='Phone' value={teacher.phone} textColor={textColor} textColorSecondary={textColorSecondary} />
                <InfoItem label='Joining Date' value={teacher.joiningDate} textColor={textColor} textColorSecondary={textColorSecondary} />
                <InfoItem
                  label='Experience (years)'
                  value={teacher.experienceYears ? `${teacher.experienceYears} yrs` : teacher.experience}
                  textColor={textColor}
                  textColorSecondary={textColorSecondary}
                />
                <InfoItem label='Qualification' value={teacher.qualification} textColor={textColor} textColorSecondary={textColorSecondary} />
                <InfoItem label='Specialization' value={teacher.specialization || teacher.subject} textColor={textColor} textColorSecondary={textColorSecondary} />
                <InfoItem label='Employment Type' value={teacher.employmentType} textColor={textColor} textColorSecondary={textColorSecondary} />
                <InfoItem
                  label='Work Hours / Week'
                  value={teacher.workHoursPerWeek ? `${teacher.workHoursPerWeek} hrs` : '-'}
                  textColor={textColor}
                  textColorSecondary={textColorSecondary}
                />
              </SimpleGrid>

              <Divider my={6} />

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <InfoItem
                  label='Base Salary'
                  value={formatCurrency ? formatCurrency(teacher.baseSalary, teacher.currency) : teacher.baseSalary}
                  textColor={textColor}
                  textColorSecondary={textColorSecondary}
                />
                <InfoItem
                  label='Allowances'
                  value={formatCurrency ? formatCurrency(teacher.allowances, teacher.currency) : teacher.allowances}
                  textColor={textColor}
                  textColorSecondary={textColorSecondary}
                />
                <InfoItem
                  label='Deductions'
                  value={formatCurrency ? formatCurrency(teacher.deductions, teacher.currency) : teacher.deductions}
                  textColor={textColor}
                  textColorSecondary={textColorSecondary}
                />
                <InfoItem
                  label='Net Salary'
                  value={formatCurrency ? formatCurrency(teacher.salary, teacher.currency) : teacher.salary}
                  textColor={textColor}
                  textColorSecondary={textColorSecondary}
                />
                <InfoItem label='Payment Method' value={teacher.paymentMethod} textColor={textColor} textColorSecondary={textColorSecondary} />
                <InfoItem label='Bank Name' value={teacher.bankName} textColor={textColor} textColorSecondary={textColorSecondary} />
                <InfoItem label='Account Number' value={teacher.accountNumber} textColor={textColor} textColorSecondary={textColorSecondary} />
                <InfoItem label='IBAN' value={teacher.iban} textColor={textColor} textColorSecondary={textColorSecondary} />
              </SimpleGrid>

              <Divider my={6} />

              <Box>
                <Text fontWeight='600' mb={2}>Subjects</Text>
                {subjects.length ? (
                  <Wrap>
                    {subjects.map((subj) => (
                      <WrapItem key={subj}>
                        <Tag colorScheme='blue' variant='subtle'>
                          <TagLabel>{subj}</TagLabel>
                        </Tag>
                      </WrapItem>
                    ))}
                  </Wrap>
                ) : (
                  <Text color={textColorSecondary}>No subjects assigned</Text>
                )}
              </Box>

              <Box mt={4}>
                <Text fontWeight='600' mb={2}>Classes</Text>
                {classes.length ? (
                  <Wrap>
                    {classes.map((cls, idx) => (
                      <WrapItem key={classKey(cls, idx)}>
                        <Tag colorScheme='green' variant='subtle'>
                          <TagLabel>{formatClassLabel(cls)}</TagLabel>
                        </Tag>
                      </WrapItem>
                    ))}
                  </Wrap>
                ) : (
                  <Text color={textColorSecondary}>No classes assigned</Text>
                )}
              </Box>

              <Divider my={6} />

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <InfoItem label='Emergency Contact' value={teacher.emergencyName} textColor={textColor} textColorSecondary={textColorSecondary} />
                <InfoItem label='Emergency Phone' value={teacher.emergencyPhone} textColor={textColor} textColorSecondary={textColorSecondary} />
                <InfoItem label='Emergency Relation' value={teacher.emergencyRelation} textColor={textColor} textColorSecondary={textColorSecondary} />
                <InfoItem label='City' value={teacher.city} textColor={textColor} textColorSecondary={textColorSecondary} />
                <InfoItem label='State' value={teacher.state} textColor={textColor} textColorSecondary={textColorSecondary} />
                <InfoItem label='Postal Code' value={teacher.postalCode} textColor={textColor} textColorSecondary={textColorSecondary} />
                <InfoItem label='Address Line 1' value={teacher.address1} textColor={textColor} textColorSecondary={textColorSecondary} />
                <InfoItem label='Address Line 2' value={teacher.address2} textColor={textColor} textColorSecondary={textColorSecondary} />
              </SimpleGrid>
            </Box>
          )}
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default TeacherDetailsModal;
