

import pandas as pd

s3 = boto3.client("s3")
bucket_name = '121health-data'
file_key = 'raw_sleep.csv'

def lambda_handler(event, context):
    
    response = s3.get_object(Bucket=bucket_name, Key=file_key)
    
    # Extract the content of the file
    file_content = response['Body'].read()
    df = pd.read_csv(response['Body'])
    
    # Calculating epoch time
    df['start'] = pd.to_datetime(df['start'])
    df['end'] = pd.to_datetime(df['end'])
    
    # Convert datetime objects to epoch time
    df['start_epoch'] = df['start'].astype(int) // 10**9
    df['end_epoch'] = df['end'].astype(int) // 10**9
    df["duration"] = df['end_epoch'] - df['start_epoch']
    
    # Calculating the durations of each event
    duration_sum = df.groupby('stage')['duration'].sum()
    print(duration_sum)

    return {
        'statusCode': 200,
        'body': json.dumps('Success')
    }
