'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function NewWeddingPage() {
  const supabase = createClientComponentClient();
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  const slugify = (s: string) => s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 80) + '-' + Date.now().toString(36).slice(-5);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const slug = slugify(name || 'wedding');

    try {
      const res = await fetch('/api/weddings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, date, slug }),
      });
      const json = await res.json();
      setLoading(false);
      if (!res.ok) {
        setMessage(json?.error || 'Failed to create wedding');
      } else {
        router.push('/weddings');
      }
    } catch (err: any) {
      setLoading(false);
      setMessage(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 rounded border mt-12">
      <h2 className="text-2xl font-semibold mb-4">Create wedding</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input className="p-2 border rounded" placeholder="Wedding name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="p-2 border rounded" placeholder="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <button className="px-4 py-2 rounded bg-green-600 text-white" disabled={loading}>{loading ? 'Creating...' : 'Create'}</button>
        {message && <div className="text-sm text-zinc-700">{message}</div>}
      </form>
    </div>
  );
}
