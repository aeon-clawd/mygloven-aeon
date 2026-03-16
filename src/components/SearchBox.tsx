import React, { useState, useEffect, useMemo } from 'react';
import Fuse from 'fuse.js';
import { createClient } from '@sanity/client';

const client = createClient({
  projectId: '81mezrx9',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
});

export default function SearchBox() {
  const [venuesData, setVenuesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [showCount, setShowCount] = useState(10);

  useEffect(() => {
    client.fetch(`*[_type == "venue"] {
      _id, name, "slug": slug.current, description, city, country, address,
      telephone, email, logo, images, geo
    }`).then((data) => {
      // Shuffle for random order on each load
      const shuffled = [...data].sort(() => Math.random() - 0.5);
      setVenuesData(shuffled);
      setResults(shuffled.slice(0, 10));
      setLoading(false);
    });
  }, []);

  const allCities = useMemo(() => [...new Set(venuesData.map(v => v.city).filter(c => c && c.length > 2 && !c.startsWith('-') && !/^\d+$/.test(c)))].sort() as string[], [venuesData]);

  const fuse = useMemo(() => new Fuse(venuesData, {
    keys: [
      { name: 'name', weight: 2 },
      { name: 'description', weight: 1 },
      { name: 'city', weight: 1.5 },
      { name: 'address', weight: 0.5 }
    ],
    threshold: 0.4,
  }), [venuesData]);

  useEffect(() => {
    if (venuesData.length === 0) return;
    let filtered = venuesData;
    if (query.length > 1) {
      filtered = fuse.search(query).map(r => r.item);
    }
    if (city) filtered = filtered.filter(v => v.city === city);
    setResults(filtered);
    setShowCount(10);
  }, [query, city, venuesData]);

  if (loading) return <div className="text-center py-16 text-gray-400">Cargando venues...</div>;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <div className="relative mb-6">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#e4665c]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        <input
          type="text"
          className="w-full bg-white border border-gray-200 rounded-xl py-4 pl-12 pr-6 text-lg focus:outline-none focus:ring-2 focus:ring-[#e4665c] text-[#1a1a2a] placeholder:text-gray-400 shadow-sm"
          placeholder="Busca por nombre, tipo de espacio, descripción..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        {query && (
          <button className="text-sm text-[#e4665c] hover:text-[#d86259] px-3" onClick={() => { setQuery(''); setCity(''); }}>
            ✕ Limpiar filtros
          </button>
        )}
        <span className="ml-auto text-sm text-gray-400 self-center">{results.length} venues</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {results.slice(0, showCount).map((venue: any) => {
          const img = venue.images?.[0]?.url || 'https://images.unsplash.com/photo-1514525253361-bee8a48790c3?w=600';
          return (
            <a key={venue.slug} href={`/venue/${venue.slug}`}
              className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg transition-all group block">
              <div className="h-44 overflow-hidden relative">
                <img src={img} alt={venue.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                {venue.city && (
                  <span className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-full text-xs text-[#1a1a2a] font-medium shadow-sm">
                    📍 {venue.city}
                  </span>
                )}
              </div>
              <div className="p-5">
                <div className="flex items-start gap-3 mb-2">
                  {venue.logo && <img src={venue.logo} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-0.5 border border-gray-100" />}
                  <h3 className="text-sm font-bold text-[#1a1a2a] group-hover:text-[#e4665c] transition-colors leading-tight">{venue.name}</h3>
                </div>
                <p className="text-gray-400 text-xs line-clamp-2 mb-3">{venue.description}</p>
                <div className="flex flex-wrap gap-2 text-[10px] text-gray-400">
                  {venue.country && <span className="bg-gray-50 px-2 py-0.5 rounded">{venue.country}</span>}
                  {venue.telephone && <span className="bg-gray-50 px-2 py-0.5 rounded">📞</span>}
                  {venue.email && <span className="bg-gray-50 px-2 py-0.5 rounded">✉️</span>}
                </div>
              </div>
            </a>
          );
        })}
      </div>

      {showCount < results.length && (
        <div className="text-center mt-10">
          <button className="bg-[#e4665c] hover:bg-[#d86259] text-white px-8 py-3 rounded-full font-semibold transition-all"
            onClick={() => setShowCount(s => s + 18)}>
            Ver más ({results.length - showCount} restantes)
          </button>
        </div>
      )}
    </div>
  );
}
