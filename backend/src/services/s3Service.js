const AWS = require('aws-sdk');
const crypto = require('crypto');

class S3Service {
  constructor() {
    // Configure AWS SDK
    AWS.config.update({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'us-east-1'
    });

    this.s3 = new AWS.S3();
    this.bucketName = process.env.S3_BUCKET_NAME;

    if (!this.bucketName) {
      console.warn('⚠️ S3_BUCKET_NAME not configured. File uploads will be stored locally.');
    }
  }

  /**
   * Upload file to S3 bucket
   * @param {Buffer} fileBuffer - File buffer
   * @param {string} fileName - Original file name
   * @param {string} mimeType - File MIME type
   * @param {string} folder - S3 folder (bills, pdfs, etc.)
   * @returns {Promise<string>} - S3 file URL
   */
  async uploadFile(fileBuffer, fileName, mimeType, folder = 'bills') {
    if (!this.bucketName) {
      // Fallback: save locally for development
      return this.saveFileLocally(fileBuffer, fileName, folder);
    }

    try {
      // Generate unique file name
      const fileExtension = fileName.split('.').pop();
      const uniqueFileName = `${folder}/${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${fileExtension}`;

      const uploadParams = {
        Bucket: this.bucketName,
        Key: uniqueFileName,
        Body: fileBuffer,
        ContentType: mimeType,
        ACL: 'public-read' // Make files publicly accessible
      };

      const result = await this.s3.upload(uploadParams).promise();
      console.log(`✅ File uploaded to S3: ${result.Location}`);
      
      return result.Location;
    } catch (error) {
      console.error('❌ S3 upload error:', error);
      throw new Error(`File upload failed: ${error.message}`);
    }
  }

  /**
   * Delete file from S3
   * @param {string} fileUrl - S3 file URL
   * @returns {Promise<boolean>} - Success status
   */
  async deleteFile(fileUrl) {
    if (!this.bucketName || !fileUrl.includes(this.bucketName)) {
      return this.deleteFileLocally(fileUrl);
    }

    try {
      // Extract key from URL
      const key = fileUrl.split(`${this.bucketName}/`)[1];
      
      const deleteParams = {
        Bucket: this.bucketName,
        Key: key
      };

      await this.s3.deleteObject(deleteParams).promise();
      console.log(`✅ File deleted from S3: ${key}`);
      
      return true;
    } catch (error) {
      console.error('❌ S3 delete error:', error);
      return false;
    }
  }

  /**
   * Fallback: Save file locally for development
   * @param {Buffer} fileBuffer - File buffer
   * @param {string} fileName - Original file name
   * @param {string} folder - Local folder
   * @returns {string} - Local file URL
   */
  saveFileLocally(fileBuffer, fileName, folder) {
    const fs = require('fs');
    const path = require('path');

    try {
      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(__dirname, '../../uploads', folder);
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Generate unique file name
      const fileExtension = fileName.split('.').pop();
      const uniqueFileName = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${fileExtension}`;
      const filePath = path.join(uploadsDir, uniqueFileName);

      // Save file
      fs.writeFileSync(filePath, fileBuffer);

      // Return local URL
      const localUrl = `/uploads/${folder}/${uniqueFileName}`;
      console.log(`✅ File saved locally: ${localUrl}`);
      
      return localUrl;
    } catch (error) {
      console.error('❌ Local file save error:', error);
      throw new Error(`Local file save failed: ${error.message}`);
    }
  }

  /**
   * Delete local file
   * @param {string} fileUrl - Local file URL
   * @returns {boolean} - Success status
   */
  deleteFileLocally(fileUrl) {
    const fs = require('fs');
    const path = require('path');

    try {
      const filePath = path.join(__dirname, '../..', fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`✅ Local file deleted: ${fileUrl}`);
      }
      return true;
    } catch (error) {
      console.error('❌ Local file delete error:', error);
      return false;
    }
  }

  /**
   * Generate presigned URL for secure file access
   * @param {string} key - S3 object key
   * @param {number} expiresIn - URL expiration time in seconds
   * @returns {Promise<string>} - Presigned URL
   */
  async getPresignedUrl(key, expiresIn = 3600) {
    if (!this.bucketName) {
      return key; // Return local path as-is
    }

    try {
      const params = {
        Bucket: this.bucketName,
        Key: key,
        Expires: expiresIn
      };

      const url = await this.s3.getSignedUrlPromise('getObject', params);
      return url;
    } catch (error) {
      console.error('❌ Presigned URL error:', error);
      throw new Error(`Failed to generate presigned URL: ${error.message}`);
    }
  }
}

module.exports = new S3Service();