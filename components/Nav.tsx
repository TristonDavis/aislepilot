import Link from 'next/link';
import { SignOutButton } from './SignOutButton';

export function Nav({ orgName }: { orgName?: string }) {
  return (
    <nav className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
      <Link href="/dashboard" className="flex items-center gap-2 font-semibold tracking-tight">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: 'var(--brand)' }} />
        {orgName ?? 'AislePilot'}
      </Link>

      <div className="flex items-center gap-4 text-sm">
        <Link className="text-neutral-700 hover:text-black" href="/dashboard/leads">Leads</Link>
        <Link className="text-neutral-700 hover:text-black" href="/weddings">Weddings</Link>
        <Link className="text-neutral-700 hover:text-black" href="/dashboard">Dashboard</Link>
        <SignOutButton />
      </div>
    </nav>
  );
}
