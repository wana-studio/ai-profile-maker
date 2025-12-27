import { NextResponse } from 'next/server';
import { db, styles } from '@/lib/db';

// Seed data for styles
const seedStyles = [
    { name: 'Dating Glow', description: 'Warm, approachable look', coverImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop', category: 'dating', isPremium: false, prompt: 'professional dating profile photo, warm lighting, approachable smile', negativePrompt: 'ugly, blurry, distorted', order: 1 },
    { name: 'First Date Ready', description: 'Confident vibes', coverImageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=400&fit=crop', category: 'dating', isPremium: true, prompt: 'confident dating profile, evening lighting, romantic atmosphere', negativePrompt: 'ugly, blurry, distorted', order: 2 },
    { name: 'CEO Energy', description: 'Professional power', coverImageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&h=400&fit=crop', category: 'work', isPremium: false, prompt: 'professional headshot, business attire, confident pose, corporate background', negativePrompt: 'casual, ugly, blurry', order: 3 },
    { name: 'Founder Mode', description: 'Startup ready', coverImageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=400&fit=crop', category: 'work', isPremium: true, prompt: 'startup founder portrait, modern office background, approachable leader', negativePrompt: 'ugly, blurry, distorted', order: 4 },
    { name: 'Insta Casual', description: 'Effortlessly cool', coverImageUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&h=400&fit=crop', category: 'social', isPremium: false, prompt: 'casual instagram photo, natural lighting, cool aesthetic, street style', negativePrompt: 'ugly, blurry, distorted', order: 5 },
    { name: 'Story Ready', description: 'Main character energy', coverImageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=400&fit=crop', category: 'social', isPremium: true, prompt: 'instagram story aesthetic, cinematic lighting, main character energy', negativePrompt: 'ugly, blurry, distorted', order: 6 },
    { name: 'Mystery Mode', description: 'Intriguing aesthetic', coverImageUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300&h=400&fit=crop', category: 'anonymous', isPremium: false, prompt: 'mysterious portrait, dramatic lighting, artistic shadows', negativePrompt: 'ugly, blurry, distorted, face clearly visible', order: 7 },
    { name: 'Incognito Chic', description: 'Faceless cool', coverImageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&h=400&fit=crop', category: 'anonymous', isPremium: true, prompt: 'anonymous aesthetic, silhouette, artistic portrait, face hidden', negativePrompt: 'face visible, ugly, blurry', order: 8 },
    { name: 'Artist Vibe', description: 'Creative soul', coverImageUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&h=400&fit=crop', category: 'creative', isPremium: false, prompt: 'creative artist portrait, colorful, expressive, artistic background', negativePrompt: 'boring, ugly, blurry', order: 9 },
    { name: 'Designer Look', description: 'Aesthetic perfection', coverImageUrl: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=300&h=400&fit=crop', category: 'creative', isPremium: true, prompt: 'designer aesthetic, minimalist, clean, modern styling', negativePrompt: 'cluttered, ugly, blurry', order: 10 },
    { name: 'Cafe Wanderer', description: 'Travel aesthetic', coverImageUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&h=400&fit=crop', category: 'travel', isPremium: false, prompt: 'travel photo, cafe setting, wanderlust aesthetic, European vibes', negativePrompt: 'ugly, blurry, distorted', order: 11 },
    { name: 'Golden Hour', description: 'Sunset magic', coverImageUrl: 'https://images.unsplash.com/photo-1517365830460-955ce3ccd263?w=300&h=400&fit=crop', category: 'travel', isPremium: true, prompt: 'golden hour portrait, sunset lighting, warm tones, travel aesthetic', negativePrompt: 'ugly, blurry, distorted', order: 12 },
] as const;

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
            seedStyles.map(style => ({
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
