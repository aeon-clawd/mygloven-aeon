import { createClient } from '@sanity/client';
import { readFileSync } from 'fs';

const client = createClient({
  projectId: '81mezrx9',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

const venues = JSON.parse(readFileSync('src/data/venues.json', 'utf-8'));
const artists = JSON.parse(readFileSync('src/data/artists.json', 'utf-8'));

async function migrateVenues() {
  console.log(`Migrating ${venues.length} venues...`);
  const batchSize = 50;
  for (let i = 0; i < venues.length; i += batchSize) {
    const batch = venues.slice(i, i + batchSize);
    const tx = client.transaction();
    for (const v of batch) {
      const allImages = [...new Set([...(v.image || []), ...(v.photo || []), ...(v.photos || [])])];
      tx.createOrReplace({
        _id: `venue-${v.slug}`,
        _type: 'venue',
        name: v.name,
        slug: { _type: 'slug', current: v.slug },
        description: (v.description || '').replace(/&#039;/g, "'").replace(/&amp;/g, "&").replace(/&nbsp;/g, " "),
        city: v.city || '',
        country: v.country || '',
        address: typeof v.address === 'string' ? v.address.replace(/&#039;/g, "'") : '',
        telephone: v.telephone || '',
        email: v.email || v.contactPoint?.email || '',
        website: v.url || '',
        logo: v.logo?.[0] || '',
        images: allImages.map((url, idx) => ({ _key: `img${idx}`, url })),
        geo: {
          lat: v.geo?.latitude ? parseFloat(v.geo.latitude) : null,
          lng: v.geo?.longitude ? parseFloat(v.geo.longitude) : null,
        },
        sourceUrl: v.source_url || '',
      });
    }
    await tx.commit();
    console.log(`  Batch ${Math.floor(i / batchSize) + 1}: ${batch.length} venues`);
  }
}

async function migrateArtists() {
  console.log(`Migrating ${artists.length} artists...`);
  const tx = client.transaction();
  for (const a of artists) {
    const allImages = [...new Set([...(a.image || []), ...(a.photo || []), ...(a.photos || [])])];
    tx.createOrReplace({
      _id: `artist-${a.slug}`,
      _type: 'artist',
      name: a.name,
      slug: { _type: 'slug', current: a.slug },
      description: (a.description || '').replace(/&#039;/g, "'").replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").replace(/https?:\/\/[^\s]+/g, '').trim(),
      email: a.email || '',
      telephone: a.telephone || '',
      avatar: allImages[0] || '',
      images: allImages.slice(1).map((url, idx) => ({ _key: `img${idx}`, url })),
      links: a.links || {},
      sourceUrl: a.source_url || '',
    });
  }
  await tx.commit();
  console.log(`  Done: ${artists.length} artists`);
}

async function migrateSiteConfig() {
  console.log('Migrating site config...');
  await client.createOrReplace({
    _id: 'siteConfig',
    _type: 'siteConfig',
    heroTitle: 'Espacios y artistas para tu próximo evento.',
    heroSubtitle: 'new AI tools coming soon.. my\'G.',
    heroHashtag: '#myglobalvenue',
    heroBackground: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=1600',
    contactEmail: 'info@mygloven.com',
    features: [
      { _key: 'f1', title: 'Descubre espacios más rápido', description: 'Búsqueda inteligente con IA para encontrar el espacio perfecto para tu evento.' },
      { _key: 'f2', title: 'Conecta con la industria', description: 'Conectamos espacios, artistas y promotores para facilitar la música en vivo.' },
      { _key: 'f3', title: 'Información clara y útil', description: 'Rider técnico, capacidad, contacto directo y ubicación exacta en un click.' },
    ],
    aboutText: 'MyGloven nace con una idea sencilla: facilitar la conexión entre espacios, artistas y promotores para hacer posible más eventos de música en vivo.',
    aboutSecondary: 'Estamos incorporando búsqueda inteligente con IA y herramientas visuales para explorar espacios según la visión de cada evento.',
    primaveraProYear: "Primavera Pro '26",
    primaveraProSubtitle: 'Proyecto seleccionado · Ideas Showroom',
    primaveraProDate: 'Barcelona · 3-5 Junio 2026',
    ctaTitle: '¿Quieres formar parte?',
    ctaSubtitle: 'Espacios, artistas y promotores — únete a la comunidad.',
  });
  console.log('  Done: site config');
}

async function main() {
  await migrateVenues();
  await migrateArtists();
  await migrateSiteConfig();
  console.log('\n✅ Migration complete!');
}

main().catch(console.error);
