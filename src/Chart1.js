import React, { PureComponent } from 'react';
import { LineChart, Line, Legend, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default class Example extends PureComponent {
  render() {
    // Loading the data
    const { data } = this.props;

    // Grouping data by month and calculating mean values
    const aggregatedData = data.reduce((acc, current) => {
      const month = current.start.substring(0, 7); // Extracting the year-month part from the start date
      if (!acc[month]) {
        acc[month] = { month, totalNightLight: 0, totalNightRem: 0, totalNightDeep: 0, count: 0 };
      }
      acc[month].totalNightLight += parseFloat(current.percentageNightLight);
      acc[month].totalNightRem += parseFloat(current.percentageNightRem);
      acc[month].totalNightDeep += parseFloat(current.percentageNightDeep);
      acc[month].count++;
      return acc;
    }, {});

    const meanData = Object.values(aggregatedData).map(monthData => ({
      ...monthData,
      percentageNightLight: monthData.totalNightLight / monthData.count,
      percentageNightRem: monthData.totalNightRem / monthData.count,
      percentageNightDeep: monthData.totalNightDeep / monthData.count,
    }));

    // Tooltip formatter function to round values to 1 decimal place
    const tooltipFormatter = (value) => `${value.toFixed(1)}%`;

    // Ideal values for each factor
    const idealValues = {
      percentageNightLight: 60,
      percentageNightRem: 25,
      percentageNightDeep: 20,
    };

    // Drawing the graph
    return (
      <div class="chart">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={meanData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(tick) => `${tick}%`} />
            <Tooltip formatter={tooltipFormatter} />
            <Legend />
            <Line type="monotone" dataKey="percentageNightLight" stroke="#8884d8" strokeWidth={1.5} name="Light Sleep" />
            <Line type="monotone" dataKey="percentageNightRem" stroke="#82ca9d" strokeWidth={1.5} name="REM Sleep" />
            <Line type="monotone" dataKey="percentageNightDeep" stroke="#ffc658" strokeWidth={1.5} name="Deep Sleep" />
            {Object.keys(idealValues).map((factor, index) => (
              <ReferenceLine key={index} y={idealValues[factor]} stroke={getColor(factor)} strokeDasharray="5 5"/>
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }
}

// Function to get color based on factor
const getColor = (factor) => {
  switch (factor) {
    case 'percentageNightLight':
      return '#8884d8';
    case 'percentageNightRem':
      return '#82ca9d';
    case 'percentageNightDeep':
      return '#ffc658';
    default:
      return 'black';
  }
};
