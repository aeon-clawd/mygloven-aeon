import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import venue from './src/sanity/schemas/venue';
import artist from './src/sanity/schemas/artist';
import siteConfig from './src/sanity/schemas/siteConfig';

export default defineConfig({
  name: 'mygloven',
  title: 'MyGloven',
  projectId: '81mezrx9',
  dataset: 'production',
  plugins: [structureTool()],
  schema: { types: [venue, artist, siteConfig] },
});
