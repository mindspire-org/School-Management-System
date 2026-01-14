import React from "react";
import ReactApexChart from "react-apexcharts";

class LineChart extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      chartData: [],
      chartOptions: {},
    };
  }

  componentDidMount() {
    this.setState({
      chartData: this.props.chartData,
      chartOptions: this.mergeWithDefaults(this.props.chartOptions),
    });
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.chartData !== this.props.chartData ||
      prevProps.chartOptions !== this.props.chartOptions
    ) {
      this.setState({
        chartData: this.props.chartData,
        chartOptions: this.mergeWithDefaults(this.props.chartOptions),
      });
    }
  }

  mergeWithDefaults = (options = {}) => {
    // Ensure tooltips are enabled unless explicitly disabled by parent
    const defaultOpts = {
      tooltip: { enabled: true, shared: true, intersect: false },
      chart: { toolbar: { show: false } },
      dataLabels: { enabled: false },
    };
    return {
      ...defaultOpts,
      ...options,
      tooltip: { ...(defaultOpts.tooltip || {}), ...(options.tooltip || {}) },
      chart: { ...(defaultOpts.chart || {}), ...(options.chart || {}) },
      dataLabels: { ...(defaultOpts.dataLabels || {}), ...(options.dataLabels || {}) },
    };
  };

  render() {
    return (
      <ReactApexChart
        options={this.state.chartOptions}
        series={this.state.chartData}
        type='area'
        width='100%'
        height='100%'
      />
    );
  }
}

export default LineChart;
