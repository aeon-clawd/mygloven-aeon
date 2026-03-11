import React, { useState, useEffect } from 'react';
import { createClient } from '@sanity/client';

const client = createClient({
  projectId: '81mezrx9',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
});

export default function ArtistGrid() {
  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.fetch(`*[_type == "artist"] | order(name asc) {
      _id, name, "slug": slug.current, avatar, images
    }`).then((data) => {
      setArtists(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-center py-8 text-gray-400">Cargando artistas...</div>;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
      {artists.map((artist: any) => (
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
