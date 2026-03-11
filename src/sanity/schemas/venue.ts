import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'venue',
  title: 'Venue',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Nombre', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'name' }, validation: (r) => r.required() }),
    defineField({ name: 'description', title: 'Descripción', type: 'text', rows: 6 }),
    defineField({ name: 'city', title: 'Ciudad', type: 'string' }),
    defineField({ name: 'country', title: 'País', type: 'string' }),
    defineField({ name: 'address', title: 'Dirección', type: 'string' }),
    defineField({ name: 'telephone', title: 'Teléfono', type: 'string' }),
    defineField({ name: 'email', title: 'Email', type: 'string' }),
    defineField({ name: 'website', title: 'Web', type: 'url' }),
    defineField({ name: 'logo', title: 'Logo URL', type: 'url' }),
    defineField({
      name: 'images',
      title: 'Imágenes',
      type: 'array',
      of: [{ type: 'object', fields: [defineField({ name: 'url', title: 'URL', type: 'url' })] }],
    }),
    defineField({
      name: 'geo',
      title: 'Coordenadas',
      type: 'object',
      fields: [
        defineField({ name: 'lat', title: 'Latitud', type: 'number' }),
        defineField({ name: 'lng', title: 'Longitud', type: 'number' }),
      ],
    }),
    defineField({ name: 'sourceUrl', title: 'URL Original', type: 'url' }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'city' },
  },
});
