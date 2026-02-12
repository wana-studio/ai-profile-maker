"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import "./landing.css";

/* ─── Floating emoji/icon helper ─── */
function FloatingIcon({
    emoji,
    className,
    delay = 0,
    size = "text-4xl",
}: {
    emoji: string;
    className?: string;
    delay?: number;
    size?: string;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.3, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay, duration: 0.6, type: "spring", stiffness: 200 }}
            className={`absolute select-none pointer-events-none ${size} ${className}`}
        >
            <span className="float-element inline-block">{emoji}</span>
        </motion.div>
    );
}

/* ─── Phone Mockup Placeholder  ─── */
function PhoneMockup({
    label,
    className,
    dark,
    image,
}: {
    label: string;
    className?: string;
    dark?: boolean;
    image?: string;
}) {
    return (
        <div
            className={`${dark ? "phone-mockup-dark" : "phone-mockup"} ${className ?? ""}`}
        >
            <div className="aspect-[9/16] relative flex items-center justify-center overflow-hidden min-h-[200px]">
                {image ? (
                    <Image
                        src={image}
                        alt={label}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="text-center p-4">
                        <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-white/10 flex items-center justify-center text-2xl">
                            📱
                        </div>
                        <p className="text-white/50 text-sm font-medium">{label}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ─── Section wrapper with in-view animation ─── */
function AnimatedSection({
    children,
    className,
    id,
}: {
    children: React.ReactNode;
    className?: string;
    id?: string;
}) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.15 });

    return (
        <motion.section
            id={id}
            ref={ref}
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6 }}
            className={className}
        >
            {children}
        </motion.section>
    );
}

/* ─── Fade-up child ─── */
function FadeUp({
    children,
    delay = 0,
    className,
}: {
    children: React.ReactNode;
    delay?: number;
    className?: string;
}) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.3 });
    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay, duration: 0.6, ease: "easeOut" }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

/* ═══════════════════════════════════════════
   MAIN LANDING PAGE
   ═══════════════════════════════════════════ */
export function LandingPage() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handler = () => setScrolled(window.scrollY > 50);
        window.addEventListener("scroll", handler, { passive: true });
        return () => window.removeEventListener("scroll", handler);
    }, []);

    return (
        <div className="min-h-screen overflow-x-hidden bg-[#0a0a0f]">
            {/* ─── NAVBAR ─── */}
            <nav
                className={`landing-nav flex items-center justify-between ${scrolled ? "landing-nav-scrolled" : ""}`}
            >
                <Link href="/" className="flex items-center gap-2">
                    <Image
                        src="/logo.png"
                        alt="selfio logo"
                        width={32}
                        height={32}
                        className="rounded-lg"
                    />
                    <span className="text-white font-bold text-xl tracking-tight">selfio</span>
                </Link>
                <div className="flex items-center gap-3">
                    <Link
                        href="/app"
                        className="text-white/70 hover:text-white text-sm font-medium transition-colors"
                    >
                        Log in
                    </Link>
                    <Link href="/app" className="cta-button cta-button-primary !py-2.5 !px-5 !text-sm">
                        Try Free
                    </Link>
                </div>
            </nav>

            {/* ═══════════════════════════════════════
          1. HERO SECTION
          ═══════════════════════════════════════ */}
            <section className="landing-hero min-h-screen flex flex-col items-center justify-center relative px-6 pt-24 pb-16">
                {/* Floating emojis */}
                <FloatingIcon emoji="✨" className="top-[18%] left-[8%]" delay={0.3} size="text-3xl" />
                <FloatingIcon emoji="📸" className="top-[22%] right-[10%]" delay={0.5} size="text-4xl" />
                <FloatingIcon emoji="💅" className="bottom-[25%] left-[12%]" delay={0.7} size="text-3xl" />
                <FloatingIcon emoji="🔥" className="bottom-[20%] right-[8%]" delay={0.4} size="text-5xl" />
                <FloatingIcon emoji="💜" className="top-[35%] right-[5%]" delay={0.9} size="text-2xl" />
                <FloatingIcon emoji="⚡" className="top-[15%] left-[30%]" delay={0.6} size="text-2xl" />

                {/* Decorative blobs */}
                <div className="blob-1 top-[10%] -left-[10%]" />
                <div className="blob-2 bottom-[15%] -right-[8%]" />

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    className="text-center relative z-10 max-w-3xl"
                >
                    <h1 className="landing-heading landing-heading-xl mb-6">
                        your best
                        <br />
                        photos,
                        <br />
                        zero effort
                    </h1>

                    <p className="landing-subheading max-w-md mx-auto mb-10">
                        Upload one selfie. Get thousands of stunning portraits for dating,
                        social, work — whatever you need.
                    </p>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5, duration: 0.5, type: "spring" }}
                    >
                        <Link href="/app" className="cta-button cta-button-primary text-lg">
                            Start Free ✨
                        </Link>
                    </motion.div>
                </motion.div>

                {/* Floating phone mockups around hero */}
                <motion.div
                    initial={{ opacity: 0, y: 60 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    className="mt-12 flex items-end justify-center gap-4 relative z-10 w-full max-w-lg mx-auto"
                >
                    <div className="w-28 sm:w-36 float-element" style={{ "--float-distance": "-10px" } as React.CSSProperties}>
                        <PhoneMockup label="Dating" image="/images/dating.jpg" />
                    </div>
                    <div className="w-36 sm:w-44 float-element-reverse" style={{ "--float-distance": "12px" } as React.CSSProperties}>
                        <PhoneMockup label="Professional" image="/images/work.jpg" />
                    </div>
                    <div className="w-28 sm:w-36 float-element-slow" style={{ "--float-distance": "-8px" } as React.CSSProperties}>
                        <PhoneMockup label="Social" image="/images/social.jpg" />
                    </div>
                </motion.div>

                {/* Scroll indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
                    <div className="scroll-indicator flex flex-col items-center gap-2">
                        <span className="text-white/50 text-xs font-medium tracking-wider uppercase">
                            Scroll for more
                        </span>
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="rgba(255,255,255,0.5)"
                            strokeWidth="2"
                            strokeLinecap="round"
                        >
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════
          2. INSTANT VALUE SECTION
          ═══════════════════════════════════════ */}
            <AnimatedSection className="landing-section-dark py-24 px-6 relative" id="value">
                <div className="blob-3 top-[10%] right-[5%]" />

                <div className="max-w-5xl mx-auto text-center relative z-10">
                    <FadeUp>
                        <h2 className="landing-heading landing-heading-lg mb-4">
                            upload once.
                            <br />
                            <span className="bg-gradient-to-r from-[#ff6b35] to-[#f72585] bg-clip-text text-transparent">
                                endless photos.
                            </span>
                        </h2>
                    </FadeUp>

                    <FadeUp delay={0.15}>
                        <p className="landing-subheading max-w-lg mx-auto mb-14 text-white/60">
                            One selfie is all it takes. We generate thousands of variations
                            you&apos;ll actually want to use.
                        </p>
                    </FadeUp>

                    {/* Photo mosaic */}
                    <FadeUp delay={0.25}>
                        <div className="photo-mosaic max-w-md mx-auto">
                            {[
                                { label: "Casual", image: "/images/social.jpg" },
                                { label: "Dating", image: "/images/dating.jpg" },
                                { label: "Work", image: "/images/work.jpg" },
                                { label: "Travel", image: "/images/travel.jpg" },
                                { label: "Artistic", image: "/images/anonymous.jpg" },
                                { label: "Creative", image: "/images/creative.jpg" },
                            ].map((item, i) => (
                                <motion.div
                                    key={item.label}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.08, duration: 0.4 }}
                                    className="photo-mosaic-item relative overflow-hidden group"
                                >
                                    <Image
                                        src={item.image}
                                        alt={item.label}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-black/20" />
                                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
                                        <span className="text-white text-[10px] font-bold px-2 py-0.5 bg-black/40 backdrop-blur-md rounded-full border border-white/10 uppercase tracking-wider">
                                            {item.label}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </FadeUp>
                </div>
            </AnimatedSection>

            {/* ═══════════════════════════════════════
          3. CONTROL YOUR LOOK
          ═══════════════════════════════════════ */}
            <AnimatedSection
                className="landing-section-gradient-pink py-24 px-6 relative"
                id="controls"
            >
                <FloatingIcon emoji="🎨" className="top-[10%] right-[8%]" delay={0.2} size="text-4xl" />
                <FloatingIcon emoji="💋" className="bottom-[15%] left-[6%]" delay={0.4} size="text-3xl" />

                <div className="max-w-4xl mx-auto relative z-10">
                    <FadeUp>
                        <h2 className="landing-heading landing-heading-lg text-center mb-4">
                            control
                            <br />
                            your look
                        </h2>
                    </FadeUp>

                    <FadeUp delay={0.1}>
                        <p className="landing-subheading text-center max-w-md mx-auto mb-12">
                            Dial in exactly the vibe you want. From subtle to show-stopping.
                        </p>
                    </FadeUp>

                    {/* Style chips */}
                    <FadeUp delay={0.2}>
                        <div className="flex flex-wrap justify-center gap-3 mb-14">
                            {[
                                { label: "🔥 Hotter", desc: "Turn up the heat" },
                                { label: "😎 Serious", desc: "All business" },
                                { label: "🌿 Natural", desc: "Authentic you" },
                                { label: "✨ Enhanced", desc: "Polished & bright" },
                            ].map((style, i) => (
                                <motion.div
                                    key={style.label}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1, duration: 0.4 }}
                                    className="style-chip"
                                >
                                    {style.label}
                                </motion.div>
                            ))}
                        </div>
                    </FadeUp>

                    {/* Before/After comparison */}
                    <FadeUp delay={0.3}>
                        <div className="comparison-grid">
                            <div className="comparison-item relative overflow-hidden">
                                <Image
                                    src="/images/before.jpg"
                                    alt="Original"
                                    fill
                                    className="object-cover"
                                />
                                <div className="comparison-label">Original</div>
                            </div>
                            <div className="comparison-item relative overflow-hidden">
                                <Image
                                    src="/images/creative.jpg"
                                    alt="Enhanced"
                                    fill
                                    className="object-cover"
                                />
                                <div className="comparison-label">Enhanced</div>
                            </div>
                        </div>
                    </FadeUp>
                </div>
            </AnimatedSection>

            {/* ═══════════════════════════════════════
          4. PERSONALIZATION SECTION
          ═══════════════════════════════════════ */}
            <AnimatedSection className="landing-section-dark py-24 px-6 relative" id="personalize">
                <div className="blob-1 bottom-[20%] left-[-5%]" />
                <div className="blob-2 top-[10%] right-[-5%]" />

                <div className="max-w-5xl mx-auto relative z-10">
                    <FadeUp>
                        <h2 className="landing-heading landing-heading-lg text-center mb-4">
                            make it{" "}
                            <span className="bg-gradient-to-r from-[#f7a325] to-[#ff6b35] bg-clip-text text-transparent">
                                yours
                            </span>
                        </h2>
                    </FadeUp>

                    <FadeUp delay={0.1}>
                        <p className="landing-subheading text-center max-w-md mx-auto mb-14 text-white/60">
                            Accessories, hairstyles, categories — mix and match until
                            it&apos;s perfectly you.
                        </p>
                    </FadeUp>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-3xl mx-auto">
                        {[
                            {
                                icon: "👓",
                                title: "Accessories",
                                desc: "Glasses, jewelry & more",
                            },
                            {
                                icon: "💇",
                                title: "Hairstyles",
                                desc: "Switch it up instantly",
                            },
                            {
                                icon: "🎭",
                                title: "Categories",
                                desc: "Dating, work, social & more",
                            },
                        ].map((item, i) => (
                            <FadeUp key={item.title} delay={0.15 + i * 0.1}>
                                <div className="landing-card-dark text-center group cursor-default">
                                    <motion.div
                                        whileHover={{ scale: 1.2, rotate: 10 }}
                                        className="text-5xl mb-4 inline-block"
                                    >
                                        {item.icon}
                                    </motion.div>
                                    <h3 className="text-white font-bold text-lg mb-1">
                                        {item.title}
                                    </h3>
                                    <p className="text-white/50 text-sm">{item.desc}</p>
                                </div>
                            </FadeUp>
                        ))}
                    </div>

                    <FadeUp delay={0.5}>
                        <div className="flex flex-wrap justify-center gap-2.5 mt-12">
                            {[
                                "🕶️ Sunglasses",
                                "💈 Buzz cut",
                                "👔 Business",
                                "🌊 Beach vibes",
                                "🎩 Classy",
                                "🧢 Casual",
                            ].map((tag, i) => (
                                <motion.span
                                    key={tag}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.06, duration: 0.3 }}
                                    className="use-case-tag"
                                >
                                    {tag}
                                </motion.span>
                            ))}
                        </div>
                    </FadeUp>
                </div>
            </AnimatedSection>

            {/* ═══════════════════════════════════════
          5. GALLERY & STORAGE
          ═══════════════════════════════════════ */}
            <AnimatedSection
                className="landing-section-gradient-orange py-24 px-6 relative"
                id="gallery"
            >
                <FloatingIcon emoji="☁️" className="top-[8%] left-[10%]" delay={0.2} size="text-5xl" />
                <FloatingIcon emoji="📁" className="bottom-[12%] right-[10%]" delay={0.4} size="text-3xl" />

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <FadeUp>
                        <h2 className="landing-heading landing-heading-lg mb-4">
                            every photo,
                            <br />
                            always saved
                        </h2>
                    </FadeUp>

                    <FadeUp delay={0.15}>
                        <p className="landing-subheading max-w-md mx-auto mb-14">
                            Nothing gets lost. Every photo lands in your personal gallery.
                            Come back anytime and pick up right where you left off.
                        </p>
                    </FadeUp>

                    <FadeUp delay={0.25}>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-2xl mx-auto">
                            {[
                                { icon: "💾", label: "Auto-saved" },
                                { icon: "🔄", label: "No re-uploads" },
                                { icon: "🫶", label: "Always yours" },
                            ].map((item, i) => (
                                <motion.div
                                    key={item.label}
                                    initial={{ opacity: 0, y: 25 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1, duration: 0.4 }}
                                    className="landing-card text-center"
                                >
                                    <div className="text-4xl mb-3">{item.icon}</div>
                                    <p className="text-white font-bold text-sm">{item.label}</p>
                                </motion.div>
                            ))}
                        </div>
                    </FadeUp>
                </div>
            </AnimatedSection>

            {/* ═══════════════════════════════════════
          6. SOCIAL PROOF
          ═══════════════════════════════════════ */}
            <AnimatedSection className="landing-section-dark py-24 px-6 relative" id="social-proof">
                <div className="max-w-5xl mx-auto relative z-10">
                    <FadeUp>
                        <h2 className="landing-heading landing-heading-lg text-center mb-4">
                            people{" "}
                            <span className="bg-gradient-to-r from-[#f72585] to-[#ff6b35] bg-clip-text text-transparent">
                                love it
                            </span>
                        </h2>
                    </FadeUp>

                    <FadeUp delay={0.1}>
                        <p className="landing-subheading text-center max-w-md mx-auto mb-14 text-white/60">
                            From first dates to first impressions — Selfio has you covered.
                        </p>
                    </FadeUp>

                    {/* Testimonials */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto mb-12">
                        {[
                            {
                                quote:
                                    "Got 3x more matches after updating my dating profile with Selfio photos.",
                                name: "Alex R.",
                                use: "💘 Dating",
                            },
                            {
                                quote:
                                    "My LinkedIn headshot looks like I paid a professional photographer. It took 30 seconds.",
                                name: "Sarah M.",
                                use: "💼 LinkedIn",
                            },
                            {
                                quote:
                                    "Finally have Instagram-worthy selfies without the awkward mirror poses.",
                                name: "Jordan K.",
                                use: "📱 Instagram",
                            },
                        ].map((t, i) => (
                            <FadeUp key={t.name} delay={0.15 + i * 0.1}>
                                <div className="testimonial-card h-full flex flex-col">
                                    <div className="text-sm text-white/40 font-medium mb-3">
                                        {t.use}
                                    </div>
                                    <p className="text-white/80 text-sm leading-relaxed mb-4 flex-1">
                                        &ldquo;{t.quote}&rdquo;
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#f72585] to-[#ff6b35]" />
                                        <span className="text-white/60 text-sm font-medium">
                                            {t.name}
                                        </span>
                                    </div>
                                </div>
                            </FadeUp>
                        ))}
                    </div>

                    {/* Use case tags */}
                    <FadeUp delay={0.4}>
                        <div className="flex flex-wrap justify-center gap-2.5">
                            {[
                                "💘 Dating Apps",
                                "💼 LinkedIn",
                                "📱 Instagram",
                                "🎯 Tinder",
                                "💬 WhatsApp",
                                "🎮 Discord",
                            ].map((tag) => (
                                <span key={tag} className="use-case-tag">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </FadeUp>
                </div>
            </AnimatedSection>

            {/* ═══════════════════════════════════════
          7. HOW IT WORKS
          ═══════════════════════════════════════ */}
            <AnimatedSection
                className="landing-section-gradient-sunset py-24 px-6 relative"
                id="how-it-works"
            >
                <FloatingIcon emoji="🚀" className="top-[10%] right-[12%]" delay={0.3} size="text-4xl" />
                <FloatingIcon emoji="🎯" className="bottom-[15%] left-[8%]" delay={0.5} size="text-3xl" />

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <FadeUp>
                        <h2 className="landing-heading landing-heading-lg mb-4">
                            stupid
                            <br />
                            simple
                        </h2>
                    </FadeUp>

                    <FadeUp delay={0.1}>
                        <p className="landing-subheading max-w-md mx-auto mb-16">
                            Three steps. That&apos;s it. No tutorials, no learning curve.
                        </p>
                    </FadeUp>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
                        {[
                            {
                                step: "1",
                                title: "Upload a selfie",
                                desc: "Any selfie works. Seriously.",
                                icon: "🤳",
                            },
                            {
                                step: "2",
                                title: "Choose your style",
                                desc: "Pick a vibe, adjust the look.",
                                icon: "🎨",
                            },
                            {
                                step: "3",
                                title: "Download & share",
                                desc: "Your photos, your way.",
                                icon: "📤",
                            },
                        ].map((step, i) => (
                            <FadeUp key={step.step} delay={0.2 + i * 0.15}>
                                <div className="text-center">
                                    <div className="step-number mb-2">{step.step}</div>
                                    <motion.div
                                        whileHover={{ scale: 1.2 }}
                                        className="text-4xl mb-3 inline-block"
                                    >
                                        {step.icon}
                                    </motion.div>
                                    <h3 className="text-white font-bold text-xl mb-1">
                                        {step.title}
                                    </h3>
                                    <p className="text-white/70 text-sm">{step.desc}</p>
                                </div>
                            </FadeUp>
                        ))}
                    </div>
                </div>
            </AnimatedSection>

            {/* ═══════════════════════════════════════
          8. FREE TRIAL CTA
          ═══════════════════════════════════════ */}
            <AnimatedSection className="landing-section-dark py-24 px-6 relative" id="try-free">
                <div className="blob-1 top-[30%] left-[10%]" />
                <div className="blob-2 top-[20%] right-[10%]" />

                <div className="max-w-3xl mx-auto text-center relative z-10">
                    <FadeUp>
                        <div className="text-5xl mb-6">🎁</div>
                    </FadeUp>
                    <FadeUp delay={0.1}>
                        <h2 className="landing-heading landing-heading-md mb-4">
                            try it free.
                            <br />
                            <span className="bg-gradient-to-r from-[#f7a325] to-[#ff6b35] bg-clip-text text-transparent">
                                no strings.
                            </span>
                        </h2>
                    </FadeUp>
                    <FadeUp delay={0.2}>
                        <p className="landing-subheading max-w-md mx-auto mb-10 text-white/50">
                            No credit card. No commitments. Just upload a selfie and see the
                            magic for yourself.
                        </p>
                    </FadeUp>
                    <FadeUp delay={0.3}>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/app" className="cta-button cta-button-primary">
                                Get Started Free →
                            </Link>
                            <Link href="#how-it-works" className="cta-button cta-button-outline">
                                See How It Works
                            </Link>
                        </div>
                    </FadeUp>

                    <FadeUp delay={0.4}>
                        <div className="flex flex-wrap justify-center gap-6 mt-10 text-white/30 text-sm">
                            <span>✓ Free forever plan</span>
                            <span>✓ No watermarks</span>
                            <span>✓ Instant results</span>
                        </div>
                    </FadeUp>
                </div>
            </AnimatedSection>

            {/* ═══════════════════════════════════════
          9. FINAL CTA
          ═══════════════════════════════════════ */}
            <section className="landing-section-gradient-final py-28 px-6 relative overflow-hidden">
                <FloatingIcon emoji="🔥" className="top-[15%] left-[8%]" delay={0.2} size="text-5xl" />
                <FloatingIcon emoji="💜" className="top-[20%] right-[12%]" delay={0.4} size="text-4xl" />
                <FloatingIcon emoji="✨" className="bottom-[20%] left-[15%]" delay={0.6} size="text-3xl" />
                <FloatingIcon emoji="📸" className="bottom-[15%] right-[10%]" delay={0.3} size="text-4xl" />
                <FloatingIcon emoji="🤩" className="top-[40%] left-[3%]" delay={0.8} size="text-3xl" />
                <FloatingIcon emoji="💅" className="top-[45%] right-[5%]" delay={0.7} size="text-2xl" />

                <div className="max-w-3xl mx-auto text-center relative z-10">
                    <FadeUp>
                        <h2 className="landing-heading landing-heading-xl mb-6">
                            your glow up
                            <br />
                            starts now
                        </h2>
                    </FadeUp>

                    <FadeUp delay={0.15}>
                        <p className="landing-subheading max-w-md mx-auto mb-10">
                            Join thousands who transformed their online presence with one
                            selfie.
                        </p>
                    </FadeUp>

                    <FadeUp delay={0.3}>
                        <Link href="/app" className="cta-button cta-button-primary text-lg">
                            Start Free Today 🚀
                        </Link>
                    </FadeUp>
                </div>
            </section>

            {/* ─── FOOTER ─── */}
            <footer className="landing-footer py-10 px-6">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <span className="text-white font-bold text-lg">selfio</span>
                        <span className="text-white/30 text-sm ml-3">
                            Your best photos, without effort.
                        </span>
                    </div>
                    <div className="flex items-center gap-6 text-white/40 text-sm">
                        <Link href="#" className="hover:text-white transition-colors">
                            Privacy
                        </Link>
                        <Link href="#" className="hover:text-white transition-colors">
                            Terms
                        </Link>
                        <Link href="#" className="hover:text-white transition-colors">
                            Contact
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
