import React, { useMemo } from 'react';
import { Box, Text, useColorModeValue } from '@chakra-ui/react';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';

export type HeatmapPoint = {
  x: string;
  y: number;
};

export type HeatmapSeries = {
  name: string;
  data: HeatmapPoint[];
};

export type HeatmapActivityProps = {
  series: HeatmapSeries[];
  height?: number;
  ariaLabel: string;
  options?: ApexOptions;
};

export default function HeatmapActivity({ series, height = 320, ariaLabel, options }: HeatmapActivityProps) {
  const labelColor = useColorModeValue('#334155', '#CBD5E1');
  const mode = useColorModeValue('light', 'dark');

  const mergedOptions: ApexOptions = useMemo(() => {
    const base: ApexOptions = {
      chart: { type: 'heatmap', toolbar: { show: false }, animations: { enabled: false }, foreColor: labelColor },
      dataLabels: { enabled: false },
      plotOptions: {
        heatmap: {
          radius: 4,
          shadeIntensity: 0.4,
          colorScale: {
            ranges: [
              { from: 0, to: 20, color: '#E2E8F0', name: 'Low' },
              { from: 21, to: 60, color: '#93C5FD', name: 'Medium' },
              { from: 61, to: 100, color: '#14B8A6', name: 'High' },
            ],
          },
        },
      },
      tooltip: { y: { formatter: (v) => `${v}` } },
      legend: { show: true, position: 'bottom' },
      theme: { mode },
    };

    const out: ApexOptions = { ...base, ...(options || {}) };
    out.chart = { ...(base.chart || {}), ...(options?.chart || {}) };
    out.plotOptions = { ...(base.plotOptions || {}), ...(options?.plotOptions || {}) };
    out.tooltip = { ...(base.tooltip || {}), ...(options?.tooltip || {}) };
    out.legend = { ...(base.legend || {}), ...(options?.legend || {}) };
    out.dataLabels = { ...(base.dataLabels || {}), ...(options?.dataLabels || {}) };
    out.theme = { ...(base.theme || {}), ...(options?.theme || {}) };

    return out;
  }, [labelColor, mode, options]);

  const hasData = Array.isArray(series) && series.length > 0;

  return (
    <Box aria-label={ariaLabel} role="img">
      {hasData ? (
        <ReactApexChart options={mergedOptions} series={series as any} type="heatmap" height={height} width="100%" />
      ) : (
        <Text fontSize="sm">No activity data available.</Text>
      )}
      <noscript>Heatmap unavailable without JavaScript.</noscript>
    </Box>
  );
}
