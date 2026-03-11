import React, { useState, useEffect, useMemo } from 'react';
import Fuse from 'fuse.js';
import venuesData from '../data/venues.json';

const allCities = [...new Set(venuesData.map((v: any) => v.city).filter(Boolean))].sort();
const allCountries = [...new Set(venuesData.map((v: any) => v.country).filter(Boolean))].sort();

export default function SearchBox() {
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [results, setResults] = useState(venuesData.slice(0, 18));
  const [showCount, setShowCount] = useState(18);

  const fuse = useMemo(() => new Fuse(venuesData, {
    keys: [
      { name: 'name', weight: 2 },
      { name: 'description', weight: 1 },
      { name: 'city', weight: 1.5 },
      { name: 'address', weight: 0.5 }
    ],
    threshold: 0.4,
  }), []);

  useEffect(() => {
    let filtered = venuesData as any[];
    
    if (query.length > 1) {
      filtered = fuse.search(query).map(r => r.item);
    }
    
    if (city) {
      filtered = filtered.filter((v: any) => v.city === city);
    }
    if (country) {
      filtered = filtered.filter((v: any) => v.country === country);
    }
    
    setResults(filtered);
    setShowCount(18);
  }, [query, city, country]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      {/* Search bar */}
      <div className="relative mb-6">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        <input
          type="text"
          className="w-full bg-[#12121E] border border-[#1A1A2E] rounded-xl py-4 pl-12 pr-6 text-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder:text-gray-500"
          placeholder="Busca por nombre, tipo de espacio, descripción..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-8">
        <select
          className="bg-[#12121E] border border-[#1A1A2E] rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
          value={country}
          onChange={(e) => { setCountry(e.target.value); setCity(''); }}
        >
          <option value="">Todos los países</option>
          {allCountries.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          className="bg-[#12121E] border border-[#1A1A2E] rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        >
          <option value="">Todas las ciudades</option>
          {allCities
            .filter(c => !country || venuesData.some((v: any) => v.city === c && v.country === country))
            .map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        {(query || city || country) && (
          <button
            className="text-sm text-cyan-400 hover:text-cyan-300 px-3"
            onClick={() => { setQuery(''); setCity(''); setCountry(''); }}
          >
            ✕ Limpiar filtros
          </button>
        )}
        <span className="ml-auto text-sm text-gray-500 self-center">{results.length} venues encontrados</span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {results.slice(0, showCount).map((venue: any) => (
          <a
            key={venue.slug}
            href={`/venue/${venue.slug}`}
            className="bg-[#12121E] border border-[#1A1A2E] rounded-xl overflow-hidden hover:border-purple-500/40 transition-all group block"
          >
            <div className="h-44 overflow-hidden relative">
              <img 
                src={venue.image?.[0] || 'https://images.unsplash.com/photo-1514525253361-bee8a48790c3?w=600'} 
                alt={venue.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              {venue.city && (
                <span className="absolute top-3 right-3 bg-black/70 backdrop-blur px-2 py-1 rounded-full text-xs text-white">
                  📍 {venue.city}
                </span>
              )}
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between mb-2">
                {venue.logo?.[0] && (
                  <img src={venue.logo[0]} alt="" className="w-8 h-8 rounded-full object-cover mr-3 flex-shrink-0 mt-1" />
                )}
                <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors flex-1">{venue.name}</h3>
              </div>
              <p className="text-gray-400 text-sm line-clamp-2 mb-3">{venue.description}</p>
              <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                {venue.country && <span className="bg-[#1A1A2E] px-2 py-1 rounded">{venue.country}</span>}
                {venue.telephone && <span className="bg-[#1A1A2E] px-2 py-1 rounded">📞 Contacto</span>}
                {venue.email && <span className="bg-[#1A1A2E] px-2 py-1 rounded">✉️ Email</span>}
              </div>
            </div>
          </a>
        ))}
      </div>

      {showCount < results.length && (
        <div className="text-center mt-10">
          <button
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-full font-semibold transition-all"
            onClick={() => setShowCount(s => s + 18)}
          >
            Ver más venues ({results.length - showCount} restantes)
          </button>
        </div>
      )}
    </div>
  );
}
