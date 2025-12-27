import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-background">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gradient mb-2">Get Started</h1>
                    <p className="text-muted-foreground">Create an account to start generating amazing photos</p>
                </div>
                <SignUp
                    appearance={{
                        elements: {
                            rootBox: 'mx-auto',
                            card: 'bg-card border border-border shadow-xl',
                        }
                    }}
                />
            </div>
        </div>
    );
}
