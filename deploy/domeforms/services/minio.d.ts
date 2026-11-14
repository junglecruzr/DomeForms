/**
 * MinIO/S3 Service for file storage
 */
export declare class MinioService {
    private client;
    private bucket;
    constructor();
    getPresignedUploadUrl(key: string, contentType: string, expiresIn?: number): Promise<string>;
    getPresignedDownloadUrl(key: string, expiresIn?: number): Promise<string>;
    objectExists(key: string): Promise<boolean>;
    deleteObject(key: string): Promise<void>;
    uploadBuffer(key: string, buffer: Buffer, contentType: string): Promise<void>;
    getObject(key: string): Promise<{
        body: ReadableStream;
        contentType: string;
    } | null>;
}
export declare const minio: MinioService;
//# sourceMappingURL=minio.d.ts.map