import React, { useMemo } from 'react';
import { Box, Text, useColorModeValue } from '@chakra-ui/react';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';

export type AreaChartProps = {
  series: any;
  categories: string[];
  height?: number;
  ariaLabel: string;
  options?: ApexOptions;
};

export default function AreaChart({ series, categories, height = 340, ariaLabel, options }: AreaChartProps) {
  const gridColor = useColorModeValue('#EDF2F7', '#2D3748');
  const labelColor = useColorModeValue('#334155', '#CBD5E1');

  const mergedOptions: ApexOptions = useMemo(() => {
    const base: ApexOptions = {
      chart: { type: 'area', toolbar: { show: false }, animations: { enabled: false } },
      stroke: { curve: 'smooth', width: 3 },
      dataLabels: { enabled: false },
      grid: { borderColor: gridColor, strokeDashArray: 4 },
      xaxis: { categories, labels: { style: { colors: labelColor } } },
      yaxis: { labels: { style: { colors: labelColor } } },
      legend: { show: true, position: 'top' },
      tooltip: { shared: true, intersect: false },
      fill: {
        type: 'gradient',
        gradient: { shadeIntensity: 0.2, opacityFrom: 0.35, opacityTo: 0.05, stops: [0, 90, 100] },
      },
      responsive: [
        {
          breakpoint: 640,
          options: {
            legend: { position: 'bottom' },
            xaxis: {
              labels: {
                rotate: -45,
                rotateAlways: true,
                hideOverlappingLabels: true,
                showDuplicates: false,
                trim: true,
              },
              tickAmount: Math.min(6, categories.length || 6),
            },
          },
        },
      ],
    };

    const out: ApexOptions = { ...base, ...(options || {}) };
    out.chart = { ...(base.chart || {}), ...(options?.chart || {}) };
    out.stroke = { ...(base.stroke || {}), ...(options?.stroke || {}) };
    out.grid = { ...(base.grid || {}), ...(options?.grid || {}) };
    out.xaxis = { ...(base.xaxis || {}), ...(options?.xaxis || {}), categories };
    out.yaxis = { ...(base.yaxis || {}), ...(options?.yaxis || {}) };
    out.legend = { ...(base.legend || {}), ...(options?.legend || {}) };
    out.dataLabels = { ...(base.dataLabels || {}), ...(options?.dataLabels || {}) };
    out.tooltip = { ...(base.tooltip || {}), ...(options?.tooltip || {}) };
    out.fill = { ...(base.fill || {}), ...(options?.fill || {}) };
    out.responsive = options?.responsive || base.responsive;
    return out;
  }, [categories, gridColor, labelColor, options]);

  const hasData = Array.isArray(series) && series.length > 0;

  return (
    <Box aria-label={ariaLabel} role="img">
      {hasData ? (
        <ReactApexChart options={mergedOptions} series={series as any} type="area" height={height} width="100%" />
      ) : (
        <Text fontSize="sm">No data available.</Text>
      )}
      <noscript>Chart unavailable without JavaScript.</noscript>
    </Box>
  );
}
