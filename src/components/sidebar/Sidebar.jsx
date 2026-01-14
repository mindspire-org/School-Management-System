import React, { useContext } from "react";

// chakra imports
import {
  Box,
  Flex,
  Drawer,
  DrawerBody,
  Icon,
  useColorModeValue,
  DrawerOverlay,
  useDisclosure,
  DrawerContent,
  DrawerCloseButton,
} from "@chakra-ui/react";
import Content from "components/sidebar/components/Content";
import { SidebarContext } from "contexts/SidebarContext";
import {
  renderThumb,
  renderTrack,
  renderView,
} from "components/scrollbar/Scrollbar";
import { Scrollbars } from "react-custom-scrollbars-2";
import PropTypes from "prop-types";

// Assets
import { IoMenuOutline } from "react-icons/io5";

function Sidebar(props) {
  const { routes, sidebarWidth } = props;

  useContext(SidebarContext);

  let variantChange = "0.2s linear";
  let shadow = useColorModeValue(
    "14px 17px 40px 4px rgba(112, 144, 176, 0.08)",
    "unset"
  );
  // Chakra Color Mode
  let sidebarBg = useColorModeValue("#e3edff", "rgba(11, 20, 55, 0.72)");
  let sidebarBorder = useColorModeValue("#cfe0ff", "#f0f5ffe0");
  let sidebarMargins = "0px";

  // SIDEBAR
  return (
    <Box display={{ sm: "none", xl: "block" }} w={`${sidebarWidth || 260}px`} h='100vh' position='fixed' top='0' left='0' overflow='hidden'>
      <Box
        bg={sidebarBg}
        backdropFilter='blur(18px)'
        sx={{ WebkitBackdropFilter: 'blur(18px)' }}
        borderRightWidth='1px'
        borderRightStyle='solid'
        borderRightColor={sidebarBorder}
        transition={variantChange}
        w={`${sidebarWidth || 260}px`}
        h='100vh'
        m={sidebarMargins}
        minH='100%'
        overflowX='hidden'
        boxShadow={shadow}>
        
        <Scrollbars
          autoHide
          renderTrackVertical={renderTrack}
          renderThumbVertical={renderThumb}
          renderView={renderView}>
          <Content routes={routes} />
        </Scrollbars>
      </Box>
    </Box>
  );
}

// FUNCTIONS
export function SidebarResponsive(props) {
  let sidebarBackgroundColor = useColorModeValue('rgba(227, 237, 255, 0.92)', 'rgba(11, 20, 55, 0.78)');
  let sidebarBorderColor = useColorModeValue('rgba(255, 255, 255, 0.55)', 'rgba(255, 255, 255, 0.10)');
  let menuColor = useColorModeValue("gray.400", "white");
  // // SIDEBAR
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = React.useRef();

  const { routes } = props;
  // let isWindows = navigator.platform.startsWith("Win");
  //  BRAND

  return (
    <Flex display={{ sm: "flex", xl: "none" }} alignItems='center'>
      <Flex ref={btnRef} w='max-content' h='max-content' onClick={onOpen}>
        <Icon
          as={IoMenuOutline}
          color={menuColor}
          my='auto'
          w='20px'
          h='20px'
          me='10px'
          _hover={{ cursor: "pointer" }}
        />
      </Flex>
      <Drawer
        isOpen={isOpen}
        onClose={onClose}
        placement={document.documentElement.dir === "rtl" ? "right" : "left"}
        finalFocusRef={btnRef}>
        <DrawerOverlay />
        <DrawerContent
          w='285px'
          maxW='285px'
          bg={sidebarBackgroundColor}
          backdropFilter='blur(18px)'
          sx={{ WebkitBackdropFilter: 'blur(18px)' }}
          borderRightWidth={document.documentElement.dir === "rtl" ? '0px' : '1px'}
          borderLeftWidth={document.documentElement.dir === "rtl" ? '1px' : '0px'}
          borderColor={sidebarBorderColor}
        >
          <DrawerCloseButton
            zIndex='3'
            onClose={onClose}
            _focus={{ boxShadow: "none" }}
            _hover={{ boxShadow: "none" }}
          />
          <DrawerBody maxW='285px' px='0rem' pb='0'>
            <Scrollbars
              autoHide
              renderTrackVertical={renderTrack}
              renderThumbVertical={renderThumb}
              renderView={renderView}>
              <Content routes={routes} />
            </Scrollbars>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Flex>
  );
}
// PROPS

Sidebar.propTypes = {
  logoText: PropTypes.string,
  routes: PropTypes.arrayOf(PropTypes.object),
  variant: PropTypes.string,
};

export default Sidebar;
