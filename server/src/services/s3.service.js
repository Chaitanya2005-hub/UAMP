const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

class S3Service {
  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      endpoint: process.env.AWS_ENDPOINT_URL_S3,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      },
      forcePathStyle: true // Required for custom S3 endpoints
    });
    this.bucketName = process.env.S3_BUCKET_NAME || 'uamp-exam-storage';
  }

  /**
   * Upload a file to S3
   */
  async uploadFile(key, buffer, contentType) {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType
    });

    try {
      await this.s3Client.send(command);
      const url = `https://${this.bucketName}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;
      return { key, url };
    } catch (error) {
      console.error('S3 upload error:', error);
      throw error;
    }
  }

  /**
   * Get a presigned URL for file download
   */
  async getPresignedUrl(key, expiresIn = 3600) {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key
    });

    try {
      const url = await getSignedUrl(this.s3Client, command, { expiresIn });
      return url;
    } catch (error) {
      console.error('S3 presigned URL error:', error);
      throw error;
    }
  }

  /**
   * Delete a file from S3
   */
  async deleteFile(key) {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key
    });

    try {
      await this.s3Client.send(command);
      return { success: true, key };
    } catch (error) {
      console.error('S3 delete error:', error);
      throw error;
    }
  }

  /**
   * Generate a unique file key
   */
  generateKey(prefix, filename) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const extension = filename.split('.').pop();
    return `${prefix}/${timestamp}-${random}.${extension}`;
  }
}

module.exports = new S3Service();