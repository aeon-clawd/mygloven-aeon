import React, { useState, useMemo } from 'react';

interface Artist {
  _id: string;
  name: string;
  slug: string;
  avatar?: string;
}

interface Props {
  artists: Artist[];
  count?: number;
}

export default function ArtistGrid({ artists, count = 10 }: Props) {
  // Shuffle on mount (useMemo so it's stable per render)
  const shuffled = useMemo(() => {
    return [...artists].sort(() => Math.random() - 0.5).slice(0, count);
  }, [artists, count]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
      {shuffled.map((artist) => (
        <a key={artist.slug} href={`/artist/${artist.slug}`} className="group cursor-pointer block">
          <div className="aspect-square rounded-full overflow-hidden mb-4 border-3 border-transparent group-hover:border-[#e4665c] transition-all shadow-md">
            <img 
              src={artist.avatar || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400'} 
              alt={artist.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              loading="lazy"
            />
          </div>
          <div className="text-center">
            <h3 className="text-[#1a1a2a] font-bold text-sm group-hover:text-[#e4665c] transition-colors line-clamp-1">{artist.name}</h3>
            <p className="text-gray-400 text-[10px] mt-1 uppercase tracking-widest">Artista</p>
          </div>
        </a>
      ))}
    </div>
  );
}
