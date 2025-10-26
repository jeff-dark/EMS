import { Head, Link, usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;
    const isAuthed = Boolean(auth?.user);
    const user = (auth?.user ?? null) as any;
    const rolesArray: string[] = Array.isArray(user?.roles) ? (user.roles as string[]) : [];
    const primaryRole: string | null = (typeof user?.role === 'string' ? user.role : null) ?? rolesArray[0] ?? null;
    const isTeacher = primaryRole === 'teacher' || rolesArray.includes('teacher');
    const isStudent = primaryRole === 'student' || rolesArray.includes('student');
    const displayRole = isTeacher ? 'Teacher' : isStudent ? 'Student' : primaryRole ? capitalize(primaryRole) : null;

    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700" rel="stylesheet" />
            </Head>

            <div className="min-h-screen bg-[#F7F8FB] text-[#1b1b18] antialiased transition-colors dark:bg-[#0b0b0b] dark:text-[#EDEDEC] flex flex-col scroll-smooth">
                {/* Skip to content for accessibility */}
                <a
                    href="#content"
                    className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-[#1b1b18] focus:px-3 focus:py-2 focus:text-white focus:shadow dark:focus:bg-[#EDEDEC] dark:focus:text-[#0b0b0b]"
                >
                    Skip to content
                </a>
                {/* Top bar with logo, nav, language toggle, and CTAs */}
                <header className="sticky top-0 z-50 w-full border-b border-black/10 bg-white/80 px-6 py-4 backdrop-blur dark:border-white/10 dark:bg-[#0b0b0b]/80">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#68a1ff] text-white shadow-sm dark:bg-[#68a1ff]">
                                <span className="text-sm font-bold">EMS</span>
                            </div>
                            <span className="text-base font-semibold tracking-tight">Exam Management System</span>
                        </div>

                        <nav className="flex items-center gap-5 text-sm">
                            <a href="#home" className="opacity-90 hover:opacity-100">Home</a>
                            <a href="#about" className="opacity-90 hover:opacity-100">About Us</a>
                            <a href="#faq" className="opacity-90 hover:opacity-100">FAQ</a>
                            <a href="#contact" className="opacity-90 hover:opacity-100">Contact</a>
                        </nav>

                        <div className="flex items-center gap-3">
                            <LanguageToggle />
                            {isAuthed ? (
                                <Link
                                    href="/dashboard"
                                    className="inline-flex items-center rounded-full bg-[#68a1ff] px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#5b90e6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a9c7ff] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#0b0b0b]"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Link
                                        href="/login?as=student"
                                        className="inline-flex items-center rounded-full bg-[#3b4aa1] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#2f3c85] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a9c7ff] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#0b0b0b]"
                                    >
                                        Student Login
                                    </Link>
                                    <Link
                                        href="/login?as=teacher"
                                        className="inline-flex items-center rounded-full bg-[#68a1ff] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#5b90e6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a9c7ff] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#0b0b0b]"
                                    >
                                        Teacher Login
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Hero section with gradient background and centered content */}
                <main id="content" className="relative flex-1">
                    <div className="pointer-events-none absolute inset-0 select-none" aria-hidden>
                        <div className="h-[420px] w-full bg-gradient-to-b from-[#eaf0ff] to-transparent dark:from-[#0f1326]" />
                        <div className="absolute left-1/2 top-24 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-[#cfe0ff] opacity-40 blur-3xl dark:bg-[#1a2348]" />
                    </div>
                    <div className="relative w-full px-6 py-12 lg:py-16">
                        <section id="home" className="text-center mx-auto max-w-4xl scroll-mt-24">
                            <p className="mb-2 text-sm uppercase tracking-wider text-[#7a7a75] dark:text-[#A1A09A]">
                                {isAuthed ? 'Welcome back' : 'Welcome to'}
                            </p>
                            <h1 className="text-5xl font-bold leading-tight tracking-tight lg:text-6xl">
                                {isAuthed ? (
                                    <>
                                        {user?.name ?? 'User'}
                                        {displayRole ? (
                                            <span className="ml-2 align-top text-base font-medium text-[#7a7a75] dark:text-[#A1A09A]">({displayRole})</span>
                                        ) : null}
                                    </>
                                ) : (
                                    <>
                                        Online
                                        <br />
                                        <span className="text-[#68a1ff]">Exams</span>
                                    </>
                                )}
                            </h1>
                            <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-relaxed text-[#6f6f6b] dark:text-[#B9B8B3]">
                                The smarter way to create, take, and manage exams. Manage courses, units, and sessions
                                in one place — secure, fast, and accessible.
                            </p>
                            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                                {isAuthed ? (
                                    <Link
                                        href="/dashboard"
                                        className="inline-flex items-center rounded-full bg-[#68a1ff] px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#5b90e6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a9c7ff] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#0b0b0b]"
                                    >
                                        Go to dashboard
                                    </Link>
                                ) : (
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Link
                                            href="/login?as=student"
                                            className="inline-flex items-center rounded-full bg-[#3b4aa1] px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#2f3c85] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a9c7ff] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#0b0b0b]"
                                        >
                                            Student Login
                                        </Link>
                                        <Link
                                            href="/login?as=teacher"
                                            className="inline-flex items-center rounded-full bg-[#68a1ff] px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#5b90e6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a9c7ff] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#0b0b0b]"
                                        >
                                            Teacher Login
                                        </Link>
                                    </div>
                                )}
                                {!isAuthed && (
                                    <span className="text-xs text-[#8a8984] dark:text-[#9E9D97]">Choose your role to continue.</span>
                                )}
                            </div>
                        </section>

                        {/* Centered mockup card under hero */}
                        
                    </div>

                    {/* Role highlights */}
                    {/* Feature/role grid resembling modern landing card layout */}
                    <section id="about" className="mt-20 w-full px-6 scroll-mt-24">
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            <div className="rounded-xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#141414]">
                            <div className="mb-3 flex items-center gap-2">
                                <span className="grid h-8 w-8 place-items-center rounded-md bg-[#e6efff] text-[#3b4aa1] dark:bg-[#1b2137] dark:text-[#8ea3ff]">
                                    {/* teacher icon */}
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                                        <path d="M12 12a5 5 0 100-10 5 5 0 000 10zM2.25 20.25A7.75 7.75 0 0110 12.5h4a7.75 7.75 0 017.75 7.75.75.75 0 01-.75.75H3a.75.75 0 01-.75-.75z" />
                                    </svg>
                                </span>
                                <h2 className="text-lg font-semibold">For Teachers</h2>
                            </div>
                            <h3 className="text-sm font-medium text-[#3b3b35] dark:text-[#D9D8D2]">Streamline Your Assessment Process</h3>
                            <p className="mt-2 text-sm leading-relaxed text-[#6f6f6b] dark:text-[#B9B8B3]">
                                Design exams and questions, schedule sessions, proctor activity, and grade submissions.
                                Track performance across courses and units from one dashboard.
                            </p>
                            <div className="mt-4 flex flex-wrap gap-2">
                                <FeaturePill icon="💡">Easy Exam Creation</FeaturePill>
                                <FeaturePill icon="🔄">Automated Grading</FeaturePill>
                                <FeaturePill icon="📊">Advanced Analytics</FeaturePill>
                                <FeaturePill icon="🔒">Secure Environment</FeaturePill>
                            </div>
                            {isAuthed && (isTeacher || !isStudent) && (
                                <div className="mt-6 flex flex-wrap gap-3">
                                    <QuickLink href="/courses">Manage courses</QuickLink>
                                    <QuickLink href="/exams">All exams</QuickLink>
                                    <QuickLink href="/grading/exams/submitted">Grade submissions</QuickLink>
                                    <QuickLink href="/revision">Revision docs</QuickLink>
                                </div>
                            )}
                            {!isAuthed && (
                                <div className="mt-6 flex flex-wrap gap-3">
                                    <Link
                                        href="/exams"
                                        className="inline-flex items-center rounded-full bg-[#f0f4ff] px-4 py-2 text-sm font-medium text-[#3b4aa1] shadow-sm transition hover:bg-[#e4ecff] dark:bg-[#1b2137] dark:text-[#8ea3ff]"
                                    >
                                        Explore Teacher Features
                                    </Link>
                                    <a
                                        href="#contact"
                                        className="inline-flex items-center rounded-full bg-transparent px-4 py-2 text-sm font-medium text-[#3b4aa1] underline-offset-2 hover:underline dark:text-[#8ea3ff]"
                                    >
                                        Request a Demo
                                    </a>
                                </div>
                            )}
                            <blockquote className="mt-6 rounded-lg border border-black/10 bg-[#f8faff] p-4 text-sm italic text-[#3b3b35] dark:border-white/10 dark:bg-[#131725] dark:text-[#D9D8D2]">
                                “This platform cut our grading time in half and gave us real insights into student
                                performance.” — A. Mensah, Senior Lecturer
                            </blockquote>
                            </div>
                            <div className="rounded-xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#141414]">
                            <div className="mb-3 flex items-center gap-2">
                                <span className="grid h-8 w-8 place-items-center rounded-md bg-[#e6efff] text-[#3b4aa1] dark:bg-[#1b2137] dark:text-[#8ea3ff]">
                                    {/* student icon */}
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                                        <path d="M12 3l9 5-9 5-9-5 9-5zm0 7.5l6.75-3.75V14a6.75 6.75 0 11-13.5 0V6.75L12 10.5z" />
                                    </svg>
                                </span>
                                <h2 className="text-lg font-semibold">For Students</h2>
                            </div>
                            <h3 className="text-sm font-medium text-[#3b3b35] dark:text-[#D9D8D2]">Your Exams, Organized and Accessible</h3>
                            <p className="mt-2 text-sm leading-relaxed text-[#6f6f6b] dark:text-[#B9B8B3]">
                                Join exam sessions, answer securely, submit with confidence, and access your results
                                and revision materials anytime.
                            </p>
                            <div className="mt-4 flex flex-wrap gap-2">
                                <FeaturePill icon="🗓️">Clear Schedule</FeaturePill>
                                <FeaturePill icon="📱">Mobile-Friendly</FeaturePill>
                                <FeaturePill icon="⚡">Instant Results</FeaturePill>
                                <FeaturePill icon="📚">Practice Resources</FeaturePill>
                            </div>
                            {isAuthed && (isStudent || !isTeacher) && (
                                <div className="mt-6 flex flex-wrap gap-3">
                                    <QuickLink href="/student/results">Your results</QuickLink>
                                    <QuickLink href="/student/revision">Revision</QuickLink>
                                    <QuickLink href="/dashboard">Go to dashboard</QuickLink>
                                </div>
                            )}
                            {!isAuthed && (
                                <div className="mt-6 flex flex-wrap gap-3">
                                    <a
                                        href="#faq"
                                        className="inline-flex items-center rounded-full bg-[#f0f4ff] px-4 py-2 text-sm font-medium text-[#3b4aa1] shadow-sm transition hover:bg-[#e4ecff] dark:bg-[#1b2137] dark:text-[#8ea3ff]"
                                    >
                                        View System Requirements
                                    </a>
                                    <a
                                        href="#faq"
                                        className="inline-flex items-center rounded-full bg-transparent px-4 py-2 text-sm font-medium text-[#3b4aa1] underline-offset-2 hover:underline dark:text-[#8ea3ff]"
                                    >
                                        Take a Practice Test
                                    </a>
                                </div>
                            )}

                            {/* How it works */}
                            <div className="mt-6 grid grid-cols-3 gap-3 text-center text-xs">
                                <HowStep index={1} label="Log In" />
                                <Arrow />
                                <HowStep index={2} label="Select Exam" />
                                <Arrow className="hidden sm:block" />
                                <HowStep index={3} label="Start Test" />
                            </div>
                            </div>
                            {/* Third card for layout balance */}
                            <div className="rounded-xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#141414]">
                                <div className="mb-3 flex items-center gap-2">
                                    <span className="grid h-8 w-8 place-items-center rounded-md bg-[#e6efff] text-[#3b4aa1] dark:bg-[#1b2137] dark:text-[#8ea3ff]">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                                            <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 6a4 4 0 110 8 4 4 0 010-8z" />
                                        </svg>
                                    </span>
                                    <h2 className="text-lg font-semibold">Secure & Reliable</h2>
                                </div>
                                <h3 className="text-sm font-medium text-[#3b3b35] dark:text-[#D9D8D2]">Built for Trust</h3>
                                <p className="mt-2 text-sm leading-relaxed text-[#6f6f6b] dark:text-[#B9B8B3]">
                                    Robust proctoring options, session integrity checks, and modern infrastructure keep
                                    exams fair and data protected.
                                </p>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <FeaturePill icon="🛡️">Proctoring</FeaturePill>
                                    <FeaturePill icon="🔐">Privacy</FeaturePill>
                                    <FeaturePill icon="⚙️">Performance</FeaturePill>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Call-to-action band */}
                    <section className="mt-16 w-full px-6 scroll-mt-24">
                        <div className="flex flex-col items-center justify-between gap-4 rounded-2xl bg-[#eaf0ff] px-6 py-8 text-center shadow-sm dark:bg-[#12172a] md:flex-row md:text-left">
                            <div>
                                <h3 className="text-lg font-semibold text-[#2a2a26] dark:text-[#EDEDEC]">Ready to get started?</h3>
                                <p className="text-sm text-[#6f6f6b] dark:text-[#B9B8B3]">Log in as a student or teacher and start your next exam journey.</p>
                            </div>
                            <div className="flex flex-wrap items-center justify-center gap-3">
                                <Link href="/login?as=student" className="inline-flex items-center rounded-full bg-[#3b4aa1] px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#2f3c85]">Student Login</Link>
                                <Link href="/login?as=teacher" className="inline-flex items-center rounded-full bg-[#68a1ff] px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#5b90e6]">Teacher Login</Link>
                            </div>
                        </div>
                    </section>

                    {/* FAQ */}
                    <section id="faq" className="mt-20 w-full px-6 scroll-mt-24">
                        <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
                        <div className="mt-6 grid gap-4 md:grid-cols-2">
                            <FaqItem q="What are the system requirements?" a="A modern browser (Chrome, Firefox, Edge, Safari), stable internet, and a camera/microphone if proctoring is enabled." />
                            <FaqItem q="How do I reset my password?" a="Use the 'Forgot password' link on the login page and follow the instructions sent to your email." />
                            <FaqItem q="How do I upload questions in bulk?" a="Teachers can access the Question Bank and use the import/upload option to add multiple questions." />
                            <FaqItem q="Can I schedule an exam for a specific time?" a="Yes. When creating an exam, set the open/close times and duration to control availability." />
                            <FaqItem q="What happens if my internet disconnects?" a="Your answers are saved continuously. Reconnect and resume if the exam window is still open." />
                            <FaqItem q="Is the system compatible with screen readers?" a="Yes. We follow accessibility best practices and support keyboard navigation and ARIA labels." />
                        </div>
                    </section>

                    {/* Support */}
                    <section id="contact" className="mt-16 w-full rounded-xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#141414] scroll-mt-24">
                        <h2 className="text-xl font-semibold">Get Support</h2>
                        <p className="mt-2 text-sm leading-relaxed text-[#6f6f6b] dark:text-[#B9B8B3]">
                            Need help? Reach out to our team — we’re here to assist teachers and students.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-3 text-sm">
                            <a
                                className="inline-flex items-center rounded-full bg-[#f0f4ff] px-4 py-2 text-sm font-medium text-[#3b4aa1] shadow-sm transition hover:bg-[#e4ecff] dark:bg-[#1b2137] dark:text-[#8ea3ff]"
                                href="mailto:support@ems.app"
                            >
                                Support Email
                            </a>
                            <a
                                className="inline-flex items-center rounded-full bg-[#f0f4ff] px-4 py-2 text-sm font-medium text-[#3b4aa1] shadow-sm transition hover:bg-[#e4ecff] dark:bg-[#1b2137] dark:text-[#8ea3ff]"
                                href="#faq"
                            >
                                Technical Help Desk
                            </a>
                            <a
                                className="inline-flex items-center rounded-full bg-transparent px-4 py-2 text-sm font-medium text-[#3b4aa1] underline-offset-2 hover:underline dark:text-[#8ea3ff]"
                                href="#"
                            >
                                Live Chat
                            </a>
                        </div>
                    </section>
                </main>

                <footer className="mt-10 pb-10 text-center text-xs text-[#8a8984] dark:text-[#9E9D97]">
                    <div className="mb-2 flex items-center justify-center gap-4">
                        <a className="hover:underline" href="#">Privacy Policy</a>
                        <span aria-hidden>•</span>
                        <a className="hover:underline" href="#">Terms & Conditions</a>
                    </div>
                    © {new Date().getFullYear()} Online Exam. All rights reserved.
                </footer>
            </div>
        </>
    );
}

function capitalize(s: string) {
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

function QuickLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <Link
            href={href}
            className="inline-flex items-center gap-1 rounded-full bg-[#f0f4ff] px-3 py-1.5 text-xs font-medium text-[#3b4aa1] shadow-sm transition hover:bg-[#e4ecff] dark:bg-[#1b2137] dark:text-[#8ea3ff]"
        >
            {children}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                <path d="M12.293 5.293a1 1 0 011.414 1.414L9.414 11h5.586a1 1 0 110 2H7a1 1 0 01-.707-1.707l6-6z" />
            </svg>
        </Link>
    );
}

function FeaturePill({ icon, children }: { icon: string; children: React.ReactNode }) {
    return (
        <span className="inline-flex items-center gap-1 rounded-full border border-black/10 bg-white px-2.5 py-1 text-[11px] font-medium text-[#3b3b35] shadow-sm dark:border-white/10 dark:bg-[#141414] dark:text-[#D9D8D2]">
            <span aria-hidden>{icon}</span>
            {children}
        </span>
    );
}

function HowStep({ index, label }: { index: number; label: string }) {
    return (
        <div className="flex flex-col items-center justify-center rounded-lg border border-black/10 bg-white px-3 py-2 dark:border-white/10 dark:bg-[#141414]">
            <span className="mb-1 grid h-6 w-6 place-items-center rounded-full bg-[#68a1ff] text-xs font-bold text-white">{index}</span>
            <span className="text-[#3b3b35] dark:text-[#D9D8D2]">{label}</span>
        </div>
    );
}

function Arrow({ className = '' }: { className?: string }) {
    return (
        <div className={`hidden items-center justify-center sm:flex ${className}`} aria-hidden>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 opacity-70">
                <path d="M13.293 5.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 11-1.414-1.414L17.586 13H4a1 1 0 110-2h13.586l-4.293-4.293a1 1 0 010-1.414z" />
            </svg>
        </div>
    );
}

function FaqItem({ q, a }: { q: string; a: string }) {
    return (
        <details className="rounded-lg border border-black/10 bg-white p-4 open:shadow-sm dark:border-white/10 dark:bg-[#141414]">
            <summary className="cursor-pointer list-none text-sm font-medium text-[#1b1b18] outline-none marker:hidden dark:text-[#EDEDEC]">
                {q}
            </summary>
            <p className="mt-2 text-sm leading-relaxed text-[#6f6f6b] dark:text-[#B9B8B3]">{a}</p>
        </details>
    );
}

function LanguageToggle() {
    const changeLang = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        const url = new URL(window.location.href);
        url.searchParams.set('lang', val);
        window.location.href = url.toString();
    };
    return (
        <label className="inline-flex items-center gap-2 text-xs opacity-90">
            <span className="sr-only">Language</span>
            <select
                aria-label="Language"
                defaultValue={new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('lang') ?? 'en'}
                onChange={changeLang}
                className="rounded-md border border-black/10 bg-white px-2 py-1 text-xs dark:border-white/10 dark:bg-[#141414]"
            >
                <option value="en">EN</option>
                <option value="fr">FR</option>
            </select>
        </label>
    );
}

// (No external button utility classes; CTAs use inline Tailwind classes to avoid extra CSS.)