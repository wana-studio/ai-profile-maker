import { NextRequest, NextResponse } from "next/server";
import { createClerkClient } from "@clerk/nextjs/server";

const clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
});

/**
 * API endpoint that exchanges a native Google ID token for a Clerk sign-in token.
 * 
 * Flow:
 * 1. Client gets Google ID token via native Capacitor Google login
 * 2. Client sends the token to this endpoint
 * 3. This endpoint verifies the token with Google
 * 4. Finds or creates the corresponding Clerk user
 * 5. Creates a sign-in token for the client to use
 */
export async function POST(req: NextRequest) {
    try {
        const { idToken } = await req.json();

        if (!idToken) {
            return NextResponse.json(
                { error: "Missing Google ID token" },
                { status: 400 }
            );
        }

        // Verify the Google ID token
        const googleResponse = await fetch(
            `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`
        );

        if (!googleResponse.ok) {
            return NextResponse.json(
                { error: "Invalid Google ID token" },
                { status: 401 }
            );
        }

        const googleUser = await googleResponse.json();
        const { email, given_name, family_name, picture, sub: googleId } = googleUser;

        if (!email) {
            return NextResponse.json(
                { error: "No email found in Google token" },
                { status: 400 }
            );
        }

        // Try to find existing Clerk user by email
        let userId: string | null = null;

        const existingUsers = await clerkClient.users.getUserList({
            emailAddress: [email],
        });

        if (existingUsers.data.length > 0) {
            userId = existingUsers.data[0].id;
        } else {
            // Create a new Clerk user with the Google profile
            const newUser = await clerkClient.users.createUser({
                emailAddress: [email],
                firstName: given_name || undefined,
                lastName: family_name || undefined,
                externalId: `google_${googleId}`,
                skipPasswordRequirement: true,
            });
            userId = newUser.id;
        }

        // Create a sign-in token for the user
        const signInToken = await clerkClient.signInTokens.createSignInToken({
            userId,
            expiresInSeconds: 60, // Short-lived token
        });

        return NextResponse.json({
            token: signInToken.token,
        });
    } catch (error: unknown) {
        console.error("Google native auth error:", error);
        const message = error instanceof Error ? error.message : "Authentication failed";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
