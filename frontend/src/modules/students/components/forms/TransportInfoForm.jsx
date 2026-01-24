import React from 'react';
import {
  Box,
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  Select,
  SimpleGrid,
  Text,
  Textarea,
  Divider,
  Checkbox,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Stack,
  Radio,
  RadioGroup,
  HStack,
  Icon,
} from '@chakra-ui/react';
import { useAppSelector, useAppDispatch } from '../../../../redux/hooks';
import {
  updateFormData,
  selectStudentFormData,
} from '../../../../redux/features/students/studentSlice';
import { MdDirectionsBus, MdWarning, MdInfo } from 'react-icons/md';

function TransportInfoForm() {
  const dispatch = useAppDispatch();
  const formData = useAppSelector(selectStudentFormData);
  const transportInfo = formData.transport || {};
  
  // Handle input changes
  const handleInputChange = (field, value) => {
    dispatch(updateFormData({ 
      step: 'transport',
      data: { [field]: value }
    }));
  };
  
  // Toggle transport usage
  const handleTransportToggle = (value) => {
    handleInputChange('usesTransport', value === 'yes');
  };
  
  // List of available bus routes
  const busRoutes = [
    { id: 'route1', name: 'Route A - Gulshan to School', stops: ['Stop 1 - Sohrab Goth', 'Stop 2 - Gulshan Chowrangi', 'Stop 3 - Main Boulevard', 'Stop 4 - Johar Chowrangi'] },
    { id: 'route2', name: 'Route B - DHA to School', stops: ['Stop 1 - Phase 1', 'Stop 2 - Phase 5', 'Stop 3 - Phase 6', 'Stop 4 - Phase 8'] },
    { id: 'route3', name: 'Route C - Clifton to School', stops: ['Stop 1 - Block 9', 'Stop 2 - Block 4', 'Stop 3 - Block 2', 'Stop 4 - Block 5'] },
    { id: 'route4', name: 'Route D - North Nazimabad to School', stops: ['Stop 1 - Block A', 'Stop 2 - Block D', 'Stop 3 - Block H', 'Stop 4 - Block K'] },
  ];
  
  // Get stops for selected route
  const getStopsForRoute = (routeId) => {
    const selectedRoute = busRoutes.find(route => route.id === routeId);
    return selectedRoute ? selectedRoute.stops : [];
  };
  
  const routeStops = transportInfo.routeId ? getStopsForRoute(transportInfo.routeId) : [];
  
  return (
    <Box>
      <Text fontSize="xl" fontWeight="600" mb={6}>
        Transport Information
      </Text>

      <Alert status="info" borderRadius="md" mb={6}>
        <AlertIcon />
        <Box>
          <AlertTitle>Transportation is Optional</AlertTitle>
          <AlertDescription>
            Students can either use school transport or make their own arrangements.
          </AlertDescription>
        </Box>
      </Alert>

      <FormControl id="usesTransport" mb={6}>
        <FormLabel>Will the student use school transport?</FormLabel>
        <RadioGroup
          value={transportInfo.usesTransport ? 'yes' : 'no'}
          onChange={handleTransportToggle}
        >
          <Stack direction="row" spacing={6}>
            <Radio value="yes">Yes</Radio>
            <Radio value="no">No</Radio>
          </Stack>
        </RadioGroup>
      </FormControl>

      {transportInfo.usesTransport && (
        <>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
            <FormControl id="routeId" isRequired>
              <FormLabel>Bus Route</FormLabel>
              <Select
                value={transportInfo.routeId || ''}
                onChange={(e) => {
                  handleInputChange('routeId', e.target.value);
                  // Reset pickup point when route changes
                  handleInputChange('pickupPoint', '');
                  handleInputChange('dropPoint', '');
                }}
                placeholder="Select bus route"
              >
                {busRoutes.map(route => (
                  <option key={route.id} value={route.id}>
                    {route.name}
                  </option>
                ))}
              </Select>
            </FormControl>
            
            <FormControl id="busNumber">
              <FormLabel>Bus Number</FormLabel>
              <Select
                value={transportInfo.busNumber || ''}
                onChange={(e) => handleInputChange('busNumber', e.target.value)}
                placeholder="Select bus number"
              >
                <option value="101">Bus #101</option>
                <option value="102">Bus #102</option>
                <option value="103">Bus #103</option>
                <option value="104">Bus #104</option>
                <option value="105">Bus #105</option>
                <option value="106">Bus #106</option>
                <option value="107">Bus #107</option>
                <option value="108">Bus #108</option>
              </Select>
              <FormHelperText>
                This will be assigned automatically based on route
              </FormHelperText>
            </FormControl>
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
            <FormControl id="pickupPoint" isRequired={transportInfo.usesTransport}>
              <FormLabel>Pickup Point</FormLabel>
              <Select
                value={transportInfo.pickupPoint || ''}
                onChange={(e) => handleInputChange('pickupPoint', e.target.value)}
                placeholder="Select pickup point"
                isDisabled={!transportInfo.routeId}
              >
                {routeStops.map((stop, index) => (
                  <option key={index} value={stop}>
                    {stop}
                  </option>
                ))}
              </Select>
            </FormControl>
            
            <FormControl id="dropPoint" isRequired={transportInfo.usesTransport}>
              <FormLabel>Drop-off Point</FormLabel>
              <Select
                value={transportInfo.dropPoint || ''}
                onChange={(e) => handleInputChange('dropPoint', e.target.value)}
                placeholder="Select drop-off point"
                isDisabled={!transportInfo.routeId}
              >
                {routeStops.map((stop, index) => (
                  <option key={index} value={stop}>
                    {stop}
                  </option>
                ))}
              </Select>
              <FormHelperText>
                Usually same as pickup point
              </FormHelperText>
            </FormControl>
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
            <FormControl id="pickupTime">
              <FormLabel>Approximate Pickup Time</FormLabel>
              <Input
                type="time"
                value={transportInfo.pickupTime || ''}
                onChange={(e) => handleInputChange('pickupTime', e.target.value)}
              />
              <FormHelperText>
                Estimated morning pickup time
              </FormHelperText>
            </FormControl>
            
            <FormControl id="dropTime">
              <FormLabel>Approximate Drop-off Time</FormLabel>
              <Input
                type="time"
                value={transportInfo.dropTime || ''}
                onChange={(e) => handleInputChange('dropTime', e.target.value)}
              />
              <FormHelperText>
                Estimated afternoon drop-off time
              </FormHelperText>
            </FormControl>
          </SimpleGrid>

          <FormControl id="transportNotes" mb={6}>
            <FormLabel>Special Instructions</FormLabel>
            <Textarea
              value={transportInfo.notes || ''}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Enter any special instructions for pickup/drop-off"
            />
            <FormHelperText>
              Any special instructions for the driver or conductor
            </FormHelperText>
          </FormControl>

          <Divider mb={6} />

          <Text fontSize="lg" fontWeight="600" mb={4}>
            Transport Fee Information
          </Text>
          
          <Alert status="warning" borderRadius="md" mb={6}>
            <AlertIcon />
            <Box>
              <AlertTitle>Transport Fee</AlertTitle>
              <AlertDescription>
                The standard transport fee is Rs. 5,000 per month.
                This can be adjusted based on distance in the Fee Information section.
              </AlertDescription>
            </Box>
          </Alert>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
            <FormControl id="distanceFromSchool">
              <FormLabel>Distance from School (km)</FormLabel>
              <Input
                type="number"
                value={transportInfo.distanceFromSchool || ''}
                onChange={(e) => handleInputChange('distanceFromSchool', e.target.value)}
                placeholder="0"
                min="0"
                step="0.1"
              />
              <FormHelperText>
                Distance from home to school (approximate)
              </FormHelperText>
            </FormControl>
            
            <FormControl id="transportFeeCategory">
              <FormLabel>Transport Fee Category</FormLabel>
              <Select
                value={transportInfo.feeCategory || ''}
                onChange={(e) => handleInputChange('feeCategory', e.target.value)}
                placeholder="Select category"
              >
                <option value="zone1">Zone 1 (0-5 km)</option>
                <option value="zone2">Zone 2 (5-10 km)</option>
                <option value="zone3">Zone 3 (10-15 km)</option>
                <option value="zone4">Zone 4 (15+ km)</option>
              </Select>
            </FormControl>
          </SimpleGrid>
        </>
      )}

      {!transportInfo.usesTransport && (
        <>
          <Divider mb={6} />
          
          <Text fontSize="lg" fontWeight="600" mb={4}>
            Alternative Transport Arrangements
          </Text>
          
          <FormControl id="transportMode" mb={6}>
            <FormLabel>How will the student commute to school?</FormLabel>
            <Select
              value={transportInfo.alternativeMode || ''}
              onChange={(e) => handleInputChange('alternativeMode', e.target.value)}
              placeholder="Select transport mode"
            >
              <option value="privateVehicle">Private Vehicle</option>
              <option value="carpool">Carpool with other families</option>
              <option value="vanService">Private Van Service</option>
              <option value="publicTransport">Public Transport</option>
              <option value="walking">Walking</option>
              <option value="other">Other</option>
            </Select>
          </FormControl>
          
          {transportInfo.alternativeMode === 'vanService' && (
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
              <FormControl id="vanServiceProvider">
                <FormLabel>Van Service Provider</FormLabel>
                <Input
                  value={transportInfo.vanServiceProvider || ''}
                  onChange={(e) => handleInputChange('vanServiceProvider', e.target.value)}
                  placeholder="Enter van service name"
                />
              </FormControl>
              
              <FormControl id="vanDriverContact">
                <FormLabel>Van Driver Contact</FormLabel>
                <Input
                  value={transportInfo.vanDriverContact || ''}
                  onChange={(e) => handleInputChange('vanDriverContact', e.target.value)}
                  placeholder="Enter driver's phone number"
                />
              </FormControl>
            </SimpleGrid>
          )}
          
          <FormControl id="transportNotes" mb={6}>
            <FormLabel>Alternative Transport Notes</FormLabel>
            <Textarea
              value={transportInfo.alternativeNotes || ''}
              onChange={(e) => handleInputChange('alternativeNotes', e.target.value)}
              placeholder="Enter any additional information about transport arrangements"
            />
          </FormControl>
        </>
      )}

      <Alert status="info" borderRadius="md" mb={2}>
        <AlertIcon as={MdInfo} />
        <Box>
          <Text fontWeight="medium">Note:</Text>
          <Text>You can change the transport arrangements later if needed.</Text>
        </Box>
      </Alert>
    </Box>
  );
}

export default TransportInfoForm;
