import React, { useMemo } from 'react';
import { Box, Text, useColorModeValue } from '@chakra-ui/react';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';

export type BarChartProps = {
  series: any;
  categories: string[];
  height?: number;
  stacked?: boolean;
  horizontal?: boolean;
  ariaLabel: string;
  options?: ApexOptions;
};

export default function BarChart({ series, categories, height = 320, stacked, horizontal, ariaLabel, options }: BarChartProps) {
  const gridColor = useColorModeValue('#EDF2F7', '#2D3748');
  const labelColor = useColorModeValue('#334155', '#CBD5E1');

  const mergedOptions: ApexOptions = useMemo(() => {
    const isHorizontal = Boolean(horizontal);
    const baseTickAmount = isHorizontal ? 4 : undefined;

    const base: ApexOptions = {
      chart: { type: 'bar', toolbar: { show: false }, animations: { enabled: false } },
      plotOptions: {
        bar: {
          borderRadius: 6,
          columnWidth: '32%',
          horizontal: isHorizontal,
          barHeight: '45%',
        },
      },
      grid: { borderColor: gridColor, strokeDashArray: 4 },
      dataLabels: { enabled: false },
      xaxis: {
        categories,
        tickAmount: baseTickAmount,
        labels: {
          style: { colors: labelColor, fontSize: '12px' },
          hideOverlappingLabels: true,
          showDuplicates: false,
          trim: true,
          rotate: 0,
          rotateAlways: false,
        },
      },
      yaxis: { labels: { style: { colors: labelColor } } },
      legend: { position: 'top' },
      tooltip: { shared: true, intersect: false },
      responsive: [
        {
          breakpoint: 640,
          options: {
            legend: { position: 'bottom' },
            plotOptions: { bar: { columnWidth: '44%', barHeight: '38%' } },
            xaxis: {
              labels: {
                fontSize: '10px',
                rotate: isHorizontal ? 0 : -45,
                rotateAlways: !isHorizontal,
                hideOverlappingLabels: true,
                showDuplicates: false,
                trim: true,
              },
              tickAmount: isHorizontal ? 4 : Math.min(6, categories.length || 6),
            },
            yaxis: {
              labels: {
                style: { fontSize: '10px' },
              },
            },
          },
        },
      ],
    };

    const out: ApexOptions = { ...base, ...(options || {}) };

    out.chart = { ...(base.chart || {}), ...(options?.chart || {}), stacked: Boolean(stacked) };

    const basePlot: any = base.plotOptions || {};
    const optPlot: any = options?.plotOptions || {};
    out.plotOptions = {
      ...basePlot,
      ...optPlot,
      bar: {
        ...(basePlot.bar || {}),
        ...(optPlot.bar || {}),
      },
    } as any;

    const baseX: any = base.xaxis || {};
    const optX: any = options?.xaxis || {};
    out.xaxis = {
      ...baseX,
      ...optX,
      categories,
      labels: {
        ...(baseX.labels || {}),
        ...(optX.labels || {}),
        style: {
          ...(baseX.labels?.style || {}),
          ...(optX.labels?.style || {}),
        },
      },
    } as any;

    const baseY: any = base.yaxis || {};
    const optY: any = options?.yaxis || {};
    out.yaxis = {
      ...baseY,
      ...optY,
      labels: {
        ...(baseY.labels || {}),
        ...(optY.labels || {}),
        style: {
          ...(baseY.labels?.style || {}),
          ...(optY.labels?.style || {}),
        },
      },
    } as any;

    out.grid = { ...(base.grid || {}), ...(options?.grid || {}) };
    out.legend = { ...(base.legend || {}), ...(options?.legend || {}) };
    out.dataLabels = { ...(base.dataLabels || {}), ...(options?.dataLabels || {}) };
    out.tooltip = { ...(base.tooltip || {}), ...(options?.tooltip || {}) };
    out.responsive = options?.responsive || base.responsive;

    return out;
  }, [categories, gridColor, horizontal, labelColor, options, stacked]);

  const hasData = Array.isArray(series) && series.length > 0;

  return (
    <Box aria-label={ariaLabel} role="img">
      {hasData ? (
        <ReactApexChart options={mergedOptions} series={series as any} type="bar" height={height} width="100%" />
      ) : (
        <Text fontSize="sm">No data available.</Text>
      )}
      <noscript>Chart unavailable without JavaScript.</noscript>
    </Box>
  );
}
