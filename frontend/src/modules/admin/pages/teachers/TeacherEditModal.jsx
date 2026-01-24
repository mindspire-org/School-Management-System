import React, { useRef } from 'react';
import {
  Avatar,
  Box,
  Button,
  Divider,
  FormControl,
  FormErrorMessage,
  FormLabel,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  SimpleGrid,
  Text,
  Textarea,
} from '@chakra-ui/react';
import { EditIcon } from '@chakra-ui/icons';

const TeacherEditModal = ({
  isOpen,
  onClose,
  form,
  errors,
  onChange,
  onSubmit,
  statusOptions = [],
  currencyOptions = [],
  formatLabel = (value) => value,
  isSubmitting,
  avatarPreview = '',
  onAvatarChange = () => {},
}) => {
  const fileInputRef = useRef(null);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size='4xl' scrollBehavior='inside'>
      <ModalOverlay />
      <ModalContent as='form' onSubmit={onSubmit}>
        <ModalHeader>Edit Teacher</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {form && (
            <Box>
              <Box textAlign='center' mb={6}>
                <Box position='relative' display='inline-block'>
                  <Avatar size='xl' name={form.name} src={avatarPreview} />
                  <IconButton
                    icon={<EditIcon />}
                    size='sm'
                    colorScheme='blue'
                    position='absolute'
                    bottom='0'
                    left='0'
                    borderRadius='full'
                    aria-label='Update profile photo'
                    onClick={() => fileInputRef.current?.click()}
                  />
                  <Input
                    type='file'
                    accept='image/*'
                    ref={fileInputRef}
                    display='none'
                    onChange={onAvatarChange}
                  />
                </Box>
                <Text mt={2} fontSize='xs' color='gray.500'>Update profile photo</Text>
              </Box>

              <Text fontWeight='600' mb={3}>Basic Information</Text>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl isRequired isInvalid={!!errors?.name}>
                  <FormLabel>Name</FormLabel>
                  <Input name='name' value={form.name} onChange={onChange} placeholder='Full name' />
                  {errors?.name && <FormErrorMessage>{errors.name}</FormErrorMessage>}
                </FormControl>
                <FormControl isRequired isInvalid={!!errors?.email}>
                  <FormLabel>Email</FormLabel>
                  <Input name='email' type='email' value={form.email} onChange={onChange} placeholder='Email address' />
                  {errors?.email && <FormErrorMessage>{errors.email}</FormErrorMessage>}
                </FormControl>
                <FormControl>
                  <FormLabel>Phone</FormLabel>
                  <Input name='phone' value={form.phone} onChange={onChange} placeholder='Contact number' />
                </FormControl>
                <FormControl>
                  <FormLabel>Employee ID</FormLabel>
                  <Input name='employeeId' value={form.employeeId} onChange={onChange} placeholder='EMP-001' />
                </FormControl>
                <FormControl>
                  <FormLabel>Department</FormLabel>
                  <Input name='department' value={form.department} onChange={onChange} placeholder='Department' />
                </FormControl>
                <FormControl>
                  <FormLabel>Designation</FormLabel>
                  <Input name='designation' value={form.designation} onChange={onChange} placeholder='Designation' />
                </FormControl>
                <FormControl>
                  <FormLabel>Qualification</FormLabel>
                  <Input name='qualification' value={form.qualification} onChange={onChange} placeholder='Qualification' />
                </FormControl>
              </SimpleGrid>

            <Divider my={6} />

            <Text fontWeight='600' mb={3}>Professional Details</Text>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl>
                <FormLabel>Specialization</FormLabel>
                <Input name='specialization' value={form.specialization} onChange={onChange} placeholder='Specialization' />
              </FormControl>
              <FormControl>
                <FormLabel>Primary Subject</FormLabel>
                <Input name='subject' value={form.subject} onChange={onChange} placeholder='Subject' />
              </FormControl>
              <FormControl>
                <FormLabel>Employment Status</FormLabel>
                <Select name='employmentStatus' value={form.employmentStatus} onChange={onChange}>
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {formatLabel(status)}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Employment Type</FormLabel>
                <Input name='employmentType' value={form.employmentType} onChange={onChange} placeholder='Full-time / Part-time' />
              </FormControl>
              <FormControl>
                <FormLabel>Joining Date</FormLabel>
                <Input name='joiningDate' type='date' value={form.joiningDate} onChange={onChange} />
              </FormControl>
              <FormControl>
                <FormLabel>Experience (years)</FormLabel>
                <Input name='experienceYears' type='number' value={form.experienceYears} onChange={onChange} placeholder='0' />
              </FormControl>
              <FormControl>
                <FormLabel>Weekly Work Hours</FormLabel>
                <Input name='workHoursPerWeek' type='number' value={form.workHoursPerWeek} onChange={onChange} placeholder='0' />
              </FormControl>
            </SimpleGrid>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mt={4}>
              <FormControl>
                <FormLabel>Subjects (comma separated)</FormLabel>
                <Textarea name='subjects' value={form.subjects} onChange={onChange} placeholder='Mathematics, Physics' rows={2} />
              </FormControl>
              <FormControl>
                <FormLabel>Classes (comma separated)</FormLabel>
                <Textarea name='classes' value={form.classes} onChange={onChange} placeholder='10A, 11B' rows={2} />
              </FormControl>
            </SimpleGrid>

            <Divider my={6} />

            <Text fontWeight='600' mb={3}>Compensation & Banking</Text>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              <FormControl>
                <FormLabel>Base Salary</FormLabel>
                <Input name='baseSalary' type='number' value={form.baseSalary} onChange={onChange} placeholder='0' />
              </FormControl>
              <FormControl>
                <FormLabel>Allowances</FormLabel>
                <Input name='allowances' type='number' value={form.allowances} onChange={onChange} placeholder='0' />
              </FormControl>
              <FormControl>
                <FormLabel>Deductions</FormLabel>
                <Input name='deductions' type='number' value={form.deductions} onChange={onChange} placeholder='0' />
              </FormControl>
              <FormControl>
                <FormLabel>Net Salary</FormLabel>
                <Input name='salary' type='number' value={form.salary} onChange={onChange} placeholder='0' />
              </FormControl>
              <FormControl>
                <FormLabel>Currency</FormLabel>
                <Select name='currency' value={form.currency} onChange={onChange}>
                  {currencyOptions.map((currency) => (
                    <option key={currency} value={currency}>
                      {currency}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Payment Method</FormLabel>
                <Input name='paymentMethod' value={form.paymentMethod} onChange={onChange} placeholder='Bank Transfer' />
              </FormControl>
              <FormControl>
                <FormLabel>Bank Name</FormLabel>
                <Input name='bankName' value={form.bankName} onChange={onChange} placeholder='Bank name' />
              </FormControl>
              <FormControl>
                <FormLabel>Account Number</FormLabel>
                <Input name='accountNumber' value={form.accountNumber} onChange={onChange} placeholder='Account number' />
              </FormControl>
              <FormControl>
                <FormLabel>IBAN</FormLabel>
                <Input name='iban' value={form.iban} onChange={onChange} placeholder='IBAN' />
              </FormControl>
            </SimpleGrid>

            <Divider my={6} />

            <Text fontWeight='600' mb={3}>Emergency & Address</Text>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl>
                <FormLabel>Emergency Contact Name</FormLabel>
                <Input name='emergencyName' value={form.emergencyName} onChange={onChange} placeholder='Contact name' />
              </FormControl>
              <FormControl>
                <FormLabel>Relationship</FormLabel>
                <Input name='emergencyRelation' value={form.emergencyRelation} onChange={onChange} placeholder='Relation' />
              </FormControl>
              <FormControl>
                <FormLabel>Emergency Phone</FormLabel>
                <Input name='emergencyPhone' value={form.emergencyPhone} onChange={onChange} placeholder='Contact number' />
              </FormControl>
              <FormControl>
                <FormLabel>Address Line 1</FormLabel>
                <Input name='address1' value={form.address1} onChange={onChange} placeholder='Street address' />
              </FormControl>
              <FormControl>
                <FormLabel>Address Line 2</FormLabel>
                <Input name='address2' value={form.address2} onChange={onChange} placeholder='Apartment, suite, etc.' />
              </FormControl>
              <FormControl>
                <FormLabel>City</FormLabel>
                <Input name='city' value={form.city} onChange={onChange} placeholder='City' />
              </FormControl>
              <FormControl>
                <FormLabel>State / Province</FormLabel>
                <Input name='state' value={form.state} onChange={onChange} placeholder='State' />
              </FormControl>
              <FormControl>
                <FormLabel>Postal Code</FormLabel>
                <Input name='postalCode' value={form.postalCode} onChange={onChange} placeholder='Postal code' />
              </FormControl>
            </SimpleGrid>
            </Box>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant='ghost' mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme='blue' type='submit' isLoading={isSubmitting}>
            Save Changes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default TeacherEditModal;
