import React, { useMemo } from 'react';
import { Box } from '@chakra-ui/react';
import ChartCard from '../../components/ChartCard';
import MixedChart from '../../components/charts/MixedChart';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
const onlineSales = [120, 150, 170, 130, 190, 210];
const offlineSales = [90, 110, 95, 120, 140, 160];
const cumulative = [210, 260, 355, 385, 515, 665];

export default function MonthlySummaryChart() {
  const series = useMemo(
    () => [
      { name: 'Online', type: 'column', data: onlineSales },
      { name: 'Offline', type: 'column', data: offlineSales },
      { name: 'Cumulative', type: 'line', data: cumulative },
    ],
    []
  );

  const options = useMemo(
    () => ({
      chart: { stacked: true },
      stroke: { width: [0, 0, 3] },
      plotOptions: { bar: { borderRadius: 6, columnWidth: '46%' } },
      legend: { show: true, position: 'top' },
      yaxis: {
        labels: {
          formatter: (v: number) => `$${Math.round(v).toLocaleString()}`,
        },
      },
      tooltip: {
        y: {
          formatter: (v: number) => `$${Math.round(v).toLocaleString()}`,
        },
      },
    }),
    []
  );

  return (
    <ChartCard title="Monthly Summary" subtitle="Stacked online/offline with cumulative trend" ariaLabel="Monthly summary chart">
      <Box>
        <MixedChart ariaLabel="Monthly summary mixed chart" categories={months} series={series as any} height={340} options={options as any} stacked />
      </Box>
    </ChartCard>
  );
}
