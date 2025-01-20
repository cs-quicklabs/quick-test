import { Injectable, Logger } from "@nestjs/common";
import * as mime from "mime-types";
import { UtilsService } from "../../_helpers/utils.service";
import { IFile } from "../../interfaces/IFile";
import { GeneratorService } from "./generator.service";
import Constants from "../../common/constants/Constants";
import { ConfigService } from "@nestjs/config";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { UploadFile } from "src/interfaces/UploadFile";
import {
  S3Client,
  ListBucketsCommand,
  CreateBucketCommand,
  PutBucketCorsCommand,
  PutObjectCommand,
  HeadObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";

@Injectable()
export class AwsS3Service {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly endpoint: string;
  private readonly logger = new Logger(AwsS3Service.name);

  constructor(
    private readonly configService: ConfigService,
    public generatorService: GeneratorService
  ) {
    const region = this.configService.getOrThrow("aws.bucketRegion");
    const rawEndpoint = this.configService.getOrThrow("aws.digitalOceanEndPoint");
    const endpoint = rawEndpoint.startsWith("http") ? rawEndpoint : `https://${rawEndpoint}`;
    this.s3Client = new S3Client({
      region,
      endpoint,
      credentials: {
        accessKeyId: this.configService.getOrThrow("aws.accessKeyId"),
        secretAccessKey: this.configService.getOrThrow("aws.secretAccessKey"),
      },
    });

    this.bucketName = this.configService.getOrThrow("aws.bucketName");
    this.endpoint = rawEndpoint;
    this.checkBucketExists(this.bucketName);
    const corsRules = [
      {
        AllowedHeaders: [Constants.AWS_S3_BUCKET_ALLOWED_HEADERS],
        AllowedMethods: [Constants.AWS_S3_BUCKET_ALLOWED_METHOD1],
        AllowedOrigins: [Constants.AWS_S3_BUCKET_ALLOWED_ORIGINS],
        ExposeHeaders: [],
        MaxAgeSeconds: Constants.AWS_S3_BUCKET_MAX_AGE_SECONDS,
      },
    ];
    const corsParams = { Bucket: this.bucketName, CORSConfiguration: { CORSRules: corsRules } };
    this.s3Client.send(new PutBucketCorsCommand(corsParams)).catch((error) => this.logger.error(error));
  }

  async uploadImage(file: IFile): Promise<any> {
    const fileName = this.generatorService.fileName(
      <string>mime.extension(file.mimetype)
    );
    const key = `images/${fileName}`;
    const uploadParams: UploadFile = {
      Bucket: this.bucketName,
      Key: key,
      Body: file.buffer,
      ACL: "public-read",
      ContentType: file.mimetype,
    };
    await this.s3Client.send(new PutObjectCommand(uploadParams));
    const location = UtilsService.getFileLocation(this.bucketName, this.endpoint, key)
    return { Location: location };
  }

  async uploadPdf(file): Promise<string> {
    const fileName = file.originalname;
    const key = `pdfs/${fileName}`;
    const uploadParams: UploadFile = {
      Bucket: this.bucketName,
      Key: key,
      Body: file.buffer,
      ACL: "public-read",
    };
    await this.s3Client.send(new PutObjectCommand(uploadParams));
    return key;
  }

  private async checkBucketExists(bucketName: string): Promise<void> {
    try {
      const data = await this.s3Client.send(new ListBucketsCommand({}));
      const bucketExists = data.Buckets?.some((bucket) => bucket.Name === bucketName);
      if (!bucketExists) {
        await this.s3Client.send(new CreateBucketCommand({ Bucket: bucketName }), UtilsService.handleError);
      }
    } catch (error) {
      Logger.error(error);
    }
  }

  async generateSignedUrl(key: string, expires: number): Promise<string> {
    try {
      await this.s3Client.send(
        new HeadObjectCommand({ Bucket: this.bucketName, Key: key })
      );
      const command = new GetObjectCommand({ Bucket: this.bucketName, Key: key });
      const signedUrl: string = await getSignedUrl(this.s3Client, command, { expiresIn: expires });
      return signedUrl;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      await this.s3Client.send(
        new HeadObjectCommand({ Bucket: this.bucketName, Key: key })
      );
      await this.s3Client.send(
        new DeleteObjectCommand({ Bucket: this.bucketName, Key: key })
      );
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}