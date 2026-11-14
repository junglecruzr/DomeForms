/**
 * MinIO/S3 Service for file storage
 */

import { 
  S3Client, 
  PutObjectCommand, 
  GetObjectCommand, 
  DeleteObjectCommand, 
  HeadObjectCommand 
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '../config/env.js';

export class MinioService {
  private client: S3Client;
  private bucket: string;
  
  constructor() {
    this.client = new S3Client({
      endpoint: env.MINIO_USE_SSL 
        ? `https://${env.MINIO_ENDPOINT}:${env.MINIO_PORT}` 
        : `http://${env.MINIO_ENDPOINT}:${env.MINIO_PORT}`,
      region: 'us-east-1',
      credentials: {
        accessKeyId: env.MINIO_ACCESS_KEY,
        secretAccessKey: env.MINIO_SECRET_KEY,
      },
      forcePathStyle: true,
    });
    this.bucket = env.MINIO_BUCKET;
  }
  
  async getPresignedUploadUrl(key: string, contentType: string, expiresIn = 3600): Promise<string> {
    const command = new PutObjectCommand({ Bucket: this.bucket, Key: key, ContentType: contentType });
    return getSignedUrl(this.client, command, { expiresIn });
  }
  
  async getPresignedDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    return getSignedUrl(this.client, command, { expiresIn });
  }
  
  async objectExists(key: string): Promise<boolean> {
    try {
      await this.client.send(new HeadObjectCommand({ Bucket: this.bucket, Key: key }));
      return true;
    } catch {
      return false;
    }
  }
  
  async deleteObject(key: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }
  
  async uploadBuffer(key: string, buffer: Buffer, contentType: string): Promise<void> {
    await this.client.send(new PutObjectCommand({ 
      Bucket: this.bucket, 
      Key: key, 
      Body: buffer, 
      ContentType: contentType 
    }));
  }
  
  async getObject(key: string): Promise<{ body: ReadableStream; contentType: string } | null> {
    try {
      const response = await this.client.send(new GetObjectCommand({ Bucket: this.bucket, Key: key }));
      return { 
        body: response.Body as ReadableStream, 
        contentType: response.ContentType || 'application/octet-stream' 
      };
    } catch {
      return null;
    }
  }
}

export const minio = new MinioService();