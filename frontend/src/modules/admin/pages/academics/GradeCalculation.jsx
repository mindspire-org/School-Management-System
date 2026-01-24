import React, { useMemo, useState } from 'react';
import {
  Box,
  Heading,
  Text,
  HStack,
  Button,
  ButtonGroup,
  NumberInput,
  NumberInputField,
  SimpleGrid,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Flex,
  useColorModeValue,
} from '@chakra-ui/react';
import Card from 'components/card/Card.js';
import MiniStatistics from 'components/card/MiniStatistics';
import IconBox from 'components/icons/IconBox';
import { MdSave, MdRestore, MdAssignment, MdLeaderboard, MdFileDownload, MdPictureAsPdf, MdRefresh } from 'react-icons/md';

export default function GradeCalculation() {
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');
  const [bands, setBands] = useState({ A: 80, B: 70, C: 60, D: 50 });
  const [score, setScore] = useState(73);

  const grade = useMemo(() => {
    const s = Number(score) || 0;
    if (s >= bands.A) return 'A';
    if (s >= bands.B) return 'B';
    if (s >= bands.C) return 'C';
    if (s >= bands.D) return 'D';
    return 'F';
  }, [bands, score]);

  const update = (k) => (v) => setBands((b) => ({ ...b, [k]: Number(v) || 0 }));

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Flex mb={5} justifyContent="space-between" alignItems="center">
        <Box>
          <Heading as="h3" size="lg" mb={1} color={textColor}>Grade Calculation</Heading>
          <Text color={textColorSecondary}>Configure grade bands and preview computed grade</Text>
        </Box>
        <ButtonGroup>
          <Button leftIcon={<MdRefresh />} variant='outline' onClick={()=>window.location.reload()}>Refresh</Button>
          <Button leftIcon={<MdFileDownload />} variant='outline' colorScheme='blue'>Export CSV</Button>
          <Button leftIcon={<MdPictureAsPdf />} colorScheme='blue'>Export PDF</Button>
        </ButtonGroup>
      </Flex>

      <Card mb={5}>
        <Flex p={4} justifyContent="space-between" alignItems="center" direction={{ base: 'column', md: 'row' }} gap={4}>
          <HStack>
            <Box>Sample Score</Box>
            <NumberInput maxW="120px" value={score} min={0} max={100} onChange={(v)=>setScore(v)}>
              <NumberInputField />
            </NumberInput>
          </HStack>
          <HStack>
            <Button leftIcon={<MdSave />} colorScheme="blue">Save Bands</Button>
            <Button leftIcon={<MdRestore />} variant="ghost">Reset Defaults</Button>
            <Button leftIcon={<MdAssignment />} variant="outline" colorScheme="blue">Generate Report</Button>
          </HStack>
        </Flex>
      </Card>

      <SimpleGrid columns={{ base: 1, md: 3 }} gap="20px" mb={5}>
        <MiniStatistics
          startContent={<IconBox w="56px" h="56px" bg="linear-gradient(90deg,#4481EB 0%,#04BEFE 100%)" icon={<MdLeaderboard color="white" />} />}
          name="Computed Grade"
          value={grade}
        />
        <MiniStatistics
          startContent={<IconBox w="56px" h="56px" bg="linear-gradient(90deg,#01B574 0%,#51CB97 100%)" icon={<MdSave color="white" />} />}
          name="Bands Defined"
          value={String(Object.keys(bands).length)}
        />
        <MiniStatistics
          startContent={<IconBox w="56px" h="56px" bg="linear-gradient(90deg,#8952FF 0%,#AA80FF 100%)" icon={<MdAssignment color="white" />} />}
          name="Sample Score"
          value={`${score}%`}
        />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
        {Object.keys(bands).map((k) => (
          <Card key={k}>
            <HStack justify="space-between">
              <Heading size="sm">Minimum for {k}</Heading>
              <NumberInput maxW="120px" value={bands[k]} min={0} max={100} onChange={update(k)}>
                <NumberInputField />
              </NumberInput>
            </HStack>
          </Card>
        ))}
      </SimpleGrid>

      <Card overflow="hidden">
        <Heading size="md" p={4} borderBottomWidth={1} borderColor={useColorModeValue('gray.200', 'gray.700')}>
          Grade Bands
        </Heading>
        <Box overflowX="auto">
          <Table>
            <Thead>
              <Tr>
                <Th>Band</Th>
                <Th>Min %</Th>
              </Tr>
            </Thead>
            <Tbody>
              {Object.entries(bands)
                .sort((a, b) => b[1] - a[1])
                .map(([k, v]) => (
                  <Tr key={k}>
                    <Td>{k}</Td>
                    <Td>{v}%</Td>
                  </Tr>
                ))}
              <Tr>
                <Td>Computed Grade for {score}%</Td>
                <Td>{grade}</Td>
              </Tr>
            </Tbody>
          </Table>
        </Box>
      </Card>
    </Box>
  );
}
