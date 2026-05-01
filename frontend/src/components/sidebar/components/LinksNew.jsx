/* eslint-disable */
import React, { useState, useContext } from "react";
import { NavLink, useLocation } from "react-router-dom";
// chakra imports
import {
  Box,
  Flex,
  HStack,
  Text,
  useColorModeValue,
  Icon,
  Collapse,
  VStack,
  Tooltip,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
  Portal
} from "@chakra-ui/react";
import { SidebarContext } from "contexts/SidebarContext";
import { MdKeyboardArrowDown, MdKeyboardArrowRight } from "react-icons/md";

export function SidebarLinks(props) {
  const [openMenus, setOpenMenus] = useState({});
  const [collapsedOpen, setCollapsedOpen] = useState({});

  //   Chakra color mode
  let location = useLocation();
  let activeColor = useColorModeValue("gray.700", "white");
  let inactiveColor = useColorModeValue(
    "secondaryGray.600",
    "secondaryGray.600"
  );
  let activeIcon = useColorModeValue("brand.500", "white");
  let textColor = useColorModeValue("secondaryGray.500", "white");
  let brandColor = useColorModeValue("brand.500", "brand.400");

  const { routes } = props;
  const { toggleSidebar } = useContext(SidebarContext) || {};
  const isCollapsed = !!toggleSidebar;

  // verifies if routeName is the one active (in browser input)
  const normalizePath = (p) => {
    if (!p) return '';
    return String(p).toLowerCase();
  };

  const getFullPath = (r) => {
    if (!r) return '';
    return normalizePath(`${r.layout || ''}${r.path || ''}`);
  };

  const isRouteActive = (fullPath) => {
    const current = normalizePath(location.pathname);
    const target = normalizePath(fullPath);
    if (!target) return false;
    if (current === target) return true;
    return current.startsWith(target + '/');
  };

  // Check if any child route is active
  const hasActiveChild = (items) => {
    if (!items) return false;
    return items.some(item =>
      item.path && isRouteActive(getFullPath(item))
    );
  };

  // Toggle menu open/closed
  const toggleMenu = (menuName) => {
    setOpenMenus(prev => ({
      ...prev,
      [menuName]: !prev[menuName]
    }));
  };

  // Render sub-menu items recursively
  const renderSubItems = (items, level = 0) => {
    return items.map((item, index) => {
      if (item.hidden) return null;

      // Indentation calculation
      const paddingStart = `${52 + level * 20}px`;

      // Handle nested dropdowns (collapsible items inside sidebar)
      if (item.collapse && item.items) {
        const isOpen = openMenus[item.name] || hasActiveChild(item.items);
        const hasActive = hasActiveChild(item.items);

        return (
          <Box key={index} mb="4px">
            <Box
              onClick={() => toggleMenu(item.name)}
              cursor="pointer"
              _hover={{
                bg: useColorModeValue("gray.100", "whiteAlpha.100"),
                borderRadius: "8px"
              }}
              py="6px"
              ps={paddingStart}
              pe="10px"
              display={isCollapsed ? "none" : "block"}
            >
              <HStack spacing="auto" alignItems="center">
                <Text
                  fontSize="sm"
                  color={hasActive ? activeColor : textColor}
                  fontWeight={hasActive ? "600" : "600"}
                >
                  {item.name}
                </Text>
                <Icon
                  as={isOpen ? MdKeyboardArrowDown : MdKeyboardArrowRight}
                  color={textColor}
                  w="16px"
                  h="16px"
                />
              </HStack>
            </Box>
            <Collapse in={isOpen} animateOpacity>
              <VStack align="stretch" spacing="2px">
                {renderSubItems(item.items, level + 1)}
              </VStack>
            </Collapse>
          </Box>
        );
      }

      // Skip items without a path
      if (!item.path) return null;

      return (
        <NavLink key={index} to={item.layout + item.path}>
          <HStack
            spacing="22px"
            py="8px"
            ps={paddingStart}
            position="relative"
            _hover={{
              bg: useColorModeValue("gray.100", "whiteAlpha.100"),
              borderRadius: "8px"
            }}
            display={isCollapsed ? "none" : "flex"}
          >
            <Text
              fontSize="sm"
              color={
                isRouteActive(getFullPath(item))
                  ? activeColor
                  : textColor
              }
              fontWeight={
                isRouteActive(getFullPath(item))
                  ? "600"
                  : "normal"
              }
            >
              {item.name}
            </Text>
            {isRouteActive(getFullPath(item)) && (
              <Box
                position="absolute"
                left="0"
                h="20px"
                w="3px"
                bg={brandColor}
                borderRadius="0 5px 5px 0"
              />
            )}
          </HStack>
        </NavLink>
      );
    });
  };

  // Main function to create links
  const createLinks = (routes) => {
    return routes.map((route, index) => {
      // Skip hidden routes
      if (route.hidden) {
        return null;
      }

      // Handle collapsible routes with sub-items
      if (route.collapse && route.items) {
        const isOpen = openMenus[route.name] || hasActiveChild(route.items);
        const hasActive = hasActiveChild(route.items);

        // Collapsed: show icon with hover popover listing sub-items
        if (isCollapsed) {
          return (
            <Box key={index} mb="4px" position="relative">
              <Popover isOpen={!!collapsedOpen[route.name]} placement="right-start" isLazy onClose={() => setCollapsedOpen(prev => ({ ...prev, [route.name]: false }))}>
                <PopoverTrigger>
                  <Box
                    as="button"
                    w="100%"
                    _hover={{ bg: useColorModeValue("gray.100", "whiteAlpha.100"), borderRadius: "8px" }}
                    onClick={(e) => { e.preventDefault(); setCollapsedOpen(prev => ({ ...prev, [route.name]: !prev[route.name] })); }}
                    position="relative"
                  >
                    <HStack spacing="22px" py="10px" ps="10px" pe="10px">
                      <Flex w="100%" alignItems="center" justifyContent="center">
                        <Box
                          color={hasActive ? activeIcon : textColor}
                          me="0px"
                          p="6px"
                          borderRadius="md"
                          bg={hasActive ? useColorModeValue("blue.50", "whiteAlpha.100") : "transparent"}
                        >
                          {route.icon}
                        </Box>
                      </Flex>
                    </HStack>
                    {hasActive && (
                      <Box
                        position="absolute"
                        right="8px"
                        top="50%"
                        transform="translateY(-50%)"
                        w="6px"
                        h="6px"
                        bg={brandColor}
                        borderRadius="full"
                      />
                    )}
                  </Box>
                </PopoverTrigger>
                <Portal>
                  <PopoverContent w="220px" _focus={{ boxShadow: "md" }} zIndex={2000}>
                    <PopoverArrow />
                    <PopoverBody>
                      <VStack align="stretch" spacing="4px">
                        {route.items.filter(item => !item.hidden).map((item, subIndex) => (
                          <NavLink key={subIndex} to={item.layout + item.path}>
                            <HStack
                              spacing="12px"
                              py="8px"
                              ps="6px"
                              _hover={{ bg: useColorModeValue("gray.100", "whiteAlpha.100"), borderRadius: "8px" }}
                            >
                              <Text
                                fontSize="sm"
                                color={isRouteActive(getFullPath(item)) ? activeColor : textColor}
                                fontWeight={isRouteActive(getFullPath(item)) ? "600" : "normal"}
                              >
                                {item.name}
                              </Text>
                            </HStack>
                          </NavLink>
                        ))}
                      </VStack>
                    </PopoverBody>
                  </PopoverContent>
                </Portal>
              </Popover>
            </Box>
          );
        }

        // Expanded: normal collapsible list with labels
        return (
          <Box key={index} mb="4px">
            <Box
              onClick={() => toggleMenu(route.name)}
              cursor="pointer"
              _hover={{
                bg: useColorModeValue("gray.100", "whiteAlpha.100"),
                borderRadius: "8px"
              }}
            >
              <HStack
                spacing="22px"
                py="10px"
                ps="10px"
                pe="10px"
                position="relative"
              >
                <Flex w="100%" alignItems="center">
                  <Box
                    color={hasActive ? activeIcon : textColor}
                    me="18px"
                  >
                    {route.icon}
                  </Box>
                  <Text
                    me="auto"
                    color={hasActive ? activeColor : textColor}
                    fontWeight={hasActive ? "bold" : "500"}
                    fontSize="md"
                    display={isCollapsed ? "none" : "block"}
                  >
                    {route.name}
                  </Text>
                  <Icon
                    as={isOpen ? MdKeyboardArrowDown : MdKeyboardArrowRight}
                    color={textColor}
                    w="20px"
                    h="20px"
                  />
                </Flex>
                {hasActive && (
                  <Box
                    position="absolute"
                    right="0"
                    h="36px"
                    w="4px"
                    bg={brandColor}
                    borderRadius="5px 0 0 5px"
                  />
                )}
              </HStack>
            </Box>
            <Collapse in={isOpen} animateOpacity>
              <VStack align="stretch" spacing="2px" mt="2px">
                {renderSubItems(route.items)}
              </VStack>
            </Collapse>
          </Box>
        );
      }

      // Handle category headers
      if (route.category) {
        return (
          <React.Fragment key={index}>
            <Text
              fontSize="md"
              color={activeColor}
              fontWeight="bold"
              mx="auto"
              ps={{
                sm: "10px",
                xl: "16px",
              }}
              pt="18px"
              pb="12px"
              display={isCollapsed ? "none" : "block"}
            >
              {route.name}
            </Text>
            {route.items && createLinks(route.items)}
          </React.Fragment>
        );
      }

      // Handle regular links
      if (
        route.layout === "/admin" ||
        route.layout === "/auth" ||
        route.layout === "/rtl" ||
        route.layout === "/teacher" ||
        route.layout === "/student" ||
        route.layout === "/driver"
      ) {
        const fullPath = getFullPath(route);
        const linkContent = (
          <NavLink key={index} to={route.layout + route.path}>
            {route.icon ? (
              <Box mb="4px">
                <HStack
                  spacing={
                    isRouteActive(fullPath) ? "22px" : "26px"
                  }
                  py="10px"
                  ps="10px"
                  position="relative"
                  _hover={{
                    bg: useColorModeValue("gray.100", "whiteAlpha.100"),
                    borderRadius: "8px"
                  }}
                >
                  <Flex w="100%" alignItems="center" justifyContent="center">
                    <Box
                      color={
                        isRouteActive(fullPath)
                          ? activeIcon
                          : textColor
                      }
                      me={isCollapsed ? "0px" : "18px"}
                    >
                      {route.icon}
                    </Box>
                    <Text
                      me="auto"
                      color={
                        isRouteActive(fullPath)
                          ? activeColor
                          : textColor
                      }
                      fontWeight={
                        isRouteActive(fullPath)
                          ? "bold"
                          : "500"
                      }
                      fontSize="md"
                      display={isCollapsed ? "none" : "block"}
                    >
                      {route.name}
                    </Text>
                  </Flex>
                  {isRouteActive(fullPath) && (
                    isCollapsed ? (
                      <Box
                        position="absolute"
                        right="8px"
                        top="50%"
                        transform="translateY(-50%)"
                        w="6px"
                        h="6px"
                        bg={brandColor}
                        borderRadius="full"
                      />
                    ) : (
                      <Box
                        h="36px"
                        w="4px"
                        bg={brandColor}
                        borderRadius="5px"
                      />
                    )
                  )}
                </HStack>
              </Box>
            ) : (
              <Box mb="4px">
                <HStack
                  spacing={
                    isRouteActive(fullPath) ? "22px" : "26px"
                  }
                  py="10px"
                  ps="10px"
                  _hover={{
                    bg: useColorModeValue("gray.100", "whiteAlpha.100"),
                    borderRadius: "8px"
                  }}
                >
                  <Text
                    me="auto"
                    color={
                      isRouteActive(fullPath)
                        ? activeColor
                        : inactiveColor
                    }
                    fontWeight={
                      isRouteActive(fullPath) ? "bold" : "500"
                    }
                    fontSize="md"
                    display={isCollapsed ? "none" : "block"}
                  >
                    {route.name}
                  </Text>
                  {isRouteActive(fullPath) && (
                    <Box h="36px" w="4px" bg={brandColor} borderRadius="5px" />
                  )}
                </HStack>
              </Box>
            )}
          </NavLink>
        );
        // Wrap with tooltip in collapsed mode so user sees the label
        return isCollapsed ? (
          <Tooltip key={index} label={route.name} placement="right">
            <Box>{linkContent}</Box>
          </Tooltip>
        ) : linkContent;
      }
    });
  };

  //  BRAND
  return createLinks(routes);
}

export default SidebarLinks;
