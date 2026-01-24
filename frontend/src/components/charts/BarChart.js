import React, { useMemo } from "react";
import Chart from "react-apexcharts";

const ColumnChart = ({ chartData, chartOptions, height = 300 }) => {
  const defaults = useMemo(() => ({
    chart: {
      animations: { enabled: false },
      toolbar: { show: false },
      sparkline: { enabled: false },
      zoom: { enabled: false },
      parentHeightOffset: 0,
    },
    tooltip: { fixed: { enabled: true }, followCursor: false, shared: true, intersect: false },
    legend: { show: false },
    grid: { padding: { left: 12, right: 12 } },
    plotOptions: { bar: { borderRadius: 3 } },
    dataLabels: { enabled: false },
    states: { hover: { filter: { type: 'none' } }, active: { filter: { type: 'none' } } },
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
    return o;
  }, [defaults, chartOptions]);

  const series = chartData || [];

  return (
    <Chart
      options={mergedOptions}
      series={series}
      type='bar'
      width='100%'
      height={height}
    />
  );
};

export default ColumnChart;
