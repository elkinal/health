import React, { PureComponent } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';

export default class Example extends PureComponent {
  render() {
    // Loading the data
    let { data } = this.props;

    // Sorting data by weekday
    data = data.sort((a, b) => {
      const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
      return weekdays.indexOf(a.weekday) - weekdays.indexOf(b.weekday);
    });

    return (
      <div class="chart">
         <ResponsiveContainer width="100%" height={300}>
         <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
         >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="weekday" />
            <YAxis domain={[-70, 70]} tickFormatter={(tick) => `${tick}%`} /> 
            <Tooltip />
            <Legend />
            <ReferenceLine y={0} stroke="#000" />
            <Bar dataKey="school_percent_deviation" fill="#8884d8" name="School %" />
            <Bar dataKey="summer_percent_deviation" fill="#82ca9d" name="Summer %" />
         </BarChart>
         </ResponsiveContainer>
      </div>
    );
  }
}
