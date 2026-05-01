import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
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
  InputLeftElement,
  InputRightElement,
  Text,
  useColorModeValue,
  Alert,
  AlertIcon,
  VStack,
  Divider,
  HStack,
} from '@chakra-ui/react';
// Custom components
import DefaultAuth from '../../layouts/auth/Default';
// Assets - use custom public illustration instead of Horizon UI screen
const illustration = '/imgbin_04038f2dad4024b37accec200ae57e31.png';
import { MdOutlineRemoveRedEye, MdOutlineEmail, MdVpnKey, MdSchool } from 'react-icons/md';
import { RiEyeCloseLine, RiLockLine } from 'react-icons/ri';
// Auth Context
import { useAuth } from '../../contexts/AuthContext';
import { authApi } from '../../services/api';

function SignIn() {
  // Chakra color mode
  const textColor = useColorModeValue('navy.700', 'white');
  const textColorSecondary = 'gray.400';
  const brandStars = useColorModeValue('brand.500', 'brand.400');
  const inputBorder = useColorModeValue('gray.200', 'whiteAlpha.200');
  const inputHoverBorder = useColorModeValue('brand.500', 'brand.400');

  // State
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [ownerKey, setOwnerKey] = useState('');
  const [showOwnerKey, setShowOwnerKey] = useState(false);
  const [setupMode, setSetupMode] = useState(true);
  const [allowedModules, setAllowedModules] = useState([]);
  const [ownerStep1Passed, setOwnerStep1Passed] = useState(false);
  const ownerKeyRef = useRef(null);
  const ownerKeyBlockRef = useRef(null);

  const ownerEmail = 'qutaibah@mindspire.org';
  const isOwnerEmail = String(email).trim().toLowerCase() === ownerEmail.toLowerCase();

  // Auth Context
  const { login, clearError, loading: authLoading, error: authError, isAuthenticated } = useAuth();

  // Handle click to show/hide password
  const handleClick = () => setShow(!show);

  // On mount and auth changes, just clear previous errors (do not auto-redirect)
  useEffect(() => {
    clearError();
  }, [clearError, isAuthenticated]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const st = await authApi.status();
        if (mounted) {
          setSetupMode(!Boolean(st?.licensingConfigured));
          setAllowedModules(Array.isArray(st?.allowedModules) ? st.allowedModules : []);
        }
      } catch (_) {
        if (mounted) setSetupMode(true);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Two-step owner flow: first verify creds, then prompt for license key
    if (isOwnerEmail) {
      // Step 1: if key not yet provided and step1 not passed, attempt login to trigger owner-key prompt
      if (!ownerStep1Passed && !ownerKey) {
        const res = await login(email, password, false, undefined);
        if (!res?.success) {
          const requiresKey =
            res?.status === 401 && (res?.data?.code === 'OWNER_KEY_REQUIRED' || /owner key|key not set/i.test(String(res?.error || '')));
          if (requiresKey) {
            // Treat as step-1 success; reveal key field without showing error
            clearError();
            setOwnerStep1Passed(true);
            setTimeout(() => {
              try { ownerKeyRef.current?.focus({ preventScroll: false }); } catch (_) {}
            }, 0);
          }
        }
        // stop here regardless; either error shown or key field revealed
        return;
      }
      // Step 2: have key, complete login
      await login(email, password, false, ownerKey);
      return;
    }
    // Non-owner: normal login
    await login(email, password, false, undefined);
  };

  // After step 1 passes, focus license key
  useEffect(() => {
    if (ownerStep1Passed) {
      setTimeout(() => {
        try { ownerKeyRef.current?.focus({ preventScroll: false }); } catch (_) {}
      }, 0);
    }
  }, [ownerStep1Passed]);

  // Ensure the license key block scrolls into view whenever owner is selected or owner email typed
  useEffect(() => {
    if (isOwnerEmail) {
      setTimeout(() => {
        try { ownerKeyBlockRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (_) {}
      }, 0);
    }
  }, [isOwnerEmail]);

  return (
    <DefaultAuth illustrationBackground={illustration} image={illustration}>
      <Flex
        direction='column'
        w='100%'
        h='100%'
        alignItems='start'
        justifyContent='center'
        px='0'>
        {/* Header section */}
        <Flex direction='column' mb='32px' w='100%'>
          <HStack spacing='12px' mb='16px'>
            <Flex
              w='40px'
              h='40px'
              borderRadius='12px'
              bgGradient='linear(135deg, brand.500, brand.400)'
              align='center'
              justify='center'>
              <Icon as={MdSchool} color='white' boxSize='5' />
            </Flex>
            <Text
              fontSize='sm'
              fontWeight='600'
              color={brandStars}
              letterSpacing='0.5px'
              textTransform='uppercase'>
              MindSpire
            </Text>
          </HStack>
          <Heading
            fontSize='28px'
            lineHeight='1.2'
            mb='8px'
            bgGradient='linear(135deg, navy.700, navy.400)'
            bgClip='text'
            fontWeight='800'>
            Welcome Back
          </Heading>
          <Text
            color={textColorSecondary}
            fontWeight='400'
            fontSize='14px'>
            Sign in to access your school management portal
          </Text>
        </Flex>

        {/* Status banner */}
        <Alert
          status={setupMode ? 'warning' : 'info'}
          borderRadius='14px'
          mb='20px'
          bg={setupMode ? 'orange.50' : 'blue.50'}
          borderWidth='1px'
          borderColor={setupMode ? 'orange.200' : 'blue.200'}>
          <AlertIcon color={setupMode ? 'orange.500' : 'blue.500'} />
          <VStack align='start' spacing={1} fontSize='sm'>
            {setupMode ? (
              <Text fontSize='xs' color='orange.700' fontWeight='500'>
                System setup pending — only the Owner can sign in until licensing is configured.
              </Text>
            ) : (
              <Text fontSize='xs' color='blue.700' fontWeight='500'>
                Licensed modules active: {allowedModules.length ? allowedModules.join(', ') : 'None'}
              </Text>
            )}
          </VStack>
        </Alert>

        {/* Error Alert */}
        {authError && (
          <Alert
            status='error'
            borderRadius='14px'
            mb='20px'
            borderWidth='1px'
            borderColor='red.200'>
            <AlertIcon />
            <Text fontSize='sm' fontWeight='500'>{authError}</Text>
          </Alert>
        )}

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <FormControl mb='20px'>
            <FormLabel
              htmlFor='login-email'
              display='flex'
              ms='2px'
              fontSize='13px'
              fontWeight='600'
              color={textColor}
              mb='8px'>
              Email / Phone / Username<Text color={brandStars} ml='2px'>*</Text>
            </FormLabel>
            <InputGroup size='lg'>
              <InputLeftElement
                pointerEvents='none'
                h='100%'
                w='48px'
                display='flex'
                alignItems='center'
                justifyContent='center'>
                <Icon as={MdOutlineEmail} color='gray.400' boxSize='4' />
              </InputLeftElement>
              <Input
                id='login-email'
                isRequired={true}
                variant='auth'
                fontSize='14px'
                type='text'
                placeholder='Enter email, WhatsApp number, or username'
                fontWeight='500'
                size='lg'
                pl='48px'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={authLoading}
                borderColor={inputBorder}
                _hover={{ borderColor: inputHoverBorder }}
                _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px brand.500' }}
                borderRadius='12px'
              />
            </InputGroup>
          </FormControl>

          <FormControl mb='20px'>
            <FormLabel
              htmlFor='login-password'
              ms='2px'
              fontSize='13px'
              fontWeight='600'
              color={textColor}
              display='flex'>
              Password<Text color={brandStars} ml='2px'>*</Text>
            </FormLabel>
            <InputGroup size='lg'>
              <InputLeftElement
                pointerEvents='none'
                h='100%'
                w='48px'
                display='flex'
                alignItems='center'
                justifyContent='center'>
                <Icon as={RiLockLine} color='gray.400' boxSize='4' />
              </InputLeftElement>
              <Input
                id='login-password'
                isRequired={true}
                fontSize='14px'
                placeholder='Enter your password'
                size='lg'
                pl='48px'
                type={show ? 'text' : 'password'}
                variant='auth'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={authLoading}
                borderColor={inputBorder}
                _hover={{ borderColor: inputHoverBorder }}
                _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px brand.500' }}
                borderRadius='12px'
              />
              <InputRightElement display='flex' alignItems='center' h='100%' w='48px'>
                <Icon
                  color='gray.400'
                  _hover={{ cursor: 'pointer', color: 'gray.600' }}
                  as={show ? RiEyeCloseLine : MdOutlineRemoveRedEye}
                  onClick={handleClick}
                  boxSize='4'
                />
              </InputRightElement>
            </InputGroup>
          </FormControl>

          {(isOwnerEmail || ownerStep1Passed) ? (
            <FormControl mb='20px'>
              <FormLabel
                htmlFor='login-license-key'
                ms='2px'
                fontSize='13px'
                fontWeight='600'
                color={textColor}
                display='flex'>
                License Key<Text color={brandStars} ml='2px'>*</Text>
              </FormLabel>
              <InputGroup size='lg' ref={ownerKeyBlockRef}>
                <InputLeftElement
                  pointerEvents='none'
                  h='100%'
                  w='48px'
                  display='flex'
                  alignItems='center'
                  justifyContent='center'>
                  <Icon as={MdVpnKey} color='gray.400' boxSize='4' />
                </InputLeftElement>
                <Input
                  id='login-license-key'
                  isRequired={ownerStep1Passed}
                  fontSize='14px'
                  placeholder='Enter license key'
                  size='lg'
                  pl='48px'
                  type={showOwnerKey ? 'text' : 'password'}
                  variant='auth'
                  value={ownerKey}
                  onChange={(e) => setOwnerKey(e.target.value)}
                  ref={ownerKeyRef}
                  disabled={authLoading || !ownerStep1Passed}
                  borderColor={inputBorder}
                  _hover={{ borderColor: inputHoverBorder }}
                  _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px brand.500' }}
                  borderRadius='12px'
                />
                <InputRightElement display='flex' alignItems='center' h='100%' w='48px'>
                  <Icon
                    color='gray.400'
                    _hover={{ cursor: 'pointer', color: 'gray.600' }}
                    as={showOwnerKey ? RiEyeCloseLine : MdOutlineRemoveRedEye}
                    onClick={() => setShowOwnerKey(!showOwnerKey)}
                    boxSize='4'
                  />
                </InputRightElement>
              </InputGroup>
            </FormControl>
          ) : null}

          <Button
            fontSize='15px'
            variant='brand'
            fontWeight='700'
            w='100%'
            h='52px'
            mb='20px'
            type='submit'
            isLoading={authLoading}
            isDisabled={authLoading || (setupMode && !isOwnerEmail)}
            loadingText='Signing in...'
            borderRadius='14px'
            _hover={{
              transform: 'translateY(-1px)',
              boxShadow: '0 8px 25px rgba(66,42,251,0.35)',
            }}
            _active={{
              transform: 'translateY(0px)',
            }}
            transition='all 0.2s ease'
            boxShadow='0 4px 15px rgba(66,42,251,0.25)'>
            Sign In
          </Button>

          <Flex justifyContent='center' mb='20px'>
            <Text color='gray.400' fontSize='13px'>
              Don't have an account?{' '}
              <NavLink to='/auth/sign-up'>
                <Text
                  as='span'
                  color={brandStars}
                  fontWeight='600'
                  _hover={{ textDecoration: 'underline' }}>
                  Sign up
                </Text>
              </NavLink>
            </Text>
          </Flex>
        </form>

        <Divider mb='16px' />

        <Flex
          flexDirection='column'
          justifyContent='center'
          alignItems='start'
          maxW='100%'>
          <Text color='gray.400' fontWeight='400' fontSize='12px'>
            MINDSPIRE School Management System
          </Text>
          <Text color='gray.300' fontWeight='400' fontSize='11px'>
            Version 1.0.0
          </Text>
        </Flex>
      </Flex>
    </DefaultAuth>
  );
}

export default SignIn;
