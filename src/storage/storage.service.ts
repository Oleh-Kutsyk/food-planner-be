import { ConflictException, Injectable } from '@nestjs/common';
import { GetObjectCommand, PutObjectCommand, S3 } from '@aws-sdk/client-s3';
import { MyLoggerService } from '../logger/logger.service';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class StorageService {
  private readonly bucketName = 'food.planner';
  private readonly s3Client = new S3({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    },
  });

  constructor(private readonly loggerService: MyLoggerService) {}

  public async uploadFile(
    key: string,
    file: Buffer,
  ): Promise<string | undefined> {
    const putCommand = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: file,
    });

    try {
      await this.s3Client.send(putCommand);
      return key;
    } catch (error) {
      this.loggerService.error('Error uploading file', error);
    }
  }

  public async getFile(key?: string | null): Promise<string | null> {
    if (!key) return null;

    const getCommand = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    try {
      return await getSignedUrl(this.s3Client, getCommand, {
        expiresIn: 3600, // 1hour,
      });
    } catch (error) {
      this.loggerService.error('Error getting file', error);
      return null;
    }
  }
}
