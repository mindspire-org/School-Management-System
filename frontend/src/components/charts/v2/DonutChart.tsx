import React, { useMemo } from 'react';
import { Box, Text, useColorModeValue } from '@chakra-ui/react';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';

export type DonutChartProps = {
  series: number[];
  labels: string[];
  height?: number;
  ariaLabel: string;
  options?: ApexOptions;
};

export default function DonutChart({ series, labels, height = 280, ariaLabel, options }: DonutChartProps) {
  const labelColor = useColorModeValue('#334155', '#CBD5E1');
  const mode = useColorModeValue('light', 'dark');

  const mergedOptions: ApexOptions = useMemo(() => {
    const base: ApexOptions = {
      chart: { type: 'donut', toolbar: { show: false }, animations: { enabled: false }, foreColor: labelColor },
      labels,
      legend: { position: 'bottom' },
      dataLabels: { enabled: false },
      stroke: { width: 0 },
      plotOptions: {
        pie: {
          donut: {
            size: '70%',
          },
        },
      },
      tooltip: { y: { formatter: (v) => `${v}` } },
      theme: { mode: mode as 'light' | 'dark' },
      responsive: [
        {
          breakpoint: 640,
          options: {
            plotOptions: { pie: { donut: { size: '65%' } } },
            legend: {
              position: 'bottom',
              fontSize: '11px',
              itemMargin: { horizontal: 8, vertical: 4 },
            },
          },
        },
      ],
    };

    const out: ApexOptions = { ...base, ...(options || {}) };
    out.chart = { ...(base.chart || {}), ...(options?.chart || {}) };
    out.labels = labels;
    out.legend = { ...(base.legend || {}), ...(options?.legend || {}) };
    out.dataLabels = { ...(base.dataLabels || {}), ...(options?.dataLabels || {}) };
    out.plotOptions = { ...(base.plotOptions || {}), ...(options?.plotOptions || {}) };
    out.stroke = { ...(base.stroke || {}), ...(options?.stroke || {}) };
    out.tooltip = { ...(base.tooltip || {}), ...(options?.tooltip || {}) };

    const txt = (out.legend as any)?.labels;
    out.legend = {
      ...(out.legend || {}),
      labels: { ...(txt || {}), colors: labelColor },
    } as any;

    return out;
  }, [labelColor, labels, mode, options]);

  const hasData = Array.isArray(series) && series.length > 0;

  return (
    <Box aria-label={ariaLabel} role="img">
      {hasData ? (
        <ReactApexChart options={mergedOptions} series={series as any} type="donut" height={height} width="100%" />
      ) : (
        <Text fontSize="sm">No data available.</Text>
      )}
      <noscript>Chart unavailable without JavaScript.</noscript>
    </Box>
  );
}
