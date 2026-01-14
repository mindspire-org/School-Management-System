import React, { useMemo } from 'react';
import { useColorModeValue } from '@chakra-ui/react';
import ReactApexChart from 'react-apexcharts';

export default function PieChart(props) {
  const labelColor = useColorModeValue('#334155', '#CBD5E1');
  const mode = useColorModeValue('light', 'dark');

  const series = Array.isArray(props.chartData) ? props.chartData : [];
  const incomingOptions = props.chartOptions && typeof props.chartOptions === 'object' ? props.chartOptions : {};
  const type = props.type || incomingOptions?.chart?.type || 'pie';

  const options = useMemo(() => {
    const base = {
      chart: {
        type,
        toolbar: { show: false },
        animations: { enabled: false },
        foreColor: labelColor,
      },
      legend: { position: 'bottom' },
      dataLabels: { enabled: false },
      stroke: { width: 0 },
      tooltip: { y: { formatter: (v) => `${v}` } },
      theme: { mode },
      plotOptions: {
        pie: {
          donut: { size: '70%' },
        },
      },
      responsive: [
        {
          breakpoint: 640,
          options: {
            legend: { position: 'bottom' },
          },
        },
      ],
    };

    const merged = { ...base, ...incomingOptions };
    merged.chart = { ...(base.chart || {}), ...(incomingOptions.chart || {}), type };
    merged.legend = { ...(base.legend || {}), ...(incomingOptions.legend || {}) };
    merged.dataLabels = { ...(base.dataLabels || {}), ...(incomingOptions.dataLabels || {}) };
    merged.stroke = { ...(base.stroke || {}), ...(incomingOptions.stroke || {}) };
    merged.tooltip = { ...(base.tooltip || {}), ...(incomingOptions.tooltip || {}) };
    merged.plotOptions = { ...(base.plotOptions || {}), ...(incomingOptions.plotOptions || {}) };
    merged.responsive = incomingOptions.responsive || base.responsive;
    merged.theme = { ...(base.theme || {}), ...(incomingOptions.theme || {}) };

    return merged;
  }, [incomingOptions, labelColor, mode, type]);

  return <ReactApexChart options={options} series={series} type={type} width="100%" height={props.height || 280} />;
}
