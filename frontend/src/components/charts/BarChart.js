import React, { useMemo } from "react";
import { useColorModeValue } from '@chakra-ui/react';
import Chart from "react-apexcharts";

const ColumnChart = ({ chartData, chartOptions, height = 300 }) => {
  const labelColor = useColorModeValue('#334155', '#CBD5E1');
  const gridColor = useColorModeValue('#E2E8F0', '#2D3748');
  const mode = useColorModeValue('light', 'dark');

  const defaults = useMemo(() => ({
    chart: {
      animations: { enabled: false },
      toolbar: { show: false },
      sparkline: { enabled: false },
      zoom: { enabled: false },
      parentHeightOffset: 0,
      foreColor: labelColor,
    },
    tooltip: { fixed: { enabled: true }, followCursor: false, shared: true, intersect: false },
    legend: { show: false },
    grid: { padding: { left: 12, right: 12 }, borderColor: gridColor, strokeDashArray: 4 },
    plotOptions: { bar: { borderRadius: 3 } },
    dataLabels: { enabled: false },
    states: { hover: { filter: { type: 'none' } }, active: { filter: { type: 'none' } } },
    xaxis: { labels: { style: { colors: labelColor } } },
    yaxis: { labels: { style: { colors: labelColor } } },
    theme: { mode },
  }), []);

  const mergedOptions = useMemo(() => {
    const o = { ...defaults, ...(chartOptions || {}) };
    o.chart = { ...(defaults.chart || {}), ...(chartOptions?.chart || {}) };
    o.tooltip = { ...(defaults.tooltip || {}), ...(chartOptions?.tooltip || {}) };
    o.grid = { ...(defaults.grid || {}), ...(chartOptions?.grid || {}) };
    o.legend = { ...(defaults.legend || {}), ...(chartOptions?.legend || {}) };
    o.plotOptions = { ...(defaults.plotOptions || {}), ...(chartOptions?.plotOptions || {}) };
    o.dataLabels = { ...(defaults.dataLabels || {}), ...(chartOptions?.dataLabels || {}) };
    o.states = { ...(defaults.states || {}), ...(chartOptions?.states || {}) };
    o.xaxis = { ...(defaults.xaxis || {}), ...(chartOptions?.xaxis || {}) };
    o.yaxis = { ...(defaults.yaxis || {}), ...(chartOptions?.yaxis || {}) };
    o.theme = { ...(defaults.theme || {}), ...(chartOptions?.theme || {}) };
    return o;
  }, [defaults, chartOptions]);

  const series = chartData || [];

  return React.createElement(Chart, {
    options: mergedOptions,
    series,
    type: 'bar',
    width: '100%',
    height,
  });
};

export default ColumnChart;
