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
table = dynamodb.Table('sleep_data')


def lambda_handler(event, context):
    
    # Reading contents of file into dataframes
    raw_content = s3.get_object(Bucket=bucket_name, Key="raw_sleep.csv")['Body'].read()
    metrics_content = s3.get_object(Bucket=bucket_name, Key="sleep_metrics.csv")['Body'].read()

    raw = pd.read_csv(io.BytesIO(raw_content)).dropna()
    metrics = pd.read_csv(io.BytesIO(metrics_content)).dropna()
    
    # Prevents lambda function memory exception
    del raw_content
    del metrics_content
    
    # Merging and cleaning
    merged = pd.merge(raw, metrics, on='sleep_session_id', how='inner')
    merged = merged.drop(['id', 'timezone', 'log_method', 'user_id', 'end', 'stage'], axis=1)
    merged['start'] = pd.to_datetime(merged['start'])
    merged['start'] = merged['start'].dt.date
    merged = merged.dropna().drop_duplicates()
    
    merged['start'] = pd.to_datetime(merged['start'])
    merged['start'] = merged['start'].dt.date
    merged = merged.dropna().drop_duplicates()
    
    # Pivoting to relevant columns
    df = merged.pivot_table(index='start', columns='sleep_metric', values='value', aggfunc='sum').reset_index().dropna()
    df['start'] = df['start'].astype(str)
    
    print(df.dtypes)

    
    # Writing dataframe to DynamoDB
    for _, row in df.iterrows():
        # Convert every item in the row to a string
        for col in row.index:
            row[col] = str(row[col])
        
        item = row.to_dict()
        table.put_item(Item=item)
    
        
    return {
        'statusCode': 200,
        'body': json.dumps('Success')
    }



