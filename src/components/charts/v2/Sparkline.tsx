import React, { useMemo } from 'react';
import { Box, Text, useColorModeValue } from '@chakra-ui/react';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';

export type SparklineProps = {
  data: number[];
  height?: number;
  color?: string;
  ariaLabel: string;
  valueFormatter?: (value: number) => string;
};

export default function Sparkline({ data, height = 48, color, ariaLabel, valueFormatter }: SparklineProps) {
  const strokeColor = color || useColorModeValue('#4f46e5', '#a5b4fc');

  const series = useMemo(() => [{ name: 'trend', data }], [data]);

  const options: ApexOptions = useMemo(() => ({
    chart: {
      type: 'area',
      sparkline: { enabled: true },
      toolbar: { show: false },
      animations: { enabled: false },
      zoom: { enabled: false },
    },
    stroke: { curve: 'smooth', width: 3 },
    markers: { size: 0, hover: { size: 4 } },
    fill: {
      type: 'gradient',
      gradient: { shadeIntensity: 0.35, opacityFrom: 0.45, opacityTo: 0.05, stops: [0, 90, 100] },
    },
    colors: [strokeColor],
    dataLabels: { enabled: false },
    grid: { show: false },
    xaxis: { labels: { show: false }, axisBorder: { show: false }, axisTicks: { show: false } },
    yaxis: { labels: { show: false } },
    tooltip: {
      enabled: true,
      x: { show: false },
      y: {
        formatter: (v) => (typeof valueFormatter === 'function' ? valueFormatter(v) : `${v}`),
      },
    },
  }), [strokeColor, valueFormatter]);

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <Box aria-label={ariaLabel}>
        <Text fontSize="xs">No trend data.</Text>
        <noscript>Trend chart unavailable without JavaScript.</noscript>
      </Box>
    );
  }

  return (
    <Box aria-label={ariaLabel} role="img">
      <ReactApexChart options={options} series={series} type="area" height={height} width="100%" />
      <noscript>Trend chart unavailable without JavaScript.</noscript>
    </Box>
  );
}
