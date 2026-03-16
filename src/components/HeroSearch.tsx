import React, { useState } from 'react';

export default function HeroSearch() {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      window.location.href = `/espacios?q=${encodeURIComponent(query.trim())}`;
    } else {
      window.location.href = '/espacios';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#e4665c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl py-4 pl-12 pr-6 text-lg text-white placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#e4665c] focus:border-transparent"
        placeholder="Busca espacios, artistas, proveedores..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </form>
  );
}
