import React from 'react';
import artistsData from '../data/artists.json';

export default function ArtistGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
      {artistsData.map((artist: any) => (
        <div key={artist.slug} className="group cursor-pointer">
          <div className="aspect-square rounded-full overflow-hidden mb-4 border-2 border-transparent group-hover:border-[#00D4FF] transition-all relative">
            <img 
              src={artist.image?.[0] || artist.photo?.[0] || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400'} 
              alt={artist.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          </div>
          <div className="text-center">
            <h3 className="text-white font-bold group-hover:text-[#00D4FF] transition-colors line-clamp-1">{artist.name}</h3>
            <p className="text-gray-500 text-xs mt-1 uppercase tracking-widest italic">Artista</p>
          </div>
        </div>
      ))}
    </div>
  );
}
