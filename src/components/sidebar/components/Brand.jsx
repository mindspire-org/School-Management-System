import React, { useContext } from "react";

// Chakra imports
import { Flex, useColorModeValue, Image, IconButton, Tooltip, Box } from "@chakra-ui/react";

// Custom components
import { HSeparator } from "components/separator/Separator";

// Assets
import { SidebarContext } from "contexts/SidebarContext";
import { MdKeyboardDoubleArrowLeft, MdKeyboardDoubleArrowRight } from "react-icons/md";

export function SidebarBrand() {
  const { toggleSidebar, setToggleSidebar } = useContext(SidebarContext) || {};
  const isCollapsed = !!toggleSidebar;
  const logoSrc = `${import.meta.env.BASE_URL}academiapro-Picsart-AiImageEnhancer.png`;
  const iconColor = useColorModeValue("gray.500", "gray.300");
  const tooltipLabel = isCollapsed ? "Expand sidebar" : "Collapse sidebar";
  const ToggleIcon = isCollapsed ? MdKeyboardDoubleArrowRight : MdKeyboardDoubleArrowLeft;

  const handleToggle = () => {
    if (typeof setToggleSidebar === "function") {
      setToggleSidebar((prev) => !prev);
    }
  };

  return (
    <Flex align='center' direction='column'>
      <Flex
        align='center'
        justify={isCollapsed ? 'center' : 'flex-start'}
        w='100%'
        px='4px'
        pe={isCollapsed ? '56px' : '44px'}
        position='relative'
      >
        {isCollapsed ? (
          <Box
            h={{ base: '44px', md: '48px' }}
            w={{ base: '44px', md: '48px' }}
            my='24px'
            overflow='hidden'
            borderRadius='12px'
            display='flex'
            alignItems='center'
            justifyContent='center'
          >
            <Image
              src={logoSrc}
              h='100%'
              w={{ base: '170px', md: '200px' }}
              objectFit='cover'
              objectPosition='left center'
              alt="Academia Pro Logo"
              transition='all 0.2s ease'
              draggable={false}
            />
          </Box>
        ) : (
          <Box
            w='100%'
            maxW={{ base: '220px', md: '260px' }}
            h={{ base: '48px', md: '58px' }}
            my='20px'
            overflow='hidden'
            display='flex'
            alignItems='center'
          >
            <Image
              src={logoSrc}
              h='100%'
              w={{ base: '340px', md: '400px' }}
              objectFit='cover'
              objectPosition='left center'
              alt="Academia Pro Logo"
              transition='all 0.2s ease'
              draggable={false}
            />
          </Box>
        )}
        {typeof setToggleSidebar === "function" && (
          <Tooltip label={tooltipLabel} placement='right'>
            <IconButton
              aria-label={tooltipLabel}
              size={isCollapsed ? 'sm' : 'md'}
              variant='ghost'
              borderRadius='full'
              icon={<ToggleIcon size={20} />}
              color={iconColor}
              bg={useColorModeValue('whiteAlpha.700','whiteAlpha.100')}
              borderWidth='1px'
              borderColor={useColorModeValue('blackAlpha.200','whiteAlpha.300')}
              transition='all 0.2s ease'
              _hover={{ bg: useColorModeValue('whiteAlpha.800','whiteAlpha.200'), boxShadow: 'md', transform: 'translateY(-50%) scale(1.05)' }}
              _active={{ transform: 'translateY(-50%) scale(0.98)' }}
              sx={{ backdropFilter: 'saturate(180%) blur(6px)' }}
              position='absolute'
              right={isCollapsed ? '8px' : '0px'}
              top='50%'
              transform='translateY(-50%)'
              onClick={handleToggle}
            />
          </Tooltip>
        )}
      </Flex>
      <HSeparator mb='20px' />
    </Flex>
  );
}

export default SidebarBrand;
