import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Box, Heading, Text, UnorderedList, ListItem } from '@chakra-ui/react';
import ChakraSidebar from './ChakraSidebar';

const SidebarDemo = () => {
  // Handle navigation if needed
  const handleNavigation = (path) => {
    console.log(`Navigating to: ${path}`);
  };

  return (
    <Box display="flex" h="100vh" bg="gray.100">
      <Router>
        <ChakraSidebar onNavigate={handleNavigation} />
        
        <Box flex="1" p={8}>
          <Box bg="white" p={6} borderRadius="lg" shadow="sm">
            <Heading as="h1" size="xl" color="gray.800" mb={4}>Sidebar Demo</Heading>
            <Text color="gray.600" mb={4}>
              This is a demonstration of the responsive sidebar component with the following features:
            </Text>
            
            <UnorderedList spacing={2} pl={5} mb={6} color="gray.600">
              <ListItem>Toggle between expanded (256px) and collapsed (80px) width</ListItem>
              <ListItem>Smooth transitions (300ms) for all state changes</ListItem>
              <ListItem>Icon-only mode when collapsed, full text when expanded</ListItem>
              <ListItem>Expandable menu sections with chevron indicators</ListItem>
              <ListItem>Active state highlighting with blue accent and right border</ListItem>
              <ListItem>Click handlers for all menu items</ListItem>
              <ListItem>Submenu items with proper left indentation</ListItem>
              <ListItem>Sticky toggle button on the sidebar edge</ListItem>
              <ListItem>Overflow handling for long menu lists</ListItem>
            </UnorderedList>
            
            <Text color="gray.600">
              Click the toggle button on the edge of the sidebar to expand/collapse it,
              or click on menu items to see the active state highlighting.
            </Text>
          </Box>
        </Box>
      </Router>
    </Box>
  );
};

export default SidebarDemo;
