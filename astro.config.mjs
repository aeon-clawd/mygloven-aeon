import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import sanity from '@sanity/astro';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://mygloven.com',
  output: 'static',
  adapter: vercel(),
  integrations: [
    sanity({
      projectId: '81mezrx9',
      dataset: 'production',
      useCdn: true,
      apiVersion: '2024-01-01',
      studioBasePath: '/studio',
    }),
    react(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
