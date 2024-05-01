import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { PieChart } from 'recharts';
import Chart1 from "./Chart1";
import Chart2 from "./Chart2";
import Lambda from "./Lambda";
import AWS from 'aws-sdk';
import config from './credentials'; // Import the configuration file

function MainForm() {
  const [data, setData] = useState([]);
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

    const params1 = {
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

    const params2 = {
      TableName: 'latency_data', 
      ProjectionExpression: '#weekday, #school_percent_deviation, #summer_percent_deviation', 
      ExpressionAttributeNames: {
        '#weekday': 'weekday', 
        '#school_percent_deviation': 'school_percent_deviation',
        '#summer_percent_deviation' : 'summer_percent_deviation'
      }
    };

    // Fetch data from first table
    docClient.scan(params1, (err1, result1) => {
      if (err1) {
        console.error("Unable to read data from first table. Error JSON:", JSON.stringify(err1, null, 2));
        setError("Unable to fetch data. Please try again later.");
        setLoading(false);
        return;
      }

      // Fetch data from second table
      docClient.scan(params2, (err2, result2) => {
        if (err2) {
          console.error("Unable to read data from second table. Error JSON:", JSON.stringify(err2, null, 2));
          setError("Unable to fetch data. Please try again later.");
          setLoading(false);
          return;
        }

        // Combine data from both tables
        const combinedData = [
          result1.Items.sort((a, b) => new Date(a.start) - new Date(b.start)),
          result2.Items
        ];

        setData(combinedData);
        setLoading(false);
      });
    });
  }

  return (
    <div className="component">
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <div id="chart-container">
          <h1 id="main-heading">121 Health Fullstack Demo</h1>
          <h2 id="main-subheading">Alexey Elkin (ae339)</h2>

          <h2 class="subheading">How does the ratio of sleep stages change throughout the year?</h2>
          <Chart1 data={data[0]} />
          <p class="description">This graph shows the proportion of sleep stages</p>

          <h2 class="subheading">What days of the week does it take longest to fall asleep?</h2>
          <Chart2 data={data[1]} />
          <p class="description">What days of the week does it take longest to fall asleep?</p>

          <h1>Frontend</h1>
          <p>This website was created using <b>React.js</b> for the frontend. I used <b>Recharts.js</b> to draw the interactive graphs.</p>

          <h1>Backend</h1>
          <p>
            The raw <code>.csv</code> data is processed by an <b>AWS Lambda function</b> that loads the files from an <b>S3 Server</b> automatically once they are uploaded.
            The data inside the <code>.csv</code> files is formatted for each graph and written into two separate <b>DynamoDB</b> tables.
          </p>
          <p>
            You can see the code for the <b>Lambda function</b> below.
          </p>
          <Lambda />
        </div>
      )}
    </div>
  );
}

ReactDOM.render(<MainForm />, document.getElementById('root'));

reportWebVitals();
