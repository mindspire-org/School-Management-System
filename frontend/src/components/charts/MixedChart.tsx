import React, { Suspense, useMemo } from 'react';
import { Box, Skeleton, Text, useColorModeValue } from '@chakra-ui/react';
import type { ApexOptions } from 'apexcharts';

const LazyApexChart: React.ComponentType<any> = React.lazy(async () => {
  const mod: any = await import('react-apexcharts');
  return { default: mod.default };
}) as any;

export type MixedChartProps = {
  series: any;
  categories: string[];
  height?: number;
  stacked?: boolean;
  ariaLabel?: string;
  options?: ApexOptions;
};

export default function MixedChart({ series, categories, height = 320, stacked, ariaLabel, options }: MixedChartProps) {
  const gridColor = useColorModeValue('#EDF2F7', '#2D3748');
  const labelColor = useColorModeValue('#334155', '#CBD5E1');

  const mergedOptions: ApexOptions = useMemo(() => {
    const base: ApexOptions = {
      chart: { type: 'line', toolbar: { show: false }, animations: { enabled: false }, stacked: Boolean(stacked) },
      stroke: { width: [0, 0, 3], curve: 'smooth' },
      plotOptions: { bar: { borderRadius: 6, columnWidth: '46%' } },
      dataLabels: { enabled: false },
      grid: { borderColor: gridColor, strokeDashArray: 4 },
      xaxis: { categories, labels: { style: { colors: labelColor } } },
      yaxis: { labels: { style: { colors: labelColor } } },
      legend: { show: true, position: 'top' },
      tooltip: { shared: true, intersect: false },
    };

    const out: ApexOptions = { ...base, ...(options || {}) };
    out.chart = { ...(base.chart || {}), ...(options?.chart || {}), stacked: Boolean(stacked) };
    out.stroke = { ...(base.stroke || {}), ...(options?.stroke || {}) };
    out.plotOptions = { ...(base.plotOptions || {}), ...(options?.plotOptions || {}) };
    out.grid = { ...(base.grid || {}), ...(options?.grid || {}) };
    out.xaxis = { ...(base.xaxis || {}), ...(options?.xaxis || {}), categories };
    out.yaxis = { ...(base.yaxis || {}), ...(options?.yaxis || {}) };
    out.legend = { ...(base.legend || {}), ...(options?.legend || {}) };
    out.dataLabels = { ...(base.dataLabels || {}), ...(options?.dataLabels || {}) };
    out.tooltip = { ...(base.tooltip || {}), ...(options?.tooltip || {}) };

    return out;
  }, [categories, gridColor, labelColor, options, stacked]);

  const hasData = Array.isArray(series) && series.length > 0;

  return (
    <Box aria-label={ariaLabel || 'Mixed chart'} role="img">
      {hasData ? (
        <Suspense fallback={<Skeleton h={`${height}px`} w="100%" borderRadius="md" />}>
          <LazyApexChart options={mergedOptions as any} series={series as any} type="line" height={height} width="100%" />
        </Suspense>
      ) : (
        <Text fontSize="sm">No data available.</Text>
      )}
      <noscript>Chart unavailable without JavaScript.</noscript>
    </Box>
  );
}
