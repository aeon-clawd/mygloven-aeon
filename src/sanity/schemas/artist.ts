import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'artist',
  title: 'Artista',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Nombre', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'name' }, validation: (r) => r.required() }),
    defineField({ name: 'description', title: 'Biografía', type: 'text', rows: 6 }),
    defineField({ name: 'email', title: 'Email', type: 'string' }),
    defineField({ name: 'telephone', title: 'Teléfono', type: 'string' }),
    defineField({ name: 'avatar', title: 'Foto Principal URL', type: 'url' }),
    defineField({
      name: 'images',
      title: 'Galería',
      type: 'array',
      of: [{ type: 'object', fields: [defineField({ name: 'url', title: 'URL', type: 'url' })] }],
    }),
    defineField({
      name: 'links',
      title: 'Plataformas',
      type: 'object',
      fields: [
        defineField({ name: 'spotify', title: 'Spotify', type: 'url' }),
        defineField({ name: 'youtube', title: 'YouTube', type: 'url' }),
        defineField({ name: 'soundcloud', title: 'SoundCloud', type: 'url' }),
        defineField({ name: 'instagram', title: 'Instagram', type: 'url' }),
        defineField({ name: 'ra', title: 'Resident Advisor', type: 'url' }),
        defineField({ name: 'web', title: 'Web', type: 'url' }),
      ],
    }),
    defineField({ name: 'sourceUrl', title: 'URL Original', type: 'url' }),
  ],
  preview: {
    select: { title: 'name' },
  },
});
