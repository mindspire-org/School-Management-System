import React, { type ReactNode } from 'react';
import {
  Avatar,
  Box,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerOverlay,
  Flex,
  HStack,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Link,
  Text,
  VStack,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react';
import { MdMenu, MdSearch } from 'react-icons/md';

export type DashboardNavItem = {
  label: string;
  href?: string;
  icon?: React.ElementType;
  onClick?: () => void;
};

export type DashboardShellProps = {
  title?: string;
  navItems: DashboardNavItem[];
  children: ReactNode;
  user?: { name: string; email?: string };
};

function SidebarContent({ navItems }: { navItems: DashboardNavItem[] }) {
  const bg = useColorModeValue('white', 'gray.900');
  const borderColor = useColorModeValue('gray.100', 'whiteAlpha.200');

  return (
    <Box bg={bg} w={{ base: 'full', lg: '280px' }} h="full" borderRightWidth="1px" borderColor={borderColor} px={4} py={5}>
      <Flex align="center" justify="space-between" mb={6}>
        <Text fontSize="lg" fontWeight={800} color={useColorModeValue('gray.800', 'white')}>
          Academia Pro
        </Text>
      </Flex>
      <VStack align="stretch" spacing={1}>
        {navItems.map((item) => {
          const content = (
            <HStack
              key={item.label}
              px={3}
              py={2}
              borderRadius="md"
              _hover={{ bg: useColorModeValue('gray.50', 'whiteAlpha.100') }}
              cursor="pointer"
              onClick={item.onClick}
            >
              {item.icon ? <Icon as={item.icon} color={useColorModeValue('gray.600', 'gray.300')} /> : null}
              <Text fontWeight={600} fontSize="sm" color={useColorModeValue('gray.700', 'gray.200')}>
                {item.label}
              </Text>
            </HStack>
          );

          if (item.href) {
            return (
              <Link key={item.label} href={item.href} _hover={{ textDecoration: 'none' }}>
                {content}
              </Link>
            );
          }

          return content;
        })}
      </VStack>
    </Box>
  );
}

export default function DashboardShell({ title, navItems, children, user }: DashboardShellProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const bg = useColorModeValue('gray.50', 'gray.950');
  const cardBg = useColorModeValue('white', 'gray.900');
  const borderColor = useColorModeValue('gray.100', 'whiteAlpha.200');

  return (
    <Flex minH="100vh" bg={bg}>
      <Box display={{ base: 'none', lg: 'block' }}>
        <SidebarContent navItems={navItems} />
      </Box>

      <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="xs">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerBody p={0}>
            <SidebarContent navItems={navItems} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <Flex direction="column" flex="1" minW={0}>
        <Flex
          align="center"
          justify="space-between"
          px={{ base: 4, md: 6 }}
          py={4}
          bg={cardBg}
          borderBottomWidth="1px"
          borderColor={borderColor}
        >
          <HStack spacing={3} minW={0}>
            <IconButton
              aria-label="Open navigation"
              icon={<MdMenu />}
              variant="ghost"
              display={{ base: 'inline-flex', lg: 'none' }}
              onClick={onOpen}
            />
            <Box minW={0}>
              <Text fontSize="lg" fontWeight={800} isTruncated>
                {title || 'Dashboard'}
              </Text>
              {user?.email ? (
                <Text fontSize="xs" color={useColorModeValue('gray.600', 'gray.400')} isTruncated>
                  {user.email}
                </Text>
              ) : null}
            </Box>
          </HStack>

          <HStack spacing={3}>
            <InputGroup display={{ base: 'none', md: 'block' }} w={{ md: '260px', lg: '320px' }}>
              <InputLeftElement pointerEvents="none">
                <Icon as={MdSearch} color={useColorModeValue('gray.400', 'gray.500')} />
              </InputLeftElement>
              <Input aria-label="Search" placeholder="Search..." bg={useColorModeValue('gray.50', 'whiteAlpha.100')} />
            </InputGroup>
            <Avatar size="sm" name={user?.name || 'User'} />
          </HStack>
        </Flex>

        <Box px={{ base: 4, md: 6 }} py={{ base: 5, md: 6 }}>
          {children}
        </Box>
      </Flex>
    </Flex>
  );
}
