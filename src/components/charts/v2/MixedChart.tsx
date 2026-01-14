import React, { useMemo } from 'react';
import { Box, Text, useColorModeValue } from '@chakra-ui/react';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';

export type MixedChartProps = {
  series: any;
  categories: string[];
  height?: number;
  ariaLabel: string;
  options?: ApexOptions;
};

export default function MixedChart({ series, categories, height = 340, ariaLabel, options }: MixedChartProps) {
  const gridColor = useColorModeValue('#EDF2F7', '#2D3748');
  const labelColor = useColorModeValue('#334155', '#CBD5E1');

  const mergedOptions: ApexOptions = useMemo(() => {
    const base: ApexOptions = {
      chart: { type: 'line', stacked: false, toolbar: { show: false }, animations: { enabled: false } },
      stroke: { width: [0, 3], curve: 'smooth' },
      plotOptions: { bar: { borderRadius: 6, columnWidth: '46%' } },
      dataLabels: { enabled: false },
      grid: { borderColor: gridColor, strokeDashArray: 4 },
      xaxis: { categories, labels: { style: { colors: labelColor } } },
      yaxis: { labels: { style: { colors: labelColor } } },
      legend: { position: 'top' },
      tooltip: { shared: true, intersect: false },
    };

    const out: ApexOptions = { ...base, ...(options || {}) };
    out.chart = { ...(base.chart || {}), ...(options?.chart || {}) };
    out.stroke = { ...(base.stroke || {}), ...(options?.stroke || {}) };
    out.plotOptions = { ...(base.plotOptions || {}), ...(options?.plotOptions || {}) };
    out.grid = { ...(base.grid || {}), ...(options?.grid || {}) };
    out.xaxis = { ...(base.xaxis || {}), ...(options?.xaxis || {}), categories };
    out.yaxis = { ...(base.yaxis || {}), ...(options?.yaxis || {}) };
    out.legend = { ...(base.legend || {}), ...(options?.legend || {}) };
    out.dataLabels = { ...(base.dataLabels || {}), ...(options?.dataLabels || {}) };
    out.tooltip = { ...(base.tooltip || {}), ...(options?.tooltip || {}) };
    return out;
  }, [categories, gridColor, labelColor, options]);

  const hasData = Array.isArray(series) && series.length > 0;

  return React.createElement(
    Box,
    { 'aria-label': ariaLabel, role: 'img' },
    hasData
      ? React.createElement(ReactApexChart as any, {
          options: mergedOptions as any,
          series: series as any,
          type: 'line',
          height,
          width: '100%',
        })
      : React.createElement(Text, { fontSize: 'sm' }, 'No data available.'),
    React.createElement('noscript', null, 'Chart unavailable without JavaScript.')
  );
}
