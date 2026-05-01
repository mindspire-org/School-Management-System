import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Icon,
  Input,
  InputGroup,
  InputRightElement,
  Select,
  Text,
  useColorModeValue,
  Alert,
  AlertIcon,
  VStack,
} from '@chakra-ui/react';
import DefaultAuth from '../../layouts/auth/Default';
// Use custom illustration from public instead of Horizon UI asset
const illustration = '/imgbin_04038f2dad4024b37accec200ae57e31.png';
import { MdOutlineRemoveRedEye } from 'react-icons/md';
import { RiEyeCloseLine } from 'react-icons/ri';
import { register as registerApi, status as authStatus } from '../../services/api/auth';

function SignUp() {
  const textColor = useColorModeValue('navy.700', 'white');
  const textColorSecondary = 'gray.400';
  const brandStars = useColorModeValue('brand.500', 'brand.400');

  const [show, setShow] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');
  const [loading, setLoading] = useState(false);
  const [adminExists, setAdminExists] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const s = await authStatus();
        if (mounted) {
          setAdminExists(Boolean(s?.adminExists));
          if (Boolean(s?.adminExists) && role === 'admin') setRole('teacher');
        }
      } catch (_) {}
    })();
    return () => { mounted = false; };
  }, []);

  const handleClick = () => setShow(!show);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (adminExists && role === 'admin') {
        setError('An Admin account already exists. Admin signup is disabled.');
        return;
      }
      setLoading(true);
      await registerApi({ email, password, name, role });
      navigate('/auth/sign-in');
    } catch (err) {
      const message = err?.message || 'Failed to create account';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DefaultAuth illustrationBackground={illustration} image={illustration}>
      <Flex
        maxW={{ base: '100%', md: 'max-content' }}
        w="100%"
        mx={{ base: 'auto', lg: '0px' }}
        me="auto"
        h="100%"
        alignItems="start"
        justifyContent="center"
        mb={{ base: '30px', md: '60px' }}
        px={{ base: '25px', md: '0px' }}
        mt={{ base: '40px', md: '14vh' }}
        flexDirection="column"
      >
        <Box me="auto">
          <Heading color={textColor} fontSize="36px" mb="10px">
            Create an account
          </Heading>
          <Text
            mb="36px"
            ms="4px"
            color={textColorSecondary}
            fontWeight="400"
            fontSize="md"
          >
            Sign up to access Mindspire School Management System
          </Text>
        </Box>

        <Flex
          zIndex="2"
          direction="column"
          w={{ base: '100%', md: '420px' }}
          maxW="100%"
          background="transparent"
          borderRadius="15px"
          mx={{ base: 'auto', lg: 'unset' }}
          me="auto"
          mb={{ base: '20px', md: 'auto' }}
        >
          {error && (
            <Alert status="error" borderRadius="12px" mb="20px">
              <AlertIcon />
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <FormControl>
              <FormLabel
                display="flex"
                ms="4px"
                fontSize="sm"
                fontWeight="500"
                color={textColor}
                mb="8px"
              >
                Full Name<Text color={brandStars}>*</Text>
              </FormLabel>
              <Input
                isRequired
                variant="auth"
                fontSize="sm"
                type="text"
                placeholder="Enter your full name"
                mb="24px"
                fontWeight="500"
                size="lg"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />

              <FormLabel
                display="flex"
                ms="4px"
                fontSize="sm"
                fontWeight="500"
                color={textColor}
                mb="8px"
              >
                Email<Text color={brandStars}>*</Text>
              </FormLabel>
              <Input
                isRequired
                variant="auth"
                fontSize="sm"
                type="email"
                placeholder="Enter your email"
                mb="24px"
                fontWeight="500"
                size="lg"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />

              <FormLabel
                ms="4px"
                fontSize="sm"
                fontWeight="500"
                color={textColor}
                display="flex"
              >
                Password<Text color={brandStars}>*</Text>
              </FormLabel>
              <InputGroup size="md">
                <Input
                  isRequired
                  fontSize="sm"
                  placeholder="Create a password"
                  mb="24px"
                  size="lg"
                  type={show ? 'text' : 'password'}
                  variant="auth"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <InputRightElement display="flex" alignItems="center" mt="4px">
                  <Icon
                    color={textColorSecondary}
                    _hover={{ cursor: 'pointer' }}
                    as={show ? RiEyeCloseLine : MdOutlineRemoveRedEye}
                    onClick={handleClick}
                  />
                </InputRightElement>
              </InputGroup>

              <FormLabel
                ms="4px"
                fontSize="sm"
                fontWeight="500"
                color={textColor}
                display="flex"
              >
                Role
              </FormLabel>
              <Select
                mb="24px"
                size="lg"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={loading}
              >
                <option value="admin" disabled={adminExists}>Admin</option>
                <option value="teacher">Teacher</option>
                <option value="student">Student</option>
                <option value="driver">Driver</option>
              </Select>
              {adminExists && (
                <Text color="red.500" fontSize="sm" mb="12px">Admin signup is disabled because an Admin already exists.</Text>
              )}

              <Button
                fontSize="sm"
                variant="brand"
                fontWeight="500"
                w="100%"
                h="50"
                mb="16px"
                type="submit"
                isLoading={loading}
                loadingText="Signing up..."
              >
                Sign Up
              </Button>

              <VStack spacing={0} align="center" mb="8px">
                <Text color={textColorSecondary} fontSize="sm">
                  Already have an account?{' '}
                  <NavLink to="/auth/sign-in">
                    <Text as="span" color={brandStars} fontWeight="500">
                      Sign in
                    </Text>
                  </NavLink>
                </Text>
              </VStack>
            </FormControl>
          </form>
        </Flex>
      </Flex>
    </DefaultAuth>
  );
}

export default SignUp;
