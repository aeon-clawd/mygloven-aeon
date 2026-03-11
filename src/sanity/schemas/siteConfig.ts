import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'siteConfig',
  title: 'Configuración del Sitio',
  type: 'document',
  fields: [
    defineField({ name: 'heroTitle', title: 'Título Hero', type: 'string' }),
    defineField({ name: 'heroSubtitle', title: 'Subtítulo Hero', type: 'text', rows: 2 }),
    defineField({ name: 'heroHashtag', title: 'Hashtag', type: 'string' }),
    defineField({ name: 'heroBackground', title: 'URL Imagen Hero', type: 'url' }),
    defineField({ name: 'contactEmail', title: 'Email Contacto', type: 'string' }),
    defineField({
      name: 'features',
      title: 'Features (¿Por qué confiar?)',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          defineField({ name: 'title', title: 'Título', type: 'string' }),
          defineField({ name: 'description', title: 'Descripción', type: 'text', rows: 2 }),
        ],
      }],
    }),
    defineField({ name: 'aboutText', title: 'Texto About', type: 'text', rows: 4 }),
    defineField({ name: 'aboutSecondary', title: 'Texto About secundario', type: 'text', rows: 4 }),
    defineField({ name: 'primaveraProYear', title: 'Año Primavera Pro', type: 'string' }),
    defineField({ name: 'primaveraProSubtitle', title: 'Subtítulo Primavera Pro', type: 'string' }),
    defineField({ name: 'primaveraProDate', title: 'Fecha Primavera Pro', type: 'string' }),
    defineField({ name: 'ctaTitle', title: 'Título CTA', type: 'string' }),
    defineField({ name: 'ctaSubtitle', title: 'Subtítulo CTA', type: 'text', rows: 2 }),
  ],
  preview: {
    prepare: () => ({ title: 'Configuración del Sitio' }),
  },
});
