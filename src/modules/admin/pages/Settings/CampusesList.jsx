import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    SimpleGrid,
    Text,
    useColorModeValue,
    Flex,
    Icon,
    Button,
    Badge,
} from '@chakra-ui/react';
import { MdSchool, MdLocationOn, MdArrowForward } from 'react-icons/md';
import Card from '../../../../components/card/Card';
import { campusesApi } from '../../../../services/api';
import { useAuth } from '../../../../contexts/AuthContext';

export default function CampusesList() {
    const textColor = useColorModeValue('secondaryGray.900', 'white');
    const [campuses, setCampuses] = useState([]);
    const { setCampusId } = useAuth(); // We can use this to switch context
    const navigate = useNavigate();

    useEffect(() => {
        campusesApi.list({ pageSize: 100 }).then(res => {
            setCampuses(res.rows || []);
        });
    }, []);

    const handleSwitch = (id) => {
        setCampusId(id);
        navigate('/admin/dashboard', { replace: true });
    };

    return (
        <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
            <Flex direction='column'>
                <Box mb='20px'>
                    <Text fontSize='2xl' fontWeight='700' color={textColor}>
                        All Campuses
                    </Text>
                    <Text fontSize='md' color='gray.500'>
                        Overview of all school branches. Select one to view its dashboard.
                    </Text>
                </Box>

                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing='20px'>
                    {campuses.map((campus) => (
                        <Card key={campus.id} p='20px'>
                            <Flex align='center' mb='10px'>
                                <Icon as={MdSchool} w='40px' h='40px' color='brand.500' mr='10px' />
                                <Box>
                                    <Text fontWeight='700' fontSize='lg'>{campus.name}</Text>
                                    <Flex align='center' color='gray.500' fontSize='sm'>
                                        <Icon as={MdLocationOn} mr='1' />
                                        {campus.city || 'Main City'}
                                    </Flex>
                                </Box>
                            </Flex>
                            <Box my='10px'>
                                <Badge colorScheme='green'>Active</Badge>
                                <Text mt='2' fontSize='sm' noOfLines={2} color='gray.600'>
                                    {campus.address || 'No address details provided.'}
                                </Text>
                            </Box>
                            <Button
                                rightIcon={<MdArrowForward />}
                                colorScheme='brand'
                                variant='outline'
                                w='full'
                                mt='10px'
                                onClick={() => handleSwitch(campus.id)}
                            >
                                Go to Dashboard
                            </Button>
                        </Card>
                    ))}
                </SimpleGrid>
            </Flex>
        </Box>
    );
}
