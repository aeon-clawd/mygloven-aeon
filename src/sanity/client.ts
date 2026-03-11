import { createClient } from '@sanity/client';

export const sanityClient = createClient({
  projectId: '81mezrx9',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
});
