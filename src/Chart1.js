import React, { PureComponent } from 'react';
import { LineChart, Line, Legend, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default class Example extends PureComponent {
  render() {
    // Loading the data
    const { data } = this.props;

    // Grouping data by week and calculating mean values
    const aggregatedData = data.reduce((acc, current) => {
      const weekStart = current.start; 
      if (!acc[weekStart]) {
        acc[weekStart] = { weekStart, totalNightLight: 0, totalNightRem: 0, totalNightDeep: 0, count: 0 };
      }
      acc[weekStart].totalNightLight += parseFloat(current.percentageNightLight);
      acc[weekStart].totalNightRem += parseFloat(current.percentageNightRem);
      acc[weekStart].totalNightDeep += parseFloat(current.percentageNightDeep);
      acc[weekStart].count++;
      return acc;
    }, {});

    const meanData = Object.values(aggregatedData).map(weekData => ({
      ...weekData,
      percentageNightLight: weekData.totalNightLight / weekData.count,
      percentageNightRem: weekData.totalNightRem / weekData.count,
      percentageNightDeep: weekData.totalNightDeep / weekData.count,
    }));

    // Drawing the graph
    return (
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={meanData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="weekStart" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="percentageNightLight" stroke="#8884d8" name="Night Light" />
          <Line type="monotone" dataKey="percentageNightRem" stroke="#82ca9d" name="Night REM" />
          <Line type="monotone" dataKey="percentageNightDeep" stroke="#ffc658" name="Night Deep" />
        </LineChart>
      </ResponsiveContainer>
    );
  }
}
