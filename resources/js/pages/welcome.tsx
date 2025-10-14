import { Head, Link, usePage } from '@inertiajs/react';
// import { login } from '@/routes';
import { type SharedData } from '@/types';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;
    const isAuthed = Boolean(auth?.user);

    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700"
                    rel="stylesheet"
                />
            </Head>

            <div className="min-h-screen bg-[#F7F8FB] text-[#1b1b18] antialiased transition-colors dark:bg-[#0b0b0b] dark:text-[#EDEDEC] flex flex-col">
                {/* Top bar */}
                <header className="mx-auto w-full max-w-6xl px-6 py-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#68a1ff] text-white shadow-sm dark:bg-[#68a1ff]">
                                <span className="text-sm font-bold">OE</span>
                            </div>
                            <span className="text-base font-semibold tracking-tight">EMS</span>
                        </div>

                        <nav className="flex items-center gap-3">
                            {isAuthed ? (
                                <Link
                                    href="/dashboard"
                                    className="inline-flex items-center rounded-full bg-[#68a1ff] px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#5b90e6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a9c7ff] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#0b0b0b]"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <Link
                                    href="/login"
                                    className="inline-flex items-center rounded-full bg-[#68a1ff] px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#5b90e6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a9c7ff] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#0b0b0b]"
                                >
                                    Log in
                                </Link>
                            )}
                        </nav>
                    </div>
                </header>

                {/* Hero section */}
                <main className="mx-auto w-full max-w-6xl px-6 py-12 lg:py-20 flex-1 flex items-center">
                    <div className="grid items-center gap-10 lg:grid-cols-2">
                        {/* Left copy */}
                        <section>
                            <p className="mb-2 text-sm uppercase tracking-wider text-[#7a7a75] dark:text-[#A1A09A]">
                                Welcome to
                            </p>
                            <h1 className="text-5xl font-bold leading-tight tracking-tight lg:text-6xl">
                                Online
                                <br />
                                <span className="text-[#68a1ff]">Exam</span>
                            </h1>
                            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-[#6f6f6b] dark:text-[#B9B8B3]">
                                Manage courses, units, and exams in one place. Create questions, start sessions,
                                and grade submissions with ease. Built with Laravel, Inertia, and React — fully
                                responsive and theme-aware.
                            </p>
                            <div className="mt-8 flex flex-wrap items-center gap-3">
                                {isAuthed ? (
                                    <Link
                                        href="/dashboard"
                                        className="inline-flex items-center rounded-full bg-[#68a1ff] px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#5b90e6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a9c7ff] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#0b0b0b]"
                                    >
                                        Go to dashboard
                                    </Link>
                                ) : (
                                    <Link
                                        href="/login"
                                        className="inline-flex items-center rounded-full bg-[#68a1ff] px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#5b90e6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a9c7ff] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#0b0b0b]"
                                    >
                                        Get started
                                    </Link>
                                )}
                                <span className="text-xs text-[#8a8984] dark:text-[#9E9D97]">
                                    No account? Log in to get started.
                                </span>
                            </div>
                        </section>

                        {/* Right illustration */}
                        <section className="relative mx-auto w-full max-w-[560px]">
                            <div className="relative overflow-hidden rounded-2xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#141414]">
                                {/* Monitor */}
                                <div className="mx-auto h-[260px] w-full max-w-[460px] rounded-md bg-gradient-to-b from-[#e7ecff] to-[#f4f6ff] p-5 dark:from-[#1a1f2e] dark:to-[#111525]">
                                    <div className="grid grid-cols-[1fr_auto] gap-4">
                                        <div>
                                            <div className="mb-3 h-4 w-28 rounded bg-[#c4cbe8] dark:bg-[#2b3350]" />
                                            {/* checklist */}
                                            <ul className="space-y-2">
                                                {Array.from({ length: 6 }).map((_, i) => (
                                                    <li key={i} className="flex items-center gap-3">
                                                        <span className="grid h-5 w-5 place-items-center rounded border border-[#a0a8cc] bg-white text-emerald-600 dark:border-[#3a4368] dark:bg-[#0f1323]">
                                                            {i % 2 === 0 ? (
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    viewBox="0 0 20 20"
                                                                    fill="currentColor"
                                                                    className="h-3.5 w-3.5"
                                                                >
                                                                    <path
                                                                        fillRule="evenodd"
                                                                        d="M16.704 5.29a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.42 0l-3-3a1 1 0 111.42-1.42l2.29 2.29 6.79-6.79a1 1 0 011.42 0z"
                                                                        clipRule="evenodd"
                                                                    />
                                                                </svg>
                                                            ) : (
                                                                <span className="block h-3 w-3 rounded bg-[#68a1ff]" />
                                                            )}
                                                        </span>
                                                        <div className="h-2.5 flex-1 rounded bg-[#cfd5ef] dark:bg-[#2b3350]" />
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        {/* Side panel */}
                                        <div className="hidden h-full w-28 rounded-md bg-[#dbe2ff] dark:bg-[#1b2137] lg:block" />
                                    </div>
                                </div>
                                {/* Base stand */}
                                <div className="mx-auto mt-3 h-2 w-40 rounded bg-black/15 dark:bg-white/15" />
                                <div className="mx-auto mt-2 h-1.5 w-24 rounded bg-black/10 dark:bg-white/10" />

                                {/* Floating clock */}
                                <div className="absolute -right-3 -top-3 hidden rounded-full bg-white p-2 shadow-sm ring-1 ring-black/10 dark:bg-[#141414] dark:ring-white/10 md:block">
                                    <div className="grid h-14 w-14 place-items-center rounded-full bg-[#e1e7ff] text-[#3b4aa1] dark:bg-[#1b2137] dark:text-[#8ea3ff]">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="currentColor"
                                            className="h-7 w-7"
                                        >
                                            <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm.75 5a.75.75 0 00-1.5 0v5.19l4.12 2.38a.75.75 0 10.74-1.3L12.75 11V7z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </main>

                <footer className="pb-10 text-center text-xs text-[#8a8984] dark:text-[#9E9D97]">
                    © {new Date().getFullYear()} Online Exam. All rights reserved.
                </footer>
            </div>
        </>
    );
}