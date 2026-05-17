"use client";
import React, { useState } from 'react';
import { Send } from 'lucide-react';

export default function UserSubmissionForm() {
  const [formData, setFormData] = useState({
    word: '',
    definition: '',
    dialect: 'General Bikol',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (res.ok) {
        setStatus('success');
        setFormData({ word: '', definition: '', dialect: 'General Bikol' });
      } else {
        setStatus('error');
      }
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg mx-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm">
      <h3 className="text-2xl font-black mb-6">Contribute a Word</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-zinc-500 mb-2 uppercase tracking-wide">Bikol Word</label>
          <input
            required
            value={formData.word}
            onChange={(e) => setFormData({ ...formData, word: e.target.value })}
            className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. Oragon"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-zinc-500 mb-2 uppercase tracking-wide">Definition (English or Tagalog)</label>
          <textarea
            required
            value={formData.definition}
            onChange={(e) => setFormData({ ...formData, definition: e.target.value })}
            className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
            placeholder="What does it mean?"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-zinc-500 mb-2 uppercase tracking-wide">Dialect</label>
          <select
            value={formData.dialect}
            onChange={(e) => setFormData({ ...formData, dialect: e.target.value })}
            className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
          >
            <option>General Bikol</option>
            <option>Central Bikol (Naga)</option>
            <option>Central Bikol (Albay)</option>
            <option>Rinconada Bikol</option>
            <option>Masbateño</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full mt-8 py-4 bg-primary text-white font-bold rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex justify-center items-center gap-2"
      >
        {status === 'loading' ? 'Submitting...' : status === 'success' ? 'Submitted!' : (
          <>
            <Send className="h-5 w-5" />
            Send Contribution
          </>
        )}
      </button>
      
      {status === 'error' && <p className="mt-4 text-center text-red-500 font-medium">Failed to submit. Please try again.</p>}
    </form>
  );
}
