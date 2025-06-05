# S3 File Upload Web Application

This project implements a web application that allows users to upload files to Amazon S3 using pre-signed URLs. The infrastructure is defined using AWS CloudFormation and includes AWS Amplify for hosting the web application.

## Architecture

The solution consists of the following components:

1. **Web Application**:
   - Simple HTML/CSS/JavaScript frontend hosted on AWS Amplify
   - Allows users to select and upload files
   - Communicates with API Gateway to get pre-signed URLs

2. **AWS Services**:
   - **S3 Buckets**:
     - Web app bucket: Stores the web application code
     - Uploads bucket: Stores the user-uploaded files
   - **Lambda Function**: Generates pre-signed URLs for secure S3 uploads
   - **API Gateway**: Exposes the Lambda function as a REST API
   - **AWS Amplify**: Hosts the web application

3. **Security**:
   - Files are uploaded directly to S3 using pre-signed URLs
   - No server-side processing of file content
   - Limited-time pre-signed URLs (5 minutes)

## Project Structure

```
.
├── deploy.sh                # Deployment script
├── lambda/                  # Lambda function code
│   ├── index.js             # Lambda function implementation
│   ├── index.test.js        # Unit tests for Lambda function
│   └── package.json         # Node.js dependencies
├── template.yaml            # CloudFormation template
└── webapp/                  # Web application code
    ├── app.js               # JavaScript for the web app
    ├── index.html           # HTML structure
    └── styles.css           # CSS styling
```

## Deployment Instructions

### Prerequisites

- AWS CLI installed and configured with appropriate permissions
- Node.js and npm (for running tests)

### Steps to Deploy

1. Clone this repository:
   ```
   git clone <repository-url>
   cd web-app-s3-upload2
   ```

2. Make the deployment script executable:
   ```
   chmod +x deploy.sh
   ```

3. Deploy the CloudFormation stack:
   ```
   ./deploy.sh my-file-upload-app us-east-1
   ```
   Replace `my-file-upload-app` with your desired stack name and `us-east-1` with your preferred AWS region.

4. The script will:
   - Deploy the CloudFormation stack
   - Update the API endpoint in the web app code
   - Upload the web app files to the S3 bucket
   - Display the URL where your web app is accessible

## Running Tests

To run the Lambda function tests:

```
cd lambda
npm install
npm test
```

## How It Works

1. User selects a file in the web application
2. When the user clicks "Upload", the app sends a request to the API Gateway
3. API Gateway triggers the Lambda function
4. Lambda function generates a pre-signed URL for the S3 bucket
5. The pre-signed URL is returned to the web app
6. The web app uses the pre-signed URL to upload the file directly to S3
7. The upload progress is displayed to the user

## Security Considerations

- The pre-signed URLs are valid for only 5 minutes
- CORS is configured on the S3 bucket to allow uploads from the web app
- The Lambda function has minimal permissions (only what's needed to generate pre-signed URLs)
- API Gateway provides an additional layer of security and rate limiting

## Customization

You can customize the following aspects of the application:

- Web app styling by modifying `webapp/styles.css`
- Upload parameters by editing the Lambda function in `lambda/index.js`
- Infrastructure settings by updating `template.yaml`

## License

This project is licensed under the MIT License - see the LICENSE file for details.