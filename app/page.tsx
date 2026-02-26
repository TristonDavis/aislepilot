import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            AislePilot — Planner-first MVP
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Quickstart flows: <Link className="font-medium text-blue-600" href="/signup">Sign up</Link> → <Link className="font-medium text-blue-600" href="/dashboard">Dashboard</Link> → create weddings and inquiry forms.
          </p>
        </div>

        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row mt-8">
          <Link href="/login" className="px-4 py-2 rounded bg-blue-600 text-white">Log in</Link>
          <Link href="/signup" className="px-4 py-2 rounded bg-green-600 text-white">Sign up</Link>
          <Link href="/dashboard" className="px-4 py-2 rounded border">Dashboard</Link>
        </div>

      </main>
    </div>
  );
}
