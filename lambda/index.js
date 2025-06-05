const AWS = require('aws-sdk');
const s3 = new AWS.S3();

exports.handler = async (event) => {
  try {
    // Parse request body
    const body = JSON.parse(event.body);
    const fileName = body.fileName;
    const fileType = body.fileType;
    
    if (!fileName || !fileType) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({ error: 'fileName and fileType are required' })
      };
    }
    
    // Generate a unique key for the file
    const fileKey = `${Date.now()}-${fileName}`;
    
    // Set parameters for pre-signed URL
    const params = {
      Bucket: process.env.UPLOADS_BUCKET,
      Key: fileKey,
      ContentType: fileType,
      Expires: 300 // URL expires in 5 minutes
    };
    
    // Generate pre-signed URL
    const url = await s3.getSignedUrlPromise('putObject', params);
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        uploadUrl: url,
        fileKey: fileKey
      })
    };
  } catch (error) {
    console.error('Error generating pre-signed URL:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({ error: 'Failed to generate pre-signed URL' })
    };
  }
};