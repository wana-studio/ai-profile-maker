# Selfio - AI Photo Generator

A mobile-first iOS-style consumer AI Selfie app for generating high-quality, realistic profile photos optimized for dating apps, work, social media, and anonymous aesthetics.

## ✨ Features

- **Visual-First UX** - iOS-style design with SF Rounded font and vibrant gradients
- **Intent-Based Photo Generation** - Choose from 12+ style categories
- **AI Insights** - Fun, engaging feedback on your generated photos
- **FIFA-Style Stats** - Visual stat bars for Formal, Spicy, Cool, Trustworthy, Mysterious
- **Face Profiles** - Upload once, reuse forever
- **Subscription System** - Free tier with limits, Pro for unlimited access

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Authentication**: Clerk
- **Database**: Drizzle ORM + Neon PostgreSQL
- **AI Generation**: Replicate
- **Payments**: Stripe
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand
- **Animations**: Framer Motion

## 📱 Screens

1. **Home** - Photo feed with category filtering
2. **Create** - 4-step wizard (Face → Style → Vibe → Generate)
3. **Gallery** - Grid of generated photos with filters
4. **Photo Detail** - Full view with AI insights and stats
5. **Profile** - Account settings and face profiles

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Neon PostgreSQL database
- Clerk account
- Stripe account
- Replicate account

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd profile-maker
```


2. Install dependencies:
```bash
npm install
```

3. Copy the environment file and fill in your keys:
```bash
cp env.example .env.local
```

4. Set up the database:
```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 📁 Project Structure

```
src/
├── app/
│   ├── (main)/           # Main app routes with bottom nav
│   │   ├── page.tsx      # Home
│   │   ├── create/       # Create flow
│   │   ├── gallery/      # Gallery + detail views
│   │   └── profile/      # Profile settings
│   ├── api/
│   │   ├── webhooks/     # Clerk & Stripe webhooks
│   │   └── generate/     # AI generation endpoint
│   ├── sign-in/          # Clerk sign-in
│   └── sign-up/          # Clerk sign-up
├── components/
│   ├── navigation/       # Bottom nav
│   ├── home/             # Category chips, create button
│   ├── create/           # Face upload, style grid, vibe controls
│   ├── gallery/          # Photo cards, stat card, AI insights
│   ├── modals/           # Subscription, enhancement modals
│   └── ui/               # shadcn components
├── lib/
│   ├── db/               # Drizzle schema and connection
│   └── stores.ts         # Zustand stores
└── middleware.ts         # Clerk auth middleware
```

## 🎨 Design System

- **Font**: SF Rounded (with system fallbacks)
- **Colors**: Purple, pink, blue gradients
- **Theme**: Dark mode with glassmorphism
- **Radius**: 1rem (16px) for rounded corners
- **Animations**: Subtle micro-interactions with Framer Motion

## 💳 Subscription Tiers

### Free
- 5 generations/month
- Limited styles
- Watermarked downloads

### Pro ($8.99/month)
- Unlimited generations
- All 12+ style packs
- No watermarks
- Saved face profiles
- Priority processing

## 🔧 Environment Variables

See `env.example` for all required environment variables.

## 📝 License

MIT
