import React, { PureComponent } from 'react';
import { LineChart, Line, Legend, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default class Example extends PureComponent {
  render() {
    // Loading the data
    const { data } = this.props;




    // Drawing the graph
    return (
      console.log(data)
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
