/**
 * File upload routes
 */
import { prisma } from '@domeforms/database';
import { MinioService } from '../services/minio.js';
import crypto from 'crypto';
const minio = new MinioService();
export async function uploadRoutes(fastify) {
    // Get presigned URL for direct upload
    fastify.post('/presign', async (request, reply) => {
        const { fileName, contentType, maxSize } = request.body;
        // Check authentication
        if (!request.authUser) {
            return reply.status(401).send({ error: 'Unauthorized', message: 'Authentication required' });
        }
        // Validate file type
        const allowedTypes = ['image/', 'application/pdf', 'text/', 'application/msword', 'application/vnd.openxmlformats'];
        if (!allowedTypes.some(t => contentType.startsWith(t))) {
            return reply.status(400).send({ error: 'Invalid file type' });
        }
        // Validate size (default 10MB)
        if (maxSize && maxSize > 10 * 1024 * 1024) {
            return reply.status(400).send({ error: 'File too large' });
        }
        const key = `uploads/${request.authUser.id}/${crypto.randomUUID()}-${fileName}`;
        const uploadUrl = await minio.getPresignedUploadUrl(key, contentType);
        const downloadUrl = await minio.getPresignedDownloadUrl(key);
        return { uploadUrl, downloadUrl, key };
    });
    // Confirm upload (called after client uploads)
    fastify.post('/confirm', async (request, reply) => {
        // Check authentication
        if (!request.authUser) {
            return reply.status(401).send({ error: 'Unauthorized', message: 'Authentication required' });
        }
        const { key, fileName, fileSize, mimeType, submissionId, fieldId, fieldName } = request.body;
        // Verify file exists in MinIO
        const exists = await minio.objectExists(key);
        if (!exists) {
            return reply.status(400).send({ error: 'File not found in storage' });
        }
        const url = await minio.getPresignedDownloadUrl(key);
        // If submissionId provided, link file to submission
        if (submissionId) {
            await prisma.submissionFile.create({
                data: {
                    submissionId,
                    fieldId,
                    fieldName,
                    fileName,
                    fileSize,
                    mimeType,
                    storageKey: key,
                    url,
                },
            });
        }
        return { success: true, url, key };
    });
    // Delete file
    fastify.delete('/:key', async (request, reply) => {
        // Check authentication
        if (!request.authUser) {
            return reply.status(401).send({ error: 'Unauthorized', message: 'Authentication required' });
        }
        const { key } = request.params;
        await minio.deleteObject(key);
        return { success: true };
    });
}
//# sourceMappingURL=upload.js.map