import { sanityClient } from './client';

export async function getAllVenues() {
  return sanityClient.fetch(`*[_type == "venue"] | order(name asc) {
    _id, name, "slug": slug.current, description, city, country, address,
    telephone, email, website, logo, images, geo, sourceUrl
  }`);
}

export async function getVenueBySlug(slug: string) {
  return sanityClient.fetch(`*[_type == "venue" && slug.current == $slug][0] {
    _id, name, "slug": slug.current, description, city, country, address,
    telephone, email, website, logo, images, geo, sourceUrl
  }`, { slug });
}

export async function getAllArtists() {
  return sanityClient.fetch(`*[_type == "artist"] | order(name asc) {
    _id, name, "slug": slug.current, description, email, telephone,
    avatar, images, links, sourceUrl
  }`);
}

export async function getArtistBySlug(slug: string) {
  return sanityClient.fetch(`*[_type == "artist" && slug.current == $slug][0] {
    _id, name, "slug": slug.current, description, email, telephone,
    avatar, images, links, sourceUrl
  }`, { slug });
}

export async function getSiteConfig() {
  return sanityClient.fetch(`*[_type == "siteConfig"][0]`);
}
