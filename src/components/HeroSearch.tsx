import React, { useState, useEffect } from 'react';

const examples = [
  "Afterwork para 80 personas en Barcelona",
  "Rodaje con estética industrial",
  "Evento corporativo con catering y música",
  "Espacio íntimo para presentación de producto",
  "Concierto acústico al aire libre en Madrid",
];

export default function HeroSearch() {
  const [query, setQuery] = useState('');
  const [placeholderIdx, setPlaceholderIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIdx((prev) => (prev + 1) % examples.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      window.location.href = `/espacios?q=${encodeURIComponent(query.trim())}`;
    } else {
      window.location.href = '/espacios';
    }
  };

  return (
    <div className="w-full">
      {/* Search input */}
      <form onSubmit={handleSubmit} className="relative w-full">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#e4665c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl py-4 pl-12 pr-6 text-lg text-white placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#e4665c] focus:border-transparent"
          placeholder={query ? '' : `p.ej. ${examples[placeholderIdx]}`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <p className="text-gray-400 text-xs mt-2">¿Qué quieres organizar?</p>
      </form>
    </div>
  );
}
