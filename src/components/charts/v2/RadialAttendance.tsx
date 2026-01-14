import React, { useMemo } from 'react';
import { Box, Text, useColorModeValue } from '@chakra-ui/react';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';

export type RadialAttendanceProps = {
  value: number;
  height?: number;
  ariaLabel: string;
  label?: string;
};

export default function RadialAttendance({ value, height = 280, ariaLabel, label }: RadialAttendanceProps) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  const track = useColorModeValue('#E2E8F0', '#2D3748');
  const primary = useColorModeValue('#14b8a6', '#81e6d9');

  const series = useMemo(() => [v], [v]);

  const options: ApexOptions = useMemo(() => ({
    chart: { type: 'radialBar', toolbar: { show: false }, animations: { enabled: false } },
    plotOptions: {
      radialBar: {
        hollow: { size: '62%' },
        track: { background: track },
        dataLabels: {
          name: { show: true, offsetY: 18 },
          value: { fontSize: '28px', fontWeight: 800, offsetY: -10 },
        },
      },
    },
    colors: [primary],
    labels: [label || 'Attendance'],
  }), [label, primary, track]);

  return (
    <Box aria-label={ariaLabel} role="img">
      <ReactApexChart options={options} series={series} type="radialBar" height={height} width="100%" />
      <Text fontSize="xs" color={useColorModeValue('gray.600', 'gray.400')} mt={2}>
        {v}%
      </Text>
      <noscript>Attendance chart unavailable without JavaScript.</noscript>
    </Box>
  );
}
