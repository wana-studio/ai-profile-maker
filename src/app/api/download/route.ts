import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');
    const filename = searchParams.get('filename') || 'photo.jpg';

    if (!imageUrl) {
        return NextResponse.json({ error: 'Missing URL parameter' }, { status: 400 });
    }

    // Validate that the URL is from our R2 bucket
    if (!imageUrl.startsWith('https://r2.hooshang.app/')) {
        return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    try {
        // Fetch the image from R2
        const response = await fetch(imageUrl);

        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to fetch image' }, { status: 500 });
        }

        const blob = await response.blob();

        // Return the image with download headers
        return new NextResponse(blob, {
            headers: {
                'Content-Type': response.headers.get('Content-Type') || 'image/jpeg',
                'Content-Disposition': `attachment; filename="${filename}"`,
                'Content-Length': blob.size.toString(),
            },
        });
    } catch (error) {
        console.error('Download error:', error);
        return NextResponse.json({ error: 'Download failed' }, { status: 500 });
    }
}
