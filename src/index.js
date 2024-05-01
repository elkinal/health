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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      ProjectionExpression: '#start, #percentageNightDeep, #percentageNightLight, #percentageNightRem, #percentageNightUnknown',
      ExpressionAttributeNames: {
        '#start': 'start',
        '#percentageNightDeep': 'percentageNightDeep',
        '#percentageNightLight': 'percentageNightLight',
        '#percentageNightRem': 'percentageNightRem',
        '#percentageNightUnknown' : 'percentageNightUnknown'
      }
    };

    // Ensure data only passed as prop if it loads
    docClient.scan(params, (err, result) => {
      if (err) {
        console.error("Unable to read data from DynamoDB. Error JSON:", JSON.stringify(err, null, 2));
        setError("Unable to fetch data. Please try again later.");
      } else {
        // Sort the data in increasing order by date
        const sortedData = result.Items.sort((a, b) => {
          return new Date(a.start) - new Date(b.start);
        });
        setData(sortedData);
      }
      setLoading(false); 
    });
  }

  return (
    <div className="component">
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <div id="pie-chart">
          <Chart1 data={data} />
        </div>
      )}
    </div>
  );
}

ReactDOM.render(<MainForm />, document.getElementById('root'));

reportWebVitals();
