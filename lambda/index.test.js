const AWS = require('aws-sdk');
const { handler } = require('./index');

// Mock AWS SDK
jest.mock('aws-sdk', () => {
  const mockGetSignedUrlPromise = jest.fn().mockReturnValue('https://example.com/presigned-url');
  
  return {
    S3: jest.fn(() => ({
      getSignedUrlPromise: mockGetSignedUrlPromise
    }))
  };
});

describe('Pre-signed URL Lambda Function', () => {
  beforeEach(() => {
    // Set environment variables
    process.env.UPLOADS_BUCKET = 'test-uploads-bucket';
    
    // Clear all mocks
    jest.clearAllMocks();
    
    // Mock Date.now() to return a fixed timestamp
    jest.spyOn(Date, 'now').mockImplementation(() => 1234567890);
  });
  
  test('should return a pre-signed URL when valid input is provided', async () => {
    // Arrange
    const event = {
      body: JSON.stringify({
        fileName: 'test-file.jpg',
        fileType: 'image/jpeg'
      })
    };
    
    // Act
    const result = await handler(event);
    const parsedBody = JSON.parse(result.body);
    
    // Assert
    expect(result.statusCode).toBe(200);
    expect(parsedBody.uploadUrl).toBe('https://example.com/presigned-url');
    expect(parsedBody.fileKey).toBe('1234567890-test-file.jpg');
    
    // Verify S3 getSignedUrlPromise was called with correct parameters
    const s3Instance = new AWS.S3();
    expect(s3Instance.getSignedUrlPromise).toHaveBeenCalledWith('putObject', {
      Bucket: 'test-uploads-bucket',
      Key: '1234567890-test-file.jpg',
      ContentType: 'image/jpeg',
      Expires: 300
    });
  });
  
  test('should return 400 error when fileName is missing', async () => {
    // Arrange
    const event = {
      body: JSON.stringify({
        fileType: 'image/jpeg'
      })
    };
    
    // Act
    const result = await handler(event);
    const parsedBody = JSON.parse(result.body);
    
    // Assert
    expect(result.statusCode).toBe(400);
    expect(parsedBody.error).toBe('fileName and fileType are required');
    expect(new AWS.S3().getSignedUrlPromise).not.toHaveBeenCalled();
  });
  
  test('should return 400 error when fileType is missing', async () => {
    // Arrange
    const event = {
      body: JSON.stringify({
        fileName: 'test-file.jpg'
      })
    };
    
    // Act
    const result = await handler(event);
    const parsedBody = JSON.parse(result.body);
    
    // Assert
    expect(result.statusCode).toBe(400);
    expect(parsedBody.error).toBe('fileName and fileType are required');
    expect(new AWS.S3().getSignedUrlPromise).not.toHaveBeenCalled();
  });
  
  test('should return 500 error when an exception occurs', async () => {
    // Arrange
    const event = {
      body: 'invalid-json'
    };
    
    // Act
    const result = await handler(event);
    const parsedBody = JSON.parse(result.body);
    
    // Assert
    expect(result.statusCode).toBe(500);
    expect(parsedBody.error).toBe('Failed to generate pre-signed URL');
    expect(new AWS.S3().getSignedUrlPromise).not.toHaveBeenCalled();
  });
});