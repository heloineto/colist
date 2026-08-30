import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@/common/infrastructure/config/config.service';
import { Presigner } from '@/upload/application/ports/presigner.port';

const EXPIRES_IN_SECONDS = 300;

/** Credentials come from the default chain: ECS task role in prod, `AWS_PROFILE` locally. */
@Injectable()
export class S3Presigner implements Presigner {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly region: string;

  constructor(configService: ConfigService) {
    this.region = configService.get('AWS_REGION');
    this.bucket = configService.get('UPLOADS_BUCKET');
    this.client = new S3Client({ region: this.region });
  }

  presignPut(key: string, contentType: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });

    return getSignedUrl(this.client, command, {
      expiresIn: EXPIRES_IN_SECONDS,
    });
  }

  publicUrl(key: string): string {
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }
}
