import React, { useState, useEffect, useMemo } from 'react';
import Fuse from 'fuse.js';
import { Search, MapPin, Users } from 'lucide-react';
import venuesData from '../data/venues.json';

export default function SearchBox() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(venuesData.slice(0, 12));

  const fuse = useMemo(() => new Fuse(venuesData, {
    keys: ['name', 'description', 'address.addressLocality'],
    threshold: 0.4,
  }), []);

  useEffect(() => {
    if (query.length > 2) {
      setResults(fuse.search(query).map(r => r.item).slice(0, 12));
    } else if (query.length === 0) {
      setResults(venuesData.slice(0, 12));
    }
  }, [query]);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      <div className="relative mb-12">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="w-6 h-6 text-[#00D4FF]" />
        </div>
        <input
          type="text"
          className="w-full bg-[#12121E] border border-[#1A1A2E] rounded-2xl py-6 pl-14 pr-6 text-xl focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] transition-all placeholder:text-gray-500 text-white"
          placeholder="Busca un club, una sala de rock, un beach club..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((venue: any) => (
          <div key={venue.slug} className="bg-[#12121E] border border-[#1A1A2E] rounded-2xl overflow-hidden hover:border-[#8B5CF6]/50 transition-all group shadow-lg">
            <div className="h-48 overflow-hidden relative">
              <img 
                src={venue.image?.[0] || 'https://images.unsplash.com/photo-1514525253361-bee8a48790c3?w=800'} 
                alt={venue.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2 text-white">{venue.name}</h3>
              <p className="text-gray-400 text-sm line-clamp-2 mb-4 leading-relaxed">{venue.description}</p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-[#EBDECC]/60 italic">
                <span className="flex items-center gap-1"><MapPin size={14} className="text-[#8B5CF6]" /> {venue.address?.addressLocality}</span>
                <span className="flex items-center gap-1"><Users size={14} className="text-[#8B5CF6]" /> {venue.capacity || 'Consulta'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
