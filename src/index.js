import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { PieChart } from 'recharts';
import Chart1 from "./Chart1";
import AWS from 'aws-sdk';
import config from './credentials'; // Import the configuration file

function MainForm() {
  const [data, setData] = useState(null);

  useEffect(() => {
    getData();
  }, []);

  function getData() {
    // Configuring AWS client
    AWS.config.update({
      region: 'us-east-2',
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey
    });

    const docClient = new AWS.DynamoDB.DocumentClient();

    const params = {
      TableName: 'sleep_data',
      ProjectionExpression: '#start, #percentageNightDeep, #percentageNightLight, #percentageNightRem',
      ExpressionAttributeNames: {
        '#start': 'start',
        '#percentageNightDeep': 'percentageNightDeep',
        '#percentageNightLight': 'percentageNightLight',
        '#percentageNightRem': 'percentageNightRem'
      }
    };

    // Perform the scan operation
    docClient.scan(params, (err, result) => {
      if (err) {
        console.error("Unable to read data from DynamoDB. Error JSON:", JSON.stringify(err, null, 2));
      } else {
        setData(result.Items);
      }
    });
  }

  return (
    <div className="component">
      <div id="pie-chart">
        <Chart1 data={data} />
        {console.log(data)}
      </div>
    </div>
  );
}

ReactDOM.render(<MainForm />, document.getElementById('root'));

reportWebVitals();
