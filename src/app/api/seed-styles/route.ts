import { NextResponse } from 'next/server';
import { db, styles } from '@/lib/db';
import { styles as styleRefs } from "./styles";


export async function GET() {
    try {
        // Check if styles already seeded
        const existingStyles = await db.query.styles.findMany();

        if (existingStyles.length > 0) {
            return NextResponse.json({
                message: 'Styles already seeded',
                count: existingStyles.length,
                styles: existingStyles
            });
        }

        // Seed styles
        const insertedStyles = await db.insert(styles).values(
            styleRefs.map(style => ({
                ...style,
                isActive: true,
            }))
        ).returning();

        return NextResponse.json({
            success: true,
            message: 'Styles seeded successfully',
            count: insertedStyles.length,
            styles: insertedStyles
        });
    } catch (error) {
        console.error('Seed error:', error);
        return NextResponse.json({ error: 'Seeding failed' }, { status: 500 });
    }
}
