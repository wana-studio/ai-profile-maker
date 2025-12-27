import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

// Initialize S3 client for Cloudflare R2
const s3Client = new S3Client({
    region: 'auto',
    endpoint: process.env.S3_ENDPOINT,
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    },
});

export interface UploadOptions {
    buffer: Buffer;
    filename?: string;
    contentType: string;
    folder?: string;
}

/**
 * Upload a file to S3/R2 storage
 * @param options Upload options including buffer, filename, contentType, and optional folder
 * @returns Public URL of the uploaded file using custom domain
 */
export async function uploadToS3(options: UploadOptions): Promise<string> {
    const { buffer, filename, contentType, folder = 'uploads' } = options;

    // Generate unique filename if not provided
    const uniqueFilename = filename || `${randomUUID()}.${getExtensionFromContentType(contentType)}`;
    const key = folder ? `${folder}/${uniqueFilename}` : uniqueFilename;

    try {
        const command = new PutObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME!,
            Key: key,
            Body: buffer,
            ContentType: contentType,
        });

        await s3Client.send(command);

        // Return public URL using custom domain
        const customDomain = process.env.S3_CUSTOM_DOMAIN;
        if (!customDomain) {
            throw new Error('S3_CUSTOM_DOMAIN environment variable is not set');
        }

        // Ensure custom domain doesn't have trailing slash
        const baseUrl = customDomain.replace(/\/$/, '');

        return `https://${baseUrl}/${process.env.S3_BUCKET_NAME}/${key}`;

    } catch (error) {
        console.error('S3 upload error:', error);
        throw new Error(`Failed to upload file to S3: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Get file extension from content type
 */
function getExtensionFromContentType(contentType: string): string {
    const mimeToExt: Record<string, string> = {
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp',
        'image/gif': 'gif',
    };

    return mimeToExt[contentType] || 'jpg';
}

/**
 * Download an image from a URL and return it as a buffer
 * @param url Image URL to download
 * @returns Buffer containing the image data and content type
 */
export async function downloadImage(url: string): Promise<{ buffer: Buffer; contentType: string }> {
    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to download image: ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const contentType = response.headers.get('content-type') || 'image/jpeg';

        return { buffer, contentType };
    } catch (error) {
        console.error('Image download error:', error);
        throw new Error(`Failed to download image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
