import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';

interface Venue {
  name: string;
  slug: string;
  description?: string;
  city?: string;
  country?: string;
  logo?: string;
  image?: string;
  telephone?: string;
  email?: string;
  type: string;
  score: number;
}

interface Props {
  venues: {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    city?: string;
    country?: string;
    address?: string;
    telephone?: string;
    email?: string;
    logo?: string;
    images?: { url: string }[];
    avatar?: string;
    geo?: { lat: number; lng: number };
  }[];
  /** "venue" | "artist" — locks search to one type */
  searchType?: string;
}

const API_URL = import.meta.env.PUBLIC_RAG_API || 'https://mygloven-api.aeoninfinitive.com';

export default function SearchBox({ venues: venuesData, searchType }: Props) {
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('');
  const [results, setResults] = useState<Venue[]>([]);
  const [showCount, setShowCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [useSemanticSearch, setUseSemanticSearch] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Read initial query from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) setQuery(q);
  }, []);

  // All cities from server data (for filter dropdown)
  const allCities = useMemo(() =>
    [...new Set(venuesData.map(v => v.city).filter(c => c && c.length > 2 && !c.startsWith('-') && !/^\d+$/.test(c)))].sort() as string[],
    [venuesData]
  );

  // Shuffle for default display
  const shuffled = useMemo(() =>
    [...venuesData].sort(() => Math.random() - 0.5).map(v => ({
      name: v.name,
      slug: v.slug,
      description: v.description,
      city: v.city,
      country: v.country,
      logo: v.logo,
      image: v.images?.[0]?.url || v.avatar,
      telephone: v.telephone,
      email: v.email,
      type: searchType || 'venue',
      score: 0,
    })),
    [venuesData]
  );

  // Semantic search via API
  const semanticSearch = useCallback(async (q: string, c: string) => {
    if (q.length < 2) {
      // No query — show shuffled, filtered by city
      let filtered = shuffled;
      if (c) filtered = filtered.filter(v => v.city === c);
      setResults(filtered);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, city: c, limit: 50, type: searchType || '' }),
      });
      const data = await res.json();
      setResults(data.results || []);
    } catch (err) {
      console.error('Semantic search failed, falling back to local:', err);
      // Fallback: simple local filter
      let filtered = shuffled.filter(v =>
        v.name?.toLowerCase().includes(q.toLowerCase()) ||
        v.description?.toLowerCase().includes(q.toLowerCase()) ||
        v.city?.toLowerCase().includes(q.toLowerCase())
      );
      if (c) filtered = filtered.filter(v => v.city === c);
      setResults(filtered);
    } finally {
      setLoading(false);
    }
  }, [shuffled]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      semanticSearch(query, city);
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, city, semanticSearch]);

  // Init with shuffled data
  useEffect(() => {
    if (!query && !city) setResults(shuffled);
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <div className="relative mb-6">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#e4665c]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        <input
          type="text"
          className="w-full bg-white border border-gray-200 rounded-xl py-4 pl-12 pr-6 text-lg focus:outline-none focus:ring-2 focus:ring-[#e4665c] text-[#1a1a2a] placeholder:text-gray-400 shadow-sm"
          placeholder={
            searchType === 'artist' ? "Busca artistas: 'jazz vocal', 'DJ electrónica', 'soul London'..." :
            searchType === 'venue' ? "Busca espacios: 'sala acústica íntima', 'terraza Barcelona'..." :
            "Busca por significado: 'sala acústica íntima', 'techno Berlin'..."
          }
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-[#e4665c] border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        {searchType !== 'artist' && (
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#1a1a2a] focus:outline-none focus:ring-2 focus:ring-[#e4665c]"
          >
            <option value="">Todas las ciudades</option>
            {allCities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        )}
        {(query || city) && (
          <button className="text-sm text-[#e4665c] hover:text-[#d86259] px-3" onClick={() => { setQuery(''); setCity(''); }}>
            ✕ Limpiar filtros
          </button>
        )}
        <span className="ml-auto text-sm text-gray-400 self-center">
          {loading ? 'Buscando...' : `${results.length} resultados`}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {results.slice(0, showCount).map((venue) => {
          const img = venue.image || 'https://images.unsplash.com/photo-1514525253361-bee8a48790c3?w=600';
          const href = venue.type === 'artist' ? `/artist/${venue.slug}` : `/venue/${venue.slug}`;
          return (
            <a key={`${venue.type}-${venue.slug}`} href={href}
              className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg transition-all group block">
              <div className="h-44 overflow-hidden relative">
                <img src={img} alt={venue.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                {venue.city && (
                  <span className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-full text-xs text-[#1a1a2a] font-medium shadow-sm">
                    📍 {venue.city}
                  </span>
                )}
                {venue.type === 'artist' && (
                  <span className="absolute top-3 left-3 bg-[#e4665c]/90 backdrop-blur px-2 py-1 rounded-full text-xs text-white font-medium shadow-sm">
                    🎵 Artista
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
