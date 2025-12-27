import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
    try {
        const styles = await db.query.styles.findMany({
            where: (styles, { eq }) => eq(styles.isActive, true),
            orderBy: (styles, { asc }) => [asc(styles.order)],
        });

        return NextResponse.json({ styles });
    } catch (error) {
        console.error('Error fetching styles:', error);
        return NextResponse.json({ error: 'Failed to fetch styles' }, { status: 500 });
    }
}
