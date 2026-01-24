import React from 'react';
import { Box, Heading, Text, Code, Button } from '@chakra-ui/react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <Box p={6} maxW="800px" mx="auto" mt={10}>
          <Heading mb={4} color="red.500">Something went wrong</Heading>
          <Text mb={4}>
            The component failed to render. This is likely due to an error in the component code.
          </Text>
          
          <Box bg="gray.50" p={4} borderRadius="md" mb={4}>
            <Heading size="md" mb={2}>Error Details:</Heading>
            <Code colorScheme="red" whiteSpace="pre-wrap" display="block" p={2}>
              {this.state.error && this.state.error.toString()}
            </Code>
            
            {this.state.errorInfo && (
              <Box mt={4}>
                <Heading size="sm" mb={2}>Component Stack:</Heading>
                <Code colorScheme="gray" whiteSpace="pre-wrap" display="block" p={2} maxH="300px" overflowY="auto">
                  {this.state.errorInfo.componentStack}
                </Code>
              </Box>
            )}
          </Box>
          
          <Button 
            colorScheme="blue" 
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
          >
            Try Again
          </Button>
        </Box>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
