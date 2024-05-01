import React, { useEffect } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism.css'; 
import 'prismjs/components/prism-python';

const CodeSnippet = () => {
  useEffect(() => {
    Prism.highlightAll();
  }, []);

  return (
    <div className="chart code-chart">
      <pre>
        <code className="language-python">{`
import json
import pandas as pd
import boto3
import io
import random
import uuid

# Initializing credentials
s3 = boto3.client("s3")
bucket_name = '121health-data'
dynamodb = boto3.resource('dynamodb')

def lambda_handler(event, context):

    df = writeFirstTable()
    writeSecondTable(df)
    
    return {
        'statusCode': 200,
        'body': json.dumps('Success')
    }

def writeToTable(table_name, df):
    table = dynamodb.Table(table_name)
    for _, row in df.iterrows():
        # Convert every item in the row to a string
        for col in row.index:
            row[col] = str(row[col])
        
        item = row.to_dict()
        table.put_item(Item=item)


def writeFirstTable():
    # Reading contents of file into dataframes
    raw_content = s3.get_object(Bucket=bucket_name, Key="raw_sleep.csv")['Body'].read()
    metrics_content = s3.get_object(Bucket=bucket_name, Key="sleep_metrics.csv")['Body'].read()

    raw = pd.read_csv(io.BytesIO(raw_content)) \\
            .dropna()
    metrics = pd.read_csv(io.BytesIO(metrics_content)) \\
                .dropna()
    
    # Merging and cleaning
    merged = pd.merge(raw, metrics, on='sleep_session_id', how='inner') \\
                .drop(['id', 'timezone', 'log_method', 'user_id', 'end', 'stage'], axis=1)
    merged['start'] = pd.to_datetime(merged['start'])
    merged['start'] = merged['start'].dt.date
    merged = merged.dropna().drop_duplicates()
    merged['start'] = pd.to_datetime(merged['start'])
    merged['start'] = merged['start'].dt.date
    merged = merged.dropna().drop_duplicates()
    
    # Pivoting to relevant columns
    df = merged.pivot_table(index='start', columns='sleep_metric', values='value', aggfunc='sum') \\
                .reset_index() \\
                .dropna()
    df['start'] = df['start'].astype(str)

    # Writing dataframe to DynamoDB
    writeToTable('sleep_data', df)
    return df
    
def writeSecondTable(df):
    df['start'] = pd.to_datetime(df['start'])

    # Define the date ranges for Cornell University's school days
    school_start_date_1 = pd.to_datetime('2022-08-21')
    school_end_date_1 = pd.to_datetime('2022-12-16')
    school_start_date_2 = pd.to_datetime('2023-01-22')
    school_end_date_2 = pd.to_datetime('2023-05-18')
    
    # Determines if a date falls within the school days
    def is_school_day(date):
        return (school_start_date_1 <= date <= school_end_date_1) or \\
               (school_start_date_2 <= date <= school_end_date_2)
    
    # Adding a new column called 'timeframe'
    df['timeframe'] = df['start'].apply(lambda x: 'school' if is_school_day(x) else 'summer')
    
    # Calculating the average sleep latency per night of the week for school and summer
    school_avg_sleep_latency = df[df['timeframe'] == 'school'] \\
                                    .groupby(df['start'].dt.day_name())['sleepLatency'] \\
                                    .mean()
    summer_avg_sleep_latency = df[df['timeframe'] == 'summer'] \\
                                    .groupby(df['start'].dt.day_name())['sleepLatency'] \\
                                    .mean()
    
    # Creating DataFrames for the results
    school_sleep_latency_df = pd.DataFrame({
       'weekday': school_avg_sleep_latency.index, 'school_latency': school_avg_sleep_latency.values
    })
    summer_sleep_latency_df = pd.DataFrame({
       'weekday': summer_avg_sleep_latency.index, 'summer_latency': summer_avg_sleep_latency.values
    })
    
    # Sorting days from Monday to Sunday + combine dataframes
    days_of_week = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    school_sleep_latency_df = school_sleep_latency_df.set_index('weekday') \\
                                    .reindex(days_of_week) \\
                                    .reset_index()
    summer_sleep_latency_df = summer_sleep_latency_df.set_index('weekday') \\
                                    .reindex(days_of_week) \\
                                    .reset_index()
    sleep_latency = pd.merge(school_sleep_latency_df, summer_sleep_latency_df, on='weekday')
    
    # Finding average sleep latency per category
    mean_school_latency = school_avg_sleep_latency.mean()
    mean_summer_latency = summer_avg_sleep_latency.mean()
    
   sleep_latency["school_percent_deviation"] = round(
      100 * (sleep_latency["school_latency"] - mean_school_latency) / (mean_school_latency), 1)
   
   sleep_latency["summer_percent_deviation"] = round(
      100 * (sleep_latency["summer_latency"] - mean_summer_latency) / (mean_summer_latency), 1)
    
    # Writing dataframe to DynamoDB
    writeToTable('latency_data', sleep_latency)

        `}</code>
      </pre>
    </div>
  );
};

export default CodeSnippet;
