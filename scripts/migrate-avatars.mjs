import { createClient } from '@sanity/client';
import fetch from 'node-fetch';

const client = createClient({
  projectId: '81mezrx9',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

async function migrate() {
  const artists = await client.fetch('*[_type == "artist" && defined(avatar)]{_id, name, avatar}');
  console.log(`Found ${artists.length} artists with avatar`);

  let ok = 0, skip = 0, fail = 0;
  for (const artist of artists) {
    // Skip already-migrated (avatar is now an object/reference)
    if (typeof artist.avatar !== 'string') {
      console.log(`SKIP (already migrated): ${artist.name}`);
      skip++;
      continue;
    }
    if (!artist.avatar) { skip++; continue; }

    try {
      console.log(`Processing: ${artist.name} — ${artist.avatar}`);
      const res = await fetch(artist.avatar);
      if (!res.ok) { console.log(`  SKIP: HTTP ${res.status}`); fail++; continue; }
      const buf = Buffer.from(await res.arrayBuffer());
      const contentType = res.headers.get('content-type') || 'image/jpeg';
      
      const asset = await client.assets.upload('image', buf, {
        filename: artist.avatar.split('/').pop(),
        contentType,
      });
      console.log(`  Uploaded asset: ${asset._id}`);

      await client.patch(artist._id)
        .set({
          avatar: { _type: 'image', asset: { _type: 'reference', _ref: asset._id } },
          avatarLegacy: artist.avatar,
        })
        .commit();
      console.log(`  Patched: ${artist.name} ✓`);
      ok++;
    } catch (err) {
      console.error(`  ERROR ${artist.name}:`, err.message);
      fail++;
    }
  }
  console.log(`\nDone: ${ok} migrated, ${skip} skipped, ${fail} failed`);
}

migrate();
