import React from "react";
import ReactApexChart from "react-apexcharts";

// Lightweight sparkline/mini area chart for statistic cards
// Props:
// - data: number[]
// - color?: string (hex or Chakra-resolved color string)
// - height?: number
function SparklineChart({ data, color = "#3965FF", height = 48, valueFormatter }) {
  if (!Array.isArray(data) || data.length === 0) return null;

  const series = [
    {
      name: "trend",
      data,
    },
  ];

  const options = {
    chart: {
      type: "area",
      sparkline: { enabled: true },
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    stroke: {
      curve: "smooth",
      width: 3,
    },
    markers: {
      size: 0,
      hover: { size: 4 },
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 0.4,
        opacityFrom: 0.4,
        opacityTo: 0,
        stops: [0, 100],
      },
    },
    colors: [color],
    dataLabels: { enabled: false },
    tooltip: {
      enabled: true,
      x: { show: false },
      y: {
        formatter: typeof valueFormatter === 'function' ? valueFormatter : (val) => `${val}`,
      },
      marker: { show: true },
    },
    grid: { show: false },
    xaxis: { labels: { show: false }, axisBorder: { show: false }, axisTicks: { show: false } },
    yaxis: { labels: { show: false } },
  };

  return (
    <ReactApexChart
      options={options}
      series={series}
      type="area"
      width="100%"
      height={height}
    />
  );
}

export default SparklineChart;
