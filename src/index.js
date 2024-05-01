import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { PieChart } from 'recharts';
import Chart1 from "./Chart1";
import Chart2 from "./Chart2";
import Lambda from "./Lambda";
import ChatGPT from "./ChatGPT";
import AWS from 'aws-sdk';
import config from './credentials'; 

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
          <div id="heading-container">
            <h1 id="main-heading">121 Health Fullstack Demo</h1>
            <h2 id="main-subheading">Alexey Elkin (ae339)</h2>
          </div>

          <h1>Graphs</h1>
          <h2 class="subheading">How does the ratio of sleep stages change throughout the year?</h2>
          <Chart1 data={data[0]} />
          <p class="description">
            This graph shows the average proportion of sleep stages per month. 
            The dashed horizontal lines represent the <a href="https://dawnhouseliving.com/blogs/news/deep-vs-light-sleep-what-amount-is-really-needed" target="_blank">recommended</a> levels for each sleep phase,
            serving as a guide that lets the viewer know what aspects of their sleep they should improve.
          </p>
          <p class="description">
            Overall there is a tendency for the proportion of <u>Deep Sleep</u> to decrease across the two years, although this change is relatively minor.
            What's slightly more concerning is that the proportions of both <u>REM Sleep</u> and <u>Deep Sleep</u> are consistently below the recommendations.
            However, there is a natural varience in the sleep each individual requires so the user should consult a professional before making any assumptions.
          </p>
          <p class="variables">
            variables : <a href="https://garden.121health.app/Biometrics/percentageNightLight" target="_blank">percentageNightLight</a>, 
            <a href="https://garden.121health.app/Biometrics/percentageNightRem" target="_blank">  percentageNightREM</a>,
            <a href="https://garden.121health.app/Biometrics/percentageNightDeep" target="_blank"> percentageNightDeep</a>
          </p>

          <h2 class="subheading">What days of the week does it take the longest to fall asleep?</h2>
          <Chart2 data={data[1]} />
          <p class="description">This graph shows the percentage deviation in the average sleep latency across different days of the week.
          This data is separated into two categories: <u>School</u>, which only includes days during Cornell's semesters and <u>Summer</u> which only includes days during the break.</p>
          <p class="description">This graph shows that during school days, it usually takes much longer to fall asleep on Fridays and Saturdays (&#x1F37A;?)
          <br></br>On the other hand, the user tends to fall asleep very quickly on Mondays during the school year.</p>

          <p class="description">During breaks the user's <u>sleep latency</u> doesn't vary too much, although they tend to take longer to fall asleep on Thursdays, and slightly shorter on Mondays.</p>

          <p class="variables">
            variables : <a href="https://garden.121health.app/Biometrics/sleepLatency">sleepLatency</a>
          </p>
          <h1>Medical Chatbot</h1>
          <p>Suggested questions:</p>
          <ul>
            <li>How do I decrease my sleep latency?</li>
            <li>What factors influence the quality of sleep?</li>
            <li>What should I change in my routine to have more energy?</li>
          </ul>
          <ChatGPT />

          <h1>Frontend</h1>
          <p>This website was created using <b>React.js</b> for the frontend. I used <b>Recharts.js</b> to draw the interactive graphs.</p>
          <p>I used OpenAI's <b>ChatGPT API</b> to create the chatbot.</p>

          <h1>Backend</h1>
          <p>
            The raw <code>.csv</code> data is processed by an <b>AWS Lambda function</b> that loads the files from an <b>S3 Server</b> automatically when they are uploaded.
            The data inside the <code>.csv</code> files is formatted for each graph and written into two separate <b>DynamoDB</b> tables, which are then read by this <b>React.js</b> application.
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
