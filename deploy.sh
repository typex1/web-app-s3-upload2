#!/bin/bash

# Deploy CloudFormation stack and web app
# Usage: ./deploy.sh <stack-name> [region]

set -e

# Check if stack name is provided
if [ -z "$1" ]; then
  echo "Usage: ./deploy.sh <stack-name> [region]"
  exit 1
fi

STACK_NAME=$1
REGION=${2:-us-east-1}  # Default to us-east-1 if not specified

echo "Deploying CloudFormation stack: $STACK_NAME in region: $REGION"

# Deploy CloudFormation stack
aws cloudformation deploy \
  --template-file template.yaml \
  --stack-name $STACK_NAME \
  --capabilities CAPABILITY_IAM \
  --region $REGION

# Get outputs from CloudFormation stack
WEB_APP_BUCKET=$(aws cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --query "Stacks[0].Outputs[?OutputKey=='WebAppBucketName'].OutputValue" \
  --output text \
  --region $REGION)

API_ENDPOINT=$(aws cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --query "Stacks[0].Outputs[?OutputKey=='ApiEndpoint'].OutputValue" \
  --output text \
  --region $REGION)

AMPLIFY_URL=$(aws cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --query "Stacks[0].Outputs[?OutputKey=='AmplifyURL'].OutputValue" \
  --output text \
  --region $REGION)

echo "Web App Bucket: $WEB_APP_BUCKET"
echo "API Endpoint: $API_ENDPOINT"
echo "Amplify URL: $AMPLIFY_URL"

# Update API endpoint in app.js
echo "Updating API endpoint in app.js..."
sed -i "s|API_ENDPOINT_PLACEHOLDER|$API_ENDPOINT|g" webapp/app.js

# Upload web app files to S3
echo "Uploading web app files to S3..."
aws s3 sync webapp/ s3://$WEB_APP_BUCKET/ --region $REGION

echo "Deployment completed successfully!"
echo "Your web app will be available at: $AMPLIFY_URL"