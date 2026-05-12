import { supabase } from "./supabase";
import type { Artista, Venue, VenueAnnex, VenueImage } from "./types";

const VENUE_COLUMNS = `
  id, nombre, slug, descripcion, descripcion_corta,
  ciudad, pais, barrio, direccion, mostrar_direccion,
  tipo, subtipo, exterior, rider, licencia_musica, equipo_sonido,
  precio_desde, precio_hasta, unidad_precio,
  images, logo_url, tags, telefono, email, web, instagram,
  verificado, estado, horario_general, geo, coordenadas
`;

const ARTISTA_COLUMNS = `
  id, nombre, slug, bio, descripcion_corta, genero_musical,
  instagram, spotify, soundcloud, youtube, web, linktree, rrss,
  telefono, email, tags, verificado, rider, avatar_url, images, estado
`;

function sortImages<T extends { order?: number }>(images: T[] | null | undefined): T[] {
  if (!images || images.length === 0) return [];
  return [...images].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

function normalizeVenue(row: any): Venue {
  return {
    ...row,
    images: sortImages<VenueImage>(row.images),
  };
}

function normalizeArtista(row: any): Artista {
  return {
    ...row,
    images: sortImages(row.images),
  };
}

export async function getAllVenues(): Promise<Venue[]> {
  const { data, error } = await supabase
    .from("venues")
    .select(VENUE_COLUMNS)
    .eq("estado", "activo")
    .not("slug", "is", null)
    .order("nombre", { ascending: true });

  if (error) throw new Error(`getAllVenues: ${error.message}`);
  return (data || []).map(normalizeVenue);
}

export async function getVenueBySlug(slug: string): Promise<Venue | null> {
  const { data, error } = await supabase
    .from("venues")
    .select(VENUE_COLUMNS)
    .eq("slug", slug)
    .eq("estado", "activo")
    .maybeSingle();

  if (error) throw new Error(`getVenueBySlug: ${error.message}`);
  if (!data) return null;

  const venue = normalizeVenue(data);

  const { data: annexes } = await supabase
    .from("venue_annexes")
    .select(
      "id, venue_id, nombre, config_de_pie, config_sentado, metros_cuadrados, tipo_espacio, tipos_evento, images, precio_desde, precio_hasta, unidad_precio, orden",
    )
    .eq("venue_id", venue.id)
    .order("orden", { ascending: true });

  if (annexes) {
    venue.annexes = annexes.map((a: any) => ({
      ...a,
      images: sortImages<VenueImage>(a.images),
    })) as VenueAnnex[];
  }

  return venue;
}

export async function getAllArtistas(): Promise<Artista[]> {
  const { data, error } = await supabase
    .from("artistas")
    .select(ARTISTA_COLUMNS)
    .eq("estado", "activo")
    .not("slug", "is", null)
    .order("nombre", { ascending: true });

  if (error) throw new Error(`getAllArtistas: ${error.message}`);
  return (data || []).map(normalizeArtista);
}

export async function getArtistaBySlug(slug: string): Promise<Artista | null> {
  const { data, error } = await supabase
    .from("artistas")
    .select(ARTISTA_COLUMNS)
    .eq("slug", slug)
    .eq("estado", "activo")
    .maybeSingle();

  if (error) throw new Error(`getArtistaBySlug: ${error.message}`);
  return data ? normalizeArtista(data) : null;
}

/* ──────── helpers ──────── */

export function getVenueCoverUrl(venue: Venue): string | null {
  if (!venue.images || venue.images.length === 0) return null;
  const principal = venue.images.find((i) => i.tag === "principal");
  return (principal ?? venue.images[0]).url;
}

export function getArtistaCoverUrl(a: Artista): string | null {
  if (a.avatar_url) return a.avatar_url;
  if (!a.images || a.images.length === 0) return null;
  const principal = a.images.find((i) => i.tag === "principal");
  return (principal ?? a.images[0]).url;
}

export function venueCapacityLabel(venue: Venue): string | null {
  if (!venue.annexes || venue.annexes.length === 0) return null;
  let max = 0;
  for (const annex of venue.annexes) {
    const cap = Math.max(annex.config_de_pie ?? 0, annex.config_sentado ?? 0);
    if (cap > max) max = cap;
  }
  return max > 0 ? `${max} PAX` : null;
}

export function venueTagLabel(venue: Venue): string {
  if (venue.exterior) return "OPEN AIR";
  if (venue.tipo === "rooftop") return "ROOFTOP";
  if (venue.tipo === "restaurante") return "RESTAURANT";
  if (venue.tipo === "hotel") return "HOTEL";
  if (venue.tipo === "aire_libre") return "OPEN AIR";
  if (venue.tipo === "local_privado") return "PRIVATE";
  return "VENUE";
}

export function artistaDisciplineLabel(a: Artista): string {
  return a.genero_musical || a.descripcion_corta || "Artista";
}

export function pad(n: number, width = 3): string {
  return String(n).padStart(width, "0");
}
