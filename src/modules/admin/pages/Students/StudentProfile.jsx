import React, { useEffect, useState } from 'react';
import {
  Box,
  Text,
  Flex,
  Badge,
  Avatar,
  HStack,
  Spinner,
  Center,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
  Button,
  IconButton,
} from '@chakra-ui/react';
import Card from '../../../../components/card/Card';
import { useParams, useNavigate } from 'react-router-dom';
import * as studentsApi from '../../../../services/api/students';

export default function StudentProfile({ id: idProp, embedded = false, onClose }) {
  const { id: routeId } = useParams();
  const id = idProp ?? routeId;
  const toast = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [student, setStudent] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const payload = await studentsApi.getById(id);
        if (mounted) setStudent(payload);
      } catch (e) {
        setError('Failed to load student');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  if (loading) {
    return (
      <Center pt={{ base: '130px', md: '80px', xl: '80px' }} minH="40vh">
        <Spinner size="lg" />
      </Center>
    );
  }

  if (error || !student) {
    return (
      <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
        <Card p="20px">
          <Text color="red.500" mb="4">{error || 'Student not found'}</Text>
          {!embedded && (
            <Button onClick={() => navigate('/admin/students/list')}>Back to Students</Button>
          )}
          {embedded && (
            <Button onClick={onClose}>Close</Button>
          )}
        </Card>
      </Box>
    );
  }

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Card p="20px" mb="20px">
        <HStack spacing="16px" justifyContent="space-between" alignItems="center">
          <HStack spacing="16px">
            <Avatar size="lg" name={student.name} src={student.avatar} />
            <Box>
              <Text fontSize="2xl" fontWeight="bold">{student.name}</Text>
              <HStack>
                <Badge colorScheme="purple">{student.class}-{student.section}</Badge>
                <Badge colorScheme="blue">Bus {student.busNumber || 'N/A'}</Badge>
                <Badge colorScheme="green">{student.feeStatus || 'paid'}</Badge>
              </HStack>
              <Text color="gray.500">{student.email}</Text>
            </Box>
          </HStack>
          {embedded ? (
            <Button size="sm" onClick={onClose}>Close</Button>
          ) : null}
        </HStack>
      </Card>

      <Card p="20px" mb="20px">
        <Text fontSize="xl" fontWeight="600" mb={4}>Overview</Text>
        <Table size="sm" variant="simple">
          <Tbody>
            <Tr><Td>Roll Number</Td><Td>{student.rollNumber || student.academic?.rollNumber || '-'}</Td></Tr>
            <Tr><Td>RFID Tag</Td><Td>{student.rfidTag || student.academic?.rfidTag || '-'}</Td></Tr>
            <Tr><Td>Attendance</Td><Td>{student.attendance}%</Td></Tr>
            <Tr><Td>Parent Name</Td><Td>{student.parentName || student.parent?.father?.name || '-'}</Td></Tr>
            <Tr><Td>Parent Phone</Td><Td>{student.parentPhone || student.parent?.father?.phone || '-'}</Td></Tr>
            <Tr><Td>Status</Td><Td>{student.status || 'active'}</Td></Tr>
            <Tr><Td>Admission Date</Td><Td>{(student.admissionDate || student.academic?.admissionDate) ? new Date(student.admissionDate || student.academic?.admissionDate).toLocaleDateString() : '-'}</Td></Tr>
          </Tbody>
        </Table>
      </Card>

      {/* Personal Information */}
      <Card p="20px" mb="20px">
        <Text fontSize="xl" fontWeight="600" mb={4}>Personal Information</Text>
        <Table size="sm" variant="simple">
          <Tbody>
            <Tr><Td>Full Name</Td><Td>{student.personal?.name || student.name}</Td></Tr>
            <Tr><Td>Gender</Td><Td>{student.personal?.gender || '-'}</Td></Tr>
            <Tr><Td>Date of Birth</Td><Td>{student.personal?.dateOfBirth ? new Date(student.personal.dateOfBirth).toLocaleDateString() : '-'}</Td></Tr>
            <Tr><Td>Blood Group</Td><Td>{student.personal?.bloodGroup || '-'}</Td></Tr>
            <Tr><Td>Religion</Td><Td>{student.personal?.religion || '-'}</Td></Tr>
            <Tr><Td>Nationality</Td><Td>{student.personal?.nationality || '-'}</Td></Tr>
            <Tr><Td>CNIC</Td><Td>{student.personal?.cnic || '-'}</Td></Tr>
            <Tr><Td>Email</Td><Td>{student.personal?.email || student.email || '-'}</Td></Tr>
            <Tr><Td>Phone</Td><Td>{student.personal?.phone || '-'}</Td></Tr>
            <Tr><Td>Address</Td><Td>{student.personal?.address ? [student.personal.address.street, student.personal.address.city, student.personal.address.province, student.personal.address.postalCode].filter(Boolean).join(', ') : '-'}</Td></Tr>
            <Tr><Td>Medical Conditions</Td><Td>{student.personal?.medicalConditions || '-'}</Td></Tr>
          </Tbody>
        </Table>
      </Card>

      {/* Academic Information */}
      <Card p="20px" mb="20px">
        <Text fontSize="xl" fontWeight="600" mb={4}>Academic Information</Text>
        <Table size="sm" variant="simple">
          <Tbody>
            <Tr><Td>Admission Number</Td><Td>{student.academic?.admissionNumber || '-'}</Td></Tr>
            <Tr><Td>Academic Year</Td><Td>{student.academic?.academicYear || '-'}</Td></Tr>
            <Tr><Td>Class</Td><Td>{student.academic?.class || student.class || '-'}</Td></Tr>
            <Tr><Td>Section</Td><Td>{student.academic?.section || student.section || '-'}</Td></Tr>
            <Tr><Td>Stream</Td><Td>{student.academic?.stream || '-'}</Td></Tr>
            <Tr><Td>RFID Tag</Td><Td>{student.academic?.rfidTag || student.rfidTag || '-'}</Td></Tr>
            <Tr><Td>Admission Date</Td><Td>{student.academic?.admissionDate ? new Date(student.academic.admissionDate).toLocaleDateString() : (student.admissionDate ? new Date(student.admissionDate).toLocaleDateString() : '-')}</Td></Tr>
            <Tr><Td>Previous School</Td><Td>{student.academic?.previousEducation?.schoolName || '-'}</Td></Tr>
            <Tr><Td>Previous Class</Td><Td>{student.academic?.previousEducation?.class || '-'}</Td></Tr>
            <Tr><Td>Last Attended</Td><Td>{student.academic?.previousEducation?.lastAttendedDate ? new Date(student.academic.previousEducation.lastAttendedDate).toLocaleDateString() : '-'}</Td></Tr>
            <Tr><Td>TC No.</Td><Td>{student.academic?.previousEducation?.transferCertificateNo || '-'}</Td></Tr>
            <Tr><Td>Prev. Remarks</Td><Td>{student.academic?.previousEducation?.remarks || '-'}</Td></Tr>
            <Tr><Td>Special Needs</Td><Td>{student.academic?.specialNeeds || '-'}</Td></Tr>
            <Tr><Td>Needs Extra Attention</Td><Td>{student.academic?.needsExtraAttention ? 'Yes' : 'No'}</Td></Tr>
            <Tr><Td>Learning Difficulties</Td><Td>{student.academic?.hasLearningDifficulties ? 'Yes' : 'No'}</Td></Tr>
            <Tr><Td>Accommodations</Td><Td>{student.academic?.accommodations || '-'}</Td></Tr>
          </Tbody>
        </Table>
      </Card>

      {/* Parent / Guardian Information */}
      <Card p="20px" mb="20px">
        <Text fontSize="xl" fontWeight="600" mb={4}>Parent/Guardian Information</Text>
        <Text fontWeight="600" mb={2}>Father</Text>
        <Table size="sm" variant="simple" mb={4}>
          <Tbody>
            <Tr><Td>Name</Td><Td>{student.parent?.father?.name || '-'}</Td></Tr>
            <Tr><Td>CNIC</Td><Td>{student.parent?.father?.cnic || '-'}</Td></Tr>
            <Tr><Td>Phone</Td><Td>{student.parent?.father?.phone || '-'}</Td></Tr>
            <Tr><Td>Email</Td><Td>{student.parent?.father?.email || '-'}</Td></Tr>
            <Tr><Td>Occupation</Td><Td>{student.parent?.father?.occupation || '-'}</Td></Tr>
            <Tr><Td>Income</Td><Td>{student.parent?.father?.income || '-'}</Td></Tr>
          </Tbody>
        </Table>
        <Text fontWeight="600" mb={2}>Mother</Text>
        <Table size="sm" variant="simple" mb={4}>
          <Tbody>
            <Tr><Td>Name</Td><Td>{student.parent?.mother?.name || '-'}</Td></Tr>
            <Tr><Td>CNIC</Td><Td>{student.parent?.mother?.cnic || '-'}</Td></Tr>
            <Tr><Td>Phone</Td><Td>{student.parent?.mother?.phone || '-'}</Td></Tr>
            <Tr><Td>Email</Td><Td>{student.parent?.mother?.email || '-'}</Td></Tr>
            <Tr><Td>Occupation</Td><Td>{student.parent?.mother?.occupation || '-'}</Td></Tr>
            <Tr><Td>Income</Td><Td>{student.parent?.mother?.income || '-'}</Td></Tr>
          </Tbody>
        </Table>
        <Text fontWeight="600" mb={2}>Guardian</Text>
        <Table size="sm" variant="simple" mb={4}>
          <Tbody>
            <Tr><Td>Name</Td><Td>{student.parent?.guardian?.name || '-'}</Td></Tr>
            <Tr><Td>Relationship</Td><Td>{student.parent?.guardian?.relationship || '-'}</Td></Tr>
            <Tr><Td>Phone</Td><Td>{student.parent?.guardian?.phone || '-'}</Td></Tr>
            <Tr><Td>CNIC</Td><Td>{student.parent?.guardian?.cnic || '-'}</Td></Tr>
            <Tr><Td>Address</Td><Td>{
              typeof student.parent?.guardian?.address === 'object' && student.parent?.guardian?.address !== null
                ? JSON.stringify(student.parent.guardian.address)
                : (student.parent?.guardian?.address || '-')
            }</Td></Tr>
          </Tbody>
        </Table>
        <Text fontWeight="600" mb={2}>Emergency Contact</Text>
        <Table size="sm" variant="simple" mb={4}>
          <Tbody>
            <Tr><Td>Name</Td><Td>{student.parent?.emergency?.name || '-'}</Td></Tr>
            <Tr><Td>Relationship</Td><Td>{student.parent?.emergency?.relationship || '-'}</Td></Tr>
            <Tr><Td>Phone</Td><Td>{student.parent?.emergency?.phone || '-'}</Td></Tr>
            <Tr><Td>Alternate Phone</Td><Td>{student.parent?.emergency?.alternatePhone || '-'}</Td></Tr>
          </Tbody>
        </Table>
        <Table size="sm" variant="simple">
          <Tbody>
            <Tr><Td>Siblings</Td><Td>{
              Array.isArray(student.parent?.siblings)
                ? (student.parent.siblings.length
                    ? student.parent.siblings
                        .map((s) => {
                          if (!s) return null;
                          const name = s.name || '';
                          const cls = s.class || s.grade || '';
                          const sec = s.section || '';
                          const detail = [cls, sec].filter(Boolean).join('-');
                          return [name, detail && `(${detail})`].filter(Boolean).join(' ');
                        })
                        .filter(Boolean)
                        .join(', ')
                    : '-')
                : (typeof student.parent?.siblings === 'object' && student.parent?.siblings
                    ? JSON.stringify(student.parent.siblings)
                    : (student.parent?.siblings ?? '-'))
            }</Td></Tr>
            <Tr><Td>Siblings in School</Td><Td>{
              Array.isArray(student.parent?.siblingsInSchool)
                ? (student.parent.siblingsInSchool.length
                    ? student.parent.siblingsInSchool
                        .map((x) => (x && typeof x === 'object' ? JSON.stringify(x) : String(x)))
                        .join(', ')
                    : '-')
                : (typeof student.parent?.siblingsInSchool === 'object' && student.parent?.siblingsInSchool
                    ? JSON.stringify(student.parent.siblingsInSchool)
                    : (student.parent?.siblingsInSchool ?? '-'))
            }</Td></Tr>
            <Tr><Td>Family Size</Td><Td>{student.parent?.familySize ?? '-'}</Td></Tr>
            <Tr><Td>Family Notes</Td><Td>{student.parent?.familyNotes || '-'}</Td></Tr>
          </Tbody>
        </Table>
      </Card>

      {/* Transport Information */}
      <Card p="20px" mb="20px">
        <Text fontSize="xl" fontWeight="600" mb={4}>Transport Information</Text>
        <Table size="sm" variant="simple">
          <Tbody>
            <Tr><Td>Uses Transport</Td><Td>{student.transport?.usesTransport ? 'Yes' : 'No'}</Td></Tr>
            <Tr><Td>Route</Td><Td>{student.transport?.routeId || '-'}</Td></Tr>
            <Tr><Td>Bus Number</Td><Td>{student.transport?.busNumber || student.busNumber || '-'}</Td></Tr>
            <Tr><Td>Pickup Point</Td><Td>{student.transport?.pickupPoint || '-'}</Td></Tr>
            <Tr><Td>Drop Point</Td><Td>{student.transport?.dropPoint || '-'}</Td></Tr>
            <Tr><Td>Pickup Time</Td><Td>{student.transport?.pickupTime || '-'}</Td></Tr>
            <Tr><Td>Drop Time</Td><Td>{student.transport?.dropTime || '-'}</Td></Tr>
            <Tr><Td>Notes</Td><Td>{student.transport?.notes || '-'}</Td></Tr>
            <Tr><Td>Distance</Td><Td>{student.transport?.distanceFromSchool ?? '-'}</Td></Tr>
            <Tr><Td>Fee Category</Td><Td>{student.transport?.feeCategory || '-'}</Td></Tr>
            <Tr><Td>Alternative Mode</Td><Td>{student.transport?.alternativeMode || '-'}</Td></Tr>
            <Tr><Td>Van Service</Td><Td>{student.transport?.vanServiceProvider || '-'}</Td></Tr>
            <Tr><Td>Van Driver Contact</Td><Td>{student.transport?.vanDriverContact || '-'}</Td></Tr>
            <Tr><Td>Alternative Notes</Td><Td>{student.transport?.alternativeNotes || '-'}</Td></Tr>
          </Tbody>
        </Table>
      </Card>

      {/* Fee Information */}
      <Card p="20px" mb="20px">
        <Text fontSize="xl" fontWeight="600" mb={4}>Fee Structure</Text>
        <Table size="sm" variant="simple" mb={4}>
          <Tbody>
            <Tr><Td>Fee Plan</Td><Td>{student.fee?.feePlan || '-'}</Td></Tr>
            <Tr><Td>Academic Year</Td><Td>{student.fee?.academicYear || '-'}</Td></Tr>
            <Tr><Td>New Admission</Td><Td>{student.fee?.isNewAdmission ? 'Yes' : 'No'}</Td></Tr>
            <Tr><Td>Payment Schedule</Td><Td>{student.fee?.paymentSchedule || '-'}</Td></Tr>
            <Tr><Td>First Payment Due</Td><Td>{student.fee?.firstPaymentDue ? new Date(student.fee.firstPaymentDue).toLocaleDateString() : '-'}</Td></Tr>
            <Tr><Td>Payment Methods</Td><Td>{Array.isArray(student.fee?.paymentMethods) ? student.fee.paymentMethods.join(', ') : '-'}</Td></Tr>
          </Tbody>
        </Table>
        <Table size="sm" variant="simple" mb={4}>
          <Tbody>
            <Tr><Td>Monthly Tuition Fee</Td><Td>{student.fee?.tuitionFee ?? '-'}</Td></Tr>
            <Tr><Td>Admission Fee</Td><Td>{student.fee?.admissionFee ?? '-'}</Td></Tr>
            <Tr><Td>Transport Fee</Td><Td>{student.fee?.transportFee ?? '-'}</Td></Tr>
            <Tr><Td>Library Fee</Td><Td>{student.fee?.libraryFee ?? '-'}</Td></Tr>
            <Tr><Td>Lab Fee</Td><Td>{student.fee?.labFee ?? '-'}</Td></Tr>
            <Tr><Td>Exam Fee</Td><Td>{student.fee?.examFee ?? '-'}</Td></Tr>
            <Tr><Td>Activity Fee</Td><Td>{student.fee?.activityFee ?? '-'}</Td></Tr>
          </Tbody>
        </Table>
        <Text fontWeight="600" mb={2}>Discount</Text>
        <Table size="sm" variant="simple">
          <Tbody>
            <Tr><Td>Applicable</Td><Td>{student.fee?.discount?.applicable ? 'Yes' : 'No'}</Td></Tr>
            <Tr><Td>Type</Td><Td>{student.fee?.discount?.type || '-'}</Td></Tr>
            <Tr><Td>Value</Td><Td>{student.fee?.discount?.value ?? '-'}</Td></Tr>
            <Tr><Td>Reason</Td><Td>{student.fee?.discount?.reason || '-'}</Td></Tr>
            <Tr><Td>Approved By</Td><Td>{student.fee?.discount?.approvedBy || '-'}</Td></Tr>
          </Tbody>
        </Table>
      </Card>
    </Box>
  );
}
