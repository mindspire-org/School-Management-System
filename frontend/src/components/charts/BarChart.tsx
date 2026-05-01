import React, { Suspense, useMemo } from 'react';
import { Box, Skeleton, Text, useColorModeValue } from '@chakra-ui/react';
import type { ApexOptions } from 'apexcharts';

const LazyApexChart: React.ComponentType<any> = React.lazy(async () => {
  const mod: any = await import('react-apexcharts');
  return { default: mod.default };
}) as any;

export type BarChartProps = {
  series: any;
  categories: string[];
  stacked?: boolean;
  height?: number;
  ariaLabel?: string;
  options?: ApexOptions;
};

export default function BarChart({ series, categories, stacked, height = 280, ariaLabel, options }: BarChartProps) {
  const gridColor = useColorModeValue('#EDF2F7', '#2D3748');
  const labelColor = useColorModeValue('#334155', '#CBD5E1');

  const mergedOptions: ApexOptions = useMemo(() => {
    const base: ApexOptions = {
      chart: { type: 'bar', toolbar: { show: false }, animations: { enabled: false }, stacked: Boolean(stacked) },
      plotOptions: { bar: { borderRadius: 6, columnWidth: '44%' } },
      grid: { borderColor: gridColor, strokeDashArray: 4 },
      dataLabels: { enabled: false },
      xaxis: {
        categories,
        labels: {
          style: { colors: labelColor },
          rotate: -35,
          trim: true,
          hideOverlappingLabels: true,
        },
      },
      yaxis: { labels: { style: { colors: labelColor } } },
      legend: { show: true, position: 'top' },
      tooltip: { shared: true, intersect: false },
      responsive: [
        {
          breakpoint: 640,
          options: {
            legend: { position: 'bottom' },
            plotOptions: { bar: { columnWidth: '60%' } },
            xaxis: { labels: { rotate: -55 } },
          },
        },
      ],
    };

    const out: ApexOptions = { ...base, ...(options || {}) };
    out.chart = { ...(base.chart || {}), ...(options?.chart || {}), stacked: Boolean(stacked) };
    out.plotOptions = { ...(base.plotOptions || {}), ...(options?.plotOptions || {}) };
    out.xaxis = { ...(base.xaxis || {}), ...(options?.xaxis || {}), categories };
    out.grid = { ...(base.grid || {}), ...(options?.grid || {}) };
    out.legend = { ...(base.legend || {}), ...(options?.legend || {}) };
    out.dataLabels = { ...(base.dataLabels || {}), ...(options?.dataLabels || {}) };
    out.tooltip = { ...(base.tooltip || {}), ...(options?.tooltip || {}) };
    out.yaxis = { ...(base.yaxis || {}), ...(options?.yaxis || {}) };

    return out;
  }, [categories, gridColor, labelColor, options, stacked]);

  const hasData = Array.isArray(series) && series.length > 0;

  return (
    <Box aria-label={ariaLabel || 'Bar chart'} role="img">
      {hasData ? (
        <Suspense fallback={<Skeleton h={`${height}px`} w="100%" borderRadius="md" />}>
          <LazyApexChart options={mergedOptions as any} series={series as any} type="bar" height={height} width="100%" />
        </Suspense>
      ) : (
        <Text fontSize="sm">No data available.</Text>
      )}
      <noscript>Chart unavailable without JavaScript.</noscript>
    </Box>
  );
}
