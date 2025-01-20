import { ObjectCannedACL } from "@aws-sdk/client-s3";
export interface UploadFile {
    Bucket: string,
    Key: string,
    Body: Buffer,
    ACL: ObjectCannedACL,
    ContentType?: string,
}